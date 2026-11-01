/**
 * RENDER SÖZLEŞMESİ VE DETERMINİSTİK ÇİZİM KÖPRÜSÜ
 * (Opus 5.5 Master Rehber — Sayfa 1-4, Adım 1)
 * 
 * "Tüm görsel durum zamanın saf fonksiyonu olsun: draw(t).
 * Rastgelelik sadece tohumlu üreteçle (mulberry32). Math.random yasak.
 * Sabit çözünürlük ve fps. devicePixelRatio ile net çizim."
 */

/**
 * Deterministik Mulberry32 PRNG (Sözde Rastgele Sayı Üreteci).
 * Her render'da ve her karede aynı tohumla birebir aynı sayı dizisini üretir.
 * 
 * @param seed Tamsayı tohum (örn: 42, 1337)
 * @returns 0.0 ile 1.0 arasında deterministik sayı döndüren fonksiyon
 */
export function mulberry32(seed: number): () => number {
  let s = Math.floor(seed);
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Verilen tohum ve aralık için deterministik float üretici
 */
export function seededRandomRange(seed: number, min: number, max: number): number {
  const prng = mulberry32(seed);
  return min + prng() * (max - min);
}

/**
 * 2D Canvas için Retina / Yüksek DPI net çizim ayarlayıcısı
 * Sayfa 3: "Sabit çözünürlük ve fps. devicePixelRatio ile net çizim."
 */
export function setupHiDPICanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  customDpr?: number
): void {
  const dpr = customDpr || (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.resetTransform?.();
  ctx.scale(dpr, dpr);
}

/**
 * URL sorgusundaki ?t=3.2 tek kare kontrol parametresini ayrıştırır
 * Sayfa 3: "URL'de ?t=3.2 verilirse o anı çizip dursun."
 */
export function parseFrameQuery(defaultTime = 0): number {
  if (typeof window === 'undefined' || !window.location) return defaultTime;
  const params = new URLSearchParams(window.location.search);
  const tStr = params.get('t');
  if (tStr) {
    const parsed = parseFloat(tStr);
    if (!Number.isNaN(parsed) && parsed >= 0) return parsed;
  }
  return defaultTime;
}
