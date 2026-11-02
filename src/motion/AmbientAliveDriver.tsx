import React from 'react';
import { useCurrentFrame } from 'remotion';

export interface AmbientAliveDriverProps {
  children: React.ReactNode;
  /**
   * Nefes alma genliği (px)
   */
  floatAmplitude?: number;
  /**
   * Nefes alma frekansı
   */
  frequency?: number;
  /**
   * Hafif 3D açısal salınım derecesi
   */
  tiltAmplitude?: number;
  /**
   * Mikro ölçek genliği (örn 0.006)
   */
  scaleAmplitude?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const AmbientAliveDriver: React.FC<AmbientAliveDriverProps> = ({
  children,
  floatAmplitude = 3,
  frequency = 0.045,
  tiltAmplitude = 0.8,
  scaleAmplitude = 0.005,
  className = '',
  style = {},
}) => {
  const frame = useCurrentFrame();

  const translateY = Math.sin(frame * frequency) * floatAmplitude;
  const rotateY = Math.cos(frame * frequency * 0.8) * tiltAmplitude;
  const rotateX = -Math.sin(frame * frequency * 0.6) * (tiltAmplitude * 0.6);
  const scale = 1 + Math.sin(frame * frequency * 1.2) * scaleAmplitude;

  return (
    <div
      className={className}
      style={{
        transform: `perspective(1000px) translate3d(0, ${translateY.toFixed(2)}px, 0) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(${scale.toFixed(4)})`,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
