---
name: kinetic-type
description: Build type-driven motion pieces (manifestos, headlines, word bursts, title cards) with the v2 presets words, stagger, punch and maskWipe. Use when the brief is mostly text, or the main subject is a statement rather than a product or character. RULES.md wins on any conflict.
---

# Kinetic type (v2)

Optional guide. Read `RULES.md`, `docs/STORYBOARD.md`, `docs/DESIGN_SYSTEM.md`, `docs/COMPONENT_RECIPES.md` (kinetic headline recipe), `docs/PRESETS.md` and `docs/MOTION_MATH.md` first. Closest example to copy:
Workflow: write a storyboard board per beat in `spec.json` (`docs/STORYBOARD.md`), build the static layout, `pnpm render:poses --project <slug>` and fix it, only then add motion.
`src/projects/example-kinetic-type` (9:16, three beats, ends in the 1.2 s hold).
Fonts and Tailwind font classes: `references/TYPOGRAPHY_GUIDE.md`.

## What carries a type piece
| Job | Call | Notes |
|---|---|---|
| headline arrives word by word | `enter(tl, '.w', 'words', at)` | one class on every word span; `{ stagger: 'tight' }` for short lines |
| lines of a list arrive | `enter(tl, '.line', 'stagger', at, { stagger: 'loose' })` | children start 2-6 frames apart |
| one word must land | `emphasize(tl, '.key', 'punch', at, { intensity: 'strong' })` | one punch per beat, on the word that matters |
| swap to the next statement | `transition(tl, 'maskWipe', at, { incoming: '.panel', type: 'diagonal' })` | start about 0.15 s before the next beat label |
| old statement leaves | `exit(tl, '.old', 'sink', at)` | exits ease in, entrances ease out (T008) |
| closing line | `enter(tl, '.sign', 'pop', at)` then `holdFinal` | only `camera:drift` may move in the hold |

## Plan
1. Write the copy first: 3-6 short statements, real words, one idea per beat. No placeholder text.
2. One beat per statement, uneven lengths (roughly 1.2-2.5 s). A beat under 0.6 s cannot be read (T011).
3. Reading time is about 0.25 s per word plus 0.4 s. If a beat cannot afford it, cut words, not time.
4. Each beat changes one thing: colour field, scale, direction or camera. Alternate dark and light panels
   (`getTheme('editorial-warm')` or `getTheme('kinetic-acid')`).
5. The last statement and brand mark sit still for the full 1.2 s.

## Scene sketch
```tsx
import { type FC } from 'react';
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { beat, enter, exit, emphasize, transition, holdFinal } from '../../core/presets';
import { getTheme } from '../../core/theme-contract';

const theme = getTheme('editorial-warm');
const HOOK = ['Most', 'writing', 'is too', 'long.'];
const TURN = ['Cut it.', 'Then cut', 'it again.'];

export const buildTimeline = (tl: gsap.core.Timeline) => {
  beat(tl, 'hook', 0);
  enter(tl, '.hook-word', 'words', 0.1);
  emphasize(tl, '.hook-last', 'punch', 1.0, { intensity: 'strong' });
  beat(tl, 'turn', 1.6);
  transition(tl, 'maskWipe', 1.45, { incoming: '.turn-panel', type: 'diagonal' });
  enter(tl, '.turn-line', 'stagger', 1.95, { stagger: 'loose' });
  exit(tl, '.hook', 'sink', 3.2);
  holdFinal(tl, 3.8, 1.2);
  return tl;
};

export const Scene: FC = () => {
  useRemotionGSAP(buildTimeline);
  const { colors } = theme;
  const heavy = 'font-black uppercase leading-[0.92] tracking-[-0.025em]';
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgPrimary, color: colors.textPrimary }}>
      <div className="hook absolute inset-0 flex flex-col justify-center px-16 pt-[250px] pb-[300px]">
        {HOOK.map((w, i) => (
          <span key={w} className={`hook-word ${i === HOOK.length - 1 ? 'hook-last' : ''} ${heavy} block text-[188px]`}>{w}</span>
        ))}
      </div>
      <div className="turn-panel absolute inset-0 flex flex-col justify-center px-16 pt-[250px] pb-[300px]" style={{ backgroundColor: colors.textPrimary, color: colors.bgPrimary }}>
        {TURN.map((w) => <span key={w} className={`turn-line ${heavy} block text-[164px]`}>{w}</span>)}
      </div>
    </AbsoluteFill>
  );
};
export default Scene;
```

## Typography rules the audits check
- 18 px minimum everywhere (`text-xs`, `text-sm`, `text-[8..14px]` are rejected); 120-190 px headlines are normal in 9:16.
- Keep text inside the safe zone: 9:16 top >= 250 px, bottom >= 300 px. Nothing touching the frame edge.
- No emoji (draw glyphs with svg), no raw `#00ffff` / `#ff00ff` or cyan/magenta glow, no meta text such as "kinetic geometry".
- Only transform, opacity and filter move. Never animate width, height, top, left, margin or padding.
- Counting numbers use tabular figures (`font-mono tabular-nums`) to avoid jitter.

## Self-check (contact sheet)
Open `out/<slug>/visual-audit-grid.png`: is every statement legible at phone size, is there one focal word per frame,
does any beat look empty or overlapped, is the last frame identical to the one before it? Answer with `evals/VISUAL_RUBRIC.md`.
