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

export const LIGHTING = {
  spotlightGradient:
    'radial-gradient(circle 520px at 50% 38%, #1c1c24 0%, #111115 55%, #08080a 100%)',
  gridMaskGradient:
    'radial-gradient(circle 440px at 50% 40%, rgba(255, 255, 255, 0.12) 0%, transparent 80%)',
  specularBorderGradient:
    'linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.04) 40%, rgba(255, 255, 255, 0.01) 100%)',
} as const;
