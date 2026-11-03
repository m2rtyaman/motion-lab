/**
 * mobile-sting-math.ts
 * Deterministik geometri, spline ve 3D projeksiyon fonksiyonları:
 * - Wavy ribbon (dalgalı kurdele / rehber çizgi) Bézier spline eğrisi ve yay uzunluğu
 * - Circular aperture (dairesel radyal delik / diyafram) açılma interpolasyonu
 * - 3/4 açılı telefon perspektifi ve deterministik yüzen (idle tilt/bob) matris matematiği
 */

import { clamp } from './pure-motion-math.ts';

// ==========================================
// 1. WAVY RIBBON SPLINE MATH
// ==========================================

export interface WavyRibbonParams {
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  waveCount?: number;
  amplitude?: number;
  controlYOffset?: number;
}

export interface WavyRibbonResult {
  path: string;
  totalLength: number;
  points: Array<{ x: number; y: number }>;
}

/**
 * İki nokta arasında doğal akışlı kavisli Bézier kurdele yolu ve yaklaşık yay uzunluğu hesaplar.
 * Dalga salınımı (amplitude), hareket yönünün normal vektörüne (perpendicular) dik olarak uygulanır;
 * böylece hem yatay (16:9), hem dikey (9:16), hem de çapraz yönlerde simetrik dalgalanma sağlanır.
 */
export function computeWavyRibbonSpline({
  startX = 0,
  startY = 540,
  endX = 1920,
  endY = 540,
  waveCount = 3,
  amplitude = 120,
  controlYOffset = 0,
}: WavyRibbonParams = {}): WavyRibbonResult {
  const safeWaveCount = Math.max(1, Math.round(waveCount || 1));
  const dx = (endX - startX) / safeWaveCount;
  const dy = (endY - startY) / safeWaveCount;
  const segDist = Math.hypot(dx, dy);

  let path = `M ${startX.toFixed(2)} ${startY.toFixed(2)}`;
  const points: Array<{ x: number; y: number }> = [{ x: startX, y: startY }];

  if (segDist < 1e-6) {
    return {
      path: `M ${startX.toFixed(2)} ${startY.toFixed(2)} L ${endX.toFixed(2)} ${endY.toFixed(2)}`,
      totalLength: 1,
      points: [{ x: startX, y: startY }, { x: endX, y: endY }],
    };
  }

  // Normal birim vektör (hareket yönüne dik)
  const nx = -dy / segDist;
  const ny = dx / segDist;

  let totalLength = 0;
  let prevX = startX;
  let prevY = startY;

  for (let i = 0; i < safeWaveCount; i++) {
    const x0 = startX + i * dx;
    const y0 = startY + i * dy;
    const x1 = x0 + dx;
    const y1 = y0 + dy;

    // Dalga yönü: tek çift salınım
    const sign = i % 2 === 0 ? 1 : -1;
    const waveAmp = amplitude * sign;

    // İki kontrol noktası ile yumuşak S-eğrisi (normal vektör yönünde salınım)
    const cp1x = x0 + dx * 0.35 + nx * waveAmp;
    const cp1y = y0 + dy * 0.35 + ny * waveAmp + controlYOffset;
    const cp2x = x0 + dx * 0.65 - nx * waveAmp;
    const cp2y = y0 + dy * 0.65 - ny * waveAmp + controlYOffset;

    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${x1.toFixed(2)} ${y1.toFixed(2)}`;
    points.push({ x: x1, y: y1 });

    // Sayısal 8-noktalı yay uzunluğu integrali
    let arcSegLen = 0;
    let lx = prevX;
    let ly = prevY;
    const steps = 8;
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const it = 1 - t;
      const px = it * it * it * x0 + 3 * it * it * t * cp1x + 3 * it * t * t * cp2x + t * t * t * x1;
      const py = it * it * it * y0 + 3 * it * it * t * cp1y + 3 * it * t * t * cp2y + t * t * t * y1;
      arcSegLen += Math.hypot(px - lx, py - ly);
      lx = px;
      ly = py;
    }

    totalLength += arcSegLen;
    prevX = x1;
    prevY = y1;
  }

  return {
    path,
    totalLength: Math.max(1, Math.round(totalLength)),
    points,
  };
}

/**
 * Kurdelenin çizilme ilerlemesine (0..1) göre stroke-dashoffset değerini hesaplar.
 */
export function calculateRibbonDashOffset(progress: number, totalLength: number): number {
  const p = clamp(progress, 0, 1);
  const safeLen = Math.max(0, totalLength);
  return safeLen * (1 - p);
}

// ==========================================
// 2. CIRCULAR APERTURE WIPE MATH
// ==========================================

export interface CircularApertureParams {
  progress: number;
  maxRadius: number;
  minRadius?: number;
  centerX?: number | string;
  centerY?: number | string;
  exponent?: number;
}

export interface CircularApertureResult {
  radius: number;
  progress: number;
  clipPath: string;
  isFullyRevealed: boolean;
  scale: number;
  opacity: number;
  centerXStr: string;
  centerYStr: string;
}

/**
 * Sahneyi veya kartı dairesel radyal diyafram şeklinde delerek açan geometriyi hesaplar.
 */
export function computeCircularAperture({
  progress,
  maxRadius,
  minRadius = 0,
  centerX = '50%',
  centerY = '50%',
  exponent = 1.0,
}: CircularApertureParams): CircularApertureResult {
  const p = clamp(progress, 0, 1);
  const safeExponent = Math.max(0.1, exponent);
  const eased = Math.pow(p, safeExponent);
  const radius = minRadius + (maxRadius - minRadius) * eased;
  const isFullyRevealed = p >= 1.0;

  const cxStr = typeof centerX === 'number' ? `${centerX.toFixed(2)}px` : centerX;
  const cyStr = typeof centerY === 'number' ? `${centerY.toFixed(2)}px` : centerY;

  return {
    radius: Math.max(0, radius),
    progress: p,
    clipPath: `circle(${radius.toFixed(2)}px at ${cxStr} ${cyStr})`,
    isFullyRevealed,
    scale: 0.8 + 0.2 * eased,
    opacity: p > 0 ? clamp(p * 2, 0, 1) : 0,
    centerXStr: cxStr,
    centerYStr: cyStr,
  };
}

// ==========================================
// 3. 3/4 TILTED PHONE PERSPECTIVE MATRIX MATH
// ==========================================

export interface TiltedPhoneParams {
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  perspective?: number;
  floatPhase?: number;
  floatAmplitude?: number;
  scale?: number;
  translateY?: number;
  translateX?: number;
  includePerspective?: boolean;
}

export interface TiltedPhoneResult {
  transform: string;
  transformWithoutPerspective: string;
  effectiveRotateX: number;
  effectiveRotateY: number;
  effectiveRotateZ: number;
  effectiveTranslateX: number;
  effectiveTranslateY: number;
  scale: number;
  perspective: number;
}

/**
 * 3/4 açılı telefon perspektifi ve deterministik yüzen (idle tilt/bob) matris matematiği.
 * Standart referans: rotateY: -16deg, rotateX: 8deg, perspective: 1200px.
 */
export function computeTiltedPhoneMatrix({
  rotateX = 8,
  rotateY = -16,
  rotateZ = 0,
  perspective = 1200,
  floatPhase = 0,
  floatAmplitude = 1.5,
  scale = 1,
  translateY = 0,
  translateX = 0,
  includePerspective = true,
}: TiltedPhoneParams = {}): TiltedPhoneResult {
  const rad = floatPhase;
  const bobY = Math.sin(rad * 1.5) * (floatAmplitude * 4);
  const tiltX = Math.sin(rad) * floatAmplitude;
  const tiltY = Math.cos(rad) * (floatAmplitude * 0.8);

  const effectiveRotateX = rotateX + tiltX;
  const effectiveRotateY = rotateY + tiltY;
  const effectiveRotateZ = rotateZ;
  const effectiveTranslateX = translateX;
  const effectiveTranslateY = translateY + bobY;

  const transformWithoutPerspective = `translateX(${effectiveTranslateX.toFixed(2)}px) translateY(${effectiveTranslateY.toFixed(2)}px) rotateX(${effectiveRotateX.toFixed(2)}deg) rotateY(${effectiveRotateY.toFixed(2)}deg) rotateZ(${effectiveRotateZ.toFixed(2)}deg) scale(${scale})`;
  const transform = includePerspective
    ? `perspective(${perspective}px) ${transformWithoutPerspective}`
    : transformWithoutPerspective;

  return {
    transform,
    transformWithoutPerspective,
    effectiveRotateX,
    effectiveRotateY,
    effectiveRotateZ,
    effectiveTranslateX,
    effectiveTranslateY,
    scale,
    perspective,
  };
}
