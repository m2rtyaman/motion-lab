import React, { useMemo } from 'react';
import { SpecularSurface } from '../materials/SpecularSurface';
import { generateSmoothSparkline } from '../procedural/ParametricCurves';
import { AnimatedCounter } from '../motion/AnimatedCounter';
import { useSecondaryMotion } from '../motion/useSecondaryMotion';
import { SpringStaggerGroup } from '../motion/SpringStaggerGroup';

export interface TelemetryBentoCardProps {
  title?: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trendPercentage?: string;
  isPositiveTrend?: boolean;
  historyData?: number[];
  className?: string;
  width?: number | string;
  delayFrames?: number;
}

export const TelemetryBentoCard: React.FC<TelemetryBentoCardProps> = ({
  title = 'Global Ingestion Rate',
  value = 84290,
  prefix = '',
  suffix = ' req/s',
  trendPercentage = '+28.4%',
  isPositiveTrend = true,
  historyData = [42, 54, 48, 65, 58, 72, 85, 92],
  className = '',
  width = 380,
  delayFrames = 0,
}) => {
  const chartWidth = 320;
  const chartHeight = 90;

  const { pathD, areaD, points } = useMemo(() => {
    return generateSmoothSparkline(historyData, chartWidth, chartHeight, 10);
  }, [historyData]);

  const { strokeProgress, spotlightX, microPulse } = useSecondaryMotion({
    settleFrame: delayFrames + 12,
    drawDuration: 35,
  });

  const lastPoint = points[points.length - 1] ?? { x: chartWidth - 10, y: chartHeight / 2 };

  return (
    <SpecularSurface
      preset="frostedDark"
      borderRadius={20}
      spotlightX={spotlightX}
      className={`p-5 select-none ${className}`}
      style={{ width }}
    >
      <SpringStaggerGroup delayFrames={delayFrames} staggerFrames={3}>
        {/* Başlık ve Trend Rozeti */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            {title}
          </span>
          <span
            className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full border ${
              isPositiveTrend
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50'
                : 'bg-rose-950/40 text-rose-400 border-rose-800/50'
            }`}
          >
            {trendPercentage}
          </span>
        </div>

        {/* Metrik Değeri (AnimatedCounter ile akan tabüler sayı) */}
        <div className="mt-2 text-3xl font-bold tracking-tight text-slate-100 flex items-baseline">
          <AnimatedCounter
            endValue={value}
            startFrame={delayFrames + 6}
            prefix={prefix}
            suffix={suffix}
          />
        </div>

        {/* Canlı Çizilen Sparkline Alanı */}
        <div className="mt-3 relative w-full h-[90px] overflow-visible">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            width="100%"
            height={chartHeight}
            className="overflow-visible"
          >
            <defs>
              <linearGradient id="telemetryAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Alan Gradyanı */}
            {areaD && (
              <path
                d={areaD}
                fill="url(#telemetryAreaGrad)"
                opacity={strokeProgress}
              />
            )}

            {/* Bezier Çizgisi (strokeDashoffset ile canlı çizim) */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={100}
                strokeDasharray={100}
                strokeDashoffset={(1 - strokeProgress) * 100}
              />
            )}

            {/* Son Veri Noktası & Nabız Halka Işığı */}
            {strokeProgress > 0.8 && (
              <g transform={`translate(${lastPoint.x}, ${lastPoint.y})`}>
                <circle
                  r={8}
                  fill="#38bdf8"
                  fillOpacity="0.25"
                  style={{ transform: `scale(${microPulse})` }}
                />
                <circle r={3.5} fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
              </g>
            )}
          </svg>
        </div>
      </SpringStaggerGroup>
    </SpecularSurface>
  );
};
