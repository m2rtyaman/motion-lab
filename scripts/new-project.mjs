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
const title = getArg("--title", slug ? slug.replace(/-/g, " ").toUpperCase() : "Yeni Sahne");

const RED = "\x1b[31m", GREEN = "\x1b[32m", BOLD = "\x1b[1m", RESET = "\x1b[0m";

if (!slug || !SLUG_RE.test(slug)) {
  console.error(`${RED}${BOLD}[ERROR] Geçersiz veya eksik proje slug'ı:${RESET} "${slug}"`);
  console.log(`Kullanım: node scripts/new-project.mjs <slug> [--mode editorial-ui|cinematic-world|kinetic-poster] [--aspect 9:16|16:9]`);
  process.exit(1);
}

if (!MODES.includes(mode)) {
  console.error(`${RED}${BOLD}[ERROR] Geçersiz mod:${RESET} "${mode}". Seçenekler: ${MODES.join(" | ")}`);
  process.exit(1);
}

if (!ASPECT_DIMS[aspect]) {
  console.error(`${RED}${BOLD}[ERROR] Geçersiz oran:${RESET} "${aspect}". Seçenekler: 9:16 | 16:9`);
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

## Paradigm
${mode}

## Concept
${title} sahnesi için görsel anlatı konsepti.
Bu bölümde sahnenin amacı, mesaj hiyerarşisi ve ana odak elemanları tanımlanır.

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

if (mode === "cinematic-world") {
  beats = [
    { id: "intro", startFrame: 0, endFrame: midFrame - 1, intent: "Sahneye giriş ve yaklaşma", action: "run" },
    { id: "action", startFrame: midFrame, endFrame: totalFrames, intent: "Vurgu aksiyonu", action: "shout", text: "HAZIR MISIN?!" },
  ];
  camera = [
    { at: 0.05, duration: 1.2, ease: "power2.out", intent: "Karaktere giriş takibi" },
    { at: midFrame / 60, duration: 0.2, ease: "back.out(2.0)", intent: "Aksiyon darbe zoom" },
    { at: midFrame / 60 + 0.3, duration: 0.8, ease: "expo.out", intent: "Darbe sonrası yerleşme" },
  ];
} else if (mode === "editorial-ui") {
  beats = [
    { id: "headline", startFrame: 0, endFrame: midFrame - 1, intent: "Hero metin ve ana başlık girişi", action: "headline" },
    { id: "telemetry", startFrame: midFrame, endFrame: totalFrames, intent: "Veri kartı ve metrik akışı", action: "telemetry" },
  ];
  camera = [
    { at: 0.05, duration: 1.4, ease: "expo.inOut", intent: "3D sahneye sinematik süzülüş" },
    { at: midFrame / 60, duration: 0.9, ease: "expo.out", intent: "Veri paneline odaklanma" },
  ];
} else {
  // kinetic-poster
  beats = [
    { id: "burst", startFrame: 0, endFrame: midFrame - 1, intent: "Tipografik patlama", action: "burst" },
    { id: "resolve", startFrame: midFrame, endFrame: totalFrames, intent: "Kapanış ve yerleşme", action: "resolve" },
  ];
  camera = [
    { at: 0.05, duration: 1.0, ease: "power2.out", intent: "Kinetik başlığa yaklaşma" },
    { at: midFrame / 60, duration: 1.2, ease: "power2.inOut", intent: "Son itme" },
  ];
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
  beats,
  camera,
  shakes: [],
  sfx: mode === "cinematic-world" ? [{ frame: midFrame, sfx: "roar-shockwave" }] : [],
};

// 3. Scene.tsx
let sceneContent = "";

if (mode === "cinematic-world") {
  sceneContent = `import { type FC } from 'react';
import { useCurrentFrame } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { animateCamera } from '../../core/choreography';
import { WorldStage, CharacterActor, type ActorMotionSegment } from '../../world';

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
  const frame = useCurrentFrame();

  useRemotionGSAP((tl) => {
    animateCamera(tl, '.camera-rig', [
      { at: 0, duration: 0, scale: 1.05, x: 80, y: -40 },
      { at: 0.05, duration: 1.2, scale: 1.15, x: 0, y: -60, ease: 'power2.out' },
      { at: ${(midFrame / 60).toFixed(2)}, duration: 0.2, scale: 1.28, x: 0, y: -90, ease: 'back.out(2.0)' },
      { at: ${(midFrame / 60 + 0.3).toFixed(2)}, duration: 0.8, scale: 1.18, x: 0, y: -60, ease: 'expo.out' },
    ]);
  }, []);

  return (
    <WorldStage aspect={aspect}>
      <CharacterActor segments={ACTOR_SEGMENTS} />
    </WorldStage>
  );
};

export default Scene;
`;
} else if (mode === "editorial-ui") {
  sceneContent = `import { type FC } from 'react';
import { useCurrentFrame } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { animateCamera, enterSurface } from '../../core/choreography';
import { SpotlightStage, CameraRig, KineticText, SpecularCard } from '../../primitives';
import { PALETTE } from '../../core/tokens';

export interface SceneProps {
  aspect?: '9:16' | '16:9';
}

const BEATS = [
  { id: 'headline', startFrame: 0, endFrame: ${midFrame - 1} },
  { id: 'telemetry', startFrame: ${midFrame}, endFrame: ${totalFrames} },
] as const;

export const Scene: FC<SceneProps> = ({ aspect = '${aspect}' }) => {
  const frame = useCurrentFrame();

  useRemotionGSAP((tl) => {
    animateCamera(tl, '.camera-rig', [
      { at: 0, duration: 0, scale: 0.95, rotateX: 6 },
      { at: 0.05, duration: 1.4, scale: 1, rotateX: 0, ease: 'expo.inOut' },
      { at: ${(midFrame / 60).toFixed(2)}, duration: 0.9, scale: 1.04, y: -40, ease: 'expo.out' },
    ]);
    enterSurface(tl, '.metric-card', ${(midFrame / 60).toFixed(2)});
  }, []);

  return (
    <SpotlightStage aspect={aspect}>
      <CameraRig className="camera-rig">
        <div className="flex flex-col items-center justify-center gap-10">
          <KineticText
            text="${title}"
            variant="hero"
            className="text-center font-extrabold tracking-tighter"
          />
          <div className="metric-card w-[860px]">
            <SpecularCard active>
              <div className="p-8 font-mono text-[24px]" style={{ color: PALETTE.textSecondary }}>
                OPERATIONAL TELEMETRY: READY
              </div>
            </SpecularCard>
          </div>
        </div>
      </CameraRig>
    </SpotlightStage>
  );
};

export default Scene;
`;
} else {
  // kinetic-poster
  sceneContent = `import { type FC } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { animateCamera } from '../../core/choreography';
import { blurScaleReveal, maskWipeReveal } from '../../core/recipes';
import { PALETTE } from '../../core/tokens';

export interface SceneProps {
  aspect?: '9:16' | '16:9';
}

const BEATS = [
  { id: 'burst', startFrame: 0, endFrame: ${midFrame - 1} },
  { id: 'resolve', startFrame: ${midFrame}, endFrame: ${totalFrames} },
] as const;

export const Scene: FC<SceneProps> = () => {
  const frame = useCurrentFrame();

  useRemotionGSAP((tl) => {
    animateCamera(tl, '.poster-rig', [
      { at: 0, duration: 0, scale: 1.08 },
      { at: 0.05, duration: 1.0, scale: 1, ease: 'power2.out' },
      { at: ${(midFrame / 60).toFixed(2)}, duration: 1.2, scale: 1.04, ease: 'power2.inOut' },
    ]);
    blurScaleReveal(tl, '.poster-h1', 0.1);
    maskWipeReveal(tl, '.poster-rule', ${(midFrame / 60).toFixed(2)});
  }, []);

  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.bgBase }}>
      <div className="poster-rig absolute inset-0 flex flex-col items-center justify-center px-16">
        <h1
          className="poster-h1 text-[160px] font-extrabold tracking-tighter leading-none text-center"
          style={{ color: PALETTE.textPrimary }}
        >
          ${title}
        </h1>
        <div className="poster-rule mt-10 h-[6px] w-[500px]" style={{ backgroundColor: PALETTE.semanticSuccess }} />
      </div>
    </AbsoluteFill>
  );
};

export default Scene;
`;
}

fs.writeFileSync(p.direction, directionContent, "utf-8");
fs.writeFileSync(p.spec, JSON.stringify(specContent, null, 2), "utf-8");
fs.writeFileSync(p.scene, sceneContent, "utf-8");

// Kayıt defterini güncelle
runNode("gen-registry.mjs");

console.log(`\n${GREEN}${BOLD}✓ PROJE OLUŞTURULDU:${RESET} ${slug}`);
console.log(`  Dizin     : ${rel(p.dir)}`);
console.log(`  Paradigma : ${mode}`);
console.log(`  Oran      : ${aspect} (${ASPECT_DIMS[aspect][0]}x${ASPECT_DIMS[aspect][1]})`);
console.log(`  Süre      : ${duration}s (${totalFrames} kare @ 60 FPS)`);
console.log(`\nSıradaki adımlar:`);
console.log(`  1. İncele/Düzenle : ${rel(p.direction)} & ${rel(p.spec)}`);
console.log(`  2. Pipeline Başlat: pnpm studio:init --project ${slug} "Açıklama"`);
console.log(`  3. Kalite Denetimi: pnpm check --project ${slug}`);
console.log(`  4. Render         : pnpm render --project ${slug}\n`);
