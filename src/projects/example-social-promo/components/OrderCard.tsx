import { type FC } from 'react';
import type { ThemeConfig } from '../../../core/theme-contract';
import { RADII, SHADOWS } from '../../../core/tokens';

export interface OrderCardProps {
  theme: ThemeConfig; label: string; title: string; detail: string; priceLabel: string; price: string; action: string; className?: string;
}

const Cup: FC<{ color: string; accent: string }> = ({ color, accent }) => (
  <svg width="88" height="88" viewBox="0 0 72 72" fill="none" aria-hidden="true">
    <path d="M16 24h36v18a14 14 0 0 1-14 14h-8a14 14 0 0 1-14-14V24z" fill={color} />
    <path d="M52 28h4a8 8 0 0 1 0 16h-4" stroke={color} strokeWidth="5" />
    <rect x="16" y="16" width="36" height="6" rx="3" fill={accent} />
  </svg>
);

/** Order summary card: product row, hairline, price row and ONE primary button (`order-btn`). Width comes from `className` (700 px in the scene). */
export const OrderCard: FC<OrderCardProps> = ({ theme, label, title, detail, priceLabel, price, action, className = '' }) => {
  const { colors } = theme;
  return (
    <div className={`flex flex-col gap-8 p-10 ${className}`} style={{ backgroundColor: colors.bgSurface, borderRadius: RADII.lg, boxShadow: SHADOWS.dark.e3 }}>
      <div className="flex items-center gap-6">
        <div className="flex h-[128px] w-[128px] items-center justify-center" style={{ backgroundColor: colors.bgSurfaceSubtle, borderRadius: RADII.md }}>
          <Cup color={colors.textPrimary} accent={colors.accentSecondary} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-[24px] font-bold uppercase leading-[1.2] tracking-[0.08em]" style={{ color: colors.textMuted }}>{label}</div>
          <div className="text-[56px] font-bold leading-[1.15] tracking-[-0.025em]">{title}</div>
          <div className="text-[32px] font-medium leading-[1.35]" style={{ color: colors.textMuted }}>{detail}</div>
        </div>
      </div>
      <div className="h-px w-full" style={{ backgroundColor: colors.borderSubtle }} />
      <div className="flex items-baseline justify-between">
        <div className="text-[32px] font-medium" style={{ color: colors.textMuted }}>{priceLabel}</div>
        <div className="text-[56px] font-bold leading-[1.15] tracking-[-0.025em]">{price}</div>
      </div>
      <div className="order-btn flex h-[112px] items-center justify-center text-[32px] font-bold" style={{ backgroundColor: colors.accentSecondary, color: colors.bgPrimary, borderRadius: RADII.pill }}>{action}</div>
    </div>
  );
};
