/**
 * UNIVERSAL THEME CONTRACT (v5)
 *
 * Her videonun görsel kimliğini (Light, Dark, Vibrant, Editorial) belirleyen dinamik tema sözleşmesi.
 * Kod içinde doğrudan hardcoded hex kodu (#0a0a0a, #00ff88 vb.) kullanımını engeller.
 */

export type SurfaceMode = 'light' | 'dark' | 'vibrant-brand' | 'editorial-warm';

export type TypographyCharacter =
  | 'geometric-sans'  // Modern SaaS (Linear, Vercel, Apple)
  | 'neo-grotesk'     // Kurumsal & Finans (Stripe, Figma)
  | 'humanist-serif'  // Lüks & Editoryal
  | 'monospace';      // Geliştirici & Telemetri araçları

export interface ThemeColors {
  /** Ana sayfa / tuval arka planı */
  bgPrimary: string;
  /** Kartlar, paneller, modal pencereleri */
  bgSurface: string;
  /** Sidebar, arama çubuğu, tablo alternatif satırları */
  bgSurfaceSubtle: string;
  /** Yüksek kontrastlı ana metin rengi */
  textPrimary: string;
  /** İkincil / açıklama metinleri */
  textMuted: string;
  /** Soluk meta / zaman / breadcrumb metinleri */
  textGhost: string;
  /** Marka birincil rengi (Örn: #2563EB Kraliyet Mavisi) */
  accentPrimary: string;
  /** Vurgu / ikincil aksiyon rengi (Örn: #f59e0b Amber) */
  accentSecondary: string;
  /** Hafif kart ve bölücü sınırları */
  borderSubtle: string;
  /** Aktif / odaklanmış sınır çizgisi */
  borderFocus: string;
  /** Durum renkleri */
  statusSuccess: string;
  statusWarning: string;
  statusDanger: string;
}

export interface ThemeTypography {
  character: TypographyCharacter;
  heroClass: string;
  titleClass: string;
  bodyClass: string;
  monoClass: string;
  badgeClass: string;
}

export interface ThemeGeometry {
  radiusSm: string;
  radiusMd: string;
  radiusLg: string;
  shadowStyle: 'soft-ambient' | 'crisp-border' | 'glass-specular' | 'flat';
}

export interface ThemeConfig {
  surfaceMode: SurfaceMode;
  colors: ThemeColors;
  typography: ThemeTypography;
  geometry: ThemeGeometry;
}

// -----------------------------------------------------------------------------
// HAZIR SEKTÖREL TEMA ÖN-TANIMLARI (PRESETS)
// -----------------------------------------------------------------------------

/** Modern Aydınlık B2B SaaS Teması (Octosift, Stripe, Notion tarzı) */
export const LIGHT_SAAS_THEME: ThemeConfig = {
  surfaceMode: 'light',
  colors: {
    bgPrimary: '#f8fafc',         // Slate-50
    bgSurface: '#ffffff',         // Saf beyaz kart
    bgSurfaceSubtle: '#f1f5f9',   // Slate-100 sidebar/arama
    textPrimary: '#0f172a',       // Slate-900 koyu okunaklı metin
    textMuted: '#475569',         // Slate-600
    textGhost: '#94a3b8',         // Slate-400
    accentPrimary: '#2563eb',     // Royal Blue (Blue-600)
    accentSecondary: '#f59e0b',   // Amber-500
    borderSubtle: 'rgba(15, 23, 42, 0.08)',
    borderFocus: 'rgba(37, 99, 235, 0.45)',
    statusSuccess: '#10b981',
    statusWarning: '#f59e0b',
    statusDanger: '#ef4444',
  },
  typography: {
    character: 'geometric-sans',
    heroClass: 'text-[64px] font-black tracking-[-0.035em] leading-[1.08]',
    titleClass: 'text-[40px] font-bold tracking-[-0.025em] leading-[1.15]',
    bodyClass: 'text-[20px] font-medium leading-relaxed',
    monoClass: 'text-[18px] font-mono tracking-tight',
    badgeClass: 'text-[15px] font-mono font-semibold uppercase tracking-[0.14em]',
  },
  geometry: {
    radiusSm: '8px',
    radiusMd: '14px',
    radiusLg: '22px',
    shadowStyle: 'soft-ambient',
  },
};

/** Koyu Editoryal Cam Teması (Linear, Raycast tarzı) */
export const DARK_LINEAR_THEME: ThemeConfig = {
  surfaceMode: 'dark',
  colors: {
    bgPrimary: '#09090b',         // Zinc-950
    bgSurface: '#121216',         // Zinc-900 / Koyu cam
    bgSurfaceSubtle: '#18181b',   // Zinc-800
    textPrimary: '#fafafa',       // Saf kırık beyaz
    textMuted: '#a1a1aa',         // Zinc-400
    textGhost: '#52525b',         // Zinc-600
    accentPrimary: '#2563eb',     // Royal Blue
    accentSecondary: '#10b981',   // Zümrüt
    borderSubtle: 'rgba(255, 255, 255, 0.08)',
    borderFocus: 'rgba(255, 255, 255, 0.28)',
    statusSuccess: '#10b981',
    statusWarning: '#f59e0b',
    statusDanger: '#ef4444',
  },
  typography: {
    character: 'geometric-sans',
    heroClass: 'text-[68px] font-extrabold tracking-[-0.035em] leading-[1.08]',
    titleClass: 'text-[44px] font-bold tracking-[-0.03em] leading-[1.15]',
    bodyClass: 'text-[20px] font-normal leading-relaxed',
    monoClass: 'text-[18px] font-mono tracking-tight',
    badgeClass: 'text-[16px] font-mono uppercase tracking-[0.16em]',
  },
  geometry: {
    radiusSm: '8px',
    radiusMd: '16px',
    radiusLg: '24px',
    shadowStyle: 'glass-specular',
  },
};

/** Canlı Marka / Yüksek Enerjili Reklam Teması (Spotify, FinTech) */
export const VIBRANT_BRAND_THEME: ThemeConfig = {
  surfaceMode: 'vibrant-brand',
  colors: {
    bgPrimary: '#0f172a',
    bgSurface: '#1e293b',
    bgSurfaceSubtle: '#334155',
    textPrimary: '#ffffff',
    textMuted: '#cbd5e1',
    textGhost: '#64748b',
    accentPrimary: '#2563eb',
    accentSecondary: '#f97316',
    borderSubtle: 'rgba(255, 255, 255, 0.12)',
    borderFocus: 'rgba(37, 99, 235, 0.5)',
    statusSuccess: '#10b981',
    statusWarning: '#f59e0b',
    statusDanger: '#ef4444',
  },
  typography: {
    character: 'neo-grotesk',
    heroClass: 'text-[72px] font-black tracking-[-0.04em] leading-[1.02]',
    titleClass: 'text-[46px] font-extrabold tracking-[-0.03em] leading-[1.12]',
    bodyClass: 'text-[22px] font-medium leading-relaxed',
    monoClass: 'text-[19px] font-mono tracking-tight',
    badgeClass: 'text-[16px] font-mono font-bold uppercase tracking-[0.18em]',
  },
  geometry: {
    radiusSm: '10px',
    radiusMd: '18px',
    radiusLg: '28px',
    shadowStyle: 'soft-ambient',
  },
};

/**
 * Tema Fabrikası (Custom Theme Builder)
 * İsteğe bağlı alanları varsayılanla harmanlar.
 */
export function createTheme(
  base: ThemeConfig = LIGHT_SAAS_THEME,
  overrides?: {
    surfaceMode?: SurfaceMode;
    colors?: Partial<ThemeColors>;
    typography?: Partial<ThemeTypography>;
    geometry?: Partial<ThemeGeometry>;
  }
): ThemeConfig {
  if (!overrides) return base;
  return {
    surfaceMode: overrides.surfaceMode ?? base.surfaceMode,
    colors: { ...base.colors, ...overrides.colors },
    typography: { ...base.typography, ...overrides.typography },
    geometry: { ...base.geometry, ...overrides.geometry },
  };
}
