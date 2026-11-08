import { type FC } from 'react';
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { beat, enter, holdFinal } from '../../core/presets';
import { idleBreath, idleBreathSeconds, lookAt, lookAtSeconds, react, rigWalk, rigWalkSeconds } from '../../core/physics';
import { getTheme } from '../../core/theme-contract';
import { BackdropField } from '../../primitives/curated';
import { RigCharacter } from '../../primitives/characters/RigCharacter';

const theme = getTheme('dark');
const GROUND_Y = 900; // px, the soles
const WALK = { pace: 'walk', steps: 3 } as const;
const WALK_AT = 1.0; // s
const IDLE_AT = WALK_AT + rigWalkSeconds(WALK); // s, the stop settles, then breathing starts
const LOOK_AT = IDLE_AT + idleBreathSeconds({ seconds: 1.6 }); // s, the thing appears and the eyes go first
const REACT_AT = LOOK_AT + lookAtSeconds() + 0.35; // s, a 0.35 s moving hold, then anticipation
const HOLD_AT = 6.8; // s, the closing pose (video is 8.0 s, hold 1.2 s); the react settle ends at ~6.66 s
const HERO = 'hero';

export const buildTimeline = (tl: gsap.core.Timeline) => {
  beat(tl, 'enter', 0);
  enter(tl, '.ground', 'wipe', 0.1);
  enter(tl, '.hero-root', 'rise', 0.25);
  enter(tl, '.label', 'rise', 0.4);

  beat(tl, 'walk', WALK_AT);
  rigWalk(tl, HERO, WALK_AT, WALK); // IK feet planted, hip bob, arms swing against the legs

  beat(tl, 'idle', IDLE_AT);
  idleBreath(tl, HERO, IDLE_AT, { seconds: 1.6, intensity: 'strong', blink: true });

  beat(tl, 'notice', LOOK_AT);
  enter(tl, '.thing', 'pop', LOOK_AT + 0.1);
  lookAt(tl, HERO, LOOK_AT, { look: 'up' }); // eyes, then head 3 f, then torso 6 f

  beat(tl, 'react', REACT_AT);
  react(tl, HERO, REACT_AT, { kind: 'startle', intensity: 'normal' }); // crouch, hop, land, settle

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
      <div className="label absolute left-[120px] top-[80px]">
        <div className="text-[56px] font-black tracking-[-0.03em]">Walk, notice, react</div>
        <div className="mt-3 text-[28px]" style={{ color: colors.textMuted }}>Feet plant, eyes lead the head, a crouch comes before the hop</div>
      </div>
      <div className="ground absolute left-[120px] right-[120px] h-[6px] rounded-full" style={{ top: GROUND_Y, backgroundColor: colors.textMuted }} />
      <div className="thing absolute flex h-[120px] w-[120px] items-center justify-center rounded-full text-[76px] font-black" style={{ left: 1500, top: 300, backgroundColor: colors.accentSecondary, color: colors.bgPrimary }}>?</div>
      <RigCharacter id={HERO} left={240} groundY={GROUND_Y} />
    </AbsoluteFill>
  );
};

export default Scene;
