import type { FC, ReactNode } from 'react';
import type { ThemeConfig } from '../../engine';
import { LIGHT_SAAS_THEME } from '../../engine';

export interface AppShellNavItem {
  id: string;
  label: string;
  icon?: ReactNode;
  active?: boolean;
  badge?: string | number;
}

export interface AppShellProps {
  children: ReactNode;
  theme?: ThemeConfig;
  brandLogo?: ReactNode;
  brandName?: string;
  navItems?: AppShellNavItem[];
  headerTitle?: string;
  headerSubtitle?: string;
  headerActionsSlot?: ReactNode;
  searchPlaceholder?: string;
  userSlot?: ReactNode;
  sidebarCollapsed?: boolean;
  className?: string;
}

/**
 * APP SHELL (v5)
 *
 * Profesyonel SaaS arayüz iskeleti.
 * Sol Sidebar (Logo + Navigasyon + Profil), Üst Header (Arama + Başlık + Aksiyonlar)
 * ve Dinamik Ana İçerik Tuvali sunar.
 * Herhangi bir markaya bağımlı değildir; tamamen prop-driven çalışır.
 */
export const AppShell: FC<AppShellProps> = ({
  children,
  theme = LIGHT_SAAS_THEME,
  brandLogo,
  brandName = 'Platform',
  navItems = [
    { id: 'dashboard', label: 'Dashboard', active: true },
    { id: 'pipeline', label: 'Pipeline' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'analytics', label: 'Analytics' },
  ],
  headerTitle,
  headerSubtitle,
  headerActionsSlot,
  searchPlaceholder = 'Search anything...',
  userSlot,
  sidebarCollapsed = false,
  className = '',
}) => {
  return (
    <div
      className={`app-shell relative flex w-full h-full overflow-hidden select-none ${className}`}
      style={{
        backgroundColor: theme.colors.bgPrimary,
        color: theme.colors.textPrimary,
      }}
    >
      {/* 1. SOL KENAR ÇUBUĞU (SIDEBAR) */}
      <aside
        className={`app-sidebar flex flex-col justify-between shrink-0 transition-all duration-300 ${
          sidebarCollapsed ? 'w-[84px] px-3' : 'w-[260px] px-5'
        } py-6`}
        style={{
          backgroundColor: theme.colors.bgSurface,
          borderRight: `1px solid ${theme.colors.borderSubtle}`,
        }}
      >
        {/* LOGO & MARKA ADI */}
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3.5 px-2">
            {brandLogo ? (
              <div className="shrink-0">{brandLogo}</div>
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[20px] text-white shrink-0 shadow-sm"
                style={{ backgroundColor: theme.colors.accentPrimary }}
              >
                {brandName.charAt(0)}
              </div>
            )}
            {!sidebarCollapsed && (
              <span
                className="text-[20px] font-bold tracking-tight truncate"
                style={{ color: theme.colors.textPrimary }}
              >
                {brandName}
              </span>
            )}
          </div>

          {/* NAVİGASYON ELEMANLARI */}
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = item.active;
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl cursor-pointer font-medium text-[16px] transition-colors ${
                    isActive ? 'font-semibold' : ''
                  }`}
                  style={{
                    backgroundColor: isActive
                      ? theme.colors.accentPrimary + '15' // 15% opacity tint
                      : 'transparent',
                    color: isActive
                      ? theme.colors.accentPrimary
                      : theme.colors.textMuted,
                  }}
                >
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  {!sidebarCollapsed && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}
                  {!sidebarCollapsed && item.badge !== undefined && (
                    <span
                      className="text-[16px] font-mono px-2.5 py-0.5 rounded-full font-bold ml-auto"
                      style={{
                        backgroundColor: isActive
                          ? theme.colors.accentPrimary
                          : theme.colors.bgSurfaceSubtle,
                        color: isActive ? '#ffffff' : theme.colors.textMuted,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* ALT PROFİL / AYARLAR ALANI */}
        <div
          className="pt-4 border-t"
          style={{ borderColor: theme.colors.borderSubtle }}
        >
          {userSlot ? (
            userSlot
          ) : (
            <div className="flex items-center gap-3 px-2">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[16px] text-white shrink-0"
                style={{ backgroundColor: theme.colors.accentSecondary }}
              >
                U
              </div>
              {!sidebarCollapsed && (
                <div className="flex flex-col truncate">
                  <span
                    className="text-[16px] font-semibold truncate"
                    style={{ color: theme.colors.textPrimary }}
                  >
                    User Account
                  </span>
                  <span
                    className="text-[16px] truncate"
                    style={{ color: theme.colors.textGhost }}
                  >
                    Administrator
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* 2. SAĞ ANA ALAN (HEADER + CONTENT) */}
      <div className="app-main flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* ÜST ÇUBUK (HEADER) */}
        <header
          className="app-header flex items-center justify-between px-8 py-4 shrink-0 select-none"
          style={{
            backgroundColor: theme.colors.bgSurface,
            borderBottom: `1px solid ${theme.colors.borderSubtle}`,
          }}
        >
          {/* SOL: BAŞLIK / BREADCRUMB */}
          <div className="flex flex-col">
            {headerTitle && (
              <h1
                className="text-[22px] font-bold tracking-tight"
                style={{ color: theme.colors.textPrimary }}
              >
                {headerTitle}
              </h1>
            )}
            {headerSubtitle && (
              <p
                className="text-[15px]"
                style={{ color: theme.colors.textMuted }}
              >
                {headerSubtitle}
              </p>
            )}
          </div>

          {/* ORTA: ARAMA ÇUBUĞU */}
          {searchPlaceholder && (
            <div
              className="flex items-center gap-2.5 px-4 py-2 rounded-xl w-[340px]"
              style={{
                backgroundColor: theme.colors.bgSurfaceSubtle,
                border: `1px solid ${theme.colors.borderSubtle}`,
              }}
            >
              <svg
                className="w-4 h-4 opacity-60"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <span
                className="text-[15px] truncate"
                style={{ color: theme.colors.textGhost }}
              >
                {searchPlaceholder}
              </span>
            </div>
          )}

          {/* SAĞ: AKSİYON YUVASI */}
          <div className="flex items-center gap-3.5">
            {headerActionsSlot}
          </div>
        </header>

        {/* ANA İÇERİK TUVALİ */}
        <main className="app-content flex-1 p-6 overflow-hidden relative flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
};
