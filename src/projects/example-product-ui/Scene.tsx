import { type FC } from 'react';
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { beat, enter, emphasize, camera, transition, holdFinal } from '../../core/presets';
import { DURATIONS, EASING, UI_SCALE } from '../../core/tokens';
import { getTheme } from '../../core/theme-contract';
import { BackdropField, BrowserFrame, ChartCanvas, SimulatedCursor } from '../../primitives/curated';

const theme = getTheme('light');
const UI_ZOOM = UI_SCALE.recommendedZoom[0]; // the shell draws its 16 px URL bar at native size: zoom it above 18 px, the content below undoes the zoom
const HEADLINE = ['Month-end,', 'handled.'];
const FINALE = ['Close', 'the', 'month', 'before', 'lunch.'];
const CHART = ['W1', 'W2', 'W3', 'W4', 'W5'].map((label, i) => ({ label, value: [34, 52, 47, 71, 84][i] }));

export const buildTimeline = (tl: gsap.core.Timeline) => {
  beat(tl, 'open', 0);
  enter(tl, '.frame-wrap', 'blurIn', 0.1);
  enter(tl, '.headline-word', 'words', 0.25);
  enter(tl, '.frame-head', 'rise', 0.8);
  enter(tl, '.chart-wrap', 'rise', 1.2);
  camera(tl, '.backdrop', 'drift', 0.1, { intensity: 'soft' });

  beat(tl, 'act', 2.0);
  tl.fromTo('.simulated-cursor', { x: -560, y: 420, opacity: 0 }, { x: 150, y: 48, opacity: 1, duration: DURATIONS.long, ease: EASING.sineInOut }, 2.05);
  tl.fromTo('.cursor-ripple', { opacity: 0.9, scale: 0.4 }, { opacity: 0, scale: 1.6, duration: DURATIONS.panel, ease: EASING.expoOut }, 2.95);
  emphasize(tl, '.reconcile-btn', 'punch', 2.95);
  camera(tl, '.frame-wrap', 'pushIn', 3.0, { intensity: 'soft' });
  transition(tl, 'maskWipe', 4.0, { incoming: '.finale', type: 'iris', outgoingSelector: '.app-stage' });

  beat(tl, 'finale', 4.2);
  enter(tl, '.finale-mark', 'pop', 4.6);
  enter(tl, '.finale-word', 'words', 4.85);
  enter(tl, '.finale-cta', 'rise', 5.5);
  emphasize(tl, '.finale-cta', 'punch', 5.9);
  holdFinal(tl, 6.8, 1.2);
  return tl;
};

export const Scene: FC = () => {
  useRemotionGSAP(buildTimeline);
  const { colors } = theme;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgPrimary, color: colors.textPrimary }}>
      <div className="backdrop absolute inset-0">
        <BackdropField theme={theme} variant="mesh" intensity={0.6} />
      </div>
      <div className="app-stage absolute inset-0 flex flex-col gap-5 px-[200px] pb-[64px] pt-[48px]">
        <h1 className="flex gap-4 text-[72px] font-black tracking-[-0.03em]">
          {HEADLINE.map((w) => <span key={w} className="headline-word inline-block">{w}</span>)}
        </h1>
        <div className="frame-wrap min-h-0 flex-1" style={{ zoom: UI_ZOOM }}>
          <BrowserFrame theme={theme} url="app.tallybook.example/october" title="Tallybook">
            <div style={{ zoom: 1 / UI_ZOOM }}>
            <div className="frame-head flex items-center justify-between px-10 pt-8">
              <div>
                <div className="text-[40px] font-bold tracking-[-0.02em]">October close</div>
                <div className="text-[24px]" style={{ color: colors.textMuted }}>214 transactions matched</div>
              </div>
              <div className="relative">
                <div className="reconcile-btn rounded-xl px-8 py-4 text-[28px] font-bold" style={{ backgroundColor: colors.accentPrimary, color: colors.bgSurface }}>Reconcile all</div>
                <SimulatedCursor color={colors.textPrimary} rippleColor={colors.borderFocus} />
              </div>
            </div>
            <div className="chart-wrap px-10 py-6" style={{ zoom: 1.7 }}>
              <ChartCanvas theme={theme} title="Cash cleared" badge="Weekly" value="$84.2k" change="+12.4%" data={CHART} height={165} />
            </div>
            </div>
          </BrowserFrame>
        </div>
      </div>
      <div className="finale absolute inset-0 flex flex-col items-center justify-center gap-10" style={{ backgroundColor: colors.accentPrimary, color: colors.bgSurface }}>
        <div className="finale-mark flex h-32 w-32 items-center justify-center rounded-3xl text-[72px] font-black" style={{ backgroundColor: colors.bgSurface, color: colors.accentPrimary }}>T</div>
        <h2 className="flex gap-6 text-[96px] font-black tracking-[-0.035em]">
          {FINALE.map((w) => <span key={w} className="finale-word inline-block">{w}</span>)}
        </h2>
        <div className="finale-cta rounded-full px-14 py-6 text-[36px] font-bold" style={{ backgroundColor: colors.bgSurface, color: colors.accentPrimary }}>
          Try Tallybook free
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default Scene;
