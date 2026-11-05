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
const MODES = ["cinematic-world", "editorial-ui", "kinetic-poster", "creative-motion-reel", "hybrid-orchestrated"];
const ASPECTS = ["9:16", "16:9", "1:1"];
const EASE_OK = /^(power[1-4]|expo|circ|sine|back|quart|quint|cubic)\.(in|out|inOut)(\(\s*[\d.]+\s*\))?$/;
const EASE_BANNED = /^(linear|none|ease|ease-?in|ease-?out|ease-?in-?out|easeInOut|easeIn|easeOut)$/i;
const MAX_CAMERA_GAP_SEC = 4.5;
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
    err("S007", "safeZone", "top/bottom sayı olmalı", "safeZone: { top: 250, bottom: 300 } (9:16) veya { top: 40, bottom: 40 } (16:9 / 1:1)");
  } else {
    const isHorizontal = spec.aspect === "16:9" || spec.aspect === "1:1";
    const minTop = isHorizontal ? 30 : 250;
    const minBottom = isHorizontal ? 30 : 300;
    if (spec.safeZone.top < minTop) err("S008", "safeZone.top", `${spec.safeZone.top} < ${minTop}`, isHorizontal ? "16:9 / 1:1 için üst güvenli alan 30-60px civarı olmalı" : "üst güvenli alan en az 250px");
    if (spec.safeZone.bottom < minBottom) err("S009", "safeZone.bottom", `${spec.safeZone.bottom} < ${minBottom}`, isHorizontal ? "16:9 / 1:1 için alt güvenli alan 30-60px civarı olmalı" : "alt güvenli alan en az 300px");
  }

  // ---- Tema & Görsel Girdi (v5/v6) ----
  if (spec.theme) {
    const validModes = ["light", "dark", "vibrant-brand", "editorial-warm", "kinetic-acid", "technical-drafting"];
    if (!validModes.includes(spec.theme.surfaceMode)) {
      err("S015", "theme.surfaceMode", `geçersiz surfaceMode: ${spec.theme.surfaceMode}`, validModes.join(" | "));
    }
  }

  const declaredComponents = spec.componentStack || spec.detectedWidgets;
  if (declaredComponents !== undefined) {
    if (!Array.isArray(declaredComponents)) {
      err("S016", "componentStack", "componentStack / detectedWidgets bir dize dizisi olmalı", '["InteractiveMap", "ChartCanvas", ...]');
    } else {
      declaredComponents.forEach((w, idx) => {
        if (typeof w !== "string" || !w.trim()) {
          err("S017", `componentStack[${idx}]`, "bileşen adı boş veya dize değil", "bileşen adını PascalCase olarak yaz");
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



  // ---- Hibrit Orkestrasyon Sahneleri (hybrid-orchestrated) ----
  if (spec.mode === "hybrid-orchestrated") {
    const scenes = Array.isArray(spec.scenes) ? spec.scenes : [];
    if (scenes.length < 2) {
      err("S028", "scenes", "hybrid-orchestrated modunda en az 2 bağımsız sahne arketipi gereklidir", 'scenes: [{ id: "intro", archetype: "bento-editorial", startFrame: 0, endFrame: 150 }, ...]');
    }
    const VALID_ARCHETYPES = [
      "bento-editorial",
      "kinetic-void",
      "terminal-mockup",
      "device-editorial",
      "specimen-editorial",
      "papercraft-cutout",
      "sculptural-reel",
      "product-promo",
      "swiss-grid",
      "data-rollup",
    ];
    scenes.forEach((s, idx) => {
      const sw = `scenes[${idx}]`;
      if (!s.id || typeof s.id !== "string") err("S029a", sw, "sahne id eksik", "id tanımla");
      if (!s.archetype || !VALID_ARCHETYPES.includes(s.archetype)) {
        err("S029b", `${sw}.archetype`, `geçersiz arketip: ${s.archetype}`, VALID_ARCHETYPES.join(" | "));
      }
      if (!isInt(s.startFrame) || !isInt(s.endFrame) || s.endFrame <= s.startFrame) {
        err("S029c", sw, "startFrame ve endFrame tam sayı olmalı ve endFrame > startFrame olmalıdır", "kare numaralarını düzelt");
      }
    });
  }

  // ---- Kamera ----
  const camera = Array.isArray(spec.camera) ? spec.camera : [];
  const isSingleContainer =
    Boolean(spec.transitions && spec.transitions.some((t) => t.type === "container-morph")) ||
    spec.singleContainer === true;
  if (camera.length === 0 && spec.mode !== "creative-motion-reel" && spec.mode !== "kinetic-poster" && !isSingleContainer) {
    err("S030", "camera", "sahne sabit kalamaz; en az 1 kamera hareketi", "camera dizisini doldur");
  }
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

  // Kamera boşluğu (sahne donmasın; kinetik 2D vektör ve tek kap yaşayan bileşen sahnelerinde tuval sabit olabileceği için muaftır)
  if (camera.length && isNum(spec.durationInSeconds) && spec.mode !== "creative-motion-reel" && spec.mode !== "kinetic-poster" && !isSingleContainer) {
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

  // ---- SFX Dosya Varlığı Kontrolü ----
  const sfx = Array.isArray(spec.sfx) ? spec.sfx : [];
  sfx.forEach((s, i) => {
    if (!isInt(s.frame) || s.frame < 0 || s.frame > totalFrames) err("S053", `sfx[${i}]`, `frame ${s.frame} aralık dışı`, `0–${totalFrames}`);
    if (typeof s.sfx !== "string") err("S054", `sfx[${i}]`, "sfx adı yok", "ör. step-stone");
    else if (!fs.existsSync(path.join(rootDir, "public", "sfx", `${s.sfx}.wav`))) {
      err("S055", `sfx[${i}]`, `public/sfx/${s.sfx}.wav bulunamadı`, "mevcut bir sfx adı kullan");
    }
  });

  // ---- Geçiş sözleşmesi (S070-S073): her beat sınırı bir geçiş taşır ----
  const TRANSITION_TYPE_RE = /^[a-z0-9][a-z0-9-]*$/;
  const transitions = Array.isArray(spec.transitions) ? spec.transitions : [];
  if (spec.legacy !== true && spec.continuousShot !== true && beats.length >= 2) {
    if (transitions.length !== beats.length - 1)
      err("S070", "transitions", `${transitions.length} geçiş / ${beats.length - 1} beat sınırı`, "her ardışık beat çifti için spec.transitions girdisi ekle");
    transitions.forEach((tr, i) => {
      const w = `transitions[${i}]`;
      if (typeof tr.type !== "string" || !TRANSITION_TYPE_RE.test(tr.type))
        err("S071", w, `geçersiz tip formatı: "${tr.type}"`, "kebab-case geçiş adı yazın (örn: whip-pan, mask-wipe, svg-morph, zoom-punch, container-morph)");
      const next = beats[i + 1];
      if (next && Number.isFinite(tr.atFrame) && Math.abs(tr.atFrame - next.startFrame) > 45)
        err("S072", w, `atFrame ${tr.atFrame}, sonraki beat ${next.startFrame}'de başlıyor (>45 kare sapma)`, "geçişi beat sınırına hizala");
      if (!Number.isFinite(tr.atFrame)) err("S073", w, "atFrame (kare) yok", "atFrame: <sınır kare>");
    });
    // S074: Kaldırıldı; tutarlı tek tip geçiş tasarımına (ör. tüm sahnelerde container-morph) izin verilir.
  }
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
    if (spec.mode !== "creative-motion-reel" && spec.mode !== "kinetic-poster") {
      const hasCameraChoreography = has(/animateCamera|CameraRig|VirtualCameraRig|\.camera-rig|\.poster-rig|SPEC_CAMERA|CAMERA_KEYFRAMES|applyIsometricTilt|applyFocusZoom|SpatialCamera|useCamera/i);
      if (!hasCameraChoreography) {
        camera.forEach((c, i) => {
          const at = String(c.at).replace(".", "\\.");
          const atFrame = Math.round(c.at * fps);
          if (!has(new RegExp(`at:\\s*${at}\\b`)) && !has(new RegExp(`\\b${atFrame}\\b`))) {
            err("S062", `camera[${i}]`, `${rel(scenePath)} içinde kamera hareketi (at: ${c.at}) bulunamadı`, "kodu spec'e hizala veya CameraRig ekle");
          }
        });
      }
    }
  }

  // ---- Project Report ----
  console.log(`\n${BOLD}==== MOTION SPEC: ${project.slug.toUpperCase()} ====${RESET}`);
  console.log(`Spec: ${rel(specPath)} | ${spec.mode} ${spec.aspect} | ${totalFrames} frames | ${beats.length} beats | ${camera.length} camera | ${sfx.length} sfx`);

  if (errors.length) {
    errors.forEach((e) => console.log(`${RED}${BOLD}[${e.code}] ${e.where}${RESET}: ${e.problem}\n   Fix → ${e.fix}`));
    totalErrors += errors.length;
  } else {
    console.log(`${GREEN}✓ Spec contract and Scene.tsx alignment verified.${RESET}`);
  }
}

if (totalErrors > 0) {
  console.log(`\n${RED}${BOLD}[SPEC: INVALID] Total ${totalErrors} errors found. Fix before proceeding.${RESET}\n`);
  process.exit(1);
}

console.log(`\n${GREEN}${BOLD}[ALL PROJECT SPECS VALID]${RESET}\n`);
process.exit(0);

