import type { FC, ReactNode } from 'react';
import type { ThemeConfig } from '../../engine';
import { LIGHT_SAAS_THEME } from '../../engine';

export interface MapPin {
  id: string;
  /** Yüzdelik koordinat (0-100) */
  x: number;
  /** Yüzdelik koordinat (0-100) */
  y: number;
  label?: string;
  badge?: string | number;
  color?: string;
  active?: boolean;
}

export interface MapRoutePoint {
  x: number;
  y: number;
}

export interface InteractiveMapProps {
  theme?: ThemeConfig;
  pins?: MapPin[];
  route?: MapRoutePoint[];
  routeProgress?: number; // 0 to 1
  topBarSlot?: ReactNode;
  floatingCardSlot?: ReactNode;
  className?: string;
}

/**
 * INTERACTIVE MAP (v5)
 *
 * Gerçekçi vektörel harita modülü.
 * Şehir ızgarası, kıyı çizgisi, animasyonlu pinler ve saha rota hattı içerir.
 * Tamamen prop-driven ve deterministiktir; veri kodun içine gömülmez.
 */
export const InteractiveMap: FC<InteractiveMapProps> = ({
  theme = LIGHT_SAAS_THEME,
  pins = [],
  route = [],
  routeProgress = 1,
  topBarSlot,
  floatingCardSlot,
  className = '',
}) => {
  const isLight = theme.surfaceMode === 'light';

  // Harita su / kara renkleri
  const waterColor = isLight ? '#e2e8f0' : '#1e293b';
  const landColor = isLight ? '#f8fafc' : '#0f172a';
  const roadColor = isLight ? '#cbd5e1' : '#334155';
  const majorRoadColor = isLight ? '#94a3b8' : '#475569';

  // Rota SVG Path dizesi üretimi
  const routePathD =
    route.length > 1
      ? route.reduce(
          (acc, pt, idx) =>
            idx === 0 ? `M ${pt.x * 10} ${pt.y * 10}` : `${acc} L ${pt.x * 10} ${pt.y * 10}`,
          ''
        )
      : '';

  return (
    <div
      className={`interactive-map relative w-full h-full overflow-hidden select-none flex flex-col ${className}`}
      style={{
        backgroundColor: landColor,
        borderRadius: theme.geometry.radiusMd,
        border: `1px solid ${theme.colors.borderSubtle}`,
      }}
    >
      {/* 1. ÜST BİLGİ & FİLTRE ÇUBUĞU */}
      {topBarSlot && (
        <div
          className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between px-5 py-3 rounded-xl shadow-md"
          style={{
            backgroundColor: theme.colors.bgSurface,
            border: `1px solid ${theme.colors.borderSubtle}`,
          }}
        >
          {topBarSlot}
        </div>
      )}

      {/* 2. VEKTÖREL HARİTA ÇİZİMİ (SVG CANVAS) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <svg
          viewBox="0 0 1000 600"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Su Kütlesi (Deniz / Körfez) */}
          <path
            d="M 0 0 L 260 0 C 240 160, 220 300, 140 420 C 100 480, 50 540, 0 600 Z"
            fill={waterColor}
            opacity="0.9"
          />

          {/* Sahil Şeridi Çizgisi */}
          <path
            d="M 260 0 C 240 160, 220 300, 140 420 C 100 480, 50 540, 0 600"
            fill="none"
            stroke={majorRoadColor}
            strokeWidth="3"
            opacity="0.4"
          />

          {/* İkincil Yol Izgarası (Sokaklar) */}
          <g stroke={roadColor} strokeWidth="1.2" opacity="0.45">
            <line x1="280" y1="120" x2="880" y2="100" />
            <line x1="300" y1="200" x2="920" y2="180" />
            <line x1="260" y1="290" x2="900" y2="280" />
            <line x1="200" y1="380" x2="850" y2="390" />
            <line x1="160" y1="470" x2="800" y2="490" />

            <line x1="360" y1="60" x2="330" y2="540" />
            <line x1="480" y1="50" x2="450" y2="550" />
            <line x1="600" y1="40" x2="580" y2="560" />
            <line x1="720" y1="40" x2="710" y2="560" />
            <line x1="840" y1="40" x2="830" y2="550" />
          </g>

          {/* Ana Bulvarlar / Otoyollar */}
          <g stroke={majorRoadColor} strokeWidth="2.8" opacity="0.6">
            <path d="M 270 50 C 350 180, 420 320, 490 560" fill="none" />
            <path d="M 250 250 C 500 230, 750 300, 960 270" fill="none" />
            <path d="M 320 440 C 520 410, 700 460, 920 430" fill="none" />
          </g>

          {/* Şehir Parkı Alanı */}
          <polygon
            points="380,260 460,240 480,340 390,350"
            fill={theme.colors.statusSuccess}
            opacity="0.12"
          />

          {/* ANİMASYONLU ROTA ÇİZGİSİ */}
          {routePathD && (
            <path
              d={routePathD}
              fill="none"
              stroke={theme.colors.accentPrimary}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="8 6"
              opacity={routeProgress}
            />
          )}
        </svg>

        {/* 3. DİNAMİK HARİTA PİNLERİ */}
        {pins.map((pin) => {
          const pinColor = pin.color || (pin.active ? theme.colors.accentPrimary : theme.colors.statusSuccess);

          return (
            <div
              key={pin.id}
              className={`map-pin absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer transition-transform duration-300 ${
                pin.active ? 'scale-110 z-20' : 'z-10'
              }`}
              style={{
                left: `${pin.x}%`,
                top: `${pin.y}%`,
              }}
            >
              {/* Dalga / Radar Efekti */}
              {pin.active && (
                <div
                  className="absolute w-12 h-12 rounded-full animate-ping opacity-35"
                  style={{ backgroundColor: pinColor }}
                />
              )}

              {/* Pin Rozeti */}
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-lg font-bold text-[16px] border"
                style={{
                  backgroundColor: pinColor,
                  color: '#ffffff',
                  borderColor: isLight ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.4)',
                }}
              >
                {pin.badge && <span>{pin.badge}</span>}
                {pin.label && <span className="font-medium text-[16px]">{pin.label}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. SAĞ ALT YÜZEN KART (FLOATING CARD SLOT) */}
      {floatingCardSlot && (
        <div className="absolute bottom-6 right-6 z-20 max-w-[420px]">
          {floatingCardSlot}
        </div>
      )}
    </div>
  );
};
