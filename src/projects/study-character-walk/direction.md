# Direction - Study: Character Walk

## Message (one-sentence goal)
Show a walk built from four poses per step, a short acting hold, and a reaction that wind-ups before it moves.

## Principle
Walk cycle + acting beats. A casual step is 30 frames (cycle = 2 steps = 60 f) with four poses: contact (legs widest),
down (weight lands, body lowest), passing (swing leg under the body, foot lifted), up (highest, pushing off). Arms swing
against the legs and lag them by 2 f; the head lags the body by 3 f. After the walk the character holds 0.5 s with a tiny
drift (moving hold, never a dead freeze), then the head leads a startled recoil: wind-up (1/3 of the action) the other
way, stretched action, overshoot, 1.5x settle.

## Numbers (frames at 60 fps)
| thing | value |
|---|---|
| step | 30 f (7.5 f per pose), 150 px per step = 5 px/f |
| body bob | down +8 px, passing -6 px, up -18 px, squash/stretch 0.94 / 1.05 (volume 1) |
| legs | +/-24 deg swing, swing foot lifted 14 px at passing |
| arms | 18 deg, opposite the same-side leg, 2 f late |
| head | half the bob, 3 f late |
| hold before the reaction | 0.5 s = 30 f |
| reaction | head rocks back at +0 f, body recoil starts 4 f later; wind-up 4 f, action 13 f, settle 20 f |

## Look
Dark theme, flat shapes: accent torso, light head with one eye, darker limbs, a soft contact shadow, one "!" bubble.

## Beats
| id | seconds | what happens | presets |
|---|---|---|---|
| enter | 1.2 | ground, character and label arrive | wipe, rise |
| walk | 2.5 | four steps to the right | physics:walkCycle |
| react | 2.7 | moving hold, "!" pops, head leads, recoil, 1.2 s hold | movingHold, pop, pendulum, launch |
