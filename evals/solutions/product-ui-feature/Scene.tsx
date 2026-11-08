import { type FC } from 'react';
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../../../src/core/useRemotionGSAP';
import { beat, enter, emphasize, camera, transition, holdFinal } from '../../../src/core/presets';
import { DURATIONS, EASING, UI_SCALE } from '../../../src/core/tokens';
import { getTheme } from '../../../src/core/theme-contract';
import { BackdropField, BrowserFrame, SimulatedCursor } from '../../../src/primitives/curated';

const theme = getTheme('light');
const UI_ZOOM = UI_SCALE.recommendedZoom[0]; // the shell draws its 16 px URL bar at native size: zoom it above 18 px, the content below undoes the zoom
const HEADLINE = ['Saves', 'that', 'sort', 'themselves.'];
const SAVES = [
  ['How tides shape a harbour', 'coastlines.example'],
  ['Variable fonts, explained', 'typefaces.example'],
  ['One-pan lemon chicken', 'kitchen.example'],
  ['The case for slow reading', 'essays.example'],
  ['Grid systems in practice', 'layout.example'],
];
const COLLECTIONS = [['Design', '2'], ['Reading list', '1'], ['Recipes', '1'], ['Nature', '1']];

export const buildTimeline = (tl: gsap.core.Timeline) => {
  beat(tl, 'open', 0);
  enter(tl, '.frame-wrap', 'blurIn', 0.1);
  enter(tl, '.headline-word', 'words', 0.25);
  enter(tl, '.save-row', 'stagger', 0.9, { stagger: 'normal' });
  camera(tl, '.backdrop', 'drift', 0.1, { intensity: 'soft' });

  beat(tl, 'act', 2.0);
  tl.fromTo('.simulated-cursor', { x: -520, y: 380, opacity: 0 }, { x: 120, y: 40, opacity: 1, duration: DURATIONS.long, ease: EASING.sineInOut }, 2.05);
  tl.fromTo('.cursor-ripple', { opacity: 0.9, scale: 0.4 }, { opacity: 0, scale: 1.6, duration: DURATIONS.panel, ease: EASING.expoOut }, 2.95);
  emphasize(tl, '.sort-btn', 'punch', 2.95);
  camera(tl, '.frame-wrap', 'pushIn', 3.0, { intensity: 'soft' });
  enter(tl, '.collection', 'stagger', 3.2, { stagger: 'normal' });
  transition(tl, 'maskWipe', 4.0, { incoming: '.finale', type: 'iris', outgoingSelector: '.app-stage' });

  beat(tl, 'finale', 4.4);
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
          <BrowserFrame theme={theme} url="app.tidemark.example/inbox" title="Tidemark">
            <div style={{ zoom: 1 / UI_ZOOM }}>
            <div className="flex items-center justify-between px-10 pt-8">
              <div className="text-[40px] font-bold tracking-[-0.02em]">Inbox <span className="text-[26px] font-medium" style={{ color: colors.textMuted }}>5 saves</span></div>
              <div className="relative">
                <div className="sort-btn rounded-xl px-8 py-4 text-[28px] font-bold" style={{ backgroundColor: colors.accentPrimary, color: colors.bgSurface }}>Sort into collections</div>
                <SimulatedCursor color={colors.textPrimary} rippleColor={colors.borderFocus} />
              </div>
            </div>
            <div className="flex gap-10 px-10 py-8">
              <div className="flex flex-1 flex-col gap-4">
                {SAVES.map(([title, site]) => (
                  <div key={title} className="save-row flex items-center gap-5 rounded-xl px-6 py-4" style={{ backgroundColor: colors.bgSurface }}>
                    <div className="h-10 w-10 rounded-full" style={{ backgroundColor: colors.accentSecondary }} />
                    <div className="text-[30px] font-semibold">{title}</div>
                    <div className="ml-auto text-[24px]" style={{ color: colors.textMuted }}>{site}</div>
                  </div>
                ))}
              </div>
              <div className="flex w-[420px] flex-col gap-4">
                {COLLECTIONS.map(([name, n]) => (
                  <div key={name} className="collection flex items-center justify-between rounded-xl border-2 px-6 py-5 text-[30px] font-bold" style={{ borderColor: colors.accentPrimary }}>
                    {name}<span style={{ color: colors.accentPrimary }}>{n}</span>
                  </div>
                ))}
              </div>
            </div>
            </div>
          </BrowserFrame>
        </div>
      </div>
      <div className="finale absolute inset-0 flex flex-col items-center justify-center gap-10" style={{ backgroundColor: colors.accentPrimary, color: colors.bgSurface }}>
        <div className="finale-mark flex h-32 w-32 items-center justify-center rounded-3xl text-[72px] font-black" style={{ backgroundColor: colors.bgSurface, color: colors.accentPrimary }}>T</div>
        <h2 className="flex gap-6 text-[96px] font-black tracking-[-0.035em]">
          {HEADLINE.map((w) => <span key={w} className="finale-word inline-block">{w}</span>)}
        </h2>
        <div className="finale-cta rounded-full px-14 py-6 text-[36px] font-bold" style={{ backgroundColor: colors.bgSurface, color: colors.accentPrimary }}>
          Try Tidemark free
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default Scene;
