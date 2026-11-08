/**
 * EVAL SCORER - grades a finished Motion Lab project against an exercise in evals/tasks/<id>.
 * Model-agnostic: it never calls a model. Run your agent (Gemini CLI, DeepSeek, ...) on evals/tasks/<id>/TASK.md,
 * then score what it produced.
 *
 *   pnpm eval:score --task <id> --project <slug>      project in src/projects/<slug>
 *   pnpm eval:score --task <id> --dir <projectDir>    any folder with spec.json + Scene.tsx (solutions, fixtures)
 *   pnpm eval:score --project <slug>                  task id is read from spec.json "evalTask"
 *   pnpm eval:all                                     every src/projects/eval-* with "evalTask", as a leaderboard
 * Flags: --json (print the result as JSON only), --no-write (do not write out/evals/<slug>.json),
 *        --tasks-dir <path> (private/held-out tasks: <path>/<id>/{TASK.md,rubric.json}, see evals/HELDOUT.md),
 *        --render (optional strong mode, needs a browser: render stills and check the timeline's motion is visible, gate error R001),
 *        --no-probe (skip scripts/browser-probe.mjs, the real-browser check, which runs BY DEFAULT when the file exists: the score is then capped at ${UNVERIFIED_CAP} and labelled "unverified"),
 *        --dev (harness development: do not require evals/harness.lock.json to equal the committed git HEAD version),
 *        --skip-integrity (harness development only: do not compare the protected files with evals/harness.lock.json at all).
 * Every score output (human, JSON, leaderboard) lists the flags used and marks the score "NOT VALID FOR COMPARISON" when --dev, --skip-integrity or --no-probe was used.
 * Anti-cheat: C001 (candidate project folder >= tuned similarity to a reference solution, Babel-normalised, vs a pinned public baseline), the browser probe
 * (P001 hidden target, P002 claimed motion not visible, P003 runtime error, P006 node-vs-browser mismatch: gate errors; P004/P007/P008 craft warnings),
 * G003 (type errors, checked with tsc when the probe does not run), R001 (--render), and harness integrity:
 * any changed file under scripts/, evals/tasks|solutions|judges.json, src/core, src/primitives, src/remotion, specs, docs, RULES.md, package.json, tsconfig.json,
 * .githooks and the pinned public example/study projects, or a lock that differs from git HEAD => score TAMPERED = 0.
 * Copy fidelity counts only text that RENDERS (JSX text, strings/consts used in JSX), never comments or unused constants.
 *
 * Score (0-100):  Gate 15 + Craft 25 + Rubric 30 + Code hygiene 15 + Copy fidelity 15.
 *   Gate     : spec (validate-spec), code (ast-lint) and timeline (timeline-audit) report 0 errors. Any error caps the total at 30.
 *   Craft    : starts at 25; each timeline warning above rubric.maxWarnings costs points (WARNING_COST); each audit.allow entry costs 5.
 *   Rubric   : weighted checks from rubric.json (aspect, duration, beats, hold, preset tags, preset ratio, rhythm, required code)
 *              plus BEHAVIOR checks (rubric.behavior / rubric.closingHold) computed from the timeline: travel, bounce heights, wind-up,
 *              what is on screen during the final hold. Any failed behavior check caps the total at BEHAVIOR_CAP (the clip is not what the brief asked).
 *   Hygiene  : Scene.tsx lines, raw (non-preset) tweens, invented local components, micro-fonts / emoji.
 *   Copy     : every required string from the brief appears in the code (10) and no placeholder / Turkish / scaffold text (5).
 * The audits run as child processes with --json (see scripts/timeline-audit.mjs, ast-lint.mjs, validate-spec.mjs).
 */
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { rootDir, rel } from "./lib/projects.mjs";
import { bestSimilarity, checkIntegrity, motionWindows, isSelfJudged, stripComments, projectHygiene, SOURCE_EXT } from "./lib/eval-integrity.mjs";
import { resolveVisual } from "./lib/visual-core.mjs";
import { staticTruth, liveChildren } from "./lib/jsx-selectors.mjs";

const require = createRequire(import.meta.url);
const { parse } = require("@babel/parser");

const RED = "\x1b[31m", GREEN = "\x1b[32m", YELLOW = "\x1b[33m", BOLD = "\x1b[1m", DIM = "\x1b[2m", RESET = "\x1b[0m";

export const WEIGHTS = { gate: 15, craft: 25, rubric: 30, hygiene: 15, copy: 15 };
export const GATE_CAP = 30;
/** A failed behavior check (the clip does not DO what the brief describes) caps the total here: "works but ignores the brief". */
export const BEHAVIOR_CAP = 80;
const BEHAVIOR_WEIGHT = 3;
/** Craft points lost per timeline warning (beyond what the rubric allows). */
export const WARNING_COST = { T006: 3, T007: 3, T008: 5, T009: 5, T010: 4, T011: 4, T012: 5, T013: 3, T014: 3, P004: 3, P007: 3, P008: 3 };
/** Without the browser probe (--no-probe, or the probe could not run) the score is capped here and labelled "unverified": the audits then only saw a fake DOM. */
export const UNVERIFIED_CAP = 70;
/** Probe codes that are gate errors whatever their severity; the rest follow the finding's own severity (info is ignored, warnings cost craft). */
export const PROBE_GATE_CODES = ["P001", "P002", "P003", "P006"];
/** Storyboard-audit warnings (SB*): craft points each, capped. SB errors are gate errors like any other audit's. */
export const SB_WARNING_COST = 2, SB_WARNING_MAX = 8;
const DEFAULT_COST = 3, ALLOW_COST = 5, MIN_HOLD_FRAMES = 72;
/** Project components/ folder limits (mirror ast-lint V2-008); the folder is counted apart from the Scene/helper line and component budgets. */
export const MAX_FOLDER_FILES = 6, MAX_FOLDER_FILE_LINES = 120;

/** Always forbidden in code: placeholder text, Turkish letters, text left over from the `pnpm new` scaffold. */
export const DEFAULT_FORBIDDEN = [
  { label: "lorem ipsum", re: /lorem|ipsum/i },
  { label: "placeholder text", re: /placeholder|your (text|brand|logo|name|headline|company|title) here|\bTODO\b|\bFIXME\b|\bEDIT:/i },
  { label: "Turkish text", re: /[ğĞıİşŞçÇ]/ },
  { label: "scaffold leftovers", re: /faster reviews|teams onboard|on-time launches|start free today/i },
];

/* ---------- helpers ---------- */

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf-8").replace(/^﻿/, ""));
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const round1 = (v) => Math.round(v * 10) / 10;
const posix = (p) => p.replaceAll("\\", "/");

function walkSource(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return walkSource(full);
    return SOURCE_EXT.test(e.name) ? [full] : [];
  });
}

/** Spawns a node script (through the shell so `npx tsx` works on Windows) and parses its --json stdout. */
function runJson(cmd, args) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd: rootDir, shell: true, windowsHide: true });
    let out = "", err = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("close", (code) => {
      const a = out.indexOf("{"), b = out.lastIndexOf("}");
      try {
        resolve({ ok: true, json: JSON.parse(out.slice(a, b + 1)), code });
      } catch {
        resolve({ ok: false, code, error: `${cmd} ${args.join(" ")} printed no JSON (exit ${code}): ${(err || out).trim().slice(0, 300)}` });
      }
    });
  });
}

/** All string-ish text of a source file in source order (string literals, template quasis, JSX text, numbers), normalised. */
export function extractText(code) {
  const parts = [];
  try {
    const ast = parse(code, { sourceType: "module", plugins: ["typescript", "jsx"] });
    const visit = (n) => {
      if (!n || typeof n.type !== "string") return;
      if (n.type === "StringLiteral") parts.push(n.value);
      else if (n.type === "NumericLiteral") parts.push(String(n.value));
      else if (n.type === "TemplateElement") parts.push(n.value.cooked ?? n.value.raw);
      else if (n.type === "JSXText") parts.push(n.value);
      for (const k of Object.keys(n)) {
        if (k === "loc" || k === "extra") continue;
        const c = n[k];
        if (Array.isArray(c)) c.forEach(visit);
        else if (c && typeof c === "object") visit(c);
      }
    };
    visit(ast.program);
  } catch {
    parts.push(code);
  }
  return parts.join(" ");
}
/* ---------- static "what is rendered" helpers (the fallback when the browser probe cannot run) ---------- */

const ATTR_SKIP = /^(className|class|style|key|id|ref|src|href|url|title|alt|aria-.*|data-.*)$/;
const NODE_SKIP = new Set(["loc", "extra", "start", "end"]);
const nodeKids = (n) => Object.keys(n).filter((k) => !NODE_SKIP.has(k)).flatMap((k) => (Array.isArray(n[k]) ? n[k] : [n[k]])).filter((c) => c && typeof c.type === "string");
const isComponentTag = (el) => { const nm = el.openingElement?.name; return nm?.type !== "JSXIdentifier" || /^[A-Z]/.test(nm.name); };
/** const NAME = <init> declarations (any depth), so \`{SHOW && ...}\` with \`const SHOW = false\` is known to be dead. */
function constDecls(ast) {
  const m = new Map();
  const walk = (n) => {
    if (n.type === "VariableDeclaration" && n.kind === "const") for (const d of n.declarations) if (d.id?.type === "Identifier" && d.init) m.set(d.id.name, d.init);
    nodeKids(n).forEach(walk);
  };
  walk(ast.program);
  return m;
}
const stringsIn = (n, out = []) => {
  if (!n || typeof n.type !== "string") return out;
  if (n.type === "StringLiteral") out.push(n.value);
  else if (n.type === "NumericLiteral") out.push(String(n.value));
  else if (n.type === "TemplateElement") out.push(n.value.cooked ?? n.value.raw);
  nodeKids(n).forEach((c) => stringsIn(c, out));
  return out;
};
const attrOf = (el, name) => (el.openingElement.attributes ?? []).find((a) => a.type === "JSXAttribute" && a.name?.name === name);
const classTokensOf = (el) => ["className", "class"].flatMap((nm) => { const a = attrOf(el, nm); return a ? stringsIn(a.value).join(" ").split(/\s+/).filter(Boolean) : []; });
/** The CSS selectors (.class / #id) a timeline could use to reach this element. */
const selectorsOfEl = (el) => [...classTokensOf(el).map((t) => `.${t}`), ...(attrOf(el, "id") ? stringsIn(attrOf(el, "id").value).join(" ").split(/\s+/).filter(Boolean).map((t) => `#${t}`) : [])];
/** How an element is hidden by its own markup: "display" (display:none, hidden, tailwind hidden), "visibility" (visibility:hidden, invisible), "opacity" (opacity 0, opacity-0). */
export function inlineHidden(el) {
  const kinds = new Set();
  const h = attrOf(el, "hidden");
  if (h && (!h.value || (h.value.type === "JSXExpressionContainer" && h.value.expression?.type === "BooleanLiteral" && h.value.expression.value))) kinds.add("display");
  const st = attrOf(el, "style")?.value?.expression;
  if (st?.type === "ObjectExpression")
    for (const pr of st.properties) {
      const key = pr.key?.name ?? pr.key?.value, v = pr.value;
      const lit = v?.type === "StringLiteral" ? v.value : v?.type === "NumericLiteral" ? String(v.value) : null;
      if (key === "display" && lit === "none") kinds.add("display");
      else if (key === "visibility" && (lit === "hidden" || lit === "collapse")) kinds.add("visibility");
      else if ((key === "opacity" || key === "autoAlpha") && lit !== null && Number(lit) < 0.05) kinds.add("opacity");
    }
  for (const t of classTokensOf(el)) { if (t === "hidden") kinds.add("display"); else if (t === "invisible") kinds.add("visibility"); else if (t === "opacity-0") kinds.add("opacity"); }
  return [...kinds];
}

/**
 * Text that can actually appear on screen: JSX text nodes, string/number literals inside JSX expressions, props of COMPONENTS (never attributes of plain
 * HTML elements, never title, alt, aria and data attributes), and (transitively) the const/let initialisers of identifiers used there. Ignored: comments, unused constants,
 * branches that can never run (\`false && <X/>\`, \`cond ? a : b\` with a literal condition, \`const SHOW = false\`) and elements hidden by their own markup
 * (display:none, visibility:hidden, opacity:0, \`hidden\`) unless a timeline tween targets one of their classes/ids (opts.tweened: selectors the timeline animates).
 */
export function renderedText(code, { tweened = [] } = {}) {
  let ast;
  try { ast = parse(code, { sourceType: "module", plugins: ["typescript", "jsx"] }); } catch { return extractText(code); }
  const tw = new Set(tweened);
  const decl = constDecls(ast);
  const inits = new Map(); // name -> [init nodes]
  const defs = (n) => {
    if (n.type === "VariableDeclarator" && n.id?.type === "Identifier" && n.init) (inits.get(n.id.name) ?? inits.set(n.id.name, []).get(n.id.name)).push(n.init);
    nodeKids(n).forEach(defs);
  };
  defs(ast.program);
  const parts = [], seen = new Set();
  const gather = (n) => {
    const live = liveChildren(n, decl);
    if (live) { live.forEach(gather); return; }
    if (n.type === "JSXElement") { visit(n); return; }
    if (n.type === "StringLiteral") parts.push(n.value);
    else if (n.type === "NumericLiteral") parts.push(String(n.value));
    else if (n.type === "TemplateElement") parts.push(n.value.cooked ?? n.value.raw);
    else if (n.type === "JSXText") parts.push(n.value);
    else if (n.type === "Identifier" && !seen.has(n.name)) {
      seen.add(n.name);
      for (const i of inits.get(n.name) ?? []) gather(i);
    }
    if (n.type === "MemberExpression" && !n.computed) { gather(n.object); return; } // COPY.title: the property name is not text
    if (n.type === "ObjectProperty" && !n.computed && n.key?.type === "Identifier") { gather(n.value); return; }
    nodeKids(n).forEach(gather);
  };
  const visit = (n) => {
    const live = liveChildren(n, decl);
    if (live) { live.forEach(visit); return; }
    if (n.type === "JSXText") { parts.push(n.value); return; }
    if (n.type === "JSXExpressionContainer") { gather(n.expression); return; }
    if (n.type === "JSXElement") {
      if (inlineHidden(n).length && !selectorsOfEl(n).some((sel) => tw.has(sel))) return; // hidden by its own markup and nothing ever reveals it
      if (isComponentTag(n))
        for (const a of n.openingElement.attributes ?? [])
          if (a.type === "JSXAttribute" && !ATTR_SKIP.test(a.name?.name ?? "") && a.value) { if (a.value.type === "StringLiteral") parts.push(a.value.value); else gather(a.value); }
      (n.children ?? []).forEach(visit);
      return;
    }
    nodeKids(n).forEach(visit);
  };
  visit(ast.program);
  return parts.join(" ");
}
/** Lowercase, straight quotes, no punctuation, single spaces: "Less noise." == "less noise", "48,200" == "48200". */
export const normText = (s) => s.toLowerCase().replace(/[‘’“”]/g, "'").replace(/[.,!?;:"'`]/g, "").replace(/\s+/g, " ").trim();

/** Does a tag like "physics:bounce" satisfy a rubric pattern like "physics:bounce" or "enter:*"? */
const tagMatches = (tag, pattern) => (pattern.endsWith("*") ? tag.startsWith(pattern.slice(0, -1)) : tag === pattern);
const hasTag = (tags, patterns) => patterns.some((p) => tags.some((t) => tagMatches(t, p)));
const stdev = (xs) => {
  if (xs.length === 0) return 0;
  const m = xs.reduce((a, b) => a + b, 0) / xs.length;
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / xs.length);
};

function slopHits(code) {
  const hits = [];
  if (/\btext-(xs|sm)\b/.test(code)) hits.push("text-xs/text-sm class");
  for (const m of code.matchAll(/text-\[(\d+(?:\.\d+)?)px\]/g)) if (Number(m[1]) < 18) hits.push(`text-[${m[1]}px]`);
  for (const m of code.matchAll(/fontSize:\s*['"]?(\d+(?:\.\d+)?)(?:px)?['"]?/g)) if (Number(m[1]) < 18) hits.push(`fontSize ${m[1]}`);
  if (/\p{Extended_Pictographic}/u.test(code)) hits.push("emoji");
  if (/#00ffff|#ff00ff/i.test(code)) hits.push("raw neon colour");
  return hits;
}


/* ---------- behavior checks (computed from timeline meta: what the clip does, not what the code says) ---------- */

/** A tween leaves the element invisible: opacity/scale ~0, display:none, visibility:hidden, or parked a whole frame away. */
const tweenHidden = (st, W = 1920, H = 1080) =>
  Boolean(st) && (["opacity", "autoAlpha", "scale", "scaleX", "scaleY"].some((k) => typeof st[k] === "number" && st[k] < 0.05) || st.display === "none" || st.visibility === "hidden" || (typeof st.x === "number" && Math.abs(st.x) >= 0.95 * W) || (typeof st.y === "number" && Math.abs(st.y) >= 0.95 * H));
const holdHidden = tweenHidden;

/**
 * HEURISTIC (fallback when the browser probe did not run; with the probe the real text of the final hold, P005, is used instead):
 * the text that is on screen at hold:start, read from the JSX of Scene.tsx.
 * An element counts as hidden when it (or an ancestor) has a class/id whose timeline tween leaves it invisible at hold:start or at the end of the clip
 * (meta.holdState / meta.holdEndState: opacity/autoAlpha/scale < 0.05, display:none, visibility:hidden, parked >= a frame away), when it is hidden by its own
 * markup (inline display:none / visibility:hidden / opacity:0 / \`hidden\`) and no later tween reveals it, when it sits in a branch that never runs
 * (\`false && <X/>\`, literal ternaries), or when a LATER sibling is a tweened full-bleed cover (inset-0 + background, visible at hold:start, e.g. a finale
 * panel revealed by a mask wipe) that paints over it. Elements with no tween are assumed visible. Text = JSX text + string/number literals + top-level const
 * strings referenced inside the element + string props of components (never attributes of plain elements: title, alt, aria and data attributes are not on screen).
 * Dynamic classNames and text drawn inside other components are invisible to this check.
 */
export function visibleHoldText(code, holdState = {}, { holdEndState = {}, width = 1920, height = 1080, tweened = [] } = {}) {
  let ast;
  try { ast = parse(code, { sourceType: "module", plugins: ["typescript", "jsx"] }); } catch { return null; }
  const consts = new Map();
  const collect = (d2) => { for (const d of d2.declarations ?? []) if (d.id?.type === "Identifier" && d.init) consts.set(d.id.name, stringsIn(d.init)); };
  for (const st of ast.program.body) {
    if (st.type === "VariableDeclaration") collect(st);
    else if (st.type === "ExportNamedDeclaration" && st.declaration?.type === "VariableDeclaration") collect(st.declaration);
  }
  const decl = constDecls(ast);
  const statesOf = (sel) => [holdState[sel], holdEndState[sel]].filter(Boolean);
  const hiddenSel = (sel) => statesOf(sel).some((st) => tweenHidden(st, width, height));
  const revealedSel = (sel, kind) => statesOf(sel).some((st) => (kind === "display" ? st.display !== undefined && st.display !== "none" : kind === "visibility" ? (st.visibility !== undefined && st.visibility !== "hidden") || st.autoAlpha >= 0.05 : st.opacity >= 0.05 || st.autoAlpha >= 0.05));
  const parts = [];
  const hiddenBy = (el) => {
    const sels = selectorsOfEl(el);
    if (sels.some(hiddenSel)) return true;
    return inlineHidden(el).some((kind) => !sels.some((sel) => revealedSel(sel, kind)));
  };
  const hasBgKey = (n) => {
    if (!n || typeof n.type !== "string") return false;
    if ((n.type === "Identifier" || n.type === "StringLiteral") && /^background/i.test(n.name ?? n.value ?? "")) return true;
    return nodeKids(n).some(hasBgKey);
  };
  const isCover = (el) => {
    const toks = classTokensOf(el);
    const attrs = el.openingElement.attributes ?? [];
    const hasBg = toks.some((t) => /^bg-/.test(t)) || attrs.some((a) => a.name?.name === "style" && hasBgKey(a.value));
    const tweenedVisible = toks.some((t) => holdState["." + t] && !holdHidden(holdState["." + t], width, height));
    return toks.includes("inset-0") && hasBg && tweenedVisible;
  };
  const visit = (n, hidden, depth, covered = false) => {
    if (!n || typeof n.type !== "string") return;
    const live = liveChildren(n, decl);
    if (live) { live.forEach((c) => visit(c, hidden, depth, covered)); return; }
    if (n.type === "JSXElement") {
      const h = hidden || covered || hiddenBy(n);
      if (isComponentTag(n))
        for (const a of n.openingElement.attributes ?? []) if (a.type === "JSXAttribute" && !ATTR_SKIP.test(a.name?.name ?? "") && !h) parts.push(...stringsIn(a.value));
      const kids = n.children ?? [];
      let lastCover = -1;
      kids.forEach((c, i) => { if (c.type === "JSXElement" && isCover(c)) lastCover = i; });
      kids.forEach((c, i) => visit(c, h, depth + 1, c.type === "JSXElement" && i < lastCover));
      return;
    }
    if (depth > 0 && !hidden) {
      if (n.type === "JSXText" || n.type === "StringLiteral") parts.push(n.value);
      else if (n.type === "NumericLiteral") parts.push(String(n.value));
      else if (n.type === "TemplateElement") parts.push(n.value.cooked ?? n.value.raw);
      else if (n.type === "Identifier" && consts.has(n.name)) parts.push(...consts.get(n.name));
    }
    nodeKids(n).forEach((c) => visit(c, hidden, depth));
  };
  visit(ast.program, false, 0);
  return parts.join(" ");
}

/** The strings the probe saw in the final hold (meta.finalHold.strings of scripts/browser-probe.mjs), or null when it reported none. */
export function probeFinalHoldText(json) {
  const fh = json?.meta?.finalHold;
  if (Array.isArray(fh?.strings)) return fh.strings.map(String);
  if (Array.isArray(fh?.texts)) return fh.texts.map((t) => String(t?.text ?? t));
  return null;
}

const widestRun = (m, axis = "x") => {
  let best = null;
  for (const [sel, info] of Object.entries(m ?? {}))
    for (const r of info[axis]?.runs ?? []) if (!best || Math.abs(r[2]) > Math.abs(best.delta)) best = { sel, from: r[0], to: r[1], delta: r[2] };
  return best;
};

/** The key under which the probe records a textChanges check's text series: a plain .class/#id selector, or "text=<encoded text>" (the element showing that text at the last frame). */
export const textWatchKey = (b) => (b.find ? `text=${encodeURIComponent(b.find)}` : /^[.#][\w-]+$/.test(b.selector ?? "") ? b.selector : null);

/** One behavior check -> { label, pass, detail }. meta is the timeline-audit meta of the project. */
export function evalBehavior(b, meta, { sceneCode = "", allText = "", probeHoldText = null, probeTextSeries = null, probeTargets = null, beats = [] } = {}) {
  const motion = meta.motion ?? {}, fps = meta.fps ?? 60, W = meta.frame?.width ?? 1920;
  const bounceSel = Object.keys(motion).find((s) => motion[s].presets?.includes("physics:bounce"));
  const bounce = bounceSel ? motion[bounceSel] : null;
  switch (b.type) {
    case "netTravel": {
      const info = bounce ?? Object.values(motion).sort((p, q) => Math.abs(q.x?.net ?? 0) - Math.abs(p.x?.net ?? 0))[0];
      const net = Math.abs(info?.x?.net ?? 0), need = b.minFraction * W;
      return { label: b.label ?? "the ball travels sideways (net |dx| >= " + Math.round(b.minFraction * 100) + "% of the frame width = " + Math.round(need) + "px)", pass: net >= need, detail: "net dx " + Math.round(net) + "px of " + Math.round(need) + "px needed" + (bounce ? "" : " (no physics:bounce target)") + "; add travel: <px> to the bounce options" };
    }
    case "bounces": {
      const h = bounce?.heights ?? [];
      const decreasing = h.length > 1 && h.every((v, i) => i === 0 || v <= h[i - 1] * 0.97);
      return { label: b.label ?? "at least " + b.min + " bounces with decreasing heights", pass: h.length - 1 >= b.min && decreasing, detail: "apex heights " + (h.length ? h.join(" > ") : "none") + " px (" + Math.max(0, h.length - 1) + " rebounds)" };
    }
    case "squash": {
      const sy = bounce?.scaleY?.min ?? 1;
      return { label: b.label ?? "the ball squashes on contact (scaleY <= " + b.maxScaleY + ")", pass: sy <= b.maxScaleY, detail: "min scaleY " + sy };
    }
    case "windup": {
      const ws = (meta.windups ?? []).filter((w) => (!b.axis || w.axis === b.axis) && (!b.direction || (b.direction === "up" ? w.mainDelta < 0 : w.mainDelta > 0)) && Math.abs(w.mainDelta) >= (b.minMain ?? 40));
      return { label: b.label ?? "a wind-up opposite to the main move comes right before it", pass: ws.length > 0, detail: ws.length ? ws[0].target + " " + ws[0].axis + ": " + ws[0].windupDelta + "px then " + ws[0].mainDelta + "px at f" + ws[0].mainFrom : "no small opposite move directly before a big move (use launch/anticipate before the action)" };
    }
    case "travelRun": {
      const r = widestRun(motion, "x"), need = b.minFraction * W;
      return { label: b.label ?? "the character travels (one move >= " + Math.round(b.minFraction * 100) + "% of the frame width = " + Math.round(need) + "px)", pass: Boolean(r) && Math.abs(r.delta) >= need, detail: r ? r.sel + " moves " + Math.round(Math.abs(r.delta)) + "px (f" + r.from + "-f" + r.to + ")" : "nothing moves horizontally" };
    }
    case "holdBeforeReaction": {
      // a hold is a movingHold or (rig characters) an idleBreath; the reaction is the first wind-up or physics:react after the walk
      const r = widestRun(motion, "x"), moves = meta.physicsMoves ?? [], kinds = b.presets ?? ["physics:movingHold"];
      const after = (meta.windups ?? []).filter((w) => r && w.windupFrom >= r.to - 3).sort((p, q) => p.windupFrom - q.windupFrom)[0];
      const reactFrames = moves.filter((m) => m.preset === "physics:react" && r && m.startFrame >= r.to - 3).map((m) => m.startFrame);
      const reactAt = Math.min(after ? after.windupFrom : Infinity, ...reactFrames);
      const holds = moves.filter((m) => kinds.includes(m.preset) && m.endFrame !== null && (m.endFrame - m.startFrame) / fps >= b.minSeconds - 1e-6 && r && m.startFrame >= r.to - 3 && m.startFrame < reactAt);
      return { label: b.label ?? "a hold of at least " + b.minSeconds + "s after the travel and before the reaction", pass: holds.length > 0, detail: holds.length ? holds[0].preset.replace("physics:", "") + " f" + holds[0].startFrame + "-f" + holds[0].endFrame : "no " + kinds.map((k) => k.replace("physics:", "")).join("/") + " >= " + b.minSeconds + "s between the end of the walk" + (r ? " (f" + r.to + ")" : "") + " and the reaction" + (Number.isFinite(reactAt) ? " (f" + reactAt + ")" : "") };
    }
    case "lookLeadsReaction": {
      // rig acting: lookAt (eyes first, then the head) after the walk and before react(); the thing is looked at before the body moves
      const r = widestRun(motion, "x"), moves = meta.physicsMoves ?? [];
      const react = moves.filter((m) => m.preset === "physics:react" && r && m.startFrame >= r.to - 3).map((m) => m.startFrame);
      const reactAt = react.length ? Math.min(...react) : null;
      const looks = moves.filter((m) => m.preset === "physics:lookAt");
      const ok = looks.find((l) => /pupils/.test(l.target) && r && l.startFrame >= r.to - 3 && reactAt !== null && l.startFrame < reactAt && looks.some((h) => /head/.test(h.target) && h.startFrame > l.startFrame && h.startFrame < reactAt));
      return { label: b.label ?? "the eyes and head look at the thing (lookAt) before the reaction starts", pass: Boolean(ok), detail: ok ? "pupils f" + ok.startFrame + ", head later, react f" + reactAt : "no lookAt (pupils, then head) between the end of the walk" + (r ? " (f" + r.to + ")" : "") + " and react()" + (reactAt === null ? " (no react() after the walk)" : " (f" + reactAt + ")") };
    }
    case "reactAnticipates": {
      // the reaction starts with a crouch (a downward move) that comes right before the upward hop
      const r = widestRun(motion, "x"), best = [];
      const starts = (meta.physicsMoves ?? []).filter((m) => m.preset === "physics:react" && r && m.startFrame >= r.to - 3).map((m) => m.startFrame);
      const from0 = starts.length ? Math.min(...starts) : Infinity; // only dips inside react(), not the walk's hip bob
      for (const [sel, info] of Object.entries(motion))
        if (info.presets?.includes("physics:react") && info.y?.runs)
          info.y.runs.forEach((run, i, all) => { const nx = all[i + 1]; if (run[0] >= from0 - 1 && run[2] >= (b.minPx ?? 8) && nx && nx[2] <= -(b.minPx ?? 8) && nx[0] - run[1] <= 6) best.push({ sel, from: run[0], down: run[2], up: nx[2] }); });
      return { label: b.label ?? "the reaction starts with an anticipation (a crouch) right before the hop", pass: best.length > 0, detail: best.length ? best[0].sel + " dips " + Math.round(best[0].down) + "px at f" + best[0].from + " then rises " + Math.round(Math.abs(best[0].up)) + "px" : "no downward dip followed by an upward move on a react() target; use react() and let it anticipate" };
    }
    case "windupAfterTravel": {
      const r = widestRun(motion, "x"), ws = (meta.windups ?? []).filter((w) => r && w.windupFrom >= r.to - 3);
      return { label: b.label ?? "an anticipation (small opposite move) comes before the reaction, after the walk", pass: ws.length > 0, detail: ws.length ? ws[0].target + " " + ws[0].axis + " wind-up " + ws[0].windupDelta + "px at f" + ws[0].windupFrom + ", then " + ws[0].mainDelta + "px" : "no wind-up after the walk" + (r ? " (ends f" + r.to + ")" : "") + "; start the reaction with launch/anticipate" };
    }
    case "closingHold": {
      // real browser text (P005, meta.finalHold.strings) when the probe ran; otherwise the static heuristic
      const visible = Array.isArray(probeHoldText) ? probeHoldText.join(" ") : visibleHoldText(sceneCode, meta.holdState ?? {}, { holdEndState: meta.holdEndState, width: W, height: meta.frame?.height ?? 1080, tweened: meta.selectors });
      const text = normText(visible ?? allText);
      // a group marked browserOnly (a frame-driven number that no static reading of the JSX can know) is checked only against the real browser text
      const groups = b.groups.filter((g) => !g.browserOnly || Array.isArray(probeHoldText));
      const missing = groups.filter((g) => !g.anyOf.some((o) => text.includes(normText(o)))).map((g) => g.label ?? g.anyOf[0]);
      return { label: b.label ?? "the closing hold shows: " + b.groups.map((g) => g.label ?? g.anyOf[0]).join(" + ") + " (" + (Array.isArray(probeHoldText) ? "real browser text" : "heuristic, from JSX + tweens") + ")", pass: missing.length === 0, detail: missing.length ? "not on screen at hold:start: " + missing.join(", ") + (visible === null ? " (Scene.tsx could not be parsed)" : "") + ". Put them in elements that are visible in the last 1.2s" : "found on screen at hold:start" };
    }
    case "textChanges": {
      // a counter really counts: verified in the browser from the text of the selector at evenly spaced frames (probe --watch-text)
      const minDistinct = b.minDistinct ?? 10, direction = b.direction ?? "increase";
      const label = b.label ?? `the text of ${b.find ? `the element showing "${b.find}" at the end` : b.selector} changes over >= ${minDistinct} sampled frames${b.monotonic === false ? "" : ` (${direction === "decrease" ? "monotonic decrease" : "monotonic increase"})`}${b.final !== undefined ? ` and ends at ${b.final}` : ""} (real browser)`;
      const series = probeTextSeries?.[textWatchKey(b)];
      if (!Array.isArray(series) || !series.length) return { label, pass: false, detail: `the browser probe recorded no text for ${b.find ? `an element showing "${b.find}" at the last frame` : b.selector}: the element must exist and be on screen (a missing or hidden counter fails)` };
      const shown = series.filter(([, t, vis]) => vis && typeof t === "string" && t !== "");
      const distinct = [...new Set(shown.map(([, t]) => t))];
      const nums = shown.map(([, t]) => { const d = t.replace(/[^\d.\-]/g, ""); return d === "" ? null : Number(d); });
      const numeric = nums.every((n) => n !== null && Number.isFinite(n));
      let mono = true;
      if (b.monotonic !== false) for (let i = 1; i < nums.length; i++) if (!numeric || (direction === "decrease" ? nums[i] > nums[i - 1] : nums[i] < nums[i - 1])) { mono = false; break; }
      const last = series[series.length - 1];
      const finalOk = b.final === undefined || (last[2] === true && normText(String(last[1] ?? "")) === normText(String(b.final)));
      const problems = [];
      if (distinct.length < minDistinct) problems.push(`only ${distinct.length} distinct visible values (needs ${minDistinct}): ${distinct.slice(0, 6).join(", ") || "none"}`);
      if (!mono) problems.push(numeric ? `the value is not monotonic (${direction})` : "the text is not numeric");
      if (!finalOk) problems.push(`the last frame shows "${last[1] ?? ""}"${last[2] ? "" : " (not visible)"}, expected ${b.final}`);
      return { label, pass: problems.length === 0, detail: problems.length ? problems.join("; ") : `${distinct.length} distinct values, ends at ${last[1]}` };
    }
    case "targetVisible": {
      // the main subject (the ball / the jumper / the walker) is on screen in >= 80% of every beat in which it moves (real browser; samples where the timeline itself hides it are not demanded)
      const label = b.label ?? `the moving subject is on screen (in the frame, unclipped, unoccluded, painted) in >= ${Math.round((b.minFraction ?? 0.8) * 100)}% of every beat in which it moves (real browser)`;
      if (!probeTargets) return { label, pass: false, detail: "no browser probe result" };
      const sel = bounceSel ?? (meta.windups ?? [])[0]?.target ?? widestRun(motion, "x")?.sel ?? widestRun(motion, "y")?.sel;
      const info = sel ? probeTargets[sel] : null;
      if (!info) return { label, pass: false, detail: sel ? `the probe saw no element for ${sel}` : "no moving subject found in the timeline" };
      const runs = ["x", "y"].flatMap((ax) => motion[sel]?.[ax]?.runs ?? []).filter((r) => Math.abs(r[2]) >= 12);
      const moving = beats.filter((bt) => runs.some((r) => Math.min(r[1], bt.endFrame) - Math.max(r[0], bt.startFrame) >= 6));
      if (!moving.length) return { label, pass: false, detail: `${sel} does not move inside any beat` };
      const min = b.minFraction ?? 0.8;
      const rows = moving.map((bt) => { const v = info.beatVis?.[bt.id]; return { id: bt.id, v, ok: Boolean(v) && v.claimed >= 0.5 * v.samples && v.visibleClaimed / Math.max(1, v.claimed) >= min }; });
      const bad = rows.filter((r) => !r.ok);
      return { label, pass: bad.length === 0, detail: bad.length ? `${sel}: ${bad.map((r) => (r.v ? `beat "${r.id}" ${r.v.visibleClaimed}/${r.v.claimed} samples on screen${r.v.claimed < 0.5 * r.v.samples ? ` (the timeline hides it for ${r.v.samples - r.v.claimed}/${r.v.samples})` : ""}` : `beat "${r.id}" not sampled`)).join("; ")}` : `${sel}: ${rows.map((r) => `${r.id} ${r.v.visibleClaimed}/${r.v.claimed}`).join(", ")} samples on screen` };
    }
    default:
      return { label: "unknown behavior check " + b.type, pass: false, detail: "fix rubric.json" };
  }
}

/* ---------- flags transparency ---------- */

/** Environment switches that change what a run checks; recorded with every score. */
export const ENV_FLAGS = ["CHECK_FAST", "CHECK_PROBE", "EVAL_TEST_PROBE", "PROBE_GL", "REMOTION_BROWSER_EXECUTABLE"];
export const pickEnvFlags = () => Object.fromEntries(ENV_FLAGS.filter((k) => process.env[k]).map((k) => [k, process.env[k]]));
/** Human-readable list of the flags in force: ["--dev", "--no-probe", "CHECK_FAST=1", ...]. */
export function describeFlags(f) {
  return [
    ...(f.dev ? ["--dev"] : []), ...(f.skipIntegrity ? ["--skip-integrity"] : []), ...(f.noProbe ? ["--no-probe"] : []), ...(f.render ? ["--render"] : []),
    ...(f.tasksDir ? [`--tasks-dir ${f.tasksDir}`] : []), ...Object.entries(f.env ?? {}).map(([k, v]) => `${k}=${v}`),
  ];
}

/* ---------- scoring ---------- */

/**
 * Scores one project folder against a rubric. Returns the full result object (also what is written to out/evals/<slug>.json).
 * `audits` can be injected for tests: { spec, ast, timeline } already-parsed --json results.
 */
export async function scoreDir({ dir, rubric, slug = path.basename(dir), audits, integrity, render, tasksDir, similarity = true, probe, typecheck, flags }) {
  const relDir = posix(path.relative(rootDir, dir)) || ".";
  const specPath = path.join(dir, "spec.json");
  const scenePath = path.join(dir, "Scene.tsx");
  const gateErrors = [];
  const findings = [];
  const notes = [];
  let spec = null;
  try {
    spec = readJson(specPath);
  } catch (e) {
    gateErrors.push({ code: "G000", message: `spec.json missing or invalid: ${e.message}` });
  }
  if (!fs.existsSync(scenePath)) gateErrors.push({ code: "G000", message: "Scene.tsx not found" });
  if (spec && spec.harness !== 2) gateErrors.push({ code: "G001", message: 'spec.json must contain "harness": 2 (use pnpm new, which scaffolds it)' });

  // ---- run the three audits (parallel) ----
  const run =
    audits ??
    Object.fromEntries(
      await Promise.all([
        runJson("node", ["scripts/validate-spec.mjs", "--dir", relDir, "--json"]).then((r) => ["spec", r]),
        runJson("node", ["scripts/ast-lint.mjs", "--dir", relDir, "--json"]).then((r) => ["ast", r]),
        runJson("npx", ["tsx", "scripts/timeline-audit.mjs", "--dir", relDir, "--json"]).then((r) => ["timeline", r]),
        // storyboard audit (SB codes): activates as soon as scripts/storyboard-audit.mjs exists; contract {ok, errors, warnings, findings:[{code,severity,frame,target,message}], meta}
        ...(fs.existsSync(path.join(rootDir, "scripts", "storyboard-audit.mjs")) ? [runJson("node", ["scripts/storyboard-audit.mjs", "--dir", relDir, "--json"]).then((r) => ["storyboard", r])] : []),
      ]),
    );
  // ---- browser probe (real headless Chrome) or its static fallback ----
  // probe: undefined = run scripts/browser-probe.mjs when it exists; false = --no-probe (score capped, "unverified"); "static" = no probe and no cap (tests of
  // the static heuristics); an object {ok, json} = injected result. With injected `audits` and no `probe` the probe is not run either.
  const probeFile = path.join(rootDir, "scripts", "browser-probe.mjs");
  let probeMode, probeRes = null;
  if (probe === false) probeMode = "skipped";
  else if (probe === "static" || (probe === undefined && audits)) probeMode = "static";
  else if (probe && typeof probe === "object") { probeMode = "injected"; probeRes = probe; }
  else if (fs.existsSync(probeFile)) {
    probeMode = "run";
    // text-change behavior checks need the text of their selector sampled in the browser
    const watch = [...new Set((rubric.behavior ?? []).filter((b) => b.type === "textChanges").map((b) => textWatchKey(b)).filter(Boolean))];
    probeRes = await runJson("node", ["scripts/browser-probe.mjs", "--dir", relDir, "--json", ...watch.flatMap((w) => ["--watch-text", w])]);
  }
  else probeMode = "absent";
  const probeUsed = probeRes?.ok === true && Array.isArray(probeRes.json?.findings);
  const probeFailed = (probeMode === "run" || probeMode === "injected") && !probeUsed;
  const unverified = probeMode === "skipped" || probeFailed;
  const runAll = probeUsed ? { ...run, probe: probeRes } : run;
  if (probeUsed) { /* merged below */ }
  else if (probeFailed) notes.push(`browser probe could not run (${probeRes?.error ?? "no result"}): the score is unverified and capped at ${UNVERIFIED_CAP}`);
  if (probeMode === "skipped") notes.push(`--no-probe: nothing was checked in a real browser, so the score is unverified and capped at ${UNVERIFIED_CAP}`);
  const payload = {};
  for (const [name, r] of Object.entries(runAll)) {
    if (!r.ok) {
      gateErrors.push({ code: "G002", message: `${name} audit could not run: ${r.error}` });
      continue;
    }
    payload[name] = r.json;
    for (const f of r.json.findings ?? []) {
      const entry = { source: name, ...f };
      findings.push(entry);
      if (f.severity === "error" || (name === "probe" && PROBE_GATE_CODES.includes(f.code) && f.severity !== "info")) gateErrors.push({ code: f.code, message: `${f.target ? `${f.target}: ` : ""}${f.message}`, frame: f.frame ?? undefined });
    }
  }
  if (probeUsed && payload.probe?.meta?.renderable === false && !gateErrors.some((e) => e.code === "P003")) gateErrors.push({ code: "P003", message: "the browser probe could not render the composition" });
  const probeHoldText = probeUsed ? probeFinalHoldText(payload.probe) : null;

  // ---- type check (G003): without the probe a type error would only surface at render time ----
  if ((typecheck ?? !audits) && !probeUsed && probeMode !== "static") {
    const tc = await runTypeCheck(relDir, slug);
    if (tc.errors.length) gateErrors.push({ code: "G003", message: `${tc.errors.length} TypeScript error(s) in the project: ${tc.errors.slice(0, 3).join(" | ")}` });
  } else if (typecheck === true) {
    const tc = await runTypeCheck(relDir, slug);
    if (tc.errors.length) gateErrors.push({ code: "G003", message: `${tc.errors.length} TypeScript error(s) in the project: ${tc.errors.slice(0, 3).join(" | ")}` });
  }
  const meta = payload.timeline?.meta?.[slug] ?? Object.values(payload.timeline?.meta ?? {})[0] ?? {};
  const astMeta = Object.values(payload.ast?.meta ?? {})[0] ?? {};
  const warnings = findings.filter((f) => (f.source === "timeline" || (f.source === "probe" && f.code !== "P005")) && f.severity === "warning");

  // ---- sources ----
  const files = walkSource(dir);
  const sources = files.map((f) => fs.readFileSync(f, "utf-8"));
  const allCode = sources.join("\n");
  const sceneCode = fs.existsSync(scenePath) ? fs.readFileSync(scenePath, "utf-8") : "";
  const hy0 = projectHygiene(dir, { exclude: scenePath }); // files other than Scene.tsx count too (a split-up scene cannot dodge the limits)
  const sceneLines = (astMeta.sceneLines ?? (sceneCode ? sceneCode.replace(/\r?\n$/, "").split(/\r?\n/).length : 0)) + hy0.lines;
  const strippedCode = sources.map(stripComments).join("\n"); // requiredCode regexes never see comments
  const allText = normText(sources.map((c) => renderedText(c, { tweened: meta.selectors ?? [] })).join(" "));

  // ---- anti-cheat: copied answer key (C001), render cross-check (R001) ----
  let sim = null;
  if (similarity && sceneCode) {
    sim = bestSimilarity(sceneCode, scenePath, { tasksDir, dir });
    if (sim.copied)
      gateErrors.push({ code: "C001", message: `copied from the answer key: the project folder is ${Math.round(sim.max * 100)}% structure-similar (${sim.metric} metric: ${sim.metric === "bag" ? "order-insensitive statement hashes" : `identifiers/numbers${sim.metric === "loose" ? "/strings" : ""} normalised`}) to the reference solution "${sim.id}" (limit ${Math.round(sim.limit * 100)}%, and ${Math.round((sim.max - sim.publicMax) * 100)} points closer than the best pinned public example/study at ${Math.round(sim.publicMax * 100)}%, which needs ${Math.round(sim.margin * 100)}; adapting those is fine). Write your own scene from the brief instead of copying evals/solutions` });
  }
  let renderInfo = null;
  if (render) {
    const res = render === true ? await runRenderCheck({ dir, slug, windows: motionWindows(meta, spec?.beats ?? []) }) : render;
    renderInfo = res;
    if (res.ok) {
      const total = res.windows.length, vis = res.windows.filter((w) => w.visible).length;
      if (total > 0 && vis / total < 0.5)
        gateErrors.push({ code: "R001", message: `timeline motion not visible on screen: only ${vis}/${total} windows where the timeline claims movement actually change pixels (static: ${res.windows.filter((w) => !w.visible).slice(0, 4).map((w) => `${w.target} f${w.from}-f${w.to}`).join(", ")}). The tweens probably target elements that are not rendered or are hidden` });
    }
  }

  // ---- gate ----
  const gate = { max: WEIGHTS.gate, score: gateErrors.length ? 0 : WEIGHTS.gate, errors: gateErrors };

  // ---- craft ----
  const maxWarn = rubric.maxWarnings ?? {};
  const byCode = {};
  for (const w of warnings) byCode[w.code] = (byCode[w.code] ?? 0) + 1;
  const craftItems = [];
  let craftLoss = 0;
  for (const [code, n] of Object.entries(byCode).sort()) {
    const allowed = maxWarn[code] ?? maxWarn.default ?? 0;
    const extra = Math.max(0, n - allowed);
    if (!extra) continue;
    const cost = (WARNING_COST[code] ?? DEFAULT_COST) * extra;
    craftLoss += cost;
    craftItems.push({ code, count: n, allowed, cost });
  }
  const allowEntries = Array.isArray(spec?.audit?.allow) ? spec.audit.allow.length : 0;
  const allowIgnored = (Array.isArray(spec?.audit?.allow) ? spec.audit.allow : []).map((a) => a?.code).filter((c) => gateErrors.some((e) => e.code === c));
  for (const c of new Set(allowIgnored)) notes.push(`allow ignored for error code ${c}: audit.allow only suppresses warnings`);
  if (allowEntries) {
    craftLoss += allowEntries * ALLOW_COST;
    craftItems.push({ code: "audit.allow", count: allowEntries, allowed: 0, cost: allowEntries * ALLOW_COST });
  }
  const sbWarnings = findings.filter((f) => f.source === "storyboard" && f.severity === "warning");
  if (sbWarnings.length) {
    const cost = Math.min(SB_WARNING_MAX, sbWarnings.length * SB_WARNING_COST);
    craftLoss += cost;
    craftItems.push({ code: "storyboard", count: sbWarnings.length, allowed: 0, cost });
  }
  const craft = { max: WEIGHTS.craft, score: round1(clamp(WEIGHTS.craft - craftLoss, 0, WEIGHTS.craft)), penalties: craftItems };

  // ---- rubric ----
  const checks = [];
  const check = (id, label, pass, detail, weight = 1) => checks.push({ id, label, pass: Boolean(pass), detail, weight });
  const tags = Object.keys(meta.presetCounts ?? {});
  const durationS = Number(spec?.durationInSeconds);
  const beatCount = Array.isArray(spec?.beats) ? spec.beats.length : 0;
  check("aspect", `aspect is ${rubric.aspect}`, spec?.aspect === rubric.aspect, `spec.aspect = ${spec?.aspect}`);
  if (rubric.durationSeconds)
    check("duration", `duration ${rubric.durationSeconds.min}-${rubric.durationSeconds.max}s`, durationS >= rubric.durationSeconds.min && durationS <= rubric.durationSeconds.max, `durationInSeconds = ${spec?.durationInSeconds}`);
  if (rubric.beats)
    check("beats", `${rubric.beats.min}-${rubric.beats.max} beats`, beatCount >= rubric.beats.min && beatCount <= rubric.beats.max, `${beatCount} beats in spec.json`);
  if (rubric.requireHoldFinal !== false)
    check("holdFinal", `final hold of at least ${MIN_HOLD_FRAMES} frames`, meta.hasHold && meta.holdFrames >= MIN_HOLD_FRAMES, meta.hasHold ? `${meta.holdFrames} frames` : "no holdFinal() in the timeline");
  for (const [i, g] of (rubric.requiredTags ?? []).entries())
    check(`tag-${i + 1}`, g.label ?? `uses ${g.anyOf.join(" or ")}`, hasTag(tags, g.anyOf), `needs one of ${g.anyOf.join(", ")}; timeline has ${tags.join(", ") || "no presets"}`);
  if (rubric.forbiddenTags?.length) {
    const bad = tags.filter((t) => rubric.forbiddenTags.some((p) => tagMatches(t, p)));
    check("forbidden-tags", `avoids ${rubric.forbiddenTags.join(", ")}`, bad.length === 0, bad.length ? `uses ${bad.join(", ")}` : "none used");
  }
  if (rubric.minPresetRatio !== undefined)
    check("preset-ratio", `at least ${Math.round(rubric.minPresetRatio * 100)}% of tweens are presets`, (meta.presetRatio ?? 0) >= rubric.minPresetRatio, `${Math.round((meta.presetRatio ?? 0) * 100)}% of ${meta.tweenCount ?? 0} tweens`);
  if (rubric.minTweens !== undefined)
    check("min-tweens", `at least ${rubric.minTweens} tweens (not a slideshow)`, (meta.tweenCount ?? 0) >= rubric.minTweens, `${meta.tweenCount ?? 0} tweens`);
  if (rubric.rhythm) {
    const frames = meta.onsetFrames ?? [];
    const gaps = frames.slice(1).map((f, i) => f - frames[i]);
    const sigma = stdev(gaps);
    check("rhythm", `entrances have rhythm (>= ${rubric.rhythm.minDistinctOnsets} distinct onsets, gap sigma >= ${rubric.rhythm.minGapSigmaFrames}f)`, frames.length >= rubric.rhythm.minDistinctOnsets && sigma >= rubric.rhythm.minGapSigmaFrames, `${frames.length} onsets, gap sigma ${round1(sigma)}f`);
  }
  for (const [i, g] of (rubric.requiredCode ?? []).entries()) {
    const ok = g.anyOf.some((p) => new RegExp(p).test(strippedCode));
    check(`code-${i + 1}`, g.label ?? `code matches ${g.anyOf.join(" or ")}`, ok, `looked for ${g.anyOf.join(" | ")}`);
  }
  // textChanges / targetVisible are verified in the real browser only: without the probe they are not evaluated (the score is then unverified and capped anyway)
  const BROWSER_ONLY = new Set(["textChanges", "targetVisible"]);
  const behaviors = [...(rubric.behavior ?? []).filter((b) => probeUsed || !BROWSER_ONLY.has(b.type)), ...(rubric.closingHold ? [{ type: "closingHold", groups: rubric.closingHold.groups }] : [])];
  const probeMeta = probeUsed ? payload.probe?.meta ?? {} : {};
  const behaviorFails = [];
  for (const [i, b] of behaviors.entries()) {
    const r = evalBehavior(b, meta, { sceneCode, allText, probeHoldText, probeTextSeries: probeMeta.textSeries ?? null, probeTargets: probeUsed ? probeMeta.targets ?? {} : null, beats: spec?.beats ?? [] });
    check(`behavior-${i + 1}`, `[on screen] ${r.label}`, r.pass, r.detail, BEHAVIOR_WEIGHT);
    if (!r.pass) behaviorFails.push(r.label);
  }
  check("eval-task", `spec.json has "evalTask": "${rubric.task}"`, spec?.evalTask === rubric.task, `evalTask = ${spec?.evalTask ?? "(missing)"}`);
  const wTotal = checks.reduce((a, c) => a + c.weight, 0) || 1;
  const wPass = checks.reduce((a, c) => a + (c.pass ? c.weight : 0), 0);
  const rubricPart = { max: WEIGHTS.rubric, score: round1((WEIGHTS.rubric * wPass) / wTotal), checks };

  // ---- hygiene (4 + 4 + 3 + 1 + 3) ----
  const maxLines = rubric.maxSceneLines ?? 150, maxRaw = rubric.maxRawTweens ?? 2, maxComp = rubric.maxLocalComponents ?? 1;
  const rawTweens = (meta.rawTweenCount ?? 0) + hy0.rawTweens, comps = (astMeta.localComponents ?? 0) + hy0.components;
  const fol = hy0.folder;
  const hits = slopHits(allCode);
  const hy = [
    { id: "lines", label: `project source <= ${maxLines} lines`, max: 4, score: sceneLines <= maxLines ? 4 : 4 * clamp(1 - (sceneLines - maxLines) / maxLines, 0, 1), detail: `${sceneLines} lines` },
    { id: "raw-tweens", label: `<= ${maxRaw} raw (non-preset) tweens`, max: 4, score: rawTweens <= maxRaw ? 4 : 4 * clamp(1 - (rawTweens - maxRaw) / 4, 0, 1), detail: `${rawTweens} raw tweens` },
    { id: "components", label: `<= ${maxComp} invented local components`, max: 3, score: comps <= maxComp ? 3 : 3 * clamp(1 - (comps - maxComp) / 2, 0, 1), detail: `${comps} local components${astMeta.componentNames?.length ? ` (${astMeta.componentNames.join(", ")})` : ""}` },
    { id: "components-folder", label: `components/ folder <= ${MAX_FOLDER_FILES} files of <= ${MAX_FOLDER_FILE_LINES} lines`, max: 1, score: fol.files <= MAX_FOLDER_FILES && fol.maxFileLines <= MAX_FOLDER_FILE_LINES ? 1 : clamp(1 - Math.max(fol.files - MAX_FOLDER_FILES, 0) / 3 - Math.max(fol.maxFileLines - MAX_FOLDER_FILE_LINES, 0) / MAX_FOLDER_FILE_LINES, 0, 1), detail: fol.files ? `${fol.files} files, longest ${fol.maxFileLines} lines, ${fol.components} components` : "no components/ folder" },
    { id: "slop", label: "no micro-fonts, emoji or neon", max: 3, score: 3 * clamp(1 - hits.length / 2, 0, 1), detail: hits.length ? hits.join(", ") : "clean" },
  ];
  const hygiene = { max: WEIGHTS.hygiene, score: round1(hy.reduce((a, c) => a + c.score, 0)), items: hy.map((c) => ({ ...c, score: round1(c.score) })) };

  // ---- copy fidelity (10 + 5) ----
  const required = rubric.requiredStrings ?? [];
  const missing = [];
  for (const entry of required) {
    const options = typeof entry === "string" ? [entry] : entry.anyOf;
    if (!options.some((o) => allText.includes(normText(o)))) missing.push(options.join(" | "));
  }
  const forbidden = [...DEFAULT_FORBIDDEN, ...(rubric.forbiddenPatterns ?? []).map((p) => ({ label: `forbidden pattern /${p}/`, re: new RegExp(p, "i") }))];
  const forbiddenHits = forbidden.filter((f) => f.re.test(allCode) || f.re.test(JSON.stringify(spec ?? {}))).map((f) => f.label);
  const foundShare = required.length ? (required.length - missing.length) / required.length : 1;
  const copy = {
    max: WEIGHTS.copy,
    score: round1(10 * foundShare + Math.max(0, 5 - 2.5 * forbiddenHits.length)),
    required: required.length,
    missing,
    forbiddenHits,
  };

  // ---- total ----
  const raw = gate.score + craft.score + rubricPart.score + hygiene.score + copy.score;
  const capped = gateErrors.length > 0 && raw > GATE_CAP;
  const behaviorCapped = !capped && behaviorFails.length > 0 && raw > BEHAVIOR_CAP;
  const tampered = integrity?.status === "tampered";
  // flags transparency: what was switched on is printed with every score; dev/skip/no-probe scores are not comparable
  const flagsOut = { dev: Boolean(flags?.dev), skipIntegrity: Boolean(flags?.skipIntegrity), noProbe: Boolean(flags?.noProbe), render: Boolean(flags?.render), tasksDir: flags?.tasksDir ?? null, env: flags?.env ?? pickEnvFlags(), list: [] };
  flagsOut.list = describeFlags(flagsOut);
  const invalidReasons = [];
  if (flagsOut.dev) invalidReasons.push("--dev");
  if (flagsOut.skipIntegrity) invalidReasons.push("--skip-integrity");
  if (flagsOut.noProbe) invalidReasons.push("--no-probe");
  if (unverified && !flagsOut.noProbe) invalidReasons.push("the browser probe could not run (unverified)");
  const unverifiedCapped = !capped && !behaviorCapped && unverified && raw > UNVERIFIED_CAP;
  const score = tampered ? 0 : Math.round(capped ? GATE_CAP : behaviorCapped ? Math.min(BEHAVIOR_CAP, unverified ? UNVERIFIED_CAP : BEHAVIOR_CAP) : unverified ? Math.min(raw, UNVERIFIED_CAP) : raw);
  return {
    scorer: 1,
    task: rubric.task,
    project: slug,
    dir: relDir,
    score,
    uncappedScore: Math.round(raw),
    tampered,
    integrity: integrity ? { status: integrity.status, changed: integrity.changed.slice(0, 40), changedCount: integrity.changed.length, notes: integrity.notes } : null,
    similarity: sim ? { max: Math.round(sim.max * 1000) / 1000, solution: sim.id, publicMax: Math.round(sim.publicMax * 1000) / 1000, publicExample: sim.publicId, copied: sim.copied, metric: sim.metric, limit: sim.limit, margin: Math.round(sim.margin * 1000) / 1000, metrics: Object.fromEntries(Object.entries(sim.metrics).map(([k, m]) => [k, { max: Math.round(m.max * 1000) / 1000, publicMax: Math.round(m.publicMax * 1000) / 1000, copied: m.copied }])) } : null,
    probe: { mode: probeMode, used: probeUsed, unverified, errors: probeUsed ? payload.probe.errors ?? 0 : null, finalHoldText: probeHoldText, browser: probeUsed ? payload.probe?.meta?.browserInfo ?? null : null },
    flags: flagsOut,
    validForComparison: invalidReasons.length === 0,
    invalidReasons,
    unverified,
    unverifiedCapped,
    evalModel: spec?.evalModel ?? null,
    notes,
    render: renderInfo,
    capped,
    behaviorCapped,
    behaviorFails,
    breakdown: { gate, craft, rubric: rubricPart, hygiene, copy },
    findings: findings.map((f) => ({ source: f.source, code: f.code, severity: f.severity, frame: f.frame ?? null, target: f.target ?? null, message: f.message })),
    stats: { sceneLines, tweens: meta.tweenCount ?? 0, presetRatio: round1((meta.presetRatio ?? 0) * 100), rawTweens, localComponents: comps, presets: meta.presetCounts ?? {} },
  };
}

/** Resolves task + dir + slug from CLI-style options and scores. */
let integrityCache = null;
/** Integrity of the harness files, computed once per process (skipped with skipIntegrity). */
export function harnessIntegrity(skip, dev = false) {
  if (skip) return { status: "skipped", changed: [], notes: ["--skip-integrity"] };
  integrityCache ??= {};
  integrityCache[dev ? "dev" : "strict"] ??= checkIntegrity({ dev });
  return integrityCache[dev ? "dev" : "strict"];
}

/** tsc --noEmit over the project folder only (a throw-away tsconfig that extends the repo's). Returns { errors: ["path(l,c): TSxxxx message"] }. */
export async function runTypeCheck(relDir, slug) {
  const tmpDir = path.join(rootDir, "out", "evals");
  fs.mkdirSync(tmpDir, { recursive: true });
  const cfg = path.join(tmpDir, `.tsc-${slug.replace(/[^\w-]/g, "_")}-${process.pid}.json`);
  const up = posix(path.relative(tmpDir, rootDir)) || ".";
  fs.writeFileSync(cfg, JSON.stringify({ extends: `${up}/tsconfig.json`, compilerOptions: { noEmit: true, incremental: false }, include: [`${up}/${relDir}/**/*`, `${up}/src/*.d.ts`] }));
  const out = await new Promise((resolve) => {
    const child = spawn("node", ["node_modules/typescript/bin/tsc", "--noEmit", "-p", rel(cfg)], { cwd: rootDir, shell: true, windowsHide: true });
    let o = "";
    child.stdout.on("data", (d) => (o += d));
    child.stderr.on("data", (d) => (o += d));
    child.on("close", () => resolve(o));
  });
  fs.rmSync(cfg, { force: true });
  const prefix = posix(relDir).replace(/^\.\//, "");
  return { errors: out.split(/\r?\n/).map((l) => posix(l)).filter((l) => /error TS\d+/.test(l) && (l.startsWith(prefix + "/") || l.startsWith(prefix.replace(/^\.\.\//, "")))).map((l) => l.trim().slice(0, 240)) };
}

/** Renders the claimed-motion windows of a registered project through scripts/render-check.mjs (needs a browser). */
export async function runRenderCheck({ dir, slug, windows }) {
  if (path.dirname(path.resolve(dir)) !== path.join(rootDir, "src", "projects"))
    return { ok: false, windows: [], error: "--render needs the project in src/projects/<slug> (the composition registry); copy the folder there first" };
  if (!windows.length) return { ok: true, windows: [], note: "the timeline claims no visible movement to cross-check" };
  const tmp = path.join(rootDir, "out", "evals");
  fs.mkdirSync(tmp, { recursive: true });
  const wf = path.join(tmp, `${slug}.windows.json`);
  fs.writeFileSync(wf, JSON.stringify(windows));
  const r = await runJson("node", ["scripts/render-check.mjs", "--project", slug, "--windows", rel(wf)]);
  if (!r.ok) return { ok: false, windows: [], error: r.error };
  return r.json;
}

export async function scoreTarget({ task, project, dir, tasksDir, render = false, skipIntegrity = false, dev = false, probe, typecheck }) {
  let targetDir, slug;
  if (dir) {
    targetDir = path.resolve(process.cwd(), dir);
    slug = path.basename(targetDir);
  } else if (project) {
    targetDir = path.join(rootDir, "src", "projects", project);
    slug = project;
  } else throw new Error("pass --project <slug> or --dir <projectDir>");
  if (!fs.existsSync(path.join(targetDir, "spec.json"))) throw new Error(`no spec.json in ${rel(targetDir)}`);
  let taskId = task;
  if (!taskId) {
    try { taskId = readJson(path.join(targetDir, "spec.json")).evalTask; } catch { /* reported below */ }
  }
  if (!taskId) throw new Error('no task: pass --task <id> or set "evalTask" in spec.json');
  const tasksRoot = tasksDir ? path.resolve(process.cwd(), tasksDir) : path.join(rootDir, "evals", "tasks");
  let rubricPath = path.join(tasksRoot, taskId, "rubric.json");
  if (!fs.existsSync(rubricPath) && tasksDir) rubricPath = path.join(rootDir, "evals", "tasks", taskId, "rubric.json"); // a private set may add tasks only
  if (!fs.existsSync(rubricPath)) {
    const known = fs.existsSync(tasksRoot) ? fs.readdirSync(tasksRoot).join(", ") : "(tasks dir missing)";
    throw new Error(`unknown task "${taskId}" (known in ${tasksRoot}: ${known})`);
  }
  const flags = { dev, skipIntegrity, noProbe: probe === false, render: Boolean(render), tasksDir: tasksDir ?? null, env: pickEnvFlags() };
  const result = await scoreDir({ dir: targetDir, rubric: readJson(rubricPath), slug, integrity: harnessIntegrity(skipIntegrity, dev), render: render || undefined, tasksDir: tasksDir ? tasksRoot : undefined, probe, typecheck, flags });
  // the visual score is RECOMPUTED here from the stored answers + the rubric + the current images/manifests every time; stored totals are never trusted
  result.visual = resolveVisual(slug, { taskId, projectDir: targetDir, tasksDir });
  return result;
}

export function writeResult(result) {
  const outDir = path.join(rootDir, "out", "evals");
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, `${result.project}.json`);
  fs.writeFileSync(file, `${JSON.stringify(result, null, 2)}\n`, "utf-8");
  return file;
}

/* ---------- output ---------- */

const color = (score, max) => (score >= max - 0.05 ? GREEN : score >= max * 0.6 ? YELLOW : RED);
const cell = (name, p, note) => `  ${name.padEnd(8)} ${color(p.score, p.max)}${String(p.score).padStart(5)}/${p.max}${RESET}  ${note}`;

export function printResult(r) {
  const b = r.breakdown;
  const tone = r.score >= 90 ? GREEN : r.score >= 60 ? YELLOW : RED;
  console.log(`\n${BOLD}==== EVAL ${r.task} :: ${r.project} ====${RESET}`);
  console.log(`  ${DIM}flags: ${r.flags?.list?.length ? r.flags.list.join(" ") : "none"}${RESET}`);
  if (r.tampered) {
    console.log(`  ${BOLD}${RED}SCORE 0/100  TAMPERED${RESET}${RED}: ${r.integrity.changedCount} harness file(s) differ from evals/harness.lock.json (uncapped score would be ${r.uncappedScore})${RESET}`);
    for (const c of r.integrity.changed.slice(0, 12)) console.log(`    ${RED}${c.kind}${RESET} ${c.file}`);
    if (r.integrity.changedCount > 12) console.log(`    ${DIM}... and ${r.integrity.changedCount - 12} more${RESET}`);
    console.log(`  ${DIM}The tested model must not edit scripts/, evals/, docs/, src/core, src/primitives, specs/ or RULES.md. Restore them (git checkout), or if YOU changed the harness on purpose run pnpm eval:lock.${RESET}`);
  }
  for (const n of r.integrity?.notes ?? []) if (!/skip-integrity/.test(n)) console.log(`  ${DIM}[integrity] ${n}${RESET}`);
  if (r.similarity && r.similarity.max >= 0.5) console.log(`  ${DIM}similarity to reference solution "${r.similarity.solution}": ${Math.round(r.similarity.max * 100)}% (${r.similarity.metric} metric, C001 at ${Math.round(r.similarity.limit * 100)}% and ${Math.round(r.similarity.publicMax * 100)}% for the closest public project)${RESET}`);
  for (const n of r.notes ?? []) console.log(`  ${YELLOW}[note] ${n}${RESET}`);
  if (r.probe?.mode === "run" || r.probe?.mode === "injected") console.log(r.probe.used ? `  ${DIM}browser probe: ran in ${r.probe.browser ? `${r.probe.browser.product} (${String(r.probe.browser.executable).split(/[\\/]/).pop()})` : "a real browser"}${RESET}` : `  ${YELLOW}browser probe did not produce a result${RESET}`);
  if (r.render) console.log(r.render.ok ? `  ${DIM}render cross-check: ${r.render.windows.filter((w) => w.visible).length}/${r.render.windows.length} claimed-motion windows visible${r.render.note ? ` (${r.render.note})` : ""}${RESET}` : `  ${YELLOW}render cross-check could not run: ${r.render.error}${RESET}`);
  console.log(`  ${BOLD}SCORE ${tone}${r.score}/100${RESET}${r.capped ? `${RED}  (capped at ${GATE_CAP}: ${b.gate.errors.length} gate error${b.gate.errors.length === 1 ? "" : "s"}, uncapped ${r.uncappedScore})${RESET}` : ""}${r.unverifiedCapped ? `${YELLOW}  (UNVERIFIED, capped at ${UNVERIFIED_CAP}: no real-browser check ran, uncapped ${r.uncappedScore})${RESET}` : r.unverified ? `${YELLOW}  (UNVERIFIED: no real-browser check ran)${RESET}` : ""}${r.behaviorCapped ? `${YELLOW}  (capped at ${BEHAVIOR_CAP}: the clip does not do what the brief describes, ${r.behaviorFails.length} on-screen check${r.behaviorFails.length === 1 ? "" : "s"} failed, uncapped ${r.uncappedScore})${RESET}` : ""}${r.validForComparison === false ? `  ${BOLD}${RED}NOT VALID FOR COMPARISON${RESET}${RED} (${r.invalidReasons.join(", ")})${RESET}` : ""}`);
  console.log(cell("Gate", b.gate, b.gate.errors.length ? `${b.gate.errors.length} error(s)` : "0 errors"));
  console.log(cell("Craft", b.craft, b.craft.penalties.length ? b.craft.penalties.map((p) => `${p.code} x${p.count} (-${p.cost})`).join(", ") : "no warnings"));
  const failed = b.rubric.checks.filter((c) => !c.pass);
  console.log(cell("Rubric", b.rubric, `${b.rubric.checks.length - failed.length}/${b.rubric.checks.length} checks`));
  const weakHy = b.hygiene.items.filter((i) => i.score < i.max);
  console.log(cell("Hygiene", b.hygiene, weakHy.length ? weakHy.map((i) => `${i.id}: ${i.detail}`).join("; ") : "clean"));
  console.log(cell("Copy", b.copy, b.copy.missing.length || b.copy.forbiddenHits.length ? [b.copy.missing.length ? `missing: ${b.copy.missing.join(", ")}` : "", b.copy.forbiddenHits.length ? `forbidden: ${b.copy.forbiddenHits.join(", ")}` : ""].filter(Boolean).join("; ") : b.copy.required ? `${b.copy.required} required strings found` : "no required copy"));

  const v = r.visual;
  if (v) {
    if (!v.valid) console.log(`  ${YELLOW}Visual NOT COUNTED: the stored answers are no longer valid: ${v.problems[0]}${v.problems.length > 1 ? ` (+${v.problems.length - 1} more)` : ""}${RESET}`);
    else if (!v.judge) console.log(`  ${YELLOW}Visual (judge: unknown) ${v.score}/100  not counted: re-run eval-visual with --judge <model>${RESET}`);
    else if (v.selfJudged) console.log(`  ${YELLOW}Visual (judge: ${v.judge}) ${v.score}/100  self-judged, not counted${RESET}  ${DIM}(the judge is the model that built the project)${RESET}`);
    else console.log(`  ${BOLD}Visual (judge: ${v.judge}) ${color(v.score, 100)}${v.score}/100${RESET}  ${DIM}(recomputed from the answers + rubric just now, separate from the score above; task ${v.task.score}/${v.task.max}, generic ${v.generic.score}/${v.generic.max})${RESET}`);
    if (v.valid && v.judge && v.compare) console.log(`  ${BOLD}vs reference ${color(v.compare.score, 100)}${v.compare.passed}/${v.compare.total} at least as good${RESET}  ${DIM}(candidate >= reference solution on layout, type scale, motion, polish)${RESET}`);
  }
  else console.log(`  ${DIM}Visual  not scored: pnpm render:contact-sheet --project ${r.project}, then node scripts/eval-visual.mjs --task ${r.task} --project ${r.project}${RESET}`);

  const todo = [];
  for (const e of b.gate.errors) todo.push(`${RED}[gate ${e.code}]${RESET} ${e.message.slice(0, 220)}`);
  for (const c of failed) todo.push(`${YELLOW}[rubric]${RESET} ${c.label} (${c.detail})`);
  for (const w of r.findings.filter((f) => (f.source === "timeline" || f.source === "probe") && f.severity === "warning" && f.code !== "P005").slice(0, 6)) todo.push(`${YELLOW}[${w.code} f${w.frame}]${RESET} ${w.message.slice(0, 200)}`);
  if (todo.length) console.log(`\n  ${DIM}To fix:${RESET}\n${todo.map((t) => `   - ${t}`).join("\n")}`);
  console.log("");
}

export function printLeaderboard(results) {
  const rows = [...results].sort((a, b) => b.score - a.score);
  console.log(`\n${BOLD}==== EVAL LEADERBOARD (${rows.length} project${rows.length === 1 ? "" : "s"}) ====${RESET}`);
  console.log(`  ${"#".padStart(2)} ${"project".padEnd(34)} ${"task".padEnd(20)} ${"score".padStart(5)}  gate craft rubric hyg copy  flags`);
  rows.forEach((r, i) => {
    const b = r.breakdown;
    const tone = r.score >= 90 ? GREEN : r.score >= 60 ? YELLOW : RED;
    console.log(`  ${String(i + 1).padStart(2)} ${r.project.padEnd(34)} ${r.task.padEnd(20)} ${tone}${String(r.score).padStart(5)}${RESET}  ${String(b.gate.score).padStart(4)} ${String(b.craft.score).padStart(5)} ${String(b.rubric.score).padStart(6)} ${String(b.hygiene.score).padStart(3)} ${String(b.copy.score).padStart(4)}${r.tampered ? `  ${RED}TAMPERED${RESET}` : r.capped ? `  ${RED}capped${RESET}` : ""}  ${DIM}${r.flags?.list?.length ? r.flags.list.join(" ") : "none"}${RESET}${r.validForComparison === false ? `  ${RED}NOT VALID FOR COMPARISON${RESET}` : ""}`);
  });
  if (rows.some((r) => r.validForComparison === false)) console.log(`\n  ${RED}${BOLD}Some scores are NOT VALID FOR COMPARISON${RESET}${RED}: they were produced with --dev, --skip-integrity or --no-probe (or without a working browser probe). Re-run without those flags.${RESET}`);
  const byTask = {};
  for (const r of rows) (byTask[r.task] ??= []).push(r.score);
  console.log(`\n  ${DIM}mean by task:${RESET} ${Object.entries(byTask).map(([t, s]) => `${t} ${Math.round(s.reduce((a, b) => a + b, 0) / s.length)}`).join(" | ")}`);
  console.log(`  ${DIM}overall mean:${RESET} ${Math.round(rows.reduce((a, r) => a + r.score, 0) / (rows.length || 1))}\n`);
}

/* ---------- CLI ---------- */

function arg(argv, name) {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  }));
  return out;
}

async function main() {
  const argv = process.argv.slice(2);
  const asJson = argv.includes("--json");
  const write = !argv.includes("--no-write");
  if (argv.includes("--all")) {
    const projectsDir = path.join(rootDir, "src", "projects");
    const picks = fs.existsSync(projectsDir)
      ? fs.readdirSync(projectsDir, { withFileTypes: true })
          .filter((e) => e.isDirectory() && e.name.startsWith("eval-") && fs.existsSync(path.join(projectsDir, e.name, "spec.json")))
          .map((e) => e.name)
          .filter((slug) => { try { return Boolean(readJson(path.join(projectsDir, slug, "spec.json")).evalTask); } catch { return false; } })
      : [];
    if (!picks.length) {
      console.log('No src/projects/eval-* project with "evalTask" in spec.json yet. Create one: pnpm new eval-<task>-<model>');
      return 0;
    }
    const opts = { tasksDir: arg(argv, "--tasks-dir"), render: argv.includes("--render"), skipIntegrity: argv.includes("--skip-integrity"), dev: argv.includes("--dev"), probe: argv.includes("--no-probe") ? false : undefined };
    const results = await mapLimit(picks, 3, (slug) => scoreTarget({ project: slug, ...opts }).catch((e) => { console.error(`${RED}[${slug}]${RESET} ${e.message}`); return null; }));
    const ok = results.filter(Boolean);
    if (write) for (const r of ok) writeResult(r);
    if (write) fs.writeFileSync(path.join(rootDir, "out", "evals", "leaderboard.json"), `${JSON.stringify(ok.map(({ project, task, score, capped, breakdown, flags, validForComparison }) => ({ project, task, score, capped, flags: flags?.list ?? [], validForComparison, gate: breakdown.gate.score, craft: breakdown.craft.score, rubric: breakdown.rubric.score, hygiene: breakdown.hygiene.score, copy: breakdown.copy.score })).sort((a, b) => b.score - a.score), null, 2)}\n`);
    if (asJson) console.log(JSON.stringify(ok, null, 2));
    else printLeaderboard(ok);
    return 0;
  }
  const result = await scoreTarget({ task: arg(argv, "--task"), project: arg(argv, "--project"), dir: arg(argv, "--dir"), tasksDir: arg(argv, "--tasks-dir"), render: argv.includes("--render"), skipIntegrity: argv.includes("--skip-integrity"), dev: argv.includes("--dev"), probe: argv.includes("--no-probe") ? false : undefined });
  const file = write ? writeResult(result) : null;
  if (asJson) console.log(JSON.stringify(result, null, 2));
  else {
    printResult(result);
    if (file) console.log(`${DIM}JSON: ${rel(file)}${RESET}\n`);
  }
  return 0; // the score is the output; use the number, not the exit code
}

const isMain = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  main().then((code) => process.exit(code), (e) => { console.error(`${RED}${BOLD}[EVAL]${RESET} ${e.message}`); process.exit(1); });
}
