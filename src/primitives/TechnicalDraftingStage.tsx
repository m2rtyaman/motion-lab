import React from 'react';
import { useCurrentFrame } from 'remotion';

export type DraftingGridTheme =
  | 'dark-slate'
  | 'acid-dark'
  | 'drafting-paper'
  | 'clean-white';

export interface TechnicalDraftingStageProps {
  /** Geçerli bölüm indeksi (Örn: 1) */
  sectionIndex?: number;
  /** Toplam bölüm sayısı (Örn: 4 veya 6) */
  sectionTotal?: number;
  /** Bölüm kategorisi / etiketi (Örn: "01 / AN IDEA THAT...") */
  sectionTag?: string;
  /** Ana başlık (Headline) */
  headline?: string;
  /** Açıklama / alt manifesto metni */
  subheadline?: string;
  /** Köşede parlayan tempo rozeti (Örn: "144 BPM") */
  bpm?: number;
  /** Senkronizasyon rozet metni (Örn: "FRAME-PERFECT") */
  badgeText?: string;
  /** Grid renk ve kontrast teması */
  gridTheme?: DraftingGridTheme;
  /** Segmentli ilerleme cetvelini göster/gizle */
  showRuler?: boolean;
  /** Sahte telemetrileri (FR, LAT) göster/gizle (Varsayılan: false) */
  showTelemetries?: boolean;
  /** BPM rozetini göster/gizle (Varsayılan: false) */
  showBpm?: boolean;
  /** Köşe artı işaretlerini göster/gizle (Varsayılan: false) */
  showGridCorners?: boolean;
  /** Konteyner CSS sınıfı */
  className?: string;
  /** İçerik veya çocuk bileşenler */
  children?: React.ReactNode;
}

export const TechnicalDraftingStage: React.FC<TechnicalDraftingStageProps> = ({
  sectionIndex = 1,
  sectionTotal = 4,
  sectionTag,
  headline = 'MAKE IT LOUD.',
  subheadline = 'ZERO BORING FRAMES. SOUND / LIGHT / DEPTH.',
  bpm = 144,
  badgeText = 'FRAME-PERFECT',
  gridTheme = 'acid-dark',
  showRuler = false,
  showTelemetries = false,
  showBpm = false,
  showGridCorners = false,
  className = 'w-full h-full relative overflow-hidden flex flex-col justify-between p-12 pointer-events-none',
  children,
}) => {
  const frame = useCurrentFrame();

  // Temaya göre renk eşlemeleri
  const themeStyles = React.useMemo(() => {
    switch (gridTheme) {
      case 'drafting-paper':
        return {
          textColor: 'text-[#0f1115]',
          mutedColor: 'text-[#4a4f58]',
          accentColor: 'text-[#dc2626]',
          badgeBorder: 'border-[#0f1115]',
          badgeBg: 'bg-[#0f1115] text-[#d6d9ce]',
          gridLine: 'rgba(15, 17, 21, 0.08)',
          crossColor: 'rgba(15, 17, 21, 0.35)',
        };
      case 'clean-white':
        return {
          textColor: 'text-slate-900',
          mutedColor: 'text-slate-500',
          accentColor: 'text-blue-600',
          badgeBorder: 'border-slate-900',
          badgeBg: 'bg-slate-900 text-white',
          gridLine: 'rgba(15, 23, 42, 0.06)',
          crossColor: 'rgba(15, 23, 42, 0.25)',
        };
      case 'dark-slate':
        return {
          textColor: 'text-white',
          mutedColor: 'text-zinc-400',
          accentColor: 'text-sky-400',
          badgeBorder: 'border-white/20',
          badgeBg: 'bg-white/10 text-white',
          gridLine: 'rgba(255, 255, 255, 0.05)',
          crossColor: 'rgba(255, 255, 255, 0.25)',
        };
      case 'acid-dark':
      default:
        return {
          textColor: 'text-white',
          mutedColor: 'text-zinc-400',
          accentColor: 'text-[#c4ff00]',
          badgeBorder: 'border-[#c4ff00]/40',
          badgeBg: 'bg-[#c4ff00] text-black',
          gridLine: 'rgba(196, 255, 0, 0.07)',
          crossColor: 'rgba(196, 255, 0, 0.45)',
        };
    }
  }, [gridTheme]);

  // Sayı formatlayıcı: 01, 02 vb.
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className={className}>
      {/* 1. MİLİMETRİK ESKİZ VE ARTI GRID KATMANI (SVG) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="drafting-grid"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 80 0 L 0 0 0 80"
              fill="none"
              stroke={themeStyles.gridLine}
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#drafting-grid)" />

        {/* 4 Köşe ve Merkez Artı İşaretleri (+) - Yalnızca istendiğinde */}
        {showGridCorners && (
          <g stroke={themeStyles.crossColor} strokeWidth="1.5">
            <path d="M 48 38 L 48 58 M 38 48 L 58 48" />
            <path d="M 1872 38 L 1872 58 M 1862 48 L 1882 48" />
            <path d="M 48 1022 L 48 1042 M 38 1032 L 58 1032" />
            <path d="M 1872 1022 L 1872 1042 M 1862 1032 L 1882 1032" />
            <path d="M 960 530 L 960 550 M 950 540 L 970 540" />
          </g>
        )}
      </svg>

      {/* 2. ÜST BİLGİ BARI (Yalnızca sectionTag veya telemetriler istendiğinde) */}
      {(sectionTag || showTelemetries || showBpm) && (
        <div className="relative z-20 flex items-center justify-between w-full font-mono text-[19px] uppercase tracking-wider">
          {sectionTag && (
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 font-bold rounded-sm ${themeStyles.badgeBg}`}>
                {pad(sectionIndex)} - {pad(sectionTotal)}
              </span>
              <span className={`font-semibold ${themeStyles.textColor}`}>
                {sectionTag}
              </span>
            </div>
          )}

          {showTelemetries && (
            <div className={`hidden md:flex items-center space-x-6 text-[18px] ${themeStyles.mutedColor}`}>
              <span>FR: {pad(frame)}</span>
              <span>16:9 60FPS</span>
            </div>
          )}

          {showBpm && (
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 border text-[18px] font-bold rounded-sm ${themeStyles.badgeBorder} ${themeStyles.accentColor}`}>
                {bpm} BPM
              </span>
              <span className={`px-3 py-1 border text-[18px] font-bold rounded-sm ${themeStyles.badgeBorder} ${themeStyles.textColor}`}>
                {badgeText}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 3. ORTA ALAN (İÇERİK VEYA BAŞLIKLAR) */}
      <div className="relative z-10 my-auto flex flex-col justify-center">
        {children ? (
          children
        ) : (
          <div className="max-w-4xl space-y-4">
            <h1 className={`text-6xl md:text-7xl font-black tracking-tight leading-none uppercase ${themeStyles.textColor}`}>
              {headline}
            </h1>
            <p className={`text-xl md:text-2xl font-mono uppercase tracking-wide ${themeStyles.mutedColor}`}>
              {subheadline}
            </p>
          </div>
        )}
      </div>

      {/* 4. ALT İLERLEME CETVELİ (Opsiyonel) */}
      {showRuler && (
        <div className="relative z-20 flex items-end justify-between w-full font-mono text-[18px] uppercase">
          <div className="flex items-center space-x-2">
            {Array.from({ length: sectionTotal }).map((_, idx) => {
              const isActive = idx + 1 === sectionIndex;
              const isPast = idx + 1 < sectionIndex;
              return (
                <div key={idx} className="flex items-center space-x-1.5">
                  <div
                    className={`h-2 transition-all duration-300 rounded-xs ${
                      isActive
                        ? `w-14 ${gridTheme === 'acid-dark' ? 'bg-[#c4ff00]' : 'bg-slate-900'}`
                        : isPast
                        ? 'w-7 bg-slate-500 opacity-60'
                        : 'w-7 bg-slate-400 opacity-25'
                    }`}
                  />
                  {idx < sectionTotal - 1 && (
                    <span className={themeStyles.mutedColor}>+</span>
                  )}
                </div>
              );
            })}
            <span className={`ml-3 font-bold ${themeStyles.textColor}`}>
              {pad(sectionIndex)}/{pad(sectionTotal)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
