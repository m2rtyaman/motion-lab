/**
 * 2D Nokta arayüzü
 */
export interface Point2D {
  x: number;
  y: number;
}

/**
 * Kuadratik Bézier Eğrisi (3 Kontrol Noktası: P0, P1, P2)
 */
export interface QuadraticBezierCurve {
  p0: Point2D;
  p1: Point2D;
  p2: Point2D;
}

/**
 * Kübik Bézier Eğrisi (4 Kontrol Noktası: P0, P1, P2, P3)
 */
export interface CubicBezierCurve {
  p0: Point2D;
  p1: Point2D;
  p2: Point2D;
  p3: Point2D;
}

export interface BezierSampleResult extends Point2D {
  /** Anlık teğet vektörü (hız) */
  tangent: Point2D;
  /** Teğet açısı (derece, -180 .. 180) */
  headingDeg: number;
  /** Teğet açısı (radyan) */
  headingRad: number;
}

export interface CursorTrajectoryOptions {
  /** Başlangıç koordinatı */
  start: Point2D;
  /** Bitiş koordinatı (hedef buton / kart) */
  end: Point2D;
  /** Eğrilik şiddeti (0: düz çizgi, 0.2: hafif doğal yay, 0.5: belirgin kavis) */
  curvature?: number;
  /** Yay yönü ('cw': saat yönü, 'ccw': saatin tersi, 'auto': doğal el hareketine göre) */
  direction?: 'cw' | 'ccw' | 'auto';
  /** Tepe noktasının yol boyunca konumu (0..1, varsayılan 0.45 insan el biyomekaniği) */
  peakRatio?: number;
}

/**
 * Kuadratik Bézier eğrisini t parametresinde (0..1) çözer.
 * B(t) = (1-t)^2 * P0 + 2*(1-t)*t * P1 + t^2 * P2
 */
export function evaluateQuadraticBezier(
  p0: Point2D,
  p1: Point2D,
  p2: Point2D,
  t: number
): Point2D {
  const clampedT = Math.max(0, Math.min(1, t));
  const u = 1 - clampedT;
  const tt = clampedT * clampedT;
  const uu = u * u;

  return {
    x: uu * p0.x + 2 * u * clampedT * p1.x + tt * p2.x,
    y: uu * p0.y + 2 * u * clampedT * p1.y + tt * p2.y,
  };
}

/**
 * Kübik Bézier eğrisini t parametresinde (0..1) çözer ve teğet vektörünü verir.
 * B(t) = (1-t)^3 * P0 + 3*(1-t)^2*t * P1 + 3*(1-t)*t^2 * P2 + t^3 * P3
 */
export function evaluateCubicBezier(
  p0: Point2D,
  p1: Point2D,
  p2: Point2D,
  p3: Point2D,
  t: number
): BezierSampleResult {
  const clampedT = Math.max(0, Math.min(1, t));
  const u = 1 - clampedT;
  const tt = clampedT * clampedT;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * clampedT;

  const x = uuu * p0.x + 3 * uu * clampedT * p1.x + 3 * u * tt * p2.x + ttt * p3.x;
  const y = uuu * p0.y + 3 * uu * clampedT * p1.y + 3 * u * tt * p2.y + ttt * p3.y;

  // Birinci Türev B'(t) — Hız ve Teğet Vektörü
  const dx = 3 * uu * (p1.x - p0.x) + 6 * u * clampedT * (p2.x - p1.x) + 3 * tt * (p3.x - p2.x);
  const dy = 3 * uu * (p1.y - p0.y) + 6 * u * clampedT * (p2.y - p1.y) + 3 * tt * (p3.y - p2.y);

  const headingRad = Math.atan2(dy, dx);
  const headingDeg = (headingRad * 180) / Math.PI;

  return {
    x,
    y,
    tangent: { x: dx, y: dy },
    headingDeg,
    headingRad,
  };
}

/**
 * Doğal ve insansı fare imleci (cursor) yörüngesi üretir.
 * 
 * İnsan eli imleci düz bir cetvel gibi taşımaz; kol ve bilek ekseninde
 * hafif bir dışa/içe yaylanma (parabolik kavis) çizer.
 */
export function createCurvedCursorTrajectory(
  options: CursorTrajectoryOptions
): CubicBezierCurve {
  const {
    start,
    end,
    curvature = 0.22,
    direction = 'auto',
    peakRatio = 0.45,
  } = options;

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dist = Math.hypot(dx, dy);

  if (dist < 1e-4) {
    return { p0: start, p1: start, p2: end, p3: end };
  }

  // Normal birim vektör (-dy, dx)
  const normX = -dy / dist;
  const normY = dx / dist;

  // Otomatik kavis yönü (genelde sağ-alt veya sol-yukarı eğrisi)
  let sign = 1;
  if (direction === 'cw') {
    sign = 1;
  } else if (direction === 'ccw') {
    sign = -1;
  } else {
    // İnsan sağ kol kavis eğilimi: x artarken hafif aşağı yaylanma
    sign = dx >= 0 ? 1 : -1;
  }

  const offsetMagnitude = dist * curvature * sign;

  // Kontrol Noktaları: P1 erken hızlanma yayı, P2 hedefe yaklaşma sönümü
  const p1: Point2D = {
    x: start.x + dx * peakRatio * 0.75 + normX * offsetMagnitude,
    y: start.y + dy * peakRatio * 0.75 + normY * offsetMagnitude,
  };

  const p2: Point2D = {
    x: start.x + dx * (peakRatio + (1 - peakRatio) * 0.6) + normX * offsetMagnitude * 0.35,
    y: start.y + dy * (peakRatio + (1 - peakRatio) * 0.6) + normY * offsetMagnitude * 0.35,
  };

  return {
    p0: start,
    p1,
    p2,
    p3: end,
  };
}

/**
 * Kübik Bézier eğrisinin toplam yay uzunluğunu (arc length) yaklaşık hesaplar.
 */
export function getCubicBezierLength(curve: CubicBezierCurve, samples: number = 32): number {
  let length = 0;
  let prev = curve.p0;

  for (let i = 1; i <= samples; i++) {
    const t = i / samples;
    const pt = evaluateCubicBezier(curve.p0, curve.p1, curve.p2, curve.p3, t);
    length += Math.hypot(pt.x - prev.x, pt.y - prev.y);
    prev = pt;
  }

  return length;
}

/**
 * Remotion kare numarasına göre Bézier yörüngesi üzerinde anlık konumu döndürür.
 */
export function interpolateBezierFrame(
  frame: number,
  startFrame: number,
  durationFrames: number,
  curve: CubicBezierCurve,
  easeFn?: (p: number) => number
): BezierSampleResult {
  const elapsed = frame - startFrame;
  if (elapsed <= 0) {
    return evaluateCubicBezier(curve.p0, curve.p1, curve.p2, curve.p3, 0);
  }
  if (elapsed >= durationFrames) {
    return evaluateCubicBezier(curve.p0, curve.p1, curve.p2, curve.p3, 1);
  }

  let progress = elapsed / durationFrames;
  if (easeFn) {
    progress = easeFn(progress);
  }

  return evaluateCubicBezier(curve.p0, curve.p1, curve.p2, curve.p3, progress);
}

/**
 * Bézier eğrisini SVG path dizesine ('d') dönüştürür.
 */
export function bezierToSvgPath(curve: CubicBezierCurve): string {
  return `M ${curve.p0.x.toFixed(1)} ${curve.p0.y.toFixed(1)} C ${curve.p1.x.toFixed(1)} ${curve.p1.y.toFixed(1)}, ${curve.p2.x.toFixed(1)} ${curve.p2.y.toFixed(1)}, ${curve.p3.x.toFixed(1)} ${curve.p3.y.toFixed(1)}`;
}
