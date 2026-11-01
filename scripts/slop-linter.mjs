import fs from "node:fs";
import path from "node:path";
import { ENGINE_DIRS, parseArgs, resolveTargets, rel, rootDir, walk } from "./lib/projects.mjs";

/**
 * UNIVERSAL MOTION STUDIO LINTER V4 (çok projeli)
 * Kullanım: node scripts/slop-linter.mjs [--project <slug>]   (verilmezse tüm projeler)
 * Kapsam : paylaşılan motor klasörleri + seçilen projelerin klasörleri.
 * Mod    : her projenin spec.json "mode" alanından okunur (kod içeriğinden tahmin edilmez).
 */
const RED = "\x1b[31m", GREEN = "\x1b[32m", YELLOW = "\x1b[33m", CYAN_ANSI = "\x1b[36m", BOLD = "\x1b[1m", RESET = "\x1b[0m";
const SKIP_FILES = new Set(["vite-env.d.ts", "registry.generated.ts"]);

const targets = resolveTargets(parseArgs());
if (targets.length === 0) {
  console.error(`${RED}${BOLD}[ERROR] Denetlenecek proje yok.${RESET} Oluştur: pnpm new <slug>`);
  process.exit(1);
}

const modeOf = (t) => JSON.parse(fs.readFileSync(t.spec, "utf-8").replace(/^\uFEFF/, "")).mode;

// Kural 1: Yasak Renkler
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
// Kural 2: Sahte neon / glow
const FORBIDDEN_GLOW = [
  { pattern: /drop-shadow\(\s*0\s+0\s+\d+px/i, name: "Neon Glow: drop-shadow(0 0 ...px) tespit edildi" },
  { pattern: /box-shadow:\s*0\s+0\s+\d+px/i, name: "Neon Glow: box-shadow: 0 0 ...px tespit edildi" },
  { pattern: /shadow-\[0_0_/i, name: "Neon Glow: Tailwind shadow-[0_0_...] tespit edildi" },
  { pattern: /\[text-shadow:0_0_/i, name: "Neon Glow: [text-shadow:0_0_...] tespit edildi" },
];
// Kural 3: İlkel maskot / karikatür primitifleri
const FORBIDDEN_CARTOON = [
  { pattern: /#fcd34d/i, name: "Karikatür Primitifi: Ten rengi sarı fill (#fcd34d)" },
  { pattern: /#fde68a/i, name: "Karikatür Primitifi: Yüz çemberi sarı fill (#fde68a)" },
  { pattern: /anchor-(mustache|eyes|head|station|body)/i, name: "Karikatür Primitifi: Büyük/Kafa maskot tanımlayıcısı" },
  { pattern: /mustache/i, name: "Karikatür Primitifi: Bıyık çizim vektörü" },
];
// Kural 4: GPU dışı animasyon (geometri tween'i)
const LAYOUT_THRASHING_PROPS = [
  { pattern: /^\s*(top|left|bottom|right|width|height|margin|padding)\s*:/i, name: "GPU DIŞI Animasyon: Doğrudan geometri tweening (Reflow ihlali)" },
];
// Kural 5: Mikro-font yasağı
const FORBIDDEN_MICRO_FONTS = [
  { pattern: /\btext-xs\b/, name: "Yayın Ölçeği İhlali: 'text-xs' (12px) 1080p dikey videoda okunamaz (Min 18px kullanın)" },
  { pattern: /\btext-sm\b/, name: "Yayın Ölçeği İhlali: 'text-sm' (14px) 1080p dikey videoda çok küçük (Min 18px kullanın)" },
  { pattern: /text-\[(8|9|10|11|12|13|14)px\]/, name: "Yayın Ölçeği İhlali: 14px altı mikro-font tespit edildi (Broadcast ölçeği min 18px)" },
];
// Kural 6 (yalnızca cinematic-world projeleri): sahte HUD / badge
const FORBIDDEN_WORLD_HUD = [
  { pattern: /hudTagLeft|hudTagRight|hudFooterLeft|hudFooterRight/, name: "Mod İhlali (cinematic-world): Karakter/mekan sahnesinde teknik bülten HUD etiketleri kullanılamaz" },
  { pattern: /SECTOR_|THREAT_LEVEL|AGGRO:|COMBAT_STATE/, name: "Mod İhlali (cinematic-world): Sahneyi kirleten sahte HUD/Telemetri badge metni tespit edildi" },
];

const violations = [];

function lintStyle(file, worldMode) {
  const fileRel = rel(file);
  const lines = fs.readFileSync(file, "utf-8").split("\n");
  let insideAnimationBlock = false;
  const add = (lineNum, rule, description, code) => violations.push({ file: fileRel, lineNum, rule, description, code });

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();
    if (trimmed.includes(".to(") || trimmed.includes(".from(") || trimmed.includes(".fromTo(") || trimmed.includes("animate={")) insideAnimationBlock = true;
    if (insideAnimationBlock && (trimmed.endsWith(");") || trimmed.endsWith("}"))) insideAnimationBlock = false;

    for (const { pattern, name } of FORBIDDEN_COLORS) if (pattern.test(line)) add(lineNum, "Yasaklı Renk ve Degradeler", name, trimmed);
    for (const { pattern, name } of FORBIDDEN_GLOW) if (pattern.test(line)) add(lineNum, "Sahte Neon / Işıma Efekti", name, trimmed);
    for (const { pattern, name } of FORBIDDEN_CARTOON) if (pattern.test(line)) add(lineNum, "İlkel Maskot / Karikatür Primitifi", name, trimmed);
    if (insideAnimationBlock)
      for (const { pattern, name } of LAYOUT_THRASHING_PROPS) if (pattern.test(trimmed)) add(lineNum, "GPU Dışı Animasyon (Layout Thrashing)", name, trimmed);
    for (const { pattern, name } of FORBIDDEN_MICRO_FONTS) if (pattern.test(line)) add(lineNum, "Broadcast Ölçek İhlali (Mikro-Font Yasağı)", name, trimmed);
    if (worldMode)
      for (const { pattern, name } of FORBIDDEN_WORLD_HUD) if (pattern.test(line)) add(lineNum, "Cinematic-World Saflık İhlali (HUD/Badge Yasağı)", name, trimmed);
  });
}

function lintProjectArchitecture(t, mode) {
  const sceneRel = rel(t.scene);
  const content = fs.existsSync(t.scene) ? fs.readFileSync(t.scene, "utf-8") : "";
  const add = (rule, description, code) => violations.push({ file: sceneRel, lineNum: 1, rule, description, code });
  if (!content) return add("Proje İhlali", "Scene.tsx yok.", "Missing Scene.tsx");

  if (mode === "cinematic-world") {
    if (!content.includes("WorldStage") || !content.includes("CharacterActor"))
      add("Cinematic-World Motor İhlali", "Karakter/mekan sahneleri 'WorldStage' (tam ekran 2.5D dünya) ve 'CharacterActor' kullanmak zorundadır.", "Missing <WorldStage> or <CharacterActor>");
  } else if (mode === "editorial-ui") {
    const usesSpatial = content.includes("SpatialCamera");
    const usesSpotlight = content.includes("SpotlightStage") && content.includes("CameraRig");
    if (!usesSpatial && !usesSpotlight)
      add("Editorial-UI Motor İhlali", "Editorial/Veri sahneleri 'SpatialCamera' veya 'SpotlightStage + CameraRig' primitiflerini kullanmak zorundadır.", "Missing <SpatialCamera> or <SpotlightStage>");
  } else if (mode === "kinetic-poster") {
    if (!content.includes("useRemotionGSAP"))
      add("Kinetic-Poster Motor İhlali", "Kinetik poster sahneleri animasyonu 'useRemotionGSAP' ile kare-kilitli kurmak zorundadır.", "Missing useRemotionGSAP");
  }
  const hasCameraChoreography =
    content.includes("animateCamera") ||
    content.includes("applyIsometricTilt") ||
    content.includes("applyFocusZoom") ||
    content.includes("applyCanvasPan") ||
    content.includes("applyCameraSettle");
  if (!hasCameraChoreography)
    add("Sinematik Kamera İhlali", "Sahne sabit kalamaz; kamera hareketi ('animateCamera' veya 'applyIsometricTilt/FocusZoom') tanımlanmalıdır.", "Missing camera choreography call");
}

// ---- tarama ----
const engineFiles = ENGINE_DIRS.flatMap((d) => walk(path.join(rootDir, "src", d), new Set([".ts", ".tsx"])));
engineFiles.filter((f) => !SKIP_FILES.has(path.basename(f))).forEach((f) => lintStyle(f, false));

let totalFiles = engineFiles.length;
const summaries = [];
for (const t of targets) {
  const mode = modeOf(t);
  const files = walk(t.dir, new Set([".ts", ".tsx"])).filter((f) => !SKIP_FILES.has(path.basename(f)));
  totalFiles += files.length;
  files.forEach((f) => lintStyle(f, mode === "cinematic-world"));
  lintProjectArchitecture(t, mode);
  summaries.push(`${t.slug} (${mode})`);
}

// ---- rapor ----
console.log(`\n${BOLD}====================================================${RESET}`);
console.log(`${BOLD}${CYAN_ANSI}   UNIVERSAL MOTION STUDIO LINTER V4.0   ${RESET}`);
console.log(`${BOLD}====================================================${RESET}`);
console.log(`Denetlenen Dosya : ${totalFiles} dosya (motor + ${targets.length} proje)`);
console.log(`Projeler         : ${summaries.join(", ")}\n`);

if (violations.length > 0) {
  console.log(`${RED}${BOLD}[STUDIO AUDIT: FAILED] ${violations.length} adet kalite/mimari ihlali tespit edildi:${RESET}\n`);
  violations.forEach((v, i) => {
    console.log(`${RED}${BOLD}[İHLAL ${i + 1}] ${v.file}:${v.lineNum}:${RESET} ${v.rule}`);
    console.log(`  Detay : ${v.description}`);
    console.log(`  Kod   : ${YELLOW}${v.code}${RESET}\n`);
  });
  console.log(`${RED}${BOLD}Render süreci durduruldu. Lütfen projeyi kurallara göre revize edin.${RESET}\n`);
  process.exit(1);
}
console.log(`${GREEN}${BOLD}[STUDIO AUDIT: PASSED] ${targets.length} proje kalite standartlarına %100 uyumlu.${RESET}`);
console.log(`${GREEN}✓ Sıfır neon glow, sıfır mikro-font, %100 GPU saflığı, mod-doğru motor kullanımı${RESET}\n`);
process.exit(0);
