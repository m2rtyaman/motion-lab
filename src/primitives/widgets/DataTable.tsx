import type { FC, ReactNode } from 'react';
import type { ThemeConfig } from '../../engine';
import { LIGHT_SAAS_THEME } from '../../engine';

export interface DataTableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableRow {
  id: string;
  [key: string]: any;
}

export interface DataTableProps {
  theme?: ThemeConfig;
  columns: DataTableColumn[];
  rows: DataTableRow[];
  highlightedRowIndex?: number;
  highlightedRowClassName?: string;
  renderCell?: (row: DataTableRow, columnKey: string, rowIndex: number) => ReactNode;
  className?: string;
}

/**
 * DATA TABLE (v5.5)
 *
 * Yüksek yoğunluklu profesyonel SaaS müşteri & veri tablosu.
 * Özel sütunlar, sıralama başlıkları, fırsat skoru rozetleri ve
 * kameranın odaklanacağı satır için pürüzsüz `highlightedRowIndex` vurgulaması sunar.
 * Tamamen prop-driven ve veri-bağımsızdır.
 */
export const DataTable: FC<DataTableProps> = ({
  theme = LIGHT_SAAS_THEME,
  columns,
  rows,
  highlightedRowIndex = -1,
  highlightedRowClassName = 'table-row-highlighted',
  renderCell,
  className = '',
}) => {
  const isLight = theme.surfaceMode === 'light';

  return (
    <div
      className={`data-table relative w-full overflow-hidden select-none rounded-2xl flex flex-col ${className}`}
      style={{
        backgroundColor: theme.colors.bgSurface,
        border: `1px solid ${theme.colors.borderSubtle}`,
        boxShadow: isLight
          ? '0 10px 30px -10px rgba(15, 23, 42, 0.08)'
          : '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* 1. TABLO ÜST BAŞLIK SATIRI */}
      <div
        className="table-header-row flex items-center px-6 py-4 shrink-0 text-[16px] font-mono font-bold uppercase tracking-wider"
        style={{
          backgroundColor: theme.colors.bgSurfaceSubtle,
          borderBottom: `1px solid ${theme.colors.borderSubtle}`,
          color: theme.colors.textGhost,
        }}
      >
        {columns.map((col) => (
          <div
            key={col.key}
            className={`truncate px-2 ${
              col.align === 'center'
                ? 'text-center'
                : col.align === 'right'
                ? 'text-right'
                : 'text-left'
            }`}
            style={{ width: col.width || 'auto', flex: col.width ? undefined : 1 }}
          >
            {col.label}
          </div>
        ))}
      </div>

      {/* 2. TABLO VERİ SATIRLARI */}
      <div className="table-body flex flex-col divide-y" style={{ borderColor: theme.colors.borderSubtle }}>
        {rows.map((row, rIdx) => {
          const isHighlighted = rIdx === highlightedRowIndex;

          return (
            <div
              key={row.id || rIdx}
              className={`table-row-${row.id} flex items-center px-6 py-4.5 transition-all duration-300 ${
                isHighlighted ? `${highlightedRowClassName} z-10 relative` : ''
              }`}
              style={{
                backgroundColor: isHighlighted
                  ? theme.colors.accentPrimary + '12' // %12 vurgu tint
                  : theme.colors.bgSurface,
                borderLeft: isHighlighted
                  ? `4px solid ${theme.colors.accentPrimary}`
                  : '4px solid transparent',
              }}
            >
              {columns.map((col) => (
                <div
                  key={col.key}
                  className={`truncate px-2 text-[16px] font-medium ${
                    col.align === 'center'
                      ? 'text-center'
                      : col.align === 'right'
                      ? 'text-right'
                      : 'text-left'
                  }`}
                  style={{
                    width: col.width || 'auto',
                    flex: col.width ? undefined : 1,
                    color: theme.colors.textPrimary,
                  }}
                >
                  {renderCell ? (
                    renderCell(row, col.key, rIdx)
                  ) : (
                    <span>{row[col.key]}</span>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
