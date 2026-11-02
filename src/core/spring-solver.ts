import { SPRING } from './tokens.ts';

/**
 * Spring parametreleri arayüzü (Damped Harmonic Oscillator)
 */
export interface SpringConfig {
  /** Yay sertliği / gerginliği (stiffness k) */
  stiffness: number;
  /** Sönüm katsayısı (damping c) */
  damping: number;
  /** Kütle (mass m) */
  mass?: number;
  /** Başlangıç hızı (initial velocity v0, varsayılan 0) */
  initialVelocity?: number;
}

export interface SpringSolveOptions extends SpringConfig {
  /** Geçen süre (saniye) */
  time: number;
  /** Başlangıç değeri (varsayılan: 0) */
  from?: number;
  /** Hedef değer (varsayılan: 1) */
  to?: number;
}

export interface SpringFrameOptions extends SpringConfig {
  /** Mevcut Remotion karesi */
  frame: number;
  /** Sahne kare hızı (FPS, varsayılan 60) */
  fps?: number;
  /** Animasyon başlangıç karesi (varsayılan 0) */
  startFrame?: number;
  /** Başlangıç değeri (varsayılan: 0) */
  from?: number;
  /** Hedef değer (varsayılan: 1) */
  to?: number;
}

export interface SpringState {
  /** Mevcut konum / değer */
  value: number;
  /** Mevcut anlık hız */
  velocity: number;
  /** Normalize ilerleme oranı [0 .. ~1] */
  progress: number;
  /** Yayın durulup durulmadığı */
  isSettled: boolean;
}

/**
 * Analitik sönümlü harmonik osilatör çözücüsü (Damped Harmonic Oscillator).
 * 
 * Diferansiyel denklem:
 *   m * x''(t) + c * x'(t) + k * x(t) = 0
 * 
 * Doğal açısal frekans: ω0 = sqrt(k / m)
 * Sönüm oranı:          ζ = c / (2 * sqrt(k * m))
 * 
 * Üç rejim:
 * 1. Düşük Sönüm (Underdamped, ζ < 1): Salınım ve aşırı-atış (overshoot)
 * 2. Kritik Sönüm (Critically Damped, ζ = 1): En hızlı salınımsız oturma
 * 3. Aşırı Sönüm (Overdamped, ζ > 1): Ağır viskoz oturma
 * 
 * Remotion kare determinizmine ve GSAP timeline'larına %100 uyumludur.
 */
export function solveSpring(options: SpringSolveOptions): SpringState {
  const {
    stiffness,
    damping,
    mass = 1,
    initialVelocity = 0,
    time,
    from = 0,
    to = 1,
  } = options;

  if (time <= 0) {
    return {
      value: from,
      velocity: initialVelocity,
      progress: 0,
      isSettled: false,
    };
  }

  const m = Math.max(0.0001, mass);
  const k = Math.max(0.0001, stiffness);
  const c = Math.max(0, damping);

  const omega0 = Math.sqrt(k / m);
  const zeta = c / (2 * Math.sqrt(k * m));
  const delta = to - from;
  const x0 = from - to; // Başlangıç yer değiştirmesi (hedefe göre)
  const v0 = initialVelocity;

  let y = x0;
  let v = v0;

  // Tolerans eşiği (hareketsiz kabul edilme)
  const EPSILON = 0.0005;

  if (Math.abs(zeta - 1) < 1e-5) {
    // 2. Kritik Sönümlü Rejim (Critically Damped: ζ = 1)
    const A = x0;
    const B = v0 + omega0 * x0;
    const expTerm = Math.exp(-omega0 * time);
    y = expTerm * (A + B * time);
    v = expTerm * (B - omega0 * (A + B * time));
  } else if (zeta < 1) {
    // 1. Düşük Sönümlü Rejim (Underdamped: ζ < 1)
    const omegaD = omega0 * Math.sqrt(1 - zeta * zeta);
    const A = x0;
    const B = (v0 + zeta * omega0 * x0) / omegaD;
    const expTerm = Math.exp(-zeta * omega0 * time);
    const cosTerm = Math.cos(omegaD * time);
    const sinTerm = Math.sin(omegaD * time);

    y = expTerm * (A * cosTerm + B * sinTerm);
    // y'(t) = v(t) türevi
    v = expTerm * ((-zeta * omega0 * A + B * omegaD) * cosTerm + (-zeta * omega0 * B - A * omegaD) * sinTerm);
  } else {
    // 3. Aşırı Sönümlü Rejim (Overdamped: ζ > 1)
    const omegaD = omega0 * Math.sqrt(zeta * zeta - 1);
    const r1 = -zeta * omega0 + omegaD;
    const r2 = -zeta * omega0 - omegaD;

    const denom = r1 - r2;
    const C1 = (v0 - x0 * r2) / denom;
    const C2 = -(v0 - x0 * r1) / denom;

    const exp1 = Math.exp(r1 * time);
    const exp2 = Math.exp(r2 * time);

    y = C1 * exp1 + C2 * exp2;
    v = C1 * r1 * exp1 + C2 * r2 * exp2;
  }

  const value = to + y;
  const velocity = v;
  const scale = Math.abs(delta) > 0 ? Math.abs(delta) : 1;
  const progress = Math.abs(delta) > 1e-6 ? (value - from) / delta : 1;
  const isSettled = Math.abs(y) < EPSILON * scale && Math.abs(velocity) < EPSILON * scale;

  return {
    value,
    velocity,
    progress,
    isSettled,
  };
}

/**
 * Remotion kare numarasına göre anlık yay değerini çözer.
 */
export function solveSpringFrame(options: SpringFrameOptions): SpringState {
  const { frame, fps = 60, startFrame = 0, ...rest } = options;
  const elapsedFrames = Math.max(0, frame - startFrame);
  const time = elapsedFrames / fps;
  return solveSpring({ ...rest, time });
}

/**
 * Normalize edilmiş 0..1 zaman girdisi için yay ilerlemesini örnekler.
 */
export function sampleSpringProgress(timeSec: number, config: SpringConfig): number {
  return solveSpring({
    ...config,
    time: timeSec,
    from: 0,
    to: 1,
  }).progress;
}

/**
 * Yayın durulması için gereken yaklaşık süreyi (saniye) hesaplar.
 */
export function getSpringSettleDuration(
  config: SpringConfig,
  threshold: number = 0.001
): number {
  const m = Math.max(0.0001, config.mass ?? 1);
  const k = Math.max(0.0001, config.stiffness);
  const c = Math.max(0, config.damping);
  const omega0 = Math.sqrt(k / m);
  const zeta = c / (2 * Math.sqrt(k * m));

  // Üstel sönüm zarfı: exp(-zeta * omega0 * t) <= threshold
  const decayRate = zeta >= 1 ? -(-zeta * omega0 + omega0 * Math.sqrt(Math.max(0, zeta * zeta - 1))) : zeta * omega0;
  const safeDecay = Math.max(0.1, decayRate);
  const estimatedTime = -Math.log(threshold) / safeDecay;

  // 10ms adımlarla kontrol ederek doğrula
  const dt = 0.01;
  for (let t = Math.max(0.05, estimatedTime * 0.7); t < estimatedTime * 2.5; t += dt) {
    const s = solveSpring({ ...config, time: t, from: 0, to: 1 });
    if (Math.abs(s.progress - 1) < threshold && Math.abs(s.velocity) < threshold) {
      return Math.round(t * 100) / 100;
    }
  }

  return Math.round(estimatedTime * 100) / 100;
}

/**
 * Yayın durulması için gereken kare sayısını döndürür.
 */
export function getSpringSettleFrames(
  config: SpringConfig,
  fps: number = 60,
  threshold: number = 0.001
): number {
  const duration = getSpringSettleDuration(config, threshold);
  return Math.ceil(duration * fps);
}

/**
 * GSAP uyumlu özel ease fonksiyonu üretir.
 * Girdi [0..1] normalize zaman alır, yay fiziğine göre ilerleme döndürür.
 */
export function createSpringEase(config: SpringConfig): (progress: number) => number {
  const settleDuration = getSpringSettleDuration(config);
  return (p: number) => {
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    const t = p * settleDuration;
    return solveSpring({ ...config, time: t, from: 0, to: 1 }).progress;
  };
}

/**
 * Ön-tanımlı stüdyo yay sabitleri
 */
export const SPRING_PRESETS = {
  snappy: SPRING.snappy,
  rigid: SPRING.rigid,
  bouncy: SPRING.bouncy,
  gentle: SPRING.gentle,
} as const;
