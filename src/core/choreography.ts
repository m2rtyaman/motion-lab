import { DURATIONS, EASING, MOTION_OFFSET, TIMING } from './tokens';

export interface CameraKeyframe {
  /** Timeline absolute start time in seconds */
  at: number;
  /** Duration in seconds (default: 0.65s) */
  duration?: number;
  /** Zoom factor (e.g. 1.25 for close-up, 1.0 for wide) */
  scale?: number;
  /** Horizontal pan in px */
  x?: number;
  /** Vertical pan in px */
  y?: number;
  /** 3D pitch in degrees */
  rotateX?: number;
  /** 3D yaw in degrees */
  rotateY?: number;
  /** 2D roll in degrees */
  rotateZ?: number;
  /** Easing curve (default: expo.inOut) */
  ease?: string;
}

export interface WordBurstOptions {
  stagger?: number;
  duration?: number;
  ease?: string;
  yOffset?: number;
}

export interface SurfaceEnterOptions {
  yFrom?: number;
  scaleFrom?: number;
  duration?: number;
  ease?: string;
  itemSelector?: string;
  itemStagger?: number;
}

export interface DepthPushOptions {
  yShift?: number;
  scaleTo?: number;
  opacityTo?: number;
  blurPx?: number;
  duration?: number;
}

/**
 * 1. 3D Sinematik Kamera Orkestrasyonu (CameraRig)
 * Sabit web sayfası görüntüsünü kırar; sahneye gerçek yakın çekim, pan ve 3B açı katar.
 */
export const animateCamera = (
  tl: gsap.core.Timeline,
  rigSelector: string,
  keyframes: CameraKeyframe[]
): gsap.core.Timeline => {
  keyframes.forEach((kf, index) => {
    const vars: gsap.TweenVars = {
      duration: kf.duration ?? DURATIONS.camera,
      ease: kf.ease ?? EASING.expoInOut,
    };

    if (kf.scale !== undefined) vars.scale = kf.scale;
    if (kf.x !== undefined) vars.x = kf.x;
    if (kf.y !== undefined) vars.y = kf.y;
    if (kf.rotateX !== undefined) vars.rotateX = kf.rotateX;
    if (kf.rotateY !== undefined) vars.rotateY = kf.rotateY;
    if (kf.rotateZ !== undefined) vars.rotateZ = kf.rotateZ;

    if (index === 0 && kf.at === 0 && (kf.duration === 0 || kf.duration === undefined)) {
      tl.set(rigSelector, vars, 0);
    } else {
      tl.to(rigSelector, vars, kf.at);
    }
  });

  return tl;
};

/**
 * 2. Kelime Bazlı Kinetik Patlama (KineticText Word Burst)
 * Cümlelerin tek bir kütük gibi açılmasını engeller; her kelimeyi yay fiziğiyle fırlatır.
 */
export const animateWordBurst = (
  tl: gsap.core.Timeline,
  wordSelector: string,
  startTime: number,
  options: WordBurstOptions = {}
): gsap.core.Timeline => {
  const {
    stagger = TIMING.wordStagger,
    duration = DURATIONS.word,
    ease = EASING.backOut,
    yOffset = MOTION_OFFSET.wordY,
  } = options;

  tl.fromTo(
    wordSelector,
    {
      y: yOffset,
      opacity: 0,
      scale: MOTION_OFFSET.wordScaleFrom,
      rotateZ: MOTION_OFFSET.wordRotateFrom,
      filter: `blur(${MOTION_OFFSET.wordBlur}px)`,
    },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      rotateZ: 0,
      filter: 'blur(0px)',
      duration,
      stagger,
      ease,
    },
    startTime
  );

  return tl;
};

/**
 * 3. 4-Bileşenli Katmanlı Yüzey Girişi (SpecularCard / Archetype Entrance)
 * Önce ana cam konteyneri oturtur, hemen ardından iç alt elemanları şelale gibi akıtır.
 */
export const enterSurface = (
  tl: gsap.core.Timeline,
  surfaceSelector: string,
  startTime: number,
  options: SurfaceEnterOptions = {}
): gsap.core.Timeline => {
  const {
    yFrom = MOTION_OFFSET.surfaceY,
    scaleFrom = MOTION_OFFSET.surfaceScaleFrom,
    duration = DURATIONS.panel,
    ease = EASING.expoOut,
    itemSelector,
    itemStagger = TIMING.itemStagger,
  } = options;

  tl.fromTo(
    surfaceSelector,
    {
      y: yFrom,
      scale: scaleFrom,
      opacity: 0,
      filter: `blur(${MOTION_OFFSET.surfaceBlur}px)`,
    },
    {
      y: 0,
      scale: 1,
      opacity: 1,
      filter: 'blur(0px)',
      duration,
      ease,
    },
    startTime
  );

  if (itemSelector) {
    tl.fromTo(
      itemSelector,
      {
        y: MOTION_OFFSET.itemY,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: DURATIONS.item,
        stagger: itemStagger,
        ease: EASING.powerOut,
      },
      startTime + TIMING.itemLead
    );
  }

  return tl;
};

/**
 * 4. 3D Alan Derinliğine İtme (Depth-of-Field Push)
 * Yeni bir odak elemanı girdiğinde eski kartı flu, küçülmüş ve yarı saydam şekilde geriye iter.
 */
export const pushToDepth = (
  tl: gsap.core.Timeline,
  targetSelector: string,
  startTime: number,
  options: DepthPushOptions = {}
): gsap.core.Timeline => {
  const {
    yShift = MOTION_OFFSET.depthY,
    scaleTo = MOTION_OFFSET.depthScale,
    opacityTo = MOTION_OFFSET.depthOpacity,
    blurPx = MOTION_OFFSET.depthBlur,
    duration = DURATIONS.depthPush,
  } = options;

  tl.to(
    targetSelector,
    {
      y: yShift,
      scale: scaleTo,
      opacity: opacityTo,
      filter: `blur(${blurPx}px)`,
      duration,
      ease: EASING.powerOut,
    },
    startTime
  );

  return tl;
};

/**
 * 5. Kesintisiz Bindirmeli Geçiş (Overlapping Beat Cross-Cut)
 * İki sahne arasında ölü kare bırakmaz; önceki beat çıkarken yeni beat 0.16s erken girer.
 */
export const crossCutBeats = (
  tl: gsap.core.Timeline,
  outSelector: string,
  inSelector: string,
  cutTime: number,
  inItemSelector?: string
): gsap.core.Timeline => {
  // Çıkış (%35 daha hızlı)
  tl.to(
    outSelector,
    {
      y: MOTION_OFFSET.exitY,
      scale: MOTION_OFFSET.exitScale,
      opacity: 0,
      filter: `blur(${MOTION_OFFSET.exitBlur}px)`,
      duration: DURATIONS.exit,
      ease: EASING.quickIn,
    },
    cutTime
  );

  // Bindirmeli Giriş (0.16s erken başlar)
  enterSurface(tl, inSelector, cutTime + TIMING.crossCutOverlap, {
    itemSelector: inItemSelector,
  });

  return tl;
};
