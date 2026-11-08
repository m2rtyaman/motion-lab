#!/usr/bin/env node
/**
 * craft-audit.mjs
 * Motion Studio v0.9 Visual Craft & Determinism Auditor.
 * Checks blind coordinate jitter, letter avatars, linear easing, broken Three.js clocks,
 * unanchored 3D cards, disconnected bento slop and text redundancy.
 *
 * Usage:
 *   node scripts/craft-audit.mjs [--project <slug>]
 */

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, resolveTargets, rootDir, isHarnessV2 } from './lib/projects.mjs';

const args = parseArgs();
const targets = resolveTargets(args);

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

console.log(`\n${BOLD}==================================================${RESET}`);
console.log(`${BOLD}🎨 CRAFT AUDIT & ADVERSARIAL VISUAL GATE (v0.9)${RESET}`);
console.log(`${BOLD}==================================================${RESET}`);

let totalErrors = 0;
let totalWarnings = 0;

for (const project of targets) {
  const sceneFile = project.scene;
  const specFile = project.spec;

  if (!fs.existsSync(sceneFile)) continue;

  const code = fs.readFileSync(sceneFile, 'utf8');
  const spec = fs.existsSync(specFile) ? JSON.parse(fs.readFileSync(specFile, 'utf8').replace(/^\uFEFF/, '')) : {};
  const isLegacy = spec.legacy === true;
  const v2 = isHarnessV2(spec); // v2: shell-anchor / container-morph / 3D-stage keyword rules are skipped

  const errors = [];
  const warnings = [];

  // 1. Letter Avatar Ban (lazy two-letter avatars such as >SY<, >KA<)
  // To avoid blocking legitimate 2-letter words in JSX such as <span>AI</span>, <span>UI</span>, <button>OK</button>, <span>US</span>,
  // only avatar components or elements with an avatar class are targeted.
  const initialsAvatarRegex = /<(?:[A-Za-z0-9]*Avatar|[a-z0-9]+[^>]*class(?:Name)?=["'][^"']*\bavatar\b[^"']*)[^>]*>[A-Z]{2}<\//i;
  if (initialsAvatarRegex.test(code)) {
    errors.push('P0: Lazy two-uppercase-letter avatar detected (>SY< etc.). Use VectorAvatarPortrait.');
  }

  // 2. Linear & Banned Easing check
  if (/ease\s*:\s*["']linear["']/i.test(code) && spec.mode !== 'creative-motion-reel' && spec.mode !== 'kinetic-poster') {
    errors.push('P0: Banned "linear" easing found in animations! Use SpringStaggerGroup or power3.out.');
  }
  if (/ease\s*:\s*["']easeInOut["']/i.test(code) || /ease\s*:\s*["']ease\.inOut["']/i.test(code)) {
    warnings.push('P1: Standard "easeInOut" detected. For natural motion, prefer spring physics or expo.inOut.');
  }

  // 3. Three.js Determinism check
  if (/clock\.getElapsedTime\(\)/.test(code) || /useFrame\s*\(\s*\([^)]*\)\s*=>[^}]*\+=\s*delta/.test(code)) {
    errors.push('P0: Clock/delta usage that breaks determinism found in the Three.js scene! Use Remotion useCurrentFrame().');
  }

  // 4. Raw/blind SVG polygon coordinate fabrication check
  const longRawSvgPath = /<path[^>]+d=["'][MC][^"']{120,}["']/g;
  const hasVectorImport = /from\s+["'].*\/assets\/vectors/i.test(code) || /from\s+["'].*\/procedural/i.test(code);
  if (longRawSvgPath.test(code) && !hasVectorImport) {
    warnings.push('P1: Long freehand SVG coordinates detected in Scene.tsx. Use VerifiedVectorLibrary or ParametricCurves instead of blind coordinate jitter.');
  }

  // 5. Static Scene / Dead Frame check
  const hasAliveMotion =
    /AmbientAliveDriver/.test(code) ||
    /useSecondaryMotion/.test(code) ||
    /Math\.sin\s*\(\s*frame/.test(code) ||
    /microPulse/.test(code) ||
    /TemplateFrame/.test(code);

  if (!v2 && !hasAliveMotion && !isLegacy && spec.mode === 'editorial-ui') {
    warnings.push('P1: No continuously alive micro-motion found in the scene. Use AmbientAliveDriver or sin(frame) during text reading gaps.');
  }

  // 6. Window and Architectural Scene Anchoring (Architectural or Hardware Shell Anchor)
  const hasUIComponents = /ParticipantStudioTile|TelemetryBentoCard|EncryptedChatStream|MetricCardRow|BentoCard|SpecularCard|MetricTelemetryCard|EditorialDialogueCard|PipelineTerminalCard|SplitComparisonCard|TelemetryTile/.test(code);
  const hasShellAnchor = /PrecisionDashboardShell|DeviceMockupStage|MacOSSequoiaWindow|BrowserFrame|AppShell|SpotlightStage|VirtualCanvas|WorldStage|TerminalShell|TheHeroActor|ContainerMorphBridge|HairlineGrid|KineticVectorStage|CameraRig|FullScreenStage|FullBleedStage|AuthenticBrandShell|YouTubeStage|BrandStage|CinemaStage|WatchPageShell|BrandCanvas/.test(code);

  if (!v2 && hasUIComponents && !hasShellAnchor) {
    errors.push('P0: Disconnected cards floating in space (Disconnected Floating Bento Slop) detected! UI components must be locked inside an architectural grid (HairlineGrid, KineticVectorStage, SpotlightStage) or a Hardware Shell.');
  }

  // 7. Single Container Morphology / Graphic Anchor transition check
  const hasContainerMorph = /transition(ContainerMorph|WhipPan|MaskWipe|ZoomPunch|ElementTakeover|CameraDive)|GraphicAnchor|morphProgress|containerMorph|BrowserFrame|SpotlightStage|BackdropField|TheHeroActor|the-hero-actor|ContainerMorphBridge/.test(code);
  if (!v2 && (spec.mode === 'editorial-ui' || spec.mode === 'hybrid-orchestrated') && !isLegacy && !hasContainerMorph) {
    errors.push('P0: Single Container Morphology / Graphic Anchor transition missing! Instead of disconnected slide transitions between scenes, a single-container morph (transitionContainerMorph, transitionElementTakeover, transitionCameraDive or Graphic Anchor) is required.');
  }

  // 8. Ban on unanchored floating in 3D space (Unanchored in 3D Space)
  const has3DStage = /LayeredStage3D|LayerPlane/.test(code);
  if (!v2 && has3DStage && hasUIComponents && !hasShellAnchor) {
    errors.push('P0: Unanchored components floating in 3D space detected! Cards must be placed inside a Hardware Shell or PrecisionDashboardShell.');
  }

  // 8b. Unanchored UI element floating directly on the 3D layer
  // SpotlightStage, KineticVectorStage, FullScreenStage and free-standing SpecularCard usage is allowed.
  const unanchored3DMatch = /<LayerPlane[^>]*>(?:(?!PrecisionDashboardShell|DeviceMockupStage|MacOSSequoiaWindow|BrowserFrame|AppShell|SpotlightStage|KineticVectorStage|FullScreenStage|FullBleedStage|AuthenticBrandShell|HairlineGrid|CameraRig|TerminalShell|WorldStage|<\/LayerPlane>)[\s\S])*?<(ParticipantStudioTile|TelemetryBentoCard|EncryptedChatStream|MetricCardRow|BentoCard|MetricTelemetryCard|EditorialDialogueCard|PipelineTerminalCard|SplitComparisonCard)\b/.test(code);
  if (!v2 && has3DStage && unanchored3DMatch) {
    errors.push('P0: Standalone UI card inside LayerPlane not wrapped in a Hardware Shell or Window Anchor detected! All UI elements must be locked inside PrecisionDashboardShell, SpotlightStage or DeviceMockupStage.');
  }

  // 9. Zero-Redundancy Typography Rule (Zero Redundancy / No Text Duplication)
  const propMatches = Array.from(code.matchAll(/\b(?:title|subtitle|heading|headline|tag|badge|label|statusBadge|status)\s*=\s*["']([^"']{10,})["']/g)).map((m) => m[1].trim());
  const tagMatches = Array.from(code.matchAll(/<(?:h[1-6]|span|p)\b[^>]*class(?:Name)?=["'][^"']*(?:title|heading|headline|tag|badge|label|status)[^"']*["'][^>]*>([^<]{10,})<\/(?:h[1-6]|span|p)>/gi)).map((m) => m[1].trim());
  const combinedTexts = [...propMatches, ...tagMatches];
  const stringFreq = {};
  for (const str of combinedTexts) {
    stringFreq[str] = (stringFreq[str] || 0) + 1;
  }
  const duplicates = Object.keys(stringFreq).filter((s) => stringFreq[s] > 1);
  if (duplicates.length > 0) {
    errors.push(`P0: Semantic redundancy / fake text repetition (Text Redundancy) detected! The same text cannot be repeated between a heading and a UI badge: "${duplicates[0]}"`);
  }

  console.log(`\n▶ [${project.slug}]`);
  if (errors.length === 0 && warnings.length === 0) {
    console.log(`  ${GREEN}✓ Flawless Craftsmanship! Zero P0/P1 violations found (10/10).${RESET}`);
  } else {
    if (warnings.length > 0) {
      warnings.forEach((w) => console.log(`  ${YELLOW}⚠️  ${w}${RESET}`));
      totalWarnings += warnings.length;
    }
    if (errors.length > 0) {
      errors.forEach((e) => console.log(`  ${RED}❌  ${e}${RESET}`));
      totalErrors += errors.length;
    }
  }
}

console.log(`\n==================================================`);
if (totalErrors > 0) {
  console.log(`${RED}${BOLD}🛑 Craft audit failed! Total ${totalErrors} P0 violations detected.${RESET}\n`);
  process.exit(1);
}

console.log(`${GREEN}${BOLD}✨ Craft audit passed successfully (P0: 0, Warnings: ${totalWarnings}).${RESET}\n`);
process.exit(0);
