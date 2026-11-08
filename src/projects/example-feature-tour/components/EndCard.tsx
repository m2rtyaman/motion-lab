import { type FC } from 'react';
import type { ThemeConfig } from '../../../core/theme-contract';
import { RADII, SHADOWS } from '../../../core/tokens';

export interface EndCardProps { theme: ThemeConfig; lines: string[][]; cta: string; className?: string }

/** Closing card (recipe 5): brand mark 112, `display` headline (112px, two lines), one big pill CTA (44px label). Centered; the window is dimmed behind it. */
export const EndCard: FC<EndCardProps> = ({ theme, lines, cta, className = '' }) => {
  const { colors } = theme;
  return (
    <div className={`flex flex-col items-center justify-center gap-12 ${className}`} style={{ color: colors.textPrimary }}>
      <svg className="end-mark" width="112" height="112" viewBox="0 0 112 112" aria-hidden="true" style={{ borderRadius: RADII.xl, boxShadow: SHADOWS.dark.e3 }}>
        <rect width="112" height="112" fill={colors.accentPrimary} />
        <path d="M34 28h44v14H50v14h22v14H50v28H34z" fill={colors.textPrimary} />
      </svg>
      <h1 className="close-title flex flex-col items-center text-[112px] font-black leading-[1.04] tracking-[-0.04em]">
        {lines.map((words) => (
          <div key={words.join('-')} className="flex gap-x-6">
            {words.map((w) => <span key={w} className="title-word inline-block">{w}</span>)}
          </div>
        ))}
      </h1>
      <div className="cta mt-4 px-16 py-6 text-[44px] font-bold leading-[1.15]" style={{ backgroundColor: colors.textPrimary, color: colors.bgPrimary, borderRadius: RADII.pill, boxShadow: SHADOWS.dark.e3 }}>{cta}</div>
    </div>
  );
};
