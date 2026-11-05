import React, { useId, useMemo } from 'react';
import {
  computeCurvedBracePath,
  interpolateClusterPositions,
  computeSpotlightConeGeometry,
  generateConfettiParticles,
  evaluateConfettiParticle,
  type CurvedBraceParams,
  type CurvedBraceResult,
  type ClusterPillTransform,
  type SpotlightConeParams,
  type SpotlightConeGeometry,
  type ConfettiParticle,
  type ConfettiFrameState,
} from '../core/tactile-geometry';

// Re-export math types & functions for direct convenience
export {
  computeCurvedBracePath,
  interpolateClusterPositions,
  computeSpotlightConeGeometry,
  generateConfettiParticles,
  evaluateConfettiParticle,
  type CurvedBraceParams,
  type CurvedBraceResult,
  type ClusterPillTransform,
  type SpotlightConeParams,
  type SpotlightConeGeometry,
  type ConfettiParticle,
  type ConfettiFrameState,
};

/**
 * Safely adds an alpha hex value to a color string without invalid CSS syntax
 */
function colorWithAlpha(color: string, alphaHex: string): string {
  if (color.startsWith('#')) {
    if (color.length === 7) return `${color}${alphaHex}`;
    if (color.length === 9) return `${color.slice(0, 7)}${alphaHex}`;
    if (color.length === 4) {
      return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}${alphaHex}`;
    }
  }
  return color;
}

/**
 * Calm, Tactile 3D Product Editorial Color Tokens
 * Warm, organic, tactile luxury and editorial precision palette.
 */
export const TACTILE_PALETTE = {
  warmIvory: '#F3F0E8',
  deepForest: '#153F33',
  sage: '#C8D6C9',
  softMint: '#63CDA9',
  warmAmber: '#EFB568',
  blueViolet: '#9A88CF',
  coralGlow: '#E98E88',
  white: '#FFFFFF',
  subtleBorder: 'rgba(21, 63, 51, 0.08)',
  subtleShadow: 'rgba(21, 63, 51, 0.12)',
  ambientOcclusion: 'rgba(21, 63, 51, 0.18)',
} as const;

export type TactilePalette = typeof TACTILE_PALETTE;

// ==========================================
// 1. TACTILE CAPSULE
// ==========================================

export interface TactileCapsuleProps {
  icon?: React.ReactNode;
  label: string;
  value?: string | number;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  size?: 'sm' | 'md' | 'lg';
  progress?: number;
  active?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Glossy, soft-neumorphic rounded capsule with subtle bevel,
 * soft contact shadow, icon slot, counter value, and label.
 */
export const TactileCapsule: React.FC<TactileCapsuleProps> = ({
  icon,
  label,
  value,
  accentColor = TACTILE_PALETTE.softMint,
  backgroundColor = '#FFFFFF',
  textColor = TACTILE_PALETTE.deepForest,
  size = 'md',
  progress = 1,
  active = false,
  className = '',
  style = {},
}) => {
  const sizeStyles = {
    sm: {
      padding: '8px 16px',
      fontSize: '12px',
      valueSize: '16px',
      iconBox: '24px',
      gap: '8px',
      minWidth: '130px',
    },
    md: {
      padding: '12px 22px',
      fontSize: '13px',
      valueSize: '20px',
      iconBox: '32px',
      gap: '12px',
      minWidth: '170px',
    },
    lg: {
      padding: '16px 28px',
      fontSize: '15px',
      valueSize: '24px',
      iconBox: '40px',
      gap: '16px',
      minWidth: '220px',
    },
  }[size];

  const ringAlpha = colorWithAlpha(accentColor, '33');
  const iconBgAlpha = colorWithAlpha(accentColor, '24');
  const iconShadowAlpha = colorWithAlpha(accentColor, '18');

  return (
    <div
      className={`inline-flex items-center rounded-full select-none ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: sizeStyles.padding,
        gap: sizeStyles.gap,
        minWidth: sizeStyles.minWidth,
        borderRadius: 9999,
        background: `linear-gradient(180deg, ${backgroundColor} 0%, #F8F6F1 100%)`,
        border: `1px solid ${active ? accentColor : TACTILE_PALETTE.subtleBorder}`,
        boxShadow: active
          ? `0 14px 28px -6px ${TACTILE_PALETTE.subtleShadow}, 0 4px 12px -2px rgba(21, 63, 51, 0.08), 0 0 0 2px ${ringAlpha}, inset 0 1px 1px #FFFFFF, inset 0 -1px 2px rgba(21, 63, 51, 0.06)`
          : `0 10px 22px -5px ${TACTILE_PALETTE.subtleShadow}, 0 3px 8px -2px rgba(21, 63, 51, 0.05), inset 0 1px 1.5px #FFFFFF, inset 0 -1px 1.5px rgba(21, 63, 51, 0.04)`,
        color: textColor,
        transform: `scale(${0.9 + 0.1 * progress})`,
        opacity: progress,
        ...style,
      }}
    >
      {icon && (
        <div
          style={{
            width: sizeStyles.iconBox,
            height: sizeStyles.iconBox,
            borderRadius: '50%',
            backgroundColor: iconBgAlpha,
            color: accentColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `inset 0 1px 1px #FFFFFF, 0 2px 4px ${iconShadowAlpha}`,
          }}
        >
          {icon}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
        {value !== undefined && (
          <span
            style={{
              fontSize: sizeStyles.valueSize,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: textColor,
              fontFeatureSettings: '"tnum" 1, "cv02" 1',
            }}
          >
            {value}
          </span>
        )}
        <span
          style={{
            fontSize: sizeStyles.fontSize,
            fontWeight: 500,
            opacity: 0.72,
            letterSpacing: '0.01em',
            color: textColor,
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};

// ==========================================
// 2. CAPSULE CLUSTER (1-TO-3 EXPANSION)
// ==========================================

export interface CapsuleClusterItem {
  id: string;
  label: string;
  value?: string | number;
  icon?: React.ReactNode;
  accentColor?: string;
  active?: boolean;
  position?: 'left' | 'center' | 'right';
}

export interface CapsuleClusterProps {
  items: CapsuleClusterItem[];
  progress?: number;
  spacing?: number;
  stagger?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 1-to-3 pill expansion component that smoothly slides two matching
 * capsules outward from a central pill with staggered delays.
 */
export const CapsuleCluster: React.FC<CapsuleClusterProps> = ({
  items,
  progress = 1,
  spacing = 200,
  stagger = 0.15,
  size = 'md',
  className = '',
  style = {},
}) => {
  const pillTransforms = useMemo(
    () => interpolateClusterPositions(progress, spacing, stagger),
    [progress, spacing, stagger]
  );

  // Determine items by explicit position or logical 1-to-3 order
  const explicitCenter = items.find((i) => i.position === 'center');
  const explicitLeft = items.find((i) => i.position === 'left');
  const explicitRight = items.find((i) => i.position === 'right');

  let centerItem: CapsuleClusterItem | undefined = explicitCenter;
  let leftItem: CapsuleClusterItem | undefined = explicitLeft;
  let rightItem: CapsuleClusterItem | undefined = explicitRight;

  if (!centerItem && !leftItem && !rightItem) {
    if (items.length === 1) {
      centerItem = items[0];
      leftItem = items[0];
      rightItem = items[0];
    } else if (items.length === 2) {
      centerItem = items[0]; // Hero central anchor
      leftItem = items[1];   // Matching expanding pill
      rightItem = items[1];  // Matching expanding pill
    } else if (items.length >= 3) {
      leftItem = items[0];
      centerItem = items[1];
      rightItem = items[2];
    }
  }

  const pillData = [
    { item: leftItem, transform: pillTransforms[0] },
    { item: centerItem, transform: pillTransforms[1] },
    { item: rightItem, transform: pillTransforms[2] },
  ];

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '80px',
        ...style,
      }}
    >
      {pillData.map(({ item, transform }, idx) => {
        if (!item) return null;
        const isCenter = transform.index === 1;

        return (
          <div
            key={item.id || `pill-${idx}`}
            style={{
              position: isCenter ? 'relative' : 'absolute',
              transform: `translateX(${transform.x}px) scale(${transform.scale})`,
              opacity: transform.opacity,
              zIndex: isCenter ? 2 : 1,
              pointerEvents: transform.opacity < 0.1 ? 'none' : 'auto',
            }}
          >
            <TactileCapsule
              label={item.label}
              value={item.value}
              icon={item.icon}
              accentColor={item.accentColor}
              active={item.active}
              size={size}
            />
          </div>
        );
      })}
    </div>
  );
};

// ==========================================
// 3. CURVED BRACE
// ==========================================

export interface CurvedBraceProps {
  width?: number;
  height?: number;
  depth?: number;
  strokeColor?: string;
  strokeWidth?: number;
  orientation?: 'down' | 'up';
  progress?: number;
  label?: string;
  labelPosition?: 'tip' | 'above' | 'below';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Dynamic thin SVG curved bracket/brace that visually frames
 * and links the 3 capsules to an overarching summary score.
 */
export const CurvedBrace: React.FC<CurvedBraceProps> = ({
  width = 460,
  height = 50,
  depth = 24,
  strokeColor = TACTILE_PALETTE.deepForest,
  strokeWidth = 1.5,
  orientation = 'down',
  progress = 1,
  label,
  labelPosition = 'tip',
  className = '',
  style = {},
}) => {
  const paddingX = 20;
  const paddingY = 12;
  const x1 = paddingX;
  const x2 = width - paddingX;
  const startY = orientation === 'down' ? paddingY : height - paddingY;

  const braceResult = useMemo(
    () =>
      computeCurvedBracePath({
        x1,
        x2,
        y: startY,
        depth,
        orientation,
      }),
    [x1, x2, startY, depth, orientation]
  );

  // SVG dash for draw-in animation
  const approxPathLength = width * 1.25;
  const dashOffset = approxPathLength * (1 - Math.min(1, Math.max(0, progress)));

  // If orientation is 'up' and label is at 'tip', the tip points upward so the label belongs above
  const isAbove = labelPosition === 'above' || (labelPosition === 'tip' && orientation === 'up');

  return (
    <div
      className={`relative flex flex-col items-center ${className}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        width,
        ...style,
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ overflow: 'visible' }}
      >
        <path
          d={braceResult.path}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={approxPathLength}
          strokeDashoffset={dashOffset}
          style={{
            opacity: Math.min(1, progress * 1.5),
          }}
        />
      </svg>

      {label && (
        <div
          style={{
            order: isAbove ? -1 : 1,
            marginTop: isAbove ? '0px' : '4px',
            marginBottom: isAbove ? '4px' : '0px',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: strokeColor,
            opacity: Math.max(0, (progress - 0.5) / 0.5),
            transform: `translateY(${isAbove ? -(1 - progress) * 6 : (1 - progress) * 6}px)`,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 4. PERSPECTIVE DASHBOARD SLAB
// ==========================================

export interface PerspectiveDashboardSlabProps {
  rotateX?: number;
  rotateY?: number;
  hoverOffset?: number;
  scale?: number;
  depth?: number;
  width?: number | string;
  height?: number | string;
  backgroundColor?: string;
  borderColor?: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Sits in shallow perspective (rotateX: 8deg, rotateY: -4deg),
 * floating softly with subtle hover offset and soft ambient occlusion.
 */
export const PerspectiveDashboardSlab: React.FC<PerspectiveDashboardSlabProps> = ({
  rotateX = 8,
  rotateY = -4,
  hoverOffset = 0,
  scale = 1,
  depth = 32,
  width = 960,
  height = 580,
  backgroundColor = '#FAF8F5',
  borderColor = 'rgba(255, 255, 255, 0.85)',
  children,
  className = '',
  style = {},
}) => {
  return (
    <div
      style={{
        perspective: '1400px',
        perspectiveOrigin: '50% 50%',
        display: 'inline-block',
      }}
    >
      <div
        className={`relative rounded-3xl ${className}`}
        style={{
          width,
          height,
          backgroundColor,
          borderRadius: 24,
          border: `1px solid ${borderColor}`,
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${hoverOffset}px) scale(${scale})`,
          transformStyle: 'preserve-3d',
          boxShadow: `0 ${depth}px ${depth * 1.8}px -12px ${TACTILE_PALETTE.ambientOcclusion}, 0 8px 24px -4px ${TACTILE_PALETTE.subtleShadow}, inset 0 1px 2px #FFFFFF`,
          overflow: 'hidden',
          ...style,
        }}
      >
        {/* Soft subtle gloss gradient highlight across top edge */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background:
              'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 35%, rgba(255,255,255,0.9) 65%, rgba(255,255,255,0) 100%)',
            pointerEvents: 'none',
          }}
        />
        {children}
      </div>
    </div>
  );
};

// ==========================================
// 5. SQUARE CONFETTI BURST
// ==========================================

export interface SquareConfettiBurstProps {
  count?: number;
  progress?: number;
  seed?: number;
  radius?: number;
  colors?: string[];
  squareSize?: number;
  center?: { x: number; y: number };
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A single celebratory burst of pastel square confetti around
 * a hero icon that quickly clears (not a continuous particle shower).
 */
export const SquareConfettiBurst: React.FC<SquareConfettiBurstProps> = ({
  count = 24,
  progress = 0,
  seed = 42,
  radius = 140,
  colors = [
    TACTILE_PALETTE.softMint,
    TACTILE_PALETTE.warmAmber,
    TACTILE_PALETTE.blueViolet,
    TACTILE_PALETTE.coralGlow,
    TACTILE_PALETTE.sage,
  ],
  squareSize = 8,
  center = { x: 0, y: 0 },
  className = '',
  style = {},
}) => {
  const particles = useMemo(
    () => generateConfettiParticles(count, seed, radius, colors),
    [count, seed, radius, colors]
  );

  if (progress <= 0 || progress >= 1) {
    return null;
  }

  return (
    <div
      className={`pointer-events-none absolute ${className}`}
      style={{
        position: 'absolute',
        left: center.x,
        top: center.y,
        width: 0,
        height: 0,
        overflow: 'visible',
        pointerEvents: 'none',
        ...style,
      }}
    >
      {particles.map((p) => {
        const state = evaluateConfettiParticle(p, progress);
        if (state.opacity <= 0.01) return null;

        const particleShadow = colorWithAlpha(state.color, '40');

        return (
          <div
            key={`confetti-${p.id}`}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: squareSize,
              height: squareSize,
              backgroundColor: state.color,
              borderRadius: '1.5px',
              opacity: state.opacity,
              transform: `translate3d(${state.x}px, ${state.y}px, 0px) rotate(${state.rotation}deg) scale(${state.scale})`,
              boxShadow: `0 2px 6px ${particleShadow}`,
              willChange: 'transform, opacity',
            }}
          />
        );
      })}
    </div>
  );
};

// ==========================================
// 6. SPOTLIGHT CONE
// ==========================================

export interface SpotlightConeProps {
  topWidth?: number;
  bottomWidth?: number;
  height?: number;
  topCenterX?: number;
  topY?: number;
  color?: string;
  opacity?: number;
  progress?: number;
  blur?: number;
  width?: number | string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * Warm top-down amber spotlight cone for premium brand end-cards.
 */
export const SpotlightCone: React.FC<SpotlightConeProps> = ({
  topWidth = 80,
  bottomWidth = 720,
  height = 650,
  topCenterX,
  topY = 0,
  color = TACTILE_PALETTE.warmAmber,
  opacity = 1,
  progress = 1,
  blur = 24,
  width,
  className = '',
  style = {},
  children,
}) => {
  const generatedId = useId();
  const gradientId = `spotlight-grad-${generatedId.replace(/:/g, '')}`;

  const naturalWidth = Math.max(bottomWidth, topWidth) + 120;
  const effectiveCenterX = topCenterX !== undefined ? topCenterX : naturalWidth / 2;
  const computedViewBoxWidth = Math.max(
    naturalWidth,
    effectiveCenterX + Math.max(bottomWidth, topWidth) / 2 + 60
  );
  const viewBoxWidth = typeof width === 'number' ? Math.max(width, computedViewBoxWidth) : computedViewBoxWidth;
  const viewBoxHeight = height + 100;
  const animScaleY = Math.min(1, Math.max(0, progress));

  const geom = useMemo(
    () =>
      computeSpotlightConeGeometry({
        topCenterX: effectiveCenterX,
        topY,
        topWidth,
        bottomWidth,
        height,
      }),
    [effectiveCenterX, topY, topWidth, bottomWidth, height]
  );

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{
        position: 'relative',
        width: typeof width === 'string' ? width : viewBoxWidth,
        height: viewBoxHeight,
        pointerEvents: 'none',
        ...style,
      }}
    >
      <svg
        width={viewBoxWidth}
        height={viewBoxHeight}
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          overflow: 'visible',
          filter: `blur(${blur}px)`,
          opacity: opacity * progress,
          transformOrigin: `${effectiveCenterX}px ${topY}px`,
          transform: `scaleY(${animScaleY})`,
        }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.45" />
            <stop offset="40%" stopColor={color} stopOpacity="0.22" />
            <stop offset="85%" stopColor={color} stopOpacity="0.08" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={geom.path} fill={`url(#${gradientId})`} />
      </svg>

      {children && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: topY + height * 0.65,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};
