# Direction - Study: Anticipation Jump

## Message (one-sentence goal)
Show that a believable action is four parts in a fixed ratio: wind-up opposite the action, fast action, overshoot, slower settle.

## Principle
Anticipation / action / follow-through. The wind-up goes the opposite way and lasts one third of the action; the action
stretches along its axis; the target is overshot by about 8% of the move, then the settle takes 1.5x the action.

## Numbers (frames at 60 fps, `launch(..., { distance: 'far' })`)
| part | time | motion |
|---|---|---|
| wind-up | 7 f (action / 3 = 0.12 s) | 20 px opposite, scaleY 0.86, scaleX 1.16 (volume kept) |
| action | 22 f (0.36 s) | 340 px + 8% overshoot + the 20 px wind-up back = 387 px, power1.out, stretch 1.14 |
| settle | 32 f (0.54 s = 1.5x action) | back 27 px, sine.inOut, landing squash then round |
| peak speed | 2 x 387 / 21.6 = 36 px/f | hero move: above the 30 px/f comfort limit, well under the 80 px/f impact limit |

## Look
Dark theme, one accent block with two eyes, dashed ghost outlines mark the targets, a three-line legend.

## Beats
| id | seconds | what happens | presets |
|---|---|---|---|
| ready | 1.2 | ground, ghosts and legend arrive; block breathes (0.5 s moving hold) | pop, wipe, stagger, movingHold |
| jump | 1.8 | launch up 340 px | physics:launch |
| hop | 1.4 | launch right 220 px | physics:launch |
| rest | 1.8 | caption, 1.2 s hold | rise |
