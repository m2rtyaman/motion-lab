import { type FC } from 'react';
import type { ThemeConfig } from '../../../core/theme-contract';

export interface KickerProps { text: string; theme: ThemeConfig; className?: string }

/** Short accent rule plus an uppercase label (TYPE_SCALE.label, 20px). */
export const Kicker: FC<KickerProps> = ({ text, theme, className = '' }) => (
  <div className={`flex items-center gap-4 ${className}`}>
    <div className="kicker-rule h-[4px] w-16 rounded-full" style={{ backgroundColor: theme.colors.accentPrimary, transformOrigin: 'left center' }} />
    <div className="text-[20px] font-bold uppercase leading-[1.2] tracking-[0.08em]" style={{ color: theme.colors.textMuted }}>{text}</div>
  </div>
);
