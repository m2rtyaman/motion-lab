import React from 'react';

/**
 * Editorial Specimen Color Tokens
 * Classic archival print & forensic specimen palette.
 */
export const EDITORIAL_PALETTE = {
  warmIvory: '#F5F2EB',
  scarlet: '#E6392E',
  inkBlack: '#111111',
  paperWhite: '#FCFBF9',
  iceBlue: '#E8EEF5',
  leadGray: '#6E7175',
  faintBorder: 'rgba(17, 17, 17, 0.12)',
  faintGrid: 'rgba(17, 17, 17, 0.06)',
} as const;

export type EditorialSpecimenPalette = typeof EDITORIAL_PALETTE;

// ==========================================
// 1. REGISTRATION GRID
// ==========================================

export interface RegistrationGridProps {
  width?: number;
  height?: number;
  gridSize?: number;
  strokeColor?: string;
  accentColor?: string;
  showCenterCrosshair?: boolean;
  showCircularGuide?: boolean;
  circleRadius?: number;
  showNodes?: boolean;
  opacity?: number;
  progress?: number;
  className?: string;
}

/**
 * Technical Registration Grid
 * Fine architectural hairline grid with center crosshair, circular guide, and coordinate nodes.
 */
/** @deprecated legacy look — not for v2 */
export const RegistrationGrid: React.FC<RegistrationGridProps> = ({
  width = 1920,
  height = 1080,
  gridSize = 80,
  strokeColor = EDITORIAL_PALETTE.faintGrid,
  accentColor = EDITORIAL_PALETTE.scarlet,
  showCenterCrosshair = true,
  showCircularGuide = true,
  circleRadius = 260,
  showNodes = true,
  opacity = 1,
  progress = 1,
  className = '',
}) => {
  const centerX = width / 2;
  const centerY = height / 2;

  // Symmetrically radiate grid lines outward from center
  const maxStepsX = Math.ceil(centerX / gridSize);
  const maxStepsY = Math.ceil(centerY / gridSize);

  // Generate vertical grid lines
  const vLines: React.ReactNode[] = [];
  for (let step = -maxStepsX; step <= maxStepsX; step++) {
    const x = centerX + step * gridSize;
    if (x < 0 || x > width) continue;
    const lineH = height * progress;
    const startY = (height - lineH) / 2;
    vLines.push(
      <line
        key={`v-${step}`}
        x1={x}
        y1={startY}
        x2={x}
        y2={startY + lineH}
        stroke={strokeColor}
        strokeWidth={1}
      />
    );
  }

  // Generate horizontal grid lines
  const hLines: React.ReactNode[] = [];
  for (let step = -maxStepsY; step <= maxStepsY; step++) {
    const y = centerY + step * gridSize;
    if (y < 0 || y > height) continue;
    const lineW = width * progress;
    const startX = (width - lineW) / 2;
    hLines.push(
      <line
        key={`h-${step}`}
        x1={startX}
        y1={y}
        x2={startX + lineW}
        y2={y}
        stroke={strokeColor}
        strokeWidth={1}
      />
    );
  }

  // Registration nodes at major intersections
  const nodes: React.ReactNode[] = [];
  if (showNodes && progress > 0.3) {
    const nodeCoords = [
      { x: centerX - gridSize * 4, y: centerY - gridSize * 2 },
      { x: centerX + gridSize * 4, y: centerY - gridSize * 2 },
      { x: centerX - gridSize * 4, y: centerY + gridSize * 2 },
      { x: centerX + gridSize * 4, y: centerY + gridSize * 2 },
      { x: centerX - gridSize * 6, y: centerY },
      { x: centerX + gridSize * 6, y: centerY },
    ];

    nodeCoords.forEach((coord, idx) => {
      const nodeSize = 6;
      nodes.push(
        <g key={`node-${idx}`} opacity={Math.min(1, (progress - 0.3) * 2)}>
          <circle cx={coord.x} cy={coord.y} r={nodeSize / 2} fill={accentColor} />
          <line
            x1={coord.x - nodeSize * 1.5}
            y1={coord.y}
            x2={coord.x + nodeSize * 1.5}
            y2={coord.y}
            stroke={accentColor}
            strokeWidth={1}
          />
          <line
            x1={coord.x}
            y1={coord.y - nodeSize * 1.5}
            x2={coord.x}
            y2={coord.y + nodeSize * 1.5}
            stroke={accentColor}
            strokeWidth={1}
          />
        </g>
      );
    });
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`pointer-events-none absolute inset-0 select-none ${className}`}
      style={{ opacity }}
    >
      <g>{vLines}</g>
      <g>{hLines}</g>

      {/* Circular Guide */}
      {showCircularGuide && (
        <g opacity={Math.min(1, progress * 1.2)}>
          <circle
            cx={centerX}
            cy={centerY}
            r={circleRadius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={1.2}
            strokeDasharray="6 6"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r={circleRadius * 1.35}
            fill="none"
            stroke={strokeColor}
            strokeWidth={1}
            strokeDasharray="2 10"
          />
        </g>
      )}

      {/* Center Crosshair */}
      {showCenterCrosshair && (
        <g opacity={progress}>
          <line
            x1={centerX - 36}
            y1={centerY}
            x2={centerX + 36}
            y2={centerY}
            stroke={accentColor}
            strokeWidth={1.5}
          />
          <line
            x1={centerX}
            y1={centerY - 36}
            x2={centerX}
            y2={centerY + 36}
            stroke={accentColor}
            strokeWidth={1.5}
          />
          <circle cx={centerX} cy={centerY} r={3} fill={accentColor} />
        </g>
      )}

      {/* Registration Nodes */}
      {nodes}
    </svg>
  );
};

// ==========================================
// 2. CORNER HANDLES
// ==========================================

export interface CornerHandlesProps {
  x?: number;
  y?: number;
  width: number;
  height: number;
  size?: number;
  color?: string;
  strokeWidth?: number;
  opacity?: number;
  offset?: number;
  progress?: number;
  showCrosshair?: boolean;
  className?: string;
}

/**
 * Sharp Corner Handles
 * Framing brackets for specimen focal bounds, crops, and analytical bounding boxes.
 */
/** @deprecated legacy look — not for v2 */
export const CornerHandles: React.FC<CornerHandlesProps> = ({
  x = 0,
  y = 0,
  width,
  height,
  size = 28,
  color = EDITORIAL_PALETTE.scarlet,
  strokeWidth = 2,
  opacity = 1,
  offset = 0,
  progress = 1,
  showCrosshair = false,
  className = '',
}) => {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const left = x - offset;
  const top = y - offset;
  const right = x + width + offset;
  const bottom = y + height + offset;
  const arm = Math.min(size, width / 2, height / 2) * clampedProgress;

  // 4 bracket paths
  const topLeftPath = `M ${left} ${top + arm} L ${left} ${top} L ${left + arm} ${top}`;
  const topRightPath = `M ${right - arm} ${top} L ${right} ${top} L ${right} ${top + arm}`;
  const bottomLeftPath = `M ${left} ${bottom - arm} L ${left} ${bottom} L ${left + arm} ${bottom}`;
  const bottomRightPath = `M ${right - arm} ${bottom} L ${right} ${bottom} L ${right} ${bottom - arm}`;

  const centerX = x + width / 2;
  const centerY = y + height / 2;

  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full overflow-visible ${className}`}
      style={{ opacity: opacity * Math.min(1, clampedProgress * 1.5) }}
    >
      <path
        d={topLeftPath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="square"
      />
      <path
        d={topRightPath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="square"
      />
      <path
        d={bottomLeftPath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="square"
      />
      <path
        d={bottomRightPath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="square"
      />

      {showCrosshair && (
        <g opacity={0.6}>
          <line
            x1={centerX - 10}
            y1={centerY}
            x2={centerX + 10}
            y2={centerY}
            stroke={color}
            strokeWidth={1}
          />
          <line
            x1={centerX}
            y1={centerY - 10}
            x2={centerX}
            y2={centerY + 10}
            stroke={color}
            strokeWidth={1}
          />
        </g>
      )}
    </svg>
  );
};

// ==========================================
// 3. ANNOTATION CALLOUT
// ==========================================

export interface AnnotationCalloutProps {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  label: string;
  sublabel?: string;
  coordinateStamp?: string;
  index?: string | number;
  color?: string;
  accentColor?: string;
  lineColor?: string;
  progress?: number;
  showDot?: boolean;
  strokeWidth?: number;
  className?: string;
}

/**
 * Specimen Annotation Callout
 * Dogleg leader line, coordinate stamp, and editorial micro-label.
 */
/** @deprecated legacy look — not for v2 */
export const AnnotationCallout: React.FC<AnnotationCalloutProps> = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  label,
  sublabel,
  coordinateStamp,
  index,
  color = EDITORIAL_PALETTE.inkBlack,
  accentColor = EDITORIAL_PALETTE.scarlet,
  lineColor = 'rgba(17, 17, 17, 0.35)',
  progress = 1,
  showDot = true,
  strokeWidth = 1.5,
  className = '',
}) => {
  // Dogleg intermediate point (horizontal elbow)
  const isRight = targetX >= sourceX;
  const elbowX = isRight
    ? sourceX + Math.abs(targetX - sourceX) * 0.45
    : sourceX - Math.abs(targetX - sourceX) * 0.45;
  const elbowY = targetY;

  // Path from source -> elbow -> target
  const pathD = `M ${sourceX} ${sourceY} L ${elbowX} ${elbowY} L ${targetX} ${targetY}`;

  // Exact path length for dasharray/offset determinism
  const seg1 = Math.hypot(elbowX - sourceX, elbowY - sourceY);
  const seg2 = Math.hypot(targetX - elbowX, targetY - elbowY);
  const totalLength = Math.max(1, Math.ceil(seg1 + seg2));

  const clampedProgress = Math.max(0, Math.min(1, progress));
  const textOpacity = Math.max(0, (clampedProgress - 0.4) / 0.6);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-visible ${className}`}>
      <svg className="absolute inset-0 h-full w-full overflow-visible">
        {/* Leader Line */}
        <path
          d={pathD}
          fill="none"
          stroke={lineColor}
          strokeWidth={strokeWidth}
          strokeDasharray={totalLength}
          strokeDashoffset={totalLength * (1 - clampedProgress)}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Source Specimen Dot */}
        {showDot && clampedProgress > 0.05 && (
          <g>
            <circle cx={sourceX} cy={sourceY} r={4} fill={accentColor} />
            <circle
              cx={sourceX}
              cy={sourceY}
              r={9}
              fill="none"
              stroke={accentColor}
              strokeWidth={1}
              opacity={0.4}
            />
          </g>
        )}

        {/* End Node */}
        {clampedProgress > 0.8 && (
          <circle cx={targetX} cy={targetY} r={2.5} fill={accentColor} />
        )}
      </svg>

      {/* Label Box (Broadcast Scale: min 18px text, 100% SSR/Remotion deterministic alignment) */}
      <div
        className="absolute"
        style={{
          left: isRight ? targetX + 12 : targetX - 12,
          transform: isRight ? undefined : 'translateX(-100%)',
          top: targetY - 14,
          opacity: textOpacity,
        }}
      >
        <div className={`flex flex-col gap-1 tracking-tight ${isRight ? 'items-start' : 'items-end text-right'}`}>
          <div className="flex items-center gap-2">
            {index !== undefined && (
              <span
                className="font-mono text-[18px] font-bold px-1.5 py-0.5 rounded"
                style={{ backgroundColor: accentColor, color: EDITORIAL_PALETTE.paperWhite }}
              >
                {index}
              </span>
            )}
            <span
              className="font-sans text-[18px] font-semibold uppercase tracking-wider"
              style={{ color }}
            >
              {label}
            </span>
          </div>

          {(sublabel || coordinateStamp) && (
            <div className={`flex items-center gap-3 text-[18px] font-mono text-neutral-600 ${isRight ? '' : 'justify-end'}`}>
              {sublabel && <span>{sublabel}</span>}
              {coordinateStamp && (
                <span className="opacity-75 font-mono text-[18px]">
                  {coordinateStamp}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. MEASUREMENT ARC
// ==========================================

export interface MeasurementArcProps {
  centerX: number;
  centerY: number;
  radius: number;
  startAngle?: number;
  endAngle?: number;
  color?: string;
  tickCount?: number;
  showTicks?: boolean;
  showCenterRadius?: boolean;
  notation?: string;
  strokeWidth?: number;
  progress?: number;
  className?: string;
}

/**
 * Radial Measurement Arc
 * Architectural angle measurement with radial tick marks, radius indicator, and degree notation.
 */
/** @deprecated legacy look — not for v2 */
export const MeasurementArc: React.FC<MeasurementArcProps> = ({
  centerX,
  centerY,
  radius,
  startAngle = 0,
  endAngle = 60,
  color = EDITORIAL_PALETTE.scarlet,
  tickCount = 5,
  showTicks = true,
  showCenterRadius = true,
  notation,
  strokeWidth = 1.5,
  progress = 1,
  className = '',
}) => {
  const span = endAngle - startAngle;
  const clampedProgress = Math.max(0, Math.min(1, progress));
  // SVG arcs collapse if start and end points are identical (>= 360 deg)
  const rawSpan = span * clampedProgress;
  const sign = rawSpan < 0 ? -1 : 1;
  const currentSpan = Math.abs(rawSpan) >= 360 ? sign * 359.99 : rawSpan;
  const currentEndAngle = startAngle + currentSpan;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const startRad = toRad(startAngle);
  const endRad = toRad(currentEndAngle);

  const x1 = centerX + radius * Math.cos(startRad);
  const y1 = centerY + radius * Math.sin(startRad);
  const x2 = centerX + radius * Math.cos(endRad);
  const y2 = centerY + radius * Math.sin(endRad);

  const largeArcFlag = Math.abs(currentSpan) > 180 ? 1 : 0;
  const sweepFlag = endAngle >= startAngle ? 1 : 0;

  const arcPath =
    Math.abs(currentSpan) > 0.1
      ? `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${x2} ${y2}`
      : '';

  // Generate radial tick marks along the arc
  const ticks: React.ReactNode[] = [];
  if (showTicks && tickCount > 1 && Math.abs(currentSpan) > 5) {
    for (let i = 0; i < tickCount; i++) {
      const frac = i / (tickCount - 1);
      const tickAngle = startAngle + (endAngle - startAngle) * frac;
      if (
        (endAngle >= startAngle && tickAngle <= currentEndAngle) ||
        (endAngle < startAngle && tickAngle >= currentEndAngle)
      ) {
        const rad = toRad(tickAngle);
        const innerX = centerX + (radius - 5) * Math.cos(rad);
        const innerY = centerY + (radius - 5) * Math.sin(rad);
        const outerX = centerX + (radius + 5) * Math.cos(rad);
        const outerY = centerY + (radius + 5) * Math.sin(rad);
        ticks.push(
          <line
            key={`tick-${i}`}
            x1={innerX}
            y1={innerY}
            x2={outerX}
            y2={outerY}
            stroke={color}
            strokeWidth={1}
          />
        );
      }
    }
  }

  // Label position at the middle of the arc
  const midRad = toRad(startAngle + currentSpan / 2);
  const labelX = centerX + (radius + 24) * Math.cos(midRad);
  const labelY = centerY + (radius + 24) * Math.sin(midRad);

  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full overflow-visible ${className}`}
    >
      {/* Radius ray line from center */}
      {showCenterRadius && (
        <line
          x1={centerX}
          y1={centerY}
          x2={x1}
          y2={y1}
          stroke={color}
          strokeWidth={1}
          strokeDasharray="3 3"
          opacity={0.5}
        />
      )}

      {/* Main arc path */}
      {arcPath && (
        <path
          d={arcPath}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      )}

      {/* Radial Ticks */}
      {ticks}

      {/* Notation text (min 18px broadcast scale) */}
      {notation && progress > 0.4 && (
        <text
          x={labelX}
          y={labelY}
          fill={color}
          fontSize={18}
          fontFamily="monospace"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {notation}
        </text>
      )}
    </svg>
  );
};

// ==========================================
// 5. COMPONENT STRIP
// ==========================================

export interface ComponentStripItem {
  id: string;
  title: string;
  category?: string;
  spec?: string;
  active?: boolean;
}

export interface ComponentStripProps {
  items: ComponentStripItem[];
  activeIndex?: number;
  x?: number;
  y?: number;
  cardWidth?: number;
  gap?: number;
  connectorSource?: { x: number; y: number };
  accentColor?: string;
  cardBg?: string;
  progress?: number;
  className?: string;
}

/**
 * Specimen Anatomy Component Strip
 * Horizontal series of analytical component cards with curved SVG connectors.
 */
/** @deprecated legacy look — not for v2 */
export const ComponentStrip: React.FC<ComponentStripProps> = ({
  items,
  activeIndex = 0,
  x = 120,
  y = 820,
  cardWidth = 280,
  gap = 24,
  connectorSource,
  accentColor = EDITORIAL_PALETTE.scarlet,
  cardBg = EDITORIAL_PALETTE.paperWhite,
  progress = 1,
  className = '',
}) => {
  const clampedActiveIndex =
    items.length > 0 ? Math.max(0, Math.min(items.length - 1, activeIndex)) : 0;
  const activeCardX = x + clampedActiveIndex * (cardWidth + gap) + cardWidth / 2;
  const activeCardY = y;

  return (
    <div
      className={`pointer-events-none absolute select-none ${className}`}
      style={{ left: 0, top: 0, width: '100%', height: '100%' }}
    >
      {/* Curved SVG Connector from Hero Specimen to Active Card */}
      {connectorSource && progress > 0.2 && (
        <svg className="absolute inset-0 h-full w-full overflow-visible">
          {(() => {
            const startX = connectorSource.x;
            const startY = connectorSource.y;
            const endX = activeCardX;
            const endY = activeCardY;
            const cY1 = startY + (endY - startY) * 0.5;
            const cY2 = startY + (endY - startY) * 0.8;
            const curveD = `M ${startX} ${startY} C ${startX} ${cY1}, ${endX} ${cY2}, ${endX} ${endY}`;
            const approxLength = Math.max(1, Math.ceil(Math.hypot(endX - startX, endY - startY) * 1.35));
            const connProgress = Math.max(0, Math.min(1, (progress - 0.2) / 0.8));

            return (
              <g>
                <path
                  d={curveD}
                  fill="none"
                  stroke={accentColor}
                  strokeWidth={1.5}
                  strokeDasharray={approxLength}
                  strokeDashoffset={approxLength * (1 - connProgress)}
                  opacity={0.8}
                />
                <circle cx={startX} cy={startY} r={4} fill={accentColor} />
                {connProgress > 0.8 && <circle cx={endX} cy={endY} r={3} fill={accentColor} />}
              </g>
            );
          })()}
        </svg>
      )}

      {/* Cards Row */}
      <div
        className="absolute flex items-start"
        style={{ left: x, top: y, gap, opacity: progress }}
      >
        {items.map((item, idx) => {
          const isActive = idx === clampedActiveIndex || item.active;
          return (
            <div
              key={item.id}
              className="flex flex-col justify-between p-4 rounded border"
              style={{
                width: cardWidth,
                backgroundColor: cardBg,
                borderColor: isActive ? accentColor : EDITORIAL_PALETTE.faintBorder,
                borderWidth: isActive ? 2 : 1,
                boxShadow: isActive ? '0 8px 24px rgba(17, 17, 17, 0.08)' : 'none',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="font-mono text-[18px] uppercase font-bold"
                  style={{ color: isActive ? accentColor : EDITORIAL_PALETTE.leadGray }}
                >
                  {item.category ?? `MOD-${idx + 1}`}
                </span>
                {isActive && (
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                )}
              </div>

              <div
                className="font-sans text-[20px] font-bold text-neutral-900 leading-tight mb-2"
              >
                {item.title}
              </div>

              {item.spec && (
                <div className="font-mono text-[18px] text-neutral-600 border-t border-neutral-200/60 pt-2">
                  {item.spec}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 6. TYPE INTERLOCK
// ==========================================

export interface TypeInterlockProps {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  x?: number | string;
  y?: number | string;
  rotation?: number;
  letterSpacing?: string | number;
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'difference';
  outlineOnly?: boolean;
  strokeWidth?: number;
  strokeColor?: string;
  zIndex?: number;
  opacity?: number;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Editorial Layered Typography Interlock
 * Oversized typographic backdrop that passes behind or interlocks with foreground specimen actors.
 */
/** @deprecated legacy look — not for v2 */
export const TypeInterlock: React.FC<TypeInterlockProps> = ({
  text,
  fontSize = 180,
  fontFamily = 'Georgia, serif',
  color = 'rgba(17, 17, 17, 0.08)',
  x = '50%',
  y = '50%',
  rotation = 0,
  letterSpacing = '-0.02em',
  blendMode = 'normal',
  outlineOnly = false,
  strokeWidth = 2,
  strokeColor = 'rgba(17, 17, 17, 0.15)',
  zIndex = 1,
  opacity = 1,
  className = '',
  children,
}) => {
  return (
    <div
      className={`pointer-events-none absolute inset-0 select-none overflow-hidden ${className}`}
      style={{ zIndex }}
    >
      <div
        className="absolute font-bold uppercase whitespace-nowrap"
        style={{
          left: x,
          top: y,
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
          fontSize,
          fontFamily,
          letterSpacing,
          color: outlineOnly ? 'transparent' : color,
          WebkitTextStroke: (outlineOnly || (strokeWidth && strokeColor)) ? `${strokeWidth}px ${strokeColor}` : undefined,
          mixBlendMode: blendMode,
          opacity,
          lineHeight: 1,
        }}
      >
        {text}
      </div>

      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
};

// ==========================================
// 7. EDITORIAL SPECIMEN STAGE
// ==========================================

export interface EditorialSpecimenStageProps {
  width?: number;
  height?: number;
  backgroundTone?: 'ivory' | 'paper' | 'ice' | 'dark' | string;
  showGrid?: boolean;
  gridProps?: Partial<RegistrationGridProps>;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Editorial Specimen Stage
 * Foundation stage for high-end graphic analysis, forensic layout, and specimen animation.
 */
/** @deprecated legacy look — not for v2 */
export const EditorialSpecimenStage: React.FC<EditorialSpecimenStageProps> = ({
  width = 1920,
  height = 1080,
  backgroundTone = 'ivory',
  showGrid = true,
  gridProps,
  className = '',
  children,
}) => {
  const getBgColor = () => {
    switch (backgroundTone) {
      case 'ivory':
        return EDITORIAL_PALETTE.warmIvory;
      case 'paper':
        return EDITORIAL_PALETTE.paperWhite;
      case 'ice':
        return EDITORIAL_PALETTE.iceBlue;
      case 'dark':
        return EDITORIAL_PALETTE.inkBlack;
      default:
        return backgroundTone;
    }
  };

  const bgColor = getBgColor();
  const isDark = backgroundTone === 'dark';

  return (
    <div
      className={`relative overflow-hidden font-sans ${className}`}
      style={{
        width,
        height,
        backgroundColor: bgColor,
        color: isDark ? EDITORIAL_PALETTE.paperWhite : EDITORIAL_PALETTE.inkBlack,
      }}
    >
      {/* Hairline Grid Layer */}
      {showGrid && (
        <RegistrationGrid
          width={width}
          height={height}
          strokeColor={isDark ? 'rgba(255, 255, 255, 0.08)' : EDITORIAL_PALETTE.faintGrid}
          accentColor={EDITORIAL_PALETTE.scarlet}
          {...gridProps}
        />
      )}

      {/* Main Content Stage */}
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
};
