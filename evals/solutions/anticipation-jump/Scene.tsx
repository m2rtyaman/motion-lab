import { type FC } from 'react';
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../../../src/core/useRemotionGSAP';
import { beat, enter, emphasize, holdFinal } from '../../../src/core/presets';
import { launch, movingHold } from '../../../src/core/physics';
import { getTheme } from '../../../src/core/theme-contract';
import { BackdropField } from '../../../src/primitives/curated';

const theme = getTheme('dark');
const GROUND_Y = 900; // px
const BLOCK = 160; // px
const LEFT = 880; // px
const JUMP = 220; // px, launch distance 'mid'

export const buildTimeline = (tl: gsap.core.Timeline) => {
  beat(tl, 'ready', 0);
  enter(tl, '.ground', 'wipe', 0.05);
  enter(tl, '.target', 'rise', 0.1, { intensity: 'soft' });
  enter(tl, '.block', 'rise', 0.15);
  movingHold(tl, '.block-wrap', 0.2, { seconds: 0.5, intensity: 'soft' }); // alive, not frozen, before the jump

  beat(tl, 'jump', 0.67);
  launch(tl, '.block', 0.68, { direction: 'up', distance: 'mid', amount: 'normal' }); // wind-up 5 f, action 16 f, settle 24 f

  beat(tl, 'land', 1.37);
  emphasize(tl, '.target', 'punch', 1.45, { intensity: 'soft' });
  holdFinal(tl, 1.8, 1.2);
  return tl;
};

export const Scene: FC = () => {
  useRemotionGSAP(buildTimeline);
  const { colors } = theme;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgPrimary, color: colors.textPrimary }}>
      <div className="absolute inset-0">
        <BackdropField theme={theme} variant="grid" intensity={0.25} />
      </div>
      <div className="ground absolute h-[6px] rounded-full" style={{ left: 160, right: 160, top: GROUND_Y, backgroundColor: colors.textMuted }} />
      <div className="target absolute rounded-3xl" style={{ left: LEFT, top: GROUND_Y - BLOCK - JUMP, width: BLOCK, height: BLOCK, border: `4px dashed ${colors.textMuted}` }} />
      <div className="block-wrap absolute" style={{ left: LEFT, top: GROUND_Y - BLOCK, width: BLOCK, height: BLOCK }}>
        <div className="block relative h-full w-full rounded-3xl" style={{ backgroundColor: colors.accentPrimary }}>
          <div className="absolute rounded-full" style={{ right: 36, top: 44, width: 26, height: 26, backgroundColor: colors.bgPrimary }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default Scene;
