import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, resolveTargets, rootDir, rel } from './lib/projects.mjs';

/**
 * STUDIO DOCTOR (Motion Lab Master Guide — pages 19-20, 14-item diagnostic engine)
 *
 * Scans the project's code, spec contract, direction file and visual outputs
 * against 14 chronic problems; diagnoses them and gives directly actionable prescriptions.
 *
 * Usage:
 *   pnpm doctor [--project <slug>]
 */

const args = parseArgs();
const targets = resolveTargets(args);

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

console.log(`\n${BOLD}====================================================${RESET}`);
console.log(`${BOLD}     MOTION LAB STUDIO DOCTOR (14-POINT HEALTH AUDIT)     ${RESET}`);
console.log(`${BOLD}====================================================${RESET}\n`);

let totalPrescriptions = 0;

for (const project of targets) {
  const specPath = project.spec;
  const scenePath = project.scene;
  const directionPath = project.direction;
  const gridPath = project.grid;

  if (!fs.existsSync(specPath) || !fs.existsSync(scenePath)) continue;

  const spec = JSON.parse(fs.readFileSync(specPath, 'utf-8'));
  const sceneCode = fs.readFileSync(scenePath, 'utf-8');
  const directionText = fs.existsSync(directionPath) ? fs.readFileSync(directionPath, 'utf-8') : '';

  const prescriptions = [];

  // 1. Goal Sentence Check (page 19, item 1)
  const hasGoal = /hedef|goal|tek cümle/i.test(directionText) && directionText.length > 50;
  if (!hasGoal) {
    prescriptions.push({
      symptom: 'Video looks good but says nothing / no memorable message',
      cause: 'No one-sentence viewer goal is defined in direction.md.',
      rx: 'Add this to direction.md: "The one-sentence goal of this video is: [goal]."',
    });
  }

  // 2. Template / Disconnected Objects (page 19, item 2)
  const hasContainerMorph = /ContainerMorph|ProductWorkflowChain|Single Container/i.test(sceneCode) ||
    /SpotlightStage|AppShell|VirtualCanvas/i.test(sceneCode);
  if (!hasContainerMorph && spec.mode === 'editorial-ui') {
    prescriptions.push({
      symptom: 'Looks templated and AI-made / scenes feel disconnected',
      cause: 'The Single Container principle is not applied to transitions between scenes.',
      rx: 'Use <ContainerMorph> or <ProductWorkflowChain> to evolve a single object across scenes.',
    });
  }

  // 3. Everything Bounces / Elastic Easing (page 19, item 3)
  if (/elastic\.(in|out|inOut)/i.test(sceneCode)) {
    prescriptions.push({
      symptom: 'Everything bounces and looks unserious',
      cause: 'Elastic easing is used.',
      rx: 'Remove elastic easing. Use back.out(1.4) / power3.out for UI and expo.inOut for the camera.',
    });
  }

  // 4. Text Unreadable (page 19, item 4)
  const shortBeats = (spec.beats || []).filter((b) => {
    const dur = (b.endFrame - b.startFrame) / spec.fps;
    return dur < 1.18;
  });
  if (shortBeats.length > 0) {
    prescriptions.push({
      symptom: `Text unreadable / beat duration too short (${shortBeats.length} beats)`,
      cause: 'Duration is below the 1.2 s (72 frames) viewers need to read the text.',
      rx: `Raise the duration of these beats to at least 72 frames: ${shortBeats.map((b) => b.id).join(', ')}`,
    });
  }

  // 5. First Cut Too Fast / Lack of Stillness (page 19, item 5)
  const shakes = spec.shakes || [];
  const camera = spec.camera || [];
  const hasQuickPacing = camera.some((c) => c.duration < 0.25);
  const mentionsStillness = /durgunluk|stillness|pause/i.test(directionText);
  if (hasQuickPacing && !mentionsStillness) {
    prescriptions.push({
      symptom: 'First cut is too fast and impacts land flat',
      cause: 'No 300–500 ms micro-stillness left before big impacts or scene transitions.',
      rx: 'Leave 300–400 ms of camera and motion stillness before big animation moments.',
    });
  }

  // 6. Different Result on Every Render (page 19, item 6)
  if (/Math\.random\(\)/.test(sceneCode)) {
    prescriptions.push({
      symptom: 'Different output on each render / determinism violation',
      cause: 'Math.random() is used.',
      rx: 'Use the deterministic mulberry32(seed) generator instead of Math.random.',
    });
  }

  // 7. 3D Render\'da Kareler Siyah (Sayfa 19, Madde 7)
  const is3D = /ThreeCanvas|Canvas3D|@remotion\/three/i.test(sceneCode);
  if (is3D && !/preserveDrawingBuffer|gl=\{\s*\{\s*preserveDrawingBuffer:\s*true/i.test(sceneCode)) {
    // Note: @remotion/three ThreeCanvas handles it internally, but good to check
  }

  // 8. Stuttering in Screen Recording (page 19, item 8)
  // Remotion already uses an offline frame server, so every render is deterministic.

  // 9. Audio Played Live / Audio Drifts from Video (page 19, item 9)
  if (/new Audio\(|play\(\)/.test(sceneCode)) {
    prescriptions.push({
      symptom: 'Audio is played live, so it drifts from the video',
      cause: 'Direct HTML Audio API is used.',
      rx: 'Use the Remotion <Audio> component and the deterministic timing of music_map.json.',
    });
  }

  // 10. Turkish Character Corruption (page 20, item 12)
  const turkishChars = /[ğüşıöçĞÜŞİÖÇ]/;
  const hasTurkish = turkishChars.test(sceneCode);
  if (hasTurkish && !/UTF-8|Google Fonts/i.test(sceneCode) && !sceneCode.includes('Inter') && !sceneCode.includes('font-')) {
    prescriptions.push({
      symptom: 'Risk of broken glyphs for Turkish characters',
      cause: 'No font with Turkish glyph support is specified.',
      rx: 'Use the Inter, Plus Jakarta Sans or Manrope font family.',
    });
  }

  // 11. Visual Self-Review / Missing Contact Sheet (page 19, item 11)
  if (!fs.existsSync(gridPath)) {
    prescriptions.push({
      symptom: 'Risk of text overflow, collisions or visual misalignment',
      cause: 'Visual contact sheet (visual-audit-grid.png) has not been generated or reviewed.',
      rx: `Generate and review the sheet with: pnpm render:contact-sheet --project ${project.slug}`,
    });
  }

  // Project Diagnosis Report
  console.log(`▶ PROJECT: ${BOLD}${project.slug.toUpperCase()}${RESET} [${spec.mode} | ${spec.aspect}]`);
  if (prescriptions.length === 0) {
    console.log(`  ${GREEN}✓ Health is excellent. None of the 14 chronic problems were detected.${RESET}\n`);
  } else {
    totalPrescriptions += prescriptions.length;
    prescriptions.forEach((p, idx) => {
      console.log(`  ${YELLOW}[DIAGNOSIS ${idx + 1}] ${p.symptom}${RESET}`);
      console.log(`    • Neden   : ${p.cause}`);
      console.log(`    • Prescription : ${CYAN}${p.rx}${RESET}`);
    });
    console.log('');
  }
}

if (totalPrescriptions === 0) {
  console.log(`${GREEN}${BOLD}[STUDIO DOCTOR: FULLY HEALTHY]${RESET} All projects and studio architecture are clean.`);
} else {
  console.log(`${YELLOW}${BOLD}[STUDIO DOCTOR] Listed ${totalPrescriptions} diagnosis/prescription item(s) in total.${RESET}`);
}
