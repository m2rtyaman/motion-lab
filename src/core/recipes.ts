import { DURATIONS, EASING, RECIPE } from './tokens';

/**
 * ALTIN STANDART TARİFLER (yalnızca transform / opacity / filter; sıfır sihirli sayı).
 * Her tarif zamanlamayı `at` (saniye) ile alır; spec'teki zamanlarla birebir kullanılır.
 */

/** Darbe sarsıntısı: sönümlenen yön değiştiren x/y/rotateZ adımları, sonra sıfıra yerleşme. */
export const impactShake = (
  tl: gsap.core.Timeline,
  selector: string,
  at: number,
  amplitudePx: number = RECIPE.shakeAmplitudePx
): gsap.core.Timeline => {
  for (let i = 0; i < RECIPE.shakeSteps; i++) {
    const decay = 1 - i / RECIPE.shakeSteps; // 1 → 0.2 sönüm
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

/** Odak girişi: büyük+flu+saydam başlar, keskin ve yerinde biter (derinlikten öne gelme hissi). */
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

/** Maske silme: scaleX 0→1 (sol sabit). clip-path yerine yalnızca transform kullanır. */
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

/** Aşırı-atış yerleşme (spring hissi): hızlıca hedefi geçer, sonra yumuşakça oturur. */
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
