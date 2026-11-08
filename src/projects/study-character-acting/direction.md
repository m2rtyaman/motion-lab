# Direction - Study: Character Acting

## Message (one-sentence goal)
Show that acting is beats and holds: wait, notice, look away, snap back, gesture, with 0.3 to 0.5 s of stillness between them.

## Principle
Acting beats. Each beat is an action followed by a hold; the hold is where the viewer reads the thought. Eyes lead the head
(2-4 f), the head leads the body, a big gesture starts with an anticipation (crouch). The waiting pose is a moving hold
(breathing, one blink), never a freeze.

## Numbers (seconds at 60 fps)
| thing | value |
|---|---|
| wait | one breath, 1.6 s |
| look at the sound | eyes at +0, head +3 f, torso +6 f, 0.45 s |
| hold on the thing | 0.5 s |
| glance away (subtle) | 0.45 s, then 0.3 s hold |
| snap back (strong) | 0.45 s, then 0.3 s hold |
| gesture | anticipation 0.14 s, pose 0.12 s, settle 0.55 s |

## Look
Dark theme, flat vector character (RigCharacter), one speech bubble as the stimulus.

## Beats
| id | seconds | what happens | presets |
|---|---|---|---|
| enter | 0.9 | ground, character and label arrive | wipe, rise |
| wait | 1.6 | breathing hold, blink | physics:idleBreath |
| hear | 0.95 | bubble pops, eyes then head | pop, physics:lookAt |
| double-take | 1.5 | glance away, snap back | physics:lookAt |
| gesture | 2.45 | crouch, arms up, 1.2 s closing hold | physics:react |
