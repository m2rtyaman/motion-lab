import { type FC } from 'react';
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { beat, enter, emphasize, camera, holdFinal } from '../../core/presets';
import { lookAt, react, rigWalk } from '../../core/physics';
import { DURATIONS, EASING } from '../../core/tokens';
import { getTheme } from '../../core/theme-contract';
import { BackdropField, SimulatedCursor } from '../../primitives/curated';
import { RigCharacter } from '../../primitives/characters/RigCharacter';
import { Headline } from './components/Headline';
import { OrderCard } from './components/OrderCard';
import { Toast } from './components/Toast';
import { CtaPill } from './components/CtaPill';

const theme = getTheme('vibrant-brand');
const HERO = 'hero';
const GROUND_Y = 1420; // px, the soles
const HERO_SCALE = 1.2; // the rig is drawn at 658 px; scaled about the ground so it stands 790 px tall
const WALK = { pace: 'brisk', steps: 2, stride: 125 } as const; // travels 150 px (x1.2 on screen)
const HEADLINE = ['Skip', 'the', 'line.'];
const TAP_AT = 4.9; // s, the click lands
const CTA_AT = 6.0; // s
const HOLD_AT = 6.8; // s, video is 8 s

export const buildTimeline = (tl: gsap.core.Timeline) => {
  beat(tl, 'hook', 0);
  enter(tl, '.headline-word', 'words', 0.15);
  enter(tl, '.ground', 'wipe', 0.2);
  rigWalk(tl, HERO, 0.35, WALK); // walks in from the left edge and stops beside the card slot
  camera(tl, '.backdrop', 'drift', 0.1, { intensity: 'soft' });

  beat(tl, 'card', 2.5);
  enter(tl, '.order-card', 'blurIn', 2.6);
  lookAt(tl, HERO, 2.95, { look: 'front' }); // eyes first, then head, then torso
  camera(tl, '.card-group', 'pushIn', 3.5, { intensity: 'soft' }); // lean in before the tap

  beat(tl, 'tap', 4.17);
  tl.fromTo('.simulated-cursor', { x: 640, y: 760, opacity: 0, scale: 1.5 }, { x: 380, y: 436, opacity: 1, scale: 1.5, duration: DURATIONS.long, ease: EASING.sineInOut }, 4.1);
  tl.fromTo('.cursor-ripple', { opacity: 0.9, scale: 0.4 }, { opacity: 0, scale: 1.6, duration: DURATIONS.panel, ease: EASING.expoOut }, TAP_AT);
  enter(tl, '.toast', 'pop', TAP_AT + 0.2);
  react(tl, HERO, TAP_AT + 0.25, { kind: 'surprise', intensity: 'normal' });

  beat(tl, 'cta', CTA_AT);
  enter(tl, '.cta-pill', 'rise', CTA_AT);
  emphasize(tl, '.cta-pill', 'punch', CTA_AT + 0.4);
  holdFinal(tl, HOLD_AT, 1.2);
  return tl;
};

export const Scene: FC = () => {
  useRemotionGSAP(buildTimeline);
  const { colors } = theme;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgPrimary, color: colors.textPrimary }}>
      <div className="backdrop absolute inset-0"><BackdropField theme={theme} variant="rings" intensity={0.5} /></div>
      <Headline className="absolute left-[70px] top-[262px] w-[940px]" words={HEADLINE} />
      <div className="ground absolute left-[70px] right-[70px] h-[6px] rounded-full" style={{ top: GROUND_Y, backgroundColor: colors.bgSurfaceSubtle, transformOrigin: 'left center' }} />
      <div className="card-group absolute left-[330px] top-[620px] w-[680px]">
        <OrderCard className="order-card w-[680px]" theme={theme} label="Your usual" title="Oat latte" detail="Large, extra shot" priceLabel="Total" price="$4.80" action="Order ahead" />
        <Toast className="toast absolute left-0 top-[529px] w-[680px]" theme={theme} title="Order placed" detail="Ready at the bar in 4 min" />
        <SimulatedCursor color={colors.textPrimary} rippleColor={colors.accentSecondary} />
      </div>
      <div className="hero-wrap absolute inset-0" style={{ transformOrigin: `0px ${GROUND_Y}px`, transform: `scale(${HERO_SCALE})` }}>
        <RigCharacter id={HERO} left={-172} groundY={GROUND_Y} />
      </div>
      <div className="absolute inset-x-0 top-[1484px] flex justify-center"><CtaPill className="cta-pill whitespace-nowrap" theme={theme} label="Get Brewmark free" /></div>
    </AbsoluteFill>
  );
};

export default Scene;
