import { type FC } from 'react';
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../../../src/core/useRemotionGSAP';
import { beat, enter, exit, emphasize, camera, holdFinal } from '../../../src/core/presets';
import { getTheme } from '../../../src/core/theme-contract';
import { BackdropField } from '../../../src/primitives/curated';

const theme = getTheme('dark');
const LINES = [
  { id: 'l1', words: ['Less', 'noise.'] },
  { id: 'l2', words: ['More', 'signal.'] },
  { id: 'l3', words: ['Say it', 'once.'] },
];

export const buildTimeline = (tl: gsap.core.Timeline) => {
  beat(tl, 'less', 0);
  enter(tl, '.bar', 'wipe', 0.05);
  enter(tl, '.l1-word', 'words', 0.1);
  camera(tl, '.backdrop', 'drift', 0.1, { intensity: 'soft' });
  emphasize(tl, '.l1-last', 'punch', 1.0, { intensity: 'strong' });

  beat(tl, 'more', 1.5);
  exit(tl, '.l1', 'sink', 1.5);
  enter(tl, '.l2-word', 'words', 1.65);
  camera(tl, '.stage', 'pushIn', 1.7, { intensity: 'soft' });
  emphasize(tl, '.l2-last', 'punch', 2.55);

  beat(tl, 'once', 3.2);
  exit(tl, '.l2', 'sink', 3.2);
  camera(tl, '.stage', 'settle', 3.3);
  enter(tl, '.l3-word', 'words', 3.4);
  enter(tl, '.dot', 'pop', 4.0);
  holdFinal(tl, 4.8, 1.2);
  return tl;
};

export const Scene: FC = () => {
  useRemotionGSAP(buildTimeline);
  const { colors } = theme;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgPrimary, color: colors.textPrimary }}>
      <div className="backdrop absolute inset-0">
        <BackdropField theme={theme} variant="rays" intensity={0.4} />
      </div>
      <div className="stage absolute inset-0">
        <div className="bar absolute h-3 w-40 rounded-full" style={{ left: 64, top: 250, backgroundColor: colors.accentPrimary }} />
        {LINES.map(({ id, words }) => (
          <div key={id} className={`${id} absolute inset-0 flex flex-col justify-center px-16 pb-[300px] pt-[250px]`}>
            {words.map((w, i) => (
              <span
                key={w}
                className={`${id}-word ${i === words.length - 1 ? `${id}-last` : ''} block text-[176px] font-black uppercase leading-[0.94] tracking-[-0.03em]`}
                style={i === words.length - 1 ? { color: colors.accentPrimary } : undefined}
              >
                {w}
              </span>
            ))}
          </div>
        ))}
        <div className="dot absolute h-10 w-10 rounded-full" style={{ left: 64, bottom: 330, backgroundColor: colors.accentSecondary }} />
      </div>
    </AbsoluteFill>
  );
};

export default Scene;
