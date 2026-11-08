// Fixture (good): every beat labelled and animated, preset-only, final hold with only camera drift.
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../../../../src/core/useRemotionGSAP';
import { beat, enter, emphasize, exit, camera, transition, holdFinal } from '../../../../src/core/presets';

export const buildTimeline = (tl: gsap.core.Timeline) => {
  beat(tl, 'a', 0);
  enter(tl, '#title', 'rise', 0.1);
  enter(tl, '.chip', 'stagger', 0.5);
  transition(tl, 'maskWipe', 1.9, { incoming: '#hero' });
  beat(tl, 'b', 1.5);
  exit(tl, '#title', 'sink', 2.1);
  enter(tl, '#hero', 'pop', 2.3);
  emphasize(tl, '#hero', 'punch', 3.0);
  camera(tl, '#stage', 'drift', 3.6); // 2.4s: ends exactly at the video end, allowed inside the hold
  beat(tl, 'c', 3.5);
  enter(tl, '#cta', 'rise', 4.1);
  holdFinal(tl, 4.8, 1.2);
  return tl;
};

export const Scene = () => {
  useRemotionGSAP(buildTimeline);
  return (
    <AbsoluteFill id="stage">
      <h1 id="title">Fixture</h1>
      <div id="hero" />
      <div id="cta" />
      <div className="chip" />
    </AbsoluteFill>
  );
};
