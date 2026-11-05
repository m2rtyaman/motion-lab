/**
 * papercraft-math.ts
 * Deterministik kağıt kesim, yırtık kenar, radyal saçılma ve sarkaç hareket matematiği:
 * - JaggedPaperTear: Yüksek frekanslı pürüzlü SVG yırtık kağıt kenarı ve ayırma poligonu
 * - MetronomeGauge: Harmonik sarkaç salınımı ve tepe noktası yavaşlama (eased reversal) fiziği
 * - ObjectScatter: Yırtılma darbesiyle radyal fırlayan 2D etiket/çıkartma vektör matematiği
 * - ChecklistScrubber & PaperCard: 2.5D kağıt katman perspektifi ve dikey izleme matematiği
 */

import { clamp, lerp } from './pure-motion-math.ts';
import { mulberry32 } from './render-contract.ts';


// ==========================================
// 1. JAGGED PAPER TEAR MATH
// ==========================================

export interface PaperTearPoint {
  x: number;
  y: number;
  jitter: number;
}

export interface PaperTearParams {
  width?: number;
  height?: number;
  seed?: number;
  segments?: number;
  amplitude?: number;
  tearOffset?: number;
  direction?: 'horizontal' | 'vertical' | 'diagonal';
  roughness?: number;
  progress?: number;
  tearGap?: number;
}

export interface PaperTearResult {
  points: PaperTearPoint[];
  tearLinePath: string;
  pieceAPath: string;
  pieceBPath: string;
  displacementA: { x: number; y: number; rotate: number };
  displacementB: { x: number; y: number; rotate: number };
  width: number;
  height: number;
}

/**
 * Yüksek frekanslı deterministik pürüzlü kağıt yırtığı kenar noktaları ve kapalı SVG poligon yolları üretir.
 */
export function computeJaggedPaperTear({
  width = 1920,
  height = 1080,
  seed = 42,
  segments = 32,
  amplitude = 24,
  tearOffset,
  direction = 'vertical',
  roughness = 1.0,
  progress = 0,
  tearGap = 80,
}: PaperTearParams = {}): PaperTearResult {
  const rand = mulberry32(seed);
  const safeSegments = Math.max(8, Math.round(segments));
  const points: PaperTearPoint[] = [];

  const clampedProgress = clamp(progress, 0, 1);
  const gap = clampedProgress * tearGap;

  if (direction === 'vertical') {
    const baseOffset = tearOffset ?? width / 2;
    const step = height / safeSegments;

    for (let i = 0; i <= safeSegments; i++) {
      const y = i * step;
      // Deterministik harmonik + pseudo-random mikroyırtık pürüzlülüğü
      const harm = Math.sin((i / safeSegments) * Math.PI * 3.5) * 0.35;
      const noise = (rand() - 0.5) * 2;
      const jitter = (noise * 0.7 + harm * 0.3) * amplitude * roughness;
      const x = clamp(baseOffset + jitter, 0, width);
      points.push({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)), jitter });
    }

    // Yırtık çizgisi
    let tearLine = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      tearLine += ` L ${points[i].x} ${points[i].y}`;
    }

    // Sol parça A (0,0 -> x,y boyunca -> 0, height)
    let pieceA = `M 0 0 L ${points[0].x} 0`;
    for (let i = 0; i < points.length; i++) {
      pieceA += ` L ${points[i].x} ${points[i].y}`;
    }
    pieceA += ` L 0 ${height} Z`;

    // Sağ parça B (width, 0 -> x,y tersine -> width, height)
    let pieceB = `M ${points[0].x} 0 L ${width} 0 L ${width} ${height} L ${points[points.length - 1].x} ${height}`;
    for (let i = points.length - 1; i >= 0; i--) {
      pieceB += ` L ${points[i].x} ${points[i].y}`;
    }
    pieceB += ` Z`;

    return {
      points,
      tearLinePath: tearLine,
      pieceAPath: pieceA,
      pieceBPath: pieceB,
      displacementA: {
        x: -gap === 0 ? 0 : -gap,
        y: -gap * 0.15 === 0 ? 0 : -gap * 0.15,
        rotate: -clampedProgress * 2.5 === 0 ? 0 : -clampedProgress * 2.5,
      },
      displacementB: {
        x: gap,
        y: gap * 0.12,
        rotate: clampedProgress * 2.2,
      },
      width,
      height,
    };
  }

  if (direction === 'diagonal') {
    const step = safeSegments;
    for (let i = 0; i <= step; i++) {
      const t = i / step;
      const baseX = t * width;
      const baseY = (1 - t) * height;
      const noise = (rand() - 0.5) * 2;
      const jitter = noise * amplitude * roughness;
      // Çapraz eksene dik normal vektör: (1, 1) normalize = (1/sqrt2, 1/sqrt2)
      const nx = 0.7071 * jitter;
      const ny = 0.7071 * jitter;
      const x = clamp(baseX + nx, 0, width);
      const y = clamp(baseY + ny, 0, height);
      points.push({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)), jitter });
    }

    let tearLine = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      tearLine += ` L ${points[i].x} ${points[i].y}`;
    }

    // Sol-üst parça A: (0,0) -> (width, 0) -> points[last..0] -> (0, height) -> (0,0)
    let pieceA = `M 0 0 L ${width} 0`;
    for (let i = points.length - 1; i >= 0; i--) {
      pieceA += ` L ${points[i].x} ${points[i].y}`;
    }
    pieceA += ` L 0 ${height} Z`;

    // Sağ-alt parça B: points[0..last] -> (width, 0) -> (width, height) -> (0, height) -> points[0]
    let pieceB = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pieceB += ` L ${points[i].x} ${points[i].y}`;
    }
    pieceB += ` L ${width} 0 L ${width} ${height} L 0 ${height} Z`;

    return {
      points,
      tearLinePath: tearLine,
      pieceAPath: pieceA,
      pieceBPath: pieceB,
      displacementA: {
        x: -gap * 0.7 === 0 ? 0 : -gap * 0.7,
        y: -gap * 0.7 === 0 ? 0 : -gap * 0.7,
        rotate: -clampedProgress * 3 === 0 ? 0 : -clampedProgress * 3,
      },
      displacementB: {
        x: gap * 0.7,
        y: gap * 0.7,
        rotate: clampedProgress * 2.5,
      },
      width,
      height,
    };
  }

  // Yatay (horizontal) yırtık
  const baseOffset = tearOffset ?? height / 2;
  const step = width / safeSegments;

  for (let i = 0; i <= safeSegments; i++) {
    const x = i * step;
    const harm = Math.sin((i / safeSegments) * Math.PI * 3.5) * 0.35;
    const noise = (rand() - 0.5) * 2;
    const jitter = (noise * 0.7 + harm * 0.3) * amplitude * roughness;
    const y = clamp(baseOffset + jitter, 0, height);
    points.push({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)), jitter });
  }

  let tearLine = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    tearLine += ` L ${points[i].x} ${points[i].y}`;
  }

  // Üst parça A: (0, 0) -> (width, 0) -> points[last..0] -> (0, 0)
  let pieceA = `M 0 0 L ${width} 0`;
  for (let i = points.length - 1; i >= 0; i--) {
    pieceA += ` L ${points[i].x} ${points[i].y}`;
  }
  pieceA += ` Z`;

  // Alt parça B: points[0..last] -> (width, height) -> (0, height) -> points[0]
  let pieceB = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    pieceB += ` L ${points[i].x} ${points[i].y}`;
  }
  pieceB += ` L ${width} ${height} L 0 ${height} Z`;

  return {
    points,
    tearLinePath: tearLine,
    pieceAPath: pieceA,
    pieceBPath: pieceB,
    displacementA: {
      x: -gap * 0.1 === 0 ? 0 : -gap * 0.1,
      y: -gap === 0 ? 0 : -gap,
      rotate: -clampedProgress * 2 === 0 ? 0 : -clampedProgress * 2,
    },
    displacementB: {
      x: gap * 0.1,
      y: gap,
      rotate: clampedProgress * 1.8,
    },
    width,
    height,
  };
}

// ==========================================
// 2. METRONOME HARMONIC OSCILLATION MATH
// ==========================================

export interface MetronomeOscillationParams {
  time: number; // saniye
  bpm?: number;
  maxAngle?: number; // derece
  damping?: number;
  phase?: number; // radyan
}

export interface MetronomeOscillationResult {
  angleDeg: number;
  angleRad: number;
  normalizedPosition: number; // -1 (sol tepe) ... 0 (merkez) ... +1 (sağ tepe)
  angularVelocity: number;
  isTurnaround: boolean;
  isMovingRight: boolean;
  frequencyHz: number;
}

/**
 * Gerçekçi sarkaç dinamiği hesaplar:
 * Tepe noktalarında (sol/sağ) hız 0'a iner ve yön yumuşakça tersine döner (eased reversal).
 * Merkezden geçerken açısal hız maksimuma ulaşır.
 */
export function computeMetronomeOscillation({
  time,
  bpm = 60,
  maxAngle = 32,
  damping = 0,
  phase = 0,
}: MetronomeOscillationParams): MetronomeOscillationResult {
  const safeBpm = Math.max(1, bpm);
  // Metronom her beat'te bir yöne vurur: f = bpm / (60 * 2) tam döngü / saniye
  const frequencyHz = safeBpm / 120;
  const omega = 2 * Math.PI * frequencyHz; // radyan/sn

  // Sönümleme katsayısı
  const decay = damping > 0 ? Math.exp(-damping * Math.max(0, time)) : 1;

  // Harmonik açı: theta(t) = maxAngle * sin(omega * t + phase)
  const arg = omega * time + phase;
  const sinVal = Math.sin(arg);
  const cosVal = Math.cos(arg);

  const normalizedPosition = sinVal * decay;
  const angleDeg = maxAngle * normalizedPosition;
  const angleRad = (angleDeg * Math.PI) / 180;

  // Açısal hız: d(theta)/dt = omega * cos(...)
  const angularVelocity = maxAngle * omega * cosVal * decay;

  // Tepe dönüş noktası eşiği (|sin| > 0.94 iken ivme yüksek, hız sıfıra yakındır)
  const isTurnaround = Math.abs(normalizedPosition) > 0.94;
  const isMovingRight = cosVal >= 0;

  return {
    angleDeg: Number(angleDeg.toFixed(3)),
    angleRad: Number(angleRad.toFixed(4)),
    normalizedPosition: Number(normalizedPosition.toFixed(4)),
    angularVelocity: Number(angularVelocity.toFixed(3)),
    isTurnaround,
    isMovingRight,
    frequencyHz,
  };
}

// ==========================================
// 3. OBJECT SCATTER RADIAL VECTOR MATH
// ==========================================

export interface ScatterTrajectory {
  id: number;
  angleRad: number;
  distance: number;
  rotationStart: number;
  rotationEnd: number;
  scalePeak: number;
  delay: number;
  tangentOffset: number;
}

export interface ScatterParams {
  count?: number;
  minDistance?: number;
  maxDistance?: number;
  spreadAngle?: number; // radyan (varsayılan: 2*PI tam daire)
  startAngle?: number; // radyan
  seed?: number;
}

export interface ScatterState {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
}

/**
 * Darbe anında radyal doğrultularda fırlayan bağımsız 2D çıkartma / etiket yörüngelerini hesaplar.
 */
export function computeScatterTrajectories({
  count = 12,
  minDistance = 140,
  maxDistance = 380,
  spreadAngle = 2 * Math.PI,
  startAngle = 0,
  seed = 101,
}: ScatterParams = {}): ScatterTrajectory[] {
  const rand = mulberry32(seed);
  const safeCount = Math.max(1, count);
  const trajectories: ScatterTrajectory[] = [];

  const angleStep = spreadAngle / safeCount;

  for (let i = 0; i < safeCount; i++) {
    // Açıya küçük deterministik sapma
    const angleJitter = (rand() - 0.5) * angleStep * 0.6;
    const angleRad = startAngle + i * angleStep + angleJitter;

    const distT = rand();
    const distance = minDistance + (maxDistance - minDistance) * distT;

    const rotDir = rand() > 0.5 ? 1 : -1;
    const rotationStart = (rand() - 0.5) * 20;
    const rotationEnd = rotationStart + rotDir * (45 + rand() * 180);

    const scalePeak = 1.05 + rand() * 0.25;
    const delay = (rand() * 0.12);
    const tangentOffset = (rand() - 0.5) * 30;

    trajectories.push({
      id: i,
      angleRad,
      distance,
      rotationStart,
      rotationEnd,
      scalePeak,
      delay,
      tangentOffset,
    });
  }

  return trajectories;
}

/**
 * Belirli bir ilerleme (progress 0..1) için saçılan parçacığın anlık konum, rotasyon ve ölçeğini değerlendirir.
 */
export function evaluateScatterParticle(
  trajectory: ScatterTrajectory,
  progress: number,
  originX: number = 0,
  originY: number = 0,
  gravity: number = 40
): ScatterState {
  const pRaw = clamp(progress - trajectory.delay, 0, 1 - trajectory.delay);
  const p = trajectory.delay < 1 ? pRaw / (1 - trajectory.delay) : 0;

  if (p <= 0) {
    return {
      x: originX,
      y: originY,
      rotation: trajectory.rotationStart,
      scale: 0,
      opacity: 0,
    };
  }

  // Patlama: önce çok hızlı fırlar (ease-out cubic / power3)
  const easeBurst = 1 - Math.pow(1 - p, 3);

  // Radyal eksen + yerçekimi yayılımı
  const radX = Math.cos(trajectory.angleRad) * trajectory.distance * easeBurst;
  const radY = Math.sin(trajectory.angleRad) * trajectory.distance * easeBurst;
  const gravY = gravity * Math.pow(p, 2);

  const x = originX + radX;
  const y = originY + radY + gravY;

  // Rotasyon
  const rotation = lerp(trajectory.rotationStart, trajectory.rotationEnd, easeBurst);

  // Ölçek: hızla fırlar, hafif peak yapar, sonra doğal 1.0 boyutuna oturur
  let scale = 1;
  if (p < 0.25) {
    scale = lerp(0, trajectory.scalePeak, p / 0.25);
  } else {
    scale = lerp(trajectory.scalePeak, 1.0, (p - 0.25) / 0.75);
  }

  // Opaklık: anında görünür, sona doğru yumuşak kaybolma opsiyonu
  const opacity = p < 0.05 ? p / 0.05 : 1;

  return {
    x: Number(x.toFixed(2)),
    y: Number(y.toFixed(2)),
    rotation: Number(rotation.toFixed(2)),
    scale: Number(scale.toFixed(3)),
    opacity: Number(opacity.toFixed(3)),
  };
}

// ==========================================
// 4. CHECKLIST SCRUBBER MATH
// ==========================================

export interface ChecklistScrubResult {
  activeIndex: number;
  subProgress: number;
  dotY: number;
  completedIndices: number[];
}

/**
 * Dikey kontrol listesi boyunca iz süren turuncu noktanın ve satır durumlarının ilerlemesini hesaplar.
 */
export function computeChecklistProgress(
  itemCount: number,
  progress: number,
  totalHeight: number = 240,
  topPadding: number = 24,
  bottomPadding: number = 24
): ChecklistScrubResult {
  const safeCount = Math.max(1, itemCount);
  const clampedProgress = clamp(progress, 0, 1);

  const usableHeight = Math.max(0, totalHeight - topPadding - bottomPadding);

  const floatIndex = clampedProgress * (safeCount - 1);
  const activeIndex = Math.min(safeCount - 1, Math.floor(floatIndex));
  const subProgress = floatIndex - activeIndex;

  const dotY = topPadding + clampedProgress * usableHeight;

  const completedIndices: number[] = [];
  for (let i = 0; i < safeCount; i++) {
    // İlgili satırın eşiğini geçtiyse tamamlandı sayılır
    const threshold = safeCount > 1 ? i / (safeCount - 1) : 1;
    if (clampedProgress >= threshold - 1e-4) {
      completedIndices.push(i);
    }
  }

  return {
    activeIndex,
    subProgress: Number(subProgress.toFixed(3)),
    dotY: Number(dotY.toFixed(2)),
    completedIndices,
  };
}

// ==========================================
// 5. PAPERCARD 2.5D MATRIX & CONTACT SHADOW
// ==========================================

export interface PaperCardMatrixParams {
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  elevation?: number; // 0..4 (kağıt yüksekliği)
  perspective?: number;
  scale?: number;
}

export interface PaperCardMatrixResult {
  transform: string;
  boxShadow: string;
}

/**
 * 2.5D fiziksel kağıt katmanının yumuşak temas gölgesini ve 3D dönüşüm dizesini hesaplar.
 */
export function computePaperCardMatrix({
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  elevation = 1,
  perspective = 1200,
  scale = 1,
}: PaperCardMatrixParams = {}): PaperCardMatrixResult {
  const elev = Math.max(0, elevation);

  const shadowY = Math.round(4 + elev * 10);
  const blur = Math.round(10 + elev * 24);
  const spread = Math.round(-2 - elev * 2);
  const shadowAlpha = (0.08 + elev * 0.04).toFixed(3);

  // Çok katmanlı yumuşak temas gölgesi (contact shadow)
  const contactY = Math.round(1 + elev * 2);
  const contactBlur = Math.round(3 + elev * 4);
  const contactAlpha = (0.12 + elev * 0.05).toFixed(3);

  const boxShadow = `0 ${contactY}px ${contactBlur}px rgba(45, 40, 42, ${contactAlpha}), 0 ${shadowY}px ${blur}px ${spread}px rgba(45, 40, 42, ${shadowAlpha})`;

  const transform = `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) rotateZ(${rotateZ.toFixed(2)}deg) scale(${scale.toFixed(3)})`;

  return {
    transform,
    boxShadow,
  };
}
