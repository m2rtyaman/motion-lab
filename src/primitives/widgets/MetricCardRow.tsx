import type { FC, ReactNode } from 'react';
import type { ThemeConfig } from '../../engine';
import { LIGHT_SAAS_THEME } from '../../engine';

export interface MetricCardItem {
  id: string;
  title: string;
  badge?: string;
  value: string | number;
  subtitle?: string;
  stats?: Array<{ label: string; value: string | number; color?: string }>;
  actionSlot?: ReactNode;
  accentColor?: string;
}

export interface MetricCardRowProps {
  theme?: ThemeConfig;
  cards: MetricCardItem[];
  className?: string;
}

/**
 * METRIC CARD ROW (v5.5)
 *
 * SaaS telemetri ve KPI özet kartları satırı.
 * Başlık rozeti, büyük metrik sayısı, alt detay dökümü ve aksiyon butonu içerir.
 * Tamamen prop-driven ve veri-bağımsızdır.
 */
export const MetricCardRow: FC<MetricCardRowProps> = ({
  theme = LIGHT_SAAS_THEME,
  cards,
  className = '',
}) => {
  const isLight = theme.surfaceMode === 'light';

  return (
    <div className={`metric-card-row grid grid-cols-3 gap-5 w-full select-none ${className}`}>
      {cards.map((card) => {
        const accent = card.accentColor || theme.colors.accentPrimary;

        return (
          <div
            key={card.id}
            className={`metric-card metric-card-${card.id} p-5 rounded-2xl flex flex-col justify-between transition-all`}
            style={{
              backgroundColor: theme.colors.bgSurface,
              border: `1px solid ${theme.colors.borderSubtle}`,
              boxShadow: isLight
                ? '0 10px 25px -8px rgba(15, 23, 42, 0.06)'
                : '0 10px 25px -8px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* ÜST BAŞLIK VE ROZET */}
            <div className="flex items-center justify-between pb-2">
              <span
                className="text-[16px] font-mono font-bold uppercase tracking-wider truncate"
                style={{ color: theme.colors.textGhost }}
              >
                {card.title}
              </span>
              {card.badge && (
                <span
                  className="px-2.5 py-0.5 rounded-full text-[16px] font-bold"
                  style={{
                    backgroundColor: accent + '18',
                    color: accent,
                  }}
                >
                  {card.badge}
                </span>
              )}
            </div>

            {/* BÜYÜK DEĞER */}
            <div className="py-2 flex items-baseline gap-2">
              <span
                className="text-[32px] font-black font-mono tracking-tight"
                style={{ color: theme.colors.textPrimary }}
              >
                {card.value}
              </span>
              {card.subtitle && (
                <span className="text-[16px] font-medium" style={{ color: theme.colors.textMuted }}>
                  {card.subtitle}
                </span>
              )}
            </div>

            {/* ALT İSTATİSTİK DÖKÜMÜ VEYA AKSİYON */}
            {card.stats && card.stats.length > 0 && (
              <div
                className="pt-3 mt-1 border-t grid grid-cols-2 gap-2"
                style={{ borderColor: theme.colors.borderSubtle }}
              >
                {card.stats.map((st, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-[16px] font-mono truncate" style={{ color: theme.colors.textGhost }}>
                      {st.label}
                    </span>
                    <span
                      className="text-[18px] font-bold font-mono"
                      style={{ color: st.color || theme.colors.textPrimary }}
                    >
                      {st.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {card.actionSlot && <div className="pt-2">{card.actionSlot}</div>}
          </div>
        );
      })}
    </div>
  );
};
