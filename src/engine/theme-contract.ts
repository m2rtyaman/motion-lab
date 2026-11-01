/**
 * UNIVERSAL THEME CONTRACT (v6 Engine Core)
 *
 * Her videonun görsel kimliğini (Light, Dark, Vibrant, Editorial) belirleyen dinamik tema sözleşmesi.
 * Kod içinde doğrudan hardcoded hex kodu (#0a0a0a, #00ff88 vb.) kullanımını engeller.
 */

export type SurfaceMode = 'light' | 'dark' | 'vibrant-brand' | 'editorial-warm' | 'kinetic-acid' | 'technical-drafting';

export type TypographyCharacter =
  | 'geometric-sans'  // Modern SaaS (Linear, Vercel, Apple)
  | 'neo-grotesk'     // Kurumsal & Finans (Stripe, Figma)
  | 'humanist-serif'  // Lüks & Editoryal
  | 'monospace';      // Geliştirici & Telemetri araçları

export interface Theme3D {
  /** Yansıma parlaklığı (0.0: dielektrik, 1.0: tam ayna sıvı metal) */
  metalness: number;
  /** Yüzey pürüzlülüğü (0.0: pürüzsüz cıva, 1.0: mat döküm demir) */
  roughness: number;
  /** Şeffaf koruyucu cila katmanı (0.0 - 1.0) */
  clearcoat?: number;
  /** Sıvı krom üzerine vuran renkli yansıma vurgusu (örn: #c4ff00) */
  chromeAccent?: string;
  /** Voxel/Pin matrisinin gövde rengi */
  pinColor?: string;
  /** Voxel/Pin matrisinin tepe pırıltı rengi */
  pinSpecular?: string;
  /** 3D sahne ana ışık şiddeti (1.0 - 4.0) */
  lightIntensity?: number;
}

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
  theme3D?: Theme3D;
}

// -----------------------------------------------------------------------------
// HAZIR SEKTÖREL TEMA ÖN-TANIMLARI (PRESETS)
// -----------------------------------------------------------------------------

/** Modern Aydınlık B2B SaaS Teması (Stripe, Notion, Linear tarzı) */
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

/** Koyu Editoryal Cam Teması (Linear, Raycast, Apple tarzı) */
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

/** Kinetik Asit & Sıvı Krom Teması (shneural / Make It Loud tarzı 144 BPM) */
export const KINETIC_ACID_THEME: ThemeConfig = {
  surfaceMode: 'kinetic-acid',
  colors: {
    bgPrimary: '#08090b',         // Derin Slate-Black
    bgSurface: '#101216',         // Koyu endüstriyel gövde
    bgSurfaceSubtle: '#181b22',   // İkincil yüzey
    textPrimary: '#ffffff',       // Saf parlak beyaz
    textMuted: '#94a3b8',         // Mat metalik gri
    textGhost: '#475569',         // Soluk teknik telemetri
    accentPrimary: '#c4ff00',     // Electric Acid Lime (Ana dikkat mıknatısı)
    accentSecondary: '#38bdf8',   // Metalik Mavi (Sekonder vurgu)
    borderSubtle: 'rgba(196, 255, 0, 0.16)',
    borderFocus: '#c4ff00',
    statusSuccess: '#c4ff00',
    statusWarning: '#fbbf24',
    statusDanger: '#f43f5e',
  },
  typography: {
    character: 'neo-grotesk',
    heroClass: 'text-[78px] font-black tracking-[-0.045em] leading-[0.98] uppercase',
    titleClass: 'text-[48px] font-extrabold tracking-[-0.03em] leading-[1.06] uppercase',
    bodyClass: 'text-[22px] font-semibold leading-relaxed tracking-tight',
    monoClass: 'text-[18px] font-mono tracking-normal uppercase',
    badgeClass: 'text-[16px] font-mono font-bold uppercase tracking-[0.22em]',
  },
  geometry: {
    radiusSm: '4px',
    radiusMd: '8px',
    radiusLg: '14px',
    shadowStyle: 'glass-specular',
  },
  theme3D: {
    metalness: 0.98,
    roughness: 0.04,
    clearcoat: 1.0,
    chromeAccent: '#c4ff00',
    pinColor: '#1e222d',
    pinSpecular: '#c4ff00',
    lightIntensity: 2.8,
  },
};

/** Teknik Eskiz & Mühendislik Kağıdı Teması (Blueprint / Drafting Paper) */
export const TECHNICAL_DRAFTING_THEME: ThemeConfig = {
  surfaceMode: 'technical-drafting',
  colors: {
    bgPrimary: '#d6d9ce',         // Mat mühendislik çizim kağıdı
    bgSurface: '#e4e7dc',         // Yükseltilmiş pafta paneli
    bgSurfaceSubtle: '#cbcfc3',   // İkincil teknik alan
    textPrimary: '#0f1115',       // Koyu kömür jilet keskin yazı
    textMuted: '#4a4f58',         // Teknik etiket tonu
    textGhost: '#7a818e',         // Milimetrik grid çizgileri
    accentPrimary: '#0f1115',     // Yüksek kontrast kömür
    accentSecondary: '#dc2626',   // Çizim kırmızı işaretleme kalemi
    borderSubtle: 'rgba(15, 17, 21, 0.22)',
    borderFocus: 'rgba(15, 17, 21, 0.75)',
    statusSuccess: '#15803d',
    statusWarning: '#b45309',
    statusDanger: '#b91c1c',
  },
  typography: {
    character: 'monospace',
    heroClass: 'text-[64px] font-mono font-bold tracking-[-0.02em] leading-[1.04] uppercase',
    titleClass: 'text-[38px] font-mono font-semibold tracking-normal leading-[1.14] uppercase',
    bodyClass: 'text-[19px] font-mono font-medium leading-relaxed',
    monoClass: 'text-[18px] font-mono tracking-tight',
    badgeClass: 'text-[15px] font-mono font-bold uppercase tracking-[0.2em]',
  },
  geometry: {
    radiusSm: '2px',
    radiusMd: '4px',
    radiusLg: '6px',
    shadowStyle: 'crisp-border',
  },
  theme3D: {
    metalness: 0.75,
    roughness: 0.22,
    clearcoat: 0.2,
    chromeAccent: '#0f1115',
    pinColor: '#3a3f4a',
    pinSpecular: '#ffffff',
    lightIntensity: 1.8,
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
    theme3D?: Partial<Theme3D>;
  }
): ThemeConfig {
  if (!overrides) return base;
  return {
    surfaceMode: overrides.surfaceMode ?? base.surfaceMode,
    colors: { ...base.colors, ...overrides.colors },
    typography: { ...base.typography, ...overrides.typography },
    geometry: { ...base.geometry, ...overrides.geometry },
    theme3D: overrides.theme3D || base.theme3D ? { ...base.theme3D, ...overrides.theme3D } as Theme3D : undefined,
  };
}
