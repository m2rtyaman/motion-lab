# Direction - Study: Stagger Rhythm

## Message (one-sentence goal)
Show that eight items arriving on an equal metronome feel mechanical, while the same eight in groups with pauses feel like a phrase.

## Principle
Rhythm = varied spacing between events, not equal spacing. Group items into phrases (burst, rest, hero, pair), keep the
gaps between 0.1 s (a burst) and 0.6 s (a rest), and give the important item its own beat.

## Numbers (frames at 60 fps, both sides end on the same frame)
| side | onset times from the start (s) | gaps (f) |
|---|---|---|
| wrong | 0, 0.30, 0.59, 0.89, 1.18, 1.48, 1.77, 2.07 | 18 18 18 18 18 18 18 (sigma 0) |
| right | 0, 0.12, 0.24, 0.80, 1.30, 1.42, 1.95, 2.07 | 7 7 34 30 7 32 7 (burst 7 f, rest 30-34 f) |

Each item is `enter(..., 'rise')`: 0.45 s (27 f) fade and slide. Measured references: beat spacing 0.8-1.6 s (50-95 f),
hold between actions 0.3-0.7 s (18-42 f).

## Look
Dark theme, split screen, eight slots per side, tick strip under each side shows the onset times, the right side's
fourth item is taller (the hero).

## Beats
| id | seconds | what happens | presets |
|---|---|---|---|
| open | 1.2 | panels, slots and ticks arrive | rise, stagger |
| phrase-a | 1.2 | metronome starts; burst of three | rise |
| phrase-b | 1.2 | metronome continues; pause, hero, pair | rise |
| phrase-c | 2.2 | final items, caption, 1.2 s hold | rise |
