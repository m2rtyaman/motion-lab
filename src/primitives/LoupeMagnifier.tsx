import React from 'react';
import { useCurrentFrame } from 'remotion';

export interface LoupePoint {
  x: number;
  y: number;
}

export interface LoupeMagnifierProps {
  /** Target coordinates in pixels {x, y} to inspect and highlight */
  target: LoupePoint;
  /** Center coordinates {x, y} where the magnified loupe inset is positioned */
  loupeCenter?: LoupePoint;
  /** Radius of the target indicator ring on the source image (default: 42px) */
  targetRadius?: number;
  /** Radius/size of the loupe lens inset (default: 120px) */
  loupeRadius?: number;
  /** Zoom magnification multiplier (typically 2.0 to 4.0, default: 2.5) */
  zoom?: number;
  /** Shape of the loupe lens (default: 'circle') */
  shape?: 'circle' | 'squircle';
  /** Accent color for the indicator ring, leader line, and boundary (default: '#FF4A2E') */
  accentColor?: string;
  /** Optional manual progress override [0.0 - 1.0]. If not set, drives via frame/startFrame */
  progress?: number;
  /** Frame at which the forensic loupe animation begins (default: 0) */
  startFrame?: number;
  /** Animation duration in frames (default: 36 frames @ 60fps) */
  durationFrames?: number;
  /** Label badge text displayed above the loupe inset (e.g. "FORENSIC ZOOM 2.5×") */
  label?: string;
  /** Optional secondary timestamp or coordinate label (e.g. "T+14.2s · CH-02") */
  sublabel?: string;
  /** Container CSS classes */
  className?: string;
  /** Content to be magnified (e.g. image, canvas, or complex SVG/DOM node) */
  children?: React.ReactNode;
}

/**
 * LoupeMagnifier — Freeze-frame forensic investigation magnifier.
 * 
 * Based on Opus 5.5 Visual Investigation & Sports Telestrator standards:
 * - Clockwise animated red accent indicator ring (#FF4A2E)
 * - Dynamic angle leader line linking target to magnified inset
 * - 2x-4x optical zoom with coordinate crosshair reticle and glass specular boundary
 */
export const LoupeMagnifier: React.FC<LoupeMagnifierProps> = ({
  target,
  loupeCenter,
  targetRadius = 42,
  loupeRadius = 120,
  zoom = 2.5,
  shape = 'circle',
  accentColor = '#FF4A2E',
  progress: customProgress,
  startFrame = 0,
  durationFrames = 36,
  label = 'FORENSIC ZOOM 2.5×',
  sublabel,
  className = '',
  children,
}) => {
  const currentFrame = useCurrentFrame();

  const progress =
    customProgress !== undefined
      ? Math.max(0, Math.min(1, customProgress))
      : Math.max(0, Math.min(1, (currentFrame - startFrame) / Math.max(1, durationFrames)));

  // Derived loupe inset center (default offset: +200px X, -120px Y)
  const resolvedLoupeCenter = loupeCenter || {
    x: target.x + 220,
    y: Math.max(loupeRadius + 30, target.y - 120),
  };

  // Stage progress thresholds:
  // 0.0 -> 0.45: Target circle draws clockwise
  // 0.35 -> 0.70: Leader line draws from target to loupe center
  // 0.60 -> 1.00: Loupe pops in and settles with scale overshoot
  const ringProgress = Math.min(1, progress / 0.45);
  const lineProgress = Math.max(0, Math.min(1, (progress - 0.35) / 0.35));
  const loupeProgress = Math.max(0, Math.min(1, (progress - 0.6) / 0.4));

  // Circumference of target ring for strokeDashoffset
  const ringCircumference = 2 * Math.PI * targetRadius;
  const strokeDashoffset = ringCircumference * (1 - ringProgress);

  // Optical glass styling
  const shapeClasses =
    shape === 'squircle'
      ? 'rounded-[36px]'
      : 'rounded-full';

  // Compute leader line vector
  const dx = resolvedLoupeCenter.x - target.x;
  const dy = resolvedLoupeCenter.y - target.y;
  const dist = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  const hasLine = dist > (targetRadius + loupeRadius);

  // Line starts from edge of target ring and ends at edge of loupe
  const startX = target.x + Math.cos(angle) * targetRadius;
  const startY = target.y + Math.sin(angle) * targetRadius;
  const endX = resolvedLoupeCenter.x - Math.cos(angle) * loupeRadius;
  const endY = resolvedLoupeCenter.y - Math.sin(angle) * loupeRadius;

  const currentEndX = startX + (endX - startX) * lineProgress;
  const currentEndY = startY + (endY - startY) * lineProgress;

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {/* 1. Leader Line & Target Indicator SVG */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 30 }}>
        {/* Animated Leader Line */}
        {hasLine && lineProgress > 0 && (
          <line
            x1={startX}
            y1={startY}
            x2={currentEndX}
            y2={currentEndY}
            stroke={accentColor}
            strokeWidth={1.75}
            strokeDasharray="4 3"
            strokeOpacity={0.85}
          />
        )}

        {/* Clockwise Animated Target Ring */}
        <circle
          cx={target.x}
          cy={target.y}
          r={targetRadius}
          fill="none"
          stroke={accentColor}
          strokeWidth={2.5}
          strokeDasharray={ringCircumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${target.x} ${target.y})`}
        />

        {/* Center reticle dot */}
        {ringProgress > 0.8 && (
          <circle cx={target.x} cy={target.y} r={3} fill={accentColor} />
        )}
      </svg>

      {/* 2. Optical Loupe Inset Window */}
      {loupeProgress > 0 && (
        <div
          className={`absolute overflow-hidden shadow-2xl border-2 ${shapeClasses}`}
          style={{
            zIndex: 40,
            left: resolvedLoupeCenter.x - loupeRadius,
            top: resolvedLoupeCenter.y - loupeRadius,
            width: loupeRadius * 2,
            height: loupeRadius * 2,
            borderColor: accentColor,
            transform: `scale(${0.6 + 0.4 * Math.sin(loupeProgress * Math.PI * 0.5)})`,
            opacity: loupeProgress,
            backgroundColor: '#0B0C0E',
            boxShadow: `0 0 35px rgba(0, 0, 0, 0.85), 0 0 15px ${accentColor}33`,
          }}
        >
          {/* Zoomed content container placed precisely with mathematical centering */}
          <div
            className="absolute left-0 top-0 will-change-transform pointer-events-none"
            style={{
              transform: `translate(${loupeRadius - target.x * zoom}px, ${loupeRadius - target.y * zoom}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
          >
            {children}
          </div>

          {/* Optical Vignette & Glint Overlay */}
          <div className="pointer-events-none absolute inset-0 bg-radial from-transparent via-black/20 to-black/60" />
          
          {/* Reticle Crosshairs */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-[1px] bg-white/40" />
            <div className="h-8 w-[1px] bg-white/40 absolute" />
          </div>

          {/* Specular Rim Glass Reflection */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-white/15 to-transparent" />
        </div>
      )}

      {/* 3. Forensic Badge & Metadata */}
      {loupeProgress > 0.4 && (
        <div
          className="absolute z-50 flex flex-col items-start gap-1"
          style={{
            left: resolvedLoupeCenter.x - loupeRadius,
            top: resolvedLoupeCenter.y - loupeRadius - 40,
            opacity: (loupeProgress - 0.4) / 0.6,
          }}
        >
          <div
            className="px-3 py-1 text-[18px] font-bold tracking-wider uppercase text-white rounded-md flex items-center gap-1.5 shadow-md"
            style={{ backgroundColor: accentColor }}
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            {label}
          </div>
          {sublabel && (
            <span className="text-[18px] font-mono tracking-wide text-zinc-400 bg-black/75 px-2 py-0.5 rounded border border-white/10">
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
