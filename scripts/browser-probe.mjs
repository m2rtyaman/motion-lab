/**
 * BROWSER PROBE - ground truth for what a composition really shows.
 *
 * The other audits read source or run buildTimeline() against a FAKE DOM in Node. A model can satisfy all of them while the real page shows
 * nothing: the animated target is never rendered (`{false && <div className="hero"/>}`), is display:none, is the same colour as its
 * background, the Scene throws at runtime, or the Scene sniffs `typeof window` and builds a different timeline in the browser.
 * This probe renders the composition in headless Chrome (Remotion bundle + Chrome DevTools Protocol, no new dependencies) and inspects
 * the REAL DOM at sampled frames.
 *
 *   node scripts/browser-probe.mjs --project <slug>          probe src/projects/<slug>
 *   node scripts/browser-probe.mjs --dir <projectDir>        probe any folder holding spec.json + Scene.tsx (e.g. evals/solutions/<id>)
 *   options: --json  machine-readable result on stdout     --samples N  frame budget (default 180)     --keep  keep out/probe/<id> for debugging
 *            --watch-text <selector>  (repeatable) also record that element's text at evenly spaced frames (meta.textSeries, used by the textChanges behavior check)
 *   Browser: REMOTION_BROWSER_EXECUTABLE, else Remotion's downloaded chrome-headless-shell, else a local Chrome/Edge.
 *
 * How it works (about 15-40 s per project, see meta.timingMs):
 *   1. `probe-node-trace.mjs` (npx tsx) builds the timeline in Node and reports its CLAIMS: tween count, target selectors, motion windows.
 *   2. A throw-away Remotion entry registers ONLY this Scene (no registry edit), Tailwind CSS is compiled for it, @remotion/bundler bundles it.
 *   3. Chrome is launched with --remote-debugging-port and driven over CDP (Node 22 built-in WebSocket). Frames are selected exactly like
 *      renderStill does: window.remotion_setBundleMode + window.remotion_setFrame, then wait for window.remotion_renderReady.
 *   4. At each sampled frame the real DOM is measured (scripts/lib/probe-page.inject.js) and compared with the claims.
 *
 * Findings (same JSON shape as the other audits: { ok, errors, warnings, findings:[{code,severity,frame,target,message}], meta }):
 *   P001 error    a timeline target is never visible during the frames it is animated (missing, display:none, opacity 0, off screen, covered)
 *   P002 error    the target's real box/opacity/rotation does not change across a window where the Node timeline claims motion
 *   P003 error    the page threw / the bundle failed / the render never became ready
 *   P004 warning  focal target (or closing text) contrast < 3:1 against what is behind it; error below 1.5:1 (effectively invisible)
 *   P005 info     text that is on screen AND painted at every sample of the final hold (every 6f): meta.finalHold.strings
 *   P009 error    text on screen in only some samples of the final hold (appears late / flickers / vanishes)
 *   P006 error    the browser timeline differs from the Node timeline (tween counts, selectors never animated, elements animated that Node never saw)
 *   P007 warning  visible text under 18px or clipped by the viewport
 *   P008 error    the focal element of the LAST beat (the closing message) was visible earlier but is missing at some sample of the final hold
 *   Every visible text of the hold and every animated target is paint-checked with pixels (hide-and-diff), after overlays, blend modes, clip-paths and filters.
 *   The measuring helpers run in an isolated JS world and the entry file adds no global (no window.__gsap/__probe), the composition id is the slug: the Scene
 *   cannot tell the probe from the render. meta.browserInfo records the browser executable, product and version; only Chrome / Edge / chrome-headless-shell run.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import crypto from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { PNG } from "pngjs";
import { rootDir, projectsDir, ASPECT_DIMS } from "./lib/projects.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const RED = "\x1b[31m", GREEN = "\x1b[32m", YELLOW = "\x1b[33m", BOLD = "\x1b[1m", RESET = "\x1b[0m";

/** Thresholds (documented in the finding messages). */
export const PROBE = {
  MIN_VISIBLE_FRAC: 0.1,        // a target counts as visible when >= 10% of its box is on screen, uncovered and not clipped
  CONTRAST_WARN: 3, CONTRAST_ERR: 1.5,
  MIN_FONT_PX: 18,
  BG_AREA_FRAC: 0.55,           // targets covering more of the viewport than this are backgrounds: no contrast check
  MOTION_OBSERVED_FRAC: 0.25,   // browser must show >= 25% of the claimed change
  TWEEN_COUNT_RATIO: 2, TWEEN_COUNT_MIN_DIFF: 3,
  HOLD_STEP: 6,                 // the final hold is sampled (and paint-checked) every 6 frames
  DEFAULT_SAMPLES: 180,
  WINDOW_VIS_FRAC: 0.8,         // P001: a target must be visible in >= 80% of the samples inside each of its motion windows
  WINDOW_TRIM: 0.2,             // ... ignoring the first and last 20% of a window (fade-in / slide-out ramps)
  MIN_SPAN_FRAMES: 8,           // windows shorter than this are only checked as a whole
  PAINT_DIFF: 4, PAINT_MIN_PX: 3, // hide-and-diff: a pixel changes when a channel moves by > 4; >= 3 such pixels = "paints something"
  MAX_PIX_FRAMES: 24, MAX_INTERIOR_PAINT_FRAMES: 16,
};
/** Only these engines render like the final render: file names, and what Browser.getVersion reports. */
export const BROWSER_NAME_OK = /^(chrome|google-chrome(-stable|-beta|-unstable)?|msedge|microsoft-edge(-stable|-beta|-dev)?|chrome-headless-shell)(\.exe)?$/i;
export const BROWSER_PRODUCT_OK = /^(Headless)?Chrome\/|^Edg\//;

/* ---------------------------------------------------------------- helpers */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const round = (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d;
const lum = (r, g, b) => {
  const f = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (l1, l2) => (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
const posix = (p) => p.replaceAll("\\", "/");

function findBrowser() {
  const env = process.env.REMOTION_BROWSER_EXECUTABLE;
  if (env && fs.existsSync(env)) return { exe: env, shell: /headless-shell/i.test(env) };
  const base = path.join(rootDir, "node_modules", ".remotion", "chrome-headless-shell");
  const exeName = process.platform === "win32" ? "chrome-headless-shell.exe" : "chrome-headless-shell";
  const walk = (d, depth) => {
    if (depth > 4 || !fs.existsSync(d)) return null;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isFile() && e.name === exeName) return p;
      if (e.isDirectory()) { const r = walk(p, depth + 1); if (r) return r; }
    }
    return null;
  };
  const shell = walk(base, 0);
  if (shell) return { exe: shell, shell: true };
  const candidates = process.platform === "win32"
    ? [process.env["PROGRAMFILES"] + "\\Google\\Chrome\\Application\\chrome.exe", process.env["PROGRAMFILES(X86)"] + "\\Google\\Chrome\\Application\\chrome.exe", process.env.LOCALAPPDATA + "\\Google\\Chrome\\Application\\chrome.exe", process.env["PROGRAMFILES(X86)"] + "\\Microsoft\\Edge\\Application\\msedge.exe", process.env["PROGRAMFILES"] + "\\Microsoft\\Edge\\Application\\msedge.exe"]
    : process.platform === "darwin"
      ? ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"]
      : ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/microsoft-edge"];
  for (const c of candidates) if (c && fs.existsSync(c)) return { exe: c, shell: false };
  return null;
}

/* ---------------------------------------------------------------- Chrome DevTools Protocol client */

class Cdp {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.pending = new Map(); this.listeners = [];
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(typeof ev.data === "string" ? ev.data : Buffer.from(ev.data).toString());
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(`${msg.error.message}`)) : resolve(msg.result);
      } else if (msg.method) for (const l of this.listeners) l(msg);
    });
    ws.addEventListener("close", () => { for (const { reject } of this.pending.values()) reject(new Error("browser connection closed")); this.pending.clear(); });
  }
  static connect(url) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      ws.addEventListener("open", () => resolve(new Cdp(ws)));
      ws.addEventListener("error", () => reject(new Error(`cannot connect to ${url}`)));
    });
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`browser did not answer ${method} within 40 s`)); }, 40000);
      this.pending.set(id, { resolve: (v) => { clearTimeout(timer); resolve(v); }, reject: (e) => { clearTimeout(timer); reject(e); } });
      this.ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }
  on(fn) { this.listeners.push(fn); }
  close() { try { this.ws.close(); } catch { /* ignore */ } }
}

/* ---------------------------------------------------------------- static server for the bundle */

function serve(bundleDir) {
  const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".map": "application/json" };
  const server = http.createServer((req, res) => {
    try {
      let url = decodeURIComponent(new URL(req.url, "http://x").pathname);
      if (url === "/") url = "/index.html";
      const roots = url.startsWith("/public/") ? [path.join(rootDir, "public"), bundleDir] : [bundleDir];
      const rel = url.startsWith("/public/") ? url.slice("/public/".length) : url.slice(1);
      for (const r of roots) {
        const file = path.join(r, rel);
        if (!file.startsWith(r) || !fs.existsSync(file) || !fs.statSync(file).isFile()) continue;
        res.writeHead(200, { "content-type": types[path.extname(file).toLowerCase()] ?? "application/octet-stream" });
        fs.createReadStream(file).pipe(res);
        return;
      }
      res.writeHead(404); res.end("not found");
    } catch { res.writeHead(500); res.end("error"); }
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port })));
}

/* ---------------------------------------------------------------- Tailwind (the studio compiles src/output.css with the CLI; do it in-process for the probe's folder) */

async function buildCss(projectDir, outFile) {
  const { compile } = await import("@tailwindcss/node");
  const { Scanner } = await import("@tailwindcss/oxide");
  const base = path.join(rootDir, "src");
  const css = fs.readFileSync(path.join(base, "index.css"), "utf-8");
  const compiled = await compile(css, { base, onDependency() {} });
  const sources = [projectDir, path.join(rootDir, "src", "core"), path.join(rootDir, "src", "primitives"), path.join(rootDir, "src", "templates")]
    .filter((d) => fs.existsSync(d)).map((d) => ({ base: d, pattern: "**/*", negated: false }));
  const candidates = new Scanner({ sources }).scan();
  const out = compiled.build(candidates).replaceAll("../public/", "/public/");
  fs.writeFileSync(outFile, out);
}

/** WebGL scenes (three.js, canvas 3D) need software GL; everything else rasterises 10-40x faster with --disable-gpu. */
function needsGl(dir) {
  try {
    return fs.readdirSync(dir, { recursive: true }).some((f) => /\.(tsx?|jsx?)$/.test(String(f)) && /three|webgl|getContext\(/i.test(fs.readFileSync(path.join(dir, String(f)), "utf-8")));
  } catch { return false; }
}

/* ---------------------------------------------------------------- Node-side claims */

function nodeTrace(dir) {
  const helper = path.join(HERE, "lib", "probe-node-trace.mjs");
  return new Promise((resolve) => {
    const child = spawn("npx", ["tsx", helper, "--dir", dir], { cwd: rootDir, shell: true });
    let out = "", err = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("close", () => {
      const line = out.trim().split(/\r?\n/).filter((l) => l.startsWith("{")).pop();
      try { resolve(JSON.parse(line)); } catch { resolve({ ok: false, error: `node trace produced no result: ${(err || out).slice(0, 300)}` }); }
    });
  });
}

/* ---------------------------------------------------------------- the probe */

/**
 * The motion windows of one target: [{ a, b, prop, exit }], longest first, at most 6. A window is an EXIT when the timeline itself claims the target ends invisible
 * (opacity < 0.15, scale < 0.1, or it is claimed hidden right after the window): exits and ripples may legitimately be covered by what replaces them.
 */
function motionSpans(node, sel) {
  const p = node.perSelector[sel];
  const hidden = p.hiddenRanges ?? [];
  const endsHidden = (b) => hidden.some(([x]) => x >= b - 2 && x <= b + 6);
  const spans = [];
  const push = (a, b, prop, exit) => {
    const dup = spans.find((s) => Math.abs(s.a - a) <= 3 && Math.abs(s.b - b) <= 3);
    if (dup) { dup.exit = dup.exit || exit; return; }
    spans.push({ a, b, prop, exit });
  };
  for (const w of node.windows ?? []) if (w.sel === sel) push(w.from, w.to, w.prop, (w.prop === "opacity" && w.v1 < 0.15) || (w.prop === "scale" && w.v1 < 0.1) || endsHidden(w.to));
  if (!spans.length && p.animatedFrom !== null) push(p.animatedFrom, p.animatedTo, "any", endsHidden(p.animatedTo));
  return spans.sort((x, y) => y.b - y.a - (x.b - x.a)).slice(0, 6);
}

export async function probe({ dir, slug, samplesBudget = PROBE.DEFAULT_SAMPLES, keep = false, log = () => {}, watchText = [] }) {
  const t0 = Date.now();
  const timing = {};
  const mark = (k, since) => { timing[k] = Date.now() - since; };
  const findings = [];
  const add = (code, severity, frame, target, message) => findings.push({ code, severity, frame, target: target ?? null, message });
  const meta = { slug, dir: posix(path.relative(rootDir, dir) || dir), timingMs: timing };
  const done = () => {
    timing.total = Date.now() - t0;
    const errors = findings.filter((f) => f.severity === "error").length;
    return { tool: "browser-probe", ok: errors === 0, errors, warnings: findings.filter((f) => f.severity === "warning").length, findings, meta };
  };

  let spec;
  try { spec = JSON.parse(fs.readFileSync(path.join(dir, "spec.json"), "utf-8").replace(/^﻿/, "")); }
  catch (e) { add("P003", "error", 0, null, `cannot read spec.json (${e.message}) -> every project needs spec.json with aspect, fps and durationInSeconds`); return done(); }
  if (!fs.existsSync(path.join(dir, "Scene.tsx"))) { add("P003", "error", 0, null, "Scene.tsx not found -> create Scene.tsx exporting Scene and buildTimeline"); return done(); }
  const fps = Number(spec.fps) || 60;
  const total = Math.round((Number(spec.durationInSeconds) || 0) * fps);
  const [width, height] = ASPECT_DIMS[spec.aspect] ?? [1920, 1080];
  const beats = Array.isArray(spec.beats) ? spec.beats : [];
  Object.assign(meta, { fps, totalFrames: total, viewport: { width, height } });
  /** the composition id is the slug, exactly as in the real Root.tsx: the Scene cannot tell the probe by `useVideoConfig().id` */
  const compId = String(slug).replace(/[^a-zA-Z0-9-]/g, "-").replace(/^-+/, "") || "composition";

  const id = crypto.createHash("sha1").update(dir).digest("hex").slice(0, 10);
  const work = path.join(rootDir, "out", "probe", id);
  fs.mkdirSync(path.join(work, "public"), { recursive: true });
  let browserProc, cdp, httpServer, profile;
  const cleanup = async () => {
    try { cdp?.close(); } catch { /* ignore */ }
    try { browserProc?.kill(); } catch { /* ignore */ }
    try { httpServer?.close(); } catch { /* ignore */ }
    for (const d of keep ? [profile] : [profile, work]) {
      if (!d) continue;
      for (let i = 0; i < 20; i++) {
        try { fs.rmSync(d, { recursive: true, force: true }); break; } catch { await sleep(250); }
      }
    }
  };

  try {
    /* 1+2: Node claims (async) while bundling */
    let s = Date.now();
    const found = findBrowser();
    if (!found) throw new Error("no browser found: set REMOTION_BROWSER_EXECUTABLE=<chrome/edge path> or run `npx remotion browser ensure`");
    if (!BROWSER_NAME_OK.test(path.basename(found.exe))) throw new Error(`browser executable "${found.exe}" is refused: the probe only runs Chrome, Edge or chrome-headless-shell (another engine renders differently from the final render)`);
    const tracePromise = nodeTrace(dir);
    await buildCss(dir, path.join(work, "probe.css"));
    const entry = path.join(work, "entry.tsx");
    // same shape as src/remotion/Root.tsx: a <Composition id=slug component=Scene defaultProps={{aspect}}>, and NO window property of its own (no window.__gsap, no window.__probe)
    fs.writeFileSync(entry, `import React from "react";
import { registerRoot, Composition } from "remotion";
import * as SceneModule from "${posix(path.join(dir, "Scene"))}";
import gsap from "gsap";
import "./probe.css";
// GSAP's own window.gsap only exists once a tween has woken the ticker, so hand the instance to the probe through a script-scope (let) binding that the probe declares: it is NOT a property of window / globalThis, nothing enumerates it
declare let __mlGsap: any;
__mlGsap = gsap;
const Scene: any = (SceneModule as any).Scene ?? (SceneModule as any).default;
const Root = () => <Composition id="${compId}" component={Scene} durationInFrames={${total}} fps={${fps}} width={${width}} height={${height}} defaultProps={{ aspect: ${JSON.stringify(spec.aspect ?? "16:9")} }} />;
registerRoot(Root);
`);
    const { bundle } = await import("@remotion/bundler");
    const origLog = console.log;
    console.log = (...a) => console.error(...a);
    let bundleDir;
    try {
      bundleDir = await bundle({ entryPoint: entry, outDir: path.join(work, "bundle"), publicDir: path.join(work, "public"), enableCaching: true, rspack: true });
    } finally { console.log = origLog; }
    mark("bundleMs", s);

    /* 3: Chrome */
    s = Date.now();
    const { server, port: httpPort } = await serve(bundleDir);
    httpServer = server;
    profile = fs.mkdtempSync(path.join(os.tmpdir(), "motionlab-probe-"));
    const args = [`--remote-debugging-port=0`, `--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check", "--disable-extensions", "--hide-scrollbars", "--mute-audio",
      "--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows", "--force-color-profile=srgb", "--font-render-hinting=none",
      ...(process.env.PROBE_GL || needsGl(dir) ? ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--disable-vulkan"] : ["--disable-gpu"]), ...(found.shell ? [] : ["--headless=new"]), "about:blank"];
    browserProc = spawn(found.exe, args, { stdio: "ignore", windowsHide: true });
    process.once("exit", () => { try { browserProc.kill(); } catch { /* ignore */ } });
    const portFile = path.join(profile, "DevToolsActivePort");
    let wsUrl = null;
    for (let i = 0; i < 200 && !wsUrl; i++) {
      if (fs.existsSync(portFile)) {
        const [p, wsPath] = fs.readFileSync(portFile, "utf-8").trim().split(/\r?\n/);
        if (p && wsPath) wsUrl = `ws://127.0.0.1:${p}${wsPath}`;
      }
      if (!wsUrl) await sleep(50);
    }
    if (!wsUrl) throw new Error("browser did not expose a DevTools port within 10 s");
    cdp = await Cdp.connect(wsUrl);
    // record what really ran, and refuse anything that is not Chrome / Edge / chrome-headless-shell
    const ver = await cdp.send("Browser.getVersion");
    meta.browserInfo = { executable: found.exe, product: ver.product ?? null, version: String(ver.product ?? "").split("/")[1] ?? null, revision: ver.revision ?? null, userAgent: ver.userAgent ?? null, headlessShell: found.shell };
    if (!BROWSER_PRODUCT_OK.test(String(ver.product ?? ""))) throw new Error(`browser "${found.exe}" reports itself as "${ver.product}": only Chrome, Edge or chrome-headless-shell are accepted`);
    const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
    const send = (m, p) => cdp.send(m, p, sessionId);
    const runtimeErrors = [];
    cdp.on((msg) => {
      if (msg.sessionId !== sessionId) return;
      const p = msg.params;
      if (msg.method === "Runtime.exceptionThrown") runtimeErrors.push(p.exceptionDetails.exception?.description ?? p.exceptionDetails.text ?? "exception");
      else if (msg.method === "Runtime.consoleAPICalled" && p.type === "error") {
        const text = p.args.map((a) => a.value ?? a.description ?? "").join(" ");
        if (!/Failed to load resource/i.test(text)) runtimeErrors.push(`console.error: ${text}`);
      } else if (msg.method === "Log.entryAdded" && p.entry.level === "error" && !/Failed to load resource|favicon/i.test(p.entry.text)) runtimeErrors.push(`log: ${p.entry.text}`);
    });
    await send("Page.enable"); await send("Runtime.enable"); await send("Log.enable");
    await send("Emulation.setFocusEmulationEnabled", { enabled: true }).catch(() => {});
    await send("Page.bringToFront").catch(() => {});
    await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
    await send("Page.addScriptToEvaluateOnNewDocument", {
      source: `let __mlGsap = null;
window.remotion_puppeteerTimeout = 30000; window.remotion_isMainTab = true; window.remotion_mediaCacheSizeInBytes = 100000000; window.remotion_initialMemoryAvailable = 1000000000; window.remotion_sampleRate = 48000;
window.process = window.process || {}; window.process.env = window.process.env || {}; window.process.env.NODE_ENV = 'production';
window.remotion_broadcastChannel = new BroadcastChannel("remotion-video-frame-extraction");
window.remotion_inputProps = ${JSON.stringify(JSON.stringify({}))}; window.remotion_initialFrame = 0; window.remotion_attempt = 1; window.remotion_proxyPort = 0; window.remotion_audioEnabled = false; window.remotion_videoEnabled = true; window.remotion_logLevel = 'error';
window.alert = (m) => { window.remotion_cancelledError = new Error('alert(' + m + ') was called').stack; }; window.confirm = () => false;`,
    });
    const evaluateIn = async (expression, timeout = 30000, contextId) => {
      const r = await Promise.race([
        send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true, ...(contextId ? { contextId } : {}) }),
        sleep(timeout).then(() => { throw new Error(`browser evaluation timed out after ${timeout} ms`); }),
      ]);
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
      return r.result.value;
    };
    /** main world: the page's own JS context (Remotion, the Scene, GSAP) */
    const evaluate = async (expression, timeout = 30000) => {
      const tE = Date.now();
      try { return await evaluateIn(expression, timeout); }
      finally { if (process.env.PROBE_DEBUG && Date.now() - tE > 700) console.error(`[probe] slow evaluate ${Date.now() - tE}ms: ${expression.slice(0, 90)}`); }
    };
    let isoCtx = null;
    /** isolated world: shares the DOM, has its own globals; the probe's helpers live only here, so the Scene can never see them */
    const iso = (expression, timeout = 30000) => evaluateIn(expression, timeout, isoCtx);
    await send("Page.navigate", { url: `http://127.0.0.1:${httpPort}/index.html` });
    const ready = await evaluate(`new Promise((res) => { const t0 = Date.now(); const tick = () => { if (typeof window.remotion_setBundleMode === 'function') res(true); else if (Date.now() - t0 > 30000) res(false); else setTimeout(tick, 50); }; tick(); })`, 35000);
    if (!ready) throw new Error("the Remotion page did not load (bundle error?)");
    await evaluate(`window.remotion_setBundleMode({ type: 'composition', compositionName: '${compId}', serializedResolvedPropsWithSchema: '{}', compositionDurationInFrames: ${total}, compositionFps: ${fps}, compositionHeight: ${height}, compositionWidth: ${width}, compositionDefaultCodec: 'h264', compositionDefaultOutName: null, compositionDefaultVideoImageFormat: null, compositionDefaultPixelFormat: null, compositionDefaultProResProfile: null, compositionDefaultSampleRate: 48000 }); true`);
    const seek = (frame) => evaluate(`(async () => {
      window.remotion_setFrame(${frame}, '${compId}', 1);
      const t0 = Date.now();
      for (;;) {
        if (window.remotion_cancelledError !== undefined) return { error: String(window.remotion_cancelledError).slice(0, 600) };
        if (window.remotion_renderReady === true) break;
        if (Date.now() - t0 > 15000) return { error: 'timeout: the composition never became ready at frame ${frame} (delayRender never released, or the Scene crashed)' };
        await new Promise((r) => setTimeout(r, 4));
      }
      await document.fonts.ready;
      return { ok: true };
    })()`, 20000);
    const first = await seek(0);
    const pageErrorFrame = (frame, message) => { add("P003", "error", frame, null, `${message} -> a Scene that throws or never becomes ready renders nothing. Fix the runtime error first (open the studio: pnpm studio:preview), keep render code pure and free of browser/Node branching`); };
    const flushRuntimeErrors = (frame) => {
      for (const e of [...new Set(runtimeErrors.splice(0))].slice(0, 4)) pageErrorFrame(frame, `page error at render: ${e.split("\n")[0].slice(0, 300)}`);
    };
    mark("browserStartMs", s);
    if (first.error) {
      await sleep(100);
      pageErrorFrame(0, `render failed at frame 0: ${first.error.split("\n")[0]}`);
      flushRuntimeErrors(0);
      meta.renderable = false;
      return done();
    }
    // the isolated world with the measuring helpers (invisible to the Scene)
    const { frameTree } = await send("Page.getFrameTree");
    const world = await send("Page.createIsolatedWorld", { frameId: frameTree.frame.id, worldName: "motionlab-probe", grantUniveralAccess: true });
    isoCtx = world.executionContextId;
    await iso(fs.readFileSync(path.join(HERE, "lib", "probe-page.inject.js"), "utf-8"));
    const timelinesSrc = fs.readFileSync(path.join(HERE, "lib", "probe-timelines.inject.js"), "utf-8");

    /* 1 result */
    const node = await tracePromise;
    meta.node = node.ok ? { tweenCount: node.tweenCount, selectors: node.selectors, perSelector: node.perSelector, windows: node.windows.length, holdStart: node.holdStart, holdEnd: node.holdEnd } : { error: node.error };
    if (!node.ok) log(`node trace failed: ${node.error}`);
    const targetSel = node.ok ? Object.keys(node.perSelector) : [];
    const lastBeat = beats[beats.length - 1];
    const focalSpec = [...new Set(beats.map((b) => b.board?.focal).filter((f) => typeof f === "string" && f.trim()))];
    const selectors = [...new Set([...targetSel, ...focalSpec])];

    /* frame plan */
    s = Date.now();
    const clampF = (f) => Math.max(0, Math.min(total - 1, Math.round(f)));
    const holdStart = clampF(node.ok && node.holdStart !== null ? node.holdStart : total - Math.ceil(1.2 * fps));
    const holdFrames = [];
    for (let f = holdStart; f < total; f += PROBE.HOLD_STEP) holdFrames.push(f);
    if (holdFrames[holdFrames.length - 1] !== total - 1) holdFrames.push(total - 1);
    // windows to verify (P002): biggest claims first, spread over the clip
    const claims = (node.ok ? node.windows : []).filter((w) => w.to - w.from >= 2).sort((a, b) => Math.abs(b.delta) / ({ x: 20, y: 20, scale: 0.05, opacity: 0.3, rotation: 5 }[b.prop]) - Math.abs(a.delta) / ({ x: 20, y: 20, scale: 0.05, opacity: 0.3, rotation: 5 }[a.prop]));
    const perKey = new Map();
    const checkWindows = [];
    for (const w of claims) {
      const k = `${w.sel}|${w.prop}`;
      const n = perKey.get(k) ?? 0;
      if (n >= 4) continue;
      perKey.set(k, n + 1);
      checkWindows.push(w);
      if (checkWindows.length >= 28) break;
    }
    // P001 spans per target (merged motion windows) and their interior sample points
    const spansOf = new Map(targetSel.map((sel) => [sel, node.ok ? motionSpans(node, sel) : []]));
    const interiorFrames = new Set();
    for (const [, spans] of spansOf)
      for (const { a, b } of spans) {
        const L = b - a;
        if (L < PROBE.MIN_SPAN_FRAMES) continue;
        for (const q of [0.25, 0.5, 0.75]) interiorFrames.add(clampF(a + L * q));
      }
    const essential = new Set([0, clampF(total - 1), ...holdFrames]);
    for (const b of beats) { essential.add(clampF(b.startFrame)); essential.add(clampF(b.endFrame)); }
    for (const w of checkWindows) { essential.add(clampF(w.from)); essential.add(clampF(w.to)); }
    const extras = new Set();
    for (const b of beats) { extras.add(clampF((b.startFrame + b.endFrame) / 2)); extras.add(clampF(b.startFrame + (b.endFrame - b.startFrame) * 0.25)); extras.add(clampF(b.startFrame + (b.endFrame - b.startFrame) * 0.75)); }
    for (const w of checkWindows) extras.add(clampF((w.from + w.to) / 2));
    for (const [, p] of Object.entries(node.ok ? node.perSelector : {})) if (p.animatedFrom !== null) { extras.add(clampF(p.animatedFrom - 2)); extras.add(clampF(p.animatedFrom + 2)); extras.add(clampF((p.animatedFrom + p.animatedTo) / 2)); extras.add(clampF(p.animatedTo)); }
    for (let f = 0; f < total; f += Math.max(15, Math.round(total / 24))) extras.add(f); // coarse sweep so selectors without claims are still seen
    const holdSet = new Set(holdFrames);
    let frames = [...new Set([...essential, ...interiorFrames, ...extras])].sort((a, b) => a - b);
    if (frames.length > samplesBudget) {
      const keepSet = new Set([...essential, ...[...interiorFrames].slice(0, 90)]);
      const optional = frames.filter((f) => !keepSet.has(f));
      const room = Math.max(0, samplesBudget - keepSet.size);
      const step = optional.length / Math.max(1, room);
      const chosen = new Set(Array.from({ length: Math.min(room, optional.length) }, (_, i) => optional[Math.floor(i * step)]));
      frames = frames.filter((f) => keepSet.has(f) || chosen.has(f));
    }
    meta.samples = frames.length;
    meta.holdStart = holdStart;

    /* sample (DOM) */
    const snap = new Map();       // frame -> { sels: {sel:{count,m[]}}, texts? }
    let renderBroken = null;
    let tSeek = 0, tDom = 0, tText = 0;
    for (const f of frames) {
      let q = Date.now();
      const r = await seek(f);
      tSeek += Date.now() - q; q = Date.now();
      if (r.error) { renderBroken = { frame: f, error: r.error }; break; }
      const sels = await iso(`__probe.sample(${JSON.stringify(selectors)})`);
      tDom += Date.now() - q; q = Date.now();
      const entry = { sels };
      // the hold frames get their texts in the paint pass below (with pixels); other key frames here
      if (!holdSet.has(f) && (beats.some((b) => clampF(b.endFrame) === f || clampF(b.startFrame) === f) || f === 0)) entry.texts = await iso("__probe.texts()");
      tText += Date.now() - q;
      snap.set(f, entry);
    }
    Object.assign(timing, { seekMs: tSeek, domMs: tDom, textMs: tText });
    flushRuntimeErrors(renderBroken?.frame ?? 0);
    if (renderBroken) {
      pageErrorFrame(renderBroken.frame, `render failed at frame ${renderBroken.frame}: ${renderBroken.error.split("\n")[0]}`);
      meta.renderable = false;
    }
    mark("sampleMs", s);
    if (snap.size === 0) return done();
    const sampled = [...snap.keys()].sort((a, b) => a - b);

    /* browser timeline summary (after the last seek so every child exists); evaluated in the page's own world as a throw-away expression */
    const tlInfo = await evaluate(`(${timelinesSrc})(${JSON.stringify(targetSel)})`);
    meta.browser = tlInfo.ok
      ? { tweenCount: tlInfo.tweenCount, elementTweens: tlInfo.elementTweens, totalDuration: round(tlInfo.totalDuration, 3), masters: tlInfo.masters, selectorHits: tlInfo.selectorHits, orphans: tlInfo.orphans }
      : { error: tlInfo.reason };

    /* ---- pixel helpers: screenshots, hide-and-diff (what does this really paint?) ---- */
    let shots = 0, shotMs = 0;
    const shot = async (clip, scale = 1) => {
      const q = Date.now();
      shots++;
      const params = { format: "png", clip: { x: clip[0], y: clip[1], width: clip[2], height: clip[3], scale }, captureBeyondViewport: false };
      let r;
      try { r = await send("Page.captureScreenshot", params); } catch { await send("Page.bringToFront").catch(() => {}); r = await send("Page.captureScreenshot", params); }
      const png = PNG.sync.read(Buffer.from(r.data, "base64"));
      shotMs += Date.now() - q;
      return png;
    };
    const FULL = [0, 0, width, height];
    /** pixels inside `rect` (CSS px) that differ between two same-size screenshots: { painted, px, contrast } (contrast of the strongest 10% of the changed pixels) */
    const regionDiff = (A, B, rect) => {
      if (!rect) return { painted: false, px: 0, contrast: 1, empty: true };
      const sx = A.width / width, sy = A.height / height;
      const x0 = Math.max(0, Math.floor(rect[0] * sx)), y0 = Math.max(0, Math.floor(rect[1] * sy));
      const x1 = Math.min(A.width, Math.ceil((rect[0] + rect[2]) * sx)), y1 = Math.min(A.height, Math.ceil((rect[1] + rect[3]) * sy));
      const diffs = [];
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
        const o = (y * A.width + x) * 4;
        const d = Math.max(Math.abs(A.data[o] - B.data[o]), Math.abs(A.data[o + 1] - B.data[o + 1]), Math.abs(A.data[o + 2] - B.data[o + 2]));
        if (d > PROBE.PAINT_DIFF) diffs.push({ la: lum(A.data[o], A.data[o + 1], A.data[o + 2]), lb: lum(B.data[o], B.data[o + 1], B.data[o + 2]) });
      }
      if (diffs.length < PROBE.PAINT_MIN_PX) return { painted: false, px: diffs.length, contrast: 1 };
      diffs.sort((p, q) => Math.abs(q.la - q.lb) - Math.abs(p.la - p.lb));
      const core = diffs.slice(0, Math.max(6, Math.ceil(diffs.length * 0.1)));
      const med = (arr) => arr.sort((p, q) => p - q)[Math.floor(arr.length / 2)];
      return { painted: true, px: diffs.length, contrast: ratio(med(core.map((d) => d.la)), med(core.map((d) => d.lb))) };
    };
    /**
     * The paint pass at one frame: every visible text (wantTexts) and every listed selector is checked by what it REALLY paints: one screenshot with everything,
     * then one per group of non-nested items with that group hidden (text: glyph fill transparent; element: opacity 0); the pixels that differ are what it paints,
     * after overlays, blend modes, clip-paths, filters, SVG fill rules and colour-on-colour. Returns { texts: [{...text entry, painted, paintContrast, px}], sels: {sel: {painted, contrast, px, skipped}} }.
     */
    const paintPass = async (f, { wantTexts, sels: wantSels }) => {
      await seek(f);
      const textEntries = wantTexts ? await iso("__probe.texts()") : [];
      const items = [...textEntries.map((t) => ({ k: "t", i: t.i })), ...wantSels.map((sel) => ({ k: "s", sel }))];
      const out = { texts: textEntries.map((t) => ({ ...t })), sels: {} };
      if (!items.length) return out;
      const pl = await iso(`__probe.plan(${JSON.stringify(items)})`);
      const A = await shot(FULL, 0.5);
      const res = new Array(items.length).fill(null);
      for (const g of pl.groups) {
        await iso(`__probe.hideItems(${JSON.stringify(g)}, true)`);
        const B = await shot(FULL, 0.5);
        await iso(`__probe.hideItems(${JSON.stringify(g)}, false)`);
        for (const idx of g) res[idx] = regionDiff(A, B, pl.rects[idx]);
      }
      items.forEach((it, idx) => {
        const r = res[idx] ?? { painted: false, px: 0, contrast: 1, empty: true };
        if (it.k === "t") Object.assign(out.texts[it.i], { painted: r.painted, px: r.px, paintContrast: round(r.contrast, 2) });
        else out.sels[it.sel] = pl.bgSized[idx] > PROBE.BG_AREA_FRAC ? { skipped: "background-sized", painted: true, px: r.px, contrast: round(r.contrast, 2) } : { painted: r.painted, px: r.px, contrast: round(r.contrast, 2), empty: Boolean(r.empty) };
      });
      return out;
    };
    /** Seeks to frame f, screenshots the selector's box with and without it (opacity 0) and returns the pixels that differ (focal contrast step). */
    const hideDiff = async (sel, f) => {
      await seek(f);
      const un = await iso(`__probe.union(${JSON.stringify(sel)})`);
      if (!un) return { empty: true };
      const [l, t] = un, r = un[0] + un[2], b = un[1] + un[3];
      if (((r - l) * (b - t)) / (width * height) > PROBE.BG_AREA_FRAC) return { skipped: "background-sized" };
      const clip = [Math.max(0, Math.floor(l) - 2), Math.max(0, Math.floor(t) - 2), 0, 0];
      clip[2] = Math.min(width - clip[0], Math.ceil(r - l) + 4); clip[3] = Math.min(height - clip[1], Math.ceil(b - t) + 4);
      if (clip[2] < 2 || clip[3] < 2) return { empty: true };
      const sc = clip[2] * clip[3] > 400000 ? 0.5 : 1;
      const A = await shot(clip, sc);
      await iso(`__probe.hide(${JSON.stringify(sel)}, true)`);
      const B = await shot(clip, sc);
      await iso(`__probe.hide(${JSON.stringify(sel)}, false)`);
      const n = Math.min(A.data.length, B.data.length) / 4;
      const diffs = [];
      for (let i = 0; i < n; i++) {
        const o = i * 4;
        const d = Math.max(Math.abs(A.data[o] - B.data[o]), Math.abs(A.data[o + 1] - B.data[o + 1]), Math.abs(A.data[o + 2] - B.data[o + 2]));
        if (d > 4) diffs.push({ la: lum(A.data[o], A.data[o + 1], A.data[o + 2]), lb: lum(B.data[o], B.data[o + 1], B.data[o + 2]) });
      }
      return { frame: f, diffs };
    };

    /* ---- which frames get a paint pass: the hold (texts + targets), frames where visibility hinges on pixels (covered, blend), and a spread of window interiors ---- */
    s = Date.now();
    const paint = new Map();      // frame -> { texts: [...], sels: {...} }
    const needPix = new Set();
    for (const f of sampled) for (const sel of targetSel) if ((snap.get(f).sels[sel]?.m ?? []).some((m) => !m.vis && m.pix)) needPix.add(f);
    const capEven = (arr, n) => (arr.length <= n ? arr : Array.from({ length: n }, (_, i) => arr[Math.floor((i * arr.length) / n)]));
    const interiorOf = (a, b) => { const L = b - a; return L >= PROBE.MIN_SPAN_FRAMES ? [a + L * PROBE.WINDOW_TRIM, b - L * PROBE.WINDOW_TRIM] : [a, b]; };
    const interiorSampled = [...new Set([...spansOf.values()].flatMap((spans) => spans.filter((sp) => !sp.exit).flatMap(({ a, b }) => { const [x, y] = interiorOf(a, b); return sampled.filter((f) => f >= x && f <= y); })))].sort((a, b) => a - b);
    const paintFrames = [...new Set([...holdFrames.filter((f) => snap.has(f)), ...capEven([...needPix].sort((a, b) => a - b), PROBE.MAX_PIX_FRAMES), ...capEven(interiorSampled, PROBE.MAX_INTERIOR_PAINT_FRAMES)])].sort((a, b) => a - b);
    for (const f of paintFrames) {
      const present = targetSel.filter((sel) => (snap.get(f).sels[sel]?.count ?? 0) > 0);
      paint.set(f, await paintPass(f, { wantTexts: holdSet.has(f), sels: present }));
    }
    meta.paintPass = { frames: paintFrames.length, holdFrames: holdFrames.length };
    mark("paintMs", s);

    /* ---- P001 visibility per target ---- */
    // targets that are backgrounds (cover > 55% of the viewport) and targets nested inside another animated target (parts of a rig)
    const bgSized = new Set(targetSel.filter((sel) => sampled.some((f) => (snap.get(f).sels[sel]?.m ?? []).some((m) => (m.rect[2] * m.rect[3]) / (width * height) > PROBE.BG_AREA_FRAC))));
    const nesting = targetSel.length ? await iso(`__probe.nesting(${JSON.stringify(targetSel)})`) : {};
    meta.nesting = Object.fromEntries(Object.entries(nesting).filter(([, v]) => v.length));
    const frameIn = (a, b) => sampled.filter((f) => f >= a && f <= b);
    const pixOk = (sel, f) => { const r = paint.get(f)?.sels[sel]; return Boolean(r) && (r.skipped || (r.painted && r.px >= 12)); };
    const visAt = (sel, f) => (snap.get(f)?.sels[sel]?.m ?? []).some((m) => m.vis || (m.pix && pixOk(sel, f)));
    const countAt = (sel, f) => snap.get(f)?.sels[sel]?.count ?? 0;
    meta.targets = {};
    const p001Done = new Set();
    const p001Pending = [];
    if (process.env.PROBE_DEBUG_SEL) for (const fr of sampled) console.error(`[probe] f${fr} ${process.env.PROBE_DEBUG_SEL}: ${JSON.stringify(snap.get(fr).sels[process.env.PROBE_DEBUG_SEL])}`);
    for (const sel of targetSel) {
      const p = node.perSelector[sel];
      const wins = [];
      if (p.animatedFrom !== null) wins.push([p.animatedFrom, p.animatedTo]);
      for (const w of node.windows) if (w.sel === sel) wins.push([w.from, w.to]);
      const [wa, wb] = wins.length ? [Math.min(...wins.map((w) => w[0])), Math.max(...wins.map((w) => w[1]))] : [0, total - 1];
      const inWin = frameIn(Math.max(0, wa - 3), Math.min(total - 1, wb + 1)); // a sample just before the window counts: an exit tween starts on something already visible
      const useFrames = inWin.length ? inWin : sampled;
      const everCount = Math.max(0, ...sampled.map((f) => countAt(sel, f)));
      const visFrames = sampled.filter((f) => visAt(sel, f));
      const visInWin = useFrames.filter((f) => visAt(sel, f));
      // every motion window: the target must be on screen (in the viewport, unclipped, unoccluded, painted) in >= 80% of the samples inside it (its first and last 20% may be
      // fade/slide ramps; samples where the timeline itself claims it invisible are not demanded; exits, backgrounds and parts nested in another animated target
      // - a far arm behind the body - may be occluded)
      const windowVis = [];
      const hiddenAt = (f) => (p.hiddenRanges ?? []).some(([x, y]) => f >= x && f <= y);
      const nested = (nesting[sel] ?? []).length > 0;
      const occludedOnly = (f) => (snap.get(f)?.sels[sel]?.m ?? []).length > 0 && snap.get(f).sels[sel].m.every((m) => m.vis || /covered/.test(m.reason ?? ""));
      for (const { a, b, exit } of spansOf.get(sel) ?? []) {
        const [x, y] = interiorOf(a, b);
        const fr = sampled.filter((f) => f >= x && f <= y && !hiddenAt(f));
        if (fr.length < 2) continue;
        const v = fr.filter((f) => visAt(sel, f) || (nested && occludedOnly(f))).length;
        windowVis.push({ from: a, to: b, samples: fr.length, visible: v, frac: round(v / fr.length, 2), exit, skipped: exit || bgSized.has(sel) });
      }
      const beatVis = {};
      for (const b of beats) {
        const fr = sampled.filter((f) => f >= b.startFrame && f < b.endFrame);
        if (fr.length) { const claimed = fr.filter((f) => !hiddenAt(f)); beatVis[b.id] = { samples: fr.length, visible: fr.filter((f) => visAt(sel, f)).length, claimed: claimed.length, visibleClaimed: claimed.filter((f) => visAt(sel, f)).length }; }
      }
      const info = { tweens: p.tweens, animatedFrames: p.animatedFrom === null ? null : [p.animatedFrom, p.animatedTo], domMatches: everCount, visibleSamples: visFrames.length, samples: sampled.length, visibleDuringAnimation: visInWin.length > 0 || p.timed === 0, windowVis, beatVis };
      meta.targets[sel] = info;
      if (p.timed === 0) continue; // only tl.set calls: nothing animates, nothing to demand
      if (visInWin.length === 0) {
        p001Done.add(sel);
        const reasons = [...new Set(useFrames.flatMap((f) => (snap.get(f)?.sels[sel]?.m ?? []).map((m) => m.reason).filter(Boolean)))].slice(0, 3);
        const why = everCount === 0
          ? `the selector matches NO element in the real DOM at any of ${sampled.length} sampled frames (conditionally rendered away, wrong class, or never mounted)`
          : `${everCount} element(s) exist but none is ever visible while it is animated (f${wa}-f${wb}): ${reasons.join("; ") || "not visible"}`;
        p001Pending.push({ sel, frame: useFrames[0] ?? wa, useFrames, covered: everCount > 0 && reasons.some((r) => /covered/.test(r)) && !reasons.some((r) => /display|opacity|zero-size|visibility|outside/.test(r)), message: `timeline target "${sel}": ${why}. The tween runs on nothing the viewer can see -> principle: motion only counts if it is on screen; fix: render the element unconditionally with a static className="${(sel.match(/[.#]([\w-]+)/) ?? [])[1] ?? "name"}", remove display:none/opacity 0/off-screen placement and anything painted over it` });
      } else {
        const bad = windowVis.filter((w) => !w.skipped && w.frac < PROBE.WINDOW_VIS_FRAC);
        if (bad.length) {
          const w = bad[0];
          const reasons = [...new Set(frameIn(w.from, w.to).flatMap((f) => (snap.get(f)?.sels[sel]?.m ?? []).map((m) => m.reason).filter(Boolean)))].slice(0, 3);
          add("P001", "error", w.from, sel, `timeline target "${sel}" is on screen in only ${w.visible}/${w.samples} sampled frames (${Math.round(w.frac * 100)}%) of its motion window f${w.from}-f${w.to} (needs >= ${Math.round(PROBE.WINDOW_VIS_FRAC * 100)}%${reasons.length ? `; ${reasons.join("; ")}` : ""}) -> principle: motion only counts while the viewer can see the thing moving; fix: keep the element inside the frame, unclipped by an overflow ancestor, not covered, not blended away, for the whole move`);
          p001Done.add(sel);
          info.visibleDuringAnimation = false;
        }
      }
    }

    // "covered" can be a false alarm for a limb half behind the body: confirm with pixels before failing
    for (const pend of p001Pending) {
      let cleared = false;
      if (pend.covered) {
        const picks = [...new Set([0, 0.33, 0.66, 1].map((q) => pend.useFrames[Math.floor(q * (pend.useFrames.length - 1))]))].filter((x) => x !== undefined);
        for (const f of picks) {
          const hd = await hideDiff(pend.sel, f);
          if (hd.diffs && hd.diffs.length >= 12) { cleared = true; meta.targets[pend.sel].visibleByPixels = f; break; }
        }
      }
      if (cleared) { p001Done.delete(pend.sel); meta.targets[pend.sel].visibleDuringAnimation = true; }
      else add("P001", "error", pend.frame, pend.sel, pend.message);
    }

    /* ---- P008 the closing focal element must be on screen at EVERY sample of the hold (visible earlier, gone in it) ---- */
    const holdFirst = holdFrames[0], holdLast = total - 1;
    const holdSampled = holdFrames.filter((f) => snap.has(f));
    const lastFocal = lastBeat?.board?.focal;
    for (const sel of selectors) {
      if (p001Done.has(sel)) continue;
      const before = sampled.filter((f) => f < holdFirst && visAt(sel, f));
      if (!before.length || !holdSampled.length) continue;
      const missing = holdSampled.filter((f) => !visAt(sel, f));
      if (!missing.length) continue; // on screen at every hold sample
      const isClosing = lastFocal && sel === lastFocal;
      if (!isClosing) continue; // a deliberate exit of a non-closing element is fine
      const reasons = [...new Set(missing.flatMap((f) => (snap.get(f)?.sels[sel]?.m ?? []).map((m) => m.reason).filter(Boolean)))].slice(0, 2);
      add("P008", "error", missing[0], sel, `"${sel}" was visible at f${before[before.length - 1]} but is not visible at ${missing.length}/${holdSampled.length} samples of the final hold (f${holdFirst}-f${holdLast}${reasons.length ? `; ${reasons.join("; ")}` : ""}), and it is the focal element of the last beat (the closing message) -> principle: the closing message must stay on screen and still for >= 1.2s; fix: remove the tl.set/exit that hides it, or keep it visible through the whole hold`);
    }

    /* ---- P002 claimed motion vs real motion ---- */
    const centre = (m) => [m.rect[0] + m.rect[2] / 2, m.rect[1] + m.rect[3] / 2];
    const sizeOf = (m) => Math.sqrt(Math.max(1e-6, m.rect[2] * m.rect[3]));
    const bySelProp = new Map();
    for (const w of checkWindows) {
      if (p001Done.has(w.sel)) continue;
      const a = snap.get(clampF(w.from))?.sels[w.sel], b = snap.get(clampF(w.to))?.sels[w.sel];
      if (!a || !b || !a.m.length || !b.m.length) continue;
      let observed = 0;
      const n = Math.min(a.m.length, b.m.length);
      for (let i = 0; i < n; i++) {
        const A = a.m[i], B = b.m[i];
        let d = 0;
        if (w.prop === "x") d = Math.abs(centre(B)[0] - centre(A)[0]);
        else if (w.prop === "y") d = Math.abs(centre(B)[1] - centre(A)[1]);
        else if (w.prop === "scale") d = Math.abs(sizeOf(B) / sizeOf(A) - 1) * Math.abs(w.v0 || 1);
        else if (w.prop === "opacity") d = Math.abs(B.op - A.op);
        else if (w.prop === "rotation") { d = Math.abs(B.ang - A.ang); if (d > 180) d = 360 - d; }
        observed = Math.max(observed, d);
      }
      // a scale claim v0 -> v1 means the box changes by |v1/v0 - 1| relative; compare in the same unit
      const claimed = w.prop === "scale" ? Math.abs((w.v1 || 1) / (w.v0 || 1) - 1) * Math.abs(w.v0 || 1) : Math.abs(w.delta);
      const ok = observed >= PROBE.MOTION_OBSERVED_FRAC * claimed;
      (meta.motionDetail ??= []).push({ target: w.sel, prop: w.prop, from: w.from, to: w.to, claimed: round(claimed), observed: round(observed), ok });
      const k = `${w.sel}|${w.prop}`;
      const rec = bySelProp.get(k) ?? { checked: 0, failed: [] };
      rec.checked++;
      if (!ok) rec.failed.push({ w, observed, claimed });
      bySelProp.set(k, rec);
    }
    meta.motionChecks = [...bySelProp].map(([k, r]) => ({ key: k, checked: r.checked, failed: r.failed.length }));
    for (const [, r] of bySelProp) {
      if (!r.failed.length || r.failed.length * 2 < r.checked) continue;
      const { w, observed, claimed } = r.failed[0];
      const unit = { x: "px", y: "px", scale: "x scale", opacity: " opacity", rotation: "deg" }[w.prop];
      add("P002", "error", w.from, w.sel, `the timeline claims "${w.sel}" ${w.prop} moves ${round(w.v0)} -> ${round(w.v1)} over f${w.from}-f${w.to} (${round(claimed)}${unit}) but in the real page it changed only ${round(observed)}${unit} (${r.failed.length}/${r.checked} checked windows) -> principle: a tween only counts when the viewer sees the change; fix: make sure the animated element is the one you can see (same className on the visible element), not hidden, not a wrapper with fixed size, and that Scene builds the same timeline in browser and Node`);
    }

    /* ---- P006 Node timeline vs browser ---- */
    if (node.ok && tlInfo.ok) {
      const nT = node.tweenCount, bT = tlInfo.tweenCount;
      if (bT === 0 && nT > 0) add("P006", "error", 0, null, `Node builds ${nT} tweens but the browser timeline has none -> the page animates nothing (or builds its timeline conditionally: env sniffing such as typeof window); fix: build the timeline identically everywhere, one buildTimeline(tl) passed to useRemotionGSAP`);
      else if (nT > 0 && (bT > PROBE.TWEEN_COUNT_RATIO * nT || nT > PROBE.TWEEN_COUNT_RATIO * bT) && Math.abs(nT - bT) >= PROBE.TWEEN_COUNT_MIN_DIFF)
        add("P006", "error", 0, null, `Node builds ${nT} tweens but the browser builds ${bT}: the two environments run different code -> principle: the scorer audits the Node timeline, the viewer sees the browser one, they must be the same; fix: remove typeof window/document/navigator and other environment branches from Scene.tsx and buildTimeline`);
      if (bT > 0) {
        for (const sel of targetSel) {
          const hits = tlInfo.selectorHits[sel] ?? 0;
          const everCount = meta.targets[sel]?.domMatches ?? 0;
          if (hits === 0 && everCount > 0 && node.perSelector[sel].timed > 0)
            add("P006", "error", node.perSelector[sel].animatedFrom ?? 0, sel, `Node claims ${node.perSelector[sel].tweens} tween(s) on "${sel}" but no tween of the browser timeline touches an element matching it (the element exists, it just never moves) -> the Node and browser timelines differ; fix: remove environment-dependent branching so the same tweens target the same selectors`);
        }
        const orphanTweens = tlInfo.leaves.filter((l) => l.orphans > 0 && l.sels.length === 0 && l.dur > 0);
        if (orphanTweens.length && (orphanTweens.length >= 2 || orphanTweens.length / bT >= 0.3)) {
          const names = [...new Set(tlInfo.orphans.map((o) => o.target))].slice(0, 5).join(", ");
          add("P006", "error", Math.round(orphanTweens[0].start * fps), names, `the browser timeline animates ${orphanTweens.length} tween(s) on elements (${names}) that the Node timeline never targets -> the audited timeline is not the one the viewer sees; fix: one buildTimeline for both environments, no env sniffing`);
        }
      }
    }

    /* ---- pixel contrast of focal targets (hide-and-diff), and "paints nothing" for every animated target (paint pass) ---- */
    s = Date.now();
    const focalSet = new Set(focalSpec);
    for (const w of node.ok ? node.windows : []) if (Math.abs(w.delta) >= (w.prop === "x" || w.prop === "y" ? 20 : 1e9)) focalSet.add(w.sel);
    const contrastResults = {};
    for (const sel of focalSet) {
      if (p001Done.has(sel) || !selectors.includes(sel)) continue;
      const visibleSamples = sampled.filter((f) => visAt(sel, f));
      if (!visibleSamples.length) continue;
      const pickFrames = [...new Set([visibleSamples[Math.floor(visibleSamples.length / 2)], visibleSamples[visibleSamples.length - 1], visibleSamples[0]])].slice(0, 3);
      // prefer frames where it is solidly opaque
      pickFrames.sort((a, b) => Math.min(...(snap.get(b).sels[sel].m.filter((m) => m.vis).map((m) => m.op))) - Math.min(...(snap.get(a).sels[sel].m.filter((m) => m.vis).map((m) => m.op))));
      let best = null;
      for (const f of pickFrames) {
        const hd = await hideDiff(sel, f);
        if (hd.skipped) { contrastResults[sel] = { skipped: hd.skipped }; break; }
        if (hd.empty) continue;
        const diffs = hd.diffs;
        if (diffs.length < 6) { best = best ?? { ratio: 1, frame: f, painted: false }; continue; }
        diffs.sort((p, q) => Math.abs(q.la - q.lb) - Math.abs(p.la - p.lb));
        const core = diffs.slice(0, Math.max(6, Math.ceil(diffs.length * 0.1)));
        const med = (arr) => arr.sort((p, q) => p - q)[Math.floor(arr.length / 2)];
        const rr = ratio(med(core.map((d) => d.la)), med(core.map((d) => d.lb)));
        if (!best || rr > best.ratio || best.painted === false) best = { ratio: rr, frame: f, painted: true, paintedPx: diffs.length };
      }
      if (best) contrastResults[sel] = { ratio: round(best.ratio, 2), frame: best.frame, painted: best.painted };
    }
    meta.contrast = contrastResults;
    for (const [sel, c] of Object.entries(contrastResults)) {
      if (c.skipped) continue;
      if (c.painted === false) {
        add("P004", "error", c.frame, sel, `"${sel}" is DOM-visible but paints nothing: hiding it changes no pixel at f${c.frame} (fully transparent, same colour as what is behind it, or covered) -> principle: a focal element must read against its background; fix: give it a colour that contrasts with the background (>= 3:1)`);
      } else if (c.ratio < PROBE.CONTRAST_WARN) {
        add("P004", c.ratio < PROBE.CONTRAST_ERR ? "error" : "warning", c.frame, sel, `focal element "${sel}" has contrast ${c.ratio}:1 against what is behind it at f${c.frame} (needs >= ${PROBE.CONTRAST_WARN}:1, below ${PROBE.CONTRAST_ERR}:1 it is effectively invisible) -> principle: the eye follows luminance contrast, not hue; fix: change its fill/colour or the background so the WCAG ratio is >= ${PROBE.CONTRAST_WARN}:1 (use theme colours from src/core/theme-contract.ts)`);
      }
    }
    // every other animated target: DOM-visible at the paint-checked frames of its motion windows but painting nothing there
    meta.paintedTargets = {};
    for (const sel of targetSel) {
      if (p001Done.has(sel) || contrastResults[sel] || node.perSelector[sel].timed === 0) continue;
      const rows = paintFrames.map((f) => ({ f, r: paint.get(f)?.sels[sel], vis: (snap.get(f)?.sels[sel]?.m ?? []).some((m) => m.vis) })).filter((x) => x.r && x.vis && !x.r.skipped && !x.r.empty);
      if (!rows.length) continue;
      const blank = rows.filter((x) => !x.r.painted);
      meta.paintedTargets[sel] = { checked: rows.length, unpainted: blank.length };
      if (blank.length >= 2 && blank.length / rows.length >= 0.6)
        add("P004", "error", blank[0].f, sel, `"${sel}" is DOM-visible but paints nothing at ${blank.length}/${rows.length} paint-checked frames (hiding it changes no pixel, e.g. f${blank[0].f}): fully transparent, filter/clip-path/blend hides it, same colour as what is behind it, or covered -> principle: an animated target must really paint; fix: remove the property that blanks it and give it a visible colour`);
    }
    mark("contrastMs", s);
    Object.assign(timing, { shots, shotMs });

    /* ---- final hold text (P005): each string must be on screen AND painted at EVERY sample of the hold (every 6 frames) ---- */
    const holdPaint = holdSampled.map((f) => ({ f, texts: paint.get(f)?.texts ?? [] }));
    const okText = (t) => t.painted && t.paintContrast >= PROBE.CONTRAST_ERR;
    const perFrame = holdPaint.map((row) => new Set(row.texts.filter(okText).map((t) => t.text)));
    const inter = perFrame.length ? [...perFrame[0]].filter((x) => perFrame.every((st) => st.has(x))) : [];
    const union = [...new Set(perFrame.flatMap((st) => [...st]))];
    const partial = union.filter((x) => !inter.includes(x));
    const lastRow = holdPaint[holdPaint.length - 1];
    const finalTexts = (lastRow?.texts ?? []).map((t) => {
      const per = holdPaint.map((row) => row.texts.filter((x) => x.text === t.text && x.painted).map((x) => x.paintContrast)).filter((a) => a.length).map((a) => Math.max(...a));
      const contrast = per.length ? round(per.sort((p, q) => p - q)[Math.floor(per.length / 2)], 2) : (t.painted ? t.paintContrast : null);
      return { text: t.text, element: t.tag, fontSize: t.fontSize, contrast, painted: Boolean(t.painted), rect: t.rect, clippedByViewport: t.clippedByViewport, opacity: t.op, inEveryHoldSample: inter.includes(t.text) };
    });
    meta.finalHold = { startFrame: holdFirst, endFrame: holdLast, frames: holdFrames, samples: holdPaint.length, texts: finalTexts, strings: inter, partialStrings: partial, unpaintedStrings: [...new Set((lastRow?.texts ?? []).filter((t) => !okText(t)).map((t) => t.text))].filter((x) => !union.includes(x)) };
    if (inter.length)
      add("P005", "info", holdFirst, null, `text on screen and painted at every one of ${holdPaint.length} hold samples (f${holdFirst}-f${holdLast}, every ${PROBE.HOLD_STEP}f): ${inter.map((x) => `"${x}"`).join(" | ").slice(0, 600)}`);
    if (partial.length)
      add("P009", "error", holdFirst, null, `text that is on screen in only some samples of the final hold (it appears late, flickers or vanishes): ${partial.map((x) => `"${x}"`).join(" | ").slice(0, 400)} -> principle: the closing message must be fully on screen and still for the whole hold (>= 1.2s), not only on the last frame; fix: finish the entrance before hold:start and remove any tl.set/visibility change inside the hold`);
    for (const t of finalTexts) {
      if (t.painted && t.contrast !== null && t.contrast < PROBE.CONTRAST_WARN)
        add("P004", t.contrast < PROBE.CONTRAST_ERR ? "error" : "warning", holdFirst, t.element, `closing text "${t.text.slice(0, 50)}" has contrast ${t.contrast}:1 in the final hold (measured from the pixels, after overlays; needs >= ${PROBE.CONTRAST_WARN}:1) -> principle: the last message is the one to be read; fix: use a text colour with >= 3:1 (ideally 7:1) against its background`);
      else if (!t.painted)
        add("P004", "error", holdFirst, t.element, `closing text "${t.text.slice(0, 50)}" is in the DOM but paints no pixel in the final hold (hiding its glyphs changes nothing: same colour as the background, transparent, clipped or covered) -> principle: the last message must be readable; fix: give it a colour that contrasts with the background`);
    }
    // P007 over every sampled text, grouped: one finding per kind with examples
    const small = new Map(), cut = new Map();
    const allTexts = [...sampled.map((f) => [f, snap.get(f).texts ?? []]), ...holdPaint.map((row) => [row.f, row.texts])];
    for (const [f, list] of allTexts) for (const t of list) {
      if (t.fontSize < PROBE.MIN_FONT_PX) { if (!small.has(t.text)) small.set(t.text, { f, size: t.fontSize, tag: t.tag }); }
      else if (t.clippedByViewport && !cut.has(t.text)) cut.set(t.text, { f, rect: t.rect, tag: t.tag });
    }
    const eg = (m, n = 4) => [...m.keys()].slice(0, n).map((x) => `"${x.slice(0, 40)}"`).join(", ") + (m.size > n ? `, +${m.size - n} more` : "");
    if (small.size) { const first = [...small.values()][0]; add("P007", "warning", first.f, first.tag, `${small.size} visible text(s) render under ${PROBE.MIN_FONT_PX}px (${[...new Set([...small.values()].map((v) => v.size))].join("/")}px): ${eg(small)} -> principle: video text must read on a phone at a glance; fix: use >= 18px (captions 40px+, headlines 80px+)`); }
    if (cut.size) { const first = [...cut.values()][0]; add("P007", "warning", first.f, first.tag, `${cut.size} visible text(s) are cut off by the viewport (e.g. box ${first.rect.map(Math.round).join(",")} at f${first.f}): ${eg(cut)} -> principle: keep copy inside the safe area; fix: shorten the line, reduce the font size, or move it inside the frame`); }

    /* ---- text series for behavior checks (e.g. a counter): the text of a selector at evenly spaced frames ---- */
    if (watchText.length) {
      s = Date.now();
      meta.textSeries = {};
      const stride = Math.max(2, Math.ceil(total / 150));
      for (const entry of watchText) {
        let sel = entry;
        // "text=<url-encoded text>": the element that shows this text at the last frame (the model's class names are its own choice)
        if (/^text=/.test(entry)) {
          await seek(total - 1);
          sel = await iso(`__probe.findByText(${JSON.stringify(decodeURIComponent(entry.slice(5)))})`);
          if (!sel) { meta.textSeries[entry] = []; continue; }
        }
        const series = [];
        for (let f = 0; f < total; f += stride) {
          const r = await seek(f);
          if (r.error) break;
          const t = await iso(`__probe.readText(${JSON.stringify(sel)})`);
          series.push([f, t.text, t.vis]);
        }
        const r = await seek(total - 1);
        if (!r.error) { const t = await iso(`__probe.readText(${JSON.stringify(sel)})`); series.push([total - 1, t.text, t.vis]); }
        meta.textSeries[entry] = series;
      }
      mark("textSeriesMs", s);
    }
    meta.consoleErrors = [...new Set(runtimeErrors)].slice(0, 10);
    flushRuntimeErrors(total - 1);
    return done();
  } catch (e) {
    add("P003", "error", 0, null, `probe could not render the composition: ${String(e?.message ?? e).split("\n").slice(0, 3).join(" | ").slice(0, 500)} -> a project that does not bundle or render in a browser cannot be scored; fix the build/runtime error first`);
    meta.renderable = false;
    return done();
  } finally {
    await cleanup();
  }
}

/* ---------------------------------------------------------------- CLI */

function printHuman(res) {
  const slug = res.meta.slug;
  for (const f of res.findings) {
    const color = f.severity === "error" ? RED : f.severity === "warning" ? YELLOW : GREEN;
    console.log(`${color}[${f.code}${f.severity === "error" ? "" : ` ${f.severity}`}]${RESET} ${slug} f${f.frame ?? 0}${f.target ? ` ${f.target}` : ""}: ${f.message}`);
  }
  const head = res.ok ? `${GREEN}${BOLD}PASS${RESET}` : `${RED}${BOLD}FAIL${RESET}`;
  console.log(`${head} browser-probe ${slug}: ${res.errors} error(s), ${res.warnings} warning(s), ${res.meta.samples ?? 0} frames sampled in ${(res.meta.timingMs.total / 1000).toFixed(1)}s`);
}

const isMain = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  const argv = process.argv.slice(2);
  const arg = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
  const json = argv.includes("--json");
  const project = arg("--project"), dirArg = arg("--dir");
  if (!project && !dirArg) {
    console.error("usage: node scripts/browser-probe.mjs --project <slug> | --dir <projectDir> [--json] [--samples N] [--keep]");
    process.exit(2);
  }
  const dir = dirArg ? path.resolve(process.cwd(), dirArg) : path.join(projectsDir, project);
  const slug = project ?? path.basename(dir);
  const samples = Number(arg("--samples")) || PROBE.DEFAULT_SAMPLES;
  const watchText = argv.flatMap((a, i) => (a === "--watch-text" && argv[i + 1] ? [argv[i + 1]] : []));
  const res = await probe({ dir, slug, samplesBudget: samples, keep: argv.includes("--keep"), log: (m) => !json && console.error(m), watchText });
  if (json) process.stdout.write(`${JSON.stringify(res, null, 2)}\n`);
  else printHuman(res);
  process.exit(res.ok ? 0 : 1);
}
