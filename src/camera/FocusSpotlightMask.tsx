import React from 'react';

export interface FocusSpotlightMaskProps {
  /**
   * Odak merkez X konumu (% cinsinden, ör: 50)
   */
  focusX?: number;
  /**
   * Odak merkez Y konumu (% cinsinden, ör: 50)
   */
  focusY?: number;
  /**
   * Odak yarıçapı (px)
   */
  focusRadius?: number;
  /**
   * Vignette karartma opaklığı (0 - 1)
   */
  vignetteOpacity?: number;
  /**
   * Bulanıklık (px)
   */
  blurPx?: number;
  className?: string;
}

export const FocusSpotlightMask: React.FC<FocusSpotlightMaskProps> = ({
  focusX = 50,
  focusY = 50,
  focusRadius = 380,
  vignetteOpacity = 0.45,
  blurPx = 0,
  className = '',
}) => {
  if (vignetteOpacity <= 0 && blurPx <= 0) return null;

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-30 transition-all duration-300 ${className}`}
      style={{
        background: `radial-gradient(${focusRadius}px circle at ${focusX}% ${focusY}%, transparent 60%, rgba(3, 7, 18, ${vignetteOpacity}) 100%)`,
        backdropFilter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
        WebkitBackdropFilter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
      }}
    />
  );
};
