# Character Animation

How animation schools teach motion, mapped to numbers at 60 fps and to repo code. Pair this with `docs/ANIMATION_STUDIES.md`
(working scenes) and `docs/MOTION_MATH.md` (eases, springs). Source of the timing numbers: 33 measured clips in
`references/measured/` (character clips: action 0.42 s = 25 f, onset spacing 0.83 s = 50 f, holds 0.38 s = 23 f, no cuts).
Helpers: `src/core/physics.ts`; a v2 scene may import only react, remotion, gsap, `src/core/*`, `src/primitives/index.ts`.

| Principle | Rule of thumb (frames @60) | Repo code |
|---|---|---|
| Timing vs spacing | timing = how many frames, spacing = where each frame lands | ease strings, `arcPoint` |
| Key poses + breakdowns | keys carry the story, breakdowns carry the arc | `rigWalk` poses, `keyframes` |
| Squash & stretch | `scaleX x scaleY = 1` | `bounce`, `anticipate`, `launch` |
| Arcs | curved path, eased progress | `arcMove` |
| Overlap / drag | 2-4 f per joint | `pendulum`, `followThrough` |
| Secondary action | small motion that supports the main one | arms in `rigWalk`, `idleBreath` |
| Moving hold | hold 18-42 f with a 1-3 px drift | `movingHold`, `idleBreath` |
| Anticipation | wind-up = action / 3 | `anticipate`, `launch` |
| Acting beats | hold 18-42 f between actions, beats 50-95 f apart | `beat()`, `movingHold` |
| Head leads body | eyes, then head 3 f, then torso 6 f | `lookAt`, `react` |
| Weight | heavy = longer settle, little bounce | `SPRING` presets (section 12) |

## 1. Timing vs spacing

Timing is the number of frames a move takes; spacing is where the object sits on each of those frames. Same 12-frame move,
position in percent of the distance, one row per ease (`o` = a frame, 50 columns = 100%):

```
linear      0  8 17 25 33 42 50 58 67 75 83 92 100   |o   o    o   o   o   o   o   o    o   o   o   o   o|
power1.in   0  1  3  6 11 17 25 34 44 56 69 84 100   |oooo  o  o   o   o    o     o      o      o       o|   slow in (leaving)
power1.out  0 16 31 44 56 66 75 83 89 94 97 99 100   |o       o       o     o     o    o    o   o  o o oo|   slow out (arriving)
sine.inOut  0  2  7 15 25 37 50 63 75 85 93 98 100   |oo  o   o    o     o     o      o     o    o   o oo|   slow in + out
```

| spacing | looks like | use |
|---|---|---|
| even (linear) | machine, conveyor | continuous loops only |
| tight at start (`.in`) | heavy thing starting, leaving | exits |
| tight at end (`.out`) | arriving, braking | entrances, most actions |
| tight at both ends (`sine.inOut`) | A to B on screen, a gesture | moves, arcs |

Fewer frames with the same distance = faster; more distance with the same frames = faster. Peak speed (average x ease peak:
`power1` 2x, `power2` 3x, `sine.inOut` 1.57x) should stay <= 30 px/f; impacts may hit <= 80 px/f for <= 3 f.
Studies: `study-arcs-spacing`. Code: `arcPoint(p, opts)` returns the exact per-frame position.

## 2. Key poses and breakdowns

Plan the extremes first (key poses), then the in-between pose that sets the path (breakdown), then let the ease fill the rest.
In GSAP a pose is one keyframe of a `keyframes: [...]` tween: `walkCycle` writes 4 poses per step this way.

| pose | job | `walkCycle` |
|---|---|---|
| key | extreme of the action | contact (legs widest), up (highest) |
| breakdown | decides the arc, the weight | down (lowest), passing (swing leg under) |
| in-between | the ease | `sine.inOut` between poses |

## 3. Walk and run cycles

| | walk (casual) | run |
|---|---|---|
| step | 30 f (0.5 s) | 20 f (0.33 s) |
| full cycle (2 steps) | 60 f | 40 f |
| pose spacing | 7.5 f | 5 f |
| body bob | 18 px | 30 px |
| leg swing | +-24 deg, foot lift 14 px | +-38 deg, foot lift 26 px |
| arm swing | 18 deg | 40 deg |
| forward lean | 2 deg | 8 deg |
| stride | 150 px = 5 px/f | 260 px = 13 px/f |

Poses inside one step (support leg = "lead", swing leg = "trail"):

| pose | t | body y | body scaleY | lead leg | trail leg |
|---|---|---|---|---|---|
| contact | 0 | 0 | 1.00 | +24 deg forward | -24 deg back |
| down | 1/4 | +0.45 bob (lowest) | 0.94 | +14 | -22, lifted 4 px |
| passing | 1/2 | -0.33 bob | 1.02 | 0 | 0, lifted 14 px |
| up | 3/4 | -1.0 bob (highest) | 1.05 | -14 | +17, lifted 8 px |
| next contact | 1 | 0 | 1.00 | -24 (now trailing) | +24 (now leading) |

Arms swing opposite the same-side leg. `walkCycle(tl, { root, body, head, legL, legR, armL, armR }, at, { pace, steps, stride })` is the
one-piece-limb version (shapes, blobs); `walkSeconds(opts)` = `(4 x steps + 1) x step / 4 + step / 2 + 3 f`.
For a character with knees and feet use the rig (section 13): `rigWalk` solves two-bone IK per frame, so a planted foot never slides.
The sprite actor `src/world/CharacterActor.tsx` is not importable from v2 scenes (V2-002); use `<RigCharacter>`.

## 4. Squash and stretch

The object keeps its volume: `scaleX x scaleY = 1`. Squash on contact, stretch on fast motion, round at rest.

| situation | scaleY | scaleX | frames |
|---|---|---|---|
| ball at impact (first, `normal`) | 0.78 | 1.28 | held 3 f |
| ball falling fast (before impact) | 1.09 | 0.92 | last 40% of the fall |
| wind-up crouch (`normal`) | 0.86 | 1.16 | action / 3 |
| launch stretch (`normal`) | 1.14 | 0.88 | action |
| walk body: down / up | 0.94 / 1.05 | 1.06 / 0.95 | per step |

Amounts: soft 8-12%, normal 14-22%, strong 22-26%; above ~30% reads rubbery. Scale about the contact edge
(`transformOrigin` 50% 100% for a floor) or the object floats. Code: `bounce`, `anticipate`, `launch` (all keep volume; tests check 5%).

## 5. Arcs

Anything alive moves on a curve. A to B in a straight line is for UI. `arcMove(tl, el, at, { dx, dy, arc: 'low' | 'mid' | 'high', pace })`:
parabola `x = dx u`, `y = dy u + 4 b u (1 - u)`, `u = sine.inOut(t)`, apex offset `b` = 12 / 25 / 40% of the distance. Limbs rotate about a joint, so
they arc by construction (`transformOrigin` = the pivot). Heads, hands and thrown props should use `arcMove`.

## 6. Overlapping action and drag

Parts attached to a mover keep going after it stops and start after it starts. Delay per joint, in frames:

| part | delay behind the parent | notes |
|---|---|---|
| torso | 0 | drives the move |
| arms | 2 f | swing opposite the legs |
| head | 3 f (up to 4) | in `walkCycle` |
| tail / hair / cloth link 1, 2, 3 | 3, 6, 9 f | `pendulum(..., { drag: 'normal' })`; tip swings 20% wider per link |
| props held in a hand | 4 f | `followThrough` |

`drag: 'tight' | 'normal' | 'loose'` = 2 / 3 / 4 f. Follow-through: the child overshoots (+8% of the travel per index) and settles in 1.5x
the move. Studies: `study-overlap-follow-through`. Mistake: delays above 6 f read as separate events.

## 7. Secondary action

A small action that supports the main one and never competes: arm swing under a walk, a head rock after a startle, a tail after a
jump, breathing during a pause. Rules: smaller amplitude (20-50% of the main), starts later (2-4 f), ends later, one at a time.
Code: arms in `walkCycle`, `pendulum` on `.head` in `study-character-walk`, `movingHold` for breathing.

## 8. Moving holds

A pose held with zero change looks dead. Keep a hold alive with a drift of 1-3 px and 1% scale, so the eye still reads life:
`movingHold(tl, '.body', at, { seconds: 0.5, intensity: 'soft' })` (y -2 px, scale 1.008). Hold length 18-42 f (0.3-0.7 s measured). Not allowed
in the final 1.2 s hold: T003 lets only `camera:drift` move there.

## 9. Anticipation, action, reaction

| part | share of the gesture | frames (`launch` mid: action 16 f) | motion |
|---|---|---|---|
| anticipation | 1/3 of the action | 5 | opposite way, squash along the axis |
| action | 1 | 16 | fast, `power1.out`, stretch |
| overshoot | 8% of the move | within the settle | past the target |
| settle | 1.5 x action (measured 1.3-1.7x; hero pops 2-2.6x) | 24 | `sine.inOut`, landing squash, round |
| reaction (a second character or object) | starts 3-8 f after the action peak | 10-20 | smaller copy of the same shape |

`launch(tl, el, at, { direction, distance: 'short' | 'mid' | 'far', amount })` is the whole row;
`launchSeconds(opts)` = windup + action + settle (37 / 46 / 61 f for short / mid / far).
A startle reads: eyes/head first, body 3-4 f later, wind-up toward the thing you react to, recoil away from it.

## 10. Acting beats and holds

| rule | number |
|---|---|
| one motion event | 15-30 f (0.25-0.5 s), hero up to 60 f |
| onset to peak | 6-15 f |
| hold between actions | 18-42 f (0.3-0.7 s) |
| beat spacing | 50-95 f (0.8-1.6 s) |
| closing pose | 72 f (1.2 s), nothing moves |
| cuts | none in character clips; hold, move, hold |

Structure: action, hold, reaction, hold, next action. The hold is where the viewer reads the emotion. `beat(tl, id, at)` marks each beat,
`holdFinal(tl, at, 1.2)` ends the piece. Do not fill every second with motion: contrast between motion and stillness is the rhythm.

## 11. Eye and head lead

Look first, then move: for a turn, a startle or a decision the eyes and head start 2-4 f BEFORE the body, so the viewer sees the thought before
the action. (Inside a walk the opposite holds: the head carries a smaller bob 3 f behind the torso, that is overlap, not a lead.)
`lookAt` does it for the rig: pupils at +0, head +3 f, torso +6 f (0.45 s total). A startle: `lookAt`, hold 0.3 s, `react`.

## 12. Weight

Heavy things accelerate slowly, overshoot little, and settle long; light things snap and bounce. Map to the SPRING presets
(numbers from `docs/MOTION_MATH.md`, section 3):

| weight | preset | zeta | overshoot | settle (f) | physics.ts equivalent |
|---|---|---|---|---|---|
| light, playful | `bouncy` | 0.55 | 12.6% | 63 | `bounce` restitution 0.7-0.9, `amount: 'strong'` |
| light, quick | `snapback` | 0.59 | 10.2% | 54 | `launch` `amount: 'strong'` (12% overshoot) |
| medium | `liquidLead` / `gentle` | 0.76 / 0.82 | 2.5% / 1.1% | 33 / 59 | `launch` `amount: 'normal'` (8%) |
| heavy | `rigid` / `smooth` | 1.01 / 1.10 | 0% | 44 / 80 | `bounce` restitution 0.3-0.4, `squash: 'soft'`; `launch` `soft` (5%) |

Heavy also means: longer wind-up (`actionSeconds` up to 0.6), slower step (walk 30 f, never run), body bob larger and slower,
`restitution` 0.3 so it stops in 1-2 bounces, drag 4 f (`loose`).

## 13. The rig: `<RigCharacter>` + helpers

`<RigCharacter id="hero" left={240} groundY={900} facing="right" palette={{ shirt: '#F4C84A' }} />` from `src/primitives/index.ts`: 360 x 680 px box,
658 px tall, nested divs, sole on the bottom edge. Parts are classes `hero-<part>`: `root flip shadow hips torso head brows eyes pupils`,
`arm-l/-r` (upper) `forearm-l/-r`, `thigh-l/-r` (= `leg-l/-r`) `shin-l/-r` `foot-l/-r`. `-l` = near side (front), `-r` = far side (darker).
Rest pose: every rotation 0, legs straight. All helpers take the id (`'hero'`) or a `rigParts('hero')` object, `at` in seconds, and have a `*Seconds()` twin.

| helper | what it does | seconds |
|---|---|---|
| `rigWalk(tl, id, at, { pace: 'stroll' / 'walk' / 'brisk', steps 1-6, stride 120-210, direction })` | IK keyframes: 0.15 s weight dip, steps, stop, 0.4 s settle; arms 2 f, head 3 f late | `rigWalkSeconds` (2.45 for 3 walk steps) |
| `idleBreath(tl, id, at, { seconds, intensity, blink })` | torso scaleY +1.6%, head 3 f, arms 4 f later; whole 1.6 s breaths | `idleBreathSeconds` |
| `lookAt(tl, id, at, { look: 'rest' / 'front' / 'up' / 'down' / 'behind', amount })` | pupils, head +3 f, torso +6 f; absolute poses | 0.45 |
| `react(tl, id, at, { kind: 'startle' / 'surprise', intensity, recover })` | crouch (IK, feet planted), hop, land, hold pose or recover | 0.81 |
| `turn(tl, id, at, { to: 'left' / 'right' })` | eyes, then flip about the centre (0.32 s) | 0.4 |

```ts
rigWalk(tl, 'hero', 1.0, { steps: 3 });                              // 2.45 s
idleBreath(tl, 'hero', 1.0 + rigWalkSeconds({ steps: 3 }), { seconds: 1.6, blink: true });
lookAt(tl, 'hero', t1, { look: 'up' });                              // then a 0.3-0.5 s hold
react(tl, 'hero', t1 + lookAtSeconds() + 0.35, { kind: 'startle' });
```

Rules: walking left = `facing="left"` on the rig plus `direction: 'left'`. Do not add your own tweens on rig parts while a helper runs on them. Build a
beat per helper call (a rig helper moves 14-18 joints; timeline-audit T007 counts joints, so scenes using it allow T007 with a reason in `spec.json`).
Studies: `study-character-walk`, `study-character-acting`. Geometry/IK: `RIG_GEOM`, `rigLegIK(dx, gap)` in `src/core/physics.ts`.

## Mistakes cheat sheet

| mistake | fix |
|---|---|
| root slides, feet skate | `rigWalk` (IK, planted feet), stride 150-210 px |
| every limb on the same keyframes | arms +2 f, head +3 f |
| pose frozen between actions | `idleBreath` / `movingHold` |
| no wind-up before a big move | `anticipate` / `launch` |
| bounce without decay | `restitution` 0.5-0.7 |
| squash changes volume | scale the other axis by `1 / s` |
| straight line for a living thing | `arcMove` |
| everything moves at once | one focal motion, secondary smaller and later |
