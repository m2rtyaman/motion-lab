import type { FC } from 'react';
import { KineticText, type KineticHighlightTone } from '../primitives/KineticText';
import { VectorDraw } from '../primitives/VectorDraw';

export interface HeroStatementProps {
  containerClassName: string;
  wordClassName: string;
  kickerText: string;
  headline: string;
  subline?: string;
  highlights?: Record<string, KineticHighlightTone>;
  laserStartSec?: number;
  tone?: 'emerald' | 'red' | 'amber' | 'white';
}

/**
 * HeroStatement (S3 + S5 Arketipi)
 * 72px devasa kinetik başlık, üst kategori rozeti ve altında canlı çizilen lazer ayırıcı.
 */
export const HeroStatement: FC<HeroStatementProps> = ({
  containerClassName,
  wordClassName,
  kickerText,
  headline,
  subline,
  highlights,
  laserStartSec = 0.2,
  tone = 'emerald',
}) => {
  return (
    <section
      className={`${containerClassName} relative w-full max-w-[940px] py-8 px-4 flex flex-col gap-6 will-change-transform`}
    >
      <div className="inline-flex items-center gap-3 self-start px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.12]">
        <span className="w-2.5 h-2.5 rounded-full bg-zinc-200" />
        <span className="text-[19px] font-mono font-bold uppercase tracking-[0.18em] text-zinc-300">
          {kickerText}
        </span>
      </div>

      <KineticText
        text={headline}
        wordClassName={wordClassName}
        variant="hero"
        highlights={highlights}
      />

      <VectorDraw
        variant="horizontal-laser"
        startAtSec={laserStartSec}
        durationSec={0.55}
        tone={tone}
      />

      {subline && (
        <p className="text-[28px] font-mono text-zinc-400 tracking-[-0.01em] leading-snug">
          {subline}
        </p>
      )}
    </section>
  );
};
