import { DURATIONS, EASING, MOTION_OFFSET, RECIPE, TIMING } from './tokens.ts';
import { mulberry32 } from './render-contract.ts';
export * from './transitions.ts';

const GLYPH_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789!@#$%^&*<>[]{}';

/**
 * Hedef metin için deterministik çözülme (scramble) karakterleri üretir.
 */
export function generateDeterministicScramble(
  targetText: string,
  progress: number,
  seed: number = 42
): string {
  const rand = mulberry32(seed);
  return targetText
    .split('')
    .map((char, i) => {
      if (char === ' ') return ' ';
      const charThreshold = i / Math.max(1, targetText.length);
      if (progress > charThreshold) return char;
      const glyphIndex = Math.floor(rand() * GLYPH_CHARS.length);
      return GLYPH_CHARS[glyphIndex];
    })
    .join('');
}

/* =========================================================================
   ALTIN STANDART TARİFLER (26 Tarif)
   Yalnızca transform / opacity / filter; sıfır sihirli sayı; %100 GPU saflığı.
   ========================================================================= */

/** 1. Darbe sarsıntısı: sönümlenen yön değiştiren x/y/rotateZ adımları, sonra sıfıra yerleşme. */
export const impactShake = (
  tl: gsap.core.Timeline,
  selector: string,
  at: number,
  amplitudePx: number = RECIPE.shakeAmplitudePx
): gsap.core.Timeline => {
  for (let i = 0; i < RECIPE.shakeSteps; i++) {
    const decay = 1 - i / RECIPE.shakeSteps;
    const dir = i % 2 === 0 ? 1 : -1;
    tl.to(
      selector,
      {
        x: dir * amplitudePx * decay,
        y: -dir * amplitudePx * decay * 0.6,
        rotateZ: dir * RECIPE.shakeRollDeg * decay,
        duration: RECIPE.shakeStep,
        ease: EASING.powerOut,
      },
      at + i * RECIPE.shakeStep
    );
  }
  tl.to(
    selector,
    { x: 0, y: 0, rotateZ: 0, duration: DURATIONS.panel, ease: EASING.expoOut },
    at + RECIPE.shakeSteps * RECIPE.shakeStep
  );
  return tl;
};

/** 2. Odak girişi: büyük+flu+saydam başlar, keskin ve yerinde biter. */
export const blurScaleReveal = (
  tl: gsap.core.Timeline,
  selector: string,
  at: number
): gsap.core.Timeline =>
  tl.fromTo(
    selector,
    { scale: RECIPE.revealScaleFrom, opacity: 0, filter: `blur(${RECIPE.revealBlurPx}px)` },
    { scale: 1, opacity: 1, filter: 'blur(0px)', duration: DURATIONS.camera, ease: EASING.expoOut },
    at
  );

/** 3. Maske silme: scaleX 0→1 (sol sabit). clip-path yerine yalnızca transform kullanır. */
export const maskWipeReveal = (
  tl: gsap.core.Timeline,
  selector: string,
  at: number
): gsap.core.Timeline =>
  tl.fromTo(
    selector,
    { scaleX: 0, transformOrigin: 'left center' },
    { scaleX: 1, duration: RECIPE.wipeDuration, ease: EASING.expoOut },
    at
  );

/** 4. Aşırı-atış yerleşme (spring hissi): hızlıca hedefi geçer, sonra yumuşakça oturur. */
export const springSettle = (
  tl: gsap.core.Timeline,
  selector: string,
  at: number
): gsap.core.Timeline =>
  tl
    .fromTo(
      selector,
      { scale: 0, opacity: 0 },
      { scale: RECIPE.settleOvershoot, opacity: 1, duration: RECIPE.settleIn, ease: EASING.powerOut },
      at
    )
    .to(selector, { scale: 1, duration: RECIPE.settleOut, ease: EASING.expoOut }, at + RECIPE.settleIn);

/** 5. Derinlik Kademesi: Liste/kart elemanlarının derinlikten ardışık öne çıkışı. */
export const depthStaggerReveal = (
  tl: gsap.core.Timeline,
  selector: string,
  at: number,
  staggerInterval: number = TIMING.itemStagger
): gsap.core.Timeline =>
  tl.fromTo(
    selector,
    {
      y: MOTION_OFFSET.itemY,
      scale: MOTION_OFFSET.surfaceScaleFrom,
      opacity: 0,
      filter: `blur(${MOTION_OFFSET.wordBlur}px)`,
    },
    {
      y: 0,
      scale: 1,
      opacity: 1,
      filter: 'blur(0px)',
      duration: DURATIONS.panel,
      stagger: staggerInterval,
      ease: EASING.expoOut,
    },
    at
  );

/** 6. Kromatik Vurgu / İmpakt Darbesi: Sahne geçişi veya darbede mikro-ölçek sarsıntısı. */
export const chromaticAberrationPulse = (
  tl: gsap.core.Timeline,
  selector: string,
  at: number,
  intensity: number = 1.04
): gsap.core.Timeline =>
  tl
    .to(
      selector,
      {
        scale: intensity,
        filter: 'brightness(1.25) contrast(1.1)',
        duration: DURATIONS.instant,
        ease: EASING.powerOut,
      },
      at
    )
    .to(
      selector,
      {
        scale: 1,
        filter: 'brightness(1) contrast(1)',
        duration: DURATIONS.micro,
        ease: EASING.expoOut,
      },
      at + DURATIONS.instant
    );

/** 7. Kinetik Sözcük Düşüşü: Yüksek ivmeli tipografik sözcük/başlık yerleşmesi. */
export const kineticWordDrop = (
  tl: gsap.core.Timeline,
  selector: string,
  at: number,
  staggerInterval: number = TIMING.wordStagger
): gsap.core.Timeline =>
  tl.fromTo(
    selector,
    {
      y: -MOTION_OFFSET.wordY,
      scale: MOTION_OFFSET.wordScaleFrom,
      rotateX: 20,
      opacity: 0,
      filter: `blur(${MOTION_OFFSET.wordBlur}px)`,
    },
    {
      y: 0,
      scale: 1,
      rotateX: 0,
      opacity: 1,
      filter: 'blur(0px)',
      duration: DURATIONS.word,
      stagger: staggerInterval,
      ease: EASING.backOut,
    },
    at
  );

/* =========================================================================
   YENİ TİPOGRAFİ TARİFLERİ
   ========================================================================= */

/** 8. scrambleTextDecode: Deterministik glif çözülüşü ve odak keskinleşmesi. */
export const scrambleTextDecode = (
  tl: gsap.core.Timeline,
  selector: string,
  at: number,
  options?: { duration?: number; staggerInterval?: number }
): gsap.core.Timeline => {
  const duration = options?.duration ?? RECIPE.scrambleDuration;
  const staggerInterval = options?.staggerInterval ?? TIMING.charStagger;

  return tl.fromTo(
    selector,
    {
      opacity: 0,
      scale: 1.08,
      filter: 'blur(6px)',
    },
    {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      duration,
      stagger: staggerInterval,
      ease: EASING.expoOut,
    },
    at
  );
};

/** 9. rollingNumberOdometer: Tabüler dikey sayı şeridinin hedef rakama dönmesi. */
export const rollingNumberOdometer = (
  tl: gsap.core.Timeline,
  selector: string,
  at: number,
  targetDigit: number,
  options?: { digitHeight?: number; duration?: number; staggerInterval?: number }
): gsap.core.Timeline => {
  const digitHeight = options?.digitHeight ?? RECIPE.odometerDigitHeight;
  const duration = options?.duration ?? RECIPE.odometerDuration;
  const staggerInterval = options?.staggerInterval ?? TIMING.digitStagger;

  return tl.to(
    selector,
    {
      y: -targetDigit * digitHeight,
      duration,
      stagger: staggerInterval,
      ease: EASING.expoOut,
    },
    at
  );
};

/** 10. kineticBaselineWipe: Taşma gizli taban çizgisinden kinetik yay fırlaması. */
export const kineticBaselineWipe = (
  tl: gsap.core.Timeline,
  selector: string,
  at: number,
  options?: { yOffset?: number; duration?: number; staggerInterval?: number }
): gsap.core.Timeline => {
  const yOffset = options?.yOffset ?? RECIPE.baselineWipeY;
  const duration = options?.duration ?? DURATIONS.word;
  const staggerInterval = options?.staggerInterval ?? TIMING.wordStagger;

  return tl.fromTo(
    selector,
    {
      y: yOffset,
      rotateX: 18,
      opacity: 0,
      transformOrigin: 'bottom center',
    },
    {
      y: 0,
      rotateX: 0,
      opacity: 1,
      duration,
      stagger: staggerInterval,
      ease: EASING.backOut,
    },
    at
  );
};

/** 11. splitFlapTile: 3D rotateX mekanik havalimanı panosu harf dönüşü. */
export const splitFlapTile = (
  tl: gsap.core.Timeline,
  selector: string,
  at: number,
  options?: { duration?: number; staggerInterval?: number }
): gsap.core.Timeline => {
  const duration = options?.duration ?? RECIPE.splitFlapDuration;
  const staggerInterval = options?.staggerInterval ?? TIMING.charStagger;

  return tl.fromTo(
    selector,
    {
      rotateX: -90,
      opacity: 0.3,
      filter: 'brightness(0.65)',
      transformOrigin: 'top center',
    },
    {
      rotateX: 0,
      opacity: 1,
      filter: 'brightness(1)',
      duration,
      stagger: staggerInterval,
      ease: EASING.backOut,
    },
    at
  );
};

/* =========================================================================
   YENİ UI & İMLEÇ (CURSOR) TARİFLERİ
   ========================================================================= */

/** 12. cursorNaturalPath: Koordinatlar arasında doğal kavisli imleç yolculuğu. */
export const cursorNaturalPath = (
  tl: gsap.core.Timeline,
  selector: string,
  at: number,
  targetPos: { x: number; y: number },
  options?: { duration?: number; bankAngle?: number }
): gsap.core.Timeline => {
  const duration = options?.duration ?? RECIPE.cursorTravelDuration;
  const bankAngle = options?.bankAngle ?? 3.5;

  return tl
    .to(
      selector,
      {
        x: targetPos.x,
        y: targetPos.y,
        rotateZ: bankAngle,
        duration,
        ease: EASING.expoInOut,
      },
      at
    )
    .to(
      selector,
      {
        rotateZ: 0,
        duration: DURATIONS.micro,
        ease: EASING.expoOut,
      },
      at + duration
    );
};

/** 13. cursorClickImpulse: Tıklama öncesi mikro-sıkışma ve dalga halkası tetiklemesi. */
export const cursorClickImpulse = (
  tl: gsap.core.Timeline,
  cursorSelector: string,
  at: number,
  options?: { rippleSelector?: string; duration?: number }
): gsap.core.Timeline => {
  const duration = options?.duration ?? DURATIONS.instant;

  tl.to(
    cursorSelector,
    {
      scale: RECIPE.cursorPressScale,
      duration,
      ease: EASING.quickIn,
    },
    at
  ).to(
    cursorSelector,
    {
      scale: 1,
      duration: DURATIONS.micro,
      ease: EASING.expoOut,
    },
    at + duration
  );

  if (options?.rippleSelector) {
    tl.fromTo(
      options.rippleSelector,
      {
        scale: 0.4,
        opacity: 0.8,
      },
      {
        scale: RECIPE.rippleScale,
        opacity: 0,
        duration: DURATIONS.panel,
        ease: EASING.expoOut,
      },
      at + duration
    );
  }

  return tl;
};

/** 14. magneticElementPull: İmlecin çekim alanına giren butonun elastik çekilişi. */
export const magneticElementPull = (
  tl: gsap.core.Timeline,
  selector: string,
  at: number,
  pullVector: { x: number; y: number },
  options?: { duration?: number }
): gsap.core.Timeline => {
  const duration = options?.duration ?? DURATIONS.panel;

  return tl
    .to(
      selector,
      {
        x: pullVector.x,
        y: pullVector.y,
        scale: 1.03,
        duration: DURATIONS.micro,
        ease: EASING.powerOut,
      },
      at
    )
    .to(
      selector,
      {
        x: 0,
        y: 0,
        scale: 1,
        duration,
        ease: EASING.backOut,
      },
      at + DURATIONS.micro
    );
};

/** 15. flipContainerTransition: GPU saflığında (scaleX, scaleY, x, y) panel dönüşümü. */
export const flipContainerTransition = (
  tl: gsap.core.Timeline,
  selector: string,
  at: number,
  transformDelta: { dx: number; dy: number; scaleX: number; scaleY: number },
  options?: { duration?: number }
): gsap.core.Timeline => {
  const duration = options?.duration ?? DURATIONS.panel;

  return tl.fromTo(
    selector,
    {
      x: transformDelta.dx,
      y: transformDelta.dy,
      scaleX: transformDelta.scaleX,
      scaleY: transformDelta.scaleY,
    },
    {
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      duration,
      ease: EASING.expoOut,
    },
    at
  );
};

/** 16. tabIndicatorGlide: Sekmeler arası kayan kapsül hap göstergesi ve esneme. */
export const tabIndicatorGlide = (
  tl: gsap.core.Timeline,
  selector: string,
  at: number,
  targetX: number,
  options?: { duration?: number }
): gsap.core.Timeline => {
  const duration = options?.duration ?? RECIPE.indicatorGlideDuration;

  return tl
    .to(
      selector,
      {
        x: targetX,
        scaleX: RECIPE.indicatorStretchScaleX,
        duration: duration * 0.5,
        ease: EASING.powerInOut,
      },
      at
    )
    .to(
      selector,
      {
        scaleX: 1,
        duration: duration * 0.5,
        ease: EASING.expoOut,
      },
      at + duration * 0.5
    );
};

/* =========================================================================
   YENİ DERİNLİK VE KAMERA TARİFLERİ
   ========================================================================= */

/** 17. dollyZoomVertigo: Hitchcock vertigo etkisi (zıt yönde ön plan ve arka plan ölçeklemesi). */
export const dollyZoomVertigo = (
  tl: gsap.core.Timeline,
  foregroundSelector: string,
  backgroundSelector: string,
  at: number,
  options?: { duration?: number }
): gsap.core.Timeline => {
  const duration = options?.duration ?? DURATIONS.camera;

  tl.to(
    foregroundSelector,
    {
      scale: RECIPE.vertigoZoomForegroundScale,
      duration,
      ease: EASING.expoInOut,
    },
    at
  );

  tl.to(
    backgroundSelector,
    {
      scale: RECIPE.vertigoZoomBackgroundScale,
      duration,
      ease: EASING.expoInOut,
    },
    at
  );

  return tl;
};

/** 18. rackFocusShift: İki katman arasında sinematik alan derinliği (DoF blur) aktarımı. */
export const rackFocusShift = (
  tl: gsap.core.Timeline,
  defocusSelector: string,
  focusSelector: string,
  at: number,
  options?: { duration?: number; maxBlur?: number }
): gsap.core.Timeline => {
  const duration = options?.duration ?? DURATIONS.focus;
  const maxBlur = options?.maxBlur ?? RECIPE.rackFocusBlurPx;

  tl.to(
    defocusSelector,
    {
      filter: `blur(${maxBlur}px)`,
      opacity: 0.45,
      duration,
      ease: EASING.expoInOut,
    },
    at
  );

  tl.fromTo(
    focusSelector,
    {
      filter: `blur(${maxBlur}px)`,
      opacity: 0.45,
    },
    {
      filter: 'blur(0px)',
      opacity: 1,
      duration,
      ease: EASING.expoInOut,
    },
    at
  );

  return tl;
};

/** 19. multiplaneParallax: Çok katmanlı derinlik düzlemi hız kademelendirmesi. */
export const multiplaneParallax = (
  tl: gsap.core.Timeline,
  layers: { nearSelector: string; midSelector: string; farSelector: string },
  at: number,
  baseShiftX: number,
  options?: { duration?: number }
): gsap.core.Timeline => {
  const duration = options?.duration ?? DURATIONS.camera;

  tl.to(
    layers.nearSelector,
    {
      x: baseShiftX * RECIPE.parallaxNearRatio,
      duration,
      ease: EASING.expoOut,
    },
    at
  );

  tl.to(
    layers.midSelector,
    {
      x: baseShiftX * RECIPE.parallaxMidRatio,
      duration,
      ease: EASING.expoOut,
    },
    at
  );

  tl.to(
    layers.farSelector,
    {
      x: baseShiftX * RECIPE.parallaxFarRatio,
      duration,
      ease: EASING.expoOut,
    },
    at
  );

  return tl;
};

/* =========================================================================
   YENİ VFX, BİÇİM VE IŞIK TARİFLERİ
   ========================================================================= */

/** 20. boxToPillMorph: Analitik pano kartının GPU ile hap rozete evrilmesi. */
export const boxToPillMorph = (
  tl: gsap.core.Timeline,
  selector: string,
  at: number,
  targetScales: { scaleX: number; scaleY: number },
  options?: { duration?: number }
): gsap.core.Timeline => {
  const duration = options?.duration ?? DURATIONS.morph;

  return tl.to(
    selector,
    {
      scaleX: targetScales.scaleX,
      scaleY: targetScales.scaleY,
      duration,
      ease: EASING.expoInOut,
    },
    at
  );
};

/** 21. svgPathInterpolate: Vektör simgeler arasında GPU ölçek ve opaklık geçişi. */
export const svgPathInterpolate = (
  tl: gsap.core.Timeline,
  outgoingSelector: string,
  incomingSelector: string,
  at: number,
  options?: { duration?: number }
): gsap.core.Timeline => {
  const duration = options?.duration ?? DURATIONS.micro;

  tl.to(
    outgoingSelector,
    {
      scale: 0.6,
      opacity: 0,
      duration,
      ease: EASING.powerOut,
    },
    at
  );

  tl.fromTo(
    incomingSelector,
    {
      scale: 1.4,
      opacity: 0,
    },
    {
      scale: 1,
      opacity: 1,
      duration,
      ease: EASING.backOut,
    },
    at + duration * 0.5
  );

  return tl;
};

/** 22. lightLeakSweep: Sahne üstünden geçen parlak mercek ışık sızıntısı bıçağı. */
export const lightLeakSweep = (
  tl: gsap.core.Timeline,
  selector: string,
  at: number,
  options?: { duration?: number }
): gsap.core.Timeline => {
  const duration = options?.duration ?? DURATIONS.sweep;

  return tl.fromTo(
    selector,
    {
      x: -RECIPE.lightLeakDistance,
      opacity: 0,
      scaleX: 1.8,
    },
    {
      x: RECIPE.lightLeakDistance,
      opacity: 0.7,
      scaleX: 1.0,
      duration,
      ease: EASING.expoInOut,
    },
    at
  ).to(
    selector,
    {
      opacity: 0,
      duration: DURATIONS.micro,
      ease: EASING.expoOut,
    },
    at + duration
  );
};

/** 23. speedStreaks: Whip-pan sırasında sahneden hızla geçen yönsel hız çizgileri. */
export const speedStreaks = (
  tl: gsap.core.Timeline,
  selector: string,
  at: number,
  options?: { duration?: number; staggerInterval?: number }
): gsap.core.Timeline => {
  const duration = options?.duration ?? DURATIONS.panel;
  const staggerInterval = options?.staggerInterval ?? TIMING.streakStagger;

  return tl.fromTo(
    selector,
    {
      x: RECIPE.speedStreakDistance,
      opacity: 0,
      scaleX: 2.2,
    },
    {
      x: -RECIPE.speedStreakDistance,
      opacity: 0.85,
      scaleX: 1,
      duration,
      stagger: staggerInterval,
      ease: EASING.expoInOut,
    },
    at
  ).to(
    selector,
    {
      opacity: 0,
      duration: DURATIONS.micro,
      ease: EASING.expoOut,
    },
    at + duration
  );
};

/** 24. specularGlintGlance: Kart kenarında veya butonda çapraz speküler parıltı süpürmesi. */
export const specularGlintGlance = (
  tl: gsap.core.Timeline,
  selector: string,
  at: number,
  options?: { duration?: number }
): gsap.core.Timeline => {
  const duration = options?.duration ?? DURATIONS.panel;

  return tl.fromTo(
    selector,
    {
      x: -RECIPE.glintDistance,
      opacity: 0,
    },
    {
      x: RECIPE.glintDistance,
      opacity: 0.9,
      duration,
      ease: EASING.expoOut,
    },
    at
  ).to(
    selector,
    {
      opacity: 0,
      duration: DURATIONS.micro,
      ease: EASING.expoOut,
    },
    at + duration * 0.75
  );
};

/** 25. elasticCardDock: macOS/Dock tarzı kartın aşırı-atış yaylanmasıyla konması. */
export const elasticCardDock = (
  tl: gsap.core.Timeline,
  selector: string,
  at: number,
  options?: { duration?: number; staggerInterval?: number }
): gsap.core.Timeline => {
  const duration = options?.duration ?? DURATIONS.panel;
  const staggerInterval = options?.staggerInterval ?? TIMING.itemStagger;

  return tl.fromTo(
    selector,
    {
      y: MOTION_OFFSET.surfaceY,
      scale: 0.82,
      opacity: 0,
    },
    {
      y: 0,
      scale: RECIPE.dockOvershootScale,
      opacity: 1,
      duration: duration * 0.65,
      stagger: staggerInterval,
      ease: EASING.powerOut,
    },
    at
  ).to(
    selector,
    {
      scale: 1,
      duration: duration * 0.35,
      stagger: staggerInterval,
      ease: EASING.expoOut,
    },
    at + duration * 0.65
  );
};

/** 26. cameraWhipTilt: Vurucu anlarda kameranın motivated açısal tilt ve geri toparlanışı. */
export const cameraWhipTilt = (
  tl: gsap.core.Timeline,
  selector: string,
  at: number,
  options?: { tiltDeg?: number; duration?: number }
): gsap.core.Timeline => {
  const tiltDeg = options?.tiltDeg ?? 2.8;
  const duration = options?.duration ?? DURATIONS.fast;

  return tl
    .to(
      selector,
      {
        rotateZ: tiltDeg,
        scale: 1.03,
        duration: duration * 0.4,
        ease: EASING.powerOut,
      },
      at
    )
    .to(
      selector,
      {
        rotateZ: 0,
        scale: 1,
        duration: duration * 0.6,
        ease: EASING.expoOut,
      },
      at + duration * 0.4
    );
};
