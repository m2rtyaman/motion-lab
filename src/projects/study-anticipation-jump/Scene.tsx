import { type FC } from 'react';
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { beat, enter, holdFinal } from '../../core/presets';
import { launch, movingHold } from '../../core/physics';
import { getTheme } from '../../core/theme-contract';
import { BackdropField } from '../../primitives/curated';

const theme = getTheme('dark');
const GROUND_Y = 900; // px
const BLOCK = 140; // px
const BLOCK_X = 560; // px
const UP = 340; // px, launch distance 'far'
const SIDE = 220; // px, launch distance 'mid'
const STEPS = [
  '1  wind-up: opposite way, 7 f, squash',
  '2  action: stretched, fast, 22 f',
  '3  overshoot +8%, then settle 32 f',
];

export const buildTimeline = (tl: gsap.core.Timeline) => {
  beat(tl, 'ready', 0);
  enter(tl, '.ground', 'wipe', 0.1);
  enter(tl, '.ghost', 'stagger', 0.2, { stagger: 'loose' });
  enter(tl, '.step', 'stagger', 0.3, { stagger: 'loose' });
  enter(tl, '.block', 'pop', 0.4);
  movingHold(tl, '.block-wrap', 0.8, { seconds: 0.5, intensity: 'soft' });

  beat(tl, 'jump', 1.2);
  launch(tl, '.block', 1.4, { direction: 'up', distance: 'far', amount: 'normal' }); // 7 + 22 + 32 f

  beat(tl, 'hop', 3.0);
  launch(tl, '.block', 3.1, { direction: 'right', distance: 'mid', amount: 'normal' });

  beat(tl, 'rest', 4.4);
  enter(tl, '.caption', 'rise', 4.4);
  holdFinal(tl, 5.0, 1.2);
  return tl;
};

export const Scene: FC = () => {
  useRemotionGSAP(buildTimeline);
  const { colors } = theme;
  const ghost = (left: number) => ({ left, top: GROUND_Y - UP - BLOCK, width: BLOCK, height: BLOCK, border: `4px dashed ${colors.textMuted}` });
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgPrimary, color: colors.textPrimary }}>
      <div className="absolute inset-0">
        <BackdropField theme={theme} variant="grid" intensity={0.25} />
      </div>
      <div className="absolute left-[120px] top-[90px]">
        <div className="text-[56px] font-black tracking-[-0.03em]">Anticipation</div>
        {STEPS.map((s) => (
          <div key={s} className="step mt-3 text-[28px]" style={{ color: colors.textMuted }}>{s}</div>
        ))}
      </div>
      <div className="ground absolute left-[120px] right-[120px] h-[6px] rounded-full" style={{ top: GROUND_Y, backgroundColor: colors.textMuted }} />
      <div className="ghost absolute rounded-2xl" style={ghost(BLOCK_X)} />
      <div className="ghost absolute rounded-2xl" style={ghost(BLOCK_X + SIDE)} />
      <div className="block-wrap absolute" style={{ left: BLOCK_X, top: GROUND_Y - BLOCK, width: BLOCK, height: BLOCK }}>
        <div className="block absolute inset-0 rounded-2xl" style={{ backgroundColor: colors.accentPrimary }}>
          <div className="absolute left-[34px] top-[42px] h-[22px] w-[22px] rounded-full" style={{ backgroundColor: colors.bgPrimary }} />
          <div className="absolute right-[34px] top-[42px] h-[22px] w-[22px] rounded-full" style={{ backgroundColor: colors.bgPrimary }} />
        </div>
      </div>
      <div className="caption absolute bottom-[40px] left-[120px] text-[32px] font-bold">
        Wind-up = action / 3. Settle = action x 1.5. Skip the wind-up and it reads as a teleport.
      </div>
    </AbsoluteFill>
  );
};

export default Scene;
