import { type FC } from 'react';
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { beat, enter, holdFinal } from '../../core/presets';
import { followThrough, pendulum } from '../../core/physics';
import { getTheme } from '../../core/theme-contract';
import { BackdropField } from '../../primitives/curated';

const theme = getTheme('dark');
const LABELS = ['parent  +0 f', 'child  +3 f', 'child  +6 f', 'child  +9 f'];
const LINK_H = 130; // px
const LINKS = [0, 1, 2, 3];
const CHAIN_X = 1380; // px
const CHAIN_Y = 330; // px
const SELECTORS = LINKS.map((i) => `.link-${i}`);

export const buildTimeline = (tl: gsap.core.Timeline) => {
  beat(tl, 'setup', 0);
  enter(tl, '.bar', 'stagger', 0.2, { stagger: 'loose' });
  enter(tl, '.bracket', 'rise', 0.3);
  enter(tl, '.chain', 'rise', 0.45, { direction: 'down' });

  beat(tl, 'stack', 1.2);
  followThrough(tl, ['.bar-0', '.bar-1', '.bar-2', '.bar-3'], 1.4, { direction: 'right', distance: 260, drag: 'normal', amount: 'normal' });

  beat(tl, 'chain', 3.0);
  pendulum(tl, SELECTORS, 3.1, { swing: 'soft', drag: 'normal', swings: 3, direction: 'right', pivot: 'top' });

  beat(tl, 'rest', 4.2);
  enter(tl, '.caption', 'rise', 4.3);
  holdFinal(tl, 5.0, 1.2);
  return tl;
};

/** One link of the chain; links nest, so a parent's rotation carries its children. */
const Link: FC<{ i: number; color: string }> = ({ i, color }) => (
  <div className={`link-${i} absolute h-[130px] w-[36px]`} style={{ left: i === 0 ? -18 : 0, top: i === 0 ? 0 : LINK_H, transformOrigin: '50% 0%' }}>
    <div className="absolute inset-0 rounded-full" style={{ backgroundColor: color, opacity: 1 - i * 0.12 }} />
    {i < LINKS.length - 1 && <Link i={i + 1} color={color} />}
  </div>
);

export const Scene: FC = () => {
  useRemotionGSAP(buildTimeline);
  const { colors } = theme;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgPrimary, color: colors.textPrimary }}>
      <div className="absolute inset-0">
        <BackdropField theme={theme} variant="grid" intensity={0.25} />
      </div>
      <div className="absolute left-[120px] top-[90px] text-[56px] font-black tracking-[-0.03em]">Overlap &amp; follow-through</div>
      {LABELS.map((label, i) => (
        <div
          key={label}
          className={`bar bar-${i} absolute flex h-[96px] w-[520px] items-center rounded-2xl px-8 text-[32px] font-bold`}
          style={{ left: 160, top: 330 + i * 130, backgroundColor: i === 0 ? colors.accentPrimary : colors.accentSecondary, color: colors.bgPrimary }}
        >
          {label}
        </div>
      ))}
      <div className="bracket absolute h-[24px] w-[280px] rounded-full" style={{ left: CHAIN_X - 140, top: CHAIN_Y - 24, backgroundColor: colors.textMuted }} />
      <div className="chain absolute" style={{ left: CHAIN_X, top: CHAIN_Y }}>
        <Link i={0} color={colors.accentPrimary} />
      </div>
      <div className="caption absolute bottom-[40px] left-[120px] text-[32px] font-bold">
        Each part starts 3 f after its parent and settles after it: nothing stops on the same frame.
      </div>
    </AbsoluteFill>
  );
};

export default Scene;
