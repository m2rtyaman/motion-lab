import type { FC } from 'react';

export type KineticHighlightTone = 'emerald' | 'red' | 'amber' | 'pill';

export interface KineticTextProps {
  text: string;
  /** Target class name for GSAP animateWordBurst (e.g. "b1-word") */
  wordClassName: string;
  /** Broadcast typography scale preset */
  variant?: 'hero' | 'dialogue' | 'title' | 'subtitle';
  /** Optional map of clean word (lowercase, stripped of punctuation) to highlight style */
  highlights?: Record<string, KineticHighlightTone>;
  /** Wrap text in quotes automatically */
  quoted?: boolean;
  className?: string;
}

const VARIANT_CLASSES: Record<NonNullable<KineticTextProps['variant']>, string> = {
  hero: 'text-[72px] font-black tracking-[-0.04em] leading-[1.06]',
  dialogue: 'text-[58px] font-extrabold tracking-[-0.035em] leading-[1.14]',
  title: 'text-[46px] font-bold tracking-[-0.03em] leading-[1.16]',
  subtitle: 'text-[32px] font-semibold tracking-[-0.02em] leading-[1.25]',
};

const HIGHLIGHT_CLASSES: Record<KineticHighlightTone, string> = {
  emerald: 'text-[#10b981]',
  red: 'text-[#ef4444]',
  amber: 'text-[#f59e0b]',
  pill: 'px-3.5 py-0.5 rounded-xl bg-white/[0.09] border border-white/[0.18] text-white',
};

/**
 * KineticText — Kelime Bazlı Maskeli & Yay Fiziği Tipografi Motoru
 * Cümleleri tek bir kalıp olmaktan çıkarır; her kelimeyi bağımsız bir kinetik aktöre dönüştürür.
 */
export const KineticText: FC<KineticTextProps> = ({
  text,
  wordClassName,
  variant = 'dialogue',
  highlights = {},
  quoted = false,
  className = '',
}) => {
  const cleanText = text.trim();
  const rawWords = cleanText.split(/\s+/);

  const words = quoted
    ? rawWords.map((w, idx) => {
        let out = w;
        if (idx === 0 && !out.startsWith('"') && !out.startsWith('“')) out = `“${out}`;
        if (idx === rawWords.length - 1 && !out.endsWith('"') && !out.endsWith('”')) out = `${out}”`;
        return out;
      })
    : rawWords;

  return (
    <div
      className={`flex flex-wrap items-baseline gap-x-[0.26em] gap-y-[0.12em] ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {words.map((word, index) => {
        const lookupKey = word
          .toLowerCase()
          .replace(/[“”"'.,!?:;()]/g, '')
          .trim();
        const highlightTone = highlights[lookupKey];
        const toneClass = highlightTone ? HIGHLIGHT_CLASSES[highlightTone] : 'text-[#fafafa]';

        return (
          <span
            key={`${word}-${index}`}
            className="inline-block overflow-visible py-[0.04em]"
          >
            <span
              className={`${wordClassName} inline-block will-change-transform ${toneClass}`}
            >
              {word}
            </span>
          </span>
        );
      })}
    </div>
  );
};
