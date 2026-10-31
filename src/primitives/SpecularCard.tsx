import type { FC, ReactNode } from 'react';

export type CardAccentTone = 'neutral' | 'emerald' | 'red' | 'amber' | 'white';

export interface SpecularCardProps {
  children: ReactNode;
  /** GSAP selector class for surface animations */
  cardClassName?: string;
  /** Visual depth state */
  tone?: 'active' | 'muted';
  /** Left vertical indicator bar color */
  accent?: CardAccentTone;
  /** Show industrial corner micro-brackets */
  cornerTicks?: boolean;
  className?: string;
}

const ACCENT_BAR_COLORS: Record<CardAccentTone, string> = {
  neutral: 'bg-zinc-600/60',
  emerald: 'bg-[#10b981]',
  red: 'bg-[#ef4444]',
  amber: 'bg-[#f59e0b]',
  white: 'bg-zinc-100',
};

/**
 * SpecularCard — Yüksek Kontrastlı Koyu Cam Konteyner
 * Düz gri kutular yerine; 1px üst specular ışık kırılması, köşe vizör çentikleri
 * ve sol anlamsal durum omurgasıyla Apple/Linear yüzey kalitesi sunar.
 */
export const SpecularCard: FC<SpecularCardProps> = ({
  children,
  cardClassName = '',
  tone = 'active',
  accent = 'neutral',
  cornerTicks = true,
  className = '',
}) => {
  const surfaceClass =
    tone === 'active'
      ? 'editorial-glass-active border-white/[0.18]'
      : 'editorial-glass-muted border-white/[0.08]';

  return (
    <article
      className={`${cardClassName} relative w-full max-w-[940px] rounded-2xl border p-10 overflow-hidden will-change-transform ${surfaceClass} ${className}`}
    >
      {/* 1. Üst Kenar 1px Kristal Specular Işık Kırılması */}
      <div className="specular-rim-top pointer-events-none absolute inset-x-0 top-0 h-[1.5px]" />

      {/* 2. Sol Dikey Durum Omurgası (Accent Spine) */}
      <div
        className={`pointer-events-none absolute left-0 top-7 bottom-7 w-[4px] rounded-r-full ${ACCENT_BAR_COLORS[accent]}`}
      />

      {/* 3. Endüstriyel Köşe Çentikleri (Corner Reticle Ticks) */}
      {cornerTicks && (
        <>
          <span className="pointer-events-none absolute top-3 left-3 w-2.5 h-2.5 border-t border-l border-white/25" />
          <span className="pointer-events-none absolute top-3 right-3 w-2.5 h-2.5 border-t border-r border-white/25" />
          <span className="pointer-events-none absolute bottom-3 left-3 w-2.5 h-2.5 border-b border-l border-white/20" />
          <span className="pointer-events-none absolute bottom-3 right-3 w-2.5 h-2.5 border-b border-r border-white/20" />
        </>
      )}

      {/* 4. Kart İçeriği */}
      <div className="relative z-10">{children}</div>
    </article>
  );
};
