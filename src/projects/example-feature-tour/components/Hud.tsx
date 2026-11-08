import { type FC } from 'react';
import type { ThemeConfig } from '../../../core/theme-contract';
import { RADII } from '../../../core/tokens';

export interface CaptionProps { theme: ThemeConfig; step: number; text: string; className?: string }

/** Feature caption pill: accent number badge and a 36px label on an inverted surface. */
export const Caption: FC<CaptionProps> = ({ theme, step, text, className = '' }) => (
  <div className={`flex items-center gap-5 py-3 pl-3 pr-8 ${className}`} style={{ backgroundColor: theme.colors.textPrimary, color: theme.colors.bgPrimary, borderRadius: RADII.pill }}>
    <div className="flex h-[56px] w-[56px] items-center justify-center rounded-full text-[28px] font-black" style={{ backgroundColor: theme.colors.accentPrimary, color: theme.colors.textPrimary }}>{step}</div>
    <div className="text-[36px] font-bold leading-[1.15] tracking-[-0.02em]">{text}</div>
  </div>
);

export interface TitleProps { words: string[]; theme: ThemeConfig; className?: string }

/** Headline strap (TYPE_SCALE 16:9 headline, 72px); one `title-word` span per word; target it through the parent class. */
export const Title: FC<TitleProps> = ({ words, theme, className = '' }) => (
  <h1 className={`flex gap-x-5 text-[72px] font-extrabold leading-[1.08] tracking-[-0.03em] ${className}`} style={{ color: theme.colors.textPrimary }}>
    {words.map((w) => <span key={w} className="title-word inline-block">{w}</span>)}
  </h1>
);
