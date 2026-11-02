import React from 'react';
import { SpotlightBleed } from './SpotlightBleed';
import { GradientBorderMask } from './GradientBorderMask';

export type SpecularPreset = 'frostedDark' | 'glass' | 'titanium' | 'subtleWhite' | 'obsidian';

export interface SpecularSurfaceProps {
  children?: React.ReactNode;
  preset?: SpecularPreset;
  className?: string;
  style?: React.CSSProperties;
  borderRadius?: number;
  /**
   * Kartın 3D eğim açısı (derece). Işık yansımasını fiziksel olarak ters yönde kaydırır.
   */
  tiltX?: number;
  tiltY?: number;
  /**
   * Özel spotlight ofsetleri (0-100%)
   */
  spotlightX?: number;
  spotlightY?: number;
  /**
   * Tepe specular catchlight çizgisini göster/gizle
   */
  showCatchlight?: boolean;
  /**
   * Açısal gradyan sınır maskesini göster/gizle
   */
  showGradientBorder?: boolean;
}

const PRESET_STYLES: Record<
  SpecularPreset,
  {
    background: string;
    backdropFilter?: string;
    boxShadow: string;
    borderFrom: string;
    borderVia: string;
    borderTo: string;
    spotlightColor: string;
    catchlightColor: string;
  }
> = {
  frostedDark: {
    background: 'linear-gradient(165deg, rgba(30, 41, 59, 0.72) 0%, rgba(15, 23, 42, 0.88) 100%)',
    backdropFilter: 'blur(20px) saturate(180%)',
    boxShadow:
      '0 2px 4px rgba(0, 0, 0, 0.2), 0 12px 28px rgba(0, 0, 0, 0.35), 0 32px 64px -12px rgba(0, 0, 0, 0.5)',
    borderFrom: 'rgba(255, 255, 255, 0.28)',
    borderVia: 'rgba(255, 255, 255, 0.06)',
    borderTo: 'rgba(255, 255, 255, 0.12)',
    spotlightColor: 'rgba(255, 255, 255, 0.14)',
    catchlightColor: 'rgba(255, 255, 255, 0.22)',
  },
  glass: {
    background: 'linear-gradient(165deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 100%)',
    backdropFilter: 'blur(24px) saturate(200%)',
    boxShadow:
      '0 4px 12px rgba(0, 0, 0, 0.15), 0 16px 36px rgba(0, 0, 0, 0.25), 0 40px 80px -16px rgba(0, 0, 0, 0.35)',
    borderFrom: 'rgba(255, 255, 255, 0.45)',
    borderVia: 'rgba(255, 255, 255, 0.1)',
    borderTo: 'rgba(255, 255, 255, 0.2)',
    spotlightColor: 'rgba(255, 255, 255, 0.25)',
    catchlightColor: 'rgba(255, 255, 255, 0.35)',
  },
  titanium: {
    background: 'linear-gradient(165deg, rgba(39, 39, 42, 0.92) 0%, rgba(24, 24, 27, 0.98) 100%)',
    backdropFilter: 'blur(16px)',
    boxShadow:
      '0 2px 4px rgba(0, 0, 0, 0.3), 0 10px 24px rgba(0, 0, 0, 0.45), 0 30px 60px -10px rgba(0, 0, 0, 0.65)',
    borderFrom: 'rgba(228, 228, 231, 0.35)',
    borderVia: 'rgba(113, 113, 122, 0.15)',
    borderTo: 'rgba(161, 161, 170, 0.2)',
    spotlightColor: 'rgba(244, 244, 245, 0.15)',
    catchlightColor: 'rgba(255, 255, 255, 0.28)',
  },
  subtleWhite: {
    background: 'linear-gradient(165deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 0.92) 100%)',
    backdropFilter: 'blur(16px)',
    boxShadow:
      '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.06), 0 25px 50px -12px rgba(0, 0, 0, 0.12)',
    borderFrom: 'rgba(255, 255, 255, 1)',
    borderVia: 'rgba(226, 232, 240, 0.6)',
    borderTo: 'rgba(203, 213, 225, 0.4)',
    spotlightColor: 'rgba(255, 255, 255, 0.6)',
    catchlightColor: 'rgba(255, 255, 255, 0.8)',
  },
  obsidian: {
    background: 'linear-gradient(165deg, rgba(17, 24, 39, 0.95) 0%, rgba(3, 7, 18, 0.98) 100%)',
    backdropFilter: 'blur(20px)',
    boxShadow:
      '0 4px 8px rgba(0, 0, 0, 0.4), 0 16px 32px rgba(0, 0, 0, 0.6), 0 48px 96px -16px rgba(0, 0, 0, 0.85)',
    borderFrom: 'rgba(96, 165, 250, 0.28)',
    borderVia: 'rgba(255, 255, 255, 0.04)',
    borderTo: 'rgba(147, 197, 253, 0.12)',
    spotlightColor: 'rgba(147, 197, 253, 0.12)',
    catchlightColor: 'rgba(255, 255, 255, 0.18)',
  },
};

export const SpecularSurface: React.FC<SpecularSurfaceProps> = ({
  children,
  preset = 'frostedDark',
  className = '',
  style = {},
  borderRadius = 20,
  tiltX = 0,
  tiltY = 0,
  spotlightX,
  spotlightY,
  showCatchlight = true,
  showGradientBorder = true,
}) => {
  const cfg = PRESET_STYLES[preset];

  // Fiziksel eğim hesaplaması: Kart sağa yatınca (tiltY pozitif), ışık yansıması sola kayar.
  const calcSpotX = spotlightX !== undefined ? spotlightX : 50 - tiltY * 1.5;
  const calcSpotY = spotlightY !== undefined ? spotlightY : 15 - tiltX * 1.5;

  const combinedShadow = showCatchlight
    ? `inset 0 1px 0 0 ${cfg.catchlightColor}, ${cfg.boxShadow}`
    : cfg.boxShadow;

  return (
    <div
      className={`relative overflow-hidden isolate ${className}`}
      style={{
        borderRadius: `${borderRadius}px`,
        background: cfg.background,
        backdropFilter: cfg.backdropFilter,
        WebkitBackdropFilter: cfg.backdropFilter,
        boxShadow: combinedShadow,
        transform:
          tiltX !== 0 || tiltY !== 0
            ? `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`
            : undefined,
        transformStyle: 'preserve-3d',
        ...style,
      }}
    >
      {/* Katman 3: Açısal Gradyan Kenar Kırılması */}
      {showGradientBorder && (
        <GradientBorderMask
          borderRadius={borderRadius}
          fromColor={cfg.borderFrom}
          viaColor={cfg.borderVia}
          toColor={cfg.borderTo}
        />
      )}

      {/* Katman 4: Kart Eğimine Bağlı Dinamik Işık Yansıması */}
      <SpotlightBleed
        spotlightX={calcSpotX}
        spotlightY={calcSpotY}
        color={cfg.spotlightColor}
        radius={500}
      />

      {/* İçerik Katmanı */}
      <div className="relative z-20 w-full h-full">{children}</div>
    </div>
  );
};
