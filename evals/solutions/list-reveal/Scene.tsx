import { type FC } from 'react';
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../../../src/core/useRemotionGSAP';
import { beat, enter, emphasize, camera, holdFinal } from '../../../src/core/presets';
import { getTheme } from '../../../src/core/theme-contract';
import { BackdropField } from '../../../src/primitives/curated';

const theme = getTheme('dark');
const TITLE = ['How', 'we', 'work'];
const STEPS = [
  ['Listen', 'find the real problem'],
  ['Sketch', 'ten rough ideas, fast'],
  ['Prototype', 'make one idea real'],
  ['Animate', 'give it weight and timing'],
  ['Ship', 'put it in front of people'],
];
const ONSETS = [1.1, 1.22, 1.34, 2.0, 2.5]; // s: burst of three, rest, hero, rest, last
const HERO = 3;

export const buildTimeline = (tl: gsap.core.Timeline) => {
  beat(tl, 'title', 0);
  enter(tl, '.rule', 'wipe', 0.05);
  enter(tl, '.title-word', 'words', 0.1);
  camera(tl, '.backdrop', 'drift', 0.1, { intensity: 'soft' });

  beat(tl, 'steps', 1.0);
  ONSETS.forEach((at, i) => enter(tl, `.item-${i}`, 'rise', at, { intensity: i === HERO ? 'strong' : 'soft' }));
  emphasize(tl, `.item-${HERO}`, 'punch', 2.2);

  beat(tl, 'close', 3.0);
  camera(tl, '.list', 'pushIn', 3.0, { intensity: 'soft' });
  enter(tl, '.footer', 'rise', 3.15);
  holdFinal(tl, 3.8, 1.2);
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
      <div className="absolute inset-0 flex items-center gap-24 px-[140px]">
        <div className="flex w-[560px] flex-col gap-8">
          <div className="rule h-3 w-40 rounded-full" style={{ backgroundColor: colors.accentPrimary }} />
          <h1 className="flex flex-col text-[150px] font-black leading-[0.95] tracking-[-0.04em]">
            {TITLE.map((w) => <span key={w} className="title-word block">{w}</span>)}
          </h1>
        </div>
        <div className="list flex flex-1 flex-col gap-[1px]" style={{ backgroundColor: colors.borderSubtle }}>
          {STEPS.map(([name, note], i) => (
            <div key={name} className={`item-${i} flex items-baseline gap-8 px-10 py-7`} style={{ backgroundColor: colors.bgPrimary }}>
              <span className="w-[56px] font-mono text-[28px]" style={{ color: colors.textMuted }}>0{i + 1}</span>
              <span className="text-[64px] font-black leading-none tracking-[-0.03em]" style={i === HERO ? { color: colors.accentPrimary } : undefined}>{name}</span>
              <span className="ml-auto text-[28px]" style={{ color: colors.textMuted }}>{note}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="footer absolute text-[36px] font-bold" style={{ left: 140, bottom: 70, color: colors.accentSecondary }}>Five steps. No detours.</div>
    </AbsoluteFill>
  );
};

export default Scene;
