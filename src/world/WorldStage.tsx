import type { FC, ReactNode } from 'react';
import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { CameraRig } from '../primitives/CameraRig';

export type SfxName = 'step-stone' | 'roar-shockwave' | 'whoosh-pan' | 'ui-lock';

export interface SfxTrigger {
  frame: number;
  sfx: SfxName;
  volume?: number;
}

export interface TorchLightPoint {
  /** Percentage X (0-100) on the world canvas */
  xPercent: number;
  /** Percentage Y (0-100) on the world canvas */
  yPercent: number;
  /** Diameter in px */
  sizePx?: number;
  intensity?: number;
}

export interface WorldStageProps {
  children: ReactNode;
  backgroundSrc: string;
  aspect?: '9:16' | '16:9';
  rigClassName?: string;
  torchLights?: TorchLightPoint[];
  sfxTriggers?: SfxTrigger[];
  /** Screen-edge crimson adrenaline flash intensity during roars (0 to 1) */
  roarFlashIntensity?: number;
}

/**
 * WorldStage — Tam Ekran (Full-Bleed) 2.5D Sinematik Dünya & Atmosfer Sahnesi
 * - Mekanı küçük bir kutuya hapsetmez; ekranın %100'ünü doldurur ve yatay/dikey kamera Pan alanı (overscan) bırakır.
 * - Ön-Plan Atmosfer Katmanı (Foreground Occlusion) ile karakteri mekanın içine gömer.
 * - Kare-kilitli prosedürel WAV ses efektlerini (SFX) senkronize eder.
 */
export const WorldStage: FC<WorldStageProps> = ({
  children,
  backgroundSrc,
  aspect = '9:16',
  rigClassName = 'camera-rig',
  torchLights = [],
  sfxTriggers = [],
  roarFlashIntensity = 0,
}) => {
  const frame = useCurrentFrame();
  const isVertical = aspect === '9:16';

  return (
    <div
      className={`relative ${
        isVertical ? 'w-[1080px] h-[1920px]' : 'w-[1920px] h-[1080px]'
      } bg-[#070709] select-none overflow-hidden font-sans`}
    >
      {/* 1. KARE-KİLİTLİ SES EFEKTİ (SFX) KANALLARI */}
      {sfxTriggers.map((trig, idx) => (
        <Sequence
          key={`${trig.sfx}-${trig.frame}-${idx}`}
          from={Math.max(0, Math.round(trig.frame))}
          durationInFrames={90}
        >
          <Audio
            src={staticFile(`sfx/${trig.sfx}.wav`)}
            volume={trig.volume ?? 0.65}
          />
        </Sequence>
      ))}

      {/* 2. 3D KAMERA RİG & TAM EKRAN OVERSCAN DÜNYA KANVASI */}
      <CameraRig rigClassName={rigClassName} className="w-full h-full">
        <div
          className={`relative ${
            isVertical ? 'w-[2100px] h-[1920px]' : 'w-[2200px] h-[1240px]'
          } flex items-center justify-center overflow-hidden`}
        >
          {/* KATMAN A (Z-0): TAM EKRAN ARKA PLAN MEKANI */}
          <img
            src={staticFile(backgroundSrc)}
            alt="World Environment"
            className="pointer-events-none absolute inset-0 w-full h-full object-cover"
          />

          {/* KATMAN B (Z-10): DİNAMİK MEŞALE & IŞIK KAYNAKLARI */}
          {torchLights.map((light, idx) => {
            const pulse =
              0.82 +
              0.18 * Math.sin(frame * 0.28 + idx * 1.9) * Math.cos(frame * 0.17 + idx);
            const size = light.sizePx ?? 280;
            const alpha = (light.intensity ?? 0.35) * pulse;

            return (
              <div
                key={idx}
                className="pointer-events-none absolute rounded-full will-change-transform z-10"
                style={{
                  left: `${light.xPercent}%`,
                  top: `${light.yPercent}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  transform: `translate(-50%, -50%) scale(${0.92 + pulse * 0.14})`,
                  background: `radial-gradient(circle, rgba(251,191,36,${alpha.toFixed(
                    3
                  )}) 0%, rgba(245,158,11,${(alpha * 0.45).toFixed(
                    3
                  )}) 45%, rgba(0,0,0,0) 75%)`,
                }}
              />
            );
          })}

          {/* KATMAN C (Z-20): AKTİF KARAKTER VE VFX SAHNESİ */}
          <div className="relative z-20 w-full h-full flex items-center justify-center">
            {children}
          </div>

          {/* KATMAN D (Z-30): 2.5D ÖN-PLAN ATMOSFER & IŞIK HUZMELERİ (Foreground Occlusion) */}
          <div
            className="pointer-events-none absolute inset-0 z-30"
            style={{
              background:
                'radial-gradient(circle at 50% 22%, rgba(251,191,36,0.08) 0%, rgba(0,0,0,0) 55%), linear-gradient(180deg, rgba(7,7,9,0.55) 0%, rgba(7,7,9,0) 18%, rgba(7,7,9,0) 78%, rgba(7,7,9,0.72) 100%)',
            }}
          />
        </div>
      </CameraRig>

      {/* 3. EKRAN KENARI SİNEMATİK VİNYET & BAĞIRMA ADRENALİN NABZI (Z-40) */}
      <div
        className="pointer-events-none absolute inset-0 z-40"
        style={{
          boxShadow: 'inset 0 0 160px 45px rgba(0,0,0,0.78)',
          background:
            roarFlashIntensity > 0.01
              ? `radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 45%, rgba(239,68,68,${(
                  roarFlashIntensity * 0.28
                ).toFixed(3)}) 100%)`
              : undefined,
        }}
      />

      {/* 4. 35MM SİNEMATİK FİLM DOKUSU (%3 Opaklık, Z-50) */}
      <svg
        className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.03] z-50"
        viewBox={isVertical ? '0 0 1080 1920' : '0 0 1920 1080'}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="worldFilmGrain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect
          width={isVertical ? '1080' : '1920'}
          height={isVertical ? '1920' : '1080'}
          fill="#ffffff"
          filter="url(#worldFilmGrain)"
        />
      </svg>
    </div>
  );
};
