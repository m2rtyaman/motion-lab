import { DURATIONS, EASING } from './tokens';

/**
 * UZAMSAL KAMERA KOREOGRAFİSİ (v5)
 *
 * 2D slayt gösterisi (opacity/blur) yerine gerçek 3D uzamsal akış (spatial continuity) sağlar.
 * Yalnızca transform (x, y, scale, rotateX, rotateY, rotateZ) tween edilir.
 */

export interface SpatialCameraKeyframe {
  at: number;
  duration?: number;
  x?: number;
  y?: number;
  scale?: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  ease?: string;
}

export interface FocusZoomOptions {
  /** Odaklanılacak UI X koordinatı (canvas merkezine göre px) */
  targetX: number;
  /** Odaklanılacak UI Y koordinatı (canvas merkezine göre px) */
  targetY: number;
  /** Yakınlaşma katsayısı (örn: 1.6 veya 1.8) */
  scale?: number;
  /** Eğim (3D açı) */
  rotateX?: number;
  rotateY?: number;
  duration?: number;
  ease?: string;
}

export interface IsometricTiltOptions {
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  scale?: number;
  duration?: number;
  ease?: string;
}

export interface CanvasPanOptions {
  toX: number;
  toY?: number;
  scale?: number;
  duration?: number;
  ease?: string;
}

/**
 * 1. 2.5D İzometrik Eğim (IsometricTilt)
 * Arayüzü 3D uzayda yüzer halde şık bir açıyla sergiler.
 */
export const applyIsometricTilt = (
  tl: gsap.core.Timeline,
  selector: string,
  at: number,
  options: IsometricTiltOptions = {}
): gsap.core.Timeline => {
  const {
    rotateX = 14,
    rotateY = -18,
    rotateZ = 3,
    scale = 1.04,
    duration = DURATIONS.camera,
    ease = EASING.expoInOut,
  } = options;

  tl.to(
    selector,
    {
      rotateX,
      rotateY,
      rotateZ,
      scale,
      duration,
      ease,
    },
    at
  );

  return tl;
};

/**
 * 2. Hedef Koordinata Odaklanma (FocusZoom)
 * Arka planda tüm uygulama dururken belirli bir karta veya butona pürüzsüzce yaklaşır.
 */
export const applyFocusZoom = (
  tl: gsap.core.Timeline,
  selector: string,
  at: number,
  options: FocusZoomOptions
): gsap.core.Timeline => {
  const {
    targetX,
    targetY,
    scale = 1.75,
    rotateX = -2,
    rotateY = 0,
    duration = DURATIONS.camera,
    ease = EASING.expoOut,
  } = options;

  // Koordinatı merkeze getirecek ters yönlü pan hesaplaması
  const panX = -targetX * (scale - 1);
  const panY = -targetY * (scale - 1);

  tl.to(
    selector,
    {
      x: panX,
      y: panY,
      scale,
      rotateX,
      rotateY,
      rotateZ: 0,
      duration,
      ease,
    },
    at
  );

  return tl;
};

/**
 * 3. Sonsuz Tuval Kaydırması (InfiniteCanvasPan)
 * Sahneler arası geçişte karartma yapmaz; kamerayı geniş tuval üzerinde yana kaydırır.
 */
export const applyCanvasPan = (
  tl: gsap.core.Timeline,
  selector: string,
  at: number,
  options: CanvasPanOptions
): gsap.core.Timeline => {
  const {
    toX,
    toY = 0,
    scale = 1,
    duration = DURATIONS.camera,
    ease = EASING.expoInOut,
  } = options;

  tl.to(
    selector,
    {
      x: toX,
      y: toY,
      scale,
      duration,
      ease,
    },
    at
  );

  return tl;
};

/**
 * 4. Normale Yerleşme / Sıfırlama (CameraSettle)
 * Kamerayı sıfır eğim ve 1.0 ölçekle düz görünüme kilitler.
 */
export const applyCameraSettle = (
  tl: gsap.core.Timeline,
  selector: string,
  at: number,
  options: { duration?: number; ease?: string; scale?: number; y?: number } = {}
): gsap.core.Timeline => {
  const {
    duration = DURATIONS.camera,
    ease = EASING.expoOut,
    scale = 1,
    y = 0,
  } = options;

  tl.to(
    selector,
    {
      x: 0,
      y,
      scale,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      duration,
      ease,
    },
    at
  );

  return tl;
};
