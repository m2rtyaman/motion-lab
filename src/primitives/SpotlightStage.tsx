import type { FC, ReactNode } from 'react';
import { LIGHTING, PALETTE } from '../core/tokens';
import type { ThemeConfig } from '../core/theme-contract';

export interface SpotlightStageProps {
  children: ReactNode;
  aspect?: '9:16' | '16:9';
  theme?: ThemeConfig;
  background?: string;
  hudTagLeft?: string;
  hudTagRight?: string;
  hudFooterLeft?: string;
  hudFooterRight?: string;
  hudStatusColor?: 'emerald' | 'red' | 'amber' | 'zinc';
  showCrosshairs?: boolean;
  clean?: boolean;
  className?: string;
}

const STATUS_DOT_COLOR: Record<NonNullable<SpotlightStageProps['hudStatusColor']>, string> = {
  emerald: 'bg-[#10b981]',
  red: 'bg-[#ef4444]',
  amber: 'bg-[#f59e0b]',
  zinc: 'bg-zinc-400',
};

/**
 * SpotlightStage — Sinematik Sahne Zemini
 * Temiz, modern ve şık sahne tuvali.
 * Varsayılan olarak clean=true ve showCrosshairs=false ile karmaşadan arındırılmıştır.
 */
export const SpotlightStage: FC<SpotlightStageProps> = ({
  children,
  aspect = '9:16',
  theme,
  background,
  hudTagLeft,
  hudTagRight,
  hudFooterLeft,
  hudFooterRight,
  hudStatusColor = 'emerald',
  showCrosshairs = false,
  clean = true,
  className = '',
}) => {
  const isVertical = aspect === '9:16';

  const bgColor = background ?? theme?.colors.bgPrimary ?? PALETTE.bgBase;
  const textColor = theme?.colors.textPrimary ?? '#fafafa';
  const bgImage = background
    ? undefined
    : theme?.surfaceMode === 'light'
      ? 'radial-gradient(ellipse 90% 80% at 50% 20%, rgba(241,245,249,0.9) 0%, rgba(226,232,240,0.6) 100%)'
      : LIGHTING.stageRadialVignette;

  return (
    <div
      className={`relative ${
        isVertical ? 'w-[1080px] h-[1920px]' : 'w-[1920px] h-[1080px]'
      } select-none overflow-hidden font-sans ${className}`}
      style={{
        backgroundColor: bgColor,
        backgroundImage: bgImage,
        color: textColor,
      }}
    >
      {/* 1. 35MM SABİT TOHUMLU FİLM GRAIN KATMANI (%2.5 Opaklık) */}
      <svg
        className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.025] z-50"
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

      {/* 2. RADYAL MASKELİ MİMARİ PERSPEKTİF IZGARASI (Yalnızca !clean modunda opsiyonel) */}
      {!clean && (
        <div
          className="stage-grid-layer pointer-events-none absolute inset-0 opacity-25 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:64px_64px]"
          style={{
            WebkitMaskImage: LIGHTING.gridRadialMask,
            maskImage: LIGHTING.gridRadialMask,
          }}
        />
      )}

      {/* 3. OPSİYONEL HUD KATMANI (Yalnızca açıkça istendiğinde) */}
      {!clean && showCrosshairs && (hudTagLeft || hudTagRight || hudFooterLeft || hudFooterRight) && isVertical && (
        <div className="stage-hud-layer pointer-events-none absolute inset-x-14 top-[250px] bottom-[300px] z-30 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-3">
              {hudTagLeft && (
                <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08]">
                  <span
                    className={`hud-live-dot w-2 h-2 rounded-full ${STATUS_DOT_COLOR[hudStatusColor]}`}
                  />
                  <span className="text-[18px] font-mono font-semibold uppercase tracking-[0.14em] text-zinc-300">
                    {hudTagLeft}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {hudTagRight && (
                <span className="text-[18px] font-mono uppercase tracking-[0.14em] text-zinc-400 px-3 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.06]">
                  {hudTagRight}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-3">
              {hudFooterLeft && (
                <span className="text-[18px] font-mono uppercase tracking-[0.14em] text-zinc-400">
                  {hudFooterLeft}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {hudFooterRight && (
                <span className="text-[18px] font-mono uppercase tracking-[0.14em] text-zinc-500">
                  {hudFooterRight}
                </span>
              )}
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
