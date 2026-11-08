// Fixture (bad): trips T001 (beat b label off, beat c unlabelled), T002 (dead beat c), T003 (short hold + active tween),
// T004 (ends after video), T005 (width tween), T006 (raw tweens), T007 (beat a too busy).
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../../../../src/core/useRemotionGSAP';
import { beat, holdFinal } from '../../../../src/core/presets';

export const buildTimeline = (tl: gsap.core.Timeline) => {
  beat(tl, 'a', 0);
  for (let i = 0; i < 9; i++) tl.to(`.item${i}`, { x: 20, duration: 0.4 }, 0.1 + i * 0.05);
  beat(tl, 'b', 2.5); // spec says frame 120 (2.0s)
  tl.to('#panel', { width: 600, duration: 0.5 }, 2.2);
  tl.to('#stage', { scale: 1.2, duration: 3, ease: 'power2.out' }, 3.5); // beat c has no tween start, ends at 6.5s
  holdFinal(tl, 5.5, 0.5);
  return tl;
};

export const Scene = () => {
  useRemotionGSAP(buildTimeline);
  return (
    <AbsoluteFill id="stage">
      <div id="panel" />
      {Array.from({ length: 9 }, (_, i) => <div key={i} className={`item${i}`} />)}
    </AbsoluteFill>
  );
};
