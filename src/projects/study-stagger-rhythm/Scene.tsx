import { type FC } from 'react';
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { beat, enter, holdFinal } from '../../core/presets';
import { getTheme } from '../../core/theme-contract';
import { BackdropField } from '../../primitives/curated';

const theme = getTheme('dark');
const START = 1.4; // s, first item
const SPAN = 2.07; // s, first to last item on both sides
const GOOD = [0, 0.12, 0.24, 0.8, 1.3, 1.42, 1.95, 2.07]; // burst, rest, hero, pair, pair
const BAD = GOOD.map((_, i) => (SPAN * i) / (GOOD.length - 1)); // metronome
const ITEMS = GOOD.map((_, i) => i);
const TILE = 70; // px
const GAP = 26; // px
const SIDES = [
  { id: 'bad', left: 120, title: 'WRONG  equal gaps, 18 f', times: BAD },
  { id: 'good', left: 1020, title: 'RIGHT  burst, rest, hero, pair', times: GOOD },
] as const;

export const buildTimeline = (tl: gsap.core.Timeline) => {
  beat(tl, 'open', 0);
  enter(tl, '.title', 'rise', 0.15);
  enter(tl, '.slot', 'stagger', 0.3, { stagger: 'tight' });
  enter(tl, '.tick', 'stagger', 0.6, { stagger: 'tight' });

  beat(tl, 'phrase-a', START - 0.2);
  const lane = (id: 'bad' | 'good', times: readonly number[], from: number, to: number) =>
    times.forEach((t, i) => { if (START + t >= from && START + t < to) enter(tl, `.${id}-${i}`, 'rise', START + t, { intensity: 'soft' }); });
  SIDES.forEach((s) => lane(s.id, s.times, START - 0.2, 2.4));
  beat(tl, 'phrase-b', 2.4);
  SIDES.forEach((s) => lane(s.id, s.times, 2.4, 3.6));
  beat(tl, 'phrase-c', 3.6);
  SIDES.forEach((s) => lane(s.id, s.times, 3.6, 9));
  enter(tl, '.caption', 'rise', 4.0);
  holdFinal(tl, 4.6, 1.2);
  return tl;
};

export const Scene: FC = () => {
  useRemotionGSAP(buildTimeline);
  const { colors } = theme;
  const x = (i: number) => i * (TILE + GAP);
  const stripW = 7 * (TILE + GAP) + TILE;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgPrimary, color: colors.textPrimary }}>
      <div className="absolute inset-0">
        <BackdropField theme={theme} variant="grid" intensity={0.25} />
      </div>
      <div className="absolute left-[960px] top-[160px] h-[760px] w-[2px]" style={{ backgroundColor: colors.textMuted }} />
      {SIDES.map(({ id, left, title, times }) => (
        <div key={id}>
          <div className="title absolute top-[130px] text-[40px] font-black" style={{ left, color: id === 'good' ? colors.accentPrimary : colors.textMuted }}>{title}</div>
          {ITEMS.map((i) => {
            const hero = id === 'good' && i === 3;
            const h = hero ? 300 : 200;
            return (
              <div key={i}>
                <div className="slot absolute rounded-2xl" style={{ left: left + x(i), top: 700 - h, width: TILE, height: h, border: `3px dashed ${colors.textMuted}` }} />
                <div className={`${id}-${i} absolute rounded-2xl`} style={{ left: left + x(i), top: 700 - h, width: TILE, height: h, opacity: 0, backgroundColor: hero ? colors.accentSecondary : colors.accentPrimary }} />
                <div className="tick absolute h-[34px] w-[6px] rounded-full" style={{ left: left + (times[i] / SPAN) * (stripW - 6), top: 770, backgroundColor: colors.textPrimary }} />
              </div>
            );
          })}
          <div className="absolute h-[2px]" style={{ left, top: 804, width: stripW, backgroundColor: colors.textMuted }} />
          <div className="absolute text-[24px]" style={{ left, top: 820, color: colors.textMuted }}>onset times, 0 to 2.07 s</div>
        </div>
      ))}
      <div className="caption absolute bottom-[40px] left-[120px] text-[32px] font-bold">
        Equal gaps feel like a metronome. Groups and pauses (7 f burst, 30 f rest) feel like a phrase.
      </div>
    </AbsoluteFill>
  );
};

export default Scene;
