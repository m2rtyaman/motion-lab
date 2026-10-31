import type { FC } from 'react';
import { SpecularCard } from '../primitives/SpecularCard';
import { VectorDraw } from '../primitives/VectorDraw';

export interface SplitComparisonCardProps {
  cardClassName: string;
  itemClassName: string;
  title: string;
  beforeLabel: string;
  beforeValue: string;
  beforeSub: string;
  afterLabel: string;
  afterValue: string;
  afterSub: string;
  laserStartSec: number;
}

/**
 * SplitComparisonCard (S2 Arketipi)
 * Önce / Sonra veya Hata / Çözüm durumlarını yüksek kontrastlı 2 katman ve lazer hatla kıyaslar.
 */
export const SplitComparisonCard: FC<SplitComparisonCardProps> = ({
  cardClassName,
  itemClassName,
  title,
  beforeLabel,
  beforeValue,
  beforeSub,
  afterLabel,
  afterValue,
  afterSub,
  laserStartSec,
}) => {
  return (
    <SpecularCard cardClassName={cardClassName} tone="active" accent="emerald">
      <h3 className={`${itemClassName} text-[40px] font-extrabold tracking-[-0.03em] text-white mb-7`}>
        {title}
      </h3>

      {/* Önce / Eski Durum */}
      <div className={`${itemClassName} p-6 rounded-xl bg-[#0d0d11] border border-[#ef4444]/30 mb-5`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[18px] font-mono font-bold uppercase tracking-[0.14em] text-[#ef4444]">
            {beforeLabel}
          </span>
          <span className="text-[18px] font-mono text-zinc-500">DEPRECATED</span>
        </div>
        <div className="text-[48px] font-black font-mono text-zinc-300 tracking-tight">
          {beforeValue}
        </div>
        <div className="text-[20px] font-mono text-zinc-500 mt-1">{beforeSub}</div>
      </div>

      <VectorDraw
        variant="horizontal-laser"
        startAtSec={laserStartSec}
        durationSec={0.5}
        tone="emerald"
        className="my-5"
      />

      {/* Sonra / Yeni Durum */}
      <div className={`${itemClassName} p-6 rounded-xl bg-[#10b981]/10 border border-[#10b981]/40`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[18px] font-mono font-bold uppercase tracking-[0.14em] text-[#10b981]">
            {afterLabel}
          </span>
          <span className="text-[18px] font-mono text-[#10b981] font-bold">OPTIMIZED</span>
        </div>
        <div className="text-[56px] font-black font-mono text-white tracking-tight">
          {afterValue}
        </div>
        <div className="text-[20px] font-mono text-zinc-300 mt-1">{afterSub}</div>
      </div>
    </SpecularCard>
  );
};
