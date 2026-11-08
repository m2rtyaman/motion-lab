import { type FC } from 'react';
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../../../src/core/useRemotionGSAP';
import { beat, enter, camera, holdFinal } from '../../../src/core/presets';
import { DURATIONS, EASING } from '../../../src/core/tokens';
import { getTheme } from '../../../src/core/theme-contract';
import { BackdropField } from '../../../src/primitives/curated';

const theme = getTheme('dark');
const BRAND = 'Halcyon';
const TAGLINE = 'Calm software.';
const WAVES = [100, 76, 52]; // % width of each bar, top to bottom

export const buildTimeline = (tl: gsap.core.Timeline) => {
  beat(tl, 'form', 0);
  enter(tl, '.wave', 'stagger', 0.15, { stagger: 'normal' });
  enter(tl, '.sun', 'pop', 0.6);
  camera(tl, '.backdrop', 'drift', 0.1, { intensity: 'soft' });

  beat(tl, 'resolve', 1.3);
  tl.fromTo('.mark-wrap', { x: 288 }, { x: 0, duration: DURATIONS.long, ease: EASING.sineInOut }, 1.3); // mark starts centred, the lockup opens around it
  enter(tl, '.wordmark', 'blurIn', 1.5);
  enter(tl, '.tagline', 'rise', 2.15);
  holdFinal(tl, 2.8, 1.2);
  return tl;
};

export const Scene: FC = () => {
  useRemotionGSAP(buildTimeline);
  const { colors } = theme;
  return (
    <AbsoluteFill className="items-center justify-center" style={{ backgroundColor: colors.bgPrimary, color: colors.textPrimary }}>
      <div className="backdrop absolute inset-0">
        <BackdropField theme={theme} variant="grid" intensity={0.3} />
      </div>
      <div className="lockup flex items-center gap-14">
        <div className="mark-wrap relative h-44 w-44">
          <div className="sun absolute left-1/2 top-0 h-24 w-24 -translate-x-1/2 rounded-full" style={{ backgroundColor: colors.accentSecondary }} />
          {WAVES.map((w, i) => (
            <div key={w} className="wave absolute left-0 h-[16px] rounded-full" style={{ top: 100 + i * 28, width: `${w}%`, backgroundColor: colors.accentPrimary }} />
          ))}
        </div>
        <div className="flex w-[520px] flex-col gap-3">
          <div className="wordmark text-[112px] font-black leading-none tracking-[-0.04em]">{BRAND}</div>
          <div className="tagline text-[40px] font-medium" style={{ color: colors.textMuted }}>{TAGLINE}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default Scene;
