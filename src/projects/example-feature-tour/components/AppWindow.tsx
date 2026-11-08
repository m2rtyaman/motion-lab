import { type FC, type ReactNode } from 'react';
import type { ThemeConfig } from '../../../core/theme-contract';
import { RADII, SHADOWS } from '../../../core/tokens';

export interface AppWindowProps {
  theme: ThemeConfig; title: string; nav: string[]; heading: string; subheading: string; shareLabel: string;
  /** Slot left of the Share button (avatar stack). */
  shareSlot?: ReactNode; children: ReactNode; className?: string;
}

/** One continuous app window: title bar, sidebar, page header with a Share button, then the content slot. 1440 x 800 at final scale. */
export const AppWindow: FC<AppWindowProps> = ({ theme, title, nav, heading, subheading, shareLabel, shareSlot, children, className = '' }) => {
  const { colors } = theme;
  return (
    <div className={`flex h-[800px] w-[1440px] flex-col overflow-hidden ${className}`} style={{ backgroundColor: colors.bgSurface, borderRadius: RADII.lg, boxShadow: SHADOWS.dark.e3 }}>
      <div className="flex h-[56px] shrink-0 items-center gap-3 px-6" style={{ backgroundColor: colors.bgSurfaceSubtle, borderBottom: `1px solid ${colors.borderSubtle}` }}>
        {[0, 1, 2].map((i) => <div key={i} className="h-[14px] w-[14px] rounded-full" style={{ backgroundColor: colors.textGhost }} />)}
        <div className="ml-4 text-[20px] font-bold" style={{ color: colors.textMuted }}>{title}</div>
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="flex w-[240px] shrink-0 flex-col gap-2 p-6" style={{ backgroundColor: colors.bgSurfaceSubtle, borderRight: `1px solid ${colors.borderSubtle}` }}>
          {nav.map((n, i) => (
            <div key={n} className="px-4 py-3 text-[24px] font-semibold" style={{ borderRadius: RADII.sm, color: i === 1 ? colors.textPrimary : colors.textMuted, backgroundColor: i === 1 ? colors.bgSurface : 'transparent' }}>{n}</div>
          ))}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-6 p-10">
          <div className="flex h-[96px] items-center justify-between">
            <div>
              <div className="text-[48px] font-bold leading-[1.15] tracking-[-0.025em]">{heading}</div>
              <div className="text-[24px] font-medium" style={{ color: colors.textMuted }}>{subheading}</div>
            </div>
            <div className="flex items-center gap-4">
              {shareSlot}
              <div className="share-btn px-8 py-4 text-[24px] font-bold" style={{ border: `2px solid ${colors.textGhost}`, borderRadius: RADII.pill }}>{shareLabel}</div>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};
