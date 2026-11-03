import type { FC } from 'react';

export interface HairlineGridProps {
  id?: string;
  className?: string;
  spacing?: number;
  opacity?: number;
  showCrosses?: boolean;
}

export const HairlineGrid: FC<HairlineGridProps> = ({
  id,
  className = '',
  spacing = 40,
  opacity = 0.08,
  showCrosses = true,
}) => {
  return (
    <div
      id={id}
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
      style={{ opacity }}
    >
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="subgrid-pattern"
            width={spacing}
            height={spacing}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${spacing} 0 L 0 0 0 ${spacing}`}
              fill="none"
              stroke="white"
              strokeWidth="1"
            />
            {showCrosses && (
              <path
                d="M -3 0 L 3 0 M 0 -3 L 0 3"
                stroke="white"
                strokeWidth="1.5"
                transform={`translate(${spacing}, ${spacing})`}
              />
            )}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#subgrid-pattern)" />
      </svg>
    </div>
  );
};
