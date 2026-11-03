import { type FC, type ReactNode } from 'react';
import { useCurrentFrame } from 'remotion';
import {
  computeDiagonalSweepPath,
  computeDiscCascadePositions,
  computeBeveledRingTransform,
} from '../core/sculptural-reel-math';

/**
 * SCULPTURAL REEL PALETTE
 * Kaynak: references/SCULPTURAL_REEL_GUIDE.md
 */
export const SCULPTURAL_REEL_PALETTE = {
  bg: '#060709',
  bgRadial: 'radial-gradient(circle at 50% 50%, rgba(74, 21, 75, 0.35) 0%, rgba(6, 7, 9, 0.95) 75%, #060709 100%)',
  goldChampagne: '#f5d77f',
  goldDeep: '#bfa14b',
  magenta: '#e01e5a',
  violet: '#4a154b',
  coral: '#ff6f59',
  cream: '#fff5ea',
  silverHairline: 'rgba(255, 255, 255, 0.45)',
  panelDark: 'rgba(18, 12, 19, 0.85)',
} as const;

// -----------------------------------------------------------------------------
// 1. CHAMPAGNE BEVELED RING (Pahlı Şampanya Altını Metalik Halka)
// -----------------------------------------------------------------------------

export interface ChampagneBeveledRingProps {
  size?: number;
  frame?: number;
  thickness?: number;
  rimColor?: string;
  glow?: boolean;
  className?: string;
}

export const ChampagneBeveledRing: FC<ChampagneBeveledRingProps> = ({
  size = 380,
  frame: frameProp,
  thickness = 46,
  rimColor = SCULPTURAL_REEL_PALETTE.goldChampagne,
  glow = true,
  className = '',
}) => {
  const currentFrame = useCurrentFrame();
  const f = frameProp ?? currentFrame;
  const { transform, lightReflectionAngle } = computeBeveledRingTransform(f);

  const radius = (size - thickness) / 2;
  const center = size / 2;

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{
        width: size,
        height: size,
        transform,
        transformStyle: 'preserve-3d',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="goldBevelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor={rimColor} />
            <stop offset="50%" stopColor={SCULPTURAL_REEL_PALETTE.goldDeep} />
            <stop offset="75%" stopColor="#4a154b" />
            <stop offset="100%" stopColor={rimColor} />
          </linearGradient>

          <linearGradient id="glintGrad" gradientTransform={`rotate(${lightReflectionAngle} 0.5 0.5)`}>
            <stop offset="0%" stopColor="transparent" />
            <stop offset="48%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.85)" />
            <stop offset="52%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* Dış Gövde */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#goldBevelGrad)"
          strokeWidth={thickness}
          style={{
            filter: glow ? `drop-shadow(0 20px 40px rgba(0,0,0,0.8)) drop-shadow(0 0 16px rgba(245,215,127,0.35))` : 'none',
          }}
        />

        {/* Speküler Işıma Yansıması (Rotating Glint) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#glintGrad)"
          strokeWidth={thickness}
          style={{ mixBlendMode: 'screen' }}
        />

        {/* 1px Kılcal Gümüş Çerçeve Çizgisi */}
        <circle
          cx={center}
          cy={center}
          r={radius + thickness / 2}
          fill="none"
          stroke={SCULPTURAL_REEL_PALETTE.silverHairline}
          strokeWidth={1}
        />
        <circle
          cx={center}
          cy={center}
          r={radius - thickness / 2}
          fill="none"
          stroke={SCULPTURAL_REEL_PALETTE.silverHairline}
          strokeWidth={1}
        />
      </svg>
    </div>
  );
};

// -----------------------------------------------------------------------------
// 2. DIAGONAL GRADIENT SWEEP (Çapraz Renk Geçiş Bantları)
// -----------------------------------------------------------------------------

export interface DiagonalGradientSweepProps {
  progress: number; // 0..1
  bandColors?: string[];
  width?: number;
  height?: number;
  className?: string;
}

export const DiagonalGradientSweep: FC<DiagonalGradientSweepProps> = ({
  progress,
  bandColors = [
    SCULPTURAL_REEL_PALETTE.magenta,
    SCULPTURAL_REEL_PALETTE.violet,
    SCULPTURAL_REEL_PALETTE.coral,
    SCULPTURAL_REEL_PALETTE.goldChampagne,
  ],
  width = 1920,
  height = 1080,
  className = '',
}) => {
  if (progress <= 0 || progress >= 1) return null;

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
      >
        {bandColors.map((color, i) => {
          const { pathD, fillOpacity } = computeDiagonalSweepPath(progress, i, bandColors.length, width, height);

          return (
            <path
              key={i}
              d={pathD}
              fill={color}
              fillOpacity={fillOpacity}
              style={{
                mixBlendMode: 'screen',
                filter: 'blur(20px)',
              }}
            />
          );
        })}
      </svg>
    </div>
  );
};

// -----------------------------------------------------------------------------
// 3. PERSPECTIVE DISC CASCADE (Basamaklanan 3D Disk Kümesi)
// -----------------------------------------------------------------------------

export interface PerspectiveDiscCascadeProps {
  progress: number; // 0..1
  count?: number;
  size?: number;
  className?: string;
}

export const PerspectiveDiscCascade: FC<PerspectiveDiscCascadeProps> = ({
  progress,
  count = 5,
  size = 220,
  className = '',
}) => {
  const discs = computeDiscCascadePositions(count, progress);

  return (
    <div
      className={`relative flex items-center justify-center [perspective:1000px] select-none ${className}`}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {discs.map((disc) => (
        <div
          key={disc.index}
          className="absolute rounded-full border border-white/20 shadow-2xl"
          style={{
            width: size,
            height: size,
            transform: `translate3d(${disc.x}px, ${disc.y}px, ${disc.z}px) rotateZ(${disc.rotation}deg) scale(${disc.scale})`,
            opacity: disc.opacity,
            background: `radial-gradient(circle at 35% 35%, ${SCULPTURAL_REEL_PALETTE.cream} 0%, ${SCULPTURAL_REEL_PALETTE.coral} 40%, ${SCULPTURAL_REEL_PALETTE.magenta} 70%, ${SCULPTURAL_REEL_PALETTE.violet} 100%)`,
            boxShadow: `0 16px 32px rgba(0,0,0,0.7), inset 0 2px 4px rgba(255,255,255,0.6)`,
          }}
        >
          {/* İç 1px Kılcal Halka */}
          <div className="absolute inset-4 rounded-full border border-white/30 pointer-events-none" />
        </div>
      ))}
    </div>
  );
};

// -----------------------------------------------------------------------------
// 4. PALETTE GRID RESET (Renk Paleti / Izgara Sıfırlaması)
// -----------------------------------------------------------------------------

export interface PaletteGridResetProps {
  swatches?: string[];
  label?: string;
  className?: string;
}

export const PaletteGridReset: FC<PaletteGridResetProps> = ({
  swatches = [
    SCULPTURAL_REEL_PALETTE.goldChampagne,
    SCULPTURAL_REEL_PALETTE.coral,
    SCULPTURAL_REEL_PALETTE.magenta,
    SCULPTURAL_REEL_PALETTE.violet,
    SCULPTURAL_REEL_PALETTE.cream,
    '#ffffff',
  ],
  label = 'COLOR SYSTEM // 08',
  className = '',
}) => {
  return (
    <div
      className={`p-6 rounded-2xl border backdrop-blur-xl flex flex-col items-center select-none ${className}`}
      style={{
        backgroundColor: SCULPTURAL_REEL_PALETTE.panelDark,
        borderColor: SCULPTURAL_REEL_PALETTE.silverHairline,
        boxShadow: '0 20px 48px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.1)',
      }}
    >
      <div className="grid grid-cols-3 gap-3 mb-4">
        {swatches.map((swatch, i) => (
          <div
            key={i}
            className="w-16 h-16 rounded-xl border border-white/10 shadow-md"
            style={{
              backgroundColor: swatch,
            }}
          />
        ))}
      </div>

      <span className="text-base text-zinc-300 font-mono tracking-widest uppercase">
        {label}
      </span>
    </div>
  );
};

// -----------------------------------------------------------------------------
// 5. SCULPTURAL REEL STAGE (Tam Sahne Kapsayıcı)
// -----------------------------------------------------------------------------

export interface SculpturalReelStageProps {
  children?: ReactNode;
  aspect?: '16:9' | '9:16';
  className?: string;
}

export const SculpturalReelStage: FC<SculpturalReelStageProps> = ({
  children,
  aspect = '16:9',
  className = '',
}) => {
  const isVertical = aspect === '9:16';

  return (
    <div
      className={`w-full h-full relative overflow-hidden flex flex-col items-center justify-center select-none ${isVertical ? 'px-8' : 'px-20'} ${className}`}
      style={{
        backgroundColor: SCULPTURAL_REEL_PALETTE.bg,
        backgroundImage: SCULPTURAL_REEL_PALETTE.bgRadial,
      }}
    >
      {/* Sıcak merkezi radyal aydınlatma */}
      <div
        className="absolute w-[800px] h-[800px] rounded-full pointer-events-none blur-[180px]"
        style={{
          background: 'radial-gradient(circle, rgba(224, 30, 90, 0.16) 0%, rgba(245, 215, 127, 0.1) 45%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Sahne Çocuğu */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};
