import { type FC } from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { useRemotionGSAP } from '../../../src/core/useRemotionGSAP';
import { beat, enter, emphasize, camera, holdFinal } from '../../../src/core/presets';
import { getTheme } from '../../../src/core/theme-contract';
import { BackdropField } from '../../../src/primitives/curated';

const theme = getTheme('dark');
const KICKER = 'Harbor Line';
const LABEL = 'riders this month';
const COUNT = { to: 48200, startSec: 1.1, seconds: 1.4 }; // ends at 2.5 s, well before the 3.8 s hold

export const buildTimeline = (tl: gsap.core.Timeline) => {
  beat(tl, 'build', 0);
  enter(tl, '.rule', 'wipe', 0.05);
  enter(tl, '.kicker', 'rise', 0.2);
  camera(tl, '.backdrop', 'drift', 0.1, { intensity: 'soft' });

  beat(tl, 'count', 1.0);
  enter(tl, '.number-wrap', 'pop', 1.0);
  camera(tl, '.stage', 'pushIn', 1.1, { intensity: 'soft' });
  emphasize(tl, '.number', 'punch', 2.55); // lands as the count finishes

  beat(tl, 'land', 2.7);
  enter(tl, '.label', 'rise', 2.8);
  enter(tl, '.underline', 'wipe', 2.95);
  holdFinal(tl, 3.8, 1.2);
  return tl;
};

export const Scene: FC = () => {
  useRemotionGSAP(buildTimeline);
  const frame = useCurrentFrame(); // the count is a pure function of the frame
  const { fps } = useVideoConfig();
  const value = Math.round(
    interpolate(frame, [COUNT.startSec * fps, (COUNT.startSec + COUNT.seconds) * fps], [0, COUNT.to], {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  const { colors } = theme;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgPrimary, color: colors.textPrimary }}>
      <div className="backdrop absolute inset-0">
        <BackdropField theme={theme} variant="rings" intensity={0.4} />
      </div>
      <div className="stage absolute inset-0 flex flex-col items-center justify-center gap-8 px-16 pb-[300px] pt-[250px]">
        <div className="rule h-3 w-40 rounded-full" style={{ backgroundColor: colors.accentPrimary }} />
        <div className="kicker font-mono text-[40px] uppercase tracking-[0.16em]" style={{ color: colors.textMuted }}>{KICKER}</div>
        <div className="number-wrap">
          <div className="number text-[240px] font-black leading-none tracking-[-0.04em] tabular-nums">{value.toLocaleString('en-US')}</div>
        </div>
        <div className="label text-[56px] font-bold" style={{ color: colors.accentPrimary }}>{LABEL}</div>
        <div className="underline h-3 w-72 rounded-full" style={{ backgroundColor: colors.accentSecondary }} />
      </div>
    </AbsoluteFill>
  );
};

export default Scene;
