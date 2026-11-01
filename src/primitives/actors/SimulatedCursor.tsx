import type { FC } from 'react';

export interface SimulatedCursorProps {
  /** X koordinatı (px veya % olarak stil ile de yönetilebilir) */
  x?: number;
  /** Y koordinatı (px veya % olarak stil ile de yönetilebilir) */
  y?: number;
  /** İmleç rengi (varsayılan: koyu gövdeli beyaz kontur) */
  color?: string;
  /** Tıklama dalgası rengi */
  rippleColor?: string;
  /** Çoklu kullanıcı / multiplayer SaaS senaryoları için isim etiketi */
  label?: string;
  /** GSAP ile animasyon hedefi olacak sınıf adı (varsayılan: 'simulated-cursor') */
  cursorClassName?: string;
  /** GSAP ile tıklama dalgası hedefi olacak sınıf adı (varsayılan: 'cursor-ripple') */
  rippleClassName?: string;
  className?: string;
}

/**
 * SIMULATED CURSOR (v5)
 *
 * Gerçekçi fare imleci ve tıklama dalgası (click ripple) aktörü.
 * 3D uzamsal kamera dönüşümlerinde koordinat kayması yaşamaması için
 * <SpatialCamera> bileşeninin cursorSlot yuvasına monte edilir.
 * GSAP ile x, y, scale ve .cursor-ripple dönüşümleri pürüzsüzce kontrol edilir.
 */
export const SimulatedCursor: FC<SimulatedCursorProps> = ({
  x = 0,
  y = 0,
  color = '#0f172a',
  rippleColor = 'rgba(37, 99, 235, 0.4)',
  label,
  cursorClassName = 'simulated-cursor',
  rippleClassName = 'cursor-ripple',
  className = '',
}) => {
  return (
    <div
      className={`${cursorClassName} absolute pointer-events-none select-none z-50 ${className}`}
      style={{
        left: 0,
        top: 0,
        transform: `translate3d(${x}px, ${y}px, 0)`,
        willChange: 'transform',
      }}
    >
      {/* 1. TIKLAMA DALGASI (RIPPLE EFFECT - GSAP İLE SCALE & OPACITY EDİLİR) */}
      <div
        className={`${rippleClassName} absolute -top-4 -left-4 w-11 h-11 rounded-full pointer-events-none opacity-0`}
        style={{
          backgroundColor: rippleColor,
          transform: 'scale(0.4)',
          willChange: 'transform, opacity',
        }}
      />

      {/* 2. VEKTÖREL FARE İMLECİ (MACOS / FIGMA STİLİ SVG) */}
      <svg
        className="w-7 h-7 drop-shadow-md"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 3L10.5 21L13.5 13.5L21 10.5L3 3Z"
          fill={color}
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>

      {/* 3. MULTIPLAYER KULLANICI ETİKETİ (İSTEĞE BAĞLI) */}
      {label && (
        <div
          className="absolute left-6 top-5 px-2.5 py-1 rounded-md text-[16px] font-bold text-white shadow-sm whitespace-nowrap"
          style={{ backgroundColor: color }}
        >
          {label}
        </div>
      )}
    </div>
  );
};
