import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

export interface SecondaryMotionOptions {
  /**
   * Kartın sahneye yerleştiği kare (ikincil hareket bu kareden sonra tetiklenir)
   */
  settleFrame?: number;
  /**
   * SVG çizgi çizim süresi (kare)
   */
  drawDuration?: number;
  /**
   * Işık süpürme süresi (kare)
   */
  sweepDuration?: number;
}

export interface SecondaryMotionResult {
  /**
   * SVG strokeDashoffset çizim ilerlemesi (0: çizilmemiş, 1: tamamen çizilmiş)
   */
  strokeProgress: number;
  /**
   * Spotlight ışığının yüzeyde soldan sağa kayma X konumu (%0 -> %100)
   */
  spotlightX: number;
  /**
   * Sürekli yaşayan mikro-nabız (0.85 -> 1.15 arası sinüs dalgası)
   */
  microPulse: number;
  /**
   * İkincil hareketin aktif olup olmadığı
   */
  isSettled: boolean;
}

export function useSecondaryMotion({
  settleFrame = 12,
  drawDuration = 35,
  sweepDuration = 45,
}: SecondaryMotionOptions = {}): SecondaryMotionResult {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isSettled = frame >= settleFrame;
  const postFrame = Math.max(0, frame - settleFrame);

  // 1. Yay destekli stroke-dashoffset çizim ilerlemesi (drawDuration ile ölçekli)
  const strokeProgress = isSettled
    ? interpolate(postFrame, [0, drawDuration], [0, 1], {
        extrapolateRight: 'clamp',
        easing: (t) => spring({ frame: t * fps, fps, config: { mass: 0.7, damping: 14, stiffness: 80 } }),
      })
    : 0;

  // 2. Işık yansımasının kart üzerinde kayması
  const spotlightX = isSettled
    ? interpolate(postFrame, [0, sweepDuration], [10, 85], {
        extrapolateRight: 'clamp',
      })
    : 10;

  // 3. Yaşayan mikro-nabız (ölü kareyi engeller)
  const microPulse = 1 + Math.sin(frame * 0.08) * 0.05;

  return {
    strokeProgress: Math.min(1, Math.max(0, strokeProgress)),
    spotlightX,
    microPulse,
    isSettled,
  };
}
