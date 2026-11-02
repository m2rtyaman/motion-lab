import React from 'react';
import { DataRollup, type DataRollupProps, getTemplateById, getTemplateRawHtml } from '../templates';
import { HtmlFrameDriver } from '../engine/HtmlFrameDriver';
import type { ThemeConfig } from '../engine/theme-contract';

export type ThemeTokens = ThemeConfig;

export interface TemplateFrameProps {
  /** Identifier of the template (e.g. 'frame-data-rollup', 'frame-bold-poster', 'frame-swiss-grid') */
  templateId: string;
  /** Live structured data fed to native templates or data-viz frames */
  data?: any;
  /** Key-value variables to inject or replace in template markup */
  variables?: Record<string, any>;
  /** Optional theme contract configuration (LIGHT_SAAS_THEME, etc.) */
  theme?: ThemeConfig;
  /** Canvas width in pixels (default: 1920) */
  width?: number;
  /** Canvas height in pixels (default: 1080) */
  height?: number;
  /** Target aspect ratio */
  aspect?: '9:16' | '16:9';
  className?: string;
  style?: React.CSSProperties;
}

export const TemplateFrame: React.FC<TemplateFrameProps> = ({
  templateId,
  data,
  variables,
  theme,
  width = 1920,
  height = 1080,
  className,
  style,
}) => {
  const entry = getTemplateById(templateId);

  // 1. Native Remotion Template Path (RFC-08 Phase 2)
  if (templateId === 'frame-data-rollup' || entry?.mode === 'native') {
    const rollupData = data ?? {
      title: 'B2B Lead Keşif Telemetrisi',
      unit: '%',
      items: [
        { label: 'Eşleşme', value: 94 },
        { label: 'Doğrulama', value: 88 },
        { label: 'Dönüşüm', value: 76 },
        { label: 'Randevu', value: 64 },
      ],
    };

    const accent = theme?.colors.accentPrimary ?? '#2563eb';
    const background = theme?.colors.bgPrimary ?? '#ffffff';
    const foreground = theme?.colors.textPrimary ?? '#0f172a';

    return (
      <div
        className={className}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          ...style,
        }}
      >
        <DataRollup
          data={rollupData as DataRollupProps['data']}
          accent={accent}
          background={background}
          foreground={foreground}
        />
      </div>
    );
  }

  // 2. Deterministik HTML Köprüsü (RFC-08 Phase 1)
  const rawHtml = getTemplateRawHtml(templateId);

  if (!rawHtml) {
    return (
      <div
        className={className}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: theme?.colors.bgSurface ?? '#f8fafc',
          color: theme?.colors.textMuted ?? '#64748b',
          fontSize: 20,
          fontFamily: 'sans-serif',
          ...style,
        }}
      >
        Şablon bulunamadı: {templateId}
      </div>
    );
  }

  // Inject variables if provided
  let processedHtml = rawHtml;
  if (variables) {
    for (const [key, val] of Object.entries(variables)) {
      if (typeof val === 'string' || typeof val === 'number') {
        processedHtml = processedHtml.replaceAll(`{{${key}}}`, String(val));
      }
    }
  }

  // Map theme tokens to CSS custom properties
  const themeVars: Record<string, string> = {};
  if (theme) {
    themeVars['brand-primary'] = theme.colors.accentPrimary;
    themeVars['brand-secondary'] = theme.colors.accentSecondary;
    themeVars['surface-ground'] = theme.colors.bgPrimary;
    themeVars['surface-card'] = theme.colors.bgSurface;
    themeVars['text-primary'] = theme.colors.textPrimary;
    themeVars['text-muted'] = theme.colors.textMuted;
    themeVars['border-subtle'] = theme.colors.borderSubtle;
  }

  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      <HtmlFrameDriver
        html={processedHtml}
        width={width}
        height={height}
        themeVariables={Object.keys(themeVars).length > 0 ? themeVars : undefined}
      />
    </div>
  );
};
