// Deliberately weak fixture for scripts/test-evals.mjs: valid and gate-clean, but hand-written linear tweens,
// no physics helper, metronome beats, wrong aspect and placeholder copy. Must score <= 50.
import { type FC } from 'react';
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../../../src/core/useRemotionGSAP';
import { beat, holdFinal } from '../../../src/core/presets';

export const buildTimeline = (tl: gsap.core.Timeline) => {
  beat(tl, 'a', 0);
  tl.to('.ball', { y: 600, duration: 1.0, ease: 'none' }, 0.2);
  beat(tl, 'b', 1.67);
  tl.to('.ball', { y: 0, duration: 1.0, ease: 'none' }, 1.7);
  tl.to('.ball', { y: 600, duration: 0.6, ease: 'none' }, 2.8);
  beat(tl, 'c', 3.33);
  tl.to('.caption', { opacity: 1, duration: 0.4, ease: 'none' }, 3.4);
  holdFinal(tl, 3.8, 1.2);
  return tl;
};

export const Scene: FC = () => {
  useRemotionGSAP(buildTimeline);
  return (
    <AbsoluteFill style={{ backgroundColor: '#111111', color: '#ffffff' }}>
      <div className="ball absolute h-[120px] w-[120px] rounded-full" style={{ left: 480, top: 300, backgroundColor: '#ff6600' }} />
      <div className="caption absolute text-[40px]" style={{ left: 200, top: 1400, opacity: 0 }}>Lorem ipsum your text here</div>
    </AbsoluteFill>
  );
};

export default Scene;
