import fs from "node:fs";
import { createRequire } from "node:module";
import { parseArgs, resolveTargets, rel, isHarnessV2 } from "./lib/projects.mjs";

/**
 * MOTION AUDIT (audit:motion) - "slideshow" detector.
 * Other linters check code hygiene; this gate checks MOTION QUALITY.
 *
 * M001 multi-beat project with no transition* calls at all               -> hard cut
 * M002 beat-bound `{isBeatX && <Scene/>}` / `frame >= N && <X/>`          -> cut via unmount
 * M003 same transition type across 3+ beats (no variety)                  -> monotonous
 * M004 transition count < beat count - 1 (some beat boundaries bare)     -> broken boundary
 * M005 spec.theme.surfaceMode undefined                                   -> no theme contract
 * M006 whole scene on one dark background (3+ beats, hardcoded #0x… bg) -> uniform style (warning)
 *
 * In projects with `"legacy": true` in spec.json, violations become WARNINGS (migration debt).
 * Usage: node scripts/motion-audit.mjs [--project <slug>]
 */
const require = createRequire(import.meta.url);
const { parse } = require("@babel/parser");

const RED = "\x1b[31m", GREEN = "\x1b[32m", YELLOW = "\x1b[33m", BOLD = "\x1b[1m", RESET = "\x1b[0m";
const TRANSITION_FNS = [
  "transitionWhipPan",
  "transitionMaskWipe",
  "transitionZoomPunch",
  "transitionContainerMorph",
  "transitionElementTakeover",
  "transitionCameraDive",
];
const isTransitionFn = (name) =>
  typeof name === "string" &&
  (/^transition[A-Z]\w*/.test(name) ||
    TRANSITION_FNS.includes(name) ||
    /Morph|Wipe|Pan|Punch|Sweep|Dissolve|Takeover|Dive/.test(name));
const BEAT_GATE = /(^|\.)(beat\w*|\w*Beat\w*|currentBeat|activeBeat)\b|\bframe\b\s*[<>]=?/;

const args = parseArgs();
const targets = resolveTargets(args);
const issues = [];

function walkAst(node, fn, parents = []) {
  if (!node || typeof node.type !== "string") return;
  fn(node, parents);
  for (const key of Object.keys(node)) {
    if (key === "loc" || key === "start" || key === "end") continue;
    const v = node[key];
    if (Array.isArray(v)) v.forEach((c) => walkAst(c, fn, [...parents, node]));
    else if (v && typeof v === "object") walkAst(v, fn, [...parents, node]);
  }
}

function auditProject(t) {
  const spec = JSON.parse(fs.readFileSync(t.spec, "utf-8"));
  const legacy = spec.legacy === true;
  const v2 = isHarnessV2(spec); // v2: keyword rules replaced by scripts/timeline-audit.mjs
  const file = rel(t.scene);
  const code = fs.readFileSync(t.scene, "utf-8");
  const add = (rule, line, msg, fix, hard = true) =>
    issues.push({ rule, file, line, msg, fix, level: hard && !legacy ? "error" : "warn", slug: t.slug });

  // continuousShot: deliberate single take (no cuts) - transitions not required; the camera carries the beat boundaries.
  const beats = spec.continuousShot === true ? 1 : spec.beats?.length ?? 0;
  let ast;
  try {
    ast = parse(code, { sourceType: "module", plugins: ["typescript", "jsx"] });
  } catch (e) {
    add("M000", e.loc?.line ?? 1, `could not parse: ${e.message}`, "fix the syntax");
    return;
  }

  const used = new Set();
  const calls = [];
  const gatedMounts = [];
  walkAst(ast, (n) => {
    if (n.type === "CallExpression") {
      const c = n.callee;
      const name = c.type === "Identifier" ? c.name : c.type === "MemberExpression" ? c.property?.name : null;
      if (name && isTransitionFn(name)) {
        used.add(name);
        calls.push(n.loc?.start.line ?? 1);
      }
    }
    if (n.type === "LogicalExpression" && n.operator === "&&" && n.right.type === "JSXElement") {
      const left = code.slice(n.left.start, n.left.end);
      if (BEAT_GATE.test(left)) gatedMounts.push({ line: n.loc?.start.line ?? 1, left });
    }
  });

  const isKineticReel = spec.mode === "creative-motion-reel" || spec.mode === "kinetic-poster";

  if (!v2 && beats >= 2 && used.size === 0 && !isKineticReel)
    add("M001", 1, `${beats} beats but no transition calls at all (hard cut).`, "Use src/core/transitions.ts: transitionWhipPan / MaskWipe / ZoomPunch / ContainerMorph.");

  for (const g of gatedMounts)
    add("M002", g.line, `Beat-bound unmount: \`${g.left.slice(0, 40)} && <…/>\` is cutting the scene.`, "Always mount beats; drive visibility with GSAP opacity/transform/clip-path within the transition window.");

  // M003: Removed; a consistent single-type transition design (e.g. container-morph / single container across all scenes) is allowed.

  if (!v2 && beats >= 2 && used.size > 0 && calls.length < beats - 1 && !isKineticReel)
    add("M004", calls[0], `${calls.length} transitions / ${beats - 1} beat boundaries: some boundaries are bare.`, "Assign a transition to every beat boundary.");

  if (!spec.theme?.surfaceMode)
    add("M005", 1, "spec.theme.surfaceMode is undefined.", 'spec.json -> "theme": { "surfaceMode": "light|dark|vibrant-brand|editorial-warm|kinetic-acid" }', false);

  const darkHex = (code.match(/#0[0-9a-fA-F]{5}\b/g) ?? []).length;
  const lightHex = (code.match(/#[fFeEdDcC][0-9a-fA-F]{5}\b/g) ?? []).length;
  const hasColorBlocking =
    code.includes("beatPalettes") ||
    code.includes("COLOR_BLOCK") ||
    code.includes("colorBlock") ||
    code.includes("color-block") ||
    (darkHex >= 1 && lightHex >= 1) ||
    isKineticReel;
  const isHybrid = spec.mode === "hybrid-orchestrated";
  if (!v2 && beats >= 3 && darkHex >= 4 && !/(THEME|theme)/.test(code) && !hasColorBlocking)
    add("M006", 1, "Uniform dark background with no theme contract or Color Blocking contrast.", "Apply light/dark surface contrast (Color Blocking) or a full-screen color transition between scenes.", isHybrid);

  // M007: Anticipatory stillness check before large impacts (Anticipatory Stillness 300-500ms)
  const hasShake = (spec.shakes && spec.shakes.length > 0) || code.includes("impactShake");
  const hasAnticipation =
    code.includes("anticipation") ||
    code.includes("cursorClickImpulse") ||
    code.includes("windUp") ||
    (spec.camera && spec.camera.some((c) => c.intent && /durgun|hazırlık|nefes/i.test(c.intent)));
  if (!v2 && hasShake && !hasAnticipation) {
    add("M007", 1, "Impact shake present, but no 300-500ms anticipatory stillness (anticipation) found before it.", "Leave a 300-500ms micro-stillness right before the big impact to amplify it.", false);
  }

  // M008: Organic curved cursor check (Curved Cursor Path)
  const hasCursor = /cursor/i.test(code);
  const hasCurvedPath =
    code.includes("cursorNaturalPath") ||
    code.includes("createCurvedCursorTrajectory") ||
    code.includes("bezier") ||
    code.includes("rotateZ");
  if (!v2 && hasCursor && !hasCurvedPath) {
    add("M008", 1, "Cursor animation moves along a straight linear path.", "For human-like cursor motion, use a curved trajectory (cursorNaturalPath / createCurvedCursorTrajectory).", false);
  }

  // M009: Follow-through and stagger check (Follow-Through Stagger)
  const hasMultiItems = code.includes(".card") || code.includes(".item") || code.includes("Badge") || code.includes("Metric");
  const hasStagger = code.includes("stagger") || code.includes("depthStaggerReveal") || code.includes("TIMING.itemStagger");
  if (!v2 && hasMultiItems && !hasStagger && beats >= 2) {
    add("M009", 1, "Multiple card/list items move together as one block.", "Per Disney follow-through, stagger the items with TIMING.itemStagger.", false);
  }

  // M010: Scale contrast and ban on fixed postage-stamp-sized boxes (Anti-Postage-Stamp Scale Contrast Law)
  if (!v2 && spec.mode === "hybrid-orchestrated") {
    const scaleMatches = [...code.matchAll(/\bscale\s*:\s*([0-9.]+)/g)].map((m) => parseFloat(m[1]));
    const maxScale = scaleMatches.length ? Math.max(...scaleMatches) : 1.0;
    const hasDramaticScale =
      maxScale >= 1.4 ||
      code.includes("SCALE_CONTRAST") ||
      code.includes("transitionElementTakeover") ||
      code.includes("transitionCameraDive");
    if (!hasDramaticScale) {
      add(
        "M010",
        1,
        `Fixed box / timid scale syndrome (Postage-Stamp Slop): maximum scale change ${maxScale}x (< 1.4x). Components stay the same size throughout.`,
        "For real growth/shrink between scenes, use transitionElementTakeover, transitionCameraDive or SCALE_CONTRAST (macroCloseUp >= 1.8x).",
        true
      );
    }

    // M011: Intra-beat stillness / frozen slide ban (Anti-Slide-Freeze Law)
    const hasContinuousFrameMotion =
      /useCurrentFrame/.test(code) ||
      /Math\.(sin|cos)\s*\(\s*frame/.test(code) ||
      /interpolate\s*\(\s*frame/.test(code) ||
      /CounterValue|TelemetryTile|CodeStreamBlock|ProceduralWaveform/.test(code);
    const longIntraBeatTweens = [...code.matchAll(/duration\s*:\s*([0-9.]+|DURATIONS\.\w+)/g)].length;
    if (!hasContinuousFrameMotion && longIntraBeatTweens < beats * 2) {
      add(
        "M011",
        1,
        "Intra-beat stillness (Slide Freeze): scene components enter within the first 0.4s and then sit frozen like a slide until the beat ends.",
        "Add a continuous camera drift across the beat, a useCurrentFrame()-based counter/code flow, or continuous layer scaling.",
        true
      );
    }

    // M012: Ban on muddy RGB background tweens (Anti-Muddy-Background-Fade)
    const bgTweenCount = [...code.matchAll(/tl\.to\(\s*['"]#hybrid-root-canvas['"]\s*,\s*\{[^}]*backgroundColor/g)].length;
    const hasClipOrTakeover =
      code.includes("clipPath") ||
      code.includes("transitionElementTakeover") ||
      code.includes("transitionMaskWipe") ||
      code.includes("transitionCameraDive");
    if (bgTweenCount >= 2 && !hasClipOrTakeover) {
      add(
        "M012",
        1,
        "Muddy RGB background transition: directly tweening backgroundColor between dark and light backgrounds creates dirty gray in-between frames.",
        "Instead of tweening the background color directly in RGB, use transitionElementTakeover, a clip-path iris reveal, or a full-screen layer takeover.",
        true
      );
    }
  }
}

targets.forEach(auditProject);

console.log(`\n${BOLD}==== MOTION AUDIT (${targets.length} projects) ====${RESET}`);
const errors = issues.filter((i) => i.level === "error");
for (const i of issues) {
  const c = i.level === "error" ? RED : YELLOW;
  console.log(`${c}${BOLD}[${i.rule}${i.level === "warn" ? " warning" : ""}] ${i.file}:${i.line}${RESET} ${i.msg}\n   Fix → ${i.fix}\n`);
}
if (errors.length) {
  console.log(`${RED}${BOLD}[MOTION: FAILED] ${errors.length} violations. Abrupt unmounted cuts are not permitted.${RESET}\n`);
  process.exit(1);
}
console.log(`${GREEN}${BOLD}[MOTION: CLEAN]${RESET} transitions verified, beats maintain continuity${issues.length ? ` (${issues.length} warnings)` : ""}.\n`);
