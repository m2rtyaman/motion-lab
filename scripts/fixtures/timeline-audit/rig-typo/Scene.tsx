// Fixture (rig-typo): the timeline targets .hero-torsoo, but RigCharacter id="hero" only renders .hero-torso (T014 must name it).
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../../../../src/core/useRemotionGSAP';
import { beat, enter, holdFinal } from '../../../../src/core/presets';
import { idleBreath, rigWalk } from '../../../../src/core/physics';
import { RigCharacter } from '../../../../src/primitives';

const HERO = 'hero';

export const buildTimeline = (tl: gsap.core.Timeline) => {
  beat(tl, 'a', 0);
  enter(tl, '.hero-root', 'rise', 0.1);
  rigWalk(tl, HERO, 0.5, { pace: 'walk', steps: 2 });
  enter(tl, '.hero-torsoo', 'pop', 1.0);
  idleBreath(tl, HERO, 1.8, { seconds: 1.5 });
  holdFinal(tl, 3.6, 1.2);
  return tl;
};

export const Scene = () => {
  useRemotionGSAP(buildTimeline);
  return (
    <AbsoluteFill>
      <RigCharacter id={HERO} left={240} groundY={900} />
    </AbsoluteFill>
  );
};
