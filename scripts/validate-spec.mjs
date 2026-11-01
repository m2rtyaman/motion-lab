import fs from "node:fs";
import path from "node:path";
import {
  parseArgs,
  resolveTargets,
  rootDir,
  MODES as PROJECT_MODES,
  SLUG_RE,
  rel,
} from "./lib/projects.mjs";

/**
 * MOTION SPEC DOĞRULAYICI (Çok Projeli)
 * Kullanım: node scripts/validate-spec.mjs [--project <slug>]   (verilmezse tüm projeler)
 * Kod yazılmadan önce spec geçerli olmak zorundadır. Hata varsa exit 1.
 * Mesajlar modelin tek turda düzeltebilmesi için "sorun → çözüm" biçimindedir.
 */
const args = parseArgs();
const targets = resolveTargets(args);

const RED = "\x1b[31m", GREEN = "\x1b[32m", BOLD = "\x1b[1m", RESET = "\x1b[0m";
const MODES = ["cinematic-world", "editorial-ui", "kinetic-poster"];
const ASPECTS = ["9:16", "16:9"];
const EASE_OK = /^(power[1-4]|expo|circ|sine|back|quart|quint|cubic)\.(in|out|inOut)(\(\s*[\d.]+\s*\))?$/;
const EASE_BANNED = /^(linear|none|ease|ease-?in|ease-?out|ease-?in-?out|easeInOut|easeIn|easeOut)$/i;
const MAX_CAMERA_GAP_SEC = 1.0;
const IMPACT_SYNC_SEC = 0.1;
const SFX_SYNC_FRAMES = 2;

let totalErrors = 0;

for (const project of targets) {
  const specPath = args.spec ? path.resolve(rootDir, args.spec) : project.spec;
  const scenePath = project.scene;
  const errors = [];
  const err = (code, where, problem, fix) => errors.push({ code, where, problem, fix });

  if (!fs.existsSync(specPath)) {
    console.error(`${RED}${BOLD}[SPEC] Dosya yok:${RESET} ${rel(specPath)}\nÇözüm: spec.json üret.`);
    totalErrors++;
    continue;
  }

  let spec;
  try {
    spec = JSON.parse(fs.readFileSync(specPath, "utf-8").replace(/^\uFEFF/, ""));
  } catch (e) {
    console.error(`${RED}${BOLD}[SPEC] JSON ayrıştırılamadı (${project.slug}):${RESET} ${e.message}`);
    totalErrors++;
    continue;
  }

  const isNum = (v) => typeof v === "number" && Number.isFinite(v);
  const isInt = (v) => Number.isInteger(v);

  // ---- Proje kimliği ----
  if (!SLUG_RE.test(project.slug)) err("S010", "slug", `klasör adı geçersiz: ${project.slug}`, "küçük harf, rakam ve tire kullan");
  if (!PROJECT_MODES.includes(spec.mode)) err("S011", "mode", `bilinmeyen mod: ${spec.mode}`, PROJECT_MODES.join(" | "));
  if (!fs.existsSync(scenePath)) err("S013", "Scene.tsx", `${rel(scenePath)} yok`, "projeye Scene.tsx ekle (export const Scene)");

  // ---- Üst düzey alanlar ----
  if (spec.version !== 1) err("S001", "version", "version 1 olmalı", "version: 1 yaz");
  if (typeof spec.title !== "string" || !spec.title.trim()) err("S002", "title", "title boş", "kısa bir başlık yaz");
  if (!MODES.includes(spec.mode)) err("S003", "mode", `geçersiz mod: ${spec.mode}`, `şunlardan biri: ${MODES.join(" | ")}`);
  if (!ASPECTS.includes(spec.aspect)) err("S004", "aspect", `geçersiz oran: ${spec.aspect}`, `şunlardan biri: ${ASPECTS.join(" | ")}`);
  if (spec.fps !== 60) err("S005", "fps", `fps ${spec.fps}; stüdyo 60 FPS kilitli`, "fps: 60");
  if (!isNum(spec.durationInSeconds) || spec.durationInSeconds <= 0 || spec.durationInSeconds > 60) {
    err("S006", "durationInSeconds", "0-60 sn aralığında pozitif sayı olmalı", "ör. 6");
  }
  if (!spec.safeZone || !isNum(spec.safeZone.top) || !isNum(spec.safeZone.bottom)) {
    err("S007", "safeZone", "top/bottom sayı olmalı", "safeZone: { top: 250, bottom: 300 }");
  } else {
    if (spec.safeZone.top < 250) err("S008", "safeZone.top", `${spec.safeZone.top} < 250`, "üst güvenli alan en az 250px");
    if (spec.safeZone.bottom < 300) err("S009", "safeZone.bottom", `${spec.safeZone.bottom} < 300`, "alt güvenli alan en az 300px");
  }

  // ---- Tema & Görsel Girdi (v5) ----
  if (spec.theme) {
    const validModes = ["light", "dark", "vibrant-brand", "editorial-warm"];
    if (!validModes.includes(spec.theme.surfaceMode)) {
      err("S015", "theme.surfaceMode", `geçersiz surfaceMode: ${spec.theme.surfaceMode}`, validModes.join(" | "));
    }
  }

  if (spec.detectedWidgets !== undefined) {
    if (!Array.isArray(spec.detectedWidgets)) {
      err("S016", "detectedWidgets", "detectedWidgets bir dize dizisi olmalı", '["InteractiveMap", "SlideOverDrawer", ...]');
    } else {
      spec.detectedWidgets.forEach((w, idx) => {
        if (typeof w !== "string" || !w.trim()) {
          err("S017", `detectedWidgets[${idx}]`, "widget adı boş veya dize değil", "bileşen adını PascalCase olarak yaz");
        }
      });
    }
  }

  const fps = 60;
  const totalFrames = isNum(spec.durationInSeconds) ? Math.round(spec.durationInSeconds * fps) : 0;

  // ---- Beat'ler ----
  const beats = Array.isArray(spec.beats) ? spec.beats : [];
  if (beats.length === 0) err("S020", "beats", "en az 1 beat gerekli", "storyboard'u beat'lere böl");
  const ids = new Set();
  beats.forEach((b, i) => {
    const w = `beats[${i}]`;
    if (!b.id || ids.has(b.id)) err("S021", w, `id boş veya tekrar: ${b.id}`, "benzersiz id ver");
    ids.add(b.id);
    if (!isInt(b.startFrame) || !isInt(b.endFrame) || b.endFrame < b.startFrame) {
      err("S022", w, "startFrame/endFrame tam sayı ve end>=start olmalı", "kare numaralarını düzelt");
    }
    if (typeof b.intent !== "string" || b.intent.trim().length < 3) err("S023", w, "intent boş", "beat'in amacını yaz");
    if (i === 0 && b.startFrame !== 0) err("S024", w, "ilk beat 0. kareden başlamalı", "startFrame: 0");
    if (i > 0 && isInt(b.startFrame) && isInt(beats[i - 1].endFrame) && b.startFrame !== beats[i - 1].endFrame + 1) {
      err(
        "S025",
        w,
        `önceki beat ${beats[i - 1].endFrame}'de bitiyor, bu ${b.startFrame}'de başlıyor (boşluk/çakışma)`,
        `startFrame: ${beats[i - 1].endFrame + 1}`
      );
    }
  });
  if (beats.length && totalFrames && beats[beats.length - 1].endFrame !== totalFrames) {
    err("S026", "beats[last].endFrame", `${beats[beats.length - 1].endFrame} ≠ toplam ${totalFrames} kare`, `endFrame: ${totalFrames}`);
  }

  // ---- Kamera ----
  const camera = Array.isArray(spec.camera) ? spec.camera : [];
  if (camera.length === 0) err("S030", "camera", "sahne sabit kalamaz; en az 1 kamera hareketi", "camera dizisini doldur");
  camera.forEach((c, i) => {
    const w = `camera[${i}]`;
    if (!isNum(c.at) || c.at < 0) err("S031", w, "at >= 0 sayı olmalı", "saniye cinsinden başlangıç");
    if (!isNum(c.duration) || c.duration < 0.05 || c.duration > 2.5) {
      err("S032", w, `duration ${c.duration} aralık dışı`, "0.05–2.5 sn");
    }
    if (typeof c.ease !== "string" || EASE_BANNED.test(c.ease)) {
      err("S033", w, `yasak/eksik ease: ${c.ease}`, "expo.out, power2.inOut, back.out(1.6) gibi bir eğri seç");
    } else if (!EASE_OK.test(c.ease)) {
      err("S034", w, `tanınmayan ease: ${c.ease}`, "gsap ailesi: power1-4|expo|circ|sine|back|quart|quint|cubic + .in/.out/.inOut");
    }
    if (isNum(c.at) && isNum(c.duration) && c.at + c.duration > spec.durationInSeconds + 0.001) {
      err("S035", w, "hareket video süresini aşıyor", "at+duration <= durationInSeconds");
    }
  });

  // Kamera boşluğu (sahne donmasın)
  if (camera.length && isNum(spec.durationInSeconds)) {
    const spans = [
      ...camera.map((c) => [c.at, c.at + c.duration]),
      ...(Array.isArray(spec.shakes) ? spec.shakes : []).map((s) => [s.at, s.at + s.steps * s.stepDuration]),
    ]
      .filter(([a, b]) => isNum(a) && isNum(b))
      .sort((a, b) => a[0] - b[0]);
    let cursor = 0;
    for (const [a, b] of spans) {
      if (a - cursor > MAX_CAMERA_GAP_SEC) {
        err(
          "S036",
          "camera",
          `${cursor.toFixed(2)}s–${a.toFixed(2)}s arası kamera donuk (${(a - cursor).toFixed(2)}s)`,
          `en fazla ${MAX_CAMERA_GAP_SEC}s boşluk; hareket ekle`
        );
      }
      cursor = Math.max(cursor, b);
    }
    if (spec.durationInSeconds - cursor > MAX_CAMERA_GAP_SEC) {
      err("S036", "camera", `${cursor.toFixed(2)}s'den sona kamera donuk`, "kapanış hareketi ekle");
    }
  }

  // ---- Sarsıntı ----
  (Array.isArray(spec.shakes) ? spec.shakes : []).forEach((s, i) => {
    const w = `shakes[${i}]`;
    if (!isInt(s.steps) || s.steps < 2 || s.steps > 8) err("S040", w, "steps 2–8 tam sayı", "ör. 5");
    if (!isNum(s.stepDuration) || s.stepDuration < 0.04 || s.stepDuration > 0.12) err("S041", w, "stepDuration 0.04–0.12", "ör. 0.06");
    if (!isNum(s.amplitudePx) || s.amplitudePx < 2 || s.amplitudePx > 30) err("S042", w, "amplitudePx 2–30", "ör. 14");
  });

  // ---- Koreografi senkron kuralları (shout beat = kamera darbesi + roar sfx) ----
  const sfx = Array.isArray(spec.sfx) ? spec.sfx : [];
  beats
    .filter((b) => b.action === "shout")
    .forEach((b) => {
      const t = b.startFrame / fps;
      if (!camera.some((c) => Math.abs(c.at - t) <= IMPACT_SYNC_SEC)) {
        err(
          "S050",
          `beats[${b.id}]`,
          `shout ${t.toFixed(2)}s'de başlıyor ama ±${IMPACT_SYNC_SEC}s içinde kamera darbesi yok`,
          `camera'ya at≈${t.toFixed(2)} olan bir impact zoom ekle`
        );
      }
      if (!sfx.some((s) => /roar/.test(s.sfx) && Math.abs(s.frame - b.startFrame) <= SFX_SYNC_FRAMES)) {
        err("S051", `beats[${b.id}]`, `shout kare ${b.startFrame}'te roar sfx yok`, `sfx: { frame: ${b.startFrame}, sfx: "roar-shockwave" }`);
      }
      if (typeof b.text !== "string" || !b.text.trim()) err("S052", `beats[${b.id}]`, "shout beat'inde text yok", "bağırılan metni yaz");
    });

  sfx.forEach((s, i) => {
    if (!isInt(s.frame) || s.frame < 0 || s.frame > totalFrames) err("S053", `sfx[${i}]`, `frame ${s.frame} aralık dışı`, `0–${totalFrames}`);
    if (typeof s.sfx !== "string") err("S054", `sfx[${i}]`, "sfx adı yok", "ör. step-stone");
    else if (!fs.existsSync(path.join(rootDir, "public", "sfx", `${s.sfx}.wav`))) {
      err("S055", `sfx[${i}]`, `public/sfx/${s.sfx}.wav bulunamadı`, "mevcut bir sfx adı kullan");
    }
  });

  // ---- Spec ↔ Scene.tsx kayma kontrolü ----
  if (fs.existsSync(scenePath)) {
    const code = fs.readFileSync(scenePath, "utf-8");
    const has = (re) => re.test(code);
    beats.forEach((b) => {
      if (!has(new RegExp(`startFrame:\\s*${b.startFrame}\\b`))) {
        err("S060", `beats[${b.id}]`, `${rel(scenePath)} içinde startFrame: ${b.startFrame} yok`, "kodu spec'e hizala");
      }
      if (b.text && !code.includes(b.text)) err("S061", `beats[${b.id}]`, `"${b.text}" ${rel(scenePath)} içinde geçmiyor`, "metni hizala");
    });
    camera.forEach((c, i) => {
      const at = String(c.at).replace(".", "\\.");
      if (!has(new RegExp(`at:\\s*${at}\\b`))) {
        err("S062", `camera[${i}]`, `${rel(scenePath)} içinde animateCamera at: ${c.at} yok`, "kodu spec'e hizala");
      }
    });
  }

  // ---- Proje Raporu ----
  console.log(`\n${BOLD}==== MOTION SPEC: ${project.slug.toUpperCase()} ====${RESET}`);
  console.log(`Spec: ${rel(specPath)} | ${spec.mode} ${spec.aspect} | ${totalFrames} kare | ${beats.length} beat | ${camera.length} kamera | ${sfx.length} sfx`);

  if (errors.length) {
    errors.forEach((e) => console.log(`${RED}${BOLD}[${e.code}] ${e.where}${RESET}: ${e.problem}\n   Çözüm → ${e.fix}`));
    totalErrors += errors.length;
  } else {
    console.log(`${GREEN}✓ Spec sözleşmesi ve Scene.tsx hizalaması onaylandı.${RESET}`);
  }
}

if (totalErrors > 0) {
  console.log(`\n${RED}${BOLD}[SPEC: GEÇERSİZ] Toplam ${totalErrors} hata bulundu. Düzeltilene kadar devam edilemez.${RESET}\n`);
  process.exit(1);
}

console.log(`\n${GREEN}${BOLD}[TÜM PROJE SPEC'LERİ GEÇERLİ]${RESET}\n`);
process.exit(0);
