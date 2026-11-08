# Direction - Study: Overlap and Follow-Through

## Message (one-sentence goal)
Show that things attached to a moving parent never stop with it: they lag a few frames, overshoot, and settle after it.

## Principle
Overlapping action and follow-through. Every part starts 2-4 frames after its parent (drag), the parts furthest from the
parent travel further (overshoot grows with distance), and the settle is 1.5x the move. Nothing stops on the same frame.

## Numbers (frames at 60 fps)
| thing | value |
|---|---|
| drag per element | 3 f (`drag: 'normal'`; tight 2, loose 4) |
| stack move | 260 px in 18 f, power1.out, peak 29 px/f |
| overshoot | +8% of the travel per child index (parent 0, last child +24%) |
| settle | 27 f (1.5 x 18), sine.inOut, back onto the same spot |
| chain | root swing 8 deg, tip 12.8 deg (+20% per link), 3 swings, each keeps 55% |
| chain timing | first swing 7.5 f, then 11 f per half swing, links 3 f apart |

## Look
Dark theme, four accent bars labelled with their drag (+0 f, +3 f, +6 f, +9 f), a four-link chain hanging from a bar.

## Beats
| id | seconds | what happens | presets |
|---|---|---|---|
| setup | 1.2 | bars, bar and chain arrive | stagger, rise |
| stack | 1.8 | stack slides right, children overshoot and settle | physics:followThrough |
| chain | 1.2 | chain whips and settles | physics:pendulum |
| rest | 2.0 | caption, 1.2 s hold | rise |
