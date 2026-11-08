import { type FC } from 'react';
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { beat, enter, holdFinal } from '../../core/presets';
import { arcMove, arcPoint, arcSeconds } from '../../core/physics';
import { getTheme } from '../../core/theme-contract';
import { BackdropField } from '../../primitives/curated';

const theme = getTheme('dark');
const DX = 700; // px
const ARC = { dx: DX, dy: 0, arc: 'mid', pace: 'slow' } as const; // 25% bulge, 0.8 s
const BACK = { ...ARC, dx: -DX } as const;
const BALL = 90; // px
const BASE_Y = 650; // px, ball centre line
const DOTS = Array.from({ length: 13 }, (_, i) => i / 12);
const PANELS = [{ id: 'wrong', left: 0 }, { id: 'right', left: 960 }] as const;
const ballLeft = (panel: number) => panel + 130 - BALL / 2; // start x of the ball's left edge

export const buildTimeline = (tl: gsap.core.Timeline) => {
  beat(tl, 'draw', 0);
  enter(tl, '.label', 'rise', 0.15);
  enter(tl, '.path', 'wipe', 0.25);
  enter(tl, '.dot', 'stagger', 0.4, { stagger: 'tight' });
  enter(tl, '.ball', 'pop', 0.6);

  beat(tl, 'go', 1.2);
  tl.to('.ball-wrong', { x: DX, duration: arcSeconds(ARC), ease: 'none' }, 1.4); // the "wrong" move: linear, same time
  arcMove(tl, '.ball-right', 1.4, ARC);

  beat(tl, 'back', 2.6);
  tl.to('.ball-wrong', { x: 0, duration: arcSeconds(ARC), ease: 'none' }, 2.8);
  arcMove(tl, '.ball-right', 2.8, BACK);

  beat(tl, 'rest', 4.4);
  enter(tl, '.caption', 'rise', 4.4);
  holdFinal(tl, 5.0, 1.2);
  return tl;
};

export const Scene: FC = () => {
  useRemotionGSAP(buildTimeline);
  const { colors } = theme;
  const point = (id: string, p: number) => (id === 'right' ? arcPoint(p, ARC) : { x: DX * p, y: 0 });
  const curve = DOTS.length * 3;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgPrimary, color: colors.textPrimary }}>
      <div className="absolute inset-0">
        <BackdropField theme={theme} variant="grid" intensity={0.25} />
      </div>
      <div className="absolute left-[960px] top-[160px] h-[760px] w-[2px]" style={{ backgroundColor: colors.textMuted }} />
      {PANELS.map(({ id, left }) => (
        <div key={id}>
          <div className="label absolute left-0 top-[110px] w-[960px] px-[120px] text-[40px] font-black" style={{ left, color: id === 'right' ? colors.textPrimary : colors.textMuted }}>
            {id === 'right' ? 'RIGHT  arc + slow in / slow out' : 'WRONG  straight line, linear'}
          </div>
          <svg className="path absolute top-0" width={960} height={1080} style={{ left }}>
            <polyline
              fill="none"
              stroke={colors.textMuted}
              strokeWidth={3}
              points={Array.from({ length: curve + 1 }, (_, k) => point(id, k / curve)).map((q) => `${130 + q.x},${BASE_Y + q.y}`).join(' ')}
            />
          </svg>
          {DOTS.map((p) => (
            <div key={p} className="dot absolute h-[22px] w-[22px] rounded-full" style={{ left: left + 130 + point(id, p).x - 11, top: BASE_Y + point(id, p).y - 11, backgroundColor: colors.textMuted }} />
          ))}
          <div className={`ball ball-${id} absolute rounded-full`} style={{ left: ballLeft(left), top: BASE_Y - BALL / 2, width: BALL, height: BALL, backgroundColor: id === 'right' ? colors.textPrimary : colors.accentSecondary }} />
        </div>
      ))}
      <div className="caption absolute bottom-[40px] left-[120px] text-[32px] font-bold">
        Same 700 px, same 48 f. Dots show where the ball is every 4 f: even on the left, bunched at the ends on the right.
      </div>
    </AbsoluteFill>
  );
};

export default Scene;
