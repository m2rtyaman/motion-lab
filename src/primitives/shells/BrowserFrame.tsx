import type { FC, ReactNode } from 'react';
import type { ThemeConfig } from '../../engine';
import { LIGHT_SAAS_THEME } from '../../engine';

export interface BrowserFrameProps {
  children: ReactNode;
  theme?: ThemeConfig;
  url?: string;
  title?: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  showAddressBar?: boolean;
  showTrafficLights?: boolean;
  actionsSlot?: ReactNode;
}

/**
 * BROWSER FRAME (v5)
 *
 * Gerçekçi modern tarayıcı penceresi iskeleti (macOS / Chrome tarzı).
 * İçerideki SaaS arayüzünün boşlukta yüzmesini engeller, kurumsal ve güvenilir bir çerçeve sunar.
 * Tamamen prop/tema bağımsızdır.
 */
export const BrowserFrame: FC<BrowserFrameProps> = ({
  children,
  theme = LIGHT_SAAS_THEME,
  url = 'https://app.workspace.io',
  title,
  width = '100%',
  height = '100%',
  className = '',
  showAddressBar = true,
  showTrafficLights = true,
  actionsSlot,
}) => {
  const isLight = theme.surfaceMode === 'light';

  return (
    <div
      className={`browser-frame relative flex flex-col overflow-hidden shadow-2xl ${className}`}
      style={{
        width,
        height,
        borderRadius: theme.geometry.radiusLg,
        backgroundColor: theme.colors.bgSurface,
        border: `1px solid ${theme.colors.borderSubtle}`,
        boxShadow: isLight
          ? '0 25px 60px -15px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(15, 23, 42, 0.05)'
          : '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* TARAYICI ÜST ÇUBUĞU (CHROME HEADER) */}
      <div
        className="browser-header flex items-center justify-between px-6 py-4 select-none shrink-0"
        style={{
          backgroundColor: theme.colors.bgSurfaceSubtle,
          borderBottom: `1px solid ${theme.colors.borderSubtle}`,
        }}
      >
        {/* SOL: TRAFİK IŞIKLARI */}
        <div className="flex items-center gap-2.5 min-w-[80px]">
          {showTrafficLights && (
            <>
              <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] opacity-90" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] opacity-90" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f] opacity-90" />
            </>
          )}
        </div>

        {/* ORTA: ADRES ÇUBUĞU / BAŞLIK */}
        {showAddressBar ? (
          <div
            className="browser-address-bar flex items-center justify-center gap-2.5 px-5 py-2 rounded-xl flex-1 max-w-[540px] mx-4"
            style={{
              backgroundColor: theme.colors.bgSurface,
              border: `1px solid ${theme.colors.borderSubtle}`,
              color: theme.colors.textMuted,
            }}
          >
            {/* Kilit İkonu (SVG) */}
            <svg
              className="w-4 h-4 shrink-0 opacity-70"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span
              className="text-[16px] font-mono truncate text-center tracking-tight"
              style={{ color: theme.colors.textMuted }}
            >
              {url}
            </span>
          </div>
        ) : title ? (
          <div
            className="text-[18px] font-semibold text-center truncate flex-1"
            style={{ color: theme.colors.textPrimary }}
          >
            {title}
          </div>
        ) : null}

        {/* SAĞ: EK AKSİYONLAR YA DA DENGE BOŞLUĞU */}
        <div className="flex items-center justify-end gap-2 min-w-[80px]">
          {actionsSlot}
        </div>
      </div>

      {/* İÇERİK TUVALİ */}
      <div className="browser-content relative flex-1 w-full h-full overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
};
