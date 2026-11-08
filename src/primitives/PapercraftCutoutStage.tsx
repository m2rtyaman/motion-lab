import React, { useMemo } from 'react';
import { mulberry32 } from '../core/render-contract.ts';
import {
  computeJaggedPaperTear,
  computeMetronomeOscillation,
  computeScatterTrajectories,
  evaluateScatterParticle,
  computeChecklistProgress,
  computePaperCardMatrix,
  type PaperTearPoint,
  type PaperTearParams,
  type PaperTearResult,
  type MetronomeOscillationParams,
  type MetronomeOscillationResult,
  type ScatterTrajectory,
  type ScatterParams,
  type ScatterState,
  type ChecklistScrubResult,
  type PaperCardMatrixParams,
  type PaperCardMatrixResult,
} from '../core/papercraft-math.ts';

// Re-export math functions and types
export {
  computeJaggedPaperTear,
  computeMetronomeOscillation,
  computeScatterTrajectories,
  evaluateScatterParticle,
  computeChecklistProgress,
  computePaperCardMatrix,
  type PaperTearPoint,
  type PaperTearParams,
  type PaperTearResult,
  type MetronomeOscillationParams,
  type MetronomeOscillationResult,
  type ScatterTrajectory,
  type ScatterParams,
  type ScatterState,
  type ChecklistScrubResult,
  type PaperCardMatrixParams,
  type PaperCardMatrixResult,
};

/**
 * Papercraft Cutout & Editorial Color Palette Tokens
 */
export const PAPERCRAFT_PALETTE = {
  warmCream: '#FBF9F5',
  softPeach: '#FCEADE',
  terracotta: '#E86D48',
  sageMint: '#C4DBCF',
  warmCharcoal: '#2D282A',
  softWhite: '#FFFFFF',
  pastelYellow: '#F9E7A2',
  paperShadow: 'rgba(45, 40, 42, 0.14)',
  divider: 'rgba(45, 40, 42, 0.08)',
  subtleBorder: 'rgba(45, 40, 42, 0.06)',
} as const;

// ==========================================
// 1. JAGGED PAPER TEAR
// ==========================================

export interface JaggedPaperTearProps {
  progress?: number;
  width?: number;
  height?: number;
  seed?: number;
  segments?: number;
  amplitude?: number;
  tearOffset?: number;
  direction?: 'horizontal' | 'vertical' | 'diagonal';
  roughness?: number;
  tearGap?: number;
  fillColorA?: string;
  fillColorB?: string;
  lineColor?: string;
  showLine?: boolean;
  strokeWidth?: number;
  childrenA?: React.ReactNode;
  childrenB?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * High-frequency irregular SVG jagged paper-tear edge mask dividing the canvas with dynamic tear progress.
 */
/** @deprecated legacy look — not for v2 */
export const JaggedPaperTear: React.FC<JaggedPaperTearProps> = ({
  progress = 0,
  width = 1920,
  height = 1080,
  seed = 42,
  segments = 32,
  amplitude = 24,
  tearOffset,
  direction = 'vertical',
  roughness = 1.0,
  tearGap = 80,
  fillColorA = PAPERCRAFT_PALETTE.softPeach,
  fillColorB = PAPERCRAFT_PALETTE.warmCream,
  lineColor = PAPERCRAFT_PALETTE.warmCharcoal,
  showLine = true,
  strokeWidth = 2,
  childrenA,
  childrenB,
  className = '',
  style = {},
}) => {
  const tearData = useMemo(() => {
    return computeJaggedPaperTear({
      width,
      height,
      seed,
      segments,
      amplitude,
      tearOffset,
      direction,
      roughness,
      progress,
      tearGap,
    });
  }, [width, height, seed, segments, amplitude, tearOffset, direction, roughness, progress, tearGap]);

  const clipIdA = useMemo(() => `paper-tear-clip-a-${seed}-${direction}`, [seed, direction]);
  const clipIdB = useMemo(() => `paper-tear-clip-b-${seed}-${direction}`, [seed, direction]);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        width,
        height,
        ...style,
      }}
    >
      <svg
        className="absolute inset-0 pointer-events-none"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        <defs>
          <clipPath id={clipIdA}>
            <path d={tearData.pieceAPath} />
          </clipPath>
          <clipPath id={clipIdB}>
            <path d={tearData.pieceBPath} />
          </clipPath>
        </defs>
      </svg>

      {/* Piece A (Left/Top) */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: `url(#${clipIdA})`,
          backgroundColor: fillColorA,
          transform: `translate3d(${tearData.displacementA.x}px, ${tearData.displacementA.y}px, 0) rotate(${tearData.displacementA.rotate}deg)`,
          transformOrigin: 'center center',
        }}
      >
        {childrenA}
      </div>

      {/* Piece B (Right/Bottom) */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: `url(#${clipIdB})`,
          backgroundColor: fillColorB,
          transform: `translate3d(${tearData.displacementB.x}px, ${tearData.displacementB.y}px, 0) rotate(${tearData.displacementB.rotate}deg)`,
          transformOrigin: 'center center',
        }}
      >
        {childrenB}
      </div>

      {/* Jagged tear line accent */}
      {showLine && (
        <svg
          className="absolute inset-0 pointer-events-none z-10"
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
        >
          <path
            d={tearData.tearLinePath}
            fill="none"
            stroke={lineColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="4 2"
            opacity={Math.max(0, 1 - progress * 1.5)}
          />
        </svg>
      )}
    </div>
  );
};

// ==========================================
// 2. OBJECT SCATTER
// ==========================================

export interface ObjectScatterItem {
  id?: string | number;
  text?: string;
  icon?: React.ReactNode;
  color?: string;
  textColor?: string;
  component?: React.ReactNode;
}

export interface ObjectScatterProps {
  progress?: number;
  items?: ObjectScatterItem[];
  count?: number;
  originX?: number;
  originY?: number;
  minDistance?: number;
  maxDistance?: number;
  spreadAngle?: number;
  startAngle?: number;
  seed?: number;
  gravity?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Small independent 2D sticker/label tags that explode outward along radial vectors with varied rotations upon paper-tear impact.
 */
/** @deprecated legacy look — not for v2 */
export const ObjectScatter: React.FC<ObjectScatterProps> = ({
  progress = 0,
  items,
  count = 8,
  originX = 0,
  originY = 0,
  minDistance = 140,
  maxDistance = 380,
  spreadAngle = 2 * Math.PI,
  startAngle = 0,
  seed = 77,
  gravity = 35,
  className = '',
  style = {},
}) => {
  const safeCount = items?.length || count;

  const trajectories = useMemo(() => {
    return computeScatterTrajectories({
      count: safeCount,
      minDistance,
      maxDistance,
      spreadAngle,
      startAngle,
      seed,
    });
  }, [safeCount, minDistance, maxDistance, spreadAngle, startAngle, seed]);

  const defaultPalette = [
    PAPERCRAFT_PALETTE.terracotta,
    PAPERCRAFT_PALETTE.sageMint,
    PAPERCRAFT_PALETTE.pastelYellow,
    PAPERCRAFT_PALETTE.softPeach,
    PAPERCRAFT_PALETTE.warmCharcoal,
  ];

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-visible ${className}`}
      style={style}
    >
      {trajectories.map((traj, idx) => {
        const item = items ? items[idx % items.length] : undefined;
        const state = evaluateScatterParticle(traj, progress, originX, originY, gravity);
        const bgColor = item?.color || defaultPalette[idx % defaultPalette.length];
        const textColor = item?.textColor || (bgColor === PAPERCRAFT_PALETTE.warmCharcoal ? '#FFFFFF' : PAPERCRAFT_PALETTE.warmCharcoal);

        return (
          <div
            key={item?.id ?? traj.id}
            className="absolute select-none will-change-transform"
            style={{
              left: 0,
              top: 0,
              transform: `translate3d(${state.x}px, ${state.y}px, 0) translate(-50%, -50%) rotate(${state.rotation}deg) scale(${state.scale})`,
              transformOrigin: 'center center',
              opacity: state.opacity,
            }}
          >
            {item?.component ? (
              item.component
            ) : (
              <div
                className="px-4 py-2 rounded-full font-semibold tracking-wide shadow-md flex items-center gap-2 whitespace-nowrap border"
                style={{
                  backgroundColor: bgColor,
                  color: textColor,
                  borderColor: 'rgba(45, 40, 42, 0.08)',
                  boxShadow: '0 4px 12px rgba(45, 40, 42, 0.12)',
                  fontSize: 18,
                }}
              >
                {item?.icon && <span style={{ fontSize: 18 }}>{item.icon}</span>}
                <span>{item?.text ?? `TAG #${idx + 1}`}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ==========================================
// 3. METRONOME GAUGE
// ==========================================

export interface MetronomeGaugeProps {
  time?: number;
  frame?: number;
  fps?: number;
  bpm?: number;
  maxAngle?: number;
  damping?: number;
  phase?: number;
  size?: number;
  accentColor?: string;
  needleColor?: string;
  backgroundColor?: string;
  scaleMarksCount?: number;
  label?: string;
  sublabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Circular gauge housing a swinging metronome needle with realistic pendulum oscillation physics
 * (left -> center -> right -> center with eased reversals).
 */
/** @deprecated legacy look — not for v2 */
export const MetronomeGauge: React.FC<MetronomeGaugeProps> = ({
  time,
  frame = 0,
  fps = 60,
  bpm = 84,
  maxAngle = 34,
  damping = 0,
  phase = 0,
  size = 280,
  accentColor = PAPERCRAFT_PALETTE.terracotta,
  needleColor = PAPERCRAFT_PALETTE.warmCharcoal,
  backgroundColor = PAPERCRAFT_PALETTE.softWhite,
  scaleMarksCount = 11,
  label = 'PRACTICE CADENCE',
  sublabel = `${bpm} BPM`,
  className = '',
  style = {},
}) => {
  const currentTime = time ?? frame / fps;

  const oscillation = useMemo(() => {
    return computeMetronomeOscillation({
      time: currentTime,
      bpm,
      maxAngle,
      damping,
      phase,
    });
  }, [currentTime, bpm, maxAngle, damping, phase]);

  const radius = size / 2;
  const pivotX = radius;
  const pivotY = size * 0.82;
  const needleLength = size * 0.62;

  // Render tick marks along an arc
  const marks = useMemo(() => {
    const list: Array<{ x1: number; y1: number; x2: number; y2: number; isCenter: boolean }> = [];
    const count = Math.max(3, scaleMarksCount);
    const startDeg = -maxAngle;
    const endDeg = maxAngle;
    const stepDeg = (endDeg - startDeg) / (count - 1);

    for (let i = 0; i < count; i++) {
      const angle = startDeg + i * stepDeg;
      const rad = ((angle - 90) * Math.PI) / 180;
      const isCenter = Math.abs(angle) < 1e-3;
      const outerR = needleLength + 14;
      const innerR = isCenter ? needleLength - 2 : needleLength + 6;

      list.push({
        x1: pivotX + Math.cos(rad) * innerR,
        y1: pivotY + Math.sin(rad) * innerR,
        x2: pivotX + Math.cos(rad) * outerR,
        y2: pivotY + Math.sin(rad) * outerR,
        isCenter,
      });
    }
    return list;
  }, [scaleMarksCount, maxAngle, needleLength, pivotX, pivotY]);

  return (
    <div
      className={`relative rounded-full flex items-center justify-center select-none ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor,
        boxShadow: `0 16px 36px -8px ${PAPERCRAFT_PALETTE.paperShadow}, 0 2px 6px rgba(45, 40, 42, 0.06)`,
        border: `1.5px solid ${PAPERCRAFT_PALETTE.subtleBorder}`,
        ...style,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 pointer-events-none"
      >
        {/* Outer subtle dial arc */}
        <circle
          cx={radius}
          cy={radius}
          r={radius - 8}
          fill="none"
          stroke={PAPERCRAFT_PALETTE.divider}
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />

        {/* Dial Scale Tick Marks */}
        {marks.map((m, idx) => (
          <line
            key={idx}
            x1={m.x1}
            y1={m.y1}
            x2={m.x2}
            y2={m.y2}
            stroke={m.isCenter ? accentColor : PAPERCRAFT_PALETTE.warmCharcoal}
            strokeWidth={m.isCenter ? 2.5 : 1.5}
            strokeLinecap="round"
            opacity={m.isCenter ? 0.9 : 0.4}
          />
        ))}

        {/* Inverted Pendulum Needle */}
        <g
          transform={`translate(${pivotX}, ${pivotY}) rotate(${oscillation.angleDeg})`}
          style={{ transformOrigin: '0 0' }}
        >
          {/* Needle Rod */}
          <line
            x1={0}
            y1={12}
            x2={0}
            y2={-needleLength}
            stroke={needleColor}
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Sliding Weight / Bobbin */}
          <rect
            x={-9}
            y={-needleLength * 0.65}
            width={18}
            height={14}
            rx={3}
            fill={accentColor}
            stroke={needleColor}
            strokeWidth="1.5"
          />

          {/* Pointer Tip */}
          <circle
            cx={0}
            y={-needleLength}
            r={4.5}
            fill={accentColor}
          />

          {/* Pivot Base Cap */}
          <circle
            cx={0}
            y={0}
            r={8}
            fill={needleColor}
          />
          <circle
            cx={0}
            y={0}
            r={3.5}
            fill={backgroundColor}
          />
        </g>
      </svg>

      {/* Central Typographic Info */}
      <div
        className="absolute flex flex-col items-center pointer-events-none"
        style={{ top: size * 0.15 }}
      >
        <span
          className="uppercase font-bold tracking-widest"
          style={{ color: PAPERCRAFT_PALETTE.warmCharcoal, opacity: 0.6, fontSize: 18 }}
        >
          {label}
        </span>
        <span
          className="font-extrabold tracking-tight mt-1"
          style={{ color: accentColor, fontSize: 26 }}
        >
          {sublabel}
        </span>
      </div>

      {/* Active turnaround indicator bead */}
      <div
        className="absolute bottom-5 flex items-center gap-2 px-4 py-1.5 rounded-full font-semibold tracking-wide"
        style={{
          backgroundColor: oscillation.isTurnaround ? accentColor : 'transparent',
          color: oscillation.isTurnaround ? '#FFFFFF' : PAPERCRAFT_PALETTE.warmCharcoal,
          opacity: oscillation.isTurnaround ? 1 : 0.45,
          fontSize: 18,
        }}
      >
        <span
          className="inline-block w-2.5 h-2.5 rounded-full"
          style={{
            backgroundColor: oscillation.isTurnaround ? '#FFFFFF' : accentColor,
          }}
        />
        <span>{oscillation.isTurnaround ? 'REVERSAL' : 'TEMPO'}</span>
      </div>
    </div>
  );
};

// ==========================================
// 4. SCRIBBLE ANCHOR
// ==========================================

export interface ScribbleAnchorProps {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  shadowOpacity?: number;
  progress?: number;
  variant?: 'loop' | 'zigzag' | 'spiral' | 'spring';
  seed?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Organic hand-drawn SVG scribble that acts as a stationary landing anchor for cards with an elliptical contact shadow.
 */
/** @deprecated legacy look — not for v2 */
export const ScribbleAnchor: React.FC<ScribbleAnchorProps> = ({
  width = 340,
  height = 90,
  color = PAPERCRAFT_PALETTE.terracotta,
  strokeWidth = 3,
  shadowOpacity = 0.22,
  progress = 1,
  variant = 'loop',
  seed = 42,
  className = '',
  style = {},
}) => {
  const pathD = useMemo(() => {
    const rand = mulberry32(seed);
    const w = width;
    const h = height;
    const midY = h * 0.55;
    const jY = (rand() - 0.5) * 6;

    if (variant === 'zigzag') {
      const segs = 10;
      const step = (w * 0.8) / segs;
      let d = `M ${(w * 0.1).toFixed(1)} ${(midY + jY).toFixed(1)}`;
      for (let i = 1; i <= segs; i++) {
        const x = w * 0.1 + i * step;
        const y = midY + (i % 2 === 0 ? 12 : -12) + (rand() - 0.5) * 4;
        d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      return d;
    }

    if (variant === 'spiral') {
      return `M ${(w * 0.2).toFixed(1)} ${(midY + jY).toFixed(1)} C ${(w * 0.3).toFixed(1)} ${(midY - 24).toFixed(1)}, ${(w * 0.5).toFixed(1)} ${(midY + 28).toFixed(1)}, ${(w * 0.7).toFixed(1)} ${(midY + jY).toFixed(1)} C ${(w * 0.8).toFixed(1)} ${(midY - 18).toFixed(1)}, ${(w * 0.85).toFixed(1)} ${(midY + 14).toFixed(1)}, ${(w * 0.9).toFixed(1)} ${midY.toFixed(1)}`;
    }

    if (variant === 'spring') {
      const coils = 6;
      const step = (w * 0.76) / coils;
      const startX = w * 0.12;
      let d = `M ${startX.toFixed(1)} ${(midY + jY).toFixed(1)}`;
      for (let i = 0; i < coils; i++) {
        const x1 = startX + i * step + step * 0.3;
        const x2 = startX + i * step + step * 0.7;
        const xEnd = startX + (i + 1) * step;
        d += ` C ${x1.toFixed(1)} ${(midY - 22 + (rand() - 0.5) * 4).toFixed(1)}, ${x2.toFixed(1)} ${(midY + 24 + (rand() - 0.5) * 4).toFixed(1)}, ${xEnd.toFixed(1)} ${(midY + (rand() - 0.5) * 3).toFixed(1)}`;
      }
      return d;
    }

    // Default: 'loop' (organic double loop hand-drawn anchor)
    return `M ${(w * 0.12).toFixed(1)} ${(midY + 4 + jY).toFixed(1)} C ${(w * 0.25).toFixed(1)} ${(midY - 22).toFixed(1)}, ${(w * 0.38).toFixed(1)} ${(midY + 24).toFixed(1)}, ${(w * 0.5).toFixed(1)} ${(midY + jY).toFixed(1)} C ${(w * 0.62).toFixed(1)} ${(midY - 24).toFixed(1)}, ${(w * 0.75).toFixed(1)} ${(midY + 22).toFixed(1)}, ${(w * 0.88).toFixed(1)} ${(midY - 4).toFixed(1)}`;
  }, [width, height, variant, seed]);

  const approxLength = width * 1.4;
  const strokeDashoffset = approxLength * (1 - Math.max(0, Math.min(1, progress)));

  return (
    <div
      className={`relative flex items-center justify-center pointer-events-none ${className}`}
      style={{
        width,
        height,
        ...style,
      }}
    >
      {/* Soft Elliptical Ground Contact Shadow */}
      <div
        className="absolute rounded-[100%] blur-[8px]"
        style={{
          width: width * 0.75,
          height: height * 0.36,
          backgroundColor: PAPERCRAFT_PALETTE.warmCharcoal,
          opacity: shadowOpacity,
          top: height * 0.45,
        }}
      />

      {/* Hand-drawn SVG Scribble Vector */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="absolute inset-0"
      >
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={approxLength}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
    </div>
  );
};

// ==========================================
// 5. PASTEL BUBBLE OCCLUSION
// ==========================================

export interface PastelBubbleOcclusionProps {
  progress?: number;
  width?: number;
  height?: number;
  bubbleCount?: number;
  colors?: string[];
  blur?: number;
  opacity?: number;
  seed?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Large translucent pastel depth circles swelling from canvas edges to create a soft foreground occlusion wipe without hard cuts.
 */
/** @deprecated legacy look — not for v2 */
export const PastelBubbleOcclusion: React.FC<PastelBubbleOcclusionProps> = ({
  progress = 0,
  width = 1920,
  height = 1080,
  bubbleCount = 5,
  colors = [
    PAPERCRAFT_PALETTE.softPeach,
    PAPERCRAFT_PALETTE.sageMint,
    PAPERCRAFT_PALETTE.pastelYellow,
    PAPERCRAFT_PALETTE.warmCream,
  ],
  blur = 40,
  opacity = 0.94,
  seed = 88,
  className = '',
  style = {},
}) => {
  const pClamped = Math.max(0, Math.min(1, progress));

  // Bubble configurations anchoring from corners and edges
  const bubbles = useMemo(() => {
    const rand = mulberry32(seed);
    const jX = (rand() - 0.5) * (width * 0.05);
    const jY = (rand() - 0.5) * (height * 0.05);

    const basePositions = [
      { originX: 0 + jX, originY: 0 + jY, maxR: width * 0.75, color: colors[0] },
      { originX: width + jX, originY: 0 - jY, maxR: width * 0.7, color: colors[1 % colors.length] },
      { originX: 0 - jX, originY: height + jY, maxR: width * 0.8, color: colors[2 % colors.length] },
      { originX: width + jX, originY: height - jY, maxR: width * 0.85, color: colors[3 % colors.length] },
      { originX: width * 0.5 + jX, originY: height * 0.5 + jY, maxR: width * 0.9, color: colors[0] },
    ];

    const result = basePositions.slice(0, Math.min(basePositions.length, Math.max(1, bubbleCount)));

    // If more than 5 bubbles requested, distribute extra bubbles around edges
    for (let i = basePositions.length; i < bubbleCount; i++) {
      const angle = (i / bubbleCount) * 2 * Math.PI;
      const rx = width * 0.5 + Math.cos(angle) * width * 0.55;
      const ry = height * 0.5 + Math.sin(angle) * height * 0.55;
      result.push({
        originX: rx + (rand() - 0.5) * 40,
        originY: ry + (rand() - 0.5) * 40,
        maxR: width * (0.6 + rand() * 0.3),
        color: colors[i % colors.length],
      });
    }

    return result;
  }, [width, height, bubbleCount, colors, seed]);

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden z-40 ${className}`}
      style={{
        width,
        height,
        filter: blur > 0 ? `blur(${blur}px)` : undefined,
        opacity: pClamped * opacity,
        display: pClamped <= 0 ? 'none' : 'block',
        ...style,
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
      >
        {bubbles.map((b, idx) => {
          // Dynamic radius expansion with smooth power2 swell
          const r = b.maxR * Math.pow(pClamped, 1.4);
          return (
            <circle
              key={idx}
              cx={b.originX}
              cy={b.originY}
              r={r}
              fill={b.color}
              opacity={0.88}
            />
          );
        })}
      </svg>
    </div>
  );
};

// ==========================================
// 6. CHECKLIST SCRUBBER
// ==========================================

export interface ChecklistItemData {
  id?: string | number;
  label: string;
  tag?: string;
  completed?: boolean;
}

export interface ChecklistScrubberProps {
  items: ChecklistItemData[];
  progress?: number;
  activeDotColor?: string;
  trackColor?: string;
  backgroundColor?: string;
  textColor?: string;
  completedColor?: string;
  width?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Vertical checklist card with a linked path orange dot and line tracking through rows.
 */
/** @deprecated legacy look — not for v2 */
export const ChecklistScrubber: React.FC<ChecklistScrubberProps> = ({
  items,
  progress = 0,
  activeDotColor = PAPERCRAFT_PALETTE.terracotta,
  trackColor = PAPERCRAFT_PALETTE.divider,
  backgroundColor = PAPERCRAFT_PALETTE.softWhite,
  textColor = PAPERCRAFT_PALETTE.warmCharcoal,
  completedColor = PAPERCRAFT_PALETTE.sageMint,
  width = 440,
  className = '',
  style = {},
}) => {
  const rowHeight = 64;
  const topPad = 32;
  const bottomPad = 32;
  const totalHeight = topPad + items.length * rowHeight + bottomPad;

  const scrub = useMemo(() => {
    return computeChecklistProgress(items.length, progress, totalHeight, topPad + rowHeight / 2, bottomPad + rowHeight / 2);
  }, [items.length, progress, totalHeight, topPad, bottomPad, rowHeight]);

  return (
    <div
      className={`relative rounded-2xl select-none border ${className}`}
      style={{
        width,
        minHeight: totalHeight,
        backgroundColor,
        borderColor: PAPERCRAFT_PALETTE.subtleBorder,
        boxShadow: `0 14px 32px -8px ${PAPERCRAFT_PALETTE.paperShadow}, 0 2px 6px rgba(45, 40, 42, 0.05)`,
        paddingTop: topPad,
        paddingBottom: bottomPad,
        ...style,
      }}
    >
      {/* Vertical Track Line */}
      <div
        className="absolute rounded-full"
        style={{
          left: 36,
          top: topPad + rowHeight / 2,
          bottom: bottomPad + rowHeight / 2,
          width: 3,
          backgroundColor: trackColor,
        }}
      />

      {/* Scrubbed Progress Fill Line */}
      <div
        className="absolute rounded-full"
        style={{
          left: 36,
          top: topPad + rowHeight / 2,
          height: Math.max(0, scrub.dotY - (topPad + rowHeight / 2)),
          width: 3,
          backgroundColor: activeDotColor,
        }}
      />

      {/* Active Tracking Dot (Terracotta Orange) */}
      <div
        className="absolute rounded-full shadow-md z-10 will-change-transform"
        style={{
          left: 37.5,
          top: 0,
          width: 15,
          height: 15,
          backgroundColor: activeDotColor,
          transform: `translate(-50%, ${scrub.dotY - 7.5}px)`,
          boxShadow: `0 0 0 4px rgba(232, 109, 72, 0.22), 0 3px 8px rgba(45, 40, 42, 0.25)`,
        }}
      />

      {/* Checklist Rows */}
      <div className="flex flex-col">
        {items.map((item, idx) => {
          const isCompleted = scrub.completedIndices.includes(idx);
          const isActive = scrub.activeIndex === idx;

          return (
            <div
              key={item.id ?? idx}
              className="flex items-center pl-16 pr-6 h-[64px] relative"
            >
              {/* Node checkmark circle */}
              <div
                className="absolute flex items-center justify-center rounded-full font-bold"
                style={{
                  left: 28,
                  width: 22,
                  height: 22,
                  backgroundColor: isCompleted ? completedColor : backgroundColor,
                  border: `2px solid ${isCompleted ? completedColor : trackColor}`,
                  color: isCompleted ? PAPERCRAFT_PALETTE.warmCharcoal : 'transparent',
                }}
              >
                {isCompleted && (
                  <svg width="12" height="10" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L3.8 6.8L9 1.2"
                      stroke={PAPERCRAFT_PALETTE.warmCharcoal}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>

              {/* Row Content */}
              <div className="flex items-center justify-between w-full">
                <span
                  className="font-semibold"
                  style={{
                    color: textColor,
                    opacity: isCompleted ? 0.5 : isActive ? 1.0 : 0.75,
                    textDecoration: isCompleted ? 'line-through' : 'none',
                    fontSize: 18,
                  }}
                >
                  {item.label}
                </span>

                {item.tag && (
                  <span
                    className="uppercase font-bold tracking-wider px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: isCompleted
                        ? 'rgba(45, 40, 42, 0.06)'
                        : isActive
                        ? PAPERCRAFT_PALETTE.softPeach
                        : 'rgba(45, 40, 42, 0.04)',
                      color: isActive ? PAPERCRAFT_PALETTE.terracotta : textColor,
                      fontSize: 18,
                    }}
                  >
                    {item.tag}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 7. PAPER CARD
// ==========================================

export interface PaperCardProps {
  children?: React.ReactNode;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  elevation?: number;
  perspective?: number;
  scale?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: number | string;
  padding?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 2.5D physical paper-like card with rounded corners, slight rotation/perspective, and soft contact shadow.
 */
/** @deprecated legacy look — not for v2 */
export const PaperCard: React.FC<PaperCardProps> = ({
  children,
  rotateX = 2,
  rotateY = -3,
  rotateZ = 0,
  elevation = 1.5,
  perspective = 1200,
  scale = 1,
  backgroundColor = PAPERCRAFT_PALETTE.softWhite,
  borderColor = PAPERCRAFT_PALETTE.subtleBorder,
  borderRadius = 18,
  padding = '24px',
  className = '',
  style = {},
}) => {
  const matrix = useMemo(() => {
    return computePaperCardMatrix({
      rotateX,
      rotateY,
      rotateZ,
      elevation,
      perspective,
      scale,
    });
  }, [rotateX, rotateY, rotateZ, elevation, perspective, scale]);

  return (
    <div
      className={`relative select-none ${className}`}
      style={{
        backgroundColor,
        borderRadius,
        padding,
        transform: matrix.transform,
        transformStyle: 'preserve-3d',
        boxShadow: matrix.boxShadow,
        border: `1.5px solid ${borderColor}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ==========================================
// 8. PAPERCRAFT CUTOUT STAGE
// ==========================================

export interface PapercraftCutoutStageProps {
  children?: React.ReactNode;
  width?: number;
  height?: number;
  backgroundColor?: string;
  showTexture?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Full viewport papercraft editorial stage container providing warm paper tone substrate,
 * subtle surface grain, and physical layered backdrop.
 */
/** @deprecated legacy look — not for v2 */
export const PapercraftCutoutStage: React.FC<PapercraftCutoutStageProps> = ({
  children,
  width = 1920,
  height = 1080,
  backgroundColor = PAPERCRAFT_PALETTE.warmCream,
  showTexture = true,
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`relative overflow-hidden w-full h-full select-none ${className}`}
      style={{
        width,
        height,
        backgroundColor,
        color: PAPERCRAFT_PALETTE.warmCharcoal,
        ...style,
      }}
    >
      {/* Subtle Paper Grain / Noise Overlay */}
      {showTexture && (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-multiply"
          style={{
            backgroundImage: `radial-gradient(${PAPERCRAFT_PALETTE.warmCharcoal} 1px, transparent 0)`,
            backgroundSize: '16px 16px',
          }}
        />
      )}

      {/* Warm Ambient Radial Softness */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 35%, rgba(255, 255, 255, 0.45) 0%, transparent 75%)`,
        }}
      />

      {children}
    </div>
  );
};
