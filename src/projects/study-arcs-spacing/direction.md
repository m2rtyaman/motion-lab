# Direction - Study: Arcs and Spacing

## Message (one-sentence goal)
Show that an arc with slow-in/slow-out reads as alive while a straight line at constant speed reads as a machine, for the same move in the same time.

## Principle
Arcs and spacing. Living things and thrown objects travel along curves; their positions per frame are NOT evenly spaced:
close together at the ends (slow in / slow out), far apart in the middle (fast), with the curve itself a parabola. Evenly spaced dots on a straight line are
the signature of linear motion.

## Numbers (frames at 60 fps, 700 px move in 48 f)
| side | path | x ease | y | dot spacing (13 dots, every 4 f) |
|---|---|---|---|---|
| wrong | straight | none (linear) | none | all 58 px apart, 14.6 px/f |
| right | parabolic arc, apex 25% = 175 px | sine.inOut | same eased progress u: y = 4 x 175 x u(1-u) | 17 px apart at the ends, 92 px in the middle, peak 23 px/f |

`arcPoint(p, opts)` in `src/core/physics.ts` returns the same positions the tweens use, so the dots are exact.

## Look
Dark theme, split screen, labelled WRONG / RIGHT, path drawn as a hairline, one accent ball per side.

## Beats
| id | seconds | what happens | presets |
|---|---|---|---|
| draw | 1.2 | panels, paths and dots arrive | rise, stagger |
| go | 1.4 | both balls travel right (0.8 s) | physics:arcMove, raw linear tween |
| back | 1.8 | both travel back | physics:arcMove |
| rest | 1.8 | caption, 1.2 s hold | rise |
