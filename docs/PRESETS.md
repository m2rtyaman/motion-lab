# Motion Presets

`src/core/presets.ts` is a closed vocabulary of motions for scenes. You only choose a preset
and schedule it in seconds; duration, easing and values are baked in from `tokens.ts`,
`recipes.ts` and `transitions.ts`. Do not hand-write GSAP tweens in a Scene.

- For the math behind these values (eases, springs, stagger, px/frame) see `docs/MOTION_MATH.md`.
- Every function takes the GSAP timeline and returns it; `at` is in seconds.
- The only options are `{ stagger: 'tight'|'normal'|'loose', intensity: 'soft'|'normal'|'strong', direction: 'up'|'down'|'left'|'right' }`.
- No raw durations, eases or numbers. Wrong preset names are type errors.
- Every tween is tagged `data.preset = '<kind>:<name>'` for audits.
- `beat(tl, id, at)` adds label `beat:<id>`; `holdFinal(tl, at, 1.2)` adds `hold:start`/`hold:end` and no tweens.

## Catalog

Durations are seconds for one target. `stagger`/`words` add (children - 1) x the stagger interval.

| Kind | Name | Duration (s) | Description |
|---|---|---|---|
| enter | `rise` | 0.45 | Fades in while sliding a short distance from `direction` (default up). |
| enter | `pop` | 0.6 | Scales from 0 with a small overshoot, then settles. |
| enter | `blurIn` | 0.65 | Arrives large and blurred, resolves sharp and in place. |
| enter | `wipe` | 0.5 | Reveals left-to-right with a scaleX wipe. |
| enter | `stagger` | 0.45 | Children rise out of depth one after another (use a group selector). |
| enter | `words` | 0.38 | Headline words drop in with a springy kinetic stagger. |
| exit | `sink` | 0.32 | Drops slightly, shrinks and blurs out fast. |
| exit | `shrink` | 0.32 | Scales down to a small size while fading out. |
| exit | `wipeOut` | 0.32 | Collapses to the right edge with a scaleX wipe. |
| emphasize | `punch` | 0.32 | Quick scale pulse with a brightness flash. |
| emphasize | `shake` | 0.75 | Decaying impact shake, then settles to rest. |
| emphasize | `glint` | 0.5375 | Diagonal specular glint sweeps across the element. |
| camera | `pushIn` | 0.65 | Camera pushes in to a slightly larger scale. |
| camera | `pullOut` | 0.65 | Camera pulls back to a wider view. |
| camera | `drift` | 2.4 | Slow, subtle sideways drift with a faint scale creep. |
| camera | `settle` | 0.65 | Starts slightly zoomed and eases to rest at scale 1. |
| transition | `whip` | 0.74 | High-speed directional whip pan between scenes (transitionWhipPan). |
| transition | `maskWipe` | 0.6 | Mask wipe reveals the incoming scene (transitionMaskWipe). |
| transition | `morph` | 0.8 | Container morphs while content swaps (transitionContainerMorph). |
| transition | `zoomPunch` | 0.8125 | Portal zoom punch into the next scene (transitionZoomPunch). |
| transition | `takeover` | 0.663 | A trigger element scales up to take over the screen (transitionElementTakeover). |
| transition | `dive` | 0.8112 | Camera dives into the target, then settles on the next scene (transitionCameraDive). |

Transitions take selector objects, e.g. `transition(tl, 'whip', at, { outgoing, incoming, direction: 'left' })`.
Required selectors: whip/zoomPunch: `outgoing, incoming`; maskWipe: `incoming`; morph: `container, outgoing, incoming`;
takeover: `trigger, outgoing, incoming`; dive: `rig, outgoing, incoming`.

## Example Scene

```tsx
import { type FC } from 'react';
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { beat, enter, exit, emphasize, camera, transition, holdFinal } from '../../core/presets';

export const BEATS = [
  { id: 'hook', startFrame: 0, endFrame: 89 },
  { id: 'reveal', startFrame: 90, endFrame: 179 },
  { id: 'cta', startFrame: 180, endFrame: 299 },
] as const;

export const Scene: FC = () => {
  useRemotionGSAP((tl) => {
    beat(tl, 'hook', 0);
    enter(tl, '.hook-title', 'words', 0.1);
    camera(tl, '.rig', 'drift', 0.1, { intensity: 'soft' });
    emphasize(tl, '.hook-title', 'punch', 1.0);

    beat(tl, 'reveal', 1.5);
    transition(tl, 'maskWipe', 1.5, { incoming: '.reveal-panel', type: 'horizontal' });
    enter(tl, '.reveal-item', 'stagger', 1.8, { stagger: 'tight' });
    exit(tl, '.hook-title', 'sink', 1.5);

    beat(tl, 'cta', 3.0);
    enter(tl, '.cta-button', 'pop', 3.0);
    emphasize(tl, '.cta-button', 'glint', 3.6);
    holdFinal(tl, 3.8); // static, crystal clear until 5.0s
    return tl;
  });

  return (
    <AbsoluteFill className="rig bg-zinc-950">
      <h1 className="hook-title text-[60px]">Ship faster</h1>
      <div className="reveal-panel"><div className="reveal-item text-[44px]">One</div></div>
      <button className="cta-button text-[44px]">Start</button>
    </AbsoluteFill>
  );
};
```

## Physics helpers (`src/core/physics.ts`)

Classic-animation building blocks that follow the same contract as presets: `(tl, target, at, opts?)`, every tween tagged
`data.preset = 'physics:<name>'` (so timeline-audit T006 counts them), only transform tweens, options are named enums or
clamped numbers, no randomness. x/y moves are relative to the current position; the rest pose is scale 1, rotate 0.
Every helper has a seconds twin (`bounceSeconds(opts)`, `launchSeconds(opts)`, `walkSeconds(opts)` ...) so the next
call can be scheduled exactly. Import: `import { bounce, launch } from '../../core/physics';` (also exported from `src/core`).
Teaching material: `docs/ANIMATION_STUDIES.md`, `docs/CHARACTER_ANIMATION.md`.

| Name | Call | Options (default) | Seconds (default opts) | What it does |
|---|---|---|---|---|
| `bounce` | `bounce(tl, el, at, o)` | `height` 40-600 px (300), `bounces` 1-6 (3), `restitution` 0.3-0.9 (0.6), `squash` none/soft/normal/strong, `travel` +-1400 px | 161 f (2.7 s) | Parabolic drop and rebounds (height x r, time x sqrt r), 3 f grounded squash, stretch on fast falls, volume kept |
| `anticipate` | `anticipate(tl, el, at, o)` | `direction`, `amount` soft/normal/strong, `actionSeconds` 0.15-0.6 (0.27) | 0.09 s (5 f) | Wind-up opposite the action = 1/3 of the action time, crouch squash |
| `launch` | `launch(tl, el, at, o)` | `direction`, `distance` short/mid/far (120/220/340 px), `amount` | 0.77 s (46 f) mid | Wind-up, stretched action, overshoot 5/8/12%, settle = 1.5 x action |
| `pendulum` | `pendulum(tl, [joints], at, o)` | `swing` soft/normal/strong (8/16/28 deg), `drag` tight/normal/loose (2/3/4 f), `swings` 1-5, `direction`, `pivot` | `pendulumSeconds(n, o)` | Chain swings and settles, each joint late by `drag`, tip swings 20% wider per link |
| `followThrough` | `followThrough(tl, [parent, ...children], at, o)` | `direction`, `distance` 20-600 px (200), `drag`, `amount` | `followSeconds(n, o)` | Parent stops dead, children start late, overshoot more, settle onto the same spot |
| `arcMove` | `arcMove(tl, el, at, o)` | `dx`, `dy` +-1200 px, `arc` low/mid/high (12/25/40%), `bulge` up/down, `pace` quick/normal/slow (0.3/0.5/0.8 s) | 0.5 s | A to B along a parabola with slow in/out; `arcPoint(p, o)` gives the exact position for spacing charts |
| `movingHold` | `movingHold(tl, el, at, o)` | `seconds` 0.3-1.5 (0.5), `intensity` | 0.5 s | Hold with a tiny drift (y -2/-4/-7 px, scale +0.8/1.5/2.5%); not for the final hold (T003) |
| `walkCycle` | `walkCycle(tl, rig, at, o)` | `pace` walk/run, `steps` 1-8 (4), `direction`, `stride` 40-400 px | `walkSeconds(o)` (145 f for 4 walk steps) | Contact/down/passing/up per step on a rig `{root, body, head, legL, legR, armL, armR}`; arms 2 f and head 3 f late |

`PHYSICS_CATALOG` lists the same names with a description and a seconds function.

### How many tweens a helper emits, and when it ends

One call is often several tweens. This matters for the T007 "busy beat" count (a move counts once: an `arcMove` is one move, not two)
and for T003 (nothing but `camera:drift` may still be moving inside the final hold).

| Helper | Tweens per call | Notes |
|---|---|---|
| `bounce` | 3, or 4 with `travel` | a zero-length `set` that parks the ball at its apex at t = 0, `y` keyframes, `scaleX/scaleY` keyframes, plus one `x` tween when `travel` is not 0. The ball hangs at the apex from t = 0 until `at`. |
| `anticipate` | 1 | the crouch only |
| `launch` | 5 | wind-up, action, return from the overshoot, landing squash, recover |
| `pendulum` | 1 per joint | each joint is one keyframes tween |
| `followThrough` | 1 for the parent + 2 per child | move, then settle |
| `arcMove` | 2 | `x` and `y` (the `y` ease bends the path); both start and end together |
| `movingHold` | 1 | y drift + scale creep |
| `walkCycle` | 1 per rig part given (body, legL, legR, armL, armR, head) + 1 for `root` | up to 7 |

Every helper has a `*Seconds(opts)` twin and it returns the **full duration including the tail**, not just the main action.
`bounceSeconds` includes the last squash and the recovery to round (default opts: 2.7 s); `launchSeconds` includes the wind-up and the 1.5x settle;
`walkSeconds` includes the stop. Schedule whatever follows from that number, and in particular start the final hold after it, with the
options object shared between the two calls so they cannot drift apart:

```ts
const BALL = { height: 300, bounces: 3, restitution: 0.4, squash: 'normal', travel: 1000 } as const;
const at = 0.65;
bounce(tl, '.ball', at, BALL);
const end = at + bounceSeconds(BALL);        // last squash and recovery are over here
enter(tl, '.caption', 'rise', end);          // anything that follows starts after it
holdFinal(tl, end, 1.2);                     // end + 1.2 must be <= the video duration
```

If `end + 1.2` is past the end of the video, lower `bounces`, `height` or `restitution` (shorter bounce) instead of shortening the hold.
Never call `holdFinal` before `at + xxxSeconds(opts)`: T003 reports the helper as "active during the final hold".
