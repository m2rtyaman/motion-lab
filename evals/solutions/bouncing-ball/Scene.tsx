import { type FC } from 'react';
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../../../src/core/useRemotionGSAP';
import { beat, enter, camera, holdFinal } from '../../../src/core/presets';
import { bounce } from '../../../src/core/physics';
import { getTheme } from '../../../src/core/theme-contract';
import { BackdropField } from '../../../src/primitives/curated';

const theme = getTheme('dark');
const CAPTION = 'Heavy at first. Lighter with every bounce.';
const BOUNCE = { height: 300, bounces: 3, restitution: 0.4, squash: 'normal', travel: 1000 } as const;
const GROUND_Y = 860; // px, bottom of the ball at rest
const BALL = 160; // px

export const buildTimeline = (tl: gsap.core.Timeline) => {
  beat(tl, 'setup', 0);
  enter(tl, '.ground', 'wipe', 0.05);
  enter(tl, '.ball', 'pop', 0.2); // the ball is parked at its apex by bounce()
  camera(tl, '.backdrop', 'drift', 0.1, { intensity: 'soft' });

  beat(tl, 'drop', 0.62);
  bounce(tl, '.ball', 0.65, BOUNCE); // fall, squash, 3 decaying rebounds while rolling 1000 px right: 2.14 s

  beat(tl, 'rest', 2.2);
  enter(tl, '.caption', 'rise', 2.3);
  holdFinal(tl, 2.8, 1.2);
  return tl;
};

export const Scene: FC = () => {
  useRemotionGSAP(buildTimeline);
  const { colors } = theme;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgPrimary, color: colors.textPrimary }}>
      <div className="backdrop absolute inset-0">
        <BackdropField theme={theme} variant="grid" intensity={0.25} />
      </div>
      <div className="ground absolute h-[6px] rounded-full" style={{ left: 160, right: 160, top: GROUND_Y, backgroundColor: colors.textMuted }} />
      <div className="ball absolute rounded-full" style={{ left: 340, top: GROUND_Y - BALL, width: BALL, height: BALL, backgroundColor: colors.accentPrimary }} />
      <div className="caption absolute inset-x-0 text-center text-[44px] font-bold tracking-[-0.02em]" style={{ top: 930 }}>{CAPTION}</div>
    </AbsoluteFill>
  );
};

export default Scene;
