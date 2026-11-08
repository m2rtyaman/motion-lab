# Direction - Walk, Notice, React

## Message (one-sentence goal)
A flat-shape character that feels alive: it walks with weight, stops with an acting hold, and reacts head first.

## Audience
Anyone judging character timing, 16:9, no sound.

## Look
- Palette: theme "dark"; accentPrimary body, accentSecondary for the far limbs, parcel and the "!"
- Type: only the "!" glyph, 72px

## Beats
| id | seconds | what happens | presets |
|---|---|---|---|
| enter | 0.75 | ground wipes in, parcel pops, character rises | wipe, pop, rise |
| walk | 1.95 | `walkCycle`, 3 steps of 30 f, root travels 450 px | physics:walkCycle |
| notice | 0.65 | 0.5 s moving hold: standing, breathing; slow push-in | physics:movingHold, pushIn |
| react | 2.65 | "!" pops, head swings back first, body recoils 4 f later, 1.2s hold | pop, pendulum, launch |
