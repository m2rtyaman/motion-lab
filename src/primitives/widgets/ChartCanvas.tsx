import type { FC } from 'react';
import type { ThemeConfig } from '../../engine/theme-contract';
import { LIGHT_SAAS_THEME } from '../../engine/theme-contract';

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface ChartCanvasProps {
  theme?: ThemeConfig;
  title?: string;
  subtitle?: string;
  badge?: string;
  value?: string | number;
  change?: string;
  isPositiveChange?: boolean;
  data: ChartDataPoint[];
  type?: 'area' | 'line' | 'bar';
  progress?: number; // 0 to 1
  height?: number;
  showGrid?: boolean;
  accentColor?: string;
  className?: string;
}

/**
 * CHART CANVAS (Universal Primitive v6.0)
 *
 * Yüksek kontrastlı analitik grafik tuvali (Fintech, SaaS, E-ticaret KPI).
 * Area, Line veya Bar varyantlarını destekler; pürüzsüz SVG bezier eğrileri,
 * gradyan dolgu ve animasyonlu ilerleme (progress / clip) katmanı sunar.
 * %100 prop-driven ve sektör bağımsızdır.
 */
export const ChartCanvas: FC<ChartCanvasProps> = ({
  theme = LIGHT_SAAS_THEME,
  title = 'Performance Metric',
  subtitle,
  badge,
  value,
  change,
  isPositiveChange = true,
  data = [],
  type = 'area',
  progress = 1,
  height = 320,
  showGrid = true,
  accentColor,
  className = '',
}) => {
  const isLight = theme.surfaceMode === 'light';
  const strokeColor = accentColor || theme.colors.accentPrimary;

  const validData = data.length > 0 ? data : [
    { label: '01', value: 20 },
    { label: '02', value: 45 },
    { label: '03', value: 35 },
    { label: '04', value: 80 },
    { label: '05', value: 65 },
    { label: '06', value: 95 },
  ];

  const values = validData.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  // SVG Tuval Ölçüleri
  const svgWidth = 800;
  const svgHeight = 240;
  const paddingX = 40;
  const paddingY = 24;
  const innerWidth = svgWidth - paddingX * 2;
  const innerHeight = svgHeight - paddingY * 2;

  // Koordinat haritalaması
  const points = validData.map((d, i) => {
    const x = paddingX + (i / (validData.length - 1 || 1)) * innerWidth;
    const normY = (d.value - minVal) / range;
    const y = paddingY + (1 - normY) * innerHeight;
    return { x, y, label: d.label, value: d.value };
  });

  // Pürüzsüz Bezier Eğrisi Yolu (Cubic Spline)
  const linePath = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = points[i - 1];
    const cp1x = prev.x + (pt.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (pt.x - prev.x) / 2;
    const cp2y = pt.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pt.x} ${pt.y}`;
  }, '');

  const lastPt = points[points.length - 1];
  const firstPt = points[0];
  const areaPath = `${linePath} L ${lastPt.x} ${svgHeight - paddingY} L ${firstPt.x} ${svgHeight - paddingY} Z`;

  // Aktif tepe noktası (en son nokta)
  const peakPt = lastPt;

  return (
    <div
      className={`chart-canvas relative w-full flex flex-col p-6 rounded-2xl select-none ${className}`}
      style={{
        backgroundColor: theme.colors.bgSurface,
        border: `1px solid ${theme.colors.borderSubtle}`,
        boxShadow: isLight
          ? '0 10px 30px -10px rgba(15, 23, 42, 0.08)'
          : '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* 1. ÜST BAŞLIK VE METRİK BİLGİSİ */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[16px] font-mono font-bold uppercase tracking-wider"
              style={{ color: theme.colors.textGhost }}
            >
              {title}
            </span>
            {badge && (
              <span
                className="px-2 py-0.5 rounded-full text-[16px] font-mono font-bold"
                style={{
                  backgroundColor: strokeColor + '18',
                  color: strokeColor,
                }}
              >
                {badge}
              </span>
            )}
          </div>
          {value !== undefined && (
            <div className="flex items-baseline gap-3">
              <span
                className="text-[36px] font-black font-mono tracking-tight"
                style={{ color: theme.colors.textPrimary }}
              >
                {value}
              </span>
              {change && (
                <span
                  className="text-[16px] font-mono font-bold"
                  style={{
                    color: isPositiveChange
                      ? theme.colors.statusSuccess
                      : theme.colors.statusDanger,
                  }}
                >
                  {change}
                </span>
              )}
            </div>
          )}
          {subtitle && (
            <p className="text-[15px] font-medium" style={{ color: theme.colors.textMuted }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* 2. SVG GRAFİK ALANI */}
      <div className="relative w-full overflow-hidden" style={{ height: `${height}px` }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={`chart-grad-${title.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.35} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
            </linearGradient>
            <clipPath id={`chart-clip-${title.replace(/\s+/g, '-')}`}>
              <rect x="0" y="0" width={svgWidth * Math.max(0.01, progress)} height={svgHeight} />
            </clipPath>
          </defs>

          {/* Yatay Kılavuz Çizgileri */}
          {showGrid && (
            <g stroke={theme.colors.borderSubtle} strokeWidth="1" strokeDasharray="4 4" opacity="0.6">
              <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} />
              <line x1={paddingX} y1={paddingY + innerHeight * 0.33} x2={svgWidth - paddingX} y2={paddingY + innerHeight * 0.33} />
              <line x1={paddingX} y1={paddingY + innerHeight * 0.66} x2={svgWidth - paddingX} y2={paddingY + innerHeight * 0.66} />
              <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} />
            </g>
          )}

          {/* Çizim Katmanı (ClipPath ile animate edilir) */}
          <g clipPath={`url(#chart-clip-${title.replace(/\s+/g, '-')})`}>
            {/* Alan Gradyanı */}
            {type === 'area' && (
              <path
                d={areaPath}
                fill={`url(#chart-grad-${title.replace(/\s+/g, '-')})`}
              />
            )}

            {/* Ana Çizgi */}
            <path
              d={linePath}
              fill="none"
              stroke={strokeColor}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Veri Noktaları */}
            {points.map((pt, idx) => (
              <circle
                key={idx}
                cx={pt.x}
                cy={pt.y}
                r="4"
                fill={theme.colors.bgSurface}
                stroke={strokeColor}
                strokeWidth="2.5"
              />
            ))}
          </g>

          {/* Aktif İlerleme / Tepe Noktası Rozeti */}
          {progress > 0.85 && (
            <g transform={`translate(${peakPt.x}, ${peakPt.y})`}>
              <circle r="6" fill={strokeColor} />
              <circle r="12" fill={strokeColor} opacity="0.25" />
            </g>
          )}
        </svg>

        {/* X Ekseni Etiketleri */}
        <div className="absolute bottom-1 left-0 right-0 flex justify-between px-10 text-[16px] font-mono font-medium" style={{ color: theme.colors.textGhost }}>
          {points.map((pt, idx) => (
            <span key={idx}>{pt.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
};
