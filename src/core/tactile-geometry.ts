/**
 * tactile-geometry.ts
 * Deterministik geometri ve interpolasyon fonksiyonları:
 * - Curved brace (kavisli ayraç / bracket) spline matematiği
 * - 1-to-3 capsule cluster uzamsal genişleme interpolasyonu
 * - Spotlight konisi yamuk / trapezoid geometri matematiği
 * - Deterministik pastel square confetti patlama fiziği
 */

import { clamp, easeOutCubic } from './pure-motion-math.ts';

// ==========================================
// 1. CURVED BRACE SPLINE MATH
// ==========================================

export interface CurvedBraceParams {
  x1: number;
  x2: number;
  y: number;
  depth?: number;
  orientation?: 'down' | 'up';
}

export interface CurvedBraceResult {
  path: string;
  midX: number;
  tipY: number;
  width: number;
  depth: number;
}

/**
 * Üçlü kapsülleri üstten veya alttan özet skoruna bağlayan pürüzsüz SVG kavisli ayraç (curly brace) üretir.
 */
export function computeCurvedBracePath({
  x1,
  x2,
  y,
  depth = 24,
  orientation = 'down',
}: CurvedBraceParams): CurvedBraceResult {
  const left = Math.min(x1, x2);
  const right = Math.max(x1, x2);
  const width = Math.max(0, right - left);
  const midX = (left + right) / 2;
  const d = orientation === 'down' ? Math.abs(depth) : -Math.abs(depth);
  const tipY = y + d;

  if (width < 1e-4) {
    return {
      path: `M ${left} ${y} L ${midX} ${tipY} L ${right} ${y}`,
      midX,
      tipY,
      width: 0,
      depth: d,
    };
  }

  // Köşe ve uç yuvarlama yarıçapı (genişliğin 1/8'i veya derinliğin yarısı ile sınırlandırılır)
  const r = Math.min(width / 8, Math.abs(d) / 2, 20);
  const halfD = d / 2;

  // 4 parçalı pürüzsüz Kübik Bezier kavisli ayraç:
  // 1. Sol köşe: (left, y) -> (left + r, y + halfD)
  // 2. Sol kol: (left + r, y + halfD) -> (midX - r, y + halfD) -> (midX, y + d)
  // 3. Sağ kol: (midX, y + d) -> (midX + r, y + halfD) -> (right - r, y + halfD)
  // 4. Sağ köşe: (right - r, y + halfD) -> (right, y)
  const p1 = `M ${left.toFixed(2)} ${y.toFixed(2)}`;
  const cLeftCorner = `C ${left.toFixed(2)} ${(y + halfD / 2).toFixed(2)}, ${(left + r / 2).toFixed(2)} ${(y + halfD).toFixed(2)}, ${(left + r).toFixed(2)} ${(y + halfD).toFixed(2)}`;
  const lLeftArm = `L ${(midX - r).toFixed(2)} ${(y + halfD).toFixed(2)}`;
  const cTipLeft = `C ${(midX - r / 2).toFixed(2)} ${(y + halfD).toFixed(2)}, ${midX.toFixed(2)} ${(y + d * 0.75).toFixed(2)}, ${midX.toFixed(2)} ${tipY.toFixed(2)}`;
  const cTipRight = `C ${midX.toFixed(2)} ${(y + d * 0.75).toFixed(2)}, ${(midX + r / 2).toFixed(2)} ${(y + halfD).toFixed(2)}, ${(midX + r).toFixed(2)} ${(y + halfD).toFixed(2)}`;
  const lRightArm = `L ${(right - r).toFixed(2)} ${(y + halfD).toFixed(2)}`;
  const cRightCorner = `C ${(right - r / 2).toFixed(2)} ${(y + halfD).toFixed(2)}, ${right.toFixed(2)} ${(y + halfD / 2).toFixed(2)}, ${right.toFixed(2)} ${y.toFixed(2)}`;

  const path = `${p1} ${cLeftCorner} ${lLeftArm} ${cTipLeft} ${cTipRight} ${lRightArm} ${cRightCorner}`;

  return {
    path,
    midX,
    tipY,
    width,
    depth: d,
  };
}

// ==========================================
// 2. 1-TO-3 CAPSULE CLUSTER SPACING
// ==========================================

export interface ClusterPillTransform {
  index: number;
  x: number;
  opacity: number;
  scale: number;
  progress: number;
}

/**
 * 1-to-3 hap kapsül açılma animasyonu için kademeli uzamsal ofsetleri hesaplar.
 * Progress = 0: Tüm kapsüller merkezde (x = 0), yan kapsüller görünmez.
 * Progress = 1: Merkez (x = 0), sol (x = -spacing), sağ (x = +spacing).
 */
export function interpolateClusterPositions(
  progress: number,
  spacing: number = 190,
  stagger: number = 0.15
): ClusterPillTransform[] {
  const pClamped = clamp(progress, 0, 1);
  const safeStagger = clamp(stagger, 0, 0.85);
  const span = Math.max(1e-4, 1 - safeStagger);

  // Sol kapsülün interpolasyonu (0 -> 1 - safeStagger aralığında genişler)
  const leftRaw = clamp(pClamped / span, 0, 1);
  const leftP = easeOutCubic(leftRaw);

  // Sağ kapsülün interpolasyonu (safeStagger -> 1 aralığında gecikmeli genişler)
  const rightRaw = clamp((pClamped - safeStagger) / span, 0, 1);
  const rightP = easeOutCubic(rightRaw);

  return [
    {
      index: 0,
      x: leftP === 0 ? 0 : -spacing * leftP,
      opacity: leftP,
      scale: 0.8 + 0.2 * leftP,
      progress: leftP,
    },
    {
      index: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      progress: 1,
    },
    {
      index: 2,
      x: rightP === 0 ? 0 : spacing * rightP,
      opacity: rightP,
      scale: 0.8 + 0.2 * rightP,
      progress: rightP,
    },
  ];
}

// ==========================================
// 3. SPOTLIGHT CONE PATH GEOMETRY
// ==========================================

export interface SpotlightConeParams {
  topCenterX: number;
  topY: number;
  topWidth: number;
  bottomWidth: number;
  height: number;
}

export interface SpotlightConeGeometry {
  path: string;
  vertices: Array<{ x: number; y: number }>;
  beamAngleDeg: number;
  area: number;
  midpoint: { x: number; y: number };
}

/**
 * Tavandan dikey vuran ışık konisi (yamuk/trapezoid) geometrisini ve saçılma açısını hesaplar.
 */
export function computeSpotlightConeGeometry({
  topCenterX,
  topY,
  topWidth,
  bottomWidth,
  height,
}: SpotlightConeParams): SpotlightConeGeometry {
  const safeHeight = Math.max(1e-4, height);
  const halfTop = topWidth / 2;
  const halfBottom = bottomWidth / 2;

  const v0 = { x: topCenterX - halfTop, y: topY };
  const v1 = { x: topCenterX + halfTop, y: topY };
  const v2 = { x: topCenterX + halfBottom, y: topY + safeHeight };
  const v3 = { x: topCenterX - halfBottom, y: topY + safeHeight };

  const path = `M ${v0.x.toFixed(2)} ${v0.y.toFixed(2)} L ${v1.x.toFixed(2)} ${v1.y.toFixed(2)} L ${v2.x.toFixed(2)} ${v2.y.toFixed(2)} L ${v3.x.toFixed(2)} ${v3.y.toFixed(2)} Z`;

  // Saçılma açısı: 2 * atan((bottomHalf - topHalf) / height)
  const spread = Math.abs(bottomWidth - topWidth) / 2;
  const beamAngleRad = 2 * Math.atan2(spread, safeHeight);
  const beamAngleDeg = (beamAngleRad * 180) / Math.PI;

  const area = ((topWidth + bottomWidth) / 2) * safeHeight;
  const midpoint = {
    x: topCenterX,
    y: topY + safeHeight / 2,
  };

  return {
    path,
    vertices: [v0, v1, v2, v3],
    beamAngleDeg,
    area,
    midpoint,
  };
}

// ==========================================
// 4. DETERMINISTIC CONFETTI BURST
// ==========================================

export interface ConfettiParticle {
  id: number;
  baseAngle: number;
  targetRadius: number;
  rotationSpeed: number;
  baseSize: number;
  color: string;
  jitterX: number;
  jitterY: number;
}

export interface ConfettiFrameState {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
  color: string;
  size: number;
}

/**
 * Mulberry32 deterministik rastgele sayı üreteci
 */
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministik tohum ile kutlama konfeti parçacıklarını oluşturur.
 */
export function generateConfettiParticles(
  count: number = 24,
  seed: number = 42,
  maxRadius: number = 140,
  colors: string[] = ['#63CDA9', '#EFB568', '#9A88CF', '#E98E88', '#C8D6C9']
): ConfettiParticle[] {
  const rand = mulberry32(seed);
  const particles: ConfettiParticle[] = [];

  for (let i = 0; i < count; i++) {
    const angleSlice = (Math.PI * 2) / count;
    const baseAngle = i * angleSlice + (rand() - 0.5) * 0.4;
    const targetRadius = maxRadius * (0.6 + 0.4 * rand());
    const rotationSpeed = (rand() - 0.5) * 720;
    const baseSize = 6 + rand() * 5;
    const color = colors[Math.floor(rand() * colors.length)] || colors[0];
    const jitterX = (rand() - 0.5) * 12;
    const jitterY = (rand() - 0.5) * 12;

    particles.push({
      id: i,
      baseAngle,
      targetRadius,
      rotationSpeed,
      baseSize,
      color,
      jitterX,
      jitterY,
    });
  }

  return particles;
}

/**
 * Belirli bir progress (0 -> 1) anında parçacığın konum, opaklık ve ölçeğini değerlendirir.
 * 0.0 - 0.2: Hızlı patlama (easeOut)
 * 0.2 - 0.7: Süzülme / hafif yerçekimi
 * 0.7 - 1.0: Şeffaflaşarak kaybolma
 */
export function evaluateConfettiParticle(
  particle: ConfettiParticle,
  progress: number
): ConfettiFrameState {
  const p = clamp(progress, 0, 1);

  if (p <= 0) {
    return {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 0,
      opacity: 0,
      color: particle.color,
      size: particle.baseSize,
    };
  }

  if (p >= 1) {
    return {
      x: 0,
      y: 0,
      rotation: particle.rotationSpeed,
      scale: 0,
      opacity: 0,
      color: particle.color,
      size: particle.baseSize,
    };
  }

  const radialEase = easeOutCubic(Math.min(1, p * 1.5));
  const currentRadius = particle.targetRadius * radialEase;

  // Hafif yerçekimi etkisi (p arttıkça aşağı çeker)
  const gravityDrop = Math.pow(p, 2) * 35;

  const x = Math.cos(particle.baseAngle) * currentRadius + particle.jitterX * p;
  const y = Math.sin(particle.baseAngle) * currentRadius + gravityDrop + particle.jitterY * p;

  // Opaklık: 0.1'e kadar açılır, 0.7'den sonra kapanır
  let opacity = 1;
  if (p < 0.1) {
    opacity = p / 0.1;
  } else if (p > 0.7) {
    opacity = 1 - (p - 0.7) / 0.3;
  }

  // Ölçek: Başta 0'dan 1'e fırlar, sonda 0'a iner
  let scale = 1;
  if (p < 0.1) {
    scale = p / 0.1;
  } else if (p > 0.8) {
    scale = 1 - (p - 0.8) / 0.2;
  }

  const rotation = particle.rotationSpeed * p;

  return {
    x,
    y,
    rotation,
    scale,
    opacity: clamp(opacity, 0, 1),
    color: particle.color,
    size: particle.baseSize,
  };
}
