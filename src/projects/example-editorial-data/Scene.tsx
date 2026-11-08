import { type FC } from 'react';
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { beat, enter, emphasize, camera, holdFinal } from '../../core/presets';
import { DURATIONS, EASING, TIMING } from '../../core/tokens';
import { getTheme } from '../../core/theme-contract';
import { BackdropField } from '../../primitives/curated';
import { StatNumber } from './components/StatNumber';
import { Kicker } from './components/Kicker';
import { BarChart } from './components/BarChart';
import { Takeaway } from './components/Takeaway';

const theme = getTheme('editorial-warm');
const KICKER = 'Ardmore cycling report 2025';
const STAT = '3.4×';
const LABEL = 'more weekday bike trips downtown than in 2019';
const SUBLABEL = 'Average trips per day, thousands';
const TAKEAWAY = ['Protected', 'lanes', 'pay', 'off', 'in', 'riders.'];
const SOURCE = 'Source: Ardmore Cycling Count, 2019 to 2025';
const DATA = [['2019', 4.1], ['2020', 4.3], ['2021', 5.2], ['2022', 6.8], ['2023', 9.4], ['2024', 12], ['2025', 13.9]].map(([label, value]) => ({ label: label as string, value: value as number }));

export const buildTimeline = (tl: gsap.core.Timeline) => {
  beat(tl, 'stat', 0);
  tl.set('.stat-num', { x: 0, y: 230, scale: 1 }, 0);
  tl.set('.stat-label', { x: 420, y: 250 }, 0);
  enter(tl, '.kicker', 'rise', 0.1);
  enter(tl, '.stat-num-in', 'blurIn', 0.25);
  enter(tl, '.stat-label-in', 'rise', 0.95);
  camera(tl, '.backdrop', 'drift', 0.1, { intensity: 'soft' });

  beat(tl, 'chart', 2.2);
  tl.to('.stat-num', { x: 0, y: 0, scale: 0.5, duration: DURATIONS.long, ease: EASING.expoInOut }, 2.2);
  tl.to('.stat-label', { x: 0, y: 0, duration: DURATIONS.long, ease: EASING.expoInOut }, 2.2);
  enter(tl, '.chart-baseline', 'wipe', 2.75);
  enter(tl, '.bar-year', 'stagger', 2.8, { stagger: 'tight' });
  tl.fromTo('.bar', { scaleY: 0 }, { scaleY: 1, duration: DURATIONS.long, ease: EASING.expoOut, stagger: TIMING.layerStagger }, 3.0);
  enter(tl, '.bar-val', 'stagger', 3.25, { stagger: 'normal' });

  beat(tl, 'lanes', 3.8);
  tl.to('.bar-pre', { opacity: 0.4, duration: DURATIONS.glide, ease: EASING.powerOut }, 4.0);
  enter(tl, '.chart-annot', 'rise', 3.85);

  beat(tl, 'takeaway', 5.6);
  emphasize(tl, '.bar-last', 'punch', 5.6);
  emphasize(tl, '.bar-val-last', 'punch', 5.6);
  enter(tl, '.takeaway-rule', 'wipe', 5.75);
  enter(tl, '.takeaway-word', 'words', 5.85);
  enter(tl, '.source', 'rise', 6.3);
  holdFinal(tl, 6.8, 1.2);
  return tl;
};

export const Scene: FC = () => {
  useRemotionGSAP(buildTimeline);
  const { colors } = theme;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgPrimary, color: colors.textPrimary }}>
      <div className="backdrop absolute inset-0"><BackdropField theme={theme} variant="grid" intensity={0.35} /></div>
      <Kicker className="kicker absolute left-[120px] top-[56px]" theme={theme} text={KICKER} />
      <StatNumber className="stat-num absolute left-[120px] top-[112px]" theme={theme} value={STAT} />
      <div className="stat-label absolute left-[640px] top-[124px] w-[720px]">
        <div className="stat-label-in">
          <div className="text-[48px] font-bold leading-[1.15] tracking-[-0.025em]">{LABEL}</div>
          <div className="mt-3 text-[28px] font-medium" style={{ color: colors.textMuted }}>{SUBLABEL}</div>
        </div>
      </div>
      <BarChart className="absolute left-[120px] top-[350px]" theme={theme} data={DATA} splitIndex={3} annotation="Protected lanes open" unit="k" />
      <Takeaway className="absolute left-[120px] top-[846px]" theme={theme} words={TAKEAWAY} />
      <div className="source absolute bottom-[40px] left-[120px] text-[20px]" style={{ color: colors.textMuted }}>{SOURCE}</div>
    </AbsoluteFill>
  );
};

export default Scene;
