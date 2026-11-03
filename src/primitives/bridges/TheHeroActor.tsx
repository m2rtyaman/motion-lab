import type { FC, ReactNode, CSSProperties } from 'react';

export interface TheHeroActorProps {
  id?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * TheHeroActor: Kesintisiz Hero Nesne Sürekliliği (Continuous Hero Actor Law).
 * 0. kareden son kareye kadar sahnede kalır (opacity > 0).
 * Sahneler arası beat geçişlerinde (Bento -> Kinetik Tipografi -> Terminal -> CTA)
 * hızla form, boyut, sınır ve renk değiştirerek yeni sahnenin ana nesnesine dönüşür.
 */
export const TheHeroActor: FC<TheHeroActorProps> = ({
  id = 'the-hero-actor',
  className = '',
  style,
  children,
}) => {
  return (
    <div
      id={id}
      className={`the-hero-actor relative z-20 flex items-center justify-center transition-none ${className}`}
      style={{
        willChange: 'transform, width, height, border-radius, background-color',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
