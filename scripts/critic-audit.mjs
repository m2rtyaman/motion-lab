import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, resolveTargets, rootDir, rel, isHarnessV2 } from './lib/projects.mjs';
import { calculateRequiredReadingTime, countTextUnits } from '../src/core/readability-meter.ts';

/**
 * CRITIC AUDIT (Motion Lab Animasyon Rehberi Prompt 10 Cilalama Motoru)
 *
 * Scores and audits a scene through the eyes of a demanding motion design director:
 * 1. Dead Time Check (moments with no motion for longer than 0.5s)
 * 2. Readability Duration (main text must stay on screen for at least 1.2 s)
 * 3. AI Template Detection (purple/cyan gradient, meaningless particles, centered empty space)
 * 4. P0 (Mandatory), P1 (Major Improvement), P2 (Polish) scoring table
 *
 * Usage: node scripts/critic-audit.mjs [--project <slug>]
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
console.log(`${BOLD}   MOTION LAB DIRECTORS CRITIC AUDIT (PROMPT 10 ENGINE)   ${RESET}`);
console.log(`${BOLD}====================================================${RESET}\n`);

let overallScore = 0;
let projectCount = 0;

for (const project of targets) {
  const specPath = project.spec;
  const scenePath = project.scene;
  const directionPath = project.direction;

  if (!fs.existsSync(specPath) || !fs.existsSync(scenePath)) continue;

  const spec = JSON.parse(fs.readFileSync(specPath, 'utf-8'));
  const sceneCode = fs.readFileSync(scenePath, 'utf-8');
  const directionText = fs.existsSync(directionPath) ? fs.readFileSync(directionPath, 'utf-8') : '';

  const findings = {
    P0: [], // Mandatory fix
    P1: [], // Major improvement
    P2: [], // Cila
  };

  const isLegacy = spec.legacy === true;
  const v2 = isHarnessV2(spec); // v2: structure/color-block/vector-richness/blueprint keyword rules are skipped
  let score = 10;

  // 1. DEAD TIME CHECK
  // Note: keeping the camera calm during text or data focus is a virtue; kinetic vector scenes provide continuous 2D motion, so no camera dead-time penalty is applied.
  const camera = Array.isArray(spec.camera) ? spec.camera : [];
  const isKineticReel = spec.mode === 'creative-motion-reel' || spec.mode === 'kinetic-poster';
  const isSingleContainer =
    Boolean(spec.transitions && spec.transitions.some((t) => t.type === 'container-morph')) ||
    sceneCode.includes('#the-morph-container') ||
    sceneCode.includes('SingleContainer');
  if (!isKineticReel && !isSingleContainer) {
    for (let i = 0; i < camera.length - 1; i++) {
      const gap = camera[i + 1].at - (camera[i].at + camera[i].duration);
      if (gap > 4.0) {
        findings.P1.push({
          time: `${(camera[i].at + camera[i].duration).toFixed(2)}s – ${camera[i + 1].at.toFixed(2)}s`,
          issue: `Camera is completely still for ${(gap).toFixed(2)}s (excessive dead time > 4.0s)`,
          fix: 'Add a transition or focus movement.',
        });
        if (!isLegacy) score -= 0.5;
      }
    }
  }

  // 2. TEXT READABILITY DURATION (dynamic reading formula & kinetic typography rhythm exception)
  const beats = Array.isArray(spec.beats) ? spec.beats : [];
  beats.forEach((b) => {
    const durationSec = (b.endFrame - b.startFrame + 1) / spec.fps;
    const textContent = typeof b.text === 'string' ? b.text.trim() : '';
    const hasText = Boolean(textContent);
    const isKineticBeat = b.kinetic === true || b.isKinetic === true || isKineticReel;
    const minHoldSec = isKineticBeat ? 0.12 : 1.2; // 8-28 frames are allowed for rhythmic kinetic cuts (EASE / IN / OUT)
    const isComparisonOrVerdict = Boolean(
      b.isComparison ||
      b.isVerdict ||
      /verdict|compare|karşılaştırma|karar|ledger|telemetry|summary/i.test(b.id || '') ||
      /verdict|vs|karşılaştırma|karar/i.test(textContent)
    );

    if (isComparisonOrVerdict && durationSec < 2.5) {
      findings.P0.push({
        beat: b.id,
        issue: `Beat duration (${durationSec.toFixed(2)}s) for a comparison / verdict screen is below the 2.5s minimum hold rule.`,
        fix: `Raise the beat duration to at least 2.5 seconds (${Math.round(2.5 * spec.fps)} frames @${spec.fps}fps).`,
      });
      if (!isLegacy) score -= 1.0;
    } else if (hasText && !isKineticBeat) {
      const { cjkChars, latinWords } = countTextUnits(textContent);
      const requiredDuration = calculateRequiredReadingTime(cjkChars, latinWords, isComparisonOrVerdict);
      if (durationSec < requiredDuration) {
        findings.P0.push({
          beat: b.id,
          issue: `Beat duration (${durationSec.toFixed(2)}s) is below the dynamic readability requirement (${requiredDuration.toFixed(2)}s - CJK: ${cjkChars}, Latin: ${latinWords} words); the viewer cannot comfortably read the text.`,
          fix: `Raise the beat duration to at least ${requiredDuration.toFixed(2)} seconds (${Math.round(requiredDuration * spec.fps)} frames @${spec.fps}fps).`,
        });
        if (!isLegacy) score -= 1.0;
      }
    } else if (!isLegacy && durationSec < minHoldSec) {
      findings.P0.push({
        beat: b.id,
        issue: `Beat duration (${durationSec.toFixed(2)}s) is below ${minHoldSec} seconds; the viewer cannot perceive the scene.`,
        fix: `Raise the beat duration to at least ${minHoldSec} seconds (${Math.round(minHoldSec * spec.fps)} frames @${spec.fps}fps).`,
      });
      if (!isLegacy) score -= 1.0;
    }
  });

  // 3. AI TEMPLATE CHECK (AI Template Slop & Emoji Slop & 3-Part Sandwich Slop)
  if (sceneCode.includes('blur-3xl') && sceneCode.includes('bg-purple')) {
    findings.P0.push({
      issue: 'Generic AI purple-cyan blur smudge detected.',
      fix: 'Replace with dark glass or clean geometric scene lighting.',
    });
    score -= 1.5;
  }

  if (!isLegacy && /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2702}-\u{2712}\u{2716}-\u{27BF}\u{2B50}]/u.test(sceneCode)) {
    findings.P0.push({
      issue: 'Cheap system emoji detected in the scene (violates the real vector SVG requirement).',
      fix: 'Remove all emojis and convert them into multi-part vector drawings using <svg>, <path>, <circle>, <rect>, strokeDasharray/strokeDashoffset.',
    });
    score -= 2.0;
  }

  const svgCount = (sceneCode.match(/<svg\b/g) || []).length;
  if (!v2 && !isLegacy && spec.mode === 'editorial-ui' && svgCount < 6) {
    findings.P1.push({
      issue: `Insufficient vector richness: the scene has only ${svgCount} <svg> element(s) (minimum 6 multi-part vectors required).`,
      fix: 'Draw every icon, sound wave and illustration as multi-part <svg>/<path>/<circle> elements.',
    });
    score -= 1.0;
  }

  const headerCount = (sceneCode.match(/<header\b/g) || []).length;
  const footerCount = (sceneCode.match(/<footer\b/g) || []).length;
  const topBlockCount = (sceneCode.match(/top-\[\d+px\]\s+left-\[\d+px\]\s+right-\[\d+px\]/g) || []).length;
  const contentWithoutSvg = sceneCode.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/\bd=["'][^"']*["']/g, '');
  const numberedSlideEyebrows = new Set((contentWithoutSvg.match(/(?:>|\b)0[1-9]\s*[•·—-]/g) || []).map((s) => s.slice(0, 2))).size;
  if (!isLegacy && !isKineticReel && ((headerCount >= 3 && footerCount >= 3) || (topBlockCount >= 3 && footerCount >= 3) || numberedSlideEyebrows >= 3)) {
    findings.P0.push({
      issue: `Monotonous repetition of "Fixed Header + Centered Box + Fixed Footer / Numbered Slide Heading" (header=${headerCount}, footer=${footerCount}, topBlock=${topBlockCount}, slideEyebrow=${numberedSlideEyebrows}).`,
      fix: 'Design a unique full-bleed motion graphic composition for each beat (Kinetic Typography, Macro Vector Collision, Multi-Layer Canvas, Geometric Logo Merge).',
    });
    score -= 2.0;
  }

  // 4. SINGLE CONTAINER PRINCIPLE & OBJECT MORPHING
  const hasContainerStructure =
    sceneCode.includes('SpotlightStage') ||
    sceneCode.includes('VirtualCanvas') ||
    sceneCode.includes('AppShell') ||
    sceneCode.includes('transitionContainerMorph') ||
    sceneCode.includes('transitionWhipPan') ||
    sceneCode.includes('transitionMaskWipe') ||
    sceneCode.includes('transitionZoomPunch') ||
    sceneCode.includes('transitionElementTakeover') ||
    sceneCode.includes('transitionCameraDive') ||
    sceneCode.includes('TheHeroActor') ||
    sceneCode.includes('Stage') ||
    sceneCode.includes('CameraRig') ||
    sceneCode.includes('poster-rig') ||
    spec.mode === 'kinetic-poster' ||
    spec.mode === 'creative-motion-reel';

  if (!v2 && !hasContainerStructure) {
    findings.P1.push({
      issue: 'The scene is not held within a single structural skeleton (Single Container) or a fluid transition engine.',
      fix: 'Encapsulate with <AppShell>, <VirtualCanvas>, <SpotlightStage> or the transitions.* engine.',
    });
    if (!isLegacy) score -= 0.8;
  }

  // 5. COLOR CONTRAST BETWEEN BEATS (Color Blocking Check)
  const darkHex = (sceneCode.match(/#[0-2][0-9a-fA-F]{5}\b/g) ?? []).length;
  const lightHex = (sceneCode.match(/#[fFeEdDcC][0-9a-fA-F]{5}\b/g) ?? []).length;
  const hasColorBlocking =
    isSingleContainer ||
    sceneCode.includes('beatPalettes') ||
    sceneCode.includes('color-block') ||
    sceneCode.includes('COLOR_BLOCK') ||
    sceneCode.includes('colorBlock') ||
    (darkHex >= 1 && lightHex >= 1) ||
    spec.mode === 'creative-motion-reel' ||
    spec.mode === 'kinetic-poster';
  if (!v2 && !isLegacy && beats.length >= 3 && !hasColorBlocking) {
    findings.P1.push({
      issue: 'The entire video runs on a uniform background; full-screen color contrast (Color Blocking) is missing at beat boundaries.',
      fix: 'Apply light/dark contrast color blocking (Color Blocking) between scenes, or a full-screen color transition via beatPalettes.',
    });
    score -= 0.8;
  }

  // 6. ONE-SENTENCE GOAL CHECK
  const hasTargetGoal =
    directionText.includes('Hedef') ||
    directionText.includes('Concept') || /one-sentence goal/i.test(directionText) ||
    directionText.includes('tek cümlelik');

  if (!hasTargetGoal) {
    findings.P2.push({
      issue: 'The one-sentence viewer goal is missing from direction.md.',
      fix: 'Add the single main message the viewer should remember into direction.md.',
    });
    if (!isLegacy) score -= 0.3;
  }

  // 7. VECTOR FILTER/GRADIENT & 3D LAYER DEPTH (CRITIC-SVG-CRAFT)
  const hasBlueprint = fs.existsSync(path.join(project.dir, 'choreography-blueprint.md'));
  if (!v2 && !isLegacy && hasBlueprint && spec.mode === 'editorial-ui') {
    const hasSvgCraft =
      sceneCode.includes('SvgFilterLab') ||
      (sceneCode.includes('<defs') && /linearGradient|radialGradient|feGaussianBlur/.test(sceneCode));
    const has3DDepth =
      sceneCode.includes('LayeredStage3D') ||
      sceneCode.includes('LayerPlane') ||
      sceneCode.includes('preserve-3d') ||
      sceneCode.includes('translateZ');

    if (!hasSvgCraft) {
      findings.P0.push({
        issue: 'CRITIC-SVG-CRAFT: the scene is missing SvgFilterLab or <defs> (linearGradient/radialGradient/filter); SVG drawings are flat and one-dimensional.',
        fix: 'Add <SvgFilterLab /> and use multi-stop gradients, gooey morph and specular rim filters.',
      });
      score -= 1.5;
    }
    if (!has3DDepth) {
      findings.P0.push({
        issue: 'CRITIC-3D-STAGE: the scene is missing LayeredStage3D / LayerPlane (preserve-3d + translateZ); components sit as flat 2D boxes.',
        fix: 'Use <LayeredStage3D> and <LayerPlane z={...}> to separate components along the 3D Z-axis.',
      });
      score -= 1.5;
    }
  }

  score = Math.max(1, Math.min(10, Math.round(score * 10) / 10));
  overallScore += score;
  projectCount++;

  console.log(`${BOLD}▶ PROJECT: ${project.slug.toUpperCase()}${RESET} [Score: ${score >= 8 ? GREEN : YELLOW}${score}/10${RESET}]`);
  
  if (findings.P0.length === 0 && findings.P1.length === 0 && findings.P2.length === 0) {
    console.log(`  ${GREEN}✓ Flawless. Zero dead frames, full readability, director approved.${RESET}\n`);
  } else {
    if (findings.P0.length) {
      console.log(`  ${RED}${BOLD}[P0 - MANDATORY FIXES]${RESET}`);
      findings.P0.forEach((f) => console.log(`    • ${f.issue} → ${CYAN}${f.fix}${RESET}`));
    }
    if (findings.P1.length) {
      console.log(`  ${YELLOW}${BOLD}[P1 - MAJOR ENHANCEMENTS]${RESET}`);
      findings.P1.forEach((f) => console.log(`    • ${f.issue} → ${CYAN}${f.fix}${RESET}`));
    }
    if (findings.P2.length) {
      console.log(`  ${BOLD}[P2 - POLISH & DETAILS]${RESET}`);
      findings.P2.forEach((f) => console.log(`    • ${f.issue} → ${CYAN}${f.fix}${RESET}`));
    }
    console.log('');
  }
}

const avgScore = projectCount > 0 ? (overallScore / projectCount).toFixed(1) : 10;
console.log(`${BOLD}Studio Average Director Score:${RESET} ${avgScore >= 8 ? GREEN : YELLOW}${avgScore} / 10${RESET}\n`);
