import React from 'react';

export interface RadialRadarRingsProps {
  size?: number;
  rings?: number;
  sweepAngle?: number;
  className?: string;
  color?: string;
  showCrosshairs?: boolean;
}

export const RadialRadarRings: React.FC<RadialRadarRingsProps> = ({
  size = 200,
  rings = 4,
  sweepAngle = 0,
  className = '',
  color = '#38bdf8',
  showCrosshairs = true,
}) => {
  const center = size / 2;
  const maxR = size / 2 - 8;
  const stepR = maxR / rings;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <defs>
          <linearGradient id="radarSweepGrad" gradientTransform={`rotate(${sweepAngle} ${center} ${center})`}>
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="60%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Eşmerkezli Halkalar */}
        {Array.from({ length: rings }).map((_, i) => {
          const r = (i + 1) * stepR;
          return (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke={color}
              strokeOpacity={0.15 + (i / rings) * 0.15}
              strokeWidth="1.2"
              strokeDasharray={i % 2 === 1 ? '4 4' : undefined}
            />
          );
        })}

        {/* Çapraz Kılavuz Çizgileri */}
        {showCrosshairs && (
          <g stroke={color} strokeOpacity="0.2" strokeWidth="1">
            <line x1={center} y1="0" x2={center} y2={size} />
            <line x1="0" y1={center} x2={size} y2={center} />
            <line x1={center - 8} y1={center} x2={center + 8} y2={center} strokeOpacity="0.8" />
            <line x1={center} y1={center - 8} x2={center} y2={center + 8} strokeOpacity="0.8" />
          </g>
        )}

        {/* Dönen Radar Süpürme Konisi */}
        <path
          d={`M ${center} ${center} L ${center + maxR * Math.cos((sweepAngle * Math.PI) / 180)} ${
            center + maxR * Math.sin((sweepAngle * Math.PI) / 180)
          } A ${maxR} ${maxR} 0 0 0 ${
            center + maxR * Math.cos(((sweepAngle - 45) * Math.PI) / 180)
          } ${center + maxR * Math.sin(((sweepAngle - 45) * Math.PI) / 180)} Z`}
          fill="url(#radarSweepGrad)"
        />
      </svg>
    </div>
  );
};
