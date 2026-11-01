import type { FC, ReactNode } from 'react';
import type { ThemeConfig } from '../../engine';
import { LIGHT_SAAS_THEME } from '../../engine';

export interface DrawerBadge {
  label: string;
  color?: string;
  variant?: 'solid' | 'subtle' | 'outline';
}

export interface DrawerStatusOption {
  id: string;
  label: string;
  active?: boolean;
}

export interface SlideOverDrawerProps {
  theme?: ThemeConfig;
  isOpen?: boolean;
  side?: 'right' | 'left';
  width?: string | number;
  title?: string;
  subtitle?: string;
  badges?: DrawerBadge[];
  statusOptions?: DrawerStatusOption[];
  children?: ReactNode;
  footerSlot?: ReactNode;
  className?: string;
}

/**
 * SLIDE OVER DRAWER (v5)
 *
 * Ekranın sağından veya solundan pürüzsüzce kayan detay / CRM form çekmecesi.
 * Arka plana zarif bir backdrop-filter uygular.
 * Tamamen prop/tema bağımsızdır.
 */
export const SlideOverDrawer: FC<SlideOverDrawerProps> = ({
  theme = LIGHT_SAAS_THEME,
  isOpen = true,
  side = 'right',
  width = '520px',
  title = 'Record Details',
  subtitle,
  badges = [],
  statusOptions = [],
  children,
  footerSlot,
  className = '',
}) => {
  if (!isOpen) return null;

  const isLight = theme.surfaceMode === 'light';

  return (
    <div
      className={`slide-over-drawer absolute top-0 bottom-0 z-40 flex flex-col shadow-2xl select-none ${className}`}
      style={{
        [side]: 0,
        width,
        backgroundColor: theme.colors.bgSurface,
        borderLeft: side === 'right' ? `1px solid ${theme.colors.borderSubtle}` : undefined,
        borderRight: side === 'left' ? `1px solid ${theme.colors.borderSubtle}` : undefined,
        boxShadow: isLight
          ? '-15px 0 35px -5px rgba(15, 23, 42, 0.12)'
          : '-15px 0 35px -5px rgba(0, 0, 0, 0.6)',
      }}
    >
      {/* 1. ÇEKMECE BAŞLIĞI */}
      <div
        className="drawer-header px-6 py-5 flex items-start justify-between shrink-0"
        style={{
          borderBottom: `1px solid ${theme.colors.borderSubtle}`,
          backgroundColor: theme.colors.bgSurface,
        }}
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h2
              className="text-[24px] font-bold tracking-tight truncate"
              style={{ color: theme.colors.textPrimary }}
            >
              {title}
            </h2>
          </div>

          {subtitle && (
            <p className="text-[16px]" style={{ color: theme.colors.textMuted }}>
              {subtitle}
            </p>
          )}

          {/* Rozetler */}
          {badges.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {badges.map((b, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-full text-[16px] font-medium"
                  style={{
                    backgroundColor: b.color ? b.color + '18' : theme.colors.bgSurfaceSubtle,
                    color: b.color || theme.colors.textMuted,
                    border: `1px solid ${b.color ? b.color + '40' : theme.colors.borderSubtle}`,
                  }}
                >
                  {b.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Kapat Butonu */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer shrink-0"
          style={{
            backgroundColor: theme.colors.bgSurfaceSubtle,
            color: theme.colors.textMuted,
          }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </div>
      </div>

      {/* 2. DURUM SEÇİM TABS (İSTEĞE BAĞLI) */}
      {statusOptions.length > 0 && (
        <div
          className="px-6 py-4 flex flex-wrap gap-2 shrink-0"
          style={{
            borderBottom: `1px solid ${theme.colors.borderSubtle}`,
            backgroundColor: theme.colors.bgSurfaceSubtle,
          }}
        >
          {statusOptions.map((opt) => {
            const isActive = opt.active;
            return (
              <div
                key={opt.id}
                className="px-3.5 py-2 rounded-xl text-[15px] font-semibold transition-all cursor-pointer"
                style={{
                  backgroundColor: isActive ? theme.colors.accentPrimary : theme.colors.bgSurface,
                  color: isActive ? '#ffffff' : theme.colors.textMuted,
                  border: `1px solid ${isActive ? theme.colors.accentPrimary : theme.colors.borderSubtle}`,
                  boxShadow: isActive ? '0 2px 8px rgba(37,99,235,0.25)' : 'none',
                }}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
      )}

      {/* 3. İÇERİK FORMU / DETAY GÖVDESİ */}
      <div className="drawer-body flex-1 px-6 py-6 overflow-y-auto flex flex-col gap-5">
        {children}
      </div>

      {/* 4. ALT AKSİYON ÇUBUĞU */}
      {footerSlot && (
        <div
          className="drawer-footer px-6 py-4 shrink-0 flex items-center justify-end gap-3"
          style={{
            borderTop: `1px solid ${theme.colors.borderSubtle}`,
            backgroundColor: theme.colors.bgSurface,
          }}
        >
          {footerSlot}
        </div>
      )}
    </div>
  );
};
