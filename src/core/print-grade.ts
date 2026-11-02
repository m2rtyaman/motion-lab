/**
 * PRINT GRADE & ANALOG ARCHIVAL COLOR MAPPING
 * 
 * Based on Opus 5.5 Archive & Kino-Montage visual references:
 * - S-curve percentile tone mapping (contrast control without blowout)
 * - Two-value ink-and-paper palette mapper (warm black & warm off-white)
 * - Deterministic per-frame analog film flicker (Mulberry32 PRNG)
 */

/**
 * Applies an archival S-curve tone curve to normalized luminance [0, 1].
 * Formula: x + s * (x - 0.5) * (1 - |2x - 1|) * 2
 * 
 * @param lum Normalized luminance [0, 1]
 * @param s Contrast steepness (default 0.32 for archival footage, 0.18 for paper documents)
 * @returns Contrast-mapped luminance [0, 1]
 */
export function printToneCurve(lum: number, s: number = 0.32): number {
  const x = Math.max(0, Math.min(1, lum));
  const curve = x + s * (x - 0.5) * (1 - Math.abs(2 * x - 1)) * 2;
  return Math.max(0, Math.min(1, curve));
}

/**
 * Maps a single luminance value or graded factor to an ink-and-paper RGB space.
 * rgb = INK + (PAPER - INK) * lum
 * 
 * @param lum Normalized luminance [0, 1]
 * @param inkRgb Base ink color RGB tuple (e.g. [22, 23, 27] for warm black #16171B)
 * @param paperRgb Base paper color RGB tuple (e.g. [237, 229, 205] for warm cream #EDE5CD)
 * @returns Interpolated [R, G, B] clamped to [0, 255]
 */
export function mapToInkPaper(
  lum: number,
  inkRgb: [number, number, number] = [22, 23, 27],
  paperRgb: [number, number, number] = [237, 229, 205]
): [number, number, number] {
  const t = Math.max(0, Math.min(1, lum));
  return [
    Math.round(Math.max(0, Math.min(255, inkRgb[0] + (paperRgb[0] - inkRgb[0]) * t))),
    Math.round(Math.max(0, Math.min(255, inkRgb[1] + (paperRgb[1] - inkRgb[1]) * t))),
    Math.round(Math.max(0, Math.min(255, inkRgb[2] + (paperRgb[2] - inkRgb[2]) * t))),
  ];
}

/**
 * Deterministic integer hash for frame-based analog flicker.
 */
function hashFrame(frame: number, seed: number): number {
  let a = (Math.floor(frame) ^ (seed * 0x9e3779b9)) | 0;
  a = Math.imul(a ^ (a >>> 16), 0x85ebca6b);
  a = Math.imul(a ^ (a >>> 13), 0xc2b2ae35);
  return ((a ^ (a >>> 16)) >>> 0) / 4294967296;
}

/**
 * Produces a deterministic per-frame analog film flicker multiplier.
 * Centered around 1.0 within [1 - amplitude, 1 + amplitude].
 * 
 * @param frame Current video frame number
 * @param amplitude Flicker range (default 0.025 for ±2.5% archival fluctuation)
 * @param seed Mulberry/PRNG seed
 * @returns Flicker multiplier (e.g. 0.975 - 1.025)
 */
export function seededPerFrameFlicker(
  frame: number,
  amplitude: number = 0.025,
  seed: number = 42
): number {
  const h = hashFrame(frame, seed);
  return 1.0 + (h * 2 - 1) * amplitude;
}
