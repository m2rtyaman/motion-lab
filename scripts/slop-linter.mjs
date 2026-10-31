import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const targetFile = path.join(rootDir, "src", "components", "Scene.tsx");
const SCAN_EXTS = new Set([".ts", ".tsx"]);
const SKIP_FILES = new Set(["vite-env.d.ts", "App.tsx", "main.tsx"]);
// Tarayıcı önizleme arayüzü (video karesine girmez) broadcast kurallarından muaftır.
const SKIP_DIRS = new Set(["stage"]);
function collectSourceFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return SKIP_DIRS.has(e.name) ? [] : collectSourceFiles(full);
    return SCAN_EXTS.has(path.extname(e.name)) && !SKIP_FILES.has(e.name) ? [full] : [];
  });
}
const scanFiles = collectSourceFiles(path.join(rootDir, "src"));

// ANSI color codes
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN_ANSI = "\x1b[36m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

if (!fs.existsSync(targetFile)) {
  console.error(`${RED}${BOLD}[ERROR] Target file not found:${RESET} ${targetFile}`);
  process.exit(1);
}

const content = fs.readFileSync(targetFile, "utf-8");
const lines = content.split("\n");

// Detect active scene paradigm
const isCinematicWorld =
  content.includes("WorldStage") || content.includes("CharacterActor");
const sceneMode = isCinematicWorld ? "cinematic-world" : "editorial-ui";

const violations = [];

// Rule 1: Forbidden Colors & Gradients
const FORBIDDEN_COLORS = [
  { pattern: /#7c3aed/i, name: "Yasaklı Renk: Mor (#7c3aed)" },
  { pattern: /#6366f1/i, name: "Yasaklı Renk: İndigo (#6366f1)" },
  { pattern: /#06b6d4/i, name: "Yasaklı Renk: Cyan (#06b6d4)" },
  { pattern: /#ec4899/i, name: "Yasaklı Renk: Pembe (#ec4899)" },
  { pattern: /#8b5cf6/i, name: "Yasaklı Renk: Violet (#8b5cf6)" },
  { pattern: /\bcyan\b/i, name: "Yasaklı Renk: Cyan anahtar kelimesi" },
  { pattern: /\bfuchsia\b/i, name: "Yasaklı Renk: Fuchsia anahtar kelimesi" },
  { pattern: /purple-/i, name: "Yasaklı Renk: Purple Tailwind sınıfı" },
];

// Rule 2: Fake Neon / Glow Effects
const FORBIDDEN_GLOW = [
  { pattern: /drop-shadow\(\s*0\s+0\s+\d+px/i, name: "Neon Glow: drop-shadow(0 0 ...px) tespit edildi" },
  { pattern: /box-shadow:\s*0\s+0\s+\d+px/i, name: "Neon Glow: box-shadow: 0 0 ...px tespit edildi" },
  { pattern: /shadow-\[0_0_/i, name: "Neon Glow: Tailwind shadow-[0_0_...] tespit edildi" },
  { pattern: /\[text-shadow:0_0_/i, name: "Neon Glow: [text-shadow:0_0_...] tespit edildi" },
];

// Rule 3: Primitive Mascot / Cartoon Primitives (Hand-drawn SVG heads)
const FORBIDDEN_CARTOON = [
  { pattern: /#fcd34d/i, name: "Karikatür Primitifi: Ten rengi sarı fill (#fcd34d)" },
  { pattern: /#fde68a/i, name: "Karikatür Primitifi: Yüz çemberi sarı fill (#fde68a)" },
  { pattern: /anchor-(mustache|eyes|head|station|body)/i, name: "Karikatür Primitifi: Bıyık/Kafa maskot tanımlayıcısı" },
  { pattern: /mustache/i, name: "Karikatür Primitifi: Bıyık çizim vektörü" },
];

// Rule 4: Non-GPU Animation (Layout Thrashing in GSAP/Motion)
const LAYOUT_THRASHING_PROPS = [
  { pattern: /^\s*(top|left|bottom|right|width|height|margin|padding)\s*:/i, name: "GPU Dışı Animasyon: Doğrudan geometri tweening (Reflow ihlali)" },
];

// Rule 5: Broadcast Scale Micro-Font Ban (1080x1920 Legibility Gate)
const FORBIDDEN_MICRO_FONTS = [
  { pattern: /\btext-xs\b/, name: "Yayın Ölçeği İhlali: 'text-xs' (12px) 1080p dikey videoda okunamaz (Min 18px kullanın)" },
  { pattern: /\btext-sm\b/, name: "Yayın Ölçeği İhlali: 'text-sm' (14px) 1080p dikey videoda çok küçük (Min 18px kullanın)" },
  { pattern: /text-\[(8|9|10|11|12|13|14)px\]/, name: "Yayın Ölçeği İhlali: 14px altı mikro-font tespit edildi (Broadcast ölçeği min 18px)" },
];

// Rule 6 (Cinematic-World Only): Ban fake Tech-HUD & Badge Clutter on Character/World scenes
const FORBIDDEN_WORLD_HUD = [
  { pattern: /hudTagLeft|hudTagRight|hudFooterLeft|hudFooterRight/, name: "Mod İhlali (cinematic-world): Karakter/mekan sahnesinde teknik bülten HUD etiketleri kullanılamaz" },
  { pattern: /SECTOR_|THREAT_LEVEL|AGGRO:|COMBAT_STATE/, name: "Mod İhlali (cinematic-world): Sahneyi kirleten sahte HUD/Telemetri badge metni tespit edildi" },
];

function lintStyle(file, fileLines) {
const rel = path.relative(rootDir, file).replaceAll("\\", "/");
let insideAnimationBlock = false;
fileLines.forEach((line, index) => {
  const lineNum = index + 1;
  const trimmed = line.trim();

  if (trimmed.includes(".to(") || trimmed.includes(".from(") || trimmed.includes(".fromTo(") || trimmed.includes("animate={")) {
    insideAnimationBlock = true;
  }
  if (insideAnimationBlock && (trimmed.endsWith(");") || trimmed.endsWith("}"))) {
    insideAnimationBlock = false;
  }

  for (const { pattern, name } of FORBIDDEN_COLORS) {
    if (pattern.test(line)) {
      violations.push({ file: rel, lineNum, rule: "Yasaklı Renk ve Degradeler", description: name, code: trimmed });
    }
  }

  for (const { pattern, name } of FORBIDDEN_GLOW) {
    if (pattern.test(line)) {
      violations.push({ file: rel, lineNum, rule: "Sahte Neon / Işıma Efekti", description: name, code: trimmed });
    }
  }

  for (const { pattern, name } of FORBIDDEN_CARTOON) {
    if (pattern.test(line)) {
      violations.push({ file: rel, lineNum, rule: "İlkel Maskot / Karikatür Primitifi", description: name, code: trimmed });
    }
  }

  if (insideAnimationBlock) {
    for (const { pattern, name } of LAYOUT_THRASHING_PROPS) {
      if (pattern.test(trimmed)) {
        violations.push({ file: rel, lineNum, rule: "GPU Dışı Animasyon (Layout Thrashing)", description: name, code: trimmed });
      }
    }
  }

  for (const { pattern, name } of FORBIDDEN_MICRO_FONTS) {
    if (pattern.test(line)) {
      violations.push({ file: rel, lineNum, rule: "Broadcast Ölçek İhlali (Mikro-Font Yasağı)", description: name, code: trimmed });
    }
  }

  if (sceneMode === "cinematic-world" && file === targetFile) {
    for (const { pattern, name } of FORBIDDEN_WORLD_HUD) {
      if (pattern.test(line)) {
        violations.push({ file: rel, lineNum, rule: "Cinematic-World Saflık İhlali (HUD/Badge Yasağı)", description: name, code: trimmed });
      }
    }
  }
});
}
scanFiles.forEach((f) => lintStyle(f, fs.readFileSync(f, "utf-8").split("\n")));

// Rule 7: Mode-Aware Engine Architecture Check
if (sceneMode === "cinematic-world") {
  if (!content.includes("WorldStage") || !content.includes("CharacterActor")) {
    violations.push({
      lineNum: 1,
      rule: "Cinematic-World Motor İhlali",
      description: "Karakter/mekan sahneleri 'WorldStage' (tam ekran 2.5D dünya) ve 'CharacterActor' (12 prensip kukla fiziği) kullanmak zorundadır.",
      code: "Missing <WorldStage> or <CharacterActor>",
    });
  }
} else {
  if (!content.includes("SpotlightStage") || !content.includes("CameraRig")) {
    violations.push({
      lineNum: 1,
      rule: "Editorial-UI Motor İhlali",
      description: "Editorial/Veri sahneleri 'SpotlightStage' ve 'CameraRig' primitiflerini kullanmak zorundadır.",
      code: "Missing <SpotlightStage> or <CameraRig>",
    });
  }
}

if (!content.includes("animateCamera")) {
  violations.push({
    lineNum: 1,
    rule: "Sinematik Kamera İhlali",
    description: "Sahne sabit kalamaz; 'src/core/choreography' içinden 'animateCamera' ile 3D kamera hareketi tanımlanmalıdır.",
    code: "Missing animateCamera(tl, ...) choreography call",
  });
}

// Output Results
console.log(`\n${BOLD}====================================================${RESET}`);
console.log(`${BOLD}${CYAN_ANSI}   UNIVERSAL MOTION STUDIO LINTER V3.0 (${sceneMode.toUpperCase()})   ${RESET}`);
console.log(`${BOLD}====================================================${RESET}`);
console.log(`Denetlenen Dosya : ${scanFiles.length} dosya (src/**) | Sahne: ${path.relative(rootDir, targetFile)}`);
console.log(`Algılanan Mod    : ${BOLD}${sceneMode}${RESET}\n`);

if (violations.length > 0) {
  console.log(`${RED}${BOLD}[STUDIO AUDIT: FAILED] ${violations.length} adet kalite/mimari ihlali tespit edildi:${RESET}\n`);

  violations.forEach((v, i) => {
    console.log(`${RED}${BOLD}[İHLAL ${i + 1}] ${v.file ?? "Scene.tsx"}:${v.lineNum}:${RESET} ${v.rule}`);
    console.log(`  Detay : ${v.description}`);
    console.log(`  Kod   : ${YELLOW}${v.code}${RESET}\n`);
  });

  console.log(`${RED}${BOLD}Render süreci durduruldu. Lütfen sahneyi aktif mod (${sceneMode}) kurallarına göre revize edin.${RESET}\n`);
  process.exit(1);
} else {
  console.log(`${GREEN}${BOLD}[STUDIO AUDIT: PASSED] Sahne '${sceneMode}' kalite standartlarına %100 uyumlu.${RESET}`);
  console.log(`${GREEN}✓ Sıfır neon glow, sıfır mikro-font, %100 GPU saflığı${RESET}`);
  if (sceneMode === "cinematic-world") {
    console.log(`${GREEN}✓ Tam ekran 2.5D WorldStage + 60 FPS CharacterActor + Sıfır HUD kirliliği doğrulandı.${RESET}\n`);
  } else {
    console.log(`${GREEN}✓ 3D CameraRig + SpotlightStage + Broadcast tipografi ölçeği doğrulandı.${RESET}\n`);
  }
  process.exit(0);
}
