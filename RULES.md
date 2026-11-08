# RULES.md

The single canonical rule file for Motion Lab. Every other doc (skills, references, CODEX/AGENTS/CLAUDE, .cursorrules)
is optional reference; if anything conflicts with this file, this file wins. Web search is optional, never required.

## 1. Workflow (harness v2)

1. `pnpm new <slug> --mode <cinematic-world|editorial-ui|kinetic-poster|hybrid-orchestrated> [--aspect 9:16|16:9] [--duration 6]`
   (scaffolds `"harness": 2` with a board per beat; `cinematic-world` gives a `RigCharacter` scene; `--legacy` gives the old layout).
2. Storyboard first (`docs/STORYBOARD.md`): edit `spec.json` beats and write a `board` per beat (focal, zone, start/end key poses, text, transitionIn, why) plus a short `direction.md`.
3. Build the static layout in `Scene.tsx` by copying the closest golden example (section 4); copying and adapting `example-*` / `study-*` is the intended workflow.
4. `pnpm render:poses --project <slug>`, open `out/<slug>/poses/poses-grid.png`, fix the layout against each board. Only then add motion, with presets and rig helpers.
5. `pnpm check --project <slug>` and fix every error (warnings are advice).
6. `pnpm render:contact-sheet --project <slug>`, then open `out/<slug>/visual-audit-grid.png` and look at it (if you can see images).
7. `pnpm render --project <slug>` produces `out/<slug>/<slug>.mp4`.

Definition of Done: check passes with 0 errors, poses and contact sheet reviewed, mp4 rendered.

## 2. Hard rules (only what scripts enforce)

Spec (`audit:spec`, validate-spec.mjs)
- S005 fps must be 60. S006 duration 0-60s. S008/S009 safeZone minimums (9:16: top >= 250, bottom >= 300; 16:9: roughly 30+).
- S020-S026 beats: unique ids, first starts at frame 0, last endFrame equals duration x fps, end >= start.
- S030-S036 camera keyframes (when used): ease must be a GSAP family ease, no long frozen stretch (max 4.5s gap).

Timeline (`audit:timeline`, scripts/timeline-audit.mjs, v2 projects)
- T000 Scene must export `buildTimeline` and it must run in Node.
- T001 every beat has label `beat:<id>` within +-2 frames of its startFrame (use `beat(tl, id, at)`).
- T002 every beat has at least one tween starting inside it (no dead beats).
- T003 `holdFinal(tl, at, 1.2)`: hold:start/hold:end exist, hold >= 1.2s (72 frames at 60fps), ends by video end; only `camera:drift` may move inside it.
- T004 nothing ends after the video end; no infinite repeats.
- T005 no tween on width/height/top/left/right/bottom/margin*/padding*. Use x, y, scale, rotate, opacity, filter.
- T014 error: every selector in `buildTimeline` must match a static `className` or `id` in the JSX that can actually render (JSX inside `{false && ...}`, `null &&`, a literal-false ternary or `const SHOW = false` does not count; warning if only dynamic classNames could). Selectors must be plain `.class` / `#id` / tag (descendant and `>` fine): `:not()`, `[attr]`, `:hover`, `::before` are errors ("use plain class/id selectors"). Pass `className=`, not custom class props. Primitives' generated classes are known (`RigCharacter` makes `<id>-<part>`: `.hero-root`, `.hero-head`).
- T006 warning: under 60% of tweens use presets. T007 warning: more than 8 separate moves start in one beat (a physics helper counts once per target, e.g. `arcMove` x+y = 1), or two different `transition:*` presets overlap. Rig helpers (`rigWalk`, `lookAt`, `react`, `idleBreath`, `turn`) count as one move per call.
- Craft warnings (each message gives numbers, principle, fix and a `docs/MOTION_MATH.md#...` link):
  T008 entrances need `.out` ease, exits `.in`. T009 peak speed > 30 px/f (error: > 80 px/f for > 3 frames; speed = distance / frames x ease peak factor).
  T010 4+ different targets starting within 2 frames: stagger or offset 2-6f. T011 beats equal (+-5%) or < 0.6s / > 3.0s (final beat exempt).
  T012 `linear`/`none` on a > 0.3s transform/opacity tween (not physics/drift/emphasize/loops). T013 non-camera tween > 1.5s (dead time) or < 3 frames (invisible pop).
- Intentional wrong-example demos: `"audit": { "allow": [ { "code": "T012", "reason": "<>= 15 chars>" } ] }` in spec.json; prints `[allowed]`. `audit.allow` only suppresses WARNINGS: an error code (T009 at > 80 px/f, T014, ...) is never suppressed and is reported as "allow ignored for error code X".

Storyboard (`audit:storyboard2`, scripts/storyboard-audit.mjs, v2 projects; docs/STORYBOARD.md)
- SB001 error: every beat needs `board` with focal, zone (3x3), start, end, why. SB002 error: `focal` must match a static `className`/`id` in the JSX.
- SB003 reading time: `1.5s + words/15` for `board.text` (warning if the beat is shorter, error below half). SB004 warning: same focal + zone + no transition in consecutive beats.
- SB005 warning: every `board.text` string must be rendered in Scene.tsx. SB006 warning: final beat has the closing text and its `why` mentions the hold. SB007 warning: start equals end.
  In `eval:score`, SB errors are gate errors; SB warnings cost 2 craft points each (max 8).

Code (`audit:ast`, scripts/ast-lint.mjs)
- V2-001 export `buildTimeline` and call `useRemotionGSAP(buildTimeline)`.
- V2-002 imports only from react, remotion, gsap, `src/core/*`, `src/primitives/curated` (+ `src/primitives/characters/RigCharacter`), or your own project folder. Never import legacy primitives from `src/primitives/index.ts`.
- V2-003 at most 2 locally defined components, each <= 40 lines.
- V2-008..V2-012 `components/*.tsx` (optional folder): flat, max 6 files, each <= 120 lines, export only components and types, never import Scene; presentational only (no gsap, `useCurrentFrame`, `interpolate`, `spring`, timers, random or env sniffing), text >= 18px, no raw colors (take them from the `theme` prop; raw hex only in a project-local `palette.ts`), every exported component forwards `className` to its root. Animate only in `Scene.tsx` `buildTimeline`; selectors target classNames the components render (static or passed via `className`). Recipes: `docs/COMPONENT_RECIPES.md`.
- V2-004 no direct `gsap.to/from/fromTo/set/timeline`; use `tl` or preset functions.
- V2-005 do not animate in React: no `spring`, no `interpolate`/`useCurrentFrame` for style, props or showing/hiding. A frame-driven number may only be text.
- V2-006 no environment sniffing in any project file: `window`, `document`, `globalThis`, `self`, `top`, `parent`, `frames`, `opener`, `process`, `navigator`, `location`, `performance`, `Function(`, `eval(`, `Reflect`, DOM climbing (`.ownerDocument`, `.parentNode`, `.constructor` ...), any `__*` name, Remotion's `getRemotionEnvironment` / `getInputProps`, `typeof` of any of them, `import.meta.env` (the scene must be a pure function of the frame; the audits, the probe and the real render must see the same scene). A local variable that merely shares a name (`parent`, `top`) is fine.
- V2-013 a v2 project folder holds only `Scene.tsx`, `spec.json`, `direction.md`, `components/*.tsx`, an optional `palette.ts` and an optional `assets/` folder of png/jpg/webp/gif/avif images. Any other file (.js/.jsx/.mjs/.cjs/.json/.css/.svg, dotfiles, other folders, symlinks) is an error; every allowed source file is linted, counted in the size limits and part of the C001 source.
- V2-007 no import or re-export from `evals/` in any project file; V2-002 (import allowlist) also covers the project's helper files and `export ... from`.
- Never edit `scripts/`, `evals/`, `docs/`, `src/core`, `src/primitives`, `src/remotion`, `specs/`, `.githooks/`, `package.json`, `tsconfig.json`, `RULES.md`, `src/index.css`, `public/`, `src/engine`, `src/stage`, `src/components-v5`, the build configs (vite/tailwind/postcss/remotion) or the public `example-*` / `study-*` projects (TAMPERED = 0). Do not copy `evals/solutions` (C001: Babel-normalised 5-gram similarity of the WHOLE project folder; renamed identifiers/strings and wrapper files do not help; adapting the pinned public examples/studies is fine).
- Eval projects set `"evalModel": "<the model building it>"` in spec.json (used to stop a model judging its own pictures).
- A001 duration/stagger/delay must be 0.01-10s or a token. A002 no `ease`/`easeInOut`-style eases; allowed: none, linear, steps(N), power1-4/expo/circ/sine/back/quart/quint/cubic/elastic with .in/.out/.inOut.
- A003 no top/left/right/bottom/margin/padding in tweens. A004 no `Math.random`, `Date.now`, `new Date`, `setTimeout`, `setInterval`, `requestAnimationFrame`.
- A005 no CSS `transition`/`animation` in JSX style. A006 spring damping >= 10; use `SPRING` from `src/core/tokens.ts`.

Slop (`audit:slop`, scripts/slop-linter.mjs)
- No system emoji in scenes (draw with svg). No raw neon `#00ffff` / `#ff00ff` or cyan/magenta glow shadows.
- No micro-fonts: `text-xs`, `text-sm`, `text-[8..14px]` are rejected; use 18px or larger.
- No mascot/cartoon identifiers (`mustache`, `anchor-eyes`...), no meta-text such as "kinetic geometry" as on-screen copy.

Browser probe (`scripts/browser-probe.mjs`, real headless Chrome; `pnpm eval:score` runs it by default, `--no-probe` caps the score at 70 as "unverified")
- P001 error a timeline target is never visible. P002 error claimed motion is not visible in the DOM. P003 error the page throws or never renders. P006 error the browser timeline differs from the Node timeline.
- P004 warning low contrast (error when it paints nothing or is below 1.5:1), P007 warning text under 18px or clipped, P008 error the closing focal element is missing at some sample of the hold, P009 error text that is on screen in only some samples of the final hold. P005 (info) lists the text that is on screen AND painted (pixel-checked after overlays, blend modes, clip-paths) at EVERY sample (every 6 frames) of the final hold; the closing-hold check uses exactly that set.
- P001 also needs the target visible (in the frame, unclipped by overflow ancestors, unoccluded, painted) in >= 80% of the samples inside each of its motion windows (exits, backgrounds and nested rig parts excepted); the `targetVisible` check demands >= 80% of every beat in which the ball / jumper / walker moves. T003 also rejects `tl.set` / zero-duration tweens that change opacity, visibility, display or position inside the hold.
- The probe renders the scene exactly like the final render (composition id = slug, no `window.__*` globals, its helpers run in an isolated JS world) and refuses any browser that is not Chrome, Edge or chrome-headless-shell; the executable and version are recorded in the result.
- Every score prints the flags used. `--dev`, `--skip-integrity` and `--no-probe` mark it NOT VALID FOR COMPARISON; the visual score is recomputed from the answers and the rubric on every run, and the contact sheet / poses grid must carry the signed `out/<slug>/render-manifest.json` written by `pnpm render:contact-sheet` / `pnpm render:poses`.
- Without the probe the static fallbacks apply (text in attributes, dead branches, inline-hidden elements and tweens that hide at the hold are not on screen) and `tsc --noEmit` over the project must pass (G003).

Other audits (`audit:craft`, `audit:critic`, `audit:motion`, `audit:storyboard`) apply their keyword rules to legacy projects only; v2 projects skip them.

## 3. Craft guidelines (soft)

- One focal point at a time; fewer effects done well beats many.
- Type is readable: 18px or larger, strong contrast, inside the safe zone.
- Vary beat lengths (roughly 1-2.5s); change focus, camera or depth about every beat. No equal-length drumbeat.
- Keep one hero element on screen across beats instead of cutting between unrelated scenes.
- Final message/logo/CTA sits still for the full 1.2s hold.
- No fake telemetry, lorem ipsum, or placeholder copy; write real, short text.
- Do not imitate a real brand's UI or logo unless the user supplies the assets.
- Everything must be a pure function of the frame: seeded randomness only (Mulberry32 / `seed`).

## 4. When stuck

- Pick a preset from `docs/PRESETS.md` (`src/core/presets.ts`). Do not hand-write tweens or invent easing numbers.
- Need the why behind a number (easing curves, spring damping, overlap, px/frame, beat plans)? Read `docs/MOTION_MATH.md` (generated from the code).
- Need a classic animation principle (squash & stretch, anticipation, overlap, arcs, rhythm, walk) as working code? `docs/ANIMATION_STUDIES.md` (scenes `src/projects/study-*`, helpers `src/core/physics.ts`).
- Character timing, poses and weight (walk/run frame counts, drag per joint, holds, SPRING mapping)? `docs/CHARACTER_ANIMATION.md`. Characters: use `RigCharacter` (`src/primitives`) with the rig helpers `rigWalk`, `lookAt`, `react`, `idleBreath`, `turn` from `src/core/physics.ts`; don't put your own tweens on rig parts.
- Layout, order and key poses before motion? `docs/STORYBOARD.md`.
- Pictures of every usable primitive: `docs/COMPONENT_GALLERY.md`; type/spacing/contrast numbers: `docs/DESIGN_SYSTEM.md`; how to design cards, rows, charts, buttons, toasts, CTA cards, app windows (BAD/GOOD pairs): `docs/COMPONENT_RECIPES.md`. Shells: wrap in `UI_SCALE.recommendedZoom[0]` and counter-zoom the content (see `example-product-ui`). Do not use `emphasize` glint on a decorative overlay; punch the real element.
- Durations/springs come from `src/core/tokens.ts` and `recipes.ts`.
- Golden examples (copy one):
  - `src/projects/example-kinetic-type`: headline-driven kinetic type piece.
  - `src/projects/example-product-ui`: product UI close-up inside an anchored app shell.
  - `src/projects/example-logo-sting`: short 16:9 logo sting ending in the 1.2s hold.
  - `src/projects/example-editorial-data`: 16:9 data story (one stat, chart that builds, takeaway), `components/` folder.
  - `src/projects/example-social-promo`: 9:16 promo, `RigCharacter` reacting to a UI card and toast.
  - `src/projects/example-feature-tour`: 16:9, three features in one app window with camera moves (cause then effect).
- Run `pnpm audit:doctor` if the toolchain misbehaves. `CHECK_FAST=1 pnpm check` skips the cheat fixtures; `CHECK_PROBE=1` adds the browser-probe tests.
