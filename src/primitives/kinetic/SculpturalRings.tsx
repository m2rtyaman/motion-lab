import type { FC } from 'react';

export interface SculpturalRingsProps {
  id?: string;
  className?: string;
  size?: number;
  rotation?: number;
  ringCount?: number;
}

export const SculpturalRings: FC<SculpturalRingsProps> = ({
  id,
  className = '',
  size = 400,
  rotation = 0,
  ringCount = 3,
}) => {
  return (
    <div
      id={id}
      className={`sculptural-rings relative pointer-events-none select-none flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="sculptural-gold-facet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#e2d9c8" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {Array.from({ length: ringCount }).map((_, i) => {
          const r = (size / 2) - 16 - i * 36;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="url(#sculptural-gold-facet)"
              strokeWidth={2 + i}
              strokeDasharray={i % 2 === 1 ? '12 8' : 'none'}
              className="sculptural-ring-circle opacity-75"
            />
          );
        })}
      </svg>
    </div>
  );
};
