import { type FC } from 'react';
import type { ThemeConfig } from '../../../core/theme-contract';
import { RADII, SHADOWS } from '../../../core/tokens';

export interface ToastProps { theme: ThemeConfig; title: string; detail: string; className?: string }

/** Confirmation toast: inverted surface (light on dark) so it wins the frame, one status dot, two lines. */
export const Toast: FC<ToastProps> = ({ theme, title, detail, className = '' }) => {
  const { colors } = theme;
  return (
    <div className={`flex items-center gap-6 px-10 py-6 ${className}`} style={{ backgroundColor: colors.textPrimary, color: colors.bgPrimary, borderRadius: RADII.lg, boxShadow: SHADOWS.dark.e3 }}>
      <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
        <circle cx="28" cy="28" r="28" fill={colors.statusSuccess} />
        <path d="M16 29l8 8 16-17" stroke={colors.bgPrimary} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="flex flex-col">
        <div className="text-[32px] font-bold leading-[1.15] tracking-[-0.02em]">{title}</div>
        <div className="text-[24px] font-medium leading-[1.3]" style={{ color: colors.bgSurfaceSubtle }}>{detail}</div>
      </div>
    </div>
  );
};
