# Animation Studies

Seven classic animation-school exercises, each a small working scene in `src/projects/study-*` (harness v2, 16:9, 60 fps,
Scene under 150 lines). Read the principle, read the code, then open the contact sheet:
`pnpm render:contact-sheet --project <slug>` writes `out/<slug>/visual-audit-grid.png` (4 columns, 480x270 tiles, row by row).
The studies mark their key frames in `spec.json` (`beats[].samples`), so the sheet shows the moment that proves the principle.

Rules that apply to every study: time in frames at 60 fps (1 f = 16.7 ms); easing names are GSAP's (`power1` = quadratic,
`power2` = cubic); helpers live in `src/core/physics.ts` (`docs/PRESETS.md`, section "Physics helpers"); the character
version of these ideas is in `docs/CHARACTER_ANIMATION.md`. Measured reference (33 real clips, `references/measured/`):
event 15-30 f, onset to peak 6-15 f, settle 1.3-1.7x onset, hold between actions 18-42 f, beat spacing 50-95 f,
peak speed <= 30 px/f (impacts <= 80 px/f for <= 3 f).

| # | Slug | Principle | Helper | Length |
|---|---|---|---|---|
| 1 | `study-bouncing-ball` | squash & stretch, slow in/out, decay | `bounce` | 6.7 s |
| 2 | `study-anticipation-jump` | anticipation, action, overshoot, settle | `launch`, `movingHold` | 6.2 s |
| 3 | `study-overlap-follow-through` | overlap, drag, follow-through | `followThrough`, `pendulum` | 6.2 s |
| 4 | `study-arcs-spacing` | arcs and spacing | `arcMove`, `arcPoint` | 6.2 s |
| 5 | `study-stagger-rhythm` | rhythm = varied gaps | `enter(..., 'rise')` | 5.8 s |
| 6 | `study-character-walk` | IK walk, stop, breath, notice, reaction (rig) | `rigWalk`, `idleBreath`, `lookAt`, `react` | 8.0 s |
| 7 | `study-character-acting` | acting beats and holds, double take | `idleBreath`, `lookAt`, `react` | 7.4 s |

## 1. Bouncing ball (`study-bouncing-ball`)

**Principle.** A bounce is a parabola: slow at the top, fast at the bottom. The ball stretches while it falls fast,
squashes on contact, and keeps its volume. Each rebound is lower and quicker.

**The math.** Free fall `h = g t^2 / 2` is `power1.in` (t squared); the rise is `power1.out`.

| quantity | formula | value (height 420, r 0.62, 4 bounces, travel 1300 px) |
|---|---|---|
| first fall | `0.5 s x sqrt(h / 300)` | 35 f |
| rebound n | height `h r^n`, duration `fall x sqrt(r^n)` | 28, 22, 17, 14 f legs; apex 100%, 62%, 38%, 24%, 15% |
| impact speed | `sqrt(h_n / h)` | 1, 0.79, 0.62, 0.49, 0.38 |
| squash | `scaleY = 1 - 0.22 x impact`, `scaleX = 1 / scaleY` | 0.78 first, 0.92 last |
| stretch | `scaleY = 1 + 0.4 x squash` before contact | 1.09 first |
| contact | grounded 3 f, recover 9 f | volume `scaleX x scaleY` within 5% of 1 |
| sideways | linear `x` over the whole bounce | 6.2 px/f; dots every 4 f trace each parabola |
| peak fall speed | `2 x 420 / 35` | 24 px/f |

```ts
bounce(tl, '.ball', DROP_AT, { height: 420, bounces: 4, restitution: 0.62, squash: 'normal', travel: 1300 });
```

**Contact sheet.** The ball hangs at the 100% guide, drops, and tiles `f106`/`f108` show it taller then flat with its
bottom ON the ground line; later bounces peak on the 62%, 38%, 24% guides. Each squash is smaller than the last.

**Common mistake.** Equal-height bounces (no decay), `linear` fall (floaty), squash that shrinks volume
(`scaleY` only), or squashing about the centre so the ball floats above the floor (needs `transformOrigin: 50% 100%`).

## 2. Anticipation jump (`study-anticipation-jump`)

**Principle.** Before an action, go the other way. Then act fast, overshoot, and settle slower than you acted.

| part | rule | value (`distance: 'far'`) |
|---|---|---|
| wind-up | action / 3, opposite direction, crouch | 7 f, 20 px, scaleY 0.86 / scaleX 1.16 |
| action | stretch along the axis, `power1.out` | 22 f, 387 px, stretch 1.14, peak 36 px/f |
| overshoot | 8% of the move | 27 px past the target |
| settle | 1.5 x action, `sine.inOut`, landing squash then round | 32 f |

```ts
launch(tl, '.block', 1.4, { direction: 'up', distance: 'far', amount: 'normal' });
```

**Contact sheet.** Tile `f90`: block wide and flat (wind-up). `f100`: tall and thin, far above the ghost outline's
start. `f113`: just past the dashed target outline. Last tiles: exactly on the outline, round again. A second, shorter
hop to the right repeats the pattern (16 f action).

**Common mistake.** No wind-up (reads as a teleport), wind-up as long as the action (reads as hesitation), no overshoot
(robotic stop), settle shorter than the action (reads as a hard stop).

## 3. Overlap and follow-through (`study-overlap-follow-through`)

**Principle.** Attached things never stop with their parent. Each part starts 2-4 f after the previous one (drag) and
the parts farthest away travel farthest (overshoot grows with distance), then everything settles onto the same spot.

| thing | value |
|---|---|
| drag per element | 3 f (`drag: 'normal'`; tight 2, loose 4) |
| stack move | 260 px in 18 f, `power1.out`, peak 29 px/f |
| overshoot | +8% of the travel per child index: 0, 21, 42, 62 px |
| settle | 27 f (1.5 x 18), `sine.inOut` |
| chain | root 8 deg, tip 12.8 deg (+20% per link); 3 swings, each keeps 55%; first swing 7.5 f, then 11 f per half swing |

```ts
followThrough(tl, ['.bar-0', '.bar-1', '.bar-2', '.bar-3'], 1.4, { direction: 'right', distance: 260, drag: 'normal' });
pendulum(tl, ['.link-0', '.link-1', '.link-2', '.link-3'], 3.1, { swing: 'soft', drag: 'normal', swings: 3 });
```

**Contact sheet.** Stack tiles `f105`-`f116`: the parent bar is already home while the lower bars are still staggered
to the right (a staircase edge). Chain tiles `f195`-`f216`: a curve that bends more toward the tip, then straightens.

**Common mistake.** All parts on the same tween (a rigid slab), delays above 6 f per part (reads as separate events),
oscillation that does not decay, nested links animated with absolute angles (angles add up: use small angles).

## 4. Arcs and spacing (`study-arcs-spacing`)

**Principle.** Living and thrown things move on curves, and their per-frame positions are not evenly spaced: tight at the
ends (slow in/out), wide in the middle. Evenly spaced dots on a straight line are linear motion.

| side | path | per-frame rule | dots every 4 f (700 px in 48 f) |
|---|---|---|---|
| wrong | straight, `none` ease | constant 14.6 px/f | 58 px apart everywhere |
| right | parabola, apex 25% = 175 px | `u = sine.inOut(t)`, `x = dx u`, `y = 4 b u (1 - u)` | 17 px apart at the ends, 92 px mid, peak 23 px/f |

```ts
arcMove(tl, '.ball-right', 1.4, { dx: 700, dy: 0, arc: 'mid', pace: 'slow' });   // 48 f
const p = arcPoint(i / 12, opts);   // the exact position the tween has at 4 f x i
```

**Contact sheet.** Left: 13 identical gaps and a ball that never seems to accelerate. Right: dots bunch at both ends and
spread at the top; the ball is the same size and arrives on the same frame.

**Common mistake.** Straight A to B for organic objects, an arc whose x and y use the same ease with different timing
(gives a lopsided path), a bulge above ~40% of the distance (reads as a jump, not a move).

## 5. Stagger rhythm (`study-stagger-rhythm`)

**Principle.** Rhythm is varied spacing. Eight items on an equal 18 f metronome feel mechanical; the same eight in
phrases (burst, rest, hero, pair) feel designed. Same first and last frame, same item animation (`rise`, 27 f).

| side | onsets (s from start) | gaps (f) |
|---|---|---|
| wrong | 0, 0.30, 0.59, 0.89, 1.18, 1.48, 1.77, 2.07 | 18 x 7 (sigma 0) |
| right | 0, 0.12, 0.24, 0.80, 1.30, 1.42, 1.95, 2.07 | 7, 7, 34, 30, 7, 32, 7 (burst 7 f, rest 30-34 f) |

```ts
const lane = (id, times) => times.forEach((t, i) => enter(tl, `.${id}-${i}`, 'rise', START + t, { intensity: 'soft' }));
```

**Contact sheet.** Left bars fill one by one at a steady pace; right bars arrive three, pause, one taller bar (the
hero gets its own beat), pause, two, pause, two. The tick strip under each side shows the same story as spacing.

**Common mistake.** `stagger: 'normal'` on everything (all gaps equal), gaps shorter than 4 f (reads as one block),
no pause before the important item. Between beats keep 50-95 f; between actions inside one phrase 18-42 f.

## 6. Character walk (`study-character-walk`, rig)

**Principle.** A walk is IK, not rotation guessing: the foot that is on the ground stays where it landed while the hips move
over it. Then the character stops with a weight settle, breathes, notices (eyes, head, torso in that order) and reacts with an
anticipation. All with `<RigCharacter>` (flat vector, 658 px tall) and helpers; the scene is 60 lines.

| piece | value |
|---|---|
| step | 30 f (`pace: 'walk'`), stance 60% of the cycle, swing foot arches 36 px |
| lead-in | 0.15 s: hips dip 9 px before the first foot leaves the ground |
| planted foot | sole contact point fixed (test: < 0.06 px/f), heel strike -14 deg, toe-off +30 deg |
| hips | drop 8 + 0.1 x stride px (+/- 8 bob), arms swing +/-30 deg against the same-side foot, 2 f late; head 3 f late |
| stop | closing foot lands at (steps + 0.8) steps, then a 0.4 s weight settle (hips dip 12 px) |
| notice | `lookAt`: pupils, head +3 f, torso +6 f; then a 0.35 s moving hold |
| react | crouch 0.14 s, hop 0.12 s, land 0.1 s, settle 0.4 s (`react`), then `holdFinal` |

```ts
const HERO = 'hero'; // RigCharacter id; helpers resolve '.hero-root', '.hero-thigh-l', ...
rigWalk(tl, HERO, 1.0, { pace: 'walk', steps: 3 });                 // rigWalkSeconds(opts) = 2.45 s
idleBreath(tl, HERO, idleAt, { seconds: 1.6, intensity: 'strong', blink: true });
lookAt(tl, HERO, noticeAt, { look: 'up' });                           // lookAtSeconds() = 0.45 s
react(tl, HERO, reactAt, { kind: 'startle', intensity: 'normal' });  // reactSeconds() = 0.81 s
// JSX: <RigCharacter id="hero" left={240} groundY={900} />
```

**Contact sheet.** `f75`-`f180`: legs scissor, one foot on the ground at all times, arms against the legs, then both feet
together. Later tiles: breathing, eyes up at the "?", crouch, hop with arms up, held pose.

**Common mistake.** Hand-rotating a one-piece leg (the foot slides), animating arms with the same phase as the same-side leg,
a pose frozen between actions, reacting with the body first, hold under 0.3 s.

## 7. Character acting (`study-character-acting`)

**Principle.** Acting is beats separated by holds of 0.3-0.5 s: wait (moving hold), hear, look at it, glance away, snap back
stronger (double take), gesture. Every motion is eyes first.

| beat | seconds | helper |
|---|---|---|
| wait | 1.6 | `idleBreath` + blink |
| hear | 0.95 | `enter(.., 'pop')`, `lookAt front` |
| double-take | 1.5 | `lookAt down subtle`, 0.3 s hold, `lookAt up strong` |
| gesture | 2.45 | `react surprise`, then `holdFinal` |

```ts
lookAt(tl, HERO, awayAt, { look: 'down', amount: 'subtle' });
lookAt(tl, HERO, awayAt + lookAtSeconds() + 0.3, { look: 'up', amount: 'strong' }); // hold 0.3 s between
```

**Common mistake.** No hold between look and look (reads as jitter), the same amount twice (no escalation), a gesture without a crouch.

## Checklist for a new study

1. Say the principle and the numbers in `direction.md` (one-sentence goal line is required by STORY-001).
2. Pick a helper from `src/core/physics.ts`; schedule with its `*Seconds()` twin; keep every beat >= 72 f and beat lengths varied.
3. End with `holdFinal(tl, at, 1.2)`; nothing moves in the hold.
4. List the frames that prove the principle in `beats[].samples`, then `pnpm check --project <slug>` and the contact sheet.
