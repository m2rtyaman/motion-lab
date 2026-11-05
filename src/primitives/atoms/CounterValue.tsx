import type { FC } from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

export interface CounterValueProps {
  id?: string;
  className?: string;
  value: string | number;
  from?: number;
  to?: number;
  startFrame?: number;
  endFrame?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  unit?: string;
}

export const CounterValue: FC<CounterValueProps> = ({
  id,
  className = '',
  value,
  from,
  to,
  startFrame = 0,
  endFrame = 60,
  decimals,
  prefix = '',
  suffix = '',
  unit = '',
}) => {
  const frame = useCurrentFrame();

  let displayValue: string | number = value;
  const numericTarget = typeof to === 'number' ? to : typeof value === 'number' ? value : parseFloat(String(value));

  if (!Number.isNaN(numericTarget) && (typeof from === 'number' || typeof to === 'number')) {
    const startVal = typeof from === 'number' ? from : numericTarget * 0.65;
    const endVal = typeof to === 'number' ? to : numericTarget;
    const safeEnd = Math.max(startFrame + 1, endFrame);
    const rawProgress = interpolate(frame, [startFrame, safeEnd], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    // Out-cubic easing for crisp mechanical counter deceleration
    const eased = 1 - Math.pow(1 - rawProgress, 3);
    const current = startVal + (endVal - startVal) * eased;
    const inferredDecimals =
      typeof decimals === 'number'
        ? decimals
        : String(value).includes('.')
        ? String(value).split('.')[1]?.replace(/[^0-9]/g, '').length || 1
        : 0;
    displayValue = current.toFixed(inferredDecimals);
  }

  return (
    <div
      id={id}
      className={`inline-flex items-baseline font-mono tabular-nums tracking-tight font-bold text-white ${className}`}
    >
      {prefix && <span className="text-white/50 mr-1 text-[20px]">{prefix}</span>}
      <span className="counter-number">{displayValue}</span>
      {suffix && <span className="text-white/50 ml-1 text-[20px]">{suffix}</span>}
      {unit && <span className="text-white/40 ml-2 font-normal text-[18px]">{unit}</span>}
    </div>
  );
};
