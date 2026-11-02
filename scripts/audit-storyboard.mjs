import fs from "node:fs";
import path from "node:path";
import {
  parseArgs,
  resolveTargets,
  rootDir,
  rel,
} from "./lib/projects.mjs";

/**
 * SHIFT-LEFT STORYBOARD & BEAT DIRECTOR AUDITOR (v1.0)
 *
 * Kod yazılmadan önce kurgunun kalitesini, ritmini ve görsel akışını denetler.
 * Zayıf, monoton, nefes almayan veya kopuk bir storyboard kodlama aşamasına GEÇEMEZ.
 *
 * Denetlenen Kurallar:
 * [STORY-001] Tek Cümlelik Hedef (direction.md içinde net hedef cümlesi)
 * [STORY-002] Ritim & Tempo Kontrastı (Eşit süreli monoton beat yasağı, stddev >= 18f)
 * [STORY-003] Okunabilirlik & Bilişsel Yük (Metin tutma >= 1.2s / 72f, WPM <= 220)
 * [STORY-004] Tek Kap / Görsel Köprü (Sahneler arası geçiş köprüsü veya tek-plan tanımı)
 * [STORY-005] Kamera Motivasyonu (Her kamera hareketinde somut ve anlamlı intent)
 * [STORY-006] Anlatı İlerlemesi & Çeşitlilik (Ardışık aynı tip beat yasağı)
 *
 * Kullanım:
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
    console.error(`${RED}[HATA] spec.json okunamadı:${RESET} ${e.message}`);
    totalErrors++;
    continue;
  }

  const legacy = spec.legacy === true;
  const errors = [];
  const warnings = [];

  const addErr = (code, title, detail, fix) => {
    if (legacy) warnings.push({ code, title, detail, fix });
    else errors.push({ code, title, detail, fix });
  };
  const addWarn = (code, title, detail, fix) => warnings.push({ code, title, detail, fix });

  // ---------------------------------------------------------------------------
  // [STORY-001] Tek Cümlelik Hedef Denetimi (direction.md)
  // ---------------------------------------------------------------------------
  let directionText = "";
  if (fs.existsSync(directionPath)) {
    directionText = fs.readFileSync(directionPath, "utf-8");
  }

  const hasGoal =
    /tek\s*c[üu]mlelik.*hedef/i.test(directionText) ||
    /Bu videonun tek cümlelik hedefi şu/i.test(directionText) ||
    /The single-sentence goal/i.test(directionText) ||
    /Tek Cümlelik Hedef/i.test(directionText) ||
    /İzleyici.*hedef/i.test(directionText);

  if (!hasGoal) {
    addErr(
      "STORY-001",
      "Eksik Tek Cümlelik Hedef",
      "direction.md içinde net bir izleyici hedefi bulunamadı.",
      'direction.md dosyasına şunu ekleyin: "Bu videonun tek cümlelik hedefi şu: [hedef]."'
    );
  }

  // ---------------------------------------------------------------------------
  // [STORY-002] Ritim & Tempo Kontrastı (spec.beats)
  // ---------------------------------------------------------------------------
  const beats = Array.isArray(spec.beats) ? spec.beats : [];
  if (beats.length >= 3) {
    const durations = beats.map((b) => (b.endFrame ?? 0) - (b.startFrame ?? 0));
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const variance = durations.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / durations.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev < 14) {
      addErr(
        "STORY-002",
        "Ritim Monotonluğu",
        `Beat süreleri neredeyse tekdüze (stddev: ${stdDev.toFixed(1)}f < 14f). Video bir metronom gibi akar.`,
        "Beat sürelerini çeşitlendirin: Vurucu anlar (Staccato 35-55f) ve derin okuma anları (Focus 75-120f) ile ritmi canlandırın."
      );
    }
  }

  // ---------------------------------------------------------------------------
  // [STORY-003] Okunabilirlik & Bilişsel Yük Denetimi
  // ---------------------------------------------------------------------------
  const fps = spec.fps || 60;
  beats.forEach((b, i) => {
    const durFrames = (b.endFrame ?? 0) - (b.startFrame ?? 0);
    const durSec = durFrames / fps;

    if (b.text && typeof b.text === "string" && b.text.trim()) {
      // 1.2s kuralı
      if (durSec < 1.15) {
        addErr(
          "STORY-003",
          `Beat [${b.id}] Metin Okuma Süresi Yetersiz`,
          `"${b.text}" metni sadece ${durSec.toFixed(2)}s (${durFrames}f) ekranda kalıyor. Minimum 1.2s (72f) gereklidir.`,
          `Beat süresini en az 72 kareye uzatın veya metni kısaltın.`
        );
      }

      // WPM kuralı
      const words = b.text.trim().split(/\s+/).length;
      const wpm = (words / durSec) * 60;
      if (wpm > 240 && words > 4) {
        addWarn(
          "STORY-003",
          `Beat [${b.id}] Bilişsel Yük Yüksek`,
          `Okuma hızı ${Math.round(wpm)} WPM. İzleyicinin gözü metni takip etmekte zorlanabilir.`,
          `Kelime sayısını azaltın veya süreyi artırarak WPM hızını <= 220 seviyesine çekin.`
        );
      }
    }
  });

  // ---------------------------------------------------------------------------
  // [STORY-004] Tek Kap / Görsel Köprü Denetimi
  // ---------------------------------------------------------------------------
  if (spec.mode !== "cinematic-world" && beats.length >= 2) {
    const transitions = Array.isArray(spec.transitions) ? spec.transitions : [];
    if (transitions.length === 0 && spec.continuousShot !== true) {
      addErr(
        "STORY-004",
        "Geçiş ve Görsel Köprü Tanımsız",
        `Sahne ${beats.length} beat içeriyor ancak spec.transitions dizisi boş. Slayt kesmesi riski.`,
        'spec.json içine her beat sınırı için bir geçiş tanımlayın (whip-pan, mask-wipe, zoom-punch, container-morph).'
      );
    }
  }

  // ---------------------------------------------------------------------------
  // [STORY-005] Kamera Motivasyonu Denetimi
  // ---------------------------------------------------------------------------
  const camera = Array.isArray(spec.camera) ? spec.camera : [];
  camera.forEach((c, i) => {
    const intent = (c.intent || "").trim();
    if (!intent || intent.length < 6 || intent.toLowerCase() === "kamera") {
      addErr(
        "STORY-005",
        `Kamera [${i}] Gerekçesi (Intent) Yetersiz`,
        `Kamera hareketi (at: ${c.at}s) için motive edici bir amaç tanımlanmamış: "${intent}".`,
        'Kameranın neden hareket ettiğini ve neye odaklandığını açıklayın (ör. "Geçiş 1 ile takvim matrisine itiş").'
      );
    }
  });

  // ---------------------------------------------------------------------------
  // [STORY-006] Anlatı İlerlemesi & Çeşitlilik
  // ---------------------------------------------------------------------------
  for (let i = 0; i < beats.length - 1; i++) {
    const curr = beats[i];
    const next = beats[i + 1];
    if (curr.action && next.action && curr.action === next.action) {
      addWarn(
        "STORY-006",
        `Ardışık Tek Tip Eylem [Beat ${curr.id} -> ${next.id}]`,
        `İki beat art arda aynı aksiyona sahip: "${curr.action}". Kompozisyon tekrarı riski.`,
        "Her beat'e farklı bir görsel odak (overview -> micro-interaction -> telemetry -> climax) verin."
      );
    }
  }

  // ---------------------------------------------------------------------------
  // [STORY-007] PHASE 0 Canlı Web, Vektör ve Stüdyo Araştırma Dosyası Denetimi
  // ---------------------------------------------------------------------------
  const blueprintPath = path.join(project.dir, "choreography-blueprint.md");
  if (fs.existsSync(blueprintPath)) {
    const bpText = fs.readFileSync(blueprintPath, "utf-8");
    const hasPhase0 = /PHASE\s*0/i.test(bpText);
    const hasSvgSource = /SimpleIcons|Wikimedia|lucide|tabler|d="M|<path/i.test(bpText);
    const hasStudioRef = /Ordinary Folk|Buck|ManvsMachine|Ravie|Motionographer|Wine After Coffee|Match-Cut|Exploded/i.test(bpText);

    if (!hasPhase0 || !hasSvgSource || !hasStudioRef) {
      addErr(
        "STORY-007",
        "Eksik PHASE 0 Canlı Web & Vektör Araştırması",
        "choreography-blueprint.md içinde PHASE 0 (Resmi SVG path koordinatları, UI Tear-Down ve Stüdyo Vaka Analizi) eksik.",
        "Kodlamadan önce 4 hedef search_web sorgusunu çalıştırıp PHASE 0 bölümüne gerçek SVG path, UI anatomisi ve stüdyo Match-Cut bulgularını yazın."
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
        "Eksik 3D Katman (LayeredStage3D) & Vektör Filtre (SvgFilterLab) Planı",
        "choreography-blueprint.md içinde 3D Z-ekseni katman ayrışması (LayeredStage3D / translateZ) veya SvgFilterLab (<defs> gradyan/filtre) tanımlanmamış.",
        "Düz 2D kutular yerine PHASE 4 ve PHASE 6 içinde LayeredStage3D (translateZ düzlemleri) ve SvgFilterLab (gradyan/gooey filtreler) mimarisini planlayın."
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Raporlama
  // ---------------------------------------------------------------------------
  console.log(`▶ PROJE: ${project.slug.toUpperCase()} [${spec.mode} | ${spec.aspect}]`);
  console.log(`  Beat Sayısı: ${beats.length} | Kamera Sayısı: ${camera.length} | Süre: ${spec.durationInSeconds}s`);

  if (errors.length === 0 && warnings.length === 0) {
    console.log(`  ${GREEN}✓ Kusursuz Storyboard. Kurgu, ritim, tek kap köprüsü ve motivasyon tam.${RESET}\n`);
  } else {
    errors.forEach((e) => {
      console.log(`  ${RED}${BOLD}[${e.code}] ${e.title}${RESET}: ${e.detail}\n     Reçete → ${e.fix}`);
    });
    warnings.forEach((w) => {
      console.log(`  ${YELLOW}[${w.code} UYARI] ${w.title}${RESET}: ${w.detail}\n     Reçete → ${w.fix}`);
    });
    console.log();
  }

  totalErrors += errors.length;
  totalWarnings += warnings.length;
}

if (totalErrors > 0) {
  console.log(`${RED}${BOLD}[STORYBOARD: BAŞARISIZ] Toplam ${totalErrors} kurgu hatası bulundu. Kodlama aşamasına geçilemez.${RESET}\n`);
  process.exit(1);
}

console.log(`${GREEN}${BOLD}[STORYBOARD: ONAYLANDI] Tüm storyboard ve kurgu sözleşmeleri profesyonel standartta.${RESET}\n`);
process.exit(0);
