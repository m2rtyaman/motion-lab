---
name: motion-playbook
description: How to plan and build a harness-v2 Motion Lab scene from a brief - read order, beat planning, preset choice, copy-an-example workflow, and the contact-sheet self-check. Use at the start of any new video project or when a scene fails `pnpm check`. RULES.md wins on any conflict.
---

# Motion playbook (harness v2)

Optional guide. `RULES.md` is the canonical rule file; this skill only sequences the work.
Specialised topics: `kinetic-type`, `product-ui-motion`, `character-animation`, `sound-design`, `asset-harvester`.
Pictures of every usable primitive: `docs/COMPONENT_GALLERY.md` (import from `src/primitives/curated.ts`). Type, spacing, grid and contrast numbers: `docs/DESIGN_SYSTEM.md`.

## 1. Read in this order (no web search needed)
1. `RULES.md` - what the scripts enforce.
2. `docs/STORYBOARD.md` - the board per beat you write in `spec.json` before any code (focal, zone, key poses, text, why).
3. `docs/DESIGN_SYSTEM.md` - type scale, spacing, safe areas, contrast, UI scale (numbers, not adjectives).
4. `docs/COMPONENT_GALLERY.md` (pictures of the curated primitives) and `docs/COMPONENT_RECIPES.md` (cards, rows, charts, buttons, CTA, toasts, app windows: BAD/GOOD pairs).
5. `docs/PRESETS.md` - the closed vocabulary (`enter`, `exit`, `emphasize`, `camera`, `transition`, physics helpers).
6. `docs/MOTION_MATH.md` - why the numbers are what they are (easing, overlap, px/frame, beat lengths).
7. `docs/ANIMATION_STUDIES.md` (physics) or `docs/CHARACTER_ANIMATION.md` (characters), when the brief needs them.
8. The closest example, then copy its structure (not its content):
   - `src/projects/example-editorial-data` - 16:9 data story with a `components/` folder
   - `src/projects/example-social-promo` - 9:16 promo, RigCharacter reacting to a UI card
   - `src/projects/example-feature-tour` - 16:9 app window, three features, camera moves
   - `src/projects/example-kinetic-type` - headline-driven type piece, 9:16
   - `src/projects/example-product-ui` - product UI in a shell, 16:9
   - `src/projects/example-logo-sting` - short logo sting with the final hold
   - `src/projects/study-*` - one physics principle each (bounce, arcs, overlap, stagger, walk)

## 2. Plan the beats before the code
- Write the brief as one sentence of message, then 3-6 beats. Vary lengths (about 1-2.5 s); equal beats trigger T011.
- Each beat changes exactly one thing: focus, camera or depth. One focal point at a time.
- The last beat is the message/logo/CTA and ends with `holdFinal(tl, at, 1.2)`; `at + 1.2` must not pass the video end (ideally it equals it).
- Put the beats in `spec.json` (`"harness": 2`): first starts at frame 0, beats touch, last `endFrame` = duration x 60.
- Give every beat a `board` (`focal`, `zone`, `start`/`end` key poses, `text`, `transitionIn`, `why`); cause comes before effect. `pnpm check` runs SB001-SB007 on it.
- Keep one hero element across beats where you can instead of cutting between unrelated screens.

## 3. Choose motion by role, not by number
| Need | Preset |
|---|---|
| something arrives | `enter`: `rise`, `pop`, `blurIn`, `wipe`, `stagger`, `words` |
| something leaves | `exit`: `sink`, `shrink`, `wipeOut` |
| draw the eye | `emphasize`: `punch`, `shake`, `glint` |
| camera | `camera`: `pushIn`, `pullOut`, `drift`, `settle` |
| scene change | `transition`: `whip`, `maskWipe`, `morph`, `zoomPunch`, `takeover`, `dive` |
| weight, arcs, walk | `src/core/physics.ts`: `bounce`, `launch`, `arcMove`, `followThrough`, `pendulum`, `walkCycle` |
Options are only `stagger`, `intensity`, `direction` (see PRESETS.md). Do not invent durations, eases or px values.
Never call `gsap.to/from/set/timeline` directly (V2-004); use `tl` only when no preset fits, and rarely.

## 4. Minimal v2 scene skeleton
```tsx
import { type FC } from 'react';
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { beat, enter, emphasize, camera, holdFinal } from '../../core/presets';
import { getTheme } from '../../core/theme-contract';
import { BackdropField } from '../../primitives/curated';

const theme = getTheme('editorial-warm');

export const buildTimeline = (tl: gsap.core.Timeline) => {
  beat(tl, 'hook', 0);
  enter(tl, '.hook-word', 'words', 0.1);
  camera(tl, '.backdrop', 'drift', 0.1, { intensity: 'soft' });
  beat(tl, 'proof', 1.6);
  enter(tl, '.proof-card', 'pop', 1.7);
  emphasize(tl, '.proof-card', 'glint', 2.4);
  holdFinal(tl, 3.8, 1.2);
  return tl;
};

export const Scene: FC = () => {
  useRemotionGSAP(buildTimeline);
  const { colors } = theme;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgPrimary, color: colors.textPrimary }}>
      <div className="backdrop absolute inset-0"><BackdropField theme={theme} variant="rays" intensity={0.5} /></div>
      <div className="absolute inset-0 flex flex-col justify-center gap-10 px-16 pt-[250px] pb-[300px]">
        <h1 className="flex flex-wrap gap-x-6 text-[150px] font-black leading-[0.95]">
          {['Say', 'less.'].map((w) => <span key={w} className="hook-word">{w}</span>)}
        </h1>
        <div className="proof-card rounded-3xl px-10 py-8 text-[56px] font-bold" style={{ backgroundColor: colors.bgSurface }}>
          One idea per beat
        </div>
      </div>
      {/* real copy only, 18px or larger, inside the safe zone */}
    </AbsoluteFill>
  );
};
export default Scene;
```
`buildTimeline` must be exported and passed to `useRemotionGSAP` (V2-001). Imports come only from react, remotion, gsap,
`src/core/*`, `src/primitives/curated.ts` (+ `characters/RigCharacter`) and your own folder (V2-002). Scene.tsx keeps at most 2 local components; larger pieces go in `components/*.tsx` (max 6 files, each <= 120 lines, presentational only: no motion, no raw colors, text >= 18px, root forwards `className`).

## 5. Loop
1. `pnpm new <slug> --mode editorial-ui|kinetic-poster|cinematic-world [--aspect 9:16|16:9] [--duration 6]`
   (all scaffold v2 with boards; `cinematic-world` gives a `RigCharacter` scene; `--legacy` is the old layout).
2. Edit the boards in `spec.json` and a short `direction.md`; build the static layout in `Scene.tsx` using the closest example.
   `pnpm render:poses --project <slug>`: open `out/<slug>/poses/poses-grid.png`, check every pose against its board, fix the layout. Only then add motion.
3. `pnpm check --project <slug>`; fix every error, then the warnings (each message names the fix and a MOTION_MATH link).
4. `pnpm render:contact-sheet --project <slug>`, open `out/<slug>/visual-audit-grid.png` and answer the generic block of
   `evals/VISUAL_RUBRIC.md` (legible, safe-zone, focal-point, no-empty, no-overlap, final-still) from what you see.
   Fix every "no", re-run check, re-render the sheet.
5. `pnpm render --project <slug>` -> `out/<slug>/<slug>.mp4`.
For a graded exercise: `pnpm eval:score --task <id> --project <slug>`.

## 6. Do not
- Edit `scripts/`, `evals/`, `docs/`, `src/core`, `src/primitives`, `specs/` or `RULES.md` to make a check pass (TAMPERED = 0); fix the scene. Do not copy `evals/solutions` (C001).
- Animate in React (`spring`, `interpolate`/`useCurrentFrame` for style or visibility: V2-005) or tween rig parts yourself; use presets and rig helpers.
- Silence warnings with `"audit": { "allow": [...] }` unless the scene is an intentional wrong-example demo.
- Use `Math.random`, `Date.now`, timers, CSS transitions, emoji, lorem ipsum, fake telemetry or a real brand's logo.
- Write text under 18px or inside the unsafe margins (9:16: top 250, bottom 300).
