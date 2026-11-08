import { type FC } from 'react';
import type { ThemeConfig } from '../../../core/theme-contract';
import { RADII } from '../../../core/tokens';

export interface QuickAddProps { theme: ThemeConfig; placeholder: string; className?: string }

/** 88px quick-add bar: plus icon and a muted placeholder. The timeline clicks it (`quickadd-plus`). */
export const QuickAdd: FC<QuickAddProps> = ({ theme, placeholder, className = '' }) => (
  <div className={`flex h-[88px] shrink-0 items-center gap-5 px-6 ${className}`} style={{ backgroundColor: theme.colors.textPrimary, borderRadius: RADII.md }}>
    <svg className="quickadd-plus" width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 6v20M6 16h20" stroke={theme.colors.accentPrimary} strokeWidth="4" strokeLinecap="round" />
    </svg>
    <div className="text-[24px] font-medium" style={{ color: theme.colors.textGhost }}>{placeholder}</div>
  </div>
);
