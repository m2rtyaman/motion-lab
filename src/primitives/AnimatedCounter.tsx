import type { FC } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export interface AnimatedCounterProps {
  from?: number;
  to: number;
  /** Start time in seconds */
  startAtSec: number;
  /** Animation duration in seconds (default: 1.4s) */
  durationSec?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Optional delta badge text (e.g. "+42.8% YoY" or "CRITICAL") */
  deltaBadge?: string;
  deltaTone?: 'emerald' | 'red' | 'amber' | 'zinc';
  className?: string;
}

const DELTA_BADGE_STYLES: Record<NonNullable<AnimatedCounterProps['deltaTone']>, string> = {
  emerald: 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/35',
  red: 'bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/35',
  amber: 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/35',
  zinc: 'bg-white/[0.06] text-zinc-200 border-white/[0.14]',
};

/**
 * AnimatedCounter — Deterministik Kare-Kilitli Sayısal Telemetri Sayacı
 * Wall-clock veya manuel DOM ref gerektirmeden `frame / fps` üzerinden `expo.out` ile sayar.
 */
export const AnimatedCounter: FC<AnimatedCounterProps> = ({
  from = 0,
  to,
  startAtSec,
  durationSec = 1.4,
  decimals = 0,
  prefix = '',
  suffix = '',
  deltaBadge,
  deltaTone = 'emerald',
  className = '',
}) => {
  let frame = 0;
  let fps = 60;

  try {
    frame = useCurrentFrame();
    fps = useVideoConfig().fps;
  } catch {
    // Fallback outside Remotion context
  }

  const currentSec = frame / fps;
  const rawProgress = Math.min(1, Math.max(0, (currentSec - startAtSec) / Math.max(0.05, durationSec)));
  // Exponential ease-out curve
  const eased = rawProgress === 1 ? 1 : 1 - Math.pow(2, -10 * rawProgress);
  const currentValue = from + (to - from) * eased;

  const formattedNumber = currentValue.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <div className={`inline-flex items-baseline gap-5 ${className}`}>
      <span className="text-[84px] font-black font-mono tracking-[-0.04em] leading-none text-[#fafafa] tabular-nums">
        {prefix}
        {formattedNumber}
        {suffix}
      </span>

      {deltaBadge && (
        <span
          className={`px-4 py-1.5 rounded-lg border text-[20px] font-mono font-bold uppercase tracking-[0.12em] ${DELTA_BADGE_STYLES[deltaTone]}`}
        >
          {deltaBadge}
        </span>
      )}
    </div>
  );
};
