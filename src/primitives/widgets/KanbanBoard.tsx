import type { FC, ReactNode } from 'react';
import type { ThemeConfig } from '../../core/theme-contract';
import { LIGHT_SAAS_THEME } from '../../core/theme-contract';

export interface KanbanCardData {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string | number;
  tags?: string[];
  amount?: string;
}

export interface KanbanColumnData {
  id: string;
  title: string;
  color?: string;
  count?: number;
  cards: KanbanCardData[];
}

export interface KanbanBoardProps {
  theme?: ThemeConfig;
  boardTitle?: string;
  boardSubtitle?: string;
  headerStats?: Array<{ label: string; value: string }>;
  columns?: KanbanColumnData[];
  actionsSlot?: ReactNode;
  className?: string;
}

/**
 * KANBAN BOARD (v5)
 *
 * Profesyonel SaaS satış boru hattı / aşama takip panosu.
 * Sütunlar, kartlar, aşama sayaçları ve metrik toplamları içerir.
 * Tamamen prop/tema bağımsızdır.
 */
export const KanbanBoard: FC<KanbanBoardProps> = ({
  theme = LIGHT_SAAS_THEME,
  boardTitle = 'Pipeline Board',
  boardSubtitle,
  headerStats = [],
  columns = [],
  actionsSlot,
  className = '',
}) => {
  const isLight = theme.surfaceMode === 'light';

  return (
    <div
      className={`kanban-board relative flex flex-col w-full h-full rounded-2xl overflow-hidden select-none ${className}`}
      style={{
        backgroundColor: theme.colors.bgSurface,
        border: `1px solid ${theme.colors.borderSubtle}`,
        boxShadow: isLight
          ? '0 10px 30px -10px rgba(15, 23, 42, 0.08)'
          : '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* 1. BOARD ÜST BİLGİ VE METRİK ÇUBUĞU */}
      <div
        className="px-8 py-5 flex items-center justify-between shrink-0"
        style={{
          borderBottom: `1px solid ${theme.colors.borderSubtle}`,
          backgroundColor: theme.colors.bgSurface,
        }}
      >
        <div className="flex flex-col">
          <h2
            className="text-[22px] font-bold tracking-tight"
            style={{ color: theme.colors.textPrimary }}
          >
            {boardTitle}
          </h2>
          {boardSubtitle && (
            <p className="text-[15px] mt-0.5" style={{ color: theme.colors.textMuted }}>
              {boardSubtitle}
            </p>
          )}
        </div>

        {/* Metrikler & Aksiyonlar */}
        <div className="flex items-center gap-6">
          {headerStats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-end">
              <span
                className="text-[16px] font-mono font-semibold uppercase tracking-wider"
                style={{ color: theme.colors.textGhost }}
              >
                {stat.label}
              </span>
              <span
                className="text-[20px] font-bold font-mono"
                style={{ color: theme.colors.accentPrimary }}
              >
                {stat.value}
              </span>
            </div>
          ))}
          {actionsSlot}
        </div>
      </div>

      {/* 2. SÜTUNLAR KAPSAYICISI (KANBAN COLUMNS) */}
      <div className="flex-1 p-6 overflow-x-auto flex gap-5 items-start">
        {columns.map((col) => {
          const colColor = col.color || theme.colors.accentPrimary;
          const count = col.count ?? col.cards.length;

          return (
            <div
              key={col.id}
              className={`kanban-column kanban-col-${col.id} flex flex-col w-[260px] shrink-0 rounded-2xl p-3.5`}
              style={{
                backgroundColor: theme.colors.bgSurfaceSubtle,
                border: `1px solid ${theme.colors.borderSubtle}`,
              }}
            >
              {/* Sütun Başlığı */}
              <div className="flex items-center justify-between pb-3 mb-3 px-1 border-b" style={{ borderColor: theme.colors.borderSubtle }}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: colColor }}
                  />
                  <span
                    className="text-[16px] font-bold truncate"
                    style={{ color: theme.colors.textPrimary }}
                  >
                    {col.title}
                  </span>
                </div>
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[16px]"
                  style={{
                    backgroundColor: theme.colors.bgSurface,
                    color: theme.colors.textMuted,
                    border: `1px solid ${theme.colors.borderSubtle}`,
                  }}
                >
                  {count}
                </span>
              </div>

              {/* Sütun Kartları */}
              <div className="flex flex-col gap-3 min-h-[140px]">
                {col.cards.length > 0 ? (
                  col.cards.map((card) => (
                    <div
                      key={card.id}
                      className={`kanban-card kanban-card-${card.id} p-4 rounded-xl flex flex-col gap-2.5 shadow-sm transition-all`}
                      style={{
                        backgroundColor: theme.colors.bgSurface,
                        border: `1px solid ${theme.colors.borderSubtle}`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className="text-[16px] font-bold leading-snug truncate flex-1"
                          style={{ color: theme.colors.textPrimary }}
                        >
                          {card.title}
                        </span>
                        {card.badge && (
                          <span
                            className="px-2 py-0.5 rounded-md text-[16px] font-mono font-bold shrink-0"
                            style={{
                              backgroundColor: theme.colors.accentPrimary + '15',
                              color: theme.colors.accentPrimary,
                            }}
                          >
                            {card.badge}
                          </span>
                        )}
                      </div>

                      {card.subtitle && (
                        <span className="text-[16px]" style={{ color: theme.colors.textMuted }}>
                          {card.subtitle}
                        </span>
                      )}

                      {/* Tag Etiketleri */}
                      {card.tags && card.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {card.tags.map((t, ti) => (
                            <span
                              key={ti}
                              className="px-2 py-0.5 rounded text-[16px] font-medium"
                              style={{
                                backgroundColor: theme.colors.bgSurfaceSubtle,
                                color: theme.colors.textMuted,
                                border: `1px solid ${theme.colors.borderSubtle}`,
                              }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {card.amount && (
                        <div
                          className="pt-2 border-t flex justify-end font-mono font-bold text-[16px]"
                          style={{
                            borderColor: theme.colors.borderSubtle,
                            color: theme.colors.textPrimary,
                          }}
                        >
                          {card.amount}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div
                    className="flex-1 flex items-center justify-center py-8 text-[16px] italic"
                    style={{ color: theme.colors.textGhost }}
                  >
                    No items
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
