/**
 * ParametricCurves.ts
 * Deterministik matematiksel eğri ve SVG yol üreticisi.
 * Serbest el koordinat uydurmayı önler; tüm yollar analitik geometri ve deterministik tohum fonksiyonlarıyla üretilir.
 */

export interface SineWaveOptions {
  width: number;
  height: number;
  cycles?: number;
  amplitude?: number;
  phase?: number;
  points?: number;
}

export function generateSineWavePath({
  width,
  height,
  cycles = 2,
  amplitude = 24,
  phase = 0,
  points = 64,
}: SineWaveOptions): string {
  const midY = height / 2;
  const step = width / points;
  let d = '';

  for (let i = 0; i <= points; i++) {
    const x = i * step;
    const progress = (i / points) * (cycles * 2 * Math.PI);
    const y = midY + Math.sin(progress + phase) * amplitude;
    if (i === 0) {
      d += `M ${x.toFixed(2)} ${y.toFixed(2)}`;
    } else {
      d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
  }

  return d;
}

export interface SparklinePoint {
  x: number;
  y: number;
  value: number;
}

export interface SparklineResult {
  pathD: string;
  areaD: string;
  points: SparklinePoint[];
}

/**
 * Catmull-Rom veya Monotone Cubic Bezier ile pürüzsüzleştirilmiş veri çizgisi üretir.
 */
export function generateSmoothSparkline(
  data: number[],
  width: number,
  height: number,
  padding: number = 16
): SparklineResult {
  if (!data || data.length === 0) {
    return { pathD: '', areaD: '', points: [] };
  }

  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal || 1;

  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const stepX = innerW / Math.max(1, data.length - 1);

  const pts: SparklinePoint[] = data.map((val, idx) => {
    const x = padding + idx * stepX;
    const normalizedY = (val - minVal) / range;
    const y = padding + (1 - normalizedY) * innerH;
    return { x, y, value: val };
  });

  if (pts.length === 1) {
    const p = pts[0];
    return {
      pathD: `M ${p.x} ${p.y} L ${p.x + 1} ${p.y}`,
      areaD: `M ${p.x} ${p.y} L ${p.x + 1} ${p.y} L ${p.x + 1} ${height - padding} L ${p.x} ${height - padding} Z`,
      points: pts,
    };
  }

  // Smooth Catmull-Rom to Cubic Bezier
  let pathD = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;

    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    pathD += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  const lastPt = pts[pts.length - 1];
  const firstPt = pts[0];
  const baselineY = height - padding;
  const areaD = `${pathD} L ${lastPt.x.toFixed(2)} ${baselineY.toFixed(2)} L ${firstPt.x.toFixed(2)} ${baselineY.toFixed(2)} Z`;

  return { pathD, areaD, points: pts };
}

export interface SpiralOptions {
  centerX: number;
  centerY: number;
  maxRadius: number;
  coils?: number;
  points?: number;
}

export function generateSpiralPath({
  centerX,
  centerY,
  maxRadius,
  coils = 3,
  points = 120,
}: SpiralOptions): string {
  let d = '';
  const totalAngle = coils * 2 * Math.PI;

  for (let i = 0; i <= points; i++) {
    const t = i / points;
    const angle = t * totalAngle;
    const r = t * maxRadius;
    const x = centerX + Math.cos(angle) * r;
    const y = centerY + Math.sin(angle) * r;

    if (i === 0) {
      d += `M ${x.toFixed(2)} ${y.toFixed(2)}`;
    } else {
      d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
  }

  return d;
}

/**
 * Deterministik sözde rastgele sayı üreteci (Mulberry32)
 */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface PerlinContourOptions {
  width: number;
  height: number;
  seed?: number;
  segments?: number;
  amplitude?: number;
}

export function generatePerlinContour({
  width,
  height,
  seed = 42,
  segments = 12,
  amplitude = 30,
}: PerlinContourOptions): string {
  const rng = mulberry32(seed);
  const midY = height / 2;
  const stepX = width / segments;

  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= segments; i++) {
    const x = i * stepX;
    const offset = (rng() * 2 - 1) * amplitude;
    points.push({ x, y: midY + offset });
  }

  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    d += ` Q ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}, ${midX.toFixed(2)} ${midY.toFixed(2)}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x.toFixed(2)} ${last.y.toFixed(2)}`;

  return d;
}
