import { type FC } from 'react';
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { beat, enter, holdFinal } from '../../core/presets';
import { bounce, bounceModel, bouncePoint, bounceSeconds } from '../../core/physics';
import { getTheme } from '../../core/theme-contract';
import { BackdropField } from '../../primitives/curated';

const theme = getTheme('dark');
const OPTS = { height: 420, bounces: 4, restitution: 0.62, squash: 'normal', travel: 1300 } as const;
const GROUND_Y = 900; // px, bottom of the ball at rest
const BALL = 240; // px
const BALL_X = 140; // px
const DOT_EVERY = 4 / 60; // s, one spacing dot per 4 frames
const DROP_AT = 1.2; // s

export const buildTimeline = (tl: gsap.core.Timeline) => {
  beat(tl, 'setup', 0);
  enter(tl, '.legend', 'rise', 0.1);
  enter(tl, '.ground', 'wipe', 0.1);
  enter(tl, '.guide', 'stagger', 0.3, { stagger: 'loose' });
  enter(tl, '.dot', 'stagger', 0.5, { stagger: 'tight' });
  enter(tl, '.ball', 'pop', 0.4);

  beat(tl, 'fall', DROP_AT);
  bounce(tl, '.ball', DROP_AT, OPTS); // one call schedules the fall, 4 rebounds, squash and stretch

  beat(tl, 'decay', 2.7);
  enter(tl, '.note', 'rise', 2.8);

  beat(tl, 'rest', 5.0);
  enter(tl, '.caption', 'rise', 5.05);
  holdFinal(tl, 5.5, 1.2);
  return tl;
};

export const Scene: FC = () => {
  useRemotionGSAP(buildTimeline);
  const { colors } = theme;
  const m = bounceModel(OPTS);
  const total = bounceSeconds(OPTS);
  const dots = Array.from({ length: Math.floor(m.contacts[m.bounces] / DOT_EVERY) + 1 }, (_, i) => bouncePoint(i * DOT_EVERY, OPTS));
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgPrimary, color: colors.textPrimary }}>
      <div className="absolute inset-0">
        <BackdropField theme={theme} variant="grid" intensity={0.25} />
      </div>
      <div className="legend absolute left-[120px] top-[90px]">
        <div className="text-[56px] font-black tracking-[-0.03em]">Squash &amp; stretch</div>
        <div className="mt-3 text-[28px]" style={{ color: colors.textMuted }}>
          stretch on the fast fall, squash on contact, volume stays 1
        </div>
      </div>
      <div className="ground absolute left-[120px] right-[120px] h-[6px] rounded-full" style={{ top: GROUND_Y, backgroundColor: colors.textMuted }} />
      {m.apexes.map((h, n) => (
        <div key={n} className="guide absolute left-[120px] right-[120px] flex items-center justify-end" style={{ top: GROUND_Y - h, height: 1, backgroundColor: colors.borderSubtle }}>
          <span className="mr-0 -translate-y-[22px] text-[24px]" style={{ color: colors.textMuted }}>{Math.round((h / m.h) * 100)}%</span>
        </div>
      ))}
      {dots.map((d, i) => (
        <div key={i} className="dot absolute h-[14px] w-[14px] rounded-full" style={{ left: BALL_X + BALL / 2 + d.x - 7, top: GROUND_Y - BALL / 2 + d.y - 7, backgroundColor: colors.textMuted }} />
      ))}
      <div
        className="ball absolute rounded-full"
        style={{ left: BALL_X, top: GROUND_Y - BALL, width: BALL, height: BALL, backgroundColor: colors.accentPrimary }}
      />
      <div className="note absolute right-[120px] top-[110px] text-[28px] font-bold" style={{ color: colors.accentSecondary }}>
        slow at the top, fast at the bottom
      </div>
      <div className="caption absolute bottom-[40px] left-[120px] text-[32px] font-bold">
        Each bounce: height x{m.r}, time x{Math.sqrt(m.r).toFixed(2)}, {Math.round(total * 60)} f in all
      </div>
    </AbsoluteFill>
  );
};

export default Scene;
