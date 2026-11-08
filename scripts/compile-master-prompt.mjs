import fs from "node:fs";
import path from "node:path";
import { parseArgs, resolveTargets, rootDir, rel } from "./lib/projects.mjs";

/**
 * MASTER PROMPT COMPILER FOR MOTION GRAPHICS & VIDEO AI (v1.0)
 *
 * Kaynak: references/SAAS_WORKFLOW_GUIDE.md
 * (Motion Graphics Workflow Guide - 6 Short Blocks Architecture)
 *
 * Built from spec.json and direction.md to feed video AI models
 * (Gemini Omni Flash, Kling, Sora, Runway) or a creative director handoff,
 * compiles a standard 6-block deterministic production prompt.
 *
 * Usage:
 *   node scripts/compile-master-prompt.mjs --project <slug>
 */

const args = parseArgs();
const targets = resolveTargets(args);

const BOLD = "\x1b[1m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const RESET = "\x1b[0m";

for (const project of targets) {
  const specPath = project.spec;
  const directionPath = project.direction;

  if (!fs.existsSync(specPath)) {
    console.error(`[ERROR] spec.json not found: ${specPath}`);
    continue;
  }

  const spec = JSON.parse(fs.readFileSync(specPath, "utf-8").replace(/^\uFEFF/, ""));
  let direction = "";
  if (fs.existsSync(directionPath)) {
    direction = fs.readFileSync(directionPath, "utf-8");
  }

  // Analyze colors, title and design decisions from direction
  const paletteMatch = direction.match(/Renk Paleti|Palette|Colors/i);
  const beats = spec.beats || [];
  const camera = spec.camera || [];
  const duration = spec.durationInSeconds || 10;
  const aspect = spec.aspect || "16:9";

  // 1. USE THE STORYBOARD
  const shotDescriptions = beats.map((b, i) => {
    const startSec = (b.startFrame / 60).toFixed(1);
    const endSec = (b.endFrame / 60).toFixed(1);
    const durSec = ((b.endFrame - b.startFrame) / 60).toFixed(1);
    const action = b.action || b.name || `Shot ${i + 1}`;
    const visual = b.visual || action;
    return `  • Shot ${String(i + 1).padStart(2, "0")} [${startSec}s - ${endSec}s | ${durSec}s]: ${visual}`;
  }).join("\n");

  // 2. MOTION
  const cameraMoves = camera.map((c) => {
    const target = c.target || ".camera-rig";
    return `Camera at ${c.at}s: ${c.direction || "dynamic framing"} (ease: ${c.ease || "expo.out"}, duration: ${c.duration || 1}s)`;
  }).slice(0, 5).join("; ");

  const motionDescription = `Controlled editorial camera moves with organic deceleration (${cameraMoves || "subtle push-ins and 3/4 tilts"}). Strict spring-damped element reveals, zero linear drift.`;

  // 3. EDITORIAL STYLE
  const transitionTypes = (spec.transitions && spec.transitions.length > 0)
    ? spec.transitions.map(t => t.type).join(", ")
    : "Peak-velocity container morph, directional whip-pan, and clean match cuts";
  const editorialStyle = `Snappy B2B tech commercial pacing (${spec.fps} FPS, ${aspect} aspect, ${duration}s total). Cuts land strictly on key rhythmic pulses. Transition grammar: ${transitionTypes}. Zero abrupt crossfades.`;

  // 4. DESIGN RULES
  const designRules = `Premium minimalist tech aesthetic. Crisp typography, 1px shared grid hairlines, subtle tactile drop-shadows, soft directional lighting. Minimum 1.2s text reading hold on primary messages. Stable geometry with verified aspect ratios.`;

  // 5. CONSISTENCY
  const consistency = `Unified design system across all ${beats.length} shots. Same hardware anchor/shell container, persistent brand color accents, identical font family, coherent dark/light studio world without background jumping.`;

  // 6. QUALITY CONTROL (NEGATIVE CONSTRAINTS)
  const qualityControl = `No glitches, warped letters, broken interfaces, unwanted particles, excessive neon bloom, random camera shake, style drift, or unmotivated floating elements. Output a cohesive premium motion-graphics commercial that feels like one intentionally designed piece from beginning to end.`;

  // Master Prompt Assembly
  const masterPrompt = `Create the final motion-graphics video from the attached storyboard.

Treat the storyboard as the source of truth for the visual sequence: keep the same shot order, composition, framing, hierarchy and overall design language.

[1. SHOT ORDER & STORYBOARD TIMELINE]
${shotDescriptions}

[2. MOTION & CAMERA DYNAMICS]
${motionDescription}

[3. EDITORIAL STYLE & PACING]
${editorialStyle}

[4. DESIGN RULES & GEOMETRY]
${designRules}

[5. CONSISTENCY & BRAND WORLD]
${consistency}

[6. RESTRICTIONS & QUALITY CONTROL]
${qualityControl}
`;

  // Save output to file
  const outDir = path.join(rootDir, "out", project.slug);
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "master-prompt.txt");
  fs.writeFileSync(outPath, masterPrompt, "utf-8");

  console.log(`\n${BOLD}====================================================${RESET}`);
  console.log(`${BOLD}   MASTER VIDEO PROMPT: ${CYAN}${project.slug.toUpperCase()}${RESET}`);
  console.log(`${BOLD}====================================================${RESET}`);
  console.log(masterPrompt);
  console.log(`${GREEN}✓ Master prompt kaydedildi:${RESET} ${rel(outPath)}\n`);
}
