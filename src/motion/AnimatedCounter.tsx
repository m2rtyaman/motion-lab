import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

export interface AnimatedCounterProps {
  startValue?: number;
  endValue: number;
  startFrame?: number;
  durationFrames?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  locale?: string;
  useSpring?: boolean;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  startValue = 0,
  endValue,
  startFrame = 0,
  durationFrames = 45,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  locale = 'en-US',
  useSpring = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = Math.max(0, frame - startFrame);

  let progress = 0;
  if (useSpring) {
    progress = spring({
      frame: localFrame,
      fps,
      config: { mass: 0.8, damping: 16, stiffness: 90 },
    });
  } else {
    progress = interpolate(localFrame, [0, durationFrames], [0, 1], {
      extrapolateRight: 'clamp',
    });
  }

  const clampedProgress = Math.min(1, Math.max(0, progress));
  const currentValue = startValue + (endValue - startValue) * clampedProgress;

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(currentValue);

  return (
    <span
      className={`inline-block tabular-nums font-mono select-none ${className}`}
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};
