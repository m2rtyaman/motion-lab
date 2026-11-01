/**
 * KAMERA VE PERSPEKTİF MATEMATİĞİ (Opus Animasyon Rehberi Faz 4)
 * 
 * promptlar/07-shorts.md (Logaritmik kamera & Shorts güvenlik alanları)
 * promptlar/08-threejs-3d.md (CatmullRomCurve3 yolları)
 * promptlar/09-tesseract-4d.md (4D Hiperküp ve perspektif izdüşüm)
 */

export type Vector4 = [number, number, number, number];
export type Vector3 = [number, number, number];

/**
 * YouTube Shorts / Reels / TikTok dikey güvenlik sınırları
 */
export const SHORTS_MOBILE_SAFETY = {
  /** Ekranın üst kısmındaki sistem ve profil kör noktası: %12 */
  topSafeRatio: 0.12,
  /** Ekranın alt kısmındaki açıklama, müzik ve buton kör noktası: %20 */
  bottomSafeRatio: 0.20,
  /** Dikey formatta tek bakışta okunabilirlik için minimum metin genişlik oranı: %7 */
  minTextWidthRatio: 0.07,
} as const;

/**
 * Logaritmik Kamera Geri Çekilme Hesaplayıcısı
 * Opus 07: "İnsan beyni üstel büyümeyi sezemez; logaritmik geri çekilen kamera bunu bir saniyede gösterir."
 * 
 * @param progress 0.0 – 1.0 zaman ilerlemesi
 * @param minDist Başlangıç yakın kamera mesafesi
 * @param maxDist Bitiş uzak kamera mesafesi
 * @param base Logaritma tabanı çarpanı (varsayılan: 10)
 */
export function calculateLogarithmicDistance(
  progress: number,
  minDist: number,
  maxDist: number,
  base = 10
): number {
  const p = Math.max(0, Math.min(1, progress));
  const logFactor = Math.log(1 + (base - 1) * p) / Math.log(base);
  return minDist + (maxDist - minDist) * logFactor;
}

/**
 * 4D Hiperküp (Tesseract) Geometrisi
 * 16 Köşe (±1, ±1, ±1, ±1) ve yalnızca tek koordinatı farklı olan 32 Kenar.
 */
export function getTesseractGeometry(): { vertices4D: Vector4[]; edges: [number, number][] } {
  const vertices4D: Vector4[] = [];
  for (let x = -1; x <= 1; x += 2) {
    for (let y = -1; y <= 1; y += 2) {
      for (let z = -1; z <= 1; z += 2) {
        for (let w = -1; w <= 1; w += 2) {
          vertices4D.push([x, y, z, w]);
        }
      }
    }
  }

  const edges: [number, number][] = [];
  for (let i = 0; i < 16; i++) {
    for (let j = i + 1; j < 16; j++) {
      let diffCount = 0;
      for (let k = 0; k < 4; k++) {
        if (vertices4D[i][k] !== vertices4D[j][k]) diffCount++;
      }
      if (diffCount === 1) {
        edges.push([i, j]);
      }
    }
  }

  return { vertices4D, edges };
}

export interface Tesseract3DProjection {
  vertices3D: Vector3[];
  edges: [number, number][];
  wDepths: number[];
}

/**
 * 4D Tesseract'ı XW ve ZW düzlemlerinde döndürür ve 3D uzaya perspektif olarak izdüşürür.
 * Formül (Opus 09): k = d / (d - w), varsayılan d = 3.0
 */
export function projectTesseractTo3D(
  angleXW: number,
  angleZW: number,
  d = 3.0
): Tesseract3DProjection {
  const { vertices4D, edges } = getTesseractGeometry();
  const cosXW = Math.cos(angleXW);
  const sinXW = Math.sin(angleXW);
  const cosZW = Math.cos(angleZW);
  const sinZW = Math.sin(angleZW);

  const vertices3D: Vector3[] = [];
  const wDepths: number[] = [];

  for (const v of vertices4D) {
    const [x, y, z, w] = v;

    // XW dönüşümü
    const x1 = x * cosXW - w * sinXW;
    const w1 = x * sinXW + w * cosXW;

    // ZW dönüşümü
    const z2 = z * cosZW - w1 * sinZW;
    const w2 = z * sinZW + w1 * cosZW;

    // Perspektif projeksiyon katsayısı: k = d / (d - w)
    const denom = Math.max(0.1, d - w2);
    const k = d / denom;

    vertices3D.push([x1 * k, y * k, z2 * k]);
    wDepths.push(w2);
  }

  return { vertices3D, edges, wDepths };
}
