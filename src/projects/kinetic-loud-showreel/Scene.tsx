import { type FC } from 'react';
import { useCurrentFrame } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { animateCamera } from '../../core/choreography';
import {
  SpotlightStage,
  CameraRig,
  TechnicalDraftingStage,
} from '../../primitives';

export interface SceneProps {
  aspect?: '9:16' | '16:9';
}

const BEATS = [
  { id: 'pin-matrix', startFrame: 0, endFrame: 119 },
  { id: 'mobius-ribbon', startFrame: 120, endFrame: 299 },
  { id: 'chrome-torus', startFrame: 300, endFrame: 459 },
  { id: 'chrome-star', startFrame: 460, endFrame: 600 },
] as const;

/**
 * Pure CSS 3D Tactile Pin Grid (Zero WebGL overhead, 100% vector sharp)
 */
const PureCss3DPinGrid: FC<{ frame: number }> = ({ frame }) => {
  const rows = 18;
  const cols = 22;

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden [perspective:1200px]">
      <div
        className="grid gap-2.5 p-8"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          transform: 'rotateX(58deg) rotateZ(-28deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        {Array.from({ length: rows * cols }).map((_, i) => {
          const r = Math.floor(i / cols);
          const c = i % cols;
          const dist = Math.sqrt((r - rows / 2) ** 2 + (c - cols / 2) ** 2);
          const wave = Math.sin(frame * 0.12 - dist * 0.45);
          const height = Math.max(8, (wave + 1) * 24);
          const isPeak = wave > 0.65;

          return (
            <div
              key={i}
              className="w-3.5 rounded-sm transition-none"
              style={{
                height: `${height}px`,
                backgroundColor: isPeak ? '#c4ff00' : '#14171f',
                boxShadow: isPeak
                  ? '0 0 16px rgba(196, 255, 0, 0.45), inset 0 1px 2px rgba(255,255,255,0.8)'
                  : 'inset 0 1px 1px rgba(255,255,255,0.06)',
                transform: `translateZ(${height * 1.5}px)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

/**
 * Pure CSS 3D Kinetic Ribbon Strip
 */
const PureCss3DRibbon: FC<{ frame: number }> = ({ frame }) => {
  const rotation = (frame * 1.5) % 360;

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden [perspective:1000px]">
      <div
        className="relative flex items-center justify-center"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(22deg) rotateY(${rotation}deg)`,
        }}
      >
        <div
          className="px-16 py-6 rounded-2xl border-2 border-[#c4ff00] bg-[#c4ff00] text-[#090a0d] font-black text-4xl tracking-widest uppercase shadow-[0_0_40px_rgba(196,255,0,0.35)]"
          style={{ transform: 'translateZ(140px)' }}
        >
          TYPE IN MOTION • 60 FPS
        </div>
        <div
          className="absolute px-16 py-6 rounded-2xl border-2 border-[#c4ff00]/60 bg-[#090a0d] text-[#c4ff00] font-black text-4xl tracking-widest uppercase shadow-[0_0_30px_rgba(196,255,0,0.2)]"
          style={{ transform: 'rotateY(180deg) translateZ(140px)' }}
        >
          LET LETTERS DANCE • PURE VECTOR
        </div>
      </div>
    </div>
  );
};

/**
 * Pure SVG Faceted Metallic Torus Knot Emblem
 */
const PureSvgMetallicTorus: FC<{ frame: number }> = ({ frame }) => {
  const rot = frame * 1.2;

  return (
    <div className="absolute inset-0 flex items-center justify-center [perspective:1000px]">
      <svg
        width="440"
        height="440"
        viewBox="0 0 400 400"
        className="drop-shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
        style={{
          transform: `rotateX(15deg) rotateY(${Math.sin(frame * 0.03) * 25}deg) rotateZ(${rot}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        <defs>
          <linearGradient id="chromeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#8c94a0" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#2c323f" />
            <stop offset="100%" stopColor="#f0f3f8" />
          </linearGradient>
        </defs>
        <circle
          cx="200"
          cy="200"
          r="130"
          fill="none"
          stroke="url(#chromeGrad)"
          strokeWidth="42"
          strokeDasharray="90 30"
          strokeLinecap="round"
        />
        <circle
          cx="200"
          cy="200"
          r="75"
          fill="none"
          stroke="#0f1115"
          strokeWidth="12"
          strokeDasharray="40 20"
        />
      </svg>
    </div>
  );
};

/**
 * Pure SVG Faceted 3D Chrome Star
 */
const PureSvgChromeStar: FC<{ frame: number }> = ({ frame }) => {
  const scale = 1 + Math.sin(frame * 0.06) * 0.08;
  const rot = Math.sin(frame * 0.04) * 20;

  return (
    <div className="absolute inset-0 flex items-center justify-center [perspective:1000px]">
      <svg
        width="460"
        height="460"
        viewBox="0 0 400 400"
        className="drop-shadow-[0_0_50px_rgba(196,255,0,0.3)]"
        style={{
          transform: `scale(${scale}) rotateZ(${rot}deg)`,
        }}
      >
        <defs>
          <linearGradient id="starAcidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#c4ff00" />
            <stop offset="75%" stopColor="#1a202c" />
            <stop offset="100%" stopColor="#c4ff00" />
          </linearGradient>
        </defs>
        <path
          d="M 200 40 Q 200 180 360 200 Q 200 220 200 360 Q 200 220 40 200 Q 200 180 200 40 Z"
          fill="url(#starAcidGrad)"
          stroke="#c4ff00"
          strokeWidth="3"
        />
        <circle cx="200" cy="200" r="16" fill="#08090b" stroke="#c4ff00" strokeWidth="3" />
      </svg>
    </div>
  );
};

export const Scene: FC<SceneProps> = ({ aspect = '16:9' }) => {
  const frame = useCurrentFrame();

  useRemotionGSAP((tl) => {
    animateCamera(tl, '.camera-rig', [
      { at: 0, duration: 0, scale: 0.96, rotateX: 3 },
      { at: 0.05, duration: 1.2, scale: 1.0, rotateX: 0, ease: 'expo.out' },
      { at: 1.6, duration: 1.1, scale: 1.03, y: -20, ease: 'expo.inOut' },
      { at: 3.0, duration: 1.2, scale: 1.08, rotateZ: -1.5, ease: 'expo.inOut' },
      { at: 4.6, duration: 1.2, scale: 1.02, rotateZ: 1.0, ease: 'power3.out' },
      { at: 6.2, duration: 1.2, scale: 1.0, rotateZ: 0, y: -15, ease: 'expo.out' },
      { at: 7.8, duration: 1.2, scale: 1.06, y: -30, ease: 'expo.inOut' },
      { at: 9.2, duration: 0.75, scale: 1.0, y: 0, ease: 'expo.out' },
    ]);
  }, []);

  const isBeat1 = frame >= BEATS[0].startFrame && frame <= BEATS[0].endFrame;
  const isBeat2 = frame >= BEATS[1].startFrame && frame <= BEATS[1].endFrame;
  const isBeat3 = frame >= BEATS[2].startFrame && frame <= BEATS[2].endFrame;
  const isBeat4 = frame >= BEATS[3].startFrame && frame <= BEATS[3].endFrame;

  return (
    <SpotlightStage aspect={aspect}>
      <CameraRig className="camera-rig w-full h-full relative">
        {/* BEAT 1: Dokunsal Voxel Pin Matrisi (Pure CSS 3D) */}
        {isBeat1 && (
          <div className="w-full h-full absolute inset-0 bg-[#08090b]">
            <PureCss3DPinGrid frame={frame} />
            <TechnicalDraftingStage
              sectionIndex={1}
              sectionTotal={4}
              sectionTag="01 / TACTILE PIN MATRIX"
              headline="MAKE IT LOUD."
              subheadline="15 SECONDS. ZERO BORING FRAMES."
              bpm={144}
              badgeText="FRAME-PERFECT"
              gridTheme="acid-dark"
            />
          </div>
        )}

        {/* BEAT 2: Acid Lime Möbius Tipografi Şeridi (Pure CSS 3D) */}
        {isBeat2 && (
          <div className="w-full h-full absolute inset-0 bg-[#0b0c10]">
            <div className="absolute inset-0 bg-[#08090b]/40 backdrop-blur-xs pointer-events-none" />
            <PureCss3DRibbon frame={frame} />
            <TechnicalDraftingStage
              sectionIndex={2}
              sectionTotal={4}
              sectionTag="02 / KINETIC TYPE"
              headline="TYPE IN MOTION."
              subheadline="DIMENSION IS A DESIGN TOOL."
              bpm={144}
              badgeText="144 BPM SYNC"
              gridTheme="acid-dark"
            />
          </div>
        )}

        {/* BEAT 3: Teknik Çizim Kağıdı & Sıvı Krom Torus (Pure SVG) */}
        {isBeat3 && (
          <div className="w-full h-full absolute inset-0 bg-[#d6d9ce]">
            <PureSvgMetallicTorus frame={frame} />
            <TechnicalDraftingStage
              sectionIndex={3}
              sectionTotal={4}
              sectionTag="03 / 3D STUDY"
              headline="FORM. WITHOUT LIMITS."
              subheadline="CHROME / LIGHT / DEPTH."
              bpm={144}
              badgeText="HIT THE BEAT"
              gridTheme="drafting-paper"
            />
          </div>
        )}

        {/* BEAT 4: Şişirilmiş Sıvı Krom Yıldız & Kapanış (Pure SVG) */}
        {isBeat4 && (
          <div className="w-full h-full absolute inset-0 bg-[#08090b]">
            <PureSvgChromeStar frame={frame} />
            <TechnicalDraftingStage
              sectionIndex={4}
              sectionTotal={4}
              sectionTag="04 / ATTENTION"
              headline="I MOVE ATTENTION."
              subheadline="IDEA • FORM • MOVEMENT."
              bpm={144}
              badgeText="PRECISE"
              gridTheme="acid-dark"
            />
          </div>
        )}
      </CameraRig>
    </SpotlightStage>
  );
};

export default Scene;
