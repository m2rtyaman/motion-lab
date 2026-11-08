import { type FC } from 'react';
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { beat, enter, exit, emphasize, camera, holdFinal } from '../../core/presets';
import { DURATIONS, EASING } from '../../core/tokens';
import { getTheme } from '../../core/theme-contract';
import { BackdropField, SimulatedCursor } from '../../primitives/curated';
import { AppWindow } from './components/AppWindow';
import { TaskRow } from './components/TaskRow';
import { QuickAdd } from './components/QuickAdd';
import { DatePopover, Toast } from './components/Overlays';
import { Caption, Title } from './components/Hud';
import { EndCard } from './components/EndCard';

const theme = getTheme('dark');
const NAV = ['Inbox', 'Today', 'Upcoming', 'Projects'];
const OPTIONS = ['Today', 'Tomorrow', 'Friday', 'Pick a date'];
// The stage is 960 px tall; the 120 px band under it is reserved for captions, so UI never sits under a caption.
const CAM = { one: { x: -192, y: -77, scale: 1.6 }, back: { x: 0, y: -10, scale: 0.8, filter: 'blur(4px)' } };
const move = (tl: gsap.core.Timeline, to: object, at: number, dur = 1.2) => tl.to('.cam', { ...to, duration: dur, ease: EASING.sineInOut }, at);
const cursor = (tl: gsap.core.Timeline, x: number, y: number, at: number, dur: number = DURATIONS.long) => tl.to('.simulated-cursor', { x, y, duration: dur, ease: EASING.sineInOut }, at);
const click = (tl: gsap.core.Timeline, at: number) => tl.fromTo('.cursor-ripple', { opacity: 0.9, scale: 0.4 }, { opacity: 0, scale: 1.6, duration: DURATIONS.panel, ease: EASING.expoOut }, at);

export const buildTimeline = (tl: gsap.core.Timeline) => {
  tl.set('.row-shift', { y: -84 }, 0);
  tl.set('.simulated-cursor', { x: 900, y: 760, scale: 1.4, opacity: 0 }, 0);
  beat(tl, 'open', 0);
  enter(tl, '.app-window', 'blurIn', 0.1);
  enter(tl, '.open-title .title-word', 'words', 0.4);
  camera(tl, '.backdrop', 'drift', 0.1, { intensity: 'soft' });
  enter(tl, '.cap-band', 'wipe', 1.0);
  exit(tl, '.open-title .title-word', 'sink', 1.75);

  beat(tl, 'capture', 1.8);
  move(tl, CAM.one, 1.85);
  enter(tl, '.cap-1', 'rise', 2.2);
  tl.to('.simulated-cursor', { x: 570, y: 414, opacity: 1, duration: DURATIONS.long, ease: EASING.sineInOut }, 2.4);
  click(tl, 3.25);
  emphasize(tl, '.quickadd', 'punch', 3.25);
  tl.to('.row-shift', { y: 0, duration: DURATIONS.panel, ease: EASING.expoOut }, 3.45);
  enter(tl, '.row-new', 'rise', 3.5);

  beat(tl, 'schedule', 4.3);
  exit(tl, '.cap-1', 'sink', 4.35);
  enter(tl, '.cap-2', 'rise', 4.6);
  cursor(tl, 1530, 514, 4.65, 1.0);
  click(tl, 5.7);
  enter(tl, '.popover', 'rise', 5.75);
  cursor(tl, 1470, 708, 6.0, DURATIONS.glide);

  beat(tl, 'pick', 6.1);
  click(tl, 6.45);
  enter(tl, '.due-set', 'pop', 6.5);
  exit(tl, '.popover', 'sink', 6.55);
  exit(tl, '.cap-2', 'sink', 7.0);

  beat(tl, 'share', 7.3);
  cursor(tl, 1560, 296, 7.3, 0.55);
  enter(tl, '.cap-3', 'rise', 7.45);
  click(tl, 7.9);
  enter(tl, '.avatar', 'stagger', 8.0, { stagger: 'tight' });
  enter(tl, '.toast', 'rise', 8.05);
  tl.to('.simulated-cursor', { opacity: 0, duration: DURATIONS.micro }, 8.4);
  exit(tl, '.cap-3', 'sink', 9.0);
  exit(tl, '.toast', 'sink', 9.05);

  beat(tl, 'outro', 9.1);
  move(tl, CAM.back, 9.15, 0.8);
  exit(tl, '.cap-band', 'shrink', 9.15);
  tl.to('.scrim', { opacity: 0.88, duration: 0.8, ease: EASING.sineInOut }, 9.15);
  enter(tl, '.end-mark', 'pop', 9.2);
  enter(tl, '.close-title .title-word', 'words', 9.25);
  enter(tl, '.cta', 'rise', 9.4);
  holdFinal(tl, 10.0, 1.2);
  return tl;
};

export const Scene: FC = () => {
  useRemotionGSAP(buildTimeline);
  const { colors } = theme;
  const avatars = (
    <div className="flex">
      {['AM', 'JR', '+2'].map((a, i) => (
        <div key={a} className="avatar -ml-3 flex h-[56px] w-[56px] items-center justify-center rounded-full text-[20px] font-bold" style={{ backgroundColor: i === 2 ? colors.bgSurfaceSubtle : colors.textMuted, color: i === 2 ? colors.textPrimary : colors.bgPrimary, border: `3px solid ${colors.bgSurface}` }}>{a}</div>
      ))}
    </div>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgPrimary, color: colors.textPrimary }}>
      <div className="backdrop absolute inset-0"><BackdropField theme={theme} variant="grid" intensity={0.4} /></div>
      <div className="stage absolute inset-x-0 top-0 h-[960px] overflow-hidden">
      <div className="cam absolute inset-0" style={{ transformOrigin: '50% 50%' }}>
        <AppWindow className="app-window absolute left-[240px] top-[152px]" theme={theme} title="Foldline" nav={NAV} heading="Today" subheading="Tuesday, October 14" shareLabel="Share" shareSlot={avatars}>
          <QuickAdd className="quickadd w-[600px]" theme={theme} placeholder="Add a task" />
          <div className="flex flex-col">
            <TaskRow className="row-new" theme={theme} title="Draft launch email" tag="Launch" due="No date" dueSet="Fri 17" />
            <TaskRow className="row-shift" theme={theme} title="Review pricing page" tag="Web" due="Wed 15" />
            <TaskRow className="row-shift" theme={theme} title="Book venue walkthrough" tag="Events" due="Thu 16" />
            <TaskRow className="row-shift" theme={theme} title="Send October invoices" tag="Admin" due="Fri 17" />
          </div>
        </AppWindow>
        <DatePopover className="popover absolute left-[1300px] top-[564px] opacity-0" theme={theme} options={OPTIONS} picked={2} />
        <Toast className="toast absolute left-[1180px] top-[368px] opacity-0" theme={theme} title="Shared with Design" detail="Anyone on the team can edit" />
        <SimulatedCursor color={colors.textPrimary} rippleColor={colors.accentPrimary} />
      </div>
      </div>
      <div className="cap-band absolute inset-x-0 bottom-0 h-[120px]" style={{ backgroundColor: colors.bgPrimary, borderTop: `1px solid ${colors.borderSubtle}` }} />
      <div className="scrim absolute inset-0 opacity-0" style={{ backgroundColor: colors.bgPrimary }} />
      <Title className="open-title absolute left-[240px] top-[30px]" theme={theme} words={['A', 'calmer', 'to-do', 'list.']} />
      <Caption className="cap-1 absolute top-[980px] left-[240px] opacity-0" theme={theme} step={1} text="Add a task in one click" />
      <Caption className="cap-2 absolute top-[980px] left-[240px] opacity-0" theme={theme} step={2} text="Pick a due date" />
      <Caption className="cap-3 absolute top-[980px] left-[240px] opacity-0" theme={theme} step={3} text="Share in a click" />
      <EndCard className="endcard absolute inset-0" theme={theme} lines={[['Three', 'clicks,'], ['one', 'calm', 'day.']]} cta="Try Foldline free" />
    </AbsoluteFill>
  );
};

export default Scene;
