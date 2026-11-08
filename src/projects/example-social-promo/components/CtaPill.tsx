import { type FC } from 'react';
import type { ThemeConfig } from '../../../core/theme-contract';
import { RADII } from '../../../core/tokens';

export interface CtaPillProps { theme: ThemeConfig; label: string; className?: string }

/** End-card button: pill, 32/56 padding, 56px label (the timeline punches the pill itself). */
export const CtaPill: FC<CtaPillProps> = ({ theme, label, className = '' }) => (
  <div className={`px-14 py-8 text-[56px] font-bold leading-[1.15] ${className}`} style={{ backgroundColor: theme.colors.accentSecondary, color: theme.colors.bgPrimary, borderRadius: RADII.pill }}>
    {label}
  </div>
);
