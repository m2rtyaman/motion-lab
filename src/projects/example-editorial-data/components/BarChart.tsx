import { type FC } from 'react';
import type { ThemeConfig } from '../../../core/theme-contract';

export interface BarDatum { label: string; value: number }
export interface BarChartProps {
  data: BarDatum[];
  theme: ThemeConfig;
  /** Bars from this index on use the "after" tone; the last bar is the accent. */
  splitIndex: number;
  annotation: string;
  unit: string;
  className?: string;
}

const AREA = 330; // px, height of the tallest bar
const COL = 240; // px, column width (7 columns = 1680)

/** Editorial bar chart: one accent bar, a baseline, values above bars, years below, one annotation. */
export const BarChart: FC<BarChartProps> = ({ data, theme, splitIndex, annotation, unit, className = '' }) => {
  const { colors } = theme;
  const max = Math.max(...data.map((d) => d.value));
  const last = data.length - 1;
  const tone = (i: number): string => (i === last ? colors.accentPrimary : i >= splitIndex ? colors.textMuted : colors.textGhost);
  return (
    <div className={`relative ${className}`} style={{ width: COL * data.length, height: AREA + 130 }}>
      <div className="chart-annot absolute top-0 flex flex-col gap-2" style={{ left: COL * splitIndex, height: AREA + 60, borderLeft: `2px dashed ${colors.textGhost}`, paddingLeft: 16 }}>
        <span className="text-[20px] font-bold uppercase leading-[1.2] tracking-[0.08em]" style={{ color: colors.textMuted }}>{annotation}</span>
      </div>
      <div className="chart-baseline absolute left-0 right-0 h-[2px]" style={{ top: AREA + 56, backgroundColor: colors.textPrimary, transformOrigin: 'left center' }} />
      <div className="absolute inset-x-0 bottom-0 flex">
        {data.map((d, i) => (
          <div key={d.label} className="flex flex-col items-center justify-end" style={{ width: COL, height: AREA + 130 }}>
            <span className={`bar-val ${i === last ? 'bar-val-last' : ''} mb-3 text-[28px] font-bold leading-[1.2]`} style={{ color: i === last ? colors.accentPrimary : colors.textPrimary }}>{d.value}{unit}</span>
            <div className={`bar ${i === last ? 'bar-last' : ''} ${i < splitIndex ? 'bar-pre' : ''}`} style={{ width: 128, height: (d.value / max) * AREA, backgroundColor: tone(i), borderRadius: '8px 8px 0 0', transformOrigin: '50% 100%' }} />
            <span className="bar-year mt-3 text-[28px] font-medium leading-[1.2]" style={{ height: 44, color: colors.textMuted }}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
