# Direction - Study: Bouncing Ball

## Message (one-sentence goal)
Show that a ball bounces believably because it is slow at the top, fast at the bottom, squashes on contact and keeps its volume.

## Principle
Squash & stretch with slow-in/slow-out at the apex and decay. A bouncing ball is a parabola: it is slow at the top
and fast at the bottom, so it STRETCHES while falling fast, SQUASHES on contact, and the volume stays constant.

## Numbers (frames at 60 fps)
| thing | value |
|---|---|
| first fall, 420 px | 0.5 x sqrt(420/300) = 0.59 s = 35 f (power1.in, a true parabola) |
| each rebound | height x 0.62, duration x sqrt(0.62) = x0.79 |
| contact squash | 3 f hold, 9 f recover; squash 22% x impact speed |
| volume | scaleX x scaleY = 1 (stretch 1/0.78 wide, 0.78 tall) |
| sideways travel | 1300 px, linear (constant x speed is physically right), 6.2 px/f; each bounce traces a parabola, dots every 4 f show the spacing |
| peak fall speed | 2 x 420 / 35 = 24 px/f (under the 30 px/f comfort limit) |

## Look
Dark theme, one large accent ball (240 px), faint dots every 4 f along the path, hairline guides at each apex height (100%, 62%, 38%, 24%, 15%).

## Beats
| id | seconds | what happens | presets |
|---|---|---|---|
| setup | 1.2 | ground and guides rise in, ball pops in at the apex | rise, pop |
| fall | 1.5 | ball starts to fall, stretch builds | physics:bounce |
| decay | 2.3 | four shrinking rebounds | physics:bounce |
| rest | 1.7 | caption states the rule, 1.2s hold | rise |
