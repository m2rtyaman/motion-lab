import React from 'react';

export interface SpotlightBleedProps {
  /**
   * Işığın merkez X ofseti (% cinsinden, ör: 30)
   */
  spotlightX?: number;
  /**
   * Işığın merkez Y ofseti (% cinsinden, ör: 20)
   */
  spotlightY?: number;
  /**
   * Işığın rengi ve opaklığı (varsayılan beyaz ışık)
   */
  color?: string;
  /**
   * Yarıçap px cinsinden
   */
  radius?: number;
  /**
   * Işık opaklığı (0 - 1)
   */
  opacity?: number;
  className?: string;
}

export const SpotlightBleed: React.FC<SpotlightBleedProps> = ({
  spotlightX = 50,
  spotlightY = 0,
  color = 'rgba(255, 255, 255, 0.12)',
  radius = 400,
  opacity = 1,
  className = '',
}) => {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] transition-opacity duration-300 ${className}`}
      style={{
        opacity,
        background: `radial-gradient(${radius}px circle at ${spotlightX}% ${spotlightY}%, ${color}, transparent 80%)`,
      }}
    />
  );
};
