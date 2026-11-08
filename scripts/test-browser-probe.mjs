/**
 * Proves scripts/browser-probe.mjs: the honest fixture passes, every cheat fixture trips the expected code.
 * Run: node scripts/test-browser-probe.mjs      (renders each fixture in headless Chrome; ~1 min, 3 at a time)
 * Needs a browser: REMOTION_BROWSER_EXECUTABLE or Remotion's downloaded chrome-headless-shell.
 */
import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { spawn } from "node:child_process";
import { rootDir } from "./lib/projects.mjs";

const FIXTURES = path.join("scripts", "fixtures", "browser-probe");
const CONCURRENCY = 3;

function probe(name) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ["scripts/browser-probe.mjs", "--dir", path.join(FIXTURES, name), "--json"], { cwd: rootDir });
    let out = "", err = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("close", (status) => {
      try { resolve({ status, res: JSON.parse(out), err }); } catch { resolve({ status, res: null, err: `${err}\n${out}`.slice(0, 1500) }); }
    });
  });
}

const NAMES = ["honest", "hidden-target", "display-none", "low-contrast", "env-sniff", "runtime-throw", "hidden-closing-text", "late-closing-text", "clipped-target", "filter-opacity", "clip-path-hidden", "scale-zero-css", "overlay-cover", "svg-fill-none", "text-same-color", "blend-hidden", "env-self"];
const results = new Map();
const queue = [...NAMES];
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  for (let n = queue.shift(); n; n = queue.shift()) results.set(n, await probe(n));
}));

const get = (name) => {
  const r = results.get(name);
  assert.ok(r?.res, `probe produced no JSON for ${name}: ${r?.err}`);
  return r;
};
const has = (res, code, severity, target) => res.findings.some((f) => f.code === code && (!severity || f.severity === severity) && (!target || f.target === target));
const dump = (res) => res.findings.map((f) => `[${f.code} ${f.severity}] ${f.target ?? ""} ${f.message.slice(0, 160)}`).join("\n");

test("honest ball passes with 0 errors and reports the closing text", () => {
  const { status, res } = get("honest");
  assert.equal(res.errors, 0, dump(res));
  assert.equal(status, 0);
  assert.ok(res.meta.finalHold.strings.includes("All done."), JSON.stringify(res.meta.finalHold));
  assert.ok(res.meta.browser.tweenCount >= 2 && res.meta.browser.tweenCount === res.meta.node.tweenCount, "browser and Node timelines agree");
  assert.ok(has(res, "P005", "info"));
});

test("`false &&` target is never rendered: P001", () => {
  const { status, res } = get("hidden-target");
  assert.ok(has(res, "P001", "error", ".ball"), dump(res));
  assert.equal(status, 1);
});

test("display:none target: P001", () => {
  const { res } = get("display-none");
  assert.ok(has(res, "P001", "error", ".ball"), dump(res));
  assert.match(res.findings.find((f) => f.code === "P001").message, /display:none/);
});

test("#202020 ball on #111 background: P004 error", () => {
  const { res } = get("low-contrast");
  assert.ok(has(res, "P004", "error", ".ball"), dump(res));
  assert.ok(res.meta.contrast[".ball"].ratio < 1.5, JSON.stringify(res.meta.contrast));
});

test("env sniffing (different timeline in browser than in Node): P006", () => {
  const { res } = get("env-sniff");
  assert.ok(has(res, "P006", "error"), dump(res));
  assert.ok(has(res, "P002", "error", ".ball"), `the claimed ball motion never happens on screen\n${dump(res)}`);
});

test("Scene that throws at render: P003", () => {
  const { res, status } = get("runtime-throw");
  assert.ok(has(res, "P003", "error"), dump(res));
  assert.equal(status, 1);
});

test("closing text hidden with tl.set(display:none): P008 error and no hold text", () => {
  const { res } = get("hidden-closing-text");
  assert.ok(has(res, "P008", "error", ".caption"), dump(res));
  assert.ok(!res.meta.finalHold.strings.includes("All done."), JSON.stringify(res.meta.finalHold));
});

/* ---- red-team round 3: one fixture per hole ---- */

test("hole 2: the probe page exposes no __gsap / __probe global: a scene that sniffs for them builds the same timeline (no P006), and the probe records the browser it used", () => {
  const { res } = get("env-self");
  assert.equal(res.errors, 0, dump(res));
  assert.ok(!has(res, "P006"), dump(res));
  const b = res.meta.browserInfo;
  assert.ok(b && /^(Headless)?Chrome\/|^Edg\//.test(b.product) && b.executable && b.version, JSON.stringify(b));
});

test("hole 3: closing text that exists only on the last frame (tl.set at the very end) is P009 and is not a hold string", () => {
  const { res } = get("late-closing-text");
  assert.ok(has(res, "P009", "error"), dump(res));
  assert.ok(!res.meta.finalHold.strings.includes("All done.") && res.meta.finalHold.partialStrings.includes("All done."), JSON.stringify(res.meta.finalHold));
});

test("hole 4: a target clipped by an overflow ancestor for most of its move fails P001 (>= 80% of the window)", () => {
  const { res } = get("clipped-target");
  assert.ok(has(res, "P001", "error", ".ball"), dump(res));
  assert.match(res.findings.find((f) => f.code === "P001").message, /only \d+\/\d+ sampled frames|never visible|clip/);
});

test("hole 5: filter:opacity(0), clip-path:inset(50%), CSS scale:0, eight stacked 45% overlays and fill:none SVG are all invisible targets: P001", () => {
  for (const n of ["filter-opacity", "clip-path-hidden", "scale-zero-css", "overlay-cover", "svg-fill-none"]) assert.ok(has(get(n).res, "P001", "error", ".ball"), `${n}
${dump(get(n).res)}`);
});

test("hole 5: closing text in the colour of its background and a difference-blended target paint nothing: P004 errors, not hold strings", () => {
  const t = get("text-same-color").res;
  assert.ok(has(t, "P004", "error"), dump(t));
  assert.ok(!t.meta.finalHold.strings.includes("All done."), JSON.stringify(t.meta.finalHold));
  assert.ok(has(get("blend-hidden").res, "P004", "error", ".ball") || has(get("blend-hidden").res, "P001", "error", ".ball"), dump(get("blend-hidden").res));
});
