import { type FC } from 'react';
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { beat, enter, holdFinal } from '../../core/presets';
import { idleBreath, idleBreathSeconds, lookAt, lookAtSeconds, react } from '../../core/physics';
import { getTheme } from '../../core/theme-contract';
import { BackdropField } from '../../primitives/curated';
import { RigCharacter } from '../../primitives/characters/RigCharacter';

const theme = getTheme('dark');
const HERO = 'hero';
const GROUND_Y = 900; // px, the soles
const WAIT_AT = 0.9; // s, moving hold while waiting
const HEAR_AT = WAIT_AT + idleBreathSeconds({ seconds: 1.6 }); // s, the bubble pops, the eyes go first
const AWAY_AT = HEAR_AT + 0.95; // s, 0.5 s hold on the thing, then a glance away (the double take starts)
const SNAP_AT = AWAY_AT + lookAtSeconds() + 0.3; // s, 0.3 s hold, then the snap back, stronger
const GESTURE_AT = SNAP_AT + lookAtSeconds() + 0.3; // s, 0.3 s hold, then the gesture
const HOLD_AT = 6.2; // s, closing pose; the video is 7.4 s

export const buildTimeline = (tl: gsap.core.Timeline) => {
  beat(tl, 'enter', 0);
  enter(tl, '.ground', 'wipe', 0.1);
  enter(tl, '.hero-root', 'rise', 0.25);
  enter(tl, '.label', 'rise', 0.4);

  beat(tl, 'wait', WAIT_AT);
  idleBreath(tl, HERO, WAIT_AT, { seconds: 1.6, intensity: 'strong', blink: true });

  beat(tl, 'hear', HEAR_AT);
  enter(tl, '.bubble', 'pop', HEAR_AT);
  lookAt(tl, HERO, HEAR_AT + 0.1, { look: 'front' }); // eyes, head, torso

  beat(tl, 'double-take', AWAY_AT);
  lookAt(tl, HERO, AWAY_AT, { look: 'down', amount: 'subtle' }); // looks away, as if nothing happened
  lookAt(tl, HERO, SNAP_AT, { look: 'up', amount: 'strong' }); // snaps back, bigger

  beat(tl, 'gesture', GESTURE_AT);
  react(tl, HERO, GESTURE_AT, { kind: 'surprise', intensity: 'normal' }); // crouch, arms up, settle
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
        <div className="text-[56px] font-black tracking-[-0.03em]">Wait, hear, double take</div>
        <div className="mt-3 text-[28px]" style={{ color: colors.textMuted }}>Holds of 0.3 to 0.5 s between the beats</div>
      </div>
      <div className="ground absolute left-[120px] right-[120px] h-[6px] rounded-full" style={{ top: GROUND_Y, backgroundColor: colors.textMuted }} />
      <div className="bubble absolute rounded-3xl px-8 py-4 text-[52px] font-black" style={{ left: 1340, top: 300, backgroundColor: colors.accentSecondary, color: colors.bgPrimary }}>Hey!</div>
      <RigCharacter id={HERO} left={700} groundY={GROUND_Y} />
    </AbsoluteFill>
  );
};

export default Scene;
