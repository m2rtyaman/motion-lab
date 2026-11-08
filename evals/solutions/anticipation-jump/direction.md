# Direction - Pip Jumps

## Message (one-sentence goal)
A jump is felt before it is seen: crouch first, then launch, overshoot and settle slower than the action.

## Audience
Anyone judging anticipation and follow-through, 16:9, no sound.

## Look
- Palette: theme "dark", one accent on the block, a dashed outline marks the landing spot
- Type: none, the motion carries the whole piece

## Beats
| id | seconds | what happens | presets |
|---|---|---|---|
| ready | 0.67 | ground wipes in, target and block rise, block breathes (moving hold) | wipe, rise, physics:movingHold |
| jump | 0.70 | `launch` up 220 px: wind-up = action / 3, stretched action, 8% overshoot, settle = 1.5 x action | physics:launch |
| land | 1.63 | target punches softly on arrival, then the 1.2s hold | punch |
