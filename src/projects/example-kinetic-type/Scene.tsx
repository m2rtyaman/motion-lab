import { type FC } from 'react';
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { beat, enter, exit, emphasize, camera, transition, holdFinal } from '../../core/presets';
import { getTheme } from '../../core/theme-contract';
import { BackdropField } from '../../primitives/curated';

const theme = getTheme('editorial-warm');

const HOOK = ['Most', 'writing', 'is too', 'long.'];
const TURN = ['Cut it.', 'Then cut', 'it again.'];
const SIGN = ['Write short.', 'Think long.'];
const BRAND = 'Margin';

export const buildTimeline = (tl: gsap.core.Timeline) => {
  beat(tl, 'hook', 0);
  enter(tl, '.hook-word', 'words', 0.1);
  camera(tl, '.backdrop', 'drift', 0.1, { intensity: 'soft' });
  emphasize(tl, '.hook-last', 'punch', 1.0, { intensity: 'strong' });

  beat(tl, 'turn', 1.6);
  transition(tl, 'maskWipe', 1.45, { incoming: '.turn-panel', type: 'diagonal' });
  enter(tl, '.turn-line', 'stagger', 1.95, { stagger: 'loose' });
  camera(tl, '.turn-lines', 'pushIn', 2.0, { intensity: 'soft' });
  emphasize(tl, '.turn-last', 'punch', 3.0);

  beat(tl, 'sign', 3.7);
  exit(tl, '.turn-lines', 'sink', 3.65);
  enter(tl, '.sign-mark', 'pop', 3.8);
  enter(tl, '.sign-word', 'words', 4.05, { stagger: 'tight' });
  holdFinal(tl, 4.8, 1.2);
  return tl;
};

export const Scene: FC = () => {
  useRemotionGSAP(buildTimeline);
  const { colors } = theme;
  const pad = 'px-16 pt-[250px] pb-[300px]';
  const heavy = 'font-black uppercase leading-[0.92] tracking-[-0.025em]';
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgPrimary, color: colors.textPrimary }}>
      <div className="backdrop absolute inset-0">
        <BackdropField theme={theme} variant="rays" intensity={0.5} />
      </div>
      <div className={`absolute inset-0 flex flex-col justify-center ${pad}`}>
        <div className="mb-10 h-3 w-40 rounded-full" style={{ backgroundColor: colors.accentPrimary }} />
        {HOOK.map((w, i) => (
          <span key={w} className={`hook-word ${i === HOOK.length - 1 ? 'hook-last' : ''} ${heavy} block text-[188px]`} style={i === HOOK.length - 1 ? { color: colors.accentPrimary } : undefined}>{w}</span>
        ))}
      </div>
      <div className={`turn-panel absolute inset-0 flex flex-col justify-center ${pad}`} style={{ backgroundColor: colors.textPrimary, color: colors.bgPrimary }}>
        <div className="turn-lines flex flex-col">
          {TURN.map((w, i) => (
            <span key={w} className={`turn-line ${i === TURN.length - 1 ? 'turn-last' : ''} ${heavy} block text-[164px]`} style={i === TURN.length - 1 ? { color: colors.accentSecondary } : undefined}>{w}</span>
          ))}
        </div>
        <div className="absolute inset-0 flex flex-col items-start justify-center gap-10 px-16">
          <div className="sign-mark flex h-36 w-36 items-center justify-center rounded-3xl text-[96px] font-black" style={{ backgroundColor: colors.accentPrimary, color: colors.bgSurface }}>{BRAND.charAt(0)}</div>
          <div className="flex flex-col">
            {SIGN.map((w) => (
              <span key={w} className={`sign-word ${heavy} block text-[120px]`}>{w}</span>
            ))}
          </div>
          <span className="sign-word font-mono text-[36px] uppercase tracking-[0.16em]" style={{ color: colors.textGhost }}>{BRAND} - notes for short writers</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default Scene;
