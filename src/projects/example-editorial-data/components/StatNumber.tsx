import { type FC } from 'react';
import type { ThemeConfig } from '../../../core/theme-contract';

export interface StatNumberProps { value: string; theme: ThemeConfig; className?: string }

/** One hero numeral. Drawn at 400px so a timeline can shrink it to a header (scale 0.5) without blur. */
export const StatNumber: FC<StatNumberProps> = ({ value, theme, className = '' }) => (
  <div
    className={`text-[400px] font-black leading-[0.82] tracking-[-0.05em] ${className}`}
    style={{ color: theme.colors.accentPrimary, transformOrigin: 'left top' }}
  >
    <span className="stat-num-in inline-block">{value}</span>
  </div>
);
