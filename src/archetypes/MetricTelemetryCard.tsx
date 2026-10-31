import type { FC } from 'react';
import { SpecularCard, type CardAccentTone } from '../primitives/SpecularCard';
import { AnimatedCounter } from '../primitives/AnimatedCounter';
import { VectorDraw } from '../primitives/VectorDraw';

export interface MetricTelemetryCardProps {
  cardClassName: string;
  itemClassName: string;
  categoryLabel: string;
  title: string;
  fromValue?: number;
  toValue: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  deltaBadge?: string;
  tone?: 'emerald' | 'red' | 'amber';
  startAtSec: number;
  footerMeta?: string;
}

/**
 * MetricTelemetryCard (S8 + S18 Arketipi)
 * 84px dev akan sayaç, canlı delta rozeti ve altında otomatik çizilen SVG sparkline eğrisi.
 */
export const MetricTelemetryCard: FC<MetricTelemetryCardProps> = ({
  cardClassName,
  itemClassName,
  categoryLabel,
  title,
  fromValue = 0,
  toValue,
  decimals = 1,
  prefix = '',
  suffix = '',
  deltaBadge,
  tone = 'emerald',
  startAtSec,
  footerMeta = 'TELEMETRY STREAM // 60 FPS LOCKED',
}) => {
  const accent: CardAccentTone = tone;

  return (
    <SpecularCard cardClassName={cardClassName} tone="active" accent={accent}>
      <div className={`${itemClassName} flex items-center justify-between mb-6`}>
        <span className="text-[19px] font-mono font-bold uppercase tracking-[0.16em] text-zinc-400">
          {categoryLabel}
        </span>
        <span className="px-3 py-1 rounded bg-white/[0.05] border border-white/[0.1] text-[17px] font-mono text-zinc-300">
          LIVE_METRIC
        </span>
      </div>

      <h3 className={`${itemClassName} text-[40px] font-bold tracking-[-0.025em] text-zinc-100 mb-6`}>
        {title}
      </h3>

      <div className={`${itemClassName} mb-8`}>
        <AnimatedCounter
          from={fromValue}
          to={toValue}
          decimals={decimals}
          prefix={prefix}
          suffix={suffix}
          deltaBadge={deltaBadge}
          deltaTone={tone}
          startAtSec={startAtSec + 0.15}
          durationSec={1.45}
        />
      </div>

      <div className={`${itemClassName} pt-4 border-t border-white/[0.08]`}>
        <VectorDraw
          variant="sparkline"
          startAtSec={startAtSec + 0.2}
          durationSec={1.2}
          tone={tone}
        />
        <div className="mt-3 flex items-center justify-between text-[17px] font-mono text-zinc-500 uppercase tracking-[0.14em]">
          <span>T-00:00</span>
          <span>{footerMeta}</span>
          <span>NOW</span>
        </div>
      </div>
    </SpecularCard>
  );
};
