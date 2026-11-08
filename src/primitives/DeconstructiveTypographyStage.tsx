import { type FC, type ReactNode } from 'react';
import { useCurrentFrame } from 'remotion';
import {
  type TypographicFragmentDefinition,
  evaluateFragmentState,
  computeLayeredTimingProgress,
} from '../core/deconstructive-type-math';

/**
 * DECONSTRUCTIVE MINT PALETTE
 * Kaynak: references/DECONSTRUCTIVE_TYPOGRAPHY_GUIDE.md
 */
export const DECONSTRUCTIVE_MINT_PALETTE = {
  bg: '#050706',
  bgRadial: 'radial-gradient(circle at 50% 45%, rgba(10, 36, 24, 0.45) 0%, rgba(5, 7, 6, 0.95) 75%, #050706 100%)',
  mintSolid: '#00ffa3',
  mintGlow: 'rgba(0, 255, 163, 0.45)',
  ghostOutline: 'rgba(0, 255, 163, 0.28)',
  ghostDark: 'rgba(12, 48, 32, 0.85)',
  floorLine: 'rgba(0, 255, 163, 0.35)',
  floorSpread: 'rgba(0, 255, 163, 0.08)',
  textWhite: '#f4f4f5',
} as const;

// -----------------------------------------------------------------------------
// 1. ILLUMINATED FLOOR SURFACE (Kılcal Zemin Işıltısı / Taban Yansıması)
// -----------------------------------------------------------------------------

export interface IlluminatedFloorSurfaceProps {
  yPositionPercent?: number; // varsayılan: %75 (lower third)
  opacity?: number;
  width?: number | string;
  glowColor?: string;
  className?: string;
}

/** @deprecated legacy look — not for v2 */
export const IlluminatedFloorSurface: FC<IlluminatedFloorSurfaceProps> = ({
  yPositionPercent = 75,
  opacity = 0.65,
  width = '82%',
  glowColor = DECONSTRUCTIVE_MINT_PALETTE.floorLine,
  className = '',
}) => {
  return (
    <div
      className={`absolute left-1/2 -translate-x-1/2 pointer-events-none select-none flex flex-col items-center ${className}`}
      style={{
        top: `${yPositionPercent}%`,
        width,
        opacity,
      }}
    >
      {/* 1px kılcal parlak zemin çizgisi */}
      <div
        className="w-full h-[1px] rounded-full"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${glowColor} 25%, #ffffff 50%, ${glowColor} 75%, transparent 100%)`,
          boxShadow: `0 0 16px ${DECONSTRUCTIVE_MINT_PALETTE.mintGlow}`,
        }}
      />
      {/* Yayvan difüze zemin yansıması */}
      <div
        className="w-3/4 h-6 -mt-1 blur-[10px] rounded-full"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${DECONSTRUCTIVE_MINT_PALETTE.floorSpread} 0%, transparent 80%)`,
        }}
      />
    </div>
  );
};

// -----------------------------------------------------------------------------
// 2. HORIZONTAL GRAPHIC SLIT (Yatay Grafik Çizgi ve Blok Geçişi)
// -----------------------------------------------------------------------------

export interface HorizontalGraphicSlitProps {
  progress: number; // 0..1
  lineCount?: number;
  color?: string;
  className?: string;
}

/** @deprecated legacy look — not for v2 */
export const HorizontalGraphicSlit: FC<HorizontalGraphicSlitProps> = ({
  progress,
  lineCount = 4,
  color = DECONSTRUCTIVE_MINT_PALETTE.mintSolid,
  className = '',
}) => {
  if (progress <= 0 || progress >= 1) return null;

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {Array.from({ length: lineCount }).map((_, i) => {
        const top = 35 + i * 10;
        const speedMultiplier = 1 + (i % 2) * 0.4;
        const travel = (progress * 160 * speedMultiplier - 30) % 120;
        const width = 180 + (i * 70);

        return (
          <div
            key={i}
            className="absolute h-[2px] rounded-full"
            style={{
              top: `${top}%`,
              left: `${travel}%`,
              width: `${width}px`,
              background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
              boxShadow: `0 0 12px ${DECONSTRUCTIVE_MINT_PALETTE.mintGlow}`,
              opacity: Math.sin(progress * Math.PI),
            }}
          />
        );
      })}
    </div>
  );
};

// -----------------------------------------------------------------------------
// 3. DECONSTRUCTIVE TYPOGRAPHY STAGE (Tam Sahne Kapsayıcı)
// -----------------------------------------------------------------------------

export interface DeconstructiveTypographyStageProps {
  children?: ReactNode;
  aspect?: '16:9' | '9:16';
  className?: string;
}

/** @deprecated legacy look — not for v2 */
export const DeconstructiveTypographyStage: FC<DeconstructiveTypographyStageProps> = ({
  children,
  aspect = '16:9',
  className = '',
}) => {
  const isVertical = aspect === '9:16';

  return (
    <div
      className={`w-full h-full relative overflow-hidden flex flex-col items-center justify-center select-none ${isVertical ? 'px-8' : 'px-20'} ${className}`}
      style={{
        backgroundColor: DECONSTRUCTIVE_MINT_PALETTE.bg,
        backgroundImage: DECONSTRUCTIVE_MINT_PALETTE.bgRadial,
      }}
    >
      {/* Çok hafif merkezi atmosferik yeşil ışık */}
      <div
        className="absolute w-[700px] h-[700px] rounded-full pointer-events-none blur-[160px]"
        style={{
          background: 'radial-gradient(circle, rgba(0, 255, 163, 0.12) 0%, transparent 65%)',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Taban Yansıması */}
      <IlluminatedFloorSurface yPositionPercent={76} />

      {/* Sahne İçeriği */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// 4. KINETIC DECONSTRUCTIVE WORD (Fiziksel Parçalanan Harf Bloğu)
// -----------------------------------------------------------------------------

export interface DeconstructiveWordAssemblyProps {
  fragments: TypographicFragmentDefinition[];
  startFrame?: number;
  durationFrames?: number;
  frame?: number;
  primaryColor?: string;
  outlineColor?: string;
  glow?: boolean;
  className?: string;
}

/** @deprecated legacy look — not for v2 */
export const DeconstructiveWordAssembly: FC<DeconstructiveWordAssemblyProps> = ({
  fragments,
  startFrame = 0,
  durationFrames = 30,
  frame: frameProp,
  primaryColor = DECONSTRUCTIVE_MINT_PALETTE.mintSolid,
  outlineColor = DECONSTRUCTIVE_MINT_PALETTE.ghostOutline,
  glow = true,
  className = '',
}) => {
  const currentFrame = useCurrentFrame();
  const f = frameProp ?? currentFrame;

  return (
    <div className={`relative w-[600px] h-[240px] flex items-center justify-center ${className}`}>
      {fragments.map((frag) => {
        // Katmanlı zamanlama ilerlemesi
        const p = computeLayeredTimingProgress(f, startFrame, durationFrames, frag.timingOrder);
        // İkincil kontur gecikmeli ilerlemesi (2 kare sonra)
        const lp = computeLayeredTimingProgress(f, startFrame + 2, durationFrames, frag.timingOrder);
        const state = evaluateFragmentState(frag, p, lp);

        return (
          <div key={frag.id} className="absolute inset-0 pointer-events-none">
            {/* İkincil Hayalet Kontur (Ghost Outline) */}
            <div
              className="absolute border-2 rounded-sm"
              style={{
                width: `${frag.targetWidth}px`,
                height: `${frag.targetHeight}px`,
                transform: `translate(${state.outlineX}px, ${state.outlineY}px) rotate(${state.rotation}deg) scale(${state.scale})`,
                borderColor: outlineColor,
                opacity: state.outlineOpacity,
                boxShadow: glow ? `0 0 12px ${DECONSTRUCTIVE_MINT_PALETTE.ghostDark}` : 'none',
              }}
            />

            {/* Ön Plan Asal Parça (Primary Mint Graphic Component) */}
            <div
              className="absolute rounded-sm"
              style={{
                width: `${frag.targetWidth}px`,
                height: `${frag.targetHeight}px`,
                transform: `translate(${state.x}px, ${state.y}px) rotate(${state.rotation}deg) scale(${state.scale})`,
                backgroundColor: primaryColor,
                opacity: state.opacity,
                boxShadow: glow
                  ? `0 0 20px ${DECONSTRUCTIVE_MINT_PALETTE.mintGlow}, inset 0 1px 1px rgba(255,255,255,0.7)`
                  : 'none',
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
