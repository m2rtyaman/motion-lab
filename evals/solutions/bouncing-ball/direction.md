# Direction - Heavy Ball

## Message (one-sentence goal)
A ball that obeys gravity: it falls fast, flattens on the floor and loses height with every rebound.

## Audience
Anyone judging the basics of animation, 16:9, no sound.

## Look
- Palette: theme "dark", one accent on the ball, everything else muted
- Type: 44px bold caption at the bottom, nothing else on screen

## Beats
| id | seconds | what happens | presets |
|---|---|---|---|
| setup | 0.62 | ground wipes in, shadow rises, ball pops in at its apex | wipe, rise, pop, drift |
| drop | 1.58 | `bounce`: 300 px fall, squash on contact, restitution 0.4, 3 rebounds | physics:bounce |
| rest | 1.80 | caption rises as the last rebound settles, 1.2s hold | rise |
