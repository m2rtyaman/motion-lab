---
name: product-ui-motion
description: Build product and UI demo videos with v2 presets - shells from src/primitives, a cursor that clicks, emphasis on the clicked control, camera push-ins, readable UI scale. Use when the subject is an app, dashboard or feature walk-through. RULES.md wins on any conflict.
---

# Product UI motion (v2)

Primitives to use (with pictures): `docs/COMPONENT_GALLERY.md`, import from `src/primitives/curated.ts`. Numbers for type, spacing, grids, contrast and UI scale: `docs/DESIGN_SYSTEM.md`.

Optional guide. Read `RULES.md`, `docs/STORYBOARD.md`, `docs/DESIGN_SYSTEM.md`, `docs/COMPONENT_GALLERY.md`, `docs/COMPONENT_RECIPES.md`, `docs/PRESETS.md`, `docs/MOTION_MATH.md` first. Shells: wrap in `UI_SCALE.recommendedZoom[0]` and counter-zoom the content (see `example-product-ui`); glint the real button, never a decorative overlay. Longer tours: `src/projects/example-feature-tour` (one app window, camera moves, cause then effect). Closest example to copy:
Workflow: write a storyboard board per beat in `spec.json` (`docs/STORYBOARD.md`), build the static layout, `pnpm render:poses --project <slug>` and fix it, only then add motion.
`src/projects/example-product-ui` (16:9, browser frame, cursor click, takeover to a logo and CTA, 1.2 s hold).

## Anatomy of a UI piece
1. **Anchor every element in a shell.** Never float cards in empty space. Use `BrowserFrame`, `AppShell`, `TerminalShell`,
   `PrecisionDashboardShell` or `DeviceMockupStage`, all exported from `src/primitives/curated.ts`, or a 1px hairline grid.
2. **Real product anatomy, real copy.** Labels, numbers and names that make sense for the product in the brief. No invented
   server telemetry in consumer pieces, no lorem ipsum, no real brand logo unless the user supplies it.
3. **Readable scale.** UI text is 18 px or larger on the final frame. Zoom the content wrapper (as the example does)
   instead of shrinking type.
4. **One action per beat.** Beat 1 shows the whole UI, beat 2 does one thing (cursor to a button, click, result), beat 3 resolves.
5. **Camera follows the action:** `camera(tl, '.frame', 'pushIn', at, { intensity: 'soft' })` as the cursor arrives.

## Motion vocabulary
| Moment | Call |
|---|---|
| shell arrives | `enter(tl, '.frame-wrap', 'blurIn' or 'rise', at)` |
| rows and cards fill the shell | `enter(tl, '.row', 'stagger', at, { stagger: 'tight' })` |
| cursor travels to the control | `arcMove(tl, '.simulated-cursor', at, { dx, dy, arc: 'low', pace: 'normal' })` (`src/core/physics.ts`) |
| the click | `emphasize(tl, '.target-btn', 'punch', clickAt)` |
| result appears | `enter(tl, '.result', 'pop' or 'rise', clickAt + 0.1)` |
| shell hands over to the finale | `transition(tl, 'takeover' or 'maskWipe', at, {...})` (selectors in `docs/PRESETS.md`) |
| CTA emphasis | `emphasize(tl, '.cta', 'punch', at)` |

`arcMove` is relative to the current position: park the cursor at its start with CSS and send it by `dx`/`dy`.
It lands `arcSeconds(opts)` later (0.5 s at `pace: 'normal'`); click at that time.

## Scene sketch
```tsx
import { type FC } from 'react';
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { beat, enter, emphasize, camera, holdFinal } from '../../core/presets';
import { arcMove, arcSeconds } from '../../core/physics';
import { getTheme } from '../../core/theme-contract';
import { BackdropField, BrowserFrame, SimulatedCursor } from '../../primitives/curated';

const theme = getTheme('light');
const MOVE = { dx: 520, dy: 140, arc: 'low', pace: 'normal' } as const;
const CURSOR_AT = 1.4;
const CLICK_AT = CURSOR_AT + arcSeconds(MOVE);

export const buildTimeline = (tl: gsap.core.Timeline) => {
  beat(tl, 'open', 0);
  enter(tl, '.frame-wrap', 'blurIn', 0.1);
  enter(tl, '.row', 'stagger', 0.7, { stagger: 'tight' });
  beat(tl, 'act', 1.3);
  arcMove(tl, '.simulated-cursor', CURSOR_AT, MOVE);
  emphasize(tl, '.approve-btn', 'punch', CLICK_AT);
  camera(tl, '.frame-wrap', 'pushIn', CLICK_AT, { intensity: 'soft' });
  beat(tl, 'done', CLICK_AT + 0.6);
  enter(tl, '.done-badge', 'pop', CLICK_AT + 0.7);
  holdFinal(tl, 4.0, 1.2); // 5.2 s video; spec beats start at frames 0, 78, 150
  return tl;
};

export const Scene: FC = () => {
  useRemotionGSAP(buildTimeline);
  const { colors } = theme;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgPrimary, color: colors.textPrimary }}>
      <BackdropField theme={theme} variant="mesh" intensity={0.5} />
      <div className="frame-wrap absolute inset-x-[200px] inset-y-[60px]">
        <BrowserFrame theme={theme} url="app.example.test/invoices" title="Invoices">
          <div className="px-10 py-8 text-[32px]">
            {['Invoice 1041', 'Invoice 1042', 'Invoice 1043'].map((n) => <div key={n} className="row py-3">{n}</div>)}
            <div className="relative mt-6 inline-block">
              <div className="approve-btn rounded-xl px-8 py-4 text-[28px] font-bold" style={{ backgroundColor: colors.accentPrimary, color: colors.bgSurface }}>Approve all</div>
              <div className="done-badge absolute left-full top-0 ml-6 text-[28px]">Approved</div>
            </div>
            <SimulatedCursor color={colors.textPrimary} rippleColor={colors.borderFocus} />
          </div>
        </BrowserFrame>
      </div>
    </AbsoluteFill>
  );
};
export default Scene;
```
The sketch shows the pattern. Position the cursor's start so `dx`/`dy` land on the button, then confirm on the contact sheet.
`holdFinal` end (`at + 1.2`) must not pass the video end; make the spec beats start at the `beat()` frames (T001).

## Common mistakes
Tiny UI text; a shell too small to read; two things moving with no focus; a click without `punch`; a cursor that teleports
(use `arcMove`); animating `width`/`height` of a panel (use scale or a `transition` preset).

## Self-check (contact sheet)
Open `out/<slug>/visual-audit-grid.png`: can you read every label at phone size, is the cursor on the control it clicks,
does the result appear after the click, does the last frame hold? Answer with `evals/VISUAL_RUBRIC.md`.
