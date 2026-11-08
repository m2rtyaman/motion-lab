/**
 * TIMELINE AUDIT (Harness v2) - behavior-based checks.
 *
 * Imports a project's Scene.tsx, calls its exported `buildTimeline(tl)` on a paused GSAP timeline
 * (no rendering) and inspects what the timeline actually does, instead of grepping for keywords.
 *
 * Usage (needs a TS loader):
 *   npx tsx scripts/timeline-audit.mjs [--project <slug>]    audit v2 projects ("harness": 2 in spec.json)
 *   npx tsx scripts/timeline-audit.mjs --dir <path>          audit one folder holding spec.json + Scene.tsx
 *   add --json for machine-readable output: { ok, errors, warnings, findings: [{code, severity, frame, target, message}], allowed, meta }
 *
 * Rules (one line per finding: [T00X] <slug> f<frame> <problem> -> <fix>):
 *   T000 error   buildTimeline missing / throws
 *   T001 error   every spec beat has label `beat:<id>` within +-2 frames of startFrame
 *   T002 error   every beat has >= 1 tween STARTING inside it (no dead beats)
 *   T003 error   hold:start / hold:end exist, hold >= 1.2s, ends <= video end, only camera:drift active inside it
 *   T004 error   nothing ends after the video duration
 *   T005 error   no tween animates width/height/top/left/right/bottom/margin*, padding*
 *   T006 warning < 60% of tweens carry data.preset (raw GSAP is an escape hatch)
 *   T007 warning beat with > 8 tweens starting in it, or two different transition:* presets overlapping
 *   Craft/physics rules (messages teach: what + numbers, the principle, the fix, a docs anchor):
 *   T008 warning entrance with an .in ease / exit with an .out ease
 *   T009 warning peak speed > 30 px/f at 1080p; error > 80 px/f for > 3 frames
 *   T010 warning >= 4 tweens on different targets start within 2 frames, no stagger
 *   T011 warning beats equal length (+-5%), or a beat < 0.6s / > 3.0s (final beat exempt)
 *   T012 warning linear/none ease on a > 0.3s transform/opacity tween (not physics/drift/emphasize/loops)
 *   T013 warning non-camera tween > 1.5s (dead time) or < 3 frames (invisible pop)
 *   T014 error   a selector the timeline targets matches no element in the project's JSX (renamed/typo'd class: nothing would move
 *                on screen); warning when only dynamic classNames could satisfy it. Cannot be suppressed with audit.allow.
 *
 * Suppress an intentional "wrong example" per project in spec.json:
 *   "audit": { "allow": [ { "code": "T012", "reason": "left half is the deliberate wrong example" } ] }
 * (reason >= 15 chars). Suppressed findings print as `[allowed]` one-liners and do not count.
 *
 * DOM stubbing: no DOM is installed. String selectors are resolved through
 * gsap.context(fn, scope) with a fake scope whose querySelectorAll returns cached plain objects
 * (3 per class/tag selector, 1 per #id). The CSS plugin is inert without `window`, so tweens
 * run against plain objects exactly as in scripts/test-presets.mjs.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs, resolveTargets, isHarnessV2 } from "./lib/projects.mjs";
import { collectJsxInventory, matchSelector, suggestNames, selectorIssue } from "./lib/jsx-selectors.mjs";

const RED = "\x1b[31m", GREEN = "\x1b[32m", YELLOW = "\x1b[33m", BOLD = "\x1b[1m", RESET = "\x1b[0m";

const MIN_HOLD_SECONDS = 1.2;
const BEAT_LABEL_TOLERANCE_FRAMES = 2;
const MIN_PRESET_RATIO = 0.6;
const MAX_TWEENS_PER_BEAT = 8;
const LAYOUT_PROP = /^(width|height|top|left|right|bottom|margin|padding)/i;
const MAX_LISTED = 8;

// craft thresholds (measured on 33 real clips, see docs/MOTION_MATH.md sections 6 and 7)
const SPEED_WARN = 30, SPEED_ERR = 80, SPEED_ERR_FRAMES = 3, EASE_FACTOR_CAP = 20;
const SYNC_MIN_TARGETS = 4, SYNC_WINDOW_FRAMES = 2;
const BEAT_EQUAL_TOLERANCE = 0.05, BEAT_MIN_S = 0.6, BEAT_MAX_S = 3.0;
const LINEAR_MAX_S = 0.3, SLOW_TWEEN_S = 1.5, FAST_TWEEN_FRAMES = 3;
const MIN_ALLOW_REASON = 15;
const TRANSFORM_PROPS = /^(x|y|scale|scaleX|scaleY|rotate|rotation|rotateX|rotateY|rotateZ|skewX|skewY|opacity|autoAlpha|filter|xPercent|yPercent)$/;

/** Doc anchors (GitHub slugs of real headings; verified by test-timeline-audit.mjs). */
export const RULE_DOCS = {
  T008: "docs/MOTION_MATH.md#2-easing--velocity-profile",
  T009: "docs/MOTION_MATH.md#6-space",
  T010: "docs/MOTION_MATH.md#4-overlap-stagger-follow-through",
  T011: "docs/MOTION_MATH.md#7-composition--rhythm",
  T012: "docs/MOTION_MATH.md#2-easing--velocity-profile",
  T013: "docs/MOTION_MATH.md#1-time-at-60fps",
};

/* ---------- build the timeline against fake elements ---------- */

function makeScope() {
  const cache = new Map();
  const queried = new Set();
  const fakeEl = (selector) => {
    const el = {
      style: {},
      getBoundingClientRect: () => ({ x: 0, y: 0, top: 0, left: 0, right: 100, bottom: 100, width: 100, height: 100 }),
      getAttribute: () => null,
      setAttribute: () => {},
    };
    Object.defineProperty(el, "__selector", { value: selector, enumerable: false });
    return el;
  };
  return {
    queried,
    querySelectorAll(selector) {
      queried.add(selector);
      if (!cache.has(selector)) {
        const count = selector.trim().startsWith("#") ? 1 : 3;
        cache.set(selector, Array.from({ length: count }, () => fakeEl(selector)));
      }
      return cache.get(selector);
    },
  };
}

async function buildTimeline(scenePath) {
  const mod = await import(pathToFileURL(scenePath).href);
  if (typeof mod.buildTimeline !== "function") {
    return { error: "Scene.tsx does not export buildTimeline", fix: "add: export const buildTimeline = (tl: gsap.core.Timeline) => { ... } and call useRemotionGSAP(buildTimeline)" };
  }
  const { default: gsap } = await import("gsap");
  gsap.config({ nullTargetWarn: false });
  const origWarn = console.warn;
  console.warn = (...a) => {
    if (!/GSAP|Missing plugin|invalid property/i.test(a.join(" "))) origWarn(...a);
  };
  try {
    const tl = gsap.timeline({ paused: true, autoRemoveChildren: false });
    let out;
    const scope = makeScope();
    gsap.context(() => {
      out = mod.buildTimeline(tl);
    }, scope);
    return { tl: out instanceof gsap.core.Timeline ? out : tl, gsap, selectors: [...scope.queried] };
  } catch (e) {
    return { error: `buildTimeline threw: ${e?.message ?? e}`, fix: "keep buildTimeline pure: only tl/preset calls, no DOM, window, Math.random or Date.now" };
  } finally {
    console.warn = origWarn;
  }
}

/* ---------- flatten the timeline into leaf tweens (absolute seconds) ---------- */

function flatten(tl, gsap) {
  const leaves = [];
  const walk = (parent, offset, inheritedPreset) => {
    for (const child of parent.getChildren(false, true, true)) {
      const preset = child.data?.preset ?? inheritedPreset;
      const start = offset + child.startTime();
      if (child instanceof gsap.core.Timeline) {
        walk(child, start, preset);
        continue;
      }
      const infinite = child.vars?.repeat === -1;
      const dur = child.duration();
      const end = infinite ? Infinity : start + child.totalDuration();
      const els = child.targets?.() ?? [];
      const targets = els.map((t) => t?.__selector ?? "object");
      leaves.push({ start, end, dur, preset, infinite, vars: child.vars ?? {}, els, target: [...new Set(targets)].join(",") || "target", repeat: child.vars?.repeat ?? 0 });
    }
  };
  walk(tl, 0, undefined);
  return leaves;
}


/* ---------- craft helpers (T008-T013) ---------- */

const easeCache = new Map();
/** Numeric ease info: fn, peak-velocity factor (multiple of average speed, capped), direction. */
function easeInfo(gsap, ease) {
  if (typeof ease !== "string") return null;
  if (easeCache.has(ease)) return easeCache.get(ease);
  let info = null;
  const fn = gsap.parseEase(ease);
  if (typeof fn === "function") {
    const N = 1000;
    let peak = 0, prev = fn(0);
    for (let i = 1; i <= N; i++) {
      const v = fn(i / N);
      peak = Math.max(peak, (v - prev) * N);
      prev = v;
    }
    const dir = /\.inOut(\(|$)/.test(ease) ? "inOut" : /\.in(\(|$)/.test(ease) ? "in" : /\.out(\(|$)/.test(ease) ? "out" : /^(none|linear)/.test(ease) ? "linear" : "other";
    info = { fn, factor: Math.min(peak, EASE_FACTOR_CAP), dir };
  }
  easeCache.set(ease, info);
  return info;
}

const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const fmtDur = (t, fps) => `${t.dur.toFixed(2)}s/${Math.round(t.dur * fps)}f`;
const VALUE_PROPS = ["x", "y", "opacity", "scale"];
const DEFAULT_OF = { x: 0, y: 0, opacity: 1, scale: 1 };

/** Per tween from/to for numeric x/y/opacity/scale, tracking prior state per target+prop (sorted by start). */
function resolveValues(tweens) {
  const state = new Map();
  for (const t of [...tweens].sort((a, b) => a.start - b.start)) {
    const v = t.vars, from = v.startAt ?? {}, vals = {};
    for (const key of VALUE_PROPS) {
      const sk = `${t.target}|${key}`;
      const given = v[key];
      if (v.runBackwards) {
        // tl.from(): vars hold the START values; the tween ends at the current state
        const fv = num(given);
        if (fv === null) continue;
        const end = state.get(sk) ?? DEFAULT_OF[key];
        vals[key] = { from: fv, to: end };
        state.set(sk, end);
        continue;
      }
      if (given === undefined) { if (num(from[key]) !== null) state.set(sk, num(from[key])); continue; }
      const end = num(given);
      if (end === null) { state.delete(sk); continue; } // relative / function / string value: unknown
      vals[key] = { from: num(from[key]) ?? state.get(sk) ?? DEFAULT_OF[key], to: end };
      state.set(sk, end);
    }
    t.vals = vals;
  }
}

function craftChecks({ fps, spec, gsap, moving, beats, add }) {
  const toF = (s) => Math.round(s * fps);
  // Scenes are authored at 1080 on the short side for every aspect (9:16 = 1080x1920, 16:9 = 1920x1080, 1:1 = 1080x1080).
  const [aw, ah] = String(spec.aspect ?? "16:9").split(":").map(Number);
  const authoredShort = 1080;
  const pxScale = 1080 / (aw > 0 && ah > 0 ? authoredShort : 1080);
  const pre = (t, p) => t.preset?.startsWith(p);
  resolveValues(moving);

  // T008 ease direction
  for (const t of moving) {
    if (pre(t, "transition:") || pre(t, "emphasize:")) continue; // curated recipe internals (fades inside iris/glint recipes)
    const info = easeInfo(gsap, t.vars.ease);
    if (!info || (info.dir !== "in" && info.dir !== "out")) continue;
    const o = t.vals.opacity, sc = t.vals.scale;
    const entrance = pre(t, "enter:") || (o && o.from <= 0.01 && o.to >= 0.99) || (sc && sc.from < 0.5 && sc.to > sc.from);
    const exiting = pre(t, "exit:") || (o && o.to <= 0.01 && o.from >= 0.5);
    if (entrance && !exiting && info.dir === "in")
      add("T008", "warning", toF(t.start), `entrance on ${t.target} uses ease "${t.vars.ease}" over ${fmtDur(t, fps)}: .in starts slow and peaks on the last frame, so it slams to a stop`, `things arriving decelerate: use ".out" (e.g. "expo.out" = EASING.expoOut) or enter(tl, sel, 'rise', at)`, RULE_DOCS.T008, t.target);
    if (exiting && !entrance && info.dir === "out")
      add("T008", "warning", toF(t.start), `exit on ${t.target} uses ease "${t.vars.ease}" over ${fmtDur(t, fps)}: .out leaves at full speed then lingers half-visible`, `things leaving accelerate: use ".in" (e.g. "power2.in" = EASING.quickIn) or exit(tl, sel, 'sink', at)`, RULE_DOCS.T008, t.target);
  }

  // T009 speed
  for (const t of moving) {
    if (t.preset === "emphasize:glint") continue; // a specular light sweep is not a solid body, it cannot strobe
    const dx = t.vals.x ? Math.abs(t.vals.x.to - t.vals.x.from) : 0;
    const dy = t.vals.y ? Math.abs(t.vals.y.to - t.vals.y.from) : 0;
    const dist = Math.hypot(dx, dy) * pxScale;
    if (dist === 0) continue;
    const info = easeInfo(gsap, t.vars.ease ?? "power1.out") ?? { fn: (p) => p, factor: 3, dir: "other" };
    const frames = Math.max(1, Math.round(t.dur * fps));
    const peak = (dist / frames) * info.factor;
    if (peak <= SPEED_WARN) continue;
    let over = 0;
    for (let k = 0; k < frames; k++) if ((info.fn((k + 1) / frames) - info.fn(k / frames)) * dist > SPEED_ERR) over++;
    const needFrames = Math.ceil((dist * info.factor) / SPEED_WARN);
    const base = `${t.preset ? `${t.preset} ` : ""}tween on ${t.target} moves ${Math.round(dist)}px in ${frames}f (${t.vars.ease ?? "default ease"}, peak x${info.factor.toFixed(1)}) = peak ${Math.round(peak)} px/f`;
    const fix = `${needFrames <= 60 ? `lengthen it to >= ${needFrames}f (${(needFrames / fps).toFixed(2)}s), or ` : "split the move into shorter legs, "}shorten the travel, or use a softer ease (sine.inOut peaks 1.6x, power2.out 3x, expo.out 6.9x); a deliberate impact may exceed 80 px/f for <= 3 frames`;
    if (peak > SPEED_ERR && over > SPEED_ERR_FRAMES)
      add("T009", "error", toF(t.start), `${base}, above 80 px/f for ${over} frames: the object strobes across the frame (comfortable peak <= 30 px/f, impacts <= 80 px/f for <= 3 frames)`, fix, RULE_DOCS.T009, t.target);
    else
      add("T009", "warning", toF(t.start), `${base}: above the 30 px/f comfortable peak, so it reads as a jump (speed = distance / frames x ease peak factor)`, fix, RULE_DOCS.T009, t.target);
  }

  // T010 everything at once
  const starters = moving
    .filter((t) => !t.vars.stagger && !pre(t, "transition:") && !pre(t, "physics:") && !pre(t, "camera:") && !pre(t, "emphasize:"))
    .sort((a, b) => a.start - b.start);
  for (let i = 0; i < starters.length; ) {
    const f0 = starters[i].start * fps;
    const grp = starters.filter((t) => t.start * fps >= f0 - 1e-6 && t.start * fps <= f0 + SYNC_WINDOW_FRAMES + 1e-6);
    const targets = [...new Set(grp.map((t) => t.target))];
    if (targets.length >= SYNC_MIN_TARGETS) {
      add("T010", "warning", toF(starters[i].start), `${targets.length} tweens on different targets (${targets.slice(0, 4).join(", ")}${targets.length > 4 ? ", ..." : ""}) all start within ${SYNC_WINDOW_FRAMES} frames of f${toF(starters[i].start)}: everything arrives at once and the eye has no lead`, "offset the starts 2-6f (0.03-0.1s) in reading order, or use one group selector with enter(tl, '.items', 'stagger', at, { stagger: 'normal' }); see the stagger section", RULE_DOCS.T010, targets.join(","));
      i += grp.length;
    } else i++;
  }

  // T011 rhythm
  if (beats.length) {
    const lens = beats.map((b) => b.endFrame - b.startFrame + 1);
    if (lens.length >= 3) {
      const mean = lens.reduce((a, b) => a + b, 0) / lens.length;
      if (lens.every((l) => Math.abs(l - mean) <= mean * BEAT_EQUAL_TOLERANCE))
        add("T011", "warning", beats[0].startFrame, `all ${lens.length} beats are ${lens.join("/")}f (within +-5% of ${Math.round(mean)}f): a metronome reads as a slideshow`, "vary lengths, e.g. 1.0s / 1.6s / 1.2s and a longer final beat (sigma > 14f); edit beats in spec.json and the beat() times", RULE_DOCS.T011, "beats");
    }
    beats.forEach((b, i) => {
      if (i === beats.length - 1) return; // the final beat carries the 1.2s hold
      const n = b.endFrame - b.startFrame + 1, s = n / fps;
      if (s < BEAT_MIN_S) add("T011", "warning", b.startFrame, `beat "${b.id}" lasts ${s.toFixed(2)}s (${n}f), under ${BEAT_MIN_S}s: too short to read before the next change`, "give it 0.8-1.6s (48-96f) or merge it into the neighbouring beat", RULE_DOCS.T011, b.id);
      if (s > BEAT_MAX_S) add("T011", "warning", b.startFrame, `beat "${b.id}" lasts ${s.toFixed(2)}s (${n}f), over ${BEAT_MAX_S}s: nothing changes for too long`, "split it at ~1.0-1.5s with a new focus, camera or depth change, e.g. camera(tl, sel, 'pushIn', at)", RULE_DOCS.T011, b.id);
    });
  }

  // T012 robotic linear
  for (const t of moving) {
    const ease = t.vars.ease;
    if (typeof ease !== "string" || !/^(linear|none)(\(|\.|$)/.test(ease)) continue;
    if (t.dur <= LINEAR_MAX_S || t.infinite || t.repeat) continue;
    if (pre(t, "physics:") || t.preset === "camera:drift" || pre(t, "emphasize:")) continue;
    if (!Object.keys(t.vars).some((k) => TRANSFORM_PROPS.test(k))) continue;
    add("T012", "warning", toF(t.start), `tween on ${t.target} uses "${ease}" for ${fmtDur(t, fps)} on transform/opacity: constant speed starts and stops instantly, which nothing physical does`, `use an eased curve ("expo.out"/"power2.out" arrivals, "power2.in" exits, "sine.inOut" A-to-B) or a physics helper from src/core/physics.ts; linear is for loops only`, RULE_DOCS.T012, t.target);
  }

  // T013 duration sanity
  for (const t of moving) {
    if (pre(t, "camera:") || pre(t, "physics:") || pre(t, "transition:")) continue;
    const frames = t.dur * fps;
    if (t.dur > SLOW_TWEEN_S && !t.infinite && !t.repeat)
      add("T013", "warning", toF(t.start), `tween on ${t.target} lasts ${t.dur.toFixed(2)}s (${Math.round(frames)}f): a slow fade/float reads as dead time (single motions take 0.25-0.5s, hero up to ~1.0s)`, "shorten to DURATIONS.panel (0.45s) or DURATIONS.camera (0.65s), or split it into overlapping steps", RULE_DOCS.T013, t.target);
    else if (frames < FAST_TWEEN_FRAMES - 1e-6)
      add("T013", "warning", toF(t.start), `tween on ${t.target} lasts ${t.dur.toFixed(3)}s (${frames.toFixed(1)}f), under ${FAST_TWEEN_FRAMES} frames: it pops invisibly between two frames`, "use at least 3 frames (0.05s), typically DURATIONS.instant (0.12s) or DURATIONS.micro (0.2s)", RULE_DOCS.T013, t.target);
  }
}

/** Splits findings into reported vs allowed via spec.audit.allow; malformed entries become T000 errors. */
function applyAllow(slug, spec, findings) {
  const allow = spec.audit?.allow;
  if (allow === undefined) return { reported: findings, allowed: [] };
  const bad = [];
  if (!Array.isArray(allow)) bad.push("audit.allow must be an array");
  const list = Array.isArray(allow) ? allow : [];
  const valid = new Map();
  list.forEach((a, i) => {
    if (!a || !/^T\d{3}$/.test(a.code ?? "") || a.code === "T000" || a.code === "T014") bad.push(`audit.allow[${i}].code must look like "T012" (T000 and T014 cannot be allowed)`);
    else if (typeof a.reason !== "string" || a.reason.trim().length < MIN_ALLOW_REASON) bad.push(`audit.allow[${i}] (${a.code}) needs a reason of >= ${MIN_ALLOW_REASON} chars`);
    else valid.set(a.code, a.reason.trim());
  });
  const allowed = [], reported = [];
  // audit.allow only ever suppresses WARNINGS: an error is never suppressible (it stays reported, with a note)
  for (const f of findings) {
    if (!valid.has(f.code)) reported.push(f);
    else if (f.level === "warning") allowed.push({ ...f, reason: valid.get(f.code) });
    else reported.push({ ...f, problem: `${f.problem} [allow ignored for error code ${f.code}]` });
  }
  for (const b of bad) reported.push({ code: "T000", level: "error", slug, frame: 0, problem: `invalid spec.json ${b}`, fix: 'use "audit": { "allow": [ { "code": "T012", "reason": "<why this is intentional, >= 15 chars>" } ] }' });
  return { reported, allowed };
}


/* ---------- behavior trace (meta only: what the clip DOES, for scripts/eval-score.mjs behavior checks) ---------- */

const MOTION_EPS = 0.15; // px per frame below which a frame counts as standing still
const RUN_PLATEAU_FRAMES = 3; // this many still frames split a run in two
const MIN_RUN_PX = 2;
const round1 = (v) => Math.round(v * 10) / 10;

/** Splits a per-frame series into monotone runs [fromFrame, toFrame, delta]; a direction change or a >= 3 frame plateau starts a new run. */
export function runsOf(vals) {
  const runs = [];
  let cur = null, still = 0;
  for (let f = 1; f < vals.length; f++) {
    const d = vals[f] - vals[f - 1];
    const sign = d > MOTION_EPS ? 1 : d < -MOTION_EPS ? -1 : 0;
    if (sign === 0) {
      if (cur && ++still >= RUN_PLATEAU_FRAMES) { runs.push(cur); cur = null; }
      continue;
    }
    still = 0;
    if (cur && cur.sign !== sign) { runs.push(cur); cur = null; }
    if (!cur) cur = { sign, from: f - 1, to: f };
    cur.to = f;
  }
  if (cur) runs.push(cur);
  return runs.map((r) => ({ from: r.from, to: r.to, delta: vals[r.to] - vals[r.from] })).filter((r) => Math.abs(r.delta) >= MIN_RUN_PX);
}

/** A big move preceded (within 6 f, wind-up <= 0.5 s) by a small opposite move: that is anticipation. */
export function windupsOf(runs, fps) {
  const out = [];
  runs.forEach((r, k) => {
    const prev = runs[k - 1];
    if (!prev || Math.abs(r.delta) < 40 || Math.sign(prev.delta) === Math.sign(r.delta)) return;
    const small = Math.abs(prev.delta);
    if (small >= 8 && small <= 0.5 * Math.abs(r.delta) && r.from - prev.to <= 6 && prev.to - prev.from <= 0.5 * fps)
      out.push({ windupFrom: prev.from, windupDelta: round1(prev.delta), mainFrom: r.from, mainTo: r.to, mainDelta: round1(r.delta) });
  });
  return out;
}

/** Seeks the (already audited) timeline frame by frame and summarises per target: net travel, runs, bounce apex heights, squash range. */
function traceMotion({ tl, tweens, fps, total, holdStart }) {
  const els = new Map(), presets = new Map();
  for (const t of tweens)
    for (const el of t.els) {
      const sel = el?.__selector;
      if (!sel) continue;
      if (!els.has(sel)) els.set(sel, el);
      if (t.preset) (presets.get(sel) ?? presets.set(sel, new Set()).get(sel)).add(t.preset);
    }
  const keys = ["x", "y", "scaleX", "scaleY", "scale", "opacity", "autoAlpha"];
  const series = new Map([...els.keys()].map((sel) => [sel, Object.fromEntries(keys.map((k) => [k, []]))]));
  const holdFrame = holdStart === undefined ? -1 : Math.round(holdStart * fps);
  const holdState = {}, holdEndState = {};
  tl.pause();
  const origWarn = console.warn;
  console.warn = () => {}; // GSAP complains that the CSS plugin is missing for plain-object targets
  try {
  for (let f = 0; f <= total; f++) {
    tl.time(f === 0 ? 0.00001 : f / fps, true);
    for (const [sel, el] of els) {
      const ser = series.get(sel);
      for (const k of keys) {
        const v = Number.parseFloat(el[k]); // GSAP writes relative ("+=...") results onto plain objects as strings
        ser[k].push(Number.isFinite(v) ? v : k === "x" || k === "y" ? 0 : 1);
      }
      if (f === holdFrame || f === total) {
        const st = {};
        for (const k of ["opacity", "autoAlpha", "scale", "scaleX", "scaleY", "x", "y"]) if (Number.isFinite(Number.parseFloat(el[k]))) st[k] = Math.round(Number.parseFloat(el[k]) * 1000) / 1000;
        for (const k of ["display", "visibility"]) if (typeof el[k] === "string") st[k] = el[k];
        if (Object.keys(st).length) (f === holdFrame ? holdState : holdEndState)[sel] = st;
      }
    }
  }
  } finally {
    console.warn = origWarn;
  }
  tl.time(0, true);
  const motion = {}, windups = [];
  for (const [sel, ser] of series) {
    const range = (a) => (a.length ? Math.max(...a) - Math.min(...a) : 0);
    if (range(ser.x) < 1 && range(ser.y) < 1 && range(ser.scaleY) < 0.02) continue;
    const info = { presets: [...(presets.get(sel) ?? [])] };
    for (const axis of ["x", "y"]) {
      const a = ser[axis];
      if (range(a) < 1) continue;
      const runs = runsOf(a);
      info[axis] = { start: round1(a[0]), end: round1(a[a.length - 1]), net: round1(a[a.length - 1] - a[0]), min: round1(Math.min(...a)), max: round1(Math.max(...a)), runs: runs.slice(0, 40).map((r) => [r.from, r.to, round1(r.delta)]) };
      for (const w of windupsOf(runs, fps)) windups.push({ target: sel, axis, ...w });
    }
    if (info.y) {
      // apex heights (px above the lowest ground contact): the start of a first falling run, then the end of every rising run
      const runs = runsOf(ser.y), heights = [];
      const first = runs[0];
      if (first && first.delta > 0 && -ser.y[first.from] >= 12) heights.push(round1(-ser.y[first.from]));
      for (const r of runs) if (r.delta < 0 && -ser.y[r.to] >= 12) heights.push(round1(-ser.y[r.to]));
      info.heights = heights;
    }
    info.scaleY = { min: round1(Math.min(...ser.scaleY) * 1000) / 1000, max: round1(Math.max(...ser.scaleY) * 1000) / 1000 };
    motion[sel] = info;
  }
  return { motion, windups, holdState, holdEndState };
}

/* ---------- checks ---------- */

/** Fix hint for a tween that is still moving during the final hold (T003): numbers first, no suggestion that cannot fit. */
function holdFix(t, hs, total, fps) {
  const driftFits = total / fps - hs >= 2.4 - 1e-6; // camera:drift lasts 2.4 s and must also end before the video does (T004)
  const endS = t.end === Infinity ? null : t.end;
  const need = endS === null ? "use a finite repeat that ends" : `end it by hold:start (${hs.toFixed(2)}s); it ends at ${endS.toFixed(2)}s, so start it ${(endS - hs).toFixed(2)}s earlier or shorten it by that much`;
  return `${need}. Only camera:drift may run inside the hold${driftFits ? "" : ` and it does not fit here (2.4s drift, ${(total / fps - hs).toFixed(2)}s of hold)`}; to keep a pose alive BEFORE the hold schedule movingHold(tl, el, at, { seconds }) from physics.ts so that at + seconds <= ${hs.toFixed(2)}`;
}

const RIG_PRESET = /^physics:(rig\w*|lookAt|react|idleBreath|turn)$/;

/** Properties whose instant change inside the final hold would show, hide or move the closing content. */
const HOLD_INSTANT_PROPS = /^(opacity|autoAlpha|alpha|visibility|display|x|y|z|xPercent|yPercent|left|top|right|bottom|translate\w*|scale\w*|rotat\w*|skew\w*|clip\w*|zIndex|width|height|filter|transform|position|mask\w*)$/;

function auditTimeline({ slug, spec, tl, gsap, meta = {}, selectors = [], sceneDir }) {
  const fps = Number(spec.fps) || 60;
  const total = Math.round((Number(spec.durationInSeconds) || 0) * fps);
  const toF = (s) => Math.round(s * fps);
  const findings = [];
  const add = (code, level, frame, problem, fix, doc, target) => findings.push({ code, level, slug, frame, problem, fix, doc, target });
  const tweens = flatten(tl, gsap);
  const moving = tweens.filter((t) => t.dur > 0);
  const labels = tl.labels ?? {};
  const beats = Array.isArray(spec.beats) ? spec.beats : [];

  // T001 + T002 + T007(busy)
  for (const b of beats) {
    const key = `beat:${b.id}`;
    if (!(key in labels)) {
      add("T001", "error", b.startFrame, `beat "${b.id}" has no label ${key}`, `add beat(tl, '${b.id}', ${(b.startFrame / fps).toFixed(3)}) at the start of the beat`);
    } else {
      const lf = toF(labels[key]);
      if (Math.abs(lf - b.startFrame) > BEAT_LABEL_TOLERANCE_FRAMES)
        add("T001", "error", lf, `label ${key} is at f${lf} but spec startFrame is f${b.startFrame}`, `move it to ${(b.startFrame / fps).toFixed(3)}s (frame ${b.startFrame}) or fix spec.json`);
    }
    const inBeat = moving.filter((t) => t.start * fps >= b.startFrame - 0.5 && t.start * fps <= b.endFrame + 0.5);
    if (inBeat.length === 0)
      add("T002", "error", b.startFrame, `dead beat "${b.id}" (f${b.startFrame}-f${b.endFrame}): no tween starts inside it`, `add an enter/emphasize/camera preset between ${(b.startFrame / fps).toFixed(2)}s and ${(b.endFrame / fps).toFixed(2)}s`, undefined, `beat:${b.id}`);
    // physics helpers emit several tweens for ONE move (arcMove = x + y, bounce = y + scale + travel): count a move once
    // rig helpers (rigWalk, lookAt, react, idleBreath, turn) drive 14-18 joints with staggered starts: one call = one move.
    // Calls are not tagged individually, so tweens of the same rig preset whose time spans overlap are one call.
    const rigKey = new Map();
    {
      const byPreset = new Map();
      inBeat.forEach((t) => { if (RIG_PRESET.test(t.preset ?? "")) (byPreset.get(t.preset) ?? byPreset.set(t.preset, []).get(t.preset)).push(t); });
      for (const [preset, list] of byPreset) {
        list.sort((a, c) => a.start - c.start);
        let n = 0, clusterEnd = -Infinity;
        for (const t of list) {
          if (t.start >= clusterEnd - 1e-6) n++;
          clusterEnd = Math.max(clusterEnd === -Infinity ? 0 : clusterEnd, t.end === Infinity ? 1e9 : t.end);
          rigKey.set(t, `${preset}#${n}`);
        }
      }
    }
    const moves = new Set(inBeat.map((t, i) => rigKey.get(t) ?? (t.preset?.startsWith("physics:") ? `${t.preset}|${t.target}|${t.start.toFixed(3)}` : `#${i}`)));
    if (moves.size > MAX_TWEENS_PER_BEAT) {
      const physicsShare = inBeat.filter((t) => t.preset?.startsWith("physics:")).length / inBeat.length;
      add("T007", "warning", b.startFrame, `beat "${b.id}" starts ${moves.size} separate moves (> ${MAX_TWEENS_PER_BEAT}${moves.size < inBeat.length ? `; ${inBeat.length} tweens, an arcMove/bounce counts once` : ""}), too busy`,
        physicsShare >= 0.5
          ? "offset the starts of the per-element physics/arc moves by 2-6f in reading order, or split the beat in two at a natural pause (new beat id in spec.json + beat() call)"
          : "cut elements, group entrances with one stagger preset (enter(tl, '.items', 'stagger', at)), or split the beat in two at a natural pause", undefined, `beat:${b.id}`);
    }
  }

  // T003
  const hs = labels["hold:start"], he = labels["hold:end"];
  if (hs === undefined || he === undefined) {
    add("T003", "error", total, "missing hold:start / hold:end labels", `call holdFinal(tl, ${(Math.max(0, total / fps - MIN_HOLD_SECONDS)).toFixed(2)}) so the last ${MIN_HOLD_SECONDS}s is still`);
  } else {
    const holdFrames = toF(he) - toF(hs);
    const minFrames = Math.ceil(MIN_HOLD_SECONDS * fps - 1e-9);
    if (holdFrames < minFrames)
      add("T003", "error", toF(hs), `hold is ${holdFrames} frames, needs >= ${minFrames} (${MIN_HOLD_SECONDS}s)`, `start the hold at or before ${((total - minFrames) / fps).toFixed(2)}s: holdFinal(tl, <at>, ${MIN_HOLD_SECONDS})`);
    if (he * fps > total + 0.5)
      add("T003", "error", toF(he), `hold ends at f${toF(he)}, after the video end (f${total})`, `move holdFinal earlier so hold:end <= ${(total / fps).toFixed(2)}s`);
    // zero-duration tweens (tl.set, duration: 0) are not "moving", but a set inside the hold can flip the closing content on at the very end (text on the last frame only)
    // or hide/move it: any instant change of opacity/visibility/display/position at or after hold:start is an error
    for (const t of tweens) {
      if (t.dur > 0 || t.start < hs - 1e-6) continue;
      const keys = [...Object.keys(t.vars), ...Object.keys(t.vars.css ?? {}), ...Object.keys(t.vars.startAt ?? {})];
      const hit = [...new Set(keys.filter((k) => HOLD_INSTANT_PROPS.test(k)))];
      if (hit.length)
        add("T003", "error", toF(t.start), `zero-duration tween (tl.set) on ${t.target} changes ${hit.join(", ")} at f${toF(t.start)}, inside the final hold`, `the hold must be still: apply the change BEFORE hold:start (${hs.toFixed(2)}s) with an enter/exit preset that finishes earlier, not with tl.set during the hold`, undefined, t.target);
    }
    for (const t of moving) {
      if (t.start < he - 1e-6 && t.end > hs + 1e-6 && t.preset !== "camera:drift")
        add("T003", "error", toF(Math.max(t.start, hs)), `tween on ${t.target}${t.preset ? ` (${t.preset})` : ""} is active during the final hold (f${toF(t.start)}-f${t.end === Infinity ? "inf" : toF(t.end)})`, holdFix(t, hs, total, fps), undefined, t.target);
    }
  }

  // T004
  for (const t of tweens) {
    if (t.end * fps > total + 0.5)
      add("T004", "error", toF(t.start), t.infinite ? `tween on ${t.target} repeats forever` : `tween on ${t.target} ends at f${toF(t.end)}, after the video end (f${total})`, t.infinite ? "use a finite repeat count that ends before the video does" : "start it earlier or shorten it so it ends by the last frame", undefined, t.target);
  }
  if (tl.duration() * fps > total + 0.5 && !findings.some((f) => f.code === "T004"))
    add("T004", "error", total, `timeline lasts until f${toF(tl.duration())}, after the video end (f${total})`, "remove tweens/labels/pauses placed past the end");

  // T005
  for (const t of tweens) {
    const keys = [...Object.keys(t.vars), ...Object.keys(t.vars.startAt ?? {}), ...Object.keys(t.vars.css ?? {})];
    const bad = [...new Set(keys.filter((k) => LAYOUT_PROP.test(k)))];
    if (bad.length)
      add("T005", "error", toF(t.start), `tween on ${t.target} animates layout prop ${bad.join(", ")}`, "animate x, y, scale, rotate, opacity or filter instead (use FLIP/scale for resizing)", undefined, t.target);
  }

  // T006
  const raw = tweens.filter((t) => !t.preset);
  if (tweens.length > 0 && (tweens.length - raw.length) / tweens.length < MIN_PRESET_RATIO) {
    const pct = Math.round(((tweens.length - raw.length) / tweens.length) * 100);
    const list = raw.slice(0, MAX_LISTED).map((t) => `f${toF(t.start)} ${t.target}`).join("; ");
    add("T006", "warning", raw.length ? toF(raw[0].start) : 0, `only ${pct}% of ${tweens.length} tweens use presets (need ${MIN_PRESET_RATIO * 100}%); raw: ${list}${raw.length > MAX_LISTED ? `; +${raw.length - MAX_LISTED} more` : ""}`, "replace raw tl.to/from calls with enter/exit/emphasize/camera/transition from src/core/presets.ts");
  }

  // T007 transitions overlapping (different transition:* presets)
  const trans = moving.filter((t) => t.preset?.startsWith("transition:"));
  const reported = new Set();
  for (let i = 0; i < trans.length; i++)
    for (let j = i + 1; j < trans.length; j++) {
      const a = trans[i], b = trans[j];
      if (a.preset === b.preset) continue; // one call emits several tweens that overlap by design
      if (a.start < b.end - 1e-6 && b.start < a.end - 1e-6) {
        const key = [a.preset, b.preset].sort().join("|");
        if (reported.has(key)) continue;
        reported.add(key);
        add("T007", "warning", toF(Math.max(a.start, b.start)), `${a.preset} overlaps ${b.preset}`, "space transitions so only one runs at a time");
      }
    }

  craftChecks({ fps, spec, gsap, moving, beats, add });

  // T014 selector reality check: every selector the timeline targets must exist in the JSX
  meta.selectors = selectors;
  if (sceneDir && selectors.length) {
    const inv = collectJsxInventory(sceneDir);
    meta.selectorStatus = {};
    for (const sel of selectors) {
      const issue = selectorIssue(sel);
      const res = issue ? "none" : inv.parsedFiles ? matchSelector(sel, inv) : "maybe";
      meta.selectorStatus[sel] = res;
      if (res === "match") continue;
      const first = tweens.filter((t) => t.target.split(",").includes(sel)).sort((a, b) => a.start - b.start)[0];
      const frame = first ? toF(first.start) : 0;
      const known = [...inv.classes].slice(0, 12).map((c) => `.${c}`).join(" ") || "none";
      if (issue) add("T014", "error", frame, `selector "${sel}" is not a plain class/id selector (${issue})`, "use plain class/id selectors (.name, #id, .a .b) that match a static className or id in the JSX", undefined, sel);
      else if (res === "none")
        add("T014", "error", frame, `selector "${sel}" matches no element in the JSX (rendered classNames: ${known}; closest: ${suggestNames(sel, inv).join(" ") || "none"}), so this tween animates nothing on screen`, `give an element className="${(sel.match(/\.([\w-]+)/) ?? [])[1] ?? "name"}" in Scene.tsx, or point the tween at a class/id that exists`, undefined, sel);
      else
        add("T014", "warning", frame, `selector "${sel}" cannot be verified: the JSX has dynamic className/props that might provide it`, "use a static className string for elements the timeline animates so the audit can prove they exist", undefined, sel);
    }
  }

  const presetCounts = {};
  for (const t of tweens) if (t.preset) presetCounts[t.preset] = (presetCounts[t.preset] ?? 0) + 1;
  Object.assign(meta, {
    fps,
    totalFrames: total,
    tweenCount: tweens.length,
    presetTweenCount: tweens.length - raw.length,
    rawTweenCount: raw.length,
    presetRatio: tweens.length ? (tweens.length - raw.length) / tweens.length : 0,
    presetCounts,
    onsetFrames: [...new Set(moving.filter((t) => t.preset?.startsWith("enter:")).map((t) => toF(t.start)))].sort((a, b) => a - b),
    hasHold: hs !== undefined && he !== undefined,
    holdFrames: hs !== undefined && he !== undefined ? toF(he) - toF(hs) : 0,
  });
  // behavior summary for eval-score (never throws: a trace failure must not break the audit)
  try {
    const [aw, ah] = String(spec.aspect ?? "16:9").split(":").map(Number);
    meta.frame = aw > ah ? { width: 1920, height: 1080 } : aw < ah ? { width: 1080, height: 1920 } : { width: 1080, height: 1080 };
    const physics = new Map();
    for (const t of moving) if (t.preset?.startsWith("physics:")) physics.set(`${t.preset}|${t.target}|${t.start.toFixed(3)}`, { preset: t.preset, target: t.target, startFrame: toF(t.start), endFrame: t.end === Infinity ? null : toF(t.end) });
    meta.physicsMoves = [...physics.values()].sort((a, b) => a.startFrame - b.startFrame);
    Object.assign(meta, traceMotion({ tl, tweens, fps, total, holdStart: hs }));
  } catch (e) {
    meta.traceError = String(e?.message ?? e);
  }
  return findings;
}

/* ---------- driver ---------- */

export async function auditProject({ slug, specPath, scenePath }) {
  let spec;
  try {
    spec = JSON.parse(fs.readFileSync(specPath, "utf-8").replace(/^﻿/, ""));
  } catch (e) {
    return [{ code: "T000", level: "error", slug, frame: 0, problem: `cannot read spec.json: ${e.message}`, fix: "fix spec.json" }];
  }
  if (!fs.existsSync(scenePath)) return [{ code: "T000", level: "error", slug, frame: 0, problem: "Scene.tsx not found", fix: "create Scene.tsx" }];
  let built;
  try {
    built = await buildTimeline(scenePath);
  } catch (e) {
    built = { error: `Scene.tsx failed to import: ${e?.message ?? e}`, fix: "fix the import/syntax error; Scene.tsx must be importable in Node" };
  }
  if (built.error) return [{ code: "T000", level: "error", slug, frame: 0, problem: built.error, fix: built.fix }];
  const meta = {};
  const { reported, allowed } = applyAllow(slug, spec, auditTimeline({ slug, spec, tl: built.tl, gsap: built.gsap, meta, selectors: built.selectors, sceneDir: path.dirname(scenePath) }));
  reported.allowed = allowed;
  reported.meta = meta;
  return reported;
}

/** --json: machine-readable result on stdout (no colors), same exit code as the human run (1 when any error). */
async function mainJson(jobs) {
  const findings = [], allowed = [], meta = {};
  const toJson = (f, extra = {}) => ({ code: f.code, severity: f.level, frame: f.frame ?? null, target: f.target ?? null, message: f.fix ? `${f.problem} -> ${f.fix}` : f.problem, project: f.slug, ...extra });
  for (const job of jobs) {
    const res = await auditProject(job);
    for (const f of [...res].sort((a, b) => a.frame - b.frame)) findings.push(toJson(f));
    for (const f of res.allowed ?? []) allowed.push(toJson(f, { reason: f.reason }));
    meta[job.slug] = res.meta ?? {};
  }
  const errors = findings.filter((f) => f.severity === "error").length;
  process.stdout.write(`${JSON.stringify({ tool: "timeline-audit", ok: errors === 0, errors, warnings: findings.length - errors, findings, allowed, meta }, null, 2)}\n`);
  return errors ? 1 : 0;
}

async function main() {
  const argv = process.argv.slice(2);
  const dirIdx = argv.indexOf("--dir");
  let jobs;
  if (dirIdx >= 0) {
    const dir = path.resolve(process.cwd(), argv[dirIdx + 1] ?? "");
    jobs = [{ slug: path.basename(dir), specPath: path.join(dir, "spec.json"), scenePath: path.join(dir, "Scene.tsx") }];
  } else {
    jobs = resolveTargets(parseArgs(argv))
      .filter((t) => isHarnessV2(t))
      .map((t) => ({ slug: t.slug, specPath: t.spec, scenePath: t.scene }));
  }

  if (argv.includes("--json")) return mainJson(jobs);
  console.log(`\n${BOLD}==== TIMELINE AUDIT (${jobs.length} harness-v2 project${jobs.length === 1 ? "" : "s"}) ====${RESET}`);
  if (jobs.length === 0) {
    console.log(`${GREEN}${BOLD}[TIMELINE: SKIPPED]${RESET} no project opts in with "harness": 2.\n`);
    return 0;
  }
  let errors = 0, warnings = 0;
  for (const job of jobs) {
    const findings = await auditProject(job);
    const allowed = findings.allowed ?? [];
    for (const f of [...findings].sort((a, b) => a.frame - b.frame)) {
      const isErr = f.level === "error";
      isErr ? errors++ : warnings++;
      console.log(`${isErr ? RED : YELLOW}[${f.code}${isErr ? "" : " warning"}]${RESET} ${f.slug} f${f.frame} ${f.problem} → ${f.fix}${f.doc ? ` See ${f.doc}` : ""}`);
    }
    for (const f of allowed) console.log(`${GREEN}[allowed]${RESET} ${f.code} ${f.slug} f${f.frame} ${f.problem.slice(0, 90)}... (reason: ${f.reason})`);
    if (!findings.length) console.log(`${GREEN}[ok]${RESET} ${job.slug}${allowed.length ? ` (${allowed.length} allowed)` : ""}`);
  }
  if (errors) {
    console.log(`\n${RED}${BOLD}[TIMELINE: FAILED]${RESET} ${errors} error(s), ${warnings} warning(s).\n`);
    return 1;
  }
  console.log(`\n${GREEN}${BOLD}[TIMELINE: CLEAN]${RESET} ${warnings} warning(s).\n`);
  return 0;
}

const isMain = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  main().then((code) => process.exit(code), (e) => { console.error(e); process.exit(1); });
}
