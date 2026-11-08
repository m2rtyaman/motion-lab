---
name: character-animation
description: Animate characters and weighted objects (bounce, jump, walk, reaction, follow-through) with src/core/physics.ts helpers instead of hand-written tweens. Use when the brief has a ball, mascot, walking figure or any thing that needs weight and personality. RULES.md wins on any conflict.
---

# Character animation (v2)

Optional guide. The teaching content lives in the docs; this skill tells you which one to open and how to schedule it. Read `RULES.md`, `docs/STORYBOARD.md`, `docs/DESIGN_SYSTEM.md` first; import `RigCharacter` from `src/primitives/characters/RigCharacter.tsx` and UI from `src/primitives/curated.ts`. Character plus UI card composition: `src/projects/example-social-promo`.
Workflow: write a storyboard board per beat in `spec.json` (`docs/STORYBOARD.md`), build the static layout, `pnpm render:poses --project <slug>` and fix it, only then add motion.

| Open | For |
|---|---|
| `docs/PRESETS.md` (section "Physics helpers") | options and seconds of every helper |
| `docs/CHARACTER_ANIMATION.md` | frame counts for walk and run, drag per joint, holds, weight to `SPRING` mapping, mistakes list |
| `docs/ANIMATION_STUDIES.md` | one working scene per principle |
| `docs/MOTION_MATH.md` | easing and spring numbers |

Studies to copy (all in `src/projects/`): `study-bouncing-ball`, `study-anticipation-jump`, `study-overlap-follow-through`,
`study-arcs-spacing`, `study-stagger-rhythm`, `study-character-walk`.

## Helpers (`src/core/physics.ts`, also exported from `src/core`)
`bounce`, `anticipate`, `launch`, `pendulum`, `followThrough`, `arcMove`, `movingHold`, `walkCycle`.
Each is `(tl, target, at, opts?)`, uses named options only, and has a seconds twin (`bounceSeconds`, `launchSeconds`,
`walkSeconds`, `arcSeconds`, `pendulumSeconds`, `followSeconds`, `holdSeconds`) that returns the full duration including
the tail. Schedule what follows from that number and share one options object between the two calls.

## Workflow
1. Pick the principle the brief needs: weight (`bounce`), intent (`anticipate`/`launch`), life (`movingHold`),
   locomotion (`walkCycle`), reaction (`pendulum` on the head, then `followThrough` on the body).
2. Build the character from simple shapes (divs or svg) with a separate element per moving part; set `transformOrigin`
   in the markup (head pivots at the neck, limbs at the shoulder or hip).
3. Order a reaction: head first, body 2-4 frames later, limbs later still (drag `tight`/`normal`/`loose`).
4. Heavy objects: low `restitution` (0.3-0.4), `squash: 'soft'`, longer wind-up. Light: high `restitution`, `squash: 'strong'`.
5. Put a visible ground line under anything that lands, and a pause (`movingHold`) between actions so the pose reads.
6. Compute the end: `const end = at + bounceSeconds(OPTS);`, let any follow-up finish, then `holdFinal` after it. If the hold would pass the video
   end, lower `bounces`, `height` or `restitution` rather than shortening the hold (T003).

## Scene sketch
```tsx
import { type FC } from 'react';
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { beat, enter, holdFinal } from '../../core/presets';
import { bounce, bounceSeconds } from '../../core/physics';
import { getTheme } from '../../core/theme-contract';

const theme = getTheme('dark');
const BALL = { height: 300, bounces: 3, restitution: 0.4, squash: 'normal', travel: 1000 } as const;
const BOUNCE_AT = 0.65;
const END = BOUNCE_AT + bounceSeconds(BALL); // 2.79 s; a 5 s video, beats at frames 0, 39, 167

export const buildTimeline = (tl: gsap.core.Timeline) => {
  beat(tl, 'setup', 0);
  enter(tl, '.ground', 'wipe', 0.1);
  beat(tl, 'bounce', BOUNCE_AT);
  bounce(tl, '.ball', BOUNCE_AT, BALL);
  beat(tl, 'rest', END);
  enter(tl, '.caption', 'rise', END);
  holdFinal(tl, END + 0.6, 1.2); // the caption (0.45 s) is done before the hold starts
  return tl;
};

export const Scene: FC = () => {
  useRemotionGSAP(buildTimeline);
  const { colors } = theme;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgPrimary, color: colors.textPrimary }}>
      <div className="ground absolute left-[120px] right-[120px] top-[900px] h-[6px] rounded-full" style={{ backgroundColor: colors.textMuted }} />
      <div className="ball absolute h-[120px] w-[120px] rounded-full" style={{ left: 200, top: 780, backgroundColor: colors.accentPrimary }} />
      <div className="caption absolute left-[120px] top-[120px] text-[56px] font-black">Heavy ball, three bounces</div>
    </AbsoluteFill>
  );
};
export default Scene;
```
`bounce` parks the ball at its apex at t = 0, so place the element at floor level in CSS and let the helper lift it.
For a walking figure copy `src/projects/study-character-walk/Scene.tsx` (rig selectors `root, body, head, legL, legR, armL, armR`).
`src/world/CharacterActor.tsx` is a different, sprite-based tool and cannot be imported from v2 scenes (V2-002).

## Common mistakes
Squash that changes volume; bounces without decay; a character that slides without a walk cycle; everything moving on the
same frame (T010); a final hold that starts before the helper has finished (T003); drawing a face or mascot with cartoon
identifiers the slop linter rejects (keep shapes abstract and simple).

## Self-check (contact sheet)
Open `out/<slug>/visual-audit-grid.png` and answer the task block of `evals/VISUAL_RUBRIC.md` when one exists
(`bouncing-ball.*`, `anticipation-jump.*`) plus the generic block: does the object travel, is there a visible apex and
contact, a decaying bounce, a squash at contact, and a clean still last frame?
