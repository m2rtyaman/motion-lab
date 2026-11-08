import { type FC } from 'react';
import type { ThemeConfig } from '../../../core/theme-contract';
import { RADII } from '../../../core/tokens';

export interface TaskRowProps {
  theme: ThemeConfig; title: string; tag: string; due: string;
  /** Optional second due chip drawn on top of `due` (the "after" state a timeline pops in). */
  dueSet?: string; className?: string;
}

/** 84px list row: checkbox, title (28px), project tag, due chip. `due-chip` / `due-set` are the schedule targets. */
export const TaskRow: FC<TaskRowProps> = ({ theme, title, tag, due, dueSet, className = '' }) => {
  const { colors } = theme;
  const chip = 'flex h-[48px] items-center justify-center px-5 text-[24px] font-bold';
  return (
    <div className={`flex h-[84px] shrink-0 items-center gap-5 ${className}`} style={{ borderBottom: `1px solid ${colors.borderSubtle}` }}>
      <div className="h-[32px] w-[32px] shrink-0" style={{ border: `2px solid ${colors.textGhost}`, borderRadius: RADII.sm }} />
      <div className="flex-1 text-[28px] font-semibold leading-[1.2]">{title}</div>
      <div className={chip} style={{ backgroundColor: colors.bgSurfaceSubtle, color: colors.textMuted, borderRadius: RADII.pill }}>{tag}</div>
      <div className="relative w-[170px] shrink-0">
        <div className={`due-chip ${chip} w-full`} style={{ border: `2px dashed ${colors.textGhost}`, color: colors.textMuted, borderRadius: RADII.pill }}>{due}</div>
        {dueSet && <div className={`due-set ${chip} absolute inset-0 opacity-0`} style={{ backgroundColor: colors.accentPrimary, color: colors.textPrimary, borderRadius: RADII.pill }}>{dueSet}</div>}
      </div>
    </div>
  );
};
