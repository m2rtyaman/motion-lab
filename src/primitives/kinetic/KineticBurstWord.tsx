import type { FC } from 'react';

export interface KineticBurstWordProps {
  id?: string;
  className?: string;
  text: string;
  letterClassName?: string;
}

export const KineticBurstWord: FC<KineticBurstWordProps> = ({
  id,
  className = '',
  text,
  letterClassName = '',
}) => {
  const letters = Array.from(text);

  const hasCustomFont = /\bfont-(sans|serif|mono|display|syne|cabinet|clash|instrument|playfair|space|geist|outfit|jakarta)\b/.test(
    className
  );
  const defaultFontClass = hasCustomFont ? '' : 'font-display';

  return (
    <div
      id={id}
      className={`inline-flex flex-wrap items-center justify-center overflow-hidden max-w-full ${defaultFontClass} font-black tracking-tighter uppercase select-none ${className}`}
    >
      {letters.map((char, index) => (
        <span
          key={index}
          className={`kinetic-letter inline-block ${letterClassName}`}
          style={{ willChange: 'transform, opacity' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </div>
  );
};
