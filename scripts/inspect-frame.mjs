import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseArgs, resolveTargets, rootDir, rel } from './lib/projects.mjs';

/**
 * INSPECT FRAME (Motion Lab animation guide: single-frame inspection bridge)
 *
 * MOTION_RULES.md: "If ?t=3.2 is given in the URL, render that moment and stop (for single-frame checks)."
 *
 * Instantly captures a scene's requested second or frame as a PNG and
 * reports the beat, camera, text and telemetry state at that moment.
 *
 * Usage:
 *   node scripts/inspect-frame.mjs <slug> [--t 3.5] [--frame 210]
 *   pnpm inspect <slug> --t 3.5
 */

const argv = process.argv.slice(2);
const positional = argv.filter((a) => !a.startsWith('-'));
const slug = positional[0];

const getArg = (flag, def) => {
  const idx = argv.indexOf(flag);
  return idx !== -1 && argv[idx + 1] ? argv[idx + 1] : def;
};

const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

if (!slug) {
  console.error(`${RED}${BOLD}[ERROR] Project slug not specified.${RESET}`);
  console.log(`Usage: node scripts/inspect-frame.mjs <slug> [--t 3.2 | --frame 192]`);
  process.exit(1);
}

const specPath = path.join(rootDir, 'src', 'projects', slug, 'spec.json');
if (!fs.existsSync(specPath)) {
  console.error(`${RED}${BOLD}[ERROR] spec.json not found:${RESET} ${specPath}`);
  process.exit(1);
}

const spec = JSON.parse(fs.readFileSync(specPath, 'utf-8'));
const fps = spec.fps || 60;
const totalFrames = Math.round((spec.durationInSeconds || 6) * fps);

let frame = 0;
const tArg = getArg('--t', null);
const frameArg = getArg('--frame', null);

if (tArg !== null) {
  const seconds = parseFloat(tArg);
  frame = Math.round(seconds * fps);
} else if (frameArg !== null) {
  frame = parseInt(frameArg, 10);
}

frame = Math.max(0, Math.min(totalFrames - 1, frame));
const currentTimeSec = (frame / fps).toFixed(3);

console.log(`\n${BOLD}====================================================${RESET}`);
console.log(`${BOLD}   MOTION LAB INSPECT FRAME: ${slug.toUpperCase()}   ${RESET}`);
console.log(`${BOLD}====================================================${RESET}`);
console.log(`Timestamp : ${CYAN}t = ${currentTimeSec}s${RESET} (Frame: ${BOLD}${frame}${RESET} / ${totalFrames}) | FPS: ${fps}`);

// 1. ACTIVE BEAT ANALYSIS
const activeBeat = (spec.beats || []).find((b) => frame >= b.startFrame && frame <= b.endFrame);
if (activeBeat) {
  console.log(`Active Beat    : ${GREEN}${activeBeat.id}${RESET} [f${activeBeat.startFrame} – f${activeBeat.endFrame}] → "${activeBeat.intent}"`);
} else {
  console.log(`Active Beat    : ${YELLOW}outside beat range${RESET}`);
}

// 2. ACTIVE CAMERA TRANSITION ANALYSIS
const activeCamera = (spec.camera || []).find((c) => {
  const startF = Math.round(c.at * fps);
  const endF = Math.round((c.at + c.duration) * fps);
  return frame >= startF && frame <= endF;
});

if (activeCamera) {
  console.log(`Camera Move: ${CYAN}${activeCamera.intent}${RESET} (Ease: ${activeCamera.ease}, Duration: ${activeCamera.duration}s)`);
} else {
  console.log(`Camera Move: Static / Ambient`);
}

// 3. REMOTION STILL RENDER
const outDir = path.join(rootDir, 'out', slug, 'inspection');
fs.mkdirSync(outDir, { recursive: true });
const outPng = path.join(outDir, `frame_${String(frame).padStart(4, '0')}.png`);

console.log(`\n${YELLOW}Rendering frame...${RESET}`);

const res = spawnSync(
  'npx',
  [
    'remotion',
    'still',
    'src/remotion/index.ts',
    slug,
    outPng,
    `--frame=${frame}`,
    '--gl=angle',
  ],
  {
    cwd: rootDir,
    shell: true,
    stdio: 'pipe',
  }
);

if (res.status === 0 && fs.existsSync(outPng)) {
  const stat = fs.statSync(outPng);
  console.log(`${GREEN}✓ Frame saved:${RESET} ${rel(outPng)} (${(stat.size / 1024).toFixed(1)} KB)`);
  console.log(`\nYou can open the file for visual inspection.`);
} else {
  console.error(`${RED}Render failed:${RESET}\n${res.stderr?.toString() || res.stdout?.toString()}`);
}
console.log('');
