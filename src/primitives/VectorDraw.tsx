import type { FC } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export interface VectorDrawProps {
  variant?: 'vertical-thread' | 'horizontal-laser' | 'sparkline';
  /** Start time in seconds for deterministic draw */
  startAtSec: number;
  /** Duration in seconds (default: 0.55s) */
  durationSec?: number;
  tone?: 'emerald' | 'red' | 'amber' | 'white';
  /** Height in px for vertical-thread (default: 56px) */
  heightPx?: number;
  /** Optional custom SVG path for sparkline (viewBox 0 0 800 160) */
  sparklinePath?: string;
  label?: string;
  className?: string;
}

const STROKE_HEX: Record<NonNullable<VectorDrawProps['tone']>, string> = {
  emerald: '#10b981',
  red: '#ef4444',
  amber: '#f59e0b',
  white: '#e4e4e7',
};

const DEFAULT_SPARKLINE =
  'M 0 135 C 90 130, 140 105, 220 110 C 310 115, 370 65, 460 72 C 550 78, 620 28, 710 32 C 755 34, 780 14, 800 10';

/**
 * VectorDraw — Deterministik SVG Çizgi, Bağlantı Hattı ve Sparkline Çizici
 * Kartlar arası konuşma/olay bağını veya telemetri eğrilerini `frame / fps` ile canlı çizer.
 */
export const VectorDraw: FC<VectorDrawProps> = ({
  variant = 'vertical-thread',
  startAtSec,
  durationSec = 0.5,
  tone = 'emerald',
  heightPx = 56,
  sparklinePath = DEFAULT_SPARKLINE,
  label,
  className = '',
}) => {
  let frame = 0;
  let fps = 60;

  try {
    frame = useCurrentFrame();
    fps = useVideoConfig().fps;
  } catch {
    // Fallback
  }

  const currentSec = frame / fps;
  const rawProgress = Math.min(1, Math.max(0, (currentSec - startAtSec) / Math.max(0.05, durationSec)));
  const eased = 1 - Math.pow(1 - rawProgress, 3);
  const strokeColor = STROKE_HEX[tone];

  if (variant === 'vertical-thread') {
    return (
      <div
        className={`relative flex items-center justify-center my-1 ${className}`}
        style={{ height: `${heightPx}px`, opacity: rawProgress > 0 ? 1 : 0 }}
      >
        <div className="relative h-full w-[2px] bg-white/[0.08] overflow-hidden rounded-full">
          <div
            className="w-full h-full origin-top will-change-transform"
            style={{
              backgroundColor: strokeColor,
              transform: `scaleY(${eased})`,
            }}
          />
        </div>

        {/* Aktif Akış Düğümü (Pulse Node) */}
        <span
          className="absolute w-3 h-3 rounded-full border-2 border-[#09090b] will-change-transform"
          style={{
            backgroundColor: strokeColor,
            top: `${Math.min(92, eased * 92)}%`,
            transform: `scale(${rawProgress > 0.05 ? 1 : 0})`,
          }}
        />

        {label && (
          <span
            className="ml-4 px-3 py-1 rounded bg-[#16161b] border border-white/[0.1] text-[16px] font-mono uppercase tracking-[0.14em] text-zinc-300"
            style={{
              opacity: eased,
              transform: `translateX(${(1 - eased) * 12}px)`,
            }}
          >
            {label}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'horizontal-laser') {
    return (
      <div
        className={`relative w-full h-[2px] bg-white/[0.08] overflow-hidden rounded-full ${className}`}
        style={{ opacity: rawProgress > 0 ? 1 : 0 }}
      >
        <div
          className="w-full h-full origin-left will-change-transform"
          style={{
            backgroundColor: strokeColor,
            transform: `scaleX(${eased})`,
          }}
        />
      </div>
    );
  }

  // Sparkline SVG
  const pathLength = 1200;
  const dashOffset = pathLength * (1 - eased);

  return (
    <div className={`relative w-full ${className}`} style={{ opacity: rawProgress > 0 ? 1 : 0 }}>
      <svg
        viewBox="0 0 800 160"
        className="w-full h-[140px] overflow-visible"
        preserveAspectRatio="none"
      >
        {/* Kılavuz taban çizgisi */}
        <line
          x1="0"
          y1="145"
          x2="800"
          y2="145"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
          strokeDasharray="6 6"
        />
        <path
          d={sparklinePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={pathLength}
          strokeDashoffset={dashOffset}
        />
      </svg>
    </div>
  );
};
