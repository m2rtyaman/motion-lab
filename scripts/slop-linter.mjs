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
const SKIP_FILES = new Set(["vite-env.d.ts", "registry.generated.ts", "HtmlFrameDriver.tsx", "template-manifest.generated.ts"]);

const targets = resolveTargets(parseArgs());
if (targets.length === 0) {
  console.error(`${RED}${BOLD}[ERROR] Denetlenecek proje yok.${RESET} Oluştur: pnpm new <slug>`);
  process.exit(1);
}

const parseSpec = (t) => JSON.parse(fs.readFileSync(t.spec, "utf-8").replace(/^\uFEFF/, ""));

// Kural 1: Yasak Renkler (Yalnızca çiğ/parlak neon slop renkleri; profesyonel marka renkleri serbesttir)
const FORBIDDEN_COLORS = [
  { pattern: /#00ffff\b/i, name: "Yasaklı Renk: Çiğ Elektrik Neon Cyan (#00ffff)" },
  { pattern: /#ff00ff\b/i, name: "Yasaklı Renk: Çiğ Neon Magenta (#ff00ff)" },
];
// Kural 2: Yalnızca çiğ cyan/magenta neon glow yasaktır; zarif marka parlamaları ve derinlik gölgeleri (drop-shadow, box-shadow) serbesttir
const FORBIDDEN_GLOW = [
  { pattern: /drop-shadow\([^)]*(#00ffff|#ff00ff|rgba\(\s*0\s*,\s*255\s*,\s*255|rgba\(\s*255\s*,\s*0\s*,\s*255)/i, name: "Slop Neon Glow: Çiğ cyan/magenta drop-shadow tespit edildi" },
  { pattern: /box-shadow:[^;]*(#00ffff|#ff00ff|rgba\(\s*0\s*,\s*255\s*,\s*255|rgba\(\s*255\s*,\s*0\s*,\s*255)/i, name: "Slop Neon Glow: Çiğ cyan/magenta box-shadow tespit edildi" },
];
// Kural 3: İlkel maskot / karikatür primitifleri
const FORBIDDEN_CARTOON = [
  { pattern: /#fcd34d/i, name: "Karikatür Primitifi: Ten rengi sarı fill (#fcd34d)" },
  { pattern: /#fde68a/i, name: "Karikatür Primitifi: Yüz çemberi sarı fill (#fde68a)" },
  { pattern: /anchor-(mustache|eyes|head|station|body)/i, name: "Karikatür Primitifi: Büyük/Kafa maskot tanımlayıcısı" },
  { pattern: /mustache/i, name: "Karikatür Primitifi: Bıyık çizim vektörü" },
];
// Kural 4: GPU dışı animasyon (width, height, borderRadius, strokeDashoffset, attr gerçek nesne morphing'i için serbesttir)
const LAYOUT_THRASHING_PROPS = [
  { pattern: /^\s*(top|left|bottom|right|margin|padding)\s*:/i, name: "GPU DIŞI Animasyon: Doğrudan pozisyon/margin tweening (x/y transform veya width/height/borderRadius morph kullanın)" },
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
// Kural 7: Sistem Emojisi Yasağı (Gerçek çok parçalı <svg> vektör zorunluluğu)
const FORBIDDEN_EMOJIS = [
  {
    pattern: /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2702}-\u{2712}\u{2716}-\u{27BF}\u{2B50}]/u,
    name: "Ucuz Sistem Emojisi Yasağı: Sahne içinde sistem emojisi (💬, 👥, 📞, 📢, 🎙️, ⚡, 🚀, 💻, 🎨, 🔒, ✅, ⚠️ vb.) kullanılamaz; çok parçalı <svg>, <path>, <circle>, <rect> vektör çizimi kullanın",
  },
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

    for (const { pattern, name } of FORBIDDEN_COLORS) if (pattern.test(line)) add(lineNum, "Yasaklı Renk ve Degradeler", name, trimmed);
    for (const { pattern, name } of FORBIDDEN_GLOW) if (pattern.test(line)) add(lineNum, "Sahte Neon / Işıma Efekti", name, trimmed);
    for (const { pattern, name } of FORBIDDEN_CARTOON) if (pattern.test(line)) add(lineNum, "İlkel Maskot / Karikatür Primitifi", name, trimmed);
    if (insideAnimationBlock)
      for (const { pattern, name } of LAYOUT_THRASHING_PROPS) if (pattern.test(trimmed)) add(lineNum, "GPU Dışı Animasyon (Layout Thrashing)", name, trimmed);
    for (const { pattern, name } of FORBIDDEN_MICRO_FONTS) if (pattern.test(line)) add(lineNum, "Broadcast Ölçek İhlali (Mikro-Font Yasağı)", name, trimmed);
    if (worldMode)
      for (const { pattern, name } of FORBIDDEN_WORLD_HUD) if (pattern.test(line)) add(lineNum, "Cinematic-World Saflık İhlali (HUD/Badge Yasağı)", name, trimmed);
    if (!isLegacy)
      for (const { pattern, name } of FORBIDDEN_EMOJIS) if (pattern.test(line)) add(lineNum, "Sistem Emojisi İhlali (SVG Vektör Zorunluluğu)", name, trimmed);
  });
}

function lintProjectArchitecture(t, spec) {
  const mode = spec.mode;
  const isLegacy = spec.legacy === true;
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
    const usesTransitions = /transition(WhipPan|MaskWipe|ZoomPunch|ContainerMorph)/.test(content);
    if (!usesSpatial && !usesSpotlight && !usesTransitions)
      add("Editorial-UI Motor İhlali", "Editorial/Veri sahneleri 'SpatialCamera' veya 'SpotlightStage + CameraRig' veya akıcı Geçiş Motorunu (transitions) kullanmak zorundadır.", "Missing <SpatialCamera>, <SpotlightStage>, or transitions");
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

  // Kural 8: "Sabit Başlık + Ortada Kutu + Sabit Footer" (3'lü Sandviç / Slayt Başlığı Şablonu) Yasağı
  if (!isLegacy) {
    const headerCount = (content.match(/<header\b/g) || []).length;
    const footerCount = (content.match(/<footer\b/g) || []).length;
    const topBlockCount = (content.match(/top-\[\d+px\]\s+left-\[\d+px\]\s+right-\[\d+px\]/g) || []).length;
    const contentWithoutSvg = content.replace(/\bd=["'][^"']*["']/g, '');
    const numberedSlideEyebrows = new Set((contentWithoutSvg.match(/\b0[1-9]\s*[•·—-]/g) || []).map((s) => s.slice(0, 2))).size;
    if ((headerCount >= 3 && footerCount >= 3) || topBlockCount >= 2 || numberedSlideEyebrows >= 3) {
      add(
        "Monoton 3'lü Sandviç / Slayt Başlığı Şablonu İhlali",
        `Sahne içinde tekrarlayan üst başlık barı (header=${headerCount}, footer=${footerCount}, topBlock=${topBlockCount}, numaralı slayt başlığı=${numberedSlideEyebrows}) tespit edildi. Her beat'te aynı 'Üst Başlık + Ortada Kutu + Alt Footer' şablonu kullanmak yasaktır; her beat'in kendi tam ekran (full-bleed) motion graphic kompozisyonu olmalıdır.`,
        "Repeated header/top-block/numbered-eyebrow + center box template across beats"
      );
    }

    // Kural 9: Vektör Filtre/Gradyan (SvgFilterLab) & 3D Katman (LayeredStage3D) Zorunluluğu (Blueprint'li Projeler)
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
          "Sığ Vektör (Flat SVG) İhlali",
          "Blueprint'li sahnede SvgFilterLab veya <defs> (linearGradient/radialGradient/filter) kullanılmamış. Düz tek renk SVG yerine çok katmanlı gradyan ve filtre laboratuvarı kullanılmalıdır.",
          "Missing <SvgFilterLab /> or <defs> gradients/filters"
        );
      }
      if (!has3DDepth) {
        add(
          "Düz 2D Kutu (Flat Stage) İhlali",
          "Blueprint'li sahnede LayeredStage3D / LayerPlane (preserve-3d + translateZ) kullanılmamış. Katmanlar 3D Z-ekseninde ayrıştırılmalıdır.",
          "Missing <LayeredStage3D> / <LayerPlane> 3D depth planes"
        );
      }
    }

    // Kural 10: Pencere / Donanım Kabuğu Çapalaması (Hardware Shell Anchor - adversarial-visual-critic Standardı)
    const hasUIComponents = /ParticipantStudioTile|TelemetryBentoCard|EncryptedChatStream|MetricCardRow|BentoCard|SpecularCard|MetricTelemetryCard|EditorialDialogueCard|PipelineTerminalCard|SplitComparisonCard/.test(content);
    const hasShellAnchor = /PrecisionDashboardShell|DeviceMockupStage|MacOSSequoiaWindow|BrowserFrame|AppShell|SpotlightStage|VirtualCanvas|WorldStage/.test(content);
    if (hasUIComponents && !hasShellAnchor) {
      add(
        "Pencere/Donanım Kabuğu Çapa İhlali (Floating Bento Slop)",
        "Bileşenler uzay boşluğunda süzülemez; 'PrecisionDashboardShell', 'DeviceMockupStage' veya 'MacOSSequoiaWindow' gibi tanımlı bir pencere/donanım kabuğu içine çapalanmalıdır.",
        "Missing window/hardware shell anchor"
      );
    }

    // Kural 11: Tek Kap Morfolojisi / Graphic Anchor Geçişi
    const hasContainerMorph = /transition(ContainerMorph|WhipPan|MaskWipe|ZoomPunch)|GraphicAnchor|morphProgress|containerMorph|BrowserFrame|SpotlightStage|BackdropField/.test(content);
    if (mode === "editorial-ui" && !isLegacy && !hasContainerMorph) {
      add(
        "Tek Kap Morfolojisi İhlali (Lack of Container Morphing)",
        "Sahne geçişlerinde tek bir grafik çapanın form değiştirerek sonraki sahneye evrilmesi (transitionContainerMorph veya Graphic Anchor) zorunludur.",
        "Missing container morphing / graphic anchor"
      );
    }

    // Kural 12: 3D Boşlukta Çapasız Yüzme Yasağı
    const has3DStage = /LayeredStage3D|LayerPlane/.test(content);
    const unanchored3DMatch = /<LayerPlane[^>]*>(?:(?!PrecisionDashboardShell|DeviceMockupStage|MacOSSequoiaWindow|BrowserFrame|AppShell)[\s\S])*?<(ParticipantStudioTile|TelemetryBentoCard|EncryptedChatStream|MetricCardRow|BentoCard|SpecularCard|MetricTelemetryCard|EditorialDialogueCard|PipelineTerminalCard|SplitComparisonCard)\b/.test(content);
    if ((has3DStage && hasUIComponents && !hasShellAnchor) || (has3DStage && unanchored3DMatch)) {
      add(
        "3D Boşlukta Çapasız Yüzme İhlali",
        "3D katmanda doğrudan süzülen bağımsız kartlar tespit edildi. Kartlar bir Hardware Shell veya PrecisionDashboardShell içine yerleştirilmelidir.",
        "Unanchored floating cards in 3D LayerPlane"
      );
    }

    // Kural 13: Sıfır-Artıklık Tipografi Kuralı (Zero Redundancy / No Text Duplication)
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
        "Sıfır-Artıklık Tipografi İhlali (Text Redundancy)",
        `Başlık ve arayüz etiketleri arasında tekrarlanan birebir aynı metin tespit edildi: "${duplicates[0]}". Pazarlama başlığı faydayı, etiket ise teknik eylemi anlatmalıdır.`,
        duplicates[0]
      );
    }

    // Kural 12: Gerçekçi İçerik & Sahte DevOps Jargonu Yasağı (Never Invent Facts)
    const isConsumerApp = /whatsapp|chat|messenger|instagram|social/i.test(t.slug);
    if (isConsumerApp) {
      const devopsJargonRegex = /\b(Quantum-Resistant|enclave-loc\d|ratchet\s+ratified|ops\/sec|Zero-Copy\s+Buffer|Zero-Knowledge\s+Keys)\b/i;
      const match = content.match(devopsJargonRegex);
      if (match) {
        add(
          "Sahte DevOps Jargonu & AI-Slop İhlali (Never Invent Facts)",
          `Tüketici/Mobil odaklı sahnede ('${t.slug}') bağlamsız uydurma sunucu/kripto telemetrisi tespit edildi: '${match[0]}'. Ürünün gerçek arayüzü, gerçek mesajları ve gerçek kullanım senaryosu gösterilmelidir.`,
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
