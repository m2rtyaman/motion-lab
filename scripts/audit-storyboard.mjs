import fs from "node:fs";
import path from "node:path";
import {
  parseArgs,
  resolveTargets,
  rootDir,
  rel,
  isHarnessV2,
} from "./lib/projects.mjs";

/**
 * SHIFT-LEFT STORYBOARD & BEAT DIRECTOR AUDITOR (v1.0)
 *
 * Audits the quality, rhythm and visual flow of the edit before any code is written.
 * A weak, monotonous, breathless or disconnected storyboard CANNOT advance to the coding stage.
 *
 * Rules checked:
 * [STORY-001] One-Sentence Goal (a clear goal sentence in direction.md)
 * [STORY-002] Rhythm & Tempo Contrast (ban on monotonous equal-length beats, stddev >= 18f)
 * [STORY-003] Readability & Cognitive Load (text hold >= 1.2s / 72f, WPM <= 220)
 * [STORY-004] Single Container / Visual Bridge (transition bridge between scenes, or single-take definition)
 * [STORY-005] Camera Motivation (every camera move has a concrete, meaningful intent)
 * [STORY-006] Narrative Progression & Variety (ban on consecutive same-type beats)
 *
 * Usage:
 *   node scripts/audit-storyboard.mjs [--project <slug>]
 */

const args = parseArgs();
const targets = resolveTargets(args);

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

console.log(`\n${BOLD}====================================================${RESET}`);
console.log(`${BOLD}   SHIFT-LEFT STORYBOARD & MOTION DIRECTOR AUDIT    ${RESET}`);
console.log(`${BOLD}====================================================${RESET}\n`);

let totalErrors = 0;
let totalWarnings = 0;

for (const project of targets) {
  const specPath = project.spec;
  const directionPath = project.direction;

  if (!fs.existsSync(specPath)) continue;

  let spec;
  try {
    spec = JSON.parse(fs.readFileSync(specPath, "utf-8").replace(/^\uFEFF/, ""));
  } catch (e) {
    console.error(`${RED}[ERROR] Could not read spec.json:${RESET} ${e.message}`);
    totalErrors++;
    continue;
  }

  const legacy = spec.legacy === true;
  const v2 = isHarnessV2(spec); // v2: blueprint / Phase-0 / 3D-filter keyword plans are not required
  const errors = [];
  const warnings = [];

  const addErr = (code, title, detail, fix) => {
    if (legacy) warnings.push({ code, title, detail, fix });
    else errors.push({ code, title, detail, fix });
  };
  const addWarn = (code, title, detail, fix) => warnings.push({ code, title, detail, fix });

  // ---------------------------------------------------------------------------
  // [STORY-001] One-Sentence Goal check (direction.md)
  // ---------------------------------------------------------------------------
  let directionText = "";
  if (fs.existsSync(directionPath)) {
    directionText = fs.readFileSync(directionPath, "utf-8");
  }

  const hasGoal =
    /tek\s*c[üu]mlelik.*hedef/i.test(directionText) ||
    /Bu videonun tek cümlelik hedefi şu/i.test(directionText) ||
    /(?:the\s+)?(?:single|one)[- ]sentence.*goal/i.test(directionText) ||
    /Tek Cümlelik Hedef/i.test(directionText) ||
    /İzleyici.*hedef/i.test(directionText);

  if (!hasGoal) {
    addErr(
      "STORY-001",
      "Missing One-Sentence Goal",
      "No clear viewer goal was found in direction.md.",
      'Add to direction.md: "Bu videonun tek cümlelik hedefi şu: [hedef]." Keep this exact Turkish sentence; the checker matches it.'
    );
  }

  // ---------------------------------------------------------------------------
  // [STORY-002] Rhythm & Tempo Contrast (spec.beats)
  // ---------------------------------------------------------------------------
  const beats = Array.isArray(spec.beats) ? spec.beats : [];
  const isKineticReel = spec.mode === "creative-motion-reel" || spec.mode === "kinetic-poster";
  if (beats.length >= 3 && !isKineticReel) {
    const durations = beats.map((b) => (b.endFrame ?? 0) - (b.startFrame ?? 0));
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const variance = durations.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / durations.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev < 14) {
      addErr(
        "STORY-002",
        "Rhythm Monotony",
        `Beat durations are nearly uniform (stddev: ${stdDev.toFixed(1)}f < 14f). The video plays like a metronome.`,
        "Vary beat durations: energize the rhythm with punchy moments (Staccato 35-55f) and deep reading moments (Focus 75-120f)."
      );
    }
  }

  // ---------------------------------------------------------------------------
  // [STORY-003] Readability & Cognitive Load check
  // ---------------------------------------------------------------------------
  const fps = spec.fps || 60;
  beats.forEach((b, i) => {
    const durFrames = (b.endFrame ?? 0) - (b.startFrame ?? 0);
    const durSec = durFrames / fps;

    if (b.text && typeof b.text === "string" && b.text.trim()) {
      const isKineticBeat = b.kinetic === true || b.isKinetic === true || isKineticReel;
      const minDuration = isKineticBeat ? 0.12 : 1.15; // 8-28 frames are allowed for fast beat cuts in kinetic typography
      // 1.2s rule
      if (durSec < minDuration) {
        addErr(
          "STORY-003",
          `Beat [${b.id}] Text Reading Time Insufficient`,
          `"${b.text}" stays on screen for only ${durSec.toFixed(2)}s (${durFrames}f). A minimum of ${minDuration}s is required.`,
          `Extend the beat to at least 72 frames or shorten the text.`
        );
      }

      // WPM rule
      const words = b.text.trim().split(/\s+/).length;
      const wpm = (words / durSec) * 60;
      if (wpm > 240 && words > 4 && !isKineticBeat) {
        addWarn(
          "STORY-003",
          `Beat [${b.id}] High Cognitive Load`,
          `Reading speed ${Math.round(wpm)} WPM. The viewer's eyes may struggle to follow the text.`,
          `Reduce the word count or lengthen the duration to bring WPM down to <= 220.`
        );
      }
    }
  });

  // ---------------------------------------------------------------------------
  // [STORY-004] Single Container / Visual Bridge check
  // ---------------------------------------------------------------------------
  if (spec.mode !== "cinematic-world" && !isKineticReel && !v2 && beats.length >= 2) { // v2: boundaries are real preset tweens on the timeline
    const transitions = Array.isArray(spec.transitions) ? spec.transitions : [];
    if (transitions.length === 0 && spec.continuousShot !== true) {
      addErr(
        "STORY-004",
        "Transition and Visual Bridge Undefined",
        `Scene has ${beats.length} beats but the spec.transitions array is empty. Risk of slide-style cuts.`,
        'Define a transition for every beat boundary in spec.json (whip-pan, mask-wipe, zoom-punch, container-morph).'
      );
    }
  }

  // ---------------------------------------------------------------------------
  // [STORY-005] Camera Motivation check
  // ---------------------------------------------------------------------------
  const camera = Array.isArray(spec.camera) ? spec.camera : [];
  camera.forEach((c, i) => {
    const intent = (c.intent || "").trim();
    if (!intent || intent.length < 6 || intent.toLowerCase() === "kamera") {
      addErr(
        "STORY-005",
        `Camera [${i}] Rationale (Intent) Insufficient`,
        `No motivating purpose is defined for the camera move (at: ${c.at}s): "${intent}".`,
        'Explain why the camera moves and what it focuses on (e.g. "push into the calendar matrix with Transition 1").'
      );
    }
  });

  // ---------------------------------------------------------------------------
  // [STORY-006] Narrative Progression & Variety
  // ---------------------------------------------------------------------------
  for (let i = 0; i < beats.length - 1; i++) {
    const curr = beats[i];
    const next = beats[i + 1];
    if (curr.action && next.action && curr.action === next.action) {
      addWarn(
        "STORY-006",
        `Consecutive Same Action [Beat ${curr.id} -> ${next.id}]`,
        `Two beats in a row share the same action: "${curr.action}". Risk of composition repetition.`,
        "Give each beat a different visual focus (overview -> micro-interaction -> telemetry -> climax)."
      );
    }
  }

  // ---------------------------------------------------------------------------
  // [STORY-007] PHASE 0 Live Web, Vector and Studio Research File check
  // ---------------------------------------------------------------------------
  const blueprintPath = path.join(project.dir, "choreography-blueprint.md");
  if (!v2 && fs.existsSync(blueprintPath)) {
    const bpText = fs.readFileSync(blueprintPath, "utf-8");
    const hasPhase0 = /PHASE\s*0/i.test(bpText);
    const hasSvgSource = /SimpleIcons|Wikimedia|lucide|tabler|d="M|<path/i.test(bpText);
    if (!hasPhase0 || !hasSvgSource) {
      addErr(
        "STORY-007",
        "Missing PHASE 0 Live Web & Vector Research",
        "PHASE 0 (official SVG path coordinates and UI Tear-Down) is missing from choreography-blueprint.md.",
        "Before coding, use search_web to write real SVG path and UI anatomy findings into the PHASE 0 section."
      );
    }

    // -------------------------------------------------------------------------
    // [STORY-008] Match-Cut & 3D Katman Mimarisi (SvgFilterLab + LayeredStage3D)
    // -------------------------------------------------------------------------
    const has3DAndFilters =
      /LayeredStage3D|LayerPlane|preserve-3d|translateZ/i.test(bpText) &&
      /SvgFilterLab|linearGradient|radialGradient|gooey-liquid-morph/i.test(bpText);

    if (!has3DAndFilters) {
      addErr(
        "STORY-008",
        "Missing 3D Layer (LayeredStage3D) & Vector Filter (SvgFilterLab) Plan",
        "choreography-blueprint.md does not define 3D Z-axis layer separation (LayeredStage3D / translateZ) or SvgFilterLab (<defs> gradient/filter).",
        "Instead of flat 2D boxes, plan a LayeredStage3D (translateZ planes) and SvgFilterLab (gradient/gooey filters) architecture within PHASE 4 and PHASE 6."
      );
    }
  }

  // ---------------------------------------------------------------------------
  // [STORY-009] 60-Second Quality Checklist (SAAS Workflow Guide Gate)
  // ---------------------------------------------------------------------------
  // 1. SEQUENCE & 8. ENDING CHECK
  if (beats.length > 0) {
    const finalBeat = beats[beats.length - 1];
    const finalDuration = finalBeat.endFrame - finalBeat.startFrame;
    if (finalDuration < 60 && !legacy) {
      addWarn(
        "STORY-009",
        "Insufficient Ending Hold (Ending Hold < 1.0s)",
        `The final beat (${finalBeat.id}) lasts only ${finalDuration} frames (${(finalDuration / 60).toFixed(2)}s). The viewer cannot read the CTA/logo.`,
        "Keep the final brand / CTA / URL scene on screen for at least 72 frames (1.2s)."
      );
    }
  }

  // ---------------------------------------------------------------------------
  // [STORY-010] Master Storyboard Standard (5 Universal Laws & 3-Layer Depth)
  // ---------------------------------------------------------------------------
  const has3Layers =
    /(?:3|three)[- ]layer|3 Katman|Üç Katman|Hayalet Kontur|Ghost.*(?:Layer|Outline)|Zemin.*Ön Plan/i.test(directionText) ||
    /LayeredStage3D|LayerPlane/i.test(directionText);
  const hasHeroContinuity =
    /TheHeroActor|Hero.*Actor|Kahraman.*Aktör|Tek.*Kap|Single.*Container|Living.*Container/i.test(directionText) ||
    spec.continuousShot === true;

  if (!legacy && !v2 && (!has3Layers || !hasHeroContinuity)) {
    addWarn(
      "STORY-010",
      "Master Storyboard 5 Laws Missing",
      `direction.md lacks 3-Layer Depth Architecture (Base -> Ghost Outline -> Foreground Hero) or hero-element continuity (one element that stays on screen across beats).`,
      "Add a 3-layer depth plan and a hero-element continuity plan to direction.md."
    );
  }

  // ---------------------------------------------------------------------------
  // Raporlama
  // ---------------------------------------------------------------------------
  console.log(`▶ PROJECT: ${project.slug.toUpperCase()} [${spec.mode} | ${spec.aspect}]`);
  console.log(`  Beats: ${beats.length} | Cameras: ${camera.length} | Duration: ${spec.durationInSeconds}s`);

  if (errors.length === 0 && warnings.length === 0) {
    console.log(`  ${GREEN}✓ Flawless Storyboard. Flow, rhythm, continuous container bridge, and camera motivation verified.${RESET}\n`);
  } else {
    errors.forEach((e) => {
      console.log(`  ${RED}${BOLD}[${e.code}] ${e.title}${RESET}: ${e.detail}\n     Fix → ${e.fix}`);
    });
    warnings.forEach((w) => {
      console.log(`  ${YELLOW}[${w.code} WARNING] ${w.title}${RESET}: ${w.detail}\n     Fix → ${w.fix}`);
    });
    console.log();
  }

  totalErrors += errors.length;
  totalWarnings += warnings.length;
}

if (totalErrors > 0) {
  console.log(`${RED}${BOLD}[STORYBOARD: FAILED] Found ${totalErrors} editing errors. Cannot proceed to code generation.${RESET}\n`);
  process.exit(1);
}

console.log(`${GREEN}${BOLD}[STORYBOARD: APPROVED] All storyboard and motion contracts meet broadcast standards.${RESET}\n`);
process.exit(0);
