/**
 * FOURIER DFT (AYRIK FOURIER DÖNÜŞÜMÜ) MATEMATİK MOTORU
 * (Opus 5.5 Master Rehber — Sayfa 8, Prompt 4: Eğitici Animasyon)
 * 
 * "Gerçek hesap: kalp veya harita şeklinin parametrik denkleminden noktalar al,
 * kodda DFT ile katsayıları hesapla, çemberleri bu katsayılarla döndür.
 * Sahte animasyon yok."
 */

export interface Epicycle {
  freq: number;
  radius: number;
  phase: number;
}

export interface EpicyclePoint {
  x: number;
  y: number;
}

/**
 * 2D Noktalar kümesine Ayrık Fourier Dönüşümü (DFT) uygular.
 * Çemberleri genliklerine (radius) göre büyükten küçüğe sıralayarak döndürür.
 * 
 * @param points Çizilecek şeklin [x, y] koordinat dizisi
 * @returns Epicycle çember parametreleri dizisi
 */
export function calculateDFT2D(points: EpicyclePoint[]): {
  epicyclesX: Epicycle[];
  epicyclesY: Epicycle[];
} {
  const N = points.length;
  if (N === 0) return { epicyclesX: [], epicyclesY: [] };

  const xVals = points.map((p) => p.x);
  const yVals = points.map((p) => p.y);

  const epicyclesX = compute1DDFT(xVals);
  const epicyclesY = compute1DDFT(yVals);

  // Genliğe göre azalan sıralama (büyük ana çemberler önce çizilir)
  epicyclesX.sort((a, b) => b.radius - a.radius);
  epicyclesY.sort((a, b) => b.radius - a.radius);

  return { epicyclesX, epicyclesY };
}

function compute1DDFT(vals: number[]): Epicycle[] {
  const N = vals.length;
  const result: Epicycle[] = [];

  for (let k = 0; k < N; k++) {
    let re = 0;
    let im = 0;

    for (let n = 0; n < N; n++) {
      const phi = (2 * Math.PI * k * n) / N;
      re += vals[n] * Math.cos(phi);
      im -= vals[n] * Math.sin(phi);
    }

    re /= N;
    im /= N;

    const freq = k;
    const radius = Math.sqrt(re * re + im * im);
    const phase = Math.atan2(im, re);

    result.push({ freq, radius, phase });
  }

  return result;
}

/**
 * Belirli bir t (0..2*PI) anında epicycle çember zincirini çözer
 * 
 * @param x Başlangıç X ofseti
 * @param y Başlangıç Y ofseti
 * @param rotation Ekstra global dönme açısı
 * @param epicycles Epicycle dizisi
 */
export function evaluateEpicycles(
  originX: number,
  originY: number,
  rotation: number,
  epicycles: Epicycle[],
  t: number
): { endPoint: EpicyclePoint; centers: EpicyclePoint[]; radii: number[] } {
  let cx = originX;
  let cy = originY;
  const centers: EpicyclePoint[] = [];
  const radii: number[] = [];

  for (const epi of epicycles) {
    centers.push({ x: cx, y: cy });
    radii.push(epi.radius);

    const theta = epi.freq * t + epi.phase + rotation;
    cx += epi.radius * Math.cos(theta);
    cy += epi.radius * Math.sin(theta);
  }

  return {
    endPoint: { x: cx, y: cy },
    centers,
    radii,
  };
}
