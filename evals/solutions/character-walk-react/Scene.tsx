import { type FC } from 'react';
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../../../src/core/useRemotionGSAP';
import { beat, enter, holdFinal } from '../../../src/core/presets';
import { idleBreath, idleBreathSeconds, lookAt, lookAtSeconds, react, rigWalk, rigWalkSeconds } from '../../../src/core/physics';
import { getTheme } from '../../../src/core/theme-contract';
import { BackdropField } from '../../../src/primitives/curated';
import { RigCharacter } from '../../../src/primitives/characters/RigCharacter';

const theme = getTheme('dark');
const GROUND_Y = 880; // px, the soles and the top of the floor line
const WALK = { pace: 'brisk', steps: 2, stride: 210 } as const;
const WALK_AT = 0.15; // s
const IDLE_AT = WALK_AT + rigWalkSeconds(WALK); // s, the stop settles, then the character breathes in place
const LOOK_AT = IDLE_AT + idleBreathSeconds({ seconds: 1.6 }); // s, the eyes find the parcel
const REACT_AT = LOOK_AT + lookAtSeconds() + 0.08; // s, a beat after the look: crouch, hop, land
const HOLD_AT = 4.8; // s, video is 6 s so the closing pose holds 1.2 s
const HERO = 'courier';

export const buildTimeline = (tl: gsap.core.Timeline) => {
  beat(tl, 'walk', 0);
  enter(tl, '.floor', 'wipe', 0.05);
  enter(tl, '.parcel', 'pop', 0.15);
  enter(tl, '.courier-root', 'rise', 0.2);

  rigWalk(tl, HERO, WALK_AT, WALK);

  beat(tl, 'notice', IDLE_AT);
  idleBreath(tl, HERO, IDLE_AT, { seconds: 1.6, blink: true });
  lookAt(tl, HERO, LOOK_AT, { look: 'down' }); // pupils first, head 3 f later, torso 6 f after that

  beat(tl, 'react', REACT_AT);
  react(tl, HERO, REACT_AT, { kind: 'startle' });
  enter(tl, '.bang', 'pop', REACT_AT + 0.14); // as the hop launches

  holdFinal(tl, HOLD_AT, 1.2);
  return tl;
};

export const Scene: FC = () => {
  useRemotionGSAP(buildTimeline);
  const { colors } = theme;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgPrimary, color: colors.textPrimary }}>
      <div className="absolute inset-0">
        <BackdropField theme={theme} variant="grid" intensity={0.25} />
      </div>
      <div className="floor absolute left-[80px] right-[80px] h-[6px] rounded-full" style={{ top: GROUND_Y, backgroundColor: colors.textMuted }} />
      <div className="parcel absolute h-[90px] w-[110px] rounded-[14px]" style={{ left: 900, top: GROUND_Y - 90, backgroundColor: colors.accentSecondary, border: `4px solid ${colors.bgPrimary}` }} />
      <div className="bang absolute text-[140px] font-black leading-none" style={{ left: 700, top: 160, color: colors.accentPrimary }}>!</div>
      <RigCharacter id={HERO} left={120} groundY={GROUND_Y} />
    </AbsoluteFill>
  );
};

export default Scene;
