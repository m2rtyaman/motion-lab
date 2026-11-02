import { type CSSProperties, type FC } from 'react';
import type { ThemeConfig } from '../engine/theme-contract';

export type BackdropVariant = 'mesh' | 'grid' | 'rings' | 'rays';

export interface BackdropFieldProps {
  theme: ThemeConfig;
  variant?: BackdropVariant;
  /** 0-1: dekor yoğunluğu. İçeriği ezmemek için düşük tut. */
  intensity?: number;
  /** GSAP ile kaydırılabilsin diye sınıf eklenir (ör. 'b1-backdrop'). */
  className?: string;
}

/**
 * BackdropField - Tema duyarlı, düz zemini kıran katmanlı arka plan.
 * Yalnızca statik gradient/çizgi çizer; hareket GSAP'tan (transform/opacity) gelir.
 * Renkler tema kontratından okunur: koyu/açık/sıcak her temada çalışır. Neon yok.
 */
export const BackdropField: FC<BackdropFieldProps> = ({ theme, variant = 'mesh', intensity = 0.5, className = '' }) => {
  const { accentPrimary, accentSecondary, borderSubtle } = theme.colors;
  const a = Math.round(intensity * 38).toString(16).padStart(2, '0');
  const b = Math.round(intensity * 24).toString(16).padStart(2, '0');

  const base: CSSProperties = { position: 'absolute', inset: '-12%', pointerEvents: 'none' };
  let style: CSSProperties;

  if (variant === 'grid') {
    style = {
      ...base,
      backgroundImage: `linear-gradient(${borderSubtle} 1px, transparent 1px), linear-gradient(90deg, ${borderSubtle} 1px, transparent 1px)`,
      backgroundSize: '96px 96px',
    };
  } else if (variant === 'rings') {
    style = {
      ...base,
      backgroundImage: `repeating-radial-gradient(circle at 70% 50%, transparent 0 118px, ${borderSubtle} 118px 120px)`,
    };
  } else if (variant === 'rays') {
    style = {
      ...base,
      backgroundImage: `conic-gradient(from 200deg at 78% 18%, ${accentPrimary}${a}, transparent 22%, ${accentSecondary}${b} 40%, transparent 62%)`,
    };
  } else {
    style = {
      ...base,
      backgroundImage: `radial-gradient(52% 46% at 18% 22%, ${accentPrimary}${a}, transparent 70%), radial-gradient(44% 40% at 82% 78%, ${accentSecondary}${b}, transparent 70%)`,
    };
  }

  return <div className={`backdrop-field ${className}`} style={style} aria-hidden />;
};
