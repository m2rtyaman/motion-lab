/**
 * DECONSTRUCTIVE TYPOGRAPHY MATH & KINETIC TRAJECTORIES (v1.0)
 *
 * Kaynak: references/DECONSTRUCTIVE_TYPOGRAPHY_GUIDE.md
 * (Structural Deconstructive Motion & Layered Typography Physics)
 *
 * Harfleri sıradan opacity katmanı olarak değil; gövde, yay ve noktalama parçalarından
 * oluşan fiziksel grafik nesneleri olarak modeller. Katmanlı zamanlama (Layered Timing)
 * ve kontrollü hayalet kontur (ghost outline) gecikmelerini deterministik olarak hesaplar.
 */

export interface TypographicFragmentState {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
  outlineX: number;
  outlineY: number;
  outlineOpacity: number;
}

export interface TypographicFragmentDefinition {
  id: string;
  type: 'stem' | 'arc' | 'crossbar' | 'dot' | 'punct';
  // Hedef kelimedeki yerleşik konumu (baseline-anchored)
  targetX: number;
  targetY: number;
  targetWidth: number;
  targetHeight: number;
  // Soyut kümedeki dinlenme konumu
  clusterX: number;
  clusterY: number;
  clusterRotation: number;
  // Katmanlı zamanlama sırası (0: primary, 1: secondary, 2: settle)
  timingOrder: number;
}

/**
 * Katmanlı Zamanlama Eğrisi (Layered Timing Deceleration)
 * Fast acceleration -> controlled travel -> smooth deceleration -> tiny settle
 */
export function computeLayeredTimingProgress(
  frame: number,
  startFrame: number,
  durationFrames: number,
  timingOrder: number
): number {
  if (durationFrames <= 0) return 1;
  // timingOrder'a göre mikro gecikme ofseti (0: anında, 1: 3f gecikme, 2: 6f gecikme)
  const delay = timingOrder * 3;
  const localFrame = frame - startFrame - delay;
  if (localFrame <= 0) return 0;
  const effectiveDur = Math.max(1, durationFrames - delay);
  const t = Math.min(1, Math.max(0, localFrame / effectiveDur));

  // Expo-out benzeri sönümlü eğri + mikro-yerleşme (tiny settle)
  if (t >= 1) return 1;
  const expoOut = 1 - Math.pow(2, -10 * t);
  // Son %10'luk dilimde mikro elastik oturma (±0.02)
  const settle = t > 0.85 ? Math.sin((t - 0.85) / 0.15 * Math.PI) * 0.02 : 0;
  return Math.min(1, Math.max(0, expoOut + settle));
}

/**
 * Harf Parçacığı Yörünge Durumu Değerlendirici
 */
export function evaluateFragmentState(
  frag: TypographicFragmentDefinition,
  progress: number,
  outlineLagProgress: number
): TypographicFragmentState {
  // Asal parçanın konumu: cluster -> target
  const p = Math.max(0, Math.min(1, progress));
  const x = frag.clusterX + (frag.targetX - frag.clusterX) * p;
  const y = frag.clusterY + (frag.targetY - frag.clusterY) * p;
  const rotation = frag.clusterRotation * (1 - p);
  const scale = 0.85 + 0.15 * p;
  const opacity = Math.min(1, p * 1.5);

  // İkincil hayalet kontur (secondary ghost outline): ana parçanın gerisinde sürüklenir
  const lp = Math.max(0, Math.min(1, outlineLagProgress));
  const velX = (frag.targetX - frag.clusterX) * (1 - lp) * 0.12;
  const velY = (frag.targetY - frag.clusterY) * (1 - lp) * 0.12;
  const outlineX = x - velX;
  const outlineY = y - velY;
  // Kontur yerleştiğinde hafifçe arkada (4px ofset) kalıcı ayrışma verir
  const settledOutlineOffset = (1 - Math.abs(p - 0.5) * 2) * 6;
  const outlineOpacity = p > 0.05 && p < 0.98 ? 0.65 : 0.25;

  return {
    x: Number(x.toFixed(2)),
    y: Number(y.toFixed(2)),
    rotation: Number(rotation.toFixed(2)),
    scale: Number(scale.toFixed(3)),
    opacity: Number(opacity.toFixed(3)),
    outlineX: Number((outlineX + settledOutlineOffset).toFixed(2)),
    outlineY: Number((outlineY + settledOutlineOffset).toFixed(2)),
    outlineOpacity: Number(outlineOpacity.toFixed(3)),
  };
}

/**
 * 6.3s Master Sekans İçin Kare Fazı Belirleyici
 */
export function getDeconstructivePhase(frame: number, fps: number = 60): {
  phaseName: string;
  progress: number;
  isHero: boolean;
} {
  const t = frame / fps;

  if (t < 0.10) return { phaseName: 'abstract-open', progress: t / 0.10, isHero: false };
  if (t < 0.25) return { phaseName: 'hello-formation', progress: (t - 0.10) / 0.15, isHero: false };
  if (t < 0.38) return { phaseName: 'hello-distortion', progress: (t - 0.25) / 0.13, isHero: false };
  if (t < 0.60) return { phaseName: 'fragmented-symbol', progress: (t - 0.38) / 0.22, isHero: false };
  if (t < 0.70) return { phaseName: 'hello-reassembly', progress: (t - 0.60) / 0.10, isHero: false };
  if (t < 0.95) return { phaseName: 'evolve-transform', progress: (t - 0.70) / 0.25, isHero: false };
  if (t < 1.20) return { phaseName: 'abstract-intermediate', progress: (t - 0.95) / 0.25, isHero: false };
  if (t < 1.38) return { phaseName: 'evolve-reveal', progress: (t - 1.20) / 0.18, isHero: false };
  if (t < 1.65) return { phaseName: 'evolve-ghost-hold', progress: (t - 1.38) / 0.27, isHero: false };
  if (t < 1.90) return { phaseName: 'horizontal-graphic-slit', progress: (t - 1.65) / 0.25, isHero: false };
  if (t < 4.80) return { phaseName: 'rotational-orbit-cycle', progress: (t - 1.90) / 2.90, isHero: false };
  if (t < 5.05) return { phaseName: 'evolve-hero-climax', progress: (t - 4.80) / 0.25, isHero: true };
  if (t < 5.45) return { phaseName: 'controlled-disassembly', progress: (t - 5.05) / 0.40, isHero: false };
  if (t < 6.05) return { phaseName: 'final-abstract-float', progress: (t - 5.45) / 0.60, isHero: false };
  return { phaseName: 'ambient-fade', progress: Math.min(1, (t - 6.05) / 0.25), isHero: false };
}
