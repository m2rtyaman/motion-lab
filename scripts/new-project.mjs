import fs from "node:fs";
import path from "node:path";
import {
  projectsDir,
  projectPaths,
  SLUG_RE,
  MODES,
  ASPECT_DIMS,
  rootDir,
  rel,
  runNode,
} from "./lib/projects.mjs";

/**
 * YENİ PROJE İSKELET ÜRETİCİSİ (Scaffolder)
 *
 * Kullanım:
 *   node scripts/new-project.mjs <slug> [--mode <cinematic-world|editorial-ui|kinetic-poster>] [--aspect 9:16|16:9] [--duration 6] [--title "Başlık"]
 */

const argv = process.argv.slice(2);
const positional = argv.filter((a) => !a.startsWith("-"));
const slug = positional[0];

const getArg = (flag, def) => {
  const idx = argv.indexOf(flag);
  return idx !== -1 && argv[idx + 1] ? argv[idx + 1] : def;
};

const mode = getArg("--mode", "editorial-ui");
const aspect = getArg("--aspect", "9:16");
const duration = parseFloat(getArg("--duration", "6"));
const themeArg = getArg("--theme", null);
const title = getArg("--title", slug ? slug.replace(/-/g, " ").toUpperCase() : "Yeni Sahne");

const THEMES = ["light", "dark", "vibrant-brand", "editorial-warm", "kinetic-acid", "technical-drafting"];
const DEFAULT_THEME = { "editorial-ui": "light", "kinetic-poster": "editorial-warm", "cinematic-world": "dark", "creative-motion-reel": "dark", "hybrid-orchestrated": "dark" };
const TRANSITION_CYCLE = [
  { type: "element-takeover", fn: "transitionElementTakeover" },
  { type: "camera-dive", fn: "transitionCameraDive" },
  { type: "mask-wipe", fn: "transitionMaskWipe" },
];
const RED = "\x1b[31m", GREEN = "\x1b[32m", BOLD = "\x1b[1m", RESET = "\x1b[0m";

if (!slug || !SLUG_RE.test(slug)) {
  console.error(`${RED}${BOLD}[ERROR] Invalid or missing project slug:${RESET} "${slug}"`);
  console.log(`Usage: node scripts/new-project.mjs <slug> [--mode editorial-ui|cinematic-world|kinetic-poster] [--aspect 9:16|16:9]`);
  process.exit(1);
}

if (!MODES.includes(mode)) {
  console.error(`${RED}${BOLD}[ERROR] Invalid mode:${RESET} "${mode}". Options: ${MODES.join(" | ")}`);
  process.exit(1);
}

if (!ASPECT_DIMS[aspect]) {
  console.error(`${RED}${BOLD}[ERROR] Invalid aspect ratio:${RESET} "${aspect}". Options: 9:16 | 16:9 | 1:1`);
  process.exit(1);
}

const surfaceMode = themeArg ?? DEFAULT_THEME[mode];
if (!THEMES.includes(surfaceMode)) {
  console.error(`${RED}${BOLD}[ERROR] Geçersiz tema:${RESET} "${surfaceMode}". Seçenekler: ${THEMES.join(" | ")}`);
  process.exit(1);
}

const p = projectPaths(slug);

if (fs.existsSync(p.dir)) {
  console.error(`${RED}${BOLD}[ERROR] "${slug}" projesi zaten mevcut:${RESET} ${rel(p.dir)}`);
  process.exit(1);
}

fs.mkdirSync(p.dir, { recursive: true });

// 1. direction.md
const directionContent = `# Direction — ${title}

## Tek Cümlelik Hedef
${title} sahnesi ile izleyiciye net, dinamik ve akıcı bir görsel deneyim sunmak.

## Paradigm
${mode}

## 3 Girdi Görev Ayrımı (The 3-Input Rule)
> Referans: references/MASTER_STORYBOARD_RULES.md
- **Script (Senaryo - Neyi/Niçin):** Sahnenin temel mesajı, problem-çözüm kurgusu ve değer önerisi.
- **Storyboard (Görsel Kurgu - Nasıl Görünüyor):** 3 katmanlı derinlik kompozisyonu, ışık açıları ve Hardware Shell pencere çapalaması.
- **Motion Reference (Hareket Dinamiği - Nasıl Hareket Ediyor):** Yay ve sönümlenme eğrileri, kavisli Bézier yolları ve kesintisiz kinetik devir teslim zinciri.

## 3 Katmanlı Derinlik Mimarisi (3-Layer Depth System)
- **Katman 1 (Zemin):** Atmosferik koyu mat zemin / difüze radyal degrade / 1px kılcal kılavuz ızgarası.
- **Katman 2 (İkincil Derinlik & İz):** Ön plandaki nesnenin arkasından gelen hayalet kontur (2-3f trailing lag) ve yumuşak ortam temas gölgesi.
- **Katman 3 (Kahraman Ön Plan):** Kristal netliğinde tipografi (min 18px), 1px pahlı speküler faset ve katı kahraman aktör.

## Kahraman Aktör Yaşam Döngüsü (TheHeroActor Lifecycle)
0. kareden son kareye kadar sahnede fiziksel olarak yaşayan ($opacity > 0$) ana geometrik aktörün form dönüşüm zinciri:
[Başlangıç Formu] ➔ [Genişleyen Taşıyıcı] ➔ [Fonksiyonel Matris] ➔ [Nihai Marka Amblemi (>= 1.2s Stillness Hold)]

## Physics
Ağırlık ve ivmelenme prensipleri, yaylanma ve sönümlenme karakteri.
Örn: sert frenler, tok darbe oturması (power3.out, expo.out), 12 animasyon prensibi.

## Typography & Palette
Tipografi hiyerarşisi ve renk kararları.
Sıfır neon glow, sıfır mikro-font (min 18px), mat anlamsal renkler (#10b981 / #ef4444) ve nötr zinc paleti.
`;

// 2. spec.json
const totalFrames = Math.round(duration * 60);
const midFrame = Math.round(totalFrames / 2);

let beats = [];
let camera = [];
let transitions = [];

if (mode === "cinematic-world") {
  beats = [
    { id: "intro", startFrame: 0, endFrame: midFrame - 1, intent: "Sahneye giriş ve yaklaşma", action: "run" },
    { id: "action", startFrame: midFrame, endFrame: totalFrames, intent: "Vurgu aksiyonu", action: "shout", text: "HAZIR MISIN?!" },
  ];
  camera = [
    { at: 0.05, duration: 1.2, ease: "power2.out", intent: "Karaktere giriş takibi" },
    { at: midFrame / 60, duration: 0.2, ease: "back.out(2.0)", intent: "Aksiyon darbe zoom" },
    { at: Number((midFrame / 60 + 0.3).toFixed(2)), duration: 0.8, ease: "expo.out", intent: "Darbe sonrası yerleşme" },
  ];
} else {
  // editorial-ui & kinetic-poster: katmanlı beat'ler + beat sınırında geçiş (v2)
  const beatCount = Math.min(6, Math.max(2, Math.round(duration / 3.5)));
  const WEIGHTS = [1.0, 1.4, 0.8, 1.25, 0.9, 1.3].slice(0, beatCount);
  const wSum = WEIGHTS.reduce((a, b) => a + b, 0);
  let starts = WEIGHTS.map((_, i) => Math.round((WEIGHTS.slice(0, i).reduce((a, b) => a + b, 0) / wSum) * totalFrames));
  // Final beat en az 72 kare (1.2s Stillness Hold) güvencesi
  if (totalFrames >= 180 && starts.length >= 2 && totalFrames - starts[starts.length - 1] < 72) {
    starts[starts.length - 1] = totalFrames - 72;
  }
  const NAMES = ["hook", "proof", "flow", "scale", "payoff", "outro"];
  beats = Array.from({ length: beatCount }, (_, i) => ({
    id: NAMES[i],
    startFrame: starts[i],
    endFrame: i === beatCount - 1 ? totalFrames : starts[i + 1] - 1,
    intent: i === 0 ? "Kanca: ana vaat" : i === beatCount - 1 ? "Kapanış: marka ve eylem çağrısı (1.2s stillness hold)" : "Gelişme: kanıt ve akış",
    action: NAMES[i],
  }));
  transitions = beats.slice(1).map((b, i) => ({
    type: TRANSITION_CYCLE[i % TRANSITION_CYCLE.length].type,
    atFrame: b.startFrame - 10,
    bridge: `.scene-beat-${i + 1}-card`,
  }));
  camera = [{ at: 0.05, duration: 1.0, ease: "power3.out", intent: "Açılışta sahneye yerleşme" }];
  transitions.forEach((t, i) => {
    camera.push({ at: Number((t.atFrame / 60).toFixed(2)), duration: 0.65, ease: "expo.inOut", intent: `Geçiş ${i + 1} ile kilitli kamera itişi` });
  });
}

const specContent = {
  $schema: "../../../specs/motion-spec.schema.json",
  version: 1,
  title,
  mode,
  aspect,
  fps: 60,
  durationInSeconds: duration,
  safeZone: { top: 250, bottom: 300 },
  theme: { surfaceMode },
  ...(mode === "cinematic-world" ? { continuousShot: true } : { transitions }),
  beats,
  camera,
  shakes: [],
  sfx: mode === "cinematic-world" ? [{ frame: midFrame, sfx: "roar-shockwave" }] : [],
};

// 3. Scene.tsx
let sceneContent = "";

if (mode === "cinematic-world") {
  sceneContent = `import { type FC } from 'react';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { animateCamera } from '../../core/choreography';
import { WorldStage, CharacterActor, type ActorMotionSegment } from '../../world';

// Başlangıç dünyası: dwarf-arena arka planı. Kendi sahnen için public/projects/<slug>/ altına arka plan ekle.
export const SHOUT_TEXT = 'HAZIR MISIN?!';

export interface SceneProps {
  aspect?: '9:16' | '16:9';
}

const ACTOR_SEGMENTS: ActorMotionSegment[] = [
  {
    startFrame: 0,
    endFrame: ${midFrame - 1},
    fromX: -240,
    fromY: 200,
    toX: 0,
    toY: 220,
    fromScale: 2.2,
    toScale: 2.5,
    facingRight: true,
    action: 'run',
  },
  {
    startFrame: ${midFrame},
    endFrame: ${totalFrames},
    fromX: 0,
    fromY: 220,
    toX: 0,
    toY: 220,
    fromScale: 2.5,
    toScale: 2.55,
    facingRight: true,
    action: 'shout',
  },
];

export const Scene: FC<SceneProps> = ({ aspect = '${aspect}' }) => {
  useRemotionGSAP((tl) => {
    animateCamera(tl, '.camera-rig', [
      { at: 0, duration: 0, scale: 1.05, x: 80, y: -40 },
      { at: 0.05, duration: 1.2, scale: 1.15, x: 0, y: -60, ease: 'power2.out' },
      { at: ${Number((midFrame / 60).toFixed(2))}, duration: 0.2, scale: 1.28, x: 0, y: -90, ease: 'back.out(2.0)' },
      { at: ${Number((midFrame / 60 + 0.3).toFixed(2))}, duration: 0.8, scale: 1.18, x: 0, y: -60, ease: 'expo.out' },
    ]);
  }, []);

  return (
    <WorldStage aspect={aspect} backgroundSrc="projects/dwarf-arena/arena_bg.png">
      <CharacterActor segments={ACTOR_SEGMENTS} />
    </WorldStage>
  );
};

export default Scene;
`;
} else {
  const poster = mode === "kinetic-poster";
  const lines = [];
  const L = (s = "") => lines.push(s);
  L("import { type FC } from 'react';");
  L("import { AbsoluteFill } from 'remotion';");
  L("import { useRemotionGSAP } from '../../core/useRemotionGSAP';");
  L("import { animateCamera } from '../../core/choreography';");
  L("import { DURATIONS, EASING } from '../../core/tokens';");
  L("import { BackdropField } from '../../primitives';");
  L("import { getTheme, " + [...new Set(transitions.map((t) => TRANSITION_CYCLE.find((x) => x.type === t.type).fn))].join(", ") + " } from '../../core';");
  L();
  L("export interface SceneProps {");
  L("  aspect?: '9:16' | '16:9';");
  L("}");
  L();
  L("// Renkler HER ZAMAN temadan gelir (spec.theme.surfaceMode). Hex gömme.");
  L("const theme = getTheme('" + surfaceMode + "');");
  L();
  L("export const BEATS = [");
  beats.forEach((b) => L("  { id: '" + b.id + "', startFrame: " + b.startFrame + ", endFrame: " + b.endFrame + " },"));
  L("] as const;");
  L();
  L("export const Scene: FC<SceneProps> = () => {");
  L("  useRemotionGSAP((tl) => {");
  L("    animateCamera(tl, '.camera-rig', [");
  L("      { at: 0, duration: 0, scale: 1.04 },");
  camera.forEach((cm, i) => {
    L("      { at: " + cm.at + ", duration: " + cm.duration + ", scale: " + (i === 0 ? "1" : i % 2 ? "1.03" : "1") + ", ease: '" + cm.ease + "' },");
  });
  L("    ]);");
  L();
  beats.forEach((b, i) => {
    const t0 = Number((b.startFrame / 60).toFixed(2));
    const tEnd = Number((b.endFrame / 60).toFixed(2));
    const holdDur = Math.max(0.6, Number((tEnd - t0 - 0.35).toFixed(2)));
    L("    // Beat " + (i + 1) + " (" + b.id + "): giriş + sürekli intra-beat hareket (donuk slayt yasağı)");
    L("    tl.fromTo('.b" + (i + 1) + "-title', { opacity: 0, y: 40, scale: 0.94 }, { opacity: 1, y: 0, scale: 1.0, duration: DURATIONS.camera, ease: EASING.expoOut }, " + (i === 0 ? "0.1" : (t0 + 0.08).toFixed(2)) + ");");
    L("    tl.fromTo('.b" + (i + 1) + "-sub', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: DURATIONS.panel, ease: EASING.powerOut }, " + (i === 0 ? "0.28" : (t0 + 0.22).toFixed(2)) + ");");
    L("    // Beat boyunca kesintisiz ölçek/derinlik akışı (intra-beat alive motion)");
    L("    tl.to('.b" + (i + 1) + "-stage', { scale: 1.06, y: -12, duration: " + holdDur + ", ease: 'sine.inOut' }, " + (t0 + 0.25).toFixed(2) + ");");
    if (i < beats.length - 1) {
      const tr = transitions[i];
      const at = (tr.atFrame / 60).toFixed(2);
      const out = ".scene-beat-" + (i + 1), inc = ".scene-beat-" + (i + 2);
      L("    // Geçiş " + (i + 1) + ": " + tr.type + " (kinetik devir teslim)");
      if (tr.type === "element-takeover") L("    transitionElementTakeover(tl, '.b" + (i + 1) + "-trigger', '" + out + "', '" + inc + "', { at: " + at + ", duration: DURATIONS.camera });");
      else if (tr.type === "camera-dive") L("    transitionCameraDive(tl, '.camera-rig', '" + out + "', '" + inc + "', { at: " + at + ", duration: DURATIONS.long, diveScale: 2.4 });");
      else L("    transitionMaskWipe(tl, '" + inc + "', { at: " + at + ", type: 'diagonal', duration: DURATIONS.scene, outgoingSelector: '" + out + "' });");
    }
    L();
  });
  L("  }, []);");
  L();
  L("  return (");
  L("    <AbsoluteFill style={{ backgroundColor: theme.colors.bgPrimary, color: theme.colors.textPrimary }}>");
  L("      <div className=\"camera-rig absolute inset-0\">");
  beats.forEach((b, i) => {
    const first = i === 0;
    L("        <section className=\"scene-beat-" + (i + 1) + " absolute inset-0 flex flex-col items-" + (poster ? "start" : "center") + " justify-center px-24 overflow-hidden\" style={{ opacity: " + (first ? 1 : 0) + ", backgroundColor: theme.colors." + (i % 2 ? "bgSurfaceSubtle" : "bgPrimary") + " }}>");
    L("          <BackdropField theme={theme} variant=\"" + ["mesh", "grid", "rings", "rays"][i % 4] + "\" intensity={0.6} />");
    L("          <div className=\"b" + (i + 1) + "-stage relative z-10 flex flex-col items-" + (poster ? "start" : "center") + " gap-6\">");
    L("            <h1 className={`b" + (i + 1) + "-title ${theme.typography.heroClass} " + (poster ? "" : "text-center") + "`} style={{ color: theme.colors.textPrimary, fontSize: " + (poster ? 188 : 128) + ", lineHeight: 0.98 }}>" + (first ? title : b.id.toUpperCase()) + "</h1>");
    L("            <p className={`b" + (i + 1) + "-sub b" + (i + 1) + "-trigger ${theme.typography.bodyClass} max-w-[960px]" + (poster ? "" : " text-center") + "`} style={{ color: theme.colors.textMuted, fontSize: 32 }}>" + b.intent + "</p>");
    L("          </div>");
    L("        </section>");
  });
  L("      </div>");
  L("    </AbsoluteFill>");
  L("  );");
  L("};");
  L();
  L("export default Scene;");
  sceneContent = lines.join("\n") + "\n";
}

fs.writeFileSync(p.direction, directionContent, "utf-8");
fs.writeFileSync(p.spec, JSON.stringify(specContent, null, 2), "utf-8");
fs.writeFileSync(p.scene, sceneContent, "utf-8");

// Kayıt defterini güncelle
runNode("gen-registry.mjs");

console.log(`\n${GREEN}${BOLD}✓ PROJECT CREATED:${RESET} ${slug}`);
console.log(`  Directory : ${rel(p.dir)}`);
console.log(`  Paradigm  : ${mode}`);
console.log(`  Aspect    : ${aspect} (${ASPECT_DIMS[aspect][0]}x${ASPECT_DIMS[aspect][1]})`);
console.log(`  Duration  : ${duration}s (${totalFrames} frames @ 60 FPS)`);
console.log(`\nNext steps:`);
console.log(`  1. Review/Edit          : ${rel(p.direction)} & ${rel(p.spec)}`);
console.log(`  2. Storyboard Audit     : pnpm audit:storyboard --project ${slug}`);
console.log(`  3. Quality Gate Check   : pnpm check --project ${slug}`);
console.log(`  4. Visual Contact Sheet : pnpm render:contact-sheet --project ${slug}`);
console.log(`  5. Render MP4           : pnpm render --project ${slug}\n`);
