import { type FC } from 'react';
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { beat, enter, camera, holdFinal } from '../../core/presets';
import { DURATIONS, EASING } from '../../core/tokens';
import { getTheme } from '../../core/theme-contract';
import { BackdropField } from '../../primitives/curated';

const theme = getTheme('dark');
const BRAND = 'Orbit';
const TAGLINE = 'Time, arranged.';

export const buildTimeline = (tl: gsap.core.Timeline) => {
  beat(tl, 'form', 0);
  enter(tl, '.ring-arc', 'wipe', 0.15);
  enter(tl, '.ring-dot', 'pop', 0.7);
  camera(tl, '.backdrop', 'drift', 0.1, { intensity: 'soft' });

  beat(tl, 'resolve', 1.5);
  tl.fromTo('.ring-wrap', { x: 193 }, { x: 0, duration: DURATIONS.long, ease: EASING.expoOut }, 1.5); // ring starts centred, lockup opens around it
  enter(tl, '.wordmark', 'blurIn', 1.7);
  enter(tl, '.tagline', 'rise', 2.1);
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
      <div className="mark flex items-center gap-14">
        <div className="ring-wrap relative h-44 w-44">
          <div className="ring-arc absolute inset-0 rounded-full" style={{ border: `14px solid ${colors.accentPrimary}` }} />
          <div className="ring-dot absolute -right-1 top-6 h-10 w-10 rounded-full" style={{ backgroundColor: colors.textPrimary }} />
        </div>
        <div className="flex flex-col gap-3">
          <div className="wordmark text-[120px] font-black leading-none tracking-[-0.04em]">{BRAND}</div>
          <div className="tagline text-[36px] font-medium" style={{ color: colors.textMuted }}>{TAGLINE}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default Scene;
