import { type FC } from 'react';
import type { ThemeConfig } from '../../../core/theme-contract';
import { RADII, SHADOWS } from '../../../core/tokens';

export interface DatePopoverProps { theme: ThemeConfig; options: string[]; picked: number; className?: string }

/** Small option menu (4 rows x 60px). The picked row gets the accent fill; class `pick-<i>` marks each row. */
export const DatePopover: FC<DatePopoverProps> = ({ theme, options, picked, className = '' }) => {
  const { colors } = theme;
  return (
    <div className={`flex w-[340px] flex-col gap-1 p-2 ${className}`} style={{ backgroundColor: colors.textPrimary, borderRadius: RADII.md, boxShadow: SHADOWS.dark.e3 }}>
      {options.map((o, i) => (
        <div key={o} className={`pick-${i} flex h-[56px] items-center px-5 text-[24px] font-bold`} style={{ borderRadius: RADII.sm, backgroundColor: i === picked ? colors.accentPrimary : 'transparent', color: i === picked ? colors.textPrimary : colors.bgPrimary }}>{o}</div>
      ))}
    </div>
  );
};

export interface ToastProps { theme: ThemeConfig; title: string; detail: string; className?: string }

/** Confirmation toast, inverted surface so it wins the frame: status dot, 28px title, 20px detail. */
export const Toast: FC<ToastProps> = ({ theme, title, detail, className = '' }) => {
  const { colors } = theme;
  return (
    <div className={`flex w-[460px] items-center gap-5 px-6 py-3 ${className}`} style={{ backgroundColor: colors.textPrimary, color: colors.bgPrimary, borderRadius: RADII.md, boxShadow: SHADOWS.dark.e3 }}>
      <div className="h-[20px] w-[20px] shrink-0 rounded-full" style={{ backgroundColor: colors.statusSuccess }} />
      <div>
        <div className="text-[28px] font-bold leading-[1.2]">{title}</div>
        <div className="text-[20px] font-medium" style={{ color: colors.bgSurfaceSubtle }}>{detail}</div>
      </div>
    </div>
  );
};
