import type { FC, ReactNode } from 'react';
import { LIGHTING, PALETTE } from '../core/tokens';

export interface SpotlightStageProps {
  children: ReactNode;
  aspect?: '9:16' | '16:9';
  hudTagLeft?: string;
  hudTagRight?: string;
  hudFooterLeft?: string;
  hudFooterRight?: string;
  hudStatusColor?: 'emerald' | 'red' | 'amber' | 'zinc';
  showCrosshairs?: boolean;
  clean?: boolean;
}

const STATUS_DOT_COLOR: Record<NonNullable<SpotlightStageProps['hudStatusColor']>, string> = {
  emerald: 'bg-[#10b981]',
  red: 'bg-[#ef4444]',
  amber: 'bg-[#f59e0b]',
  zinc: 'bg-zinc-400',
};

/**
 * SpotlightStage — Sinematik Sahne Zemini
 * Kör siyah boşluğu ortadan kaldırır; mercek vinyeti ve opsiyonel yayın HUD/vizör katmanı sunar.
 */
export const SpotlightStage: FC<SpotlightStageProps> = ({
  children,
  aspect = '9:16',
  hudTagLeft,
  hudTagRight,
  hudFooterLeft,
  hudFooterRight,
  hudStatusColor = 'emerald',
  showCrosshairs = true,
  clean = false,
}) => {
  const isVertical = aspect === '9:16';

  return (
    <div
      className={`relative ${
        isVertical ? 'w-[1080px] h-[1920px]' : 'w-[1920px] h-[1080px]'
      } text-[#fafafa] select-none overflow-hidden font-sans`}
      style={{
        backgroundColor: PALETTE.bgBase,
        backgroundImage: LIGHTING.stageRadialVignette,
      }}
    >
      {/* 1. 35MM SABİT TOHUMLU FİLM GRAIN KATMANI (%3 Opaklık) */}
      <svg
        className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.03] z-50"
        viewBox={isVertical ? '0 0 1080 1920' : '0 0 1920 1080'}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="opusStageGrain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.78"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect
          width={isVertical ? '1080' : '1920'}
          height={isVertical ? '1920' : '1080'}
          fill="#ffffff"
          filter="url(#opusStageGrain)"
        />
      </svg>

      {/* 2. RADYAL MASKELİ 64PX MİMARİ PERSPEKTİF IZGARASI (Clean modda gizlenir) */}
      {!clean && (
        <div
          className="stage-grid-layer pointer-events-none absolute inset-0 opacity-35 bg-[linear-gradient(to_right,rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:64px_64px]"
          style={{
            WebkitMaskImage: LIGHTING.gridRadialMask,
            maskImage: LIGHTING.gridRadialMask,
          }}
        />
      )}

      {/* 3. 9:16 GÜVENLİ ALAN VİZÖR İŞARETLERİ (HUD & Crosshairs) */}
      {!clean && showCrosshairs && isVertical && (
        <div className="stage-hud-layer pointer-events-none absolute inset-x-14 top-[250px] bottom-[300px] z-30 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/[0.07] pb-5">
            <div className="flex items-center gap-3.5">
              <span className="text-zinc-500 font-mono text-[20px] leading-none">+</span>
              {hudTagLeft && (
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[#16161b]/90 border border-white/[0.1]">
                  <span
                    className={`hud-live-dot w-2.5 h-2.5 rounded-full ${STATUS_DOT_COLOR[hudStatusColor]}`}
                  />
                  <span className="text-[18px] font-mono font-semibold uppercase tracking-[0.16em] text-zinc-200">
                    {hudTagLeft}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3.5">
              {hudTagRight && (
                <span className="text-[18px] font-mono uppercase tracking-[0.14em] text-zinc-400 px-3.5 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.07]">
                  {hudTagRight}
                </span>
              )}
              <span className="text-zinc-500 font-mono text-[20px] leading-none">+</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/[0.07] pt-5">
            <div className="flex items-center gap-3">
              <span className="text-zinc-500 font-mono text-[20px] leading-none">+</span>
              {hudFooterLeft && (
                <span className="text-[18px] font-mono uppercase tracking-[0.16em] text-zinc-400">
                  {hudFooterLeft}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {hudFooterRight && (
                <span className="text-[18px] font-mono uppercase tracking-[0.16em] text-zinc-500">
                  {hudFooterRight}
                </span>
              )}
              <span className="text-zinc-500 font-mono text-[20px] leading-none">+</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. AKTİF SAHNE İÇERİĞİ */}
      <div
        className={`relative z-20 w-full h-full flex flex-col justify-center items-center ${
          clean ? 'p-0' : isVertical ? 'pt-[310px] pb-[360px] px-14' : 'p-20'
        }`}
      >
        {children}
      </div>
    </div>
  );
};
