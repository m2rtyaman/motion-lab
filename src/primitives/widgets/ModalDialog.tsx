import type { FC, ReactNode } from 'react';
import type { ThemeConfig } from '../../engine';
import { LIGHT_SAAS_THEME } from '../../engine';

export interface ModalDialogProps {
  theme?: ThemeConfig;
  isOpen?: boolean;
  iconSlot?: ReactNode;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  footerSlot?: ReactNode;
  width?: string | number;
  className?: string;
}

/**
 * MODAL DIALOG (v5)
 *
 * Profesyonel SaaS açılır pencere / randevu & onay modalı.
 * Arka plana zarif bir karartma (backdrop) uygular ve merkeze gölgeli bir diyalog penceresi konumlandırır.
 * Tamamen prop/tema bağımsızdır.
 */
export const ModalDialog: FC<ModalDialogProps> = ({
  theme = LIGHT_SAAS_THEME,
  isOpen = true,
  iconSlot,
  title = 'Dialog Title',
  subtitle,
  children,
  footerSlot,
  width = '580px',
  className = '',
}) => {
  if (!isOpen) return null;

  const isLight = theme.surfaceMode === 'light';

  return (
    <div
      className={`modal-dialog-overlay absolute inset-0 z-50 flex items-center justify-center p-6 select-none ${className}`}
      style={{
        backgroundColor: isLight ? 'rgba(15, 23, 42, 0.45)' : 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="modal-card relative flex flex-col rounded-3xl overflow-hidden shadow-2xl transition-all"
        style={{
          width,
          backgroundColor: theme.colors.bgSurface,
          border: `1px solid ${theme.colors.borderSubtle}`,
          boxShadow: isLight
            ? '0 25px 60px -15px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(15, 23, 42, 0.08)'
            : '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.12)',
        }}
      >
        {/* MODAL BAŞLIĞI */}
        <div
          className="px-8 pt-7 pb-5 flex items-start justify-between"
          style={{ borderBottom: `1px solid ${theme.colors.borderSubtle}` }}
        >
          <div className="flex items-center gap-4">
            {iconSlot ? (
              iconSlot
            ) : (
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white text-[20px] shadow-sm shrink-0"
                style={{ backgroundColor: theme.colors.accentPrimary }}
              >
                +
              </div>
            )}
            <div className="flex flex-col">
              <h3
                className="text-[22px] font-bold tracking-tight"
                style={{ color: theme.colors.textPrimary }}
              >
                {title}
              </h3>
              {subtitle && (
                <p className="text-[15px] mt-0.5" style={{ color: theme.colors.textMuted }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Kapat X İkonu */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shrink-0"
            style={{
              backgroundColor: theme.colors.bgSurfaceSubtle,
              color: theme.colors.textGhost,
            }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </div>
        </div>

        {/* MODAL GÖVDESİ */}
        <div className="px-8 py-6 flex flex-col gap-5">
          {children}
        </div>

        {/* MODAL ALT ÇUBUĞU (FOOTER) */}
        {footerSlot && (
          <div
            className="px-8 py-5 flex items-center justify-end gap-3.5"
            style={{
              backgroundColor: theme.colors.bgSurfaceSubtle,
              borderTop: `1px solid ${theme.colors.borderSubtle}`,
            }}
          >
            {footerSlot}
          </div>
        )}
      </div>
    </div>
  );
};
