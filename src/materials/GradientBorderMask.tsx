import React from 'react';

export interface GradientBorderMaskProps {
  borderRadius?: number | string;
  borderWidth?: number;
  gradientAngle?: number;
  fromColor?: string;
  viaColor?: string;
  toColor?: string;
  className?: string;
}

export const GradientBorderMask: React.FC<GradientBorderMaskProps> = ({
  borderRadius = 16,
  borderWidth = 1,
  gradientAngle = 135,
  fromColor = 'rgba(255, 255, 255, 0.28)',
  viaColor = 'rgba(255, 255, 255, 0.05)',
  toColor = 'rgba(255, 255, 255, 0.12)',
  className = '',
}) => {
  const radiusValue = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius;

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-10 ${className}`}
      style={{
        borderRadius: radiusValue,
        padding: `${borderWidth}px`,
        background: `linear-gradient(${gradientAngle}deg, ${fromColor}, ${viaColor} 45%, ${toColor})`,
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
      }}
    />
  );
};
