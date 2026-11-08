export const EASING = {
  expoOut: 'expo.out',
  expoInOut: 'expo.inOut',
  powerOut: 'power3.out',
  powerInOut: 'power2.inOut',
  circOut: 'circ.out',
  backOut: 'back.out(1.6)',
  smoothOut: [0.16, 1, 0.3, 1] as const,
  quickIn: 'power2.in',
  sineInOut: 'sine.inOut',
} as const;

export const DURATIONS = {
  instant: 0.12,
  micro: 0.2,
  fast: 0.24,
  word: 0.38,
  glide: 0.4,
  panel: 0.45,
  depthPush: 0.48,
  focus: 0.5,
  morph: 0.52,
  sweep: 0.55,
  scene: 0.6,
  camera: 0.65,
  long: 0.8,
  item: 0.35,
  exit: 0.32,
} as const;

/** Gecikme / stagger ve bindirme sabitleri (saniye) */
export const TIMING = {
  charStagger: 0.025,
  streakStagger: 0.04,
  itemStagger: 0.055,
  wordStagger: 0.06,
  layerStagger: 0.07,
  digitStagger: 0.08,
  itemLead: 0.14,
  crossCutOverlap: 0.16,
} as const;

/** Ofset / ölçek / blur sabitleri (GPU-safe: transform + opacity + filter) */
export const MOTION_OFFSET = {
  wordY: 42,
  surfaceY: 56,
  itemY: 20,
  surfaceScaleFrom: 0.94,
  wordScaleFrom: 0.88,
  wordRotateFrom: 2.5,
  wordBlur: 8,
  surfaceBlur: 14,
  depthY: -28,
  depthScale: 0.92,
  depthOpacity: 0.42,
  depthBlur: 4,
  exitY: -48,
  exitScale: 0.95,
  exitBlur: 12,
} as const;

/**
 * Ölçek Kontrastı (Scale Contrast) Sabitleri:
 * Sahnelerin sürekli ekran ortasında aynı boyutta kutu olarak durmasını (Postage-Stamp Slop) engeller.
 * Makro yakın çekim, tam ekran bileşen patlaması ve geniş açılı geri çekilme oranlarını tanımlar.
 */
export const SCALE_CONTRAST = {
  macroCloseUp: 1.95,
  portalDive: 2.85,
  elementTakeover: 18.0,
  intimateFocus: 1.42,
  neutralStage: 1.0,
  wideOverview: 0.88,
} as const;

export const SPRING = {
  // Sıfır zıplama, tok ve endüstriyel fizik
  snappy: { stiffness: 240, damping: 28, mass: 0.8 },
  rigid: { stiffness: 300, damping: 35, mass: 1 },
  bouncy: { stiffness: 180, damping: 14, mass: 0.9 },
  gentle: { stiffness: 120, damping: 18, mass: 1 },
  smooth: { stiffness: 120, damping: 24, mass: 1 },
  liquidLead: { stiffness: 260, damping: 22, mass: 0.8 },
  liquidTrail: { stiffness: 160, damping: 26, mass: 1 },
  cameraTrack: { stiffness: 160, damping: 22, mass: 1 },
  morphSnappy: { stiffness: 210, damping: 22, mass: 0.85 },
  snapback: { stiffness: 260, damping: 18, mass: 0.9 },
} as const;

export const PALETTE = {
  // Katı Anti-Slop Monokrom Paleti
  bgBase: '#09090b',        // Zinc-950 (Derin Boşluk)
  bgStageCenter: '#17171d', // Mercek Odak Zemini
  bgSurface: '#121216',     // Katman 1 (Pasif Yüzey)
  bgRaised: '#1c1c22',      // Katman 2 (Aktif Cam Yüzey Üstü)
  bgHighlight: '#27272f',   // Katman 3 (Vurgu / Rozet Zemini)

  borderSubtle: 'rgba(255, 255, 255, 0.07)',
  borderMuted: 'rgba(255, 255, 255, 0.14)',
  borderFocus: 'rgba(255, 255, 255, 0.28)',

  textPrimary: '#fafafa',   // Saf Kırık Beyaz (Yüksek Kontrast)
  textSecondary: '#d4d4d8', // Zinc-300 (Net İkincil)
  textMuted: '#a1a1aa',     // Zinc-400 (Okunaklı Meta)
  textGhost: '#52525b',     // Zinc-600

  // Yalnızca anlamsal durumlar (parlamasız, mat)
  semanticError: '#ef4444',
  semanticSuccess: '#10b981',
  semanticWarn: '#f59e0b',
} as const;

/**
 * 1080x1920 Dikey Yayın (Broadcast) Ölçek Sistemi
 * 10px-14px web fontları yerine mobil tam ekranda yüksek okunabilirlik sağlar.
 */
export const BROADCAST_SCALE = {
  canvasWidth: 1080,
  canvasHeight: 1920,
  safeZoneTop: 250,
  safeZoneBottom: 300,
  cardMaxWidth: 940,
  avatarBoxPx: 76,
  typography: {
    heroMessage: 'text-[60px] font-extrabold tracking-[-0.035em] leading-[1.12]',
    subMessage: 'text-[44px] font-bold tracking-[-0.03em] leading-[1.18]',
    speakerName: 'text-[32px] font-bold tracking-[-0.02em] leading-none',
    roleBadge: 'text-[18px] font-mono font-semibold uppercase tracking-[0.14em]',
    metaMono: 'text-[20px] font-mono tracking-[0.08em]',
    hudLabel: 'text-[18px] font-mono uppercase tracking-[0.18em]',
  },
} as const;

/**
 * Anti-Slop Specular Işık ve Derinlik Katmanları
 * Sıfır neon/glow ile Apple/Linear kalitesinde fiziksel yüzey ayrımı sağlar.
 */
export const LIGHTING = {
  // Kartların üst kenarındaki 1px kristal ışık kırılması
  specularRimTop:
    'linear-gradient(90deg, rgba(255,255,255,0) 4%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 96%)',
  // Aktif odak kartı dikey yüzey geçişi
  surfaceGradientActive:
    'linear-gradient(180deg, rgba(32, 32, 39, 0.96) 0%, rgba(18, 18, 22, 0.98) 100%)',
  // Pasif/geçmiş kart yüzey geçişi
  surfaceGradientMuted:
    'linear-gradient(180deg, rgba(22, 22, 27, 0.85) 0%, rgba(14, 14, 18, 0.90) 100%)',
  // Sahne merkezi monokrom spot vinyeti
  stageRadialVignette:
    'radial-gradient(circle at 50% 46%, #18181f 0%, #0d0d11 48%, #070709 100%)',
  // Perspektif ızgara dairesel erime maskesi
  gridRadialMask:
    'radial-gradient(circle at 50% 46%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0) 78%)',
  // Derinlik gölgesi (Neon olmayan fiziksel ambient occlusion)
  ambientShadow: '0 32px 64px -16px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.12)',
} as const;

export type EasingKey = keyof typeof EASING;
export type DurationKey = keyof typeof DURATIONS;
export type SpringPresetKey = keyof typeof SPRING;
export type PaletteKey = keyof typeof PALETTE;

/** Recipe constants: src/core/recipes.ts uses only these. */
export const RECIPE = {
  shakeStep: 0.06,
  shakeSteps: 5,
  shakeAmplitudePx: 12,
  shakeRollDeg: 1.6,
  revealBlurPx: 16,
  revealScaleFrom: 1.12,
  wipeDuration: 0.5,
  settleOvershoot: 1.06,
  settleIn: 0.18,
  settleOut: 0.42,
  scrambleDuration: 0.48,
  scrambleStep: 0.04,
  odometerDuration: 0.65,
  odometerDigitHeight: 48,
  baselineWipeY: 36,
  splitFlapPerspective: 800,
  splitFlapDuration: 0.38,
  cursorTravelDuration: 0.48,
  cursorPressScale: 0.88,
  rippleScale: 2.4,
  magneticPullMaxPx: 24,
  indicatorGlideDuration: 0.32,
  indicatorStretchScaleX: 1.18,
  vertigoZoomForegroundScale: 1.35,
  vertigoZoomBackgroundScale: 0.78,
  rackFocusBlurPx: 14,
  parallaxNearRatio: 1.5,
  parallaxMidRatio: 1.0,
  parallaxFarRatio: 0.45,
  lightLeakDistance: 1920,
  speedStreakDistance: 1200,
  glintDistance: 600,
  dockOvershootScale: 1.14,
} as const;

/* ============================================================================
 * DESIGN SYSTEM TOKENS (additive). Numbers for models: docs/DESIGN_SYSTEM.md is generated from these
 * by scripts/gen-design-system.mjs. Pixel values are for the final frame (1920x1080 or 1080x1920).
 * ========================================================================== */

export type AspectKey = '16:9' | '9:16';

/** Type scale: px on the final frame. `wordsPerLine` is the readable maximum, not a hard limit. */
export const TYPE_SCALE = {
  '16:9': {
    display: { px: 112, lineHeight: 1.04, tracking: '-0.04em', weight: 900, wordsPerLine: 5 },
    headline: { px: 72, lineHeight: 1.08, tracking: '-0.03em', weight: 800, wordsPerLine: 8 },
    title: { px: 48, lineHeight: 1.15, tracking: '-0.025em', weight: 700, wordsPerLine: 10 },
    body: { px: 28, lineHeight: 1.35, tracking: '-0.01em', weight: 500, wordsPerLine: 14 },
    label: { px: 20, lineHeight: 1.2, tracking: '0.08em', weight: 700, wordsPerLine: 4 },
    caption: { px: 18, lineHeight: 1.3, tracking: '0.01em', weight: 500, wordsPerLine: 12 },
  },
  '9:16': {
    display: { px: 120, lineHeight: 1.04, tracking: '-0.04em', weight: 900, wordsPerLine: 3 },
    headline: { px: 84, lineHeight: 1.08, tracking: '-0.03em', weight: 800, wordsPerLine: 4 },
    title: { px: 56, lineHeight: 1.15, tracking: '-0.025em', weight: 700, wordsPerLine: 5 },
    body: { px: 36, lineHeight: 1.35, tracking: '-0.01em', weight: 500, wordsPerLine: 7 },
    label: { px: 22, lineHeight: 1.2, tracking: '0.08em', weight: 700, wordsPerLine: 3 },
    caption: { px: 20, lineHeight: 1.3, tracking: '0.01em', weight: 500, wordsPerLine: 6 },
  },
} as const;

/** Absolute minimum text size on the final frame (RULES.md: no micro-fonts). */
export const MIN_TEXT_PX = 18;

/** 8 px spacing grid. */
export const SPACE = { s0: 0, s1: 8, s2: 16, s3: 24, s4: 32, s5: 48, s6: 64, s7: 96, s8: 128 } as const;

/** Padding and gaps inside surfaces, px on the final frame. */
export const SURFACE_PADDING = {
  '16:9': { card: 32, cardGap: 24, shell: 32, shellHeader: 24, pill: [8, 20], button: [20, 40] },
  '9:16': { card: 40, cardGap: 32, shell: 40, shellHeader: 32, pill: [10, 24], button: [24, 48] },
} as const;

/** Layout grids. Safe-zone top/bottom minimums equal scripts/validate-spec.mjs (S008/S009). */
export const LAYOUT = {
  '16:9': { width: 1920, height: 1080, safeTop: 30, safeBottom: 30, marginX: 120, columns: 12, gutter: 24 },
  '9:16': { width: 1080, height: 1920, safeTop: 250, safeBottom: 300, marginX: 70, columns: 6, gutter: 20 },
} as const;

/** Corner radii, px. Match ThemeGeometry (radiusSm/Md/Lg) plus xl and pill. */
export const RADII = { sm: 8, md: 14, lg: 22, xl: 32, pill: 999 } as const;

/** Stroke widths, px. */
export const STROKES = { hairline: 1, default: 2, emphasis: 4, specularRim: 1 } as const;

/** Elevation shadows (no colored glow). */
export const SHADOWS = {
  light: {
    e1: '0 10px 25px -8px rgba(15, 23, 42, 0.06)',
    e2: '0 10px 30px -10px rgba(15, 23, 42, 0.08)',
    e3: '0 25px 60px -15px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(15, 23, 42, 0.05)',
  },
  dark: {
    e1: '0 10px 25px -8px rgba(0, 0, 0, 0.5)',
    e2: '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
    e3: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)',
  },
} as const;

/** UI shown at broadcast scale: scale = MIN_TEXT_PX / native font px; widgets draw labels at 15-16 px native. */
export const UI_SCALE = { minTextPx: MIN_TEXT_PX, widgetNativeLabelPx: 15, widgetNativeBodyPx: 18, recommendedZoom: [1.2, 1.7] } as const;

/** Color usage limits per frame. */
export const COLOR_RULES = { maxAccentsPerFrame: 2, secondaryAccentMaxAreaPct: 10, statusColorsOnlyForStatus: true } as const;
