import { DURATIONS, EASING, MOTION_OFFSET, SCALE_CONTRAST } from './tokens.ts';

export type WhipPanDirection = 'left' | 'right' | 'up' | 'down';
export type MaskWipeType = 'diagonal' | 'horizontal' | 'vertical' | 'iris';

export interface WhipPanOptions {
  at: number;
  direction?: WhipPanDirection;
  duration?: number;
  distance?: number;
  easeOut?: string;
  easeIn?: string;
  blur?: number;
  streakSelector?: string;
  overlap?: number;
}

export interface MaskWipeOptions {
  at: number;
  type?: MaskWipeType;
  duration?: number;
  outgoingSelector?: string;
  specularSelector?: string;
  ease?: string;
}

export interface ContainerMorphOptions {
  at: number;
  duration?: number;
  containerScaleFrom?: number;
  containerScaleTo?: number;
  containerY?: number;
  outgoingBlur?: number;
  ease?: string;
}

export interface ZoomPunchOptions {
  at: number;
  duration?: number;
  zoomScale?: number;
  portalRingSelector?: string;
  ease?: string;
}

export interface ElementTakeoverOptions {
  at: number;
  duration?: number;
  takeoverScale?: number;
  useIris?: boolean;
  ease?: string;
}

export interface CameraDiveOptions {
  at: number;
  duration?: number;
  diveScale?: number;
  targetX?: number;
  targetY?: number;
  settleScale?: number;
  useIris?: boolean;
  ease?: string;
}

/**
 * 1. transitionWhipPan — Yüksek Hızlı Yönsel Kırbaç Geçişi
 * Sinematik kameranın veya sahnenin yüksek ivmeyle bir yöne savrulup yeni sahneyi getirmesi.
 * Gerçek hareket tasarımında yönsel hız çizgisi (streak) ve derinlik ivmesiyle çalışır.
 */
export const transitionWhipPan = (
  tl: gsap.core.Timeline,
  outgoingSelector: string,
  incomingSelector: string,
  options: WhipPanOptions
): gsap.core.Timeline => {
  const {
    at,
    direction = 'left',
    duration = DURATIONS.panel,
    distance = 1100,
    easeOut = EASING.expoOut,
    easeIn = 'power3.in',
    blur = 24,
    streakSelector,
    overlap = 0.16,
  } = options;

  let outX = 0;
  let outY = 0;
  let inStartX = 0;
  let inStartY = 0;

  switch (direction) {
    case 'left':
      outX = -distance;
      inStartX = distance;
      break;
    case 'right':
      outX = distance;
      inStartX = -distance;
      break;
    case 'up':
      outY = -distance;
      inStartY = distance;
      break;
    case 'down':
      outY = distance;
      inStartY = -distance;
      break;
  }

  // 1. Giden sahnenin savrulması (Exit with high momentum & directional blur)
  tl.to(
    outgoingSelector,
    {
      x: outX,
      y: outY,
      opacity: 0,
      scale: 0.95,
      filter: `blur(${blur}px)`,
      duration,
      ease: easeIn,
    },
    at
  );

  // 2. Varsa kinetik hız şeridi (Kinetic motion streak across viewport)
  if (streakSelector) {
    tl.fromTo(
      streakSelector,
      { x: direction === 'left' ? 1920 : -1920, opacity: 0, scaleX: 2.0 },
      { x: direction === 'left' ? -1920 : 1920, opacity: 0.85, scaleX: 1.0, duration, ease: EASING.expoInOut },
      at
    ).to(
      streakSelector,
      { opacity: 0, duration: DURATIONS.micro, ease: EASING.expoOut },
      at + duration
    );
  }

  // 3. Gelen sahnenin karşı yönden ivmeyle yerleşmesi (Entry with velocity)
  const incomingStart = at + duration - overlap;
  tl.fromTo(
    incomingSelector,
    {
      x: inStartX,
      y: inStartY,
      opacity: 0,
      scale: 1.04,
      filter: `blur(${blur}px)`,
    },
    {
      x: 0,
      y: 0,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      duration,
      ease: easeOut,
    },
    incomingStart
  );

  return tl;
};

/**
 * 2. transitionMaskWipe — Speküler Kenarlı Perde / İris Silme
 * Açılı veya dairesel maskeleme ile sahne geçişi ve parlak ışık süpürmesi.
 * Giden sahne silme boyunca altta görünür kalır ve siyah ekrana düşüş engellenir.
 */
export const transitionMaskWipe = (
  tl: gsap.core.Timeline,
  incomingSelector: string,
  options: MaskWipeOptions
): gsap.core.Timeline => {
  const {
    at,
    type = 'diagonal',
    duration = DURATIONS.scene,
    outgoingSelector,
    specularSelector,
    ease = EASING.expoInOut,
  } = options;

  let clipFrom = 'polygon(120% 0%, 120% 0%, 150% 100%, 150% 100%)';
  let clipTo = 'polygon(-30% 0%, 120% 0%, 150% 100%, -50% 100%)';

  if (type === 'diagonal') {
    clipFrom = 'polygon(120% 0%, 120% 0%, 150% 100%, 150% 100%)';
    clipTo = 'polygon(-30% 0%, 120% 0%, 150% 100%, -50% 100%)';
  } else if (type === 'iris') {
    clipFrom = 'circle(0% at 50% 50%)';
    clipTo = 'circle(120% at 50% 50%)';
  } else if (type === 'vertical') {
    clipFrom = 'inset(100% 0% 0% 0%)';
    clipTo = 'inset(0% 0% 0% 0%)';
  } else {
    // horizontal
    clipFrom = 'inset(0% 100% 0% 0%)';
    clipTo = 'inset(0% 0% 0% 0%)';
  }

  // Giden sahne silme tamamlanana kadar görünür kalır
  if (outgoingSelector) {
    tl.to(
      outgoingSelector,
      { opacity: 0, duration: DURATIONS.micro, ease: EASING.expoOut },
      at + duration
    );
  }

  // Gelen sahne maskeyle açılır
  tl.fromTo(
    incomingSelector,
    {
      clipPath: clipFrom,
      opacity: 1,
    },
    {
      clipPath: clipTo,
      opacity: 1,
      duration,
      ease,
    },
    at
  ).set(
    incomingSelector,
    { clipPath: 'none' },
    at + duration
  );

  // Speküler ışık bıçağı süpürmesi
  if (specularSelector) {
    tl.fromTo(
      specularSelector,
      { opacity: 0, x: 1920, scaleY: 0.8 },
      { opacity: 1, x: -100, scaleY: 1.2, duration, ease },
      at
    ).to(
      specularSelector,
      { opacity: 0, duration: DURATIONS.micro, ease: EASING.expoOut },
      at + duration
    );
  }

  return tl;
};

/**
 * 3. transitionContainerMorph — Tek Kap İlkesi Geometrik Dönüşümü
 * Ana sahne veya kart yapısı kesilmeden şekil, ölçek ve içerik değiştirerek bir sonraki sahneye evrilir.
 */
export const transitionContainerMorph = (
  tl: gsap.core.Timeline,
  containerSelector: string,
  outgoingContentSelector: string,
  incomingContentSelector: string,
  options: ContainerMorphOptions
): gsap.core.Timeline => {
  const {
    at,
    duration = DURATIONS.camera,
    containerScaleFrom = 1.0,
    containerScaleTo = 1.04,
    containerY = -18,
    outgoingBlur = MOTION_OFFSET.surfaceBlur,
    ease = EASING.expoInOut,
  } = options;

  const halfDur = duration * 0.55;

  // 1. Giden içeriğin süzülerek çıkışı
  tl.to(
    outgoingContentSelector,
    {
      opacity: 0,
      scale: 0.94,
      y: -36,
      filter: `blur(${outgoingBlur}px)`,
      duration: halfDur,
      ease: 'power2.in',
    },
    at
  );

  // 2. Kapsayıcının (Container) tek parça nefes alıp dönüşmesi
  tl.to(
    containerSelector,
    {
      scale: containerScaleTo,
      y: containerY,
      duration: halfDur,
      ease,
    },
    at
  ).to(
    containerSelector,
    {
      scale: containerScaleFrom,
      y: 0,
      duration: duration - halfDur + 0.15,
      ease: EASING.expoOut,
    },
    at + halfDur
  );

  // 3. Yeni içeriğin tek kap içine akışı
  tl.fromTo(
    incomingContentSelector,
    {
      opacity: 0,
      scale: 1.04,
      y: 36,
      filter: 'blur(16px)',
    },
    {
      opacity: 1,
      scale: 1.0,
      y: 0,
      filter: 'blur(0px)',
      duration: halfDur + 0.1,
      ease: EASING.expoOut,
    },
    at + halfDur * 0.65
  );

  return tl;
};

/**
 * 4. transitionZoomPunch — Diyafram ve Portal Derinlik İtişi
 * Sahnenin merkezine doğru hiper-hızla derinlik dalışı ve diyafram portal açılımı.
 */
export const transitionZoomPunch = (
  tl: gsap.core.Timeline,
  outgoingSelector: string,
  incomingSelector: string,
  options: ZoomPunchOptions
): gsap.core.Timeline => {
  const {
    at,
    duration = DURATIONS.camera,
    zoomScale = 2.8,
    portalRingSelector,
    ease = EASING.expoInOut,
  } = options;

  // 1. Giden sahnenin izleyiciye doğru patlaması
  tl.to(
    outgoingSelector,
    {
      scale: zoomScale,
      opacity: 0,
      filter: 'blur(28px)',
      duration,
      ease,
    },
    at
  );

  // 2. Varsa portal halkası dalgası
  if (portalRingSelector) {
    tl.fromTo(
      portalRingSelector,
      { opacity: 0, scale: 0.2 },
      { opacity: 1, scale: 3.6, duration: duration * 0.85, ease },
      at
    ).to(
      portalRingSelector,
      { opacity: 0, duration: DURATIONS.micro, ease: EASING.expoOut },
      at + duration * 0.75
    );
  }

  // 3. Gelen sahnenin derinlikten odaklanarak yerleşmesi
  tl.fromTo(
    incomingSelector,
    {
      scale: 0.68,
      opacity: 0,
      filter: 'blur(20px)',
    },
    {
      scale: 1.0,
      opacity: 1,
      filter: 'blur(0px)',
      duration: duration * 0.9,
      ease: EASING.expoOut,
    },
    at + duration * 0.35
  );

  return tl;
};

/**
 * 5. transitionElementTakeover — Bileşen Patlaması ve Tam Ekran Devralma (Scale Takeover)
 * Sahne içindeki küçük bir alt bileşenin (buton, rozet, metrik kartı) 15x-20x büyüyerek
 * tüm 1920x1080 ekranı yutması ve yeni sahnenin tam ekran zeminine dönüşmesi.
 * Ebeveyn pencerenin overflow-hidden sınırına takılmaması için gelen sahne dairesel/tam ekran
 * iris clip-path açılımı ile doğrudan üst katmanda patlar.
 */
export const transitionElementTakeover = (
  tl: gsap.core.Timeline,
  triggerSelector: string,
  outgoingSelector: string,
  incomingSelector: string,
  options: ElementTakeoverOptions
): gsap.core.Timeline => {
  const {
    at,
    duration = DURATIONS.camera,
    takeoverScale = SCALE_CONTRAST.elementTakeover,
    ease = EASING.expoInOut,
  } = options;

  const halfDur = duration * 0.55;

  // 1. Tetikleyici alt bileşen hızla büyüyerek ivmeyi başlatır
  tl.to(
    triggerSelector,
    {
      scale: Math.min(takeoverScale, 6.5),
      duration: halfDur,
      ease,
    },
    at
  );

  // 2. Eski sahne büyüyen bileşenin ivmesiyle ileri doğru genişleyerek devredilir (bulanık çamur olmadan)
  tl.to(
    outgoingSelector,
    {
      opacity: 0,
      scale: 1.28,
      duration: halfDur,
      ease: EASING.quickIn,
    },
    at + duration * 0.12
  );

  // 3. Yeni tam ekran sahne ölçek ve opaklık ile açılır (useIris true ise dairesel diyaframla)
  if (options.useIris) {
    tl.fromTo(
      incomingSelector,
      {
        opacity: 1,
        scale: 0.88,
        clipPath: 'circle(0% at 50% 65%)',
      },
      {
        opacity: 1,
        scale: 1.0,
        clipPath: 'circle(150% at 50% 50%)',
        duration: duration * 0.88,
        ease: EASING.expoOut,
      },
      at + duration * 0.14
    ).set(
      incomingSelector,
      { clipPath: 'none' },
      at + duration * 1.02
    );
  } else {
    tl.fromTo(
      incomingSelector,
      {
        opacity: 0,
        scale: 0.94,
      },
      {
        opacity: 1,
        scale: 1.0,
        duration: duration * 0.88,
        ease: EASING.expoOut,
      },
      at + duration * 0.14
    );
  }

  return tl;
};

/**
 * 6. transitionCameraDive — Hedef Bileşen İçine Makro Kamera Dalışı (Portal Dive)
 * Kameranın sahnedeki belirli bir kartın/bileşenin koordinatına (targetX, targetY)
 * 2.5x-3.2x ölçekle dalıp, o bileşenin içinden yeni sahneyi tam ekran çıkarması.
 * İleri-geri zıplamayı (zoom bounce) önlemek için giden sahne izleyiciye doğru 2.8x büyürken,
 * gelen sahne 0.45x derinlikten 1.0x tam ekrana aynı ileri vektörde kesintisiz çıkar.
 */
export const transitionCameraDive = (
  tl: gsap.core.Timeline,
  cameraRigSelector: string,
  outgoingSelector: string,
  incomingSelector: string,
  options: CameraDiveOptions
): gsap.core.Timeline => {
  const {
    at,
    duration = DURATIONS.long,
    diveScale = SCALE_CONTRAST.portalDive,
    targetX = 0,
    targetY = 0,
    settleScale = SCALE_CONTRAST.neutralStage,
    ease = EASING.expoInOut,
  } = options;

  const diveDur = duration * 0.62;
  const settleDur = duration * 0.58;

  // 1. Kamera sarsıntısız tek yönlü odak kayması yapar
  tl.to(
    cameraRigSelector,
    {
      scale: 1.08,
      x: targetX * 0.25,
      y: targetY * 0.25,
      duration: diveDur * 0.7,
      ease,
    },
    at
  ).to(
    cameraRigSelector,
    {
      scale: settleScale,
      x: 0,
      y: 0,
      duration: settleDur,
      ease: EASING.expoOut,
    },
    at + diveDur * 0.7
  );

  // 2. Dalış sırasında eski sahne hedef koordinattan izleyiciye doğru devasa büyüyerek (diveScale) kadrajı aşar
  tl.to(
    outgoingSelector,
    {
      opacity: 0,
      scale: diveScale,
      x: targetX,
      y: targetY,
      duration: diveDur,
      ease: EASING.quickIn,
    },
    at
  );

  // 3. Yeni sahne dalınan portalın içinden ölçekle (0.88 -> 1.0) açılır (useIris true ise iris diyaframla)
  if (options.useIris) {
    tl.fromTo(
      incomingSelector,
      {
        opacity: 1,
        scale: 0.88,
        clipPath: 'circle(0% at 50% 50%)',
      },
      {
        opacity: 1,
        scale: 1.0,
        clipPath: 'circle(150% at 50% 50%)',
        duration: settleDur + DURATIONS.micro,
        ease: EASING.expoOut,
      },
      at + diveDur * 0.25
    ).set(
      incomingSelector,
      { clipPath: 'none' },
      at + diveDur * 0.25 + settleDur + DURATIONS.micro
    );
  } else {
    tl.fromTo(
      incomingSelector,
      {
        opacity: 0,
        scale: 0.92,
      },
      {
        opacity: 1,
        scale: 1.0,
        duration: settleDur + DURATIONS.micro,
        ease: EASING.expoOut,
      },
      at + diveDur * 0.25
    );
  }

  return tl;
};
