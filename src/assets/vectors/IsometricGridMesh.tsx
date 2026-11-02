import React from 'react';

export interface IsometricGridMeshProps {
  width?: number;
  height?: number;
  gridSize?: number;
  className?: string;
  strokeColor?: string;
  strokeOpacity?: number;
  fadeEdges?: boolean;
}

export const IsometricGridMesh: React.FC<IsometricGridMeshProps> = ({
  width = 1200,
  height = 800,
  gridSize = 60,
  className = '',
  strokeColor = '#ffffff',
  strokeOpacity = 0.08,
  fadeEdges = true,
}) => {
  return (
    <div
      className={`relative overflow-hidden pointer-events-none ${className}`}
      style={{ width, height }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        className="w-full h-full"
      >
        <defs>
          <pattern
            id="isometric-grid-pattern"
            width={gridSize * 2}
            height={gridSize * 1.1547}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${gridSize} 0 L ${gridSize * 2} ${gridSize * 0.577} L ${gridSize} ${
                gridSize * 1.1547
              } L 0 ${gridSize * 0.577} Z`}
              fill="none"
              stroke={strokeColor}
              strokeOpacity={strokeOpacity}
              strokeWidth="1"
            />
          </pattern>
          {fadeEdges && (
            <radialGradient id="gridVignette" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff" stopOpacity="1" />
              <stop offset="70%" stopColor="#fff" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
          )}
          {fadeEdges && (
            <mask id="gridVignetteMask">
              <rect width={width} height={height} fill="url(#gridVignette)" />
            </mask>
          )}
        </defs>

        <rect
          width={width}
          height={height}
          fill="url(#isometric-grid-pattern)"
          mask={fadeEdges ? 'url(#gridVignetteMask)' : undefined}
        />
      </svg>
    </div>
  );
};
