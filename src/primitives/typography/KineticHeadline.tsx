import type { FC } from 'react';
import type { ThemeConfig } from '../../engine';
import { LIGHT_SAAS_THEME } from '../../engine';

export interface KineticHeadlineProps {
  theme?: ThemeConfig;
  tag?: string;
  title: string;
  subtitle?: string;
  headlineClassName?: string;
  className?: string;
}

/**
 * KINETIC HEADLINE (v5.5)
 *
 * Ürün arayüzünün üzerine binen Sinematik Pazarlama Başlığı Katmanı.
 * 9:16 dikey videolarda üst güvenli alana yerleşir.
 * Satır maskesi (overflow-hidden) ve GSAP ile aşağıdan yukarı pürüzsüzce açılır.
 * UI bileşenindeki başlığı gereksiz yere kopyalamaz; ürünü tamamlayan değer önerisi sunar.
 */
export const KineticHeadline: FC<KineticHeadlineProps> = ({
  theme = LIGHT_SAAS_THEME,
  tag,
  title,
  subtitle,
  headlineClassName = 'kinetic-headline',
  className = '',
}) => {
  return (
    <div
      className={`${headlineClassName} absolute top-[120px] left-0 right-0 z-40 px-10 flex flex-col items-center text-center pointer-events-none select-none ${className}`}
    >
      {/* 1. KATEGORİ ROZETİ */}
      {tag && (
        <div className="headline-tag-mask overflow-hidden mb-3">
          <div
            className="headline-tag px-4 py-1 rounded-full text-[16px] font-mono font-bold uppercase tracking-[0.14em] shadow-sm border"
            style={{
              backgroundColor: theme.colors.accentPrimary + '15',
              color: theme.colors.accentPrimary,
              borderColor: theme.colors.accentPrimary + '30',
            }}
          >
            {tag}
          </div>
        </div>
      )}

      {/* 2. VURUCU PAZARLAMA BAŞLIĞI */}
      <div className="headline-title-mask overflow-hidden">
        <h1
          className="headline-title text-[40px] font-black tracking-[-0.03em] leading-[1.12] max-w-[820px]"
          style={{ color: theme.colors.textPrimary }}
        >
          {title}
        </h1>
      </div>

      {/* 3. AÇIKLAYICI ALT BAŞLIK */}
      {subtitle && (
        <div className="headline-sub-mask overflow-hidden mt-2">
          <p
            className="headline-sub text-[20px] font-medium leading-relaxed max-w-[680px]"
            style={{ color: theme.colors.textMuted }}
          >
            {subtitle}
          </p>
        </div>
      )}
    </div>
  );
};
