/**
 * pure-motion-math.ts
 * motion-graphics-main motorundan devralınan saf matematiksel yay ve kamera interpolatörleri.
 * Bağımlılıksız, 60 FPS GPU-düzeyi deterministik hareket matematiği.
 */

export function clamp(x: number, a: number = 0, b: number = 1): number {
  return Math.min(b, Math.max(a, x));
}

export function lerp(a: number, b: number, k: number): number {
  return a + (b - a) * k;
}

export function easeOutCubic(x: number): number {
  const c = clamp(x);
  return 1 - Math.pow(1 - c, 3);
}

export function easeInOutCubic(x: number): number {
  const c = clamp(x);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

export const PURE_SPRING_PRESETS = {
  MORPH: [15, 0.84] as const,
  FAST: [27, 0.86] as const,
  SLOW: [12.5, 0.9] as const,
  SOFT: [10, 0.95] as const,
  CAM: [7.5, 1.0] as const,
  SNAPPY: [22, 0.78] as const,
};

/**
 * Damped spring step response (0 -> 1)
 * @param t Geçen zaman (saniye)
 * @param w Hız/Frekans (8: yavaş, 14: doğal, 22: çevik/snappy)
 * @param z Sönümleme oranı (0.82: hafif overshoot, 1.0: kritik sönümlü / no overshoot)
 */
export function dampedSpring(t: number, w: number = 14, z: number = 0.82): number {
  if (t <= 0) return 0;
  if (!isFinite(w)) return 1;
  if (z < 1) {
    const wd = w * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
  }
  if (z > 1 + 1e-6) {
    const q = w * Math.sqrt(z * z - 1);
    const r1 = -z * w + q;
    const r2 = -z * w - q;
    return 1 - (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1);
  }
  return 1 - Math.exp(-w * t) * (1 + w * t);
}

export type SpringTrackKey = [time: number, targetValue: number, w?: number, z?: number];

/**
 * Birden fazla hedefe ardışık yayılan dinamik değer takipçisi
 */
export function trackSpring(v0: number, keys: SpringTrackKey[]): (t: number) => number {
  return (t: number) => {
    let v = v0;
    let p = v0;
    for (const [tk, val, w = 14, z = 0.82] of keys) {
      v += (val - p) * dampedSpring(t - tk, w, z);
      p = val;
    }
    return v;
  };
}

export type KeyframeEntry = [time: number, value: number, easeFn?: (t: number) => number];

/**
 * Kamera ve sahne geçişleri için hassas interpolasyon
 */
export function kfInterpolate(keys: KeyframeEntry[]): (t: number) => number {
  return (t: number) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [a, va] = keys[i - 1];
      const [b, vb, e = easeInOutCubic] = keys[i];
      if (t <= b) {
        return lerp(va, vb, e((t - a) / (b - a)));
      }
    }
    return keys[keys.length - 1][1];
  };
}

/**
 * İçerik değiştirici (Content Swap / M.vis):
 * Çıkan katman hızla bulanıklaşır (lout), giren katman bekleme sonrası netleşir (din/lin).
 */
export interface VisOptions {
  din?: number;
  lin?: number;
  lout?: number;
  blur?: number;
}

export interface VisResult {
  opacity: number;
  blur: number;
  scale: number;
}

export function layerVisibility(
  t: number,
  tin: number | null,
  tout: number | null,
  opts: VisOptions = {}
): VisResult {
  const din = opts.din ?? 0.07;
  const lin = opts.lin ?? 0.26;
  const lout = opts.lout ?? 0.12;
  const bl = opts.blur ?? 12;

  const a = tin == null ? 1 : easeOutCubic((t - tin - din) / lin);
  const b = tout == null ? 0 : easeOutCubic((t - tout) / lout);
  const opacity = a * (1 - b);
  const blur = (1 - a) * bl + b * bl * 0.8;
  const scale = (0.94 + 0.06 * a) * (1 - 0.03 * b);

  return { opacity, blur, scale };
}

/**
 * Organik imleç / nokta hareketi (M.path):
 * Doğrusal keskin hatlar yerine doğal mikro-kavisli (sinusoidal arc) hareket sağlar.
 */
export type CursorKeyframe = [t: number, x: number, y: number];

export function curvedPath(keys: CursorKeyframe[]): (t: number) => { x: number; y: number } {
  return (t: number) => {
    if (t <= keys[0][0]) return { x: keys[0][1], y: keys[0][2] };
    const last = keys[keys.length - 1];
    if (t >= last[0]) return { x: last[1], y: last[2] };

    let i = 0;
    while (t >= keys[i + 1][0]) i++;

    const [t0, x0, y0] = keys[i];
    const [t1, x1, y1] = keys[i + 1];
    const u = easeInOutCubic((t - t0) / (t1 - t0));
    const dx = x1 - x0;
    const dy = y1 - y0;
    const arc = Math.sin(Math.PI * u) * 0.06;

    return {
      x: x0 + dx * u - dy * arc,
      y: y0 + dy * u + dx * arc,
    };
  };
}
