// Fixture (allowed): structurally valid (beats, hold, no layout props) but trips every craft rule once:
// T008 (.in entrance, .out exit), T009 (900px in 24f), T010 (4 simultaneous targets), T011 (3 equal beats),
// T012 (linear 0.8s), T013 (2s slow fade, 1-frame pop).
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../../../../src/core/useRemotionGSAP';
import { beat, enter, holdFinal } from '../../../../src/core/presets';

export const buildTimeline = (tl: gsap.core.Timeline) => {
  beat(tl, 'a', 0);
  tl.fromTo('#title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.in' }, 0.1); // T008 entrance .in
  tl.to('#title', { opacity: 0, duration: 0.3, ease: 'expo.out' }, 1.6); // T008 exit .out
  beat(tl, 'b', 2);
  for (const id of ['#a', '#b', '#c', '#d']) tl.to(id, { y: -20, duration: 0.5, ease: 'power2.out' }, 2.0); // T010
  tl.to('#bar', { x: 100, duration: 0.8, ease: 'none' }, 2.6); // T012
  tl.to('#fade', { opacity: 0.5, duration: 1.9, ease: 'power2.out' }, 2.5); // T013 slow
  tl.to('#blink', { opacity: 0.5, duration: 0.01, ease: 'power2.out' }, 3.5); // T013 pop
  beat(tl, 'c', 4);
  enter(tl, '#cta', 'rise', 4.1);
  holdFinal(tl, 4.8, 1.2);
  return tl;
};

export const Scene = () => {
  useRemotionGSAP(buildTimeline);
  return (
    <AbsoluteFill id="stage">
      <h1 id="title">Fixture</h1>
      {['slider', 'a', 'b', 'c', 'd', 'bar', 'fade', 'blink', 'cta'].map((id) => <div key={id} id={id} />)}
    </AbsoluteFill>
  );
};
