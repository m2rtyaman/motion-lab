import { type FC } from 'react';

export interface HeadlineProps { words: string[]; className?: string }

/** Display headline (TYPE_SCALE 9:16 display, 120px): one span per word so `enter(..., 'words')` can stagger it. */
export const Headline: FC<HeadlineProps> = ({ words, className = '' }) => (
  <h1 className={`flex flex-wrap justify-center gap-x-8 text-[120px] font-black leading-[1.04] tracking-[-0.04em] ${className}`}>
    {words.map((w) => <span key={w} className="headline-word inline-block">{w}</span>)}
  </h1>
);
