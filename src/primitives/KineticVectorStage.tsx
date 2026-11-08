import React from 'react';
import { interpolate } from 'remotion';

export interface KineticVectorStageProps {
  width?: number;
  height?: number;
  className?: string;
  children?: React.ReactNode;
}

export interface SwissCrosshairProps {
  x: number;
  y: number;
  size?: number;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
}

/**
 * İsviçre Kılcal Artı İşareti (+)
 */
/** @deprecated legacy look — not for v2 */
export const SwissCrosshair: React.FC<SwissCrosshairProps> = ({
  x,
  y,
  size = 14,
  stroke = 'rgba(0, 0, 0, 0.25)',
  strokeWidth = 1,
  opacity = 1,
}) => {
  const half = size / 2;
  return (
    <g opacity={opacity}>
      <line x1={x - half} y1={y} x2={x + half} y2={y} stroke={stroke} strokeWidth={strokeWidth} />
      <line x1={x} y1={y - half} x2={x} y2={y + half} stroke={stroke} strokeWidth={strokeWidth} />
    </g>
  );
};

export interface DynamicSwissGridProps {
  width?: number;
  height?: number;
  cols?: number;
  rows?: number;
  progress?: number;
  strokeColor?: string;
  showCrosshairs?: boolean;
}

/**
 * Yaşayan Parametrik İsviçre Kılcal Izgarası
 */
/** @deprecated legacy look — not for v2 */
export const DynamicSwissGrid: React.FC<DynamicSwissGridProps> = ({
  width = 1920,
  height = 1080,
  cols = 12,
  rows = 8,
  progress = 1,
  strokeColor = 'rgba(0, 0, 0, 0.08)',
  showCrosshairs = true,
}) => {
  const colWidth = width / cols;
  const rowHeight = height / rows;

  const verticalLines = [];
  for (let i = 1; i < cols; i++) {
    const x = i * colWidth;
    const currentH = height * progress;
    verticalLines.push(
      <line
        key={`v-${i}`}
        x1={x}
        y1={(height - currentH) / 2}
        x2={x}
        y2={(height + currentH) / 2}
        stroke={strokeColor}
        strokeWidth={1}
      />
    );
  }

  const horizontalLines = [];
  for (let j = 1; j < rows; j++) {
    const y = j * rowHeight;
    const currentW = width * progress;
    horizontalLines.push(
      <line
        key={`h-${j}`}
        x1={(width - currentW) / 2}
        y1={y}
        x2={(width + currentW) / 2}
        y2={y}
        stroke={strokeColor}
        strokeWidth={1}
      />
    );
  }

  const crosshairs = [];
  if (showCrosshairs && progress > 0.4) {
    const crossOpacity = interpolate(progress, [0.4, 1], [0, 0.5], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    for (let i = 1; i < cols; i += 2) {
      for (let j = 1; j < rows; j += 2) {
        crosshairs.push(
          <SwissCrosshair
            key={`c-${i}-${j}`}
            x={i * colWidth}
            y={j * rowHeight}
            size={12}
            stroke={strokeColor}
            opacity={crossOpacity}
          />
        );
      }
    }
  }

  return (
    <g className="swiss-grid-matrix">
      {verticalLines}
      {horizontalLines}
      {crosshairs}
    </g>
  );
};

export interface GeometricBurstProps {
  cx: number;
  cy: number;
  progress: number;
  rayCount?: number;
  radiusStart?: number;
  radiusEnd?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * 2D Vektörel Radyal Işın / Geometrik Patlama Primitifi
 */
/** @deprecated legacy look — not for v2 */
export const GeometricBurst: React.FC<GeometricBurstProps> = ({
  cx,
  cy,
  progress,
  rayCount = 12,
  radiusStart = 60,
  radiusEnd = 240,
  color = '#EB2D2D',
  strokeWidth = 2,
}) => {
  if (progress <= 0 || progress >= 1) return null;

  const currentR1 = interpolate(progress, [0, 1], [radiusStart, radiusEnd * 0.7]);
  const currentR2 = interpolate(progress, [0, 1], [radiusStart * 1.5, radiusEnd]);
  const opacity = interpolate(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const rays = [];
  for (let i = 0; i < rayCount; i++) {
    const angle = (i * 2 * Math.PI) / rayCount;
    const x1 = cx + Math.cos(angle) * currentR1;
    const y1 = cy + Math.sin(angle) * currentR1;
    const x2 = cx + Math.cos(angle) * currentR2;
    const y2 = cy + Math.sin(angle) * currentR2;

    rays.push(
      <line
        key={`ray-${i}`}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    );
  }

  return <g opacity={opacity}>{rays}</g>;
};

export interface SwissVectorCrossProps {
  cx: number;
  cy: number;
  size: number;
  color?: string;
  innerColor?: string;
  scale?: number;
  opacity?: number;
}

/**
 * İsviçre Haçı Vektör Mührü
 */
/** @deprecated legacy look — not for v2 */
export const SwissVectorCross: React.FC<SwissVectorCrossProps> = ({
  cx,
  cy,
  size,
  color = '#EB2D2D',
  innerColor = '#FFFFFF',
  scale = 1,
  opacity = 1,
}) => {
  const armWidth = size * 0.28;
  const armLength = size * 0.76;

  return (
    <g
      transform={`translate(${cx}, ${cy}) scale(${scale})`}
      opacity={opacity}
      style={{ transformOrigin: '0 0' }}
    >
      {/* Kırmızı Kare Zemin Rozeti */}
      <rect
        x={-size / 2}
        y={-size / 2}
        width={size}
        height={size}
        fill={color}
        rx={size * 0.12}
      />

      {/* Beyaz Dikey Kol */}
      <rect
        x={-armWidth / 2}
        y={-armLength / 2}
        width={armWidth}
        height={armLength}
        fill={innerColor}
      />

      {/* Beyaz Yatay Kol */}
      <rect
        x={-armLength / 2}
        y={-armWidth / 2}
        width={armLength}
        height={armWidth}
        fill={innerColor}
      />
    </g>
  );
};

/**
 * KineticVectorStage — Saf 2D Vektör Hareket Sahnesi
 * Arayüz kutuları içermez; tüm sahneyi tek bir yaşayan SVG tuvalinde kurgular.
 */
/** @deprecated legacy look — not for v2 */
export const KineticVectorStage: React.FC<KineticVectorStageProps> = ({
  width = 1920,
  height = 1080,
  className = '',
  children,
}) => {
  return (
    <div
      className={`relative w-[${width}px] h-[${height}px] overflow-hidden select-none ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        {children}
      </svg>
    </div>
  );
};
