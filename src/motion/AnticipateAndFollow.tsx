import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

export interface AnticipateAndFollowProps {
  children: React.ReactNode;
  /**
   * Aksiyonun patlama karesi
   */
  triggerFrame: number;
  /**
   * Büzülme/hazırlık süresi (kare)
   */
  anticipationFrames?: number;
  /**
   * Hazırlık anındaki küçülme oranı (varsayılan: 0.95)
   */
  anticipationScale?: number;
  /**
   * Overshoot oranı (varsayılan: 1.04)
   */
  overshootScale?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const AnticipateAndFollow: React.FC<AnticipateAndFollowProps> = ({
  children,
  triggerFrame,
  anticipationFrames = 5,
  anticipationScale = 0.95,
  overshootScale = 1.04,
  className = '',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const startAnticipation = triggerFrame - anticipationFrames;

  let scale = 1;

  if (frame < startAnticipation) {
    scale = 1;
  } else if (frame >= startAnticipation && frame < triggerFrame) {
    // 1. Anticipation (Hazırlık): 1 -> anticipationScale
    scale = interpolate(
      frame,
      [startAnticipation, triggerFrame],
      [1, anticipationScale],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
  } else {
    // 2. Action & Follow-through: Yay fiziğiyle anticipationScale -> overshootScale -> 1
    const postFrame = frame - triggerFrame;
    const progress = spring({
      frame: postFrame,
      fps,
      config: {
        mass: 0.6,
        damping: 10,
        stiffness: 160,
      },
    });

    // progress 0 iken anticipationScale, tepe noktasında overshootScale, 1 olunca 1
    const targetPeak = overshootScale;
    scale = interpolate(progress, [0, 0.5, 1], [anticipationScale, targetPeak, 1], {
      extrapolateRight: 'clamp',
    });
  }

  return (
    <div
      className={className}
      style={{
        transform: `scale(${scale.toFixed(4)})`,
        willChange: 'transform',
        transformOrigin: 'center center',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
