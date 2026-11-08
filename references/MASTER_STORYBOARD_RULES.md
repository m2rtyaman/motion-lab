> Optional guidance for planning a storyboard. Not enforced by scripts. `RULES.md` wins on any conflict
> (it lists what the audits check; `docs/PRESETS.md` and `docs/MOTION_MATH.md` give the motion numbers).

# Storyboard guidelines (the five laws, as soft guidance)

Use these when writing the beat table in `spec.json` and the short `direction.md`. They are advice for a better video,
not a checklist to satisfy; a piece that breaks one on purpose is fine if you can say why.

## 1. Keep continuity instead of cutting
- Avoid a slide-deck dissolve where the screen dims and rebuilds. Hand over with a transition preset (`maskWipe`, `morph`,
  `takeover`, `dive`, `whip`) so something visible carries across the boundary.
- A hero element (a shape, a card, the product shell, a mark) that stays on screen and changes scale or form across beats
  gives the viewer an anchor. It is optional: a typographic piece can carry continuity with colour and rhythm instead.
- The audits require every beat to contain motion (T002); they do not require a hero element.

## 2. Pulse and stillness
- Change focus, camera or depth about every beat (roughly 1.0-2.5 s). Make beat lengths uneven; equal beats (T011) read as a metronome.
- The closing message, logo or CTA holds still for at least 1.2 s (72 frames): `holdFinal(tl, at, 1.2)` (T003 enforces it).
- Quick word punches (`emphasize` `punch`, about 0.3 s) can sit inside a beat without stopping momentum.

## 3. Three layers of depth
1. Background: atmosphere such as a grid, soft radial glow, or a lit ground line (`BackdropField` variants `mesh`, `grid`, `rings`, `rays`).
2. Secondary: soft shadows, a trailing outline, a waveform or a panel behind the hero.
3. Foreground: sharp type, the product UI, a one-pixel rim highlight.
Cards and widgets belong inside a shell or a hairline grid, not floating in empty space.

## 4. Contrast
- Alternate dark and light fields, or calm and loud beats, so the sequence has shape.
- Vary scale on purpose: a small interaction (a click, a typed word) followed by a full-frame takeover is a strong move
  (`transition(tl, 'takeover', ...)`).

## 5. Separate the three inputs
Plan with three inputs instead of one blurry prompt:
1. Script: what are we saying and why (the one-sentence message, the claim, the call to action).
2. Storyboard: how each beat looks (framing, colours, depth, real UI anatomy).
3. Motion reference: how it moves (pick presets by role; read `docs/MOTION_MATH.md` for the numbers).

## Standard funnel for 15-30 s pieces
Hook (0-2 s) -> Introduce (2-5 s) -> Demonstrate (5-12 s) -> Payoff -> Resolve and CTA with the still hold.
Short pieces (5-10 s) compress this to three beats: hook, proof, resolve.

## Optional beat table for `direction.md`
| Beat | Seconds | Focus | Depth change | Preset(s) |
|---|---|---|---|---|
| hook | 0.0-1.6 | headline | backdrop drifts | `words`, `drift` |
| proof | 1.6-3.7 | product close-up | shell arrives | `blurIn`, `pushIn`, `punch` |
| resolve | 3.7-end | logo and CTA | still hold | `pop`, `holdFinal` |

## Self-check before coding
1. Is the one-sentence message written, with real (not placeholder) copy?
2. Do beat lengths vary, and does each beat change one thing?
3. Does the last beat contain the 1.2 s still hold?
4. Is there a background, a secondary layer and a sharp foreground?
5. Is anything floating outside a shell, or under 18 px, or outside the safe zone?

## Voice-over and B-roll
When narration is used, harvest timings with `pnpm harvest --project <slug> --text "..."` and start beats on word clusters
from `public/harvest/<slug>/words.json`. See `.agent/skills/asset-harvester/SKILL.md`.
