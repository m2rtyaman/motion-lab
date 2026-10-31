export const EASING = {
  expoOut: 'expo.out',
  expoInOut: 'expo.inOut',
  powerOut: 'power3.out',
  circOut: 'circ.out',
  backOut: 'back.out(1.6)',
  smoothOut: [0.16, 1, 0.3, 1] as const,
  quickIn: 'power2.in',
} as const;

export const DURATIONS = {
  instant: 0.12,
  micro: 0.2,
  word: 0.38,
  panel: 0.45,
  camera: 0.65,
  scene: 0.6,
  item: 0.35,
  depthPush: 0.48,
  exit: 0.32,
} as const;

/** Gecikme / stagger ve bindirme sabitleri (saniye) */
export const TIMING = {
  wordStagger: 0.06,
  itemStagger: 0.055,
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

export const SPRING = {
  // Sıfır zıplama, tok ve endüstriyel fizik
  snappy: { stiffness: 240, damping: 28, mass: 0.8 },
  rigid: { stiffness: 300, damping: 35, mass: 1 },
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
} as const;
