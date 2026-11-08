# Storyboard (harness v2)

Every beat in `spec.json` carries a `board` card. `pnpm check` runs `scripts/storyboard-audit.mjs` (rules SB001-SB007) on it.
Write the boards first, build a static layout, look at the key poses, and only then add motion.

## Why a storyboard
Without one, a model decides layout while it codes: elements overlap, UI is tiny, the result appears before the click.
A board fixes three things before any tween exists: what the viewer looks at (focal + zone), what they see at each end of the beat
(key poses), and in what order the story is told. Motion then only connects two poses you already approved.

## Board fields
```json
"board": {
  "focal": ".reconcile-btn",            "zone": "top-right",
  "start": "Cursor enters from the lower left, button idle",
  "end":   "Cursor rests on the button, ripple fired, camera leaned in",
  "text": ["Reconcile all"],            "transitionIn": "cut",
  "why":  "the click is the cause; the finale is its effect, so it comes first"
}
```
| Field | Rule | Checked by |
|---|---|---|
| `focal` | one CSS selector for the one thing to look at; must match a static `className`/`id` in the JSX | SB001, SB002 |
| `zone` | 3x3 cell of the frame where the focal sits | SB001 |
| `start`, `end` | the key pose at the first and last frame of the beat, one sentence each, different from each other | SB001, SB007 |
| `text` | on-screen strings introduced in this beat (`[]` if none); each must be rendered in `Scene.tsx` | SB003, SB005 |
| `transitionIn` | a preset (`transition:maskWipe`, `camera:pushIn`) or `cut` | SB004 |
| `why` | motivation in one clause; the final beat's must mention the hold | SB001, SB006 |

## Zones
`top-left top-center top-right / middle-left middle-center middle-right / bottom-left bottom-center bottom-right`
(aliases: `center`, `top`, `bottom`, `left`, `right`). One focal per beat; a different zone, focal or depth in the next beat.
`pnpm render:poses` draws this 3x3 grid on every pose and outlines the zone you declared in pink: the focal must sit inside it.
In 9:16 keep zones inside the safe zone (top 250 px, bottom 300 px).

## Writing key poses
- Describe what a still frame shows, not what moves: "Cursor rests on the button, ripple fired", not "cursor moves to the button".
- `start` of a beat is usually the `end` of the previous one plus one change coming in. If `start` equals `end`, nothing happens (SB007).
- Two consecutive beats with the same focal and zone and a plain cut read as a slideshow (SB004): change focus, zone or depth, or name a transition.
- Hero continuity: keep one element on screen across beats where you can; let it change role instead of cutting to something new.

## Story order: cause before effect
Show the cause, then the effect: the click before the sorted result, the bubble before the glance, the question before the answer,
the proof before the call to action. Read your `why` lines top to bottom as a sentence; if a beat explains something the viewer has not seen yet, swap them.
The audit cannot check this. Haiku-class models fail here most often.

## Reading time
Strings in `text` need `1.5 s + words / 15` (CJK: chars / 4.5), the rule of `src/core/readability-meter.ts`.
SB003 warns when the beat is shorter and errors below half of that. Fix: fewer words, or a longer beat (change `spec.json` and the `beat()` time together).
The closing message/CTA also needs the 1.2 s hold (SB006).

## Pose-to-pose workflow
1. Write `direction.md` (message, look) and a board per beat in `spec.json`. `pnpm check` must show no SB errors.
2. Build the static layout in `Scene.tsx`: everything on screen at its final size and place, no tweens yet except `buildTimeline` stubs.
3. `pnpm render:poses --project <slug>` renders a still at the start and end of every beat into `out/<slug>/poses/` plus `poses-grid.png`
   (rows = beats, left = start, right = end, label = beat, frame, focal, zone). Open the grid.
4. Compare each pose with its `start`/`end` sentence: focal in the pink zone, text readable (18 px or larger), no overlaps, nothing cut off, cause before effect. Fix the layout, re-render.
5. Only now add motion with presets and rig helpers, then `pnpm check`, `pnpm render:contact-sheet`, `pnpm render`.
(Set `REMOTION_BROWSER_EXECUTABLE` to a Chrome/Edge path to skip the browser download.)

## Worked example: `src/projects/example-product-ui`
| Beat | focal / zone | start -> end | why |
|---|---|---|---|
| open | `.frame-wrap` / center | empty canvas -> headline over a centred browser frame with the chart | meet the whole product before anything moves |
| act | `.reconcile-btn` / top-right | cursor enters, button idle -> cursor on the button, ripple, camera leaned in | the click is the cause |
| finale | `.finale-word` / center, `transition:maskWipe` | iris opens the brand canvas -> mark, headline, CTA sharp | the result is the message; CTA holds 1.2 s |

The three focals sit in three different zones, the click comes before the result, every `text` string is real copy that `Scene.tsx` renders,
and the last `why` says "holds still for the full 1.2s". That is what SB001-SB007 check; the layout quality itself you judge in the poses grid.

## Codes
SB001 board missing/incomplete (error) - SB002 focal selector not in the JSX (error) - SB003 reading time (warning, error below half)
SB004 same focal+zone, no transition (warning) - SB005 text not rendered (warning) - SB006 closing message/hold (warning) - SB007 start equals end (warning).
