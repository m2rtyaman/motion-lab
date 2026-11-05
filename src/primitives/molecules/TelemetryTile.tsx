import type { FC, ReactNode } from 'react';
import { CounterValue } from '../atoms/CounterValue';

export interface TelemetryTileProps {
  id?: string;
  className?: string;
  title: string;
  value: string | number;
  from?: number;
  to?: number;
  startFrame?: number;
  endFrame?: number;
  decimals?: number;
  unit?: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  footerNote?: string;
  icon?: ReactNode;
}

export const TelemetryTile: FC<TelemetryTileProps> = ({
  id,
  className = '',
  title,
  value,
  from,
  to,
  startFrame = 0,
  endFrame = 90,
  decimals,
  unit,
  change,
  trend = 'neutral',
  footerNote,
  icon,
}) => {
  const trendColor =
    trend === 'up'
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      : trend === 'down'
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      : 'text-white/60 bg-white/[0.04] border-white/[0.08]';

  const parsedNumeric = typeof value === 'number' ? value : parseFloat(String(value));
  const autoFrom = typeof from === 'number' ? from : !Number.isNaN(parsedNumeric) ? parsedNumeric * 0.62 : undefined;
  const autoTo = typeof to === 'number' ? to : !Number.isNaN(parsedNumeric) ? parsedNumeric : undefined;

  return (
    <div
      id={id}
      className={`relative p-5 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md flex flex-col justify-between overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[18px] text-white/60 uppercase tracking-wider">
          {title}
        </span>
        {icon && <span className="text-white/40">{icon}</span>}
      </div>

      <div className="flex items-baseline justify-between gap-4 my-2">
        <CounterValue
          value={value}
          from={autoFrom}
          to={autoTo}
          startFrame={startFrame}
          endFrame={endFrame}
          decimals={decimals}
          unit={unit}
          className="text-[36px]"
        />
        {change && (
          <span
            className={`px-2.5 py-1 rounded-md border font-mono text-[18px] font-medium ${trendColor}`}
          >
            {change}
          </span>
        )}
      </div>

      {footerNote && (
        <div className="mt-3 pt-3 border-t border-white/[0.06] text-white/40 font-mono text-[18px]">
          {footerNote}
        </div>
      )}
    </div>
  );
};
