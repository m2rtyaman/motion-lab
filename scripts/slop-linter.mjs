import fs from "node:fs";
import path from "node:path";
import { ENGINE_DIRS, parseArgs, resolveTargets, rel, rootDir, walk, isHarnessV2 } from "./lib/projects.mjs";

/**
 * UNIVERSAL MOTION STUDIO LINTER V4 (multi-project)
 * Usage: node scripts/slop-linter.mjs [--project <slug>]   (all projects if omitted)
 * Scope  : shared engine folders + the selected projects' folders.
 * Mode   : read from each project's spec.json "mode" field (never guessed from code).
 */
const RED = "\x1b[31m", GREEN = "\x1b[32m", YELLOW = "\x1b[33m", CYAN_ANSI = "\x1b[36m", BOLD = "\x1b[1m", RESET = "\x1b[0m";
const SKIP_FILES = new Set(["vite-env.d.ts", "registry.generated.ts", "HtmlFrameDriver.tsx", "template-manifest.generated.ts"]);

const targets = resolveTargets(parseArgs());
if (targets.length === 0) {
  console.error(`${RED}${BOLD}[ERROR] No projects to lint.${RESET} Create one with: pnpm new <slug>`);
  process.exit(1);
}

const parseSpec = (t) => JSON.parse(fs.readFileSync(t.spec, "utf-8").replace(/^\uFEFF/, ""));

// Rule 1: Banned colors (only raw/bright neon slop colors; professional brand colors are allowed)
const FORBIDDEN_COLORS = [
  { pattern: /#00ffff\b/i, name: "Banned color: raw electric neon cyan (#00ffff)" },
  { pattern: /#ff00ff\b/i, name: "Banned color: raw neon magenta (#ff00ff)" },
];
// Rule 2: Only raw cyan/magenta neon glow is banned; elegant brand glows and depth shadows (drop-shadow, box-shadow) are allowed
const FORBIDDEN_GLOW = [
  { pattern: /drop-shadow\([^)]*(#00ffff|#ff00ff|rgba\(\s*0\s*,\s*255\s*,\s*255|rgba\(\s*255\s*,\s*0\s*,\s*255)/i, name: "Slop neon glow: raw cyan/magenta drop-shadow detected" },
  { pattern: /box-shadow:[^;]*(#00ffff|#ff00ff|rgba\(\s*0\s*,\s*255\s*,\s*255|rgba\(\s*255\s*,\s*0\s*,\s*255)/i, name: "Slop neon glow: raw cyan/magenta box-shadow detected" },
];
// Rule 3: Primitive mascot / cartoon primitives
const FORBIDDEN_CARTOON = [
  { pattern: /anchor-(mustache|eyes|head|station|body)/i, name: "Cartoon primitive: big-head mascot identifier" },
  { pattern: /mustache/i, name: "Cartoon primitive: mustache drawing vector" },
];
// Rule 4: Non-GPU animation (width, height, borderRadius, strokeDashoffset, attr are allowed for real object morphing)
const LAYOUT_THRASHING_PROPS = [
  { pattern: /^\s*(top|left|bottom|right|margin|padding)\s*:/i, name: "Non-GPU animation: direct position/margin tweening (use an x/y transform or width/height/borderRadius morph)" },
];
// Rule 5: Micro-font ban
const FORBIDDEN_MICRO_FONTS = [
  { pattern: /\btext-xs\b/, name: "Broadcast scale violation: 'text-xs' (12px) is unreadable in 1080p vertical video (use min 18px)" },
  { pattern: /\btext-sm\b/, name: "Broadcast scale violation: 'text-sm' (14px) is too small in 1080p vertical video (use min 18px)" },
  { pattern: /text-\[(8|9|10|11|12|13|14)px\]/, name: "Broadcast scale violation: micro-font below 14px detected (broadcast scale min 18px)" },
];
// Rule 6 (cinematic-world projects only): fake HUD / badge
const FORBIDDEN_WORLD_HUD = [
  { pattern: /hudTagLeft|hudTagRight|hudFooterLeft|hudFooterRight/, name: "Mode violation (cinematic-world): technical bulletin HUD tags cannot be used in a character/location scene" },
  { pattern: /SECTOR_|THREAT_LEVEL|AGGRO:|COMBAT_STATE/, name: "Mode violation (cinematic-world): fake HUD/telemetry badge text cluttering the scene detected" },
];
// Rule 7: System emoji ban (real multi-part <svg> vector requirement)
const FORBIDDEN_EMOJIS = [
  {
    pattern: /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2702}-\u{2712}\u{2716}-\u{27BF}\u{2B50}]/u,
    name: "Cheap system emoji ban: system emojis (💬, 👥, 📞, 📢, 🎙️, ⚡, 🚀, 💻, 🎨, 🔒, ✅, ⚠️ etc.) cannot be used in a scene; use multi-part <svg>, <path>, <circle>, <rect> vector drawings",
  },
];
// Rule 7b: Banned descriptive meta-text ("kinetik geometri", "uluslararası tipografik stil", "kesintisiz form sürekliliği", etc.)
const FORBIDDEN_META_TEXT = [
  { pattern: /kinetik\s+geometri/i, name: "Banned descriptive meta-text: decorative meta-phrases describing the scene, such as 'kinetik geometri', are banned (use brief or product content)" },
  { pattern: /uluslararas[ıi]\s+tipografik\s+stil/i, name: "Banned descriptive meta-text: 'uluslararası tipografik stil' decorative jargon detected" },
  { pattern: /kesintisiz\s+form\s+s[üu]reklili[ğg]i/i, name: "Banned descriptive meta-text: 'kesintisiz form sürekliliği' decorative jargon detected" },
  { pattern: /motion\s+tasar[ıi]m\s+manifestosu/i, name: "Banned descriptive meta-text: 'motion tasarım manifestosu' detected" },
  { pattern: /parametrik\s+e[ğg]riler/i, name: "Banned descriptive meta-text: 'parametrik eğriler' detected" },
  { pattern: /generatif\s+sistemler/i, name: "Banned descriptive meta-text: 'generatif sistemler' detected" },
  { pattern: /derinlik\s+ve\s+perspektif/i, name: "Banned descriptive meta-text: 'derinlik ve perspektif' detected" },
  { pattern: /motion\s+lab\s*\/+\s*60\s*fps/i, name: "Banned debug watermark: 'MOTION LAB // 60 FPS' decorative meta-slogan is banned" },
  { pattern: /single\s+living\s+container/i, name: "Banned meta-slogan: 'SINGLE LIVING CONTAINER' decorative meta-slogan is banned" },
  { pattern: /60\s*fps\s+deterministic/i, name: "Banned meta-slogan: '60 FPS DETERMINISTIC' decorative meta-slogan is banned" },
  { pattern: /b-roll\s+engine/i, name: "Banned meta-slogan: 'B-ROLL ENGINE' decorative meta-slogan is banned" },
  { pattern: /no\s+slide\s+cuts/i, name: "Banned meta-slogan: 'NO SLIDE CUTS' decorative meta-slogan is banned" },
  { pattern: /one\s+living\s+morph\s+container/i, name: "Banned meta-slogan: 'ONE LIVING MORPH CONTAINER' decorative meta-slogan is banned" },
  { pattern: /motion\s+lab\s+\d+(?:\.\d+)?\s+suite/i, name: "Banned meta-slogan: versioned meta-text such as 'MOTION LAB <version> SUITE' is banned" },
  { pattern: /autonomous\s+motion\s+lab/i, name: "Banned meta-slogan: 'AUTONOMOUS MOTION LAB' decorative meta-slogan is banned" },
  { pattern: /autonomous\s+multi-archetype/i, name: "Banned meta-slogan: 'Autonomous Multi-Archetype' decorative jargon is banned" },
  { pattern: /quantum\s+execution\s+runtime/i, name: "Banned AI-slop jargon: 'Quantum Execution Runtime' fabricated cyber jargon is banned (use real product copy)" },
  { pattern: /enclave-lon1-v4/i, name: "Banned fixed slop text: 'enclave-lon1-v4' fake telemetry filler is banned" },
];

const violations = [];

function lintStyle(file, worldMode, isLegacy = false) {
  const fileRel = rel(file);
  const lines = fs.readFileSync(file, "utf-8").split("\n");
  let insideAnimationBlock = false;
  const add = (lineNum, rule, description, code) => violations.push({ file: fileRel, lineNum, rule, description, code });

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) return;
    if (trimmed.includes(".to(") || trimmed.includes(".from(") || trimmed.includes(".fromTo(") || trimmed.includes("animate={")) insideAnimationBlock = true;
    if (insideAnimationBlock && (trimmed.endsWith(");") || trimmed.endsWith("}"))) insideAnimationBlock = false;

    for (const { pattern, name } of FORBIDDEN_COLORS) if (pattern.test(line)) add(lineNum, "Banned Colors and Gradients", name, trimmed);
    for (const { pattern, name } of FORBIDDEN_GLOW) if (pattern.test(line)) add(lineNum, "Fake Neon / Glow Effect", name, trimmed);
    for (const { pattern, name } of FORBIDDEN_CARTOON) if (pattern.test(line)) add(lineNum, "Primitive Mascot / Cartoon Primitive", name, trimmed);
    if (insideAnimationBlock)
      for (const { pattern, name } of LAYOUT_THRASHING_PROPS) if (pattern.test(trimmed)) add(lineNum, "Non-GPU Animation (Layout Thrashing)", name, trimmed);
    for (const { pattern, name } of FORBIDDEN_MICRO_FONTS) if (pattern.test(line)) add(lineNum, "Broadcast Scale Violation (Micro-Font Ban)", name, trimmed);
    if (worldMode)
      for (const { pattern, name } of FORBIDDEN_WORLD_HUD) if (pattern.test(line)) add(lineNum, "Cinematic-World Purity Violation (HUD/Badge Ban)", name, trimmed);
    if (!isLegacy) {
      for (const { pattern, name } of FORBIDDEN_EMOJIS) if (pattern.test(line)) add(lineNum, "System Emoji Violation (SVG Vector Requirement)", name, trimmed);
      for (const { pattern, name } of FORBIDDEN_META_TEXT) if (pattern.test(line)) add(lineNum, "Banned Descriptive Meta-Text / Decorative Slogan Ban", name, trimmed);
    }
  });
}

function lintProjectArchitecture(t, spec) {
  const mode = spec.mode;
  const isLegacy = spec.legacy === true;
  const sceneRel = rel(t.scene);
  const content = fs.existsSync(t.scene) ? fs.readFileSync(t.scene, "utf-8") : "";
  const add = (rule, description, code) => violations.push({ file: sceneRel, lineNum: 1, rule, description, code });
  if (!content) return add("Project Violation", "Scene.tsx is missing.", "Missing Scene.tsx");
  // Harness v2: keyword/stage requirements are replaced by scripts/timeline-audit.mjs + ast-lint allowlist.
  if (isHarnessV2(spec)) return;

  if (mode === "cinematic-world") {
    if (!content.includes("WorldStage") || !content.includes("CharacterActor"))
      add("Cinematic-World Engine Violation", "Character/location scenes must use 'WorldStage' (full-screen 2.5D world) and 'CharacterActor'.", "Missing <WorldStage> or <CharacterActor>");
  } else if (mode === "editorial-ui") {
    const usesSpatial = content.includes("SpatialCamera");
    const usesSpotlight = content.includes("SpotlightStage") && content.includes("CameraRig");
    const usesTransitions = /transition(WhipPan|MaskWipe|ZoomPunch|ContainerMorph)/.test(content);
    if (!usesSpatial && !usesSpotlight && !usesTransitions)
      add("Editorial-UI Engine Violation", "Editorial/data scenes must use 'SpatialCamera', 'SpotlightStage + CameraRig', or the fluid transition engine (transitions).", "Missing <SpatialCamera>, <SpotlightStage>, or transitions");
  } else if (mode === "kinetic-poster" || mode === "creative-motion-reel") {
    if (!content.includes("useRemotionGSAP"))
      add("Kinetic-Poster Engine Violation", "Kinetic poster and creative reel scenes must build their animation frame-locked with 'useRemotionGSAP'.", "Missing useRemotionGSAP");
  } else if (mode === "hybrid-orchestrated") {
    const hasHeroContinuity =
      content.includes("TheHeroActor") ||
      content.includes("the-hero-actor") ||
      content.includes("#the-morph-container") ||
      content.includes("ContainerMorphBridge") ||
      content.includes("transitionElementTakeover") ||
      content.includes("transitionCameraDive");
    if (!hasHeroContinuity)
      add("Hybrid-Orchestrated Engine Violation", "Hybrid orchestration scenes must use seamless handoff via 'TheHeroActor', 'ContainerMorphBridge', 'transitionElementTakeover' or 'transitionCameraDive'.", "Missing <TheHeroActor> or component-driven transition");
    if (!content.includes("useRemotionGSAP"))
      add("Hybrid-Orchestrated Engine Violation", "Hybrid scenes must build their animation frame-locked with 'useRemotionGSAP'.", "Missing useRemotionGSAP");
  }
  const isHybrid = mode === "hybrid-orchestrated";
  const isKineticReel = mode === "kinetic-poster" || mode === "creative-motion-reel";
  const isSingleContainer =
    isHybrid ||
    content.includes("#the-hero-actor") ||
    content.includes("the-hero-actor") ||
    content.includes("TheHeroActor") ||
    content.includes("#the-morph-container") ||
    content.includes("the-morph-container") ||
    content.includes("SingleContainer") ||
    (spec.transitions && spec.transitions.some((t) => t.type === "container-morph")) ||
    spec.singleContainer === true;
  const hasCameraChoreography =
    isKineticReel ||
    isSingleContainer ||
    content.includes("animateCamera") ||
    content.includes("applyIsometricTilt") ||
    content.includes("applyFocusZoom") ||
    content.includes("applyCanvasPan") ||
    content.includes("applyCameraSettle") ||
    content.includes("CAMERA_KEYFRAMES") ||
    content.includes("SPEC_CAMERA") ||
    content.includes("CameraRig") ||
    content.includes(".camera-rig");
  if (!hasCameraChoreography)
    add("Cinematic Camera Violation", "The scene cannot stay static; a camera move ('animateCamera' or 'applyIsometricTilt/FocusZoom') must be defined.", "Missing camera choreography call");

  // Rule 8: Ban on "Fixed Header + Centered Box + Fixed Footer" (3-part sandwich / slide heading template)
  if (!isLegacy && !isKineticReel) {
    const headerCount = (content.match(/<header\b/g) || []).length;
    const footerCount = (content.match(/<footer\b/g) || []).length;
    const topBlockCount = (content.match(/top-\[\d+px\]\s+left-\[\d+px\]\s+right-\[\d+px\]/g) || []).length;
    const contentWithoutSvg = content.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/\bd=["'][^"']*["']/g, '');
    const numberedSlideEyebrows = new Set((contentWithoutSvg.match(/\b0[1-9]\s*[•·—-]/g) || []).map((s) => s.slice(0, 2))).size;
    if ((headerCount >= 3 && footerCount >= 3) || (topBlockCount >= 3 && footerCount >= 3) || numberedSlideEyebrows >= 3) {
      add(
        "Monotonous 3-Part Sandwich / Slide Heading Template Violation",
        `Repeating top header bar detected in the scene (header=${headerCount}, footer=${footerCount}, topBlock=${topBlockCount}, numbered slide heading=${numberedSlideEyebrows}). Using the same 'Top Header + Centered Box + Bottom Footer' template on every beat is banned; each beat needs its own full-bleed motion graphic composition.`,
        "Repeated header/top-block/numbered-eyebrow + center box template across beats"
      );
    }

    // Rule 9: Vector filter/gradient (SvgFilterLab) & 3D layer (LayeredStage3D) requirement (blueprint projects)
    const hasBlueprint = fs.existsSync(path.join(t.dir, "choreography-blueprint.md"));
    if (hasBlueprint && mode === "editorial-ui") {
      const hasSvgCraft =
        content.includes("SvgFilterLab") ||
        (content.includes("<defs") && /linearGradient|radialGradient|feGaussianBlur/.test(content));
      const has3DDepth =
        content.includes("LayeredStage3D") ||
        content.includes("LayerPlane") ||
        content.includes("preserve-3d") ||
        content.includes("translateZ");

      if (!hasSvgCraft) {
        add(
          "Shallow Vector (Flat SVG) Violation",
          "The blueprint scene does not use SvgFilterLab or <defs> (linearGradient/radialGradient/filter). Use a multi-layer gradient and filter lab instead of a flat single-color SVG.",
          "Missing <SvgFilterLab /> or <defs> gradients/filters"
        );
      }
      if (!has3DDepth) {
        add(
          "Flat 2D Box (Flat Stage) Violation",
          "The blueprint scene does not use LayeredStage3D / LayerPlane (preserve-3d + translateZ). Layers must be separated along the 3D Z-axis.",
          "Missing <LayeredStage3D> / <LayerPlane> 3D depth planes"
        );
      }
    }

    // Rule 10: Window / architectural scene anchoring (Architectural or Shell Anchor)
    const hasUIComponents = /ParticipantStudioTile|TelemetryBentoCard|EncryptedChatStream|MetricCardRow|BentoCard|SpecularCard|MetricTelemetryCard|EditorialDialogueCard|PipelineTerminalCard|SplitComparisonCard/.test(content);
    const hasShellAnchor = /PrecisionDashboardShell|DeviceMockupStage|MacOSSequoiaWindow|BrowserFrame|AppShell|SpotlightStage|VirtualCanvas|WorldStage|HairlineGrid|KineticVectorStage|CameraRig|ContainerMorphBridge|FullScreenStage|FullBleedStage|AuthenticBrandShell|YouTubeStage|BrandStage|CinemaStage|WatchPageShell|BrandCanvas/.test(content);
    if (hasUIComponents && !hasShellAnchor) {
      add(
        "Window/Architectural Scene Anchor Violation (Floating Bento Slop)",
        "Components cannot float in empty space; anchor them inside an architectural grid ('HairlineGrid', 'KineticVectorStage', 'SpotlightStage') or a hardware shell.",
        "Missing architectural or shell anchor"
      );
    }

    // Rule 10b: Badge & header clutter ban (Anti-Badge & Header Clutter Gate)
    if (isHybrid) {
      const kickerCount = (content.match(/<KickerBadge\b/g) || []).length;
      const capsuleCount = (content.match(/<CapsulePill\b/g) || []).length;
      const statusBadgeCount = (content.match(/\bstatusBadge\s*=/g) || []).length;
      const subtitleCount = (content.match(/\bsubtitle\s*=/g) || []).length;
      const totalBadges = kickerCount + capsuleCount + statusBadgeCount + subtitleCount;
      const numScenes = Array.isArray(spec.scenes) ? spec.scenes.length : Math.max(1, (spec.beats || []).length);
      const maxAllowedBadges = Math.max(12, numScenes * 4);
      if (totalBadges > maxAllowedBadges) {
        add(
          "Badge & Header Clutter Violation (Badge & Eyebrow Clutter Slop)",
          `The scene is cluttered with too many badges/tags/subtitles (${totalBadges} total: KickerBadge=${kickerCount}, CapsulePill=${capsuleCount}, statusBadge=${statusBadgeCount}, subtitle=${subtitleCount}). (At most ${maxAllowedBadges} badges/tags are allowed.)`,
          `Total badges/eyebrows: ${totalBadges} (max ${maxAllowedBadges} allowed)`
        );
      }
    }

    // Rule 11: Single Container Morphology / Graphic Anchor transition
    const hasContainerMorph = /transition(ContainerMorph|WhipPan|MaskWipe|ZoomPunch|ElementTakeover|CameraDive)|GraphicAnchor|morphProgress|containerMorph|BrowserFrame|SpotlightStage|BackdropField|TheHeroActor|the-hero-actor|ContainerMorphBridge/.test(content);
    if (mode === "editorial-ui" && !isLegacy && !hasContainerMorph) {
      add(
        "Single Container Morphology Violation (Lack of Container Morphing)",
        "Scene transitions must evolve by morphing a single graphic anchor into the next scene (transitionContainerMorph or Graphic Anchor).",
        "Missing container morphing / graphic anchor"
      );
    }

    // Rule 12: Ban on unanchored floating in 3D space
    // SpotlightStage, KineticVectorStage, FullScreenStage and free-standing SpecularCard usage is allowed.
    const has3DStage = /LayeredStage3D|LayerPlane/.test(content);
    const unanchored3DMatch = /<LayerPlane[^>]*>(?:(?!PrecisionDashboardShell|DeviceMockupStage|MacOSSequoiaWindow|BrowserFrame|AppShell|SpotlightStage|KineticVectorStage|FullScreenStage|FullBleedStage|AuthenticBrandShell|HairlineGrid|CameraRig|TerminalShell|WorldStage|<\/LayerPlane>)[\s\S])*?<(ParticipantStudioTile|TelemetryBentoCard|EncryptedChatStream|MetricCardRow|BentoCard|MetricTelemetryCard|EditorialDialogueCard|PipelineTerminalCard|SplitComparisonCard)\b/.test(content);
    if ((has3DStage && hasUIComponents && !hasShellAnchor) || (has3DStage && unanchored3DMatch)) {
      add(
        "Unanchored Floating in 3D Space Violation",
        "Standalone cards floating directly on the 3D layer were detected. Cards must be placed inside a Hardware Shell, SpotlightStage or PrecisionDashboardShell.",
        "Unanchored floating cards in 3D LayerPlane"
      );
    }

    // Rule 13: Zero-redundancy typography rule (Zero Redundancy / No Text Duplication)
    const propMatches = Array.from(content.matchAll(/\b(?:title|subtitle|heading|headline|tag|badge|label|statusBadge|status)\s*=\s*["']([^"']{10,})["']/g)).map((m) => m[1].trim());
    const tagMatches = Array.from(content.matchAll(/<(?:h[1-6]|span|p)\b[^>]*class(?:Name)?=["'][^"']*(?:title|heading|headline|tag|badge|label|status)[^"']*["'][^>]*>([^<]{10,})<\/(?:h[1-6]|span|p)>/gi)).map((m) => m[1].trim());
    const combinedTexts = [...propMatches, ...tagMatches];
    const stringFreq = {};
    for (const str of combinedTexts) {
      stringFreq[str] = (stringFreq[str] || 0) + 1;
    }
    const duplicates = Object.keys(stringFreq).filter((s) => stringFreq[s] > 1);
    if (duplicates.length > 0) {
      add(
        "Zero-Redundancy Typography Violation (Text Redundancy)",
        `Identical text repeated between headings and UI labels was detected: "${duplicates[0]}". A marketing heading should describe the benefit, and a label should describe the technical action.`,
        duplicates[0]
      );
    }

    // Rule 12: Realistic content & fake DevOps jargon ban (Never Invent Facts)
    const isConsumerApp = /whatsapp|chat|messenger|instagram|social|youtube|video|stream|music|entertainment|media|consumer|brand/i.test(t.slug);
    if (isConsumerApp) {
      const devopsJargonRegex = /\b(Quantum-Resistant|enclave-loc\d|ratchet\s+ratified|ops\/sec|Zero-Copy\s+Buffer|Zero-Knowledge\s+Keys|Zero-Downtime\s+POP\s+Mesh|TTFT\s*\/\/\s*SYNC)\b/i;
      const match = content.match(devopsJargonRegex);
      if (match) {
        add(
          "Fake DevOps Jargon & AI-Slop Violation (Never Invent Facts)",
          `In the consumer/mobile/brand-focused scene ('${t.slug}'), out-of-context invented server/telemetry filler was detected: '${match[0]}'. Show the product's real interface and real interactions (search, playback, subscribe, etc.).`,
          match[0]
        );
      }
    }
  }
}

// ---- tarama ----
const engineFiles = ENGINE_DIRS.flatMap((d) => walk(path.join(rootDir, "src", d), new Set([".ts", ".tsx"])));
engineFiles.filter((f) => !SKIP_FILES.has(path.basename(f))).forEach((f) => lintStyle(f, false, false));

let totalFiles = engineFiles.length;
const summaries = [];
for (const t of targets) {
  const spec = parseSpec(t);
  const mode = spec.mode;
  const isLegacy = spec.legacy === true;
  const files = walk(t.dir, new Set([".ts", ".tsx"])).filter((f) => !SKIP_FILES.has(path.basename(f)));
  totalFiles += files.length;
  files.forEach((f) => lintStyle(f, mode === "cinematic-world", isLegacy));
  lintProjectArchitecture(t, spec);
  summaries.push(`${t.slug} (${mode})`);
}

// ---- report ----
console.log(`\n${BOLD}====================================================${RESET}`);
console.log(`${BOLD}${CYAN_ANSI}   UNIVERSAL MOTION STUDIO LINTER V0.8   ${RESET}`);
console.log(`${BOLD}====================================================${RESET}`);
console.log(`Audited Files    : ${totalFiles} files (engine + ${targets.length} projects)`);
console.log(`Projects         : ${summaries.join(", ")}\n`);

if (violations.length > 0) {
  console.log(`${RED}${BOLD}[STUDIO AUDIT: FAILED] Detected ${violations.length} quality/architectural violations:${RESET}\n`);
  violations.forEach((v, i) => {
    console.log(`${RED}${BOLD}[VIOLATION ${i + 1}] ${v.file}:${v.lineNum}:${RESET} ${v.rule}`);
    console.log(`  Detail: ${v.description}`);
    console.log(`  Code  : ${YELLOW}${v.code}${RESET}\n`);
  });
  console.log(`${RED}${BOLD}Render aborted. Please revise the project according to studio invariants.${RESET}\n`);
  process.exit(1);
}
console.log(`${GREEN}${BOLD}[STUDIO AUDIT: PASSED] ${targets.length} projects comply 100% with studio standards.${RESET}`);
console.log(`${GREEN}✓ Zero neon glow slop, zero micro-fonts, 100% GPU purity, authentic paradigm engines${RESET}\n`);
process.exit(0);
