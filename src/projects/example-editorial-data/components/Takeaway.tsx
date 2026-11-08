import { type FC } from 'react';
import type { ThemeConfig } from '../../../core/theme-contract';

export interface TakeawayProps { words: string[]; theme: ThemeConfig; className?: string }

/** The closing line: one word per span (`takeaway-word`) so a `words` preset can stagger it, under an accent rule. */
export const Takeaway: FC<TakeawayProps> = ({ words, theme, className = '' }) => (
  <div className={`flex flex-col gap-5 ${className}`}>
    <div className="takeaway-rule h-[4px] w-24 rounded-full" style={{ backgroundColor: theme.colors.accentPrimary, transformOrigin: 'left center' }} />
    <h2 className="flex flex-wrap gap-x-5 text-[72px] font-extrabold leading-[1.08] tracking-[-0.03em]" style={{ color: theme.colors.textPrimary }}>
      {words.map((w) => <span key={w} className="takeaway-word inline-block">{w}</span>)}
    </h2>
  </div>
);
