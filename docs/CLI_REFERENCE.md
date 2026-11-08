# CLI Reference — Motion Lab (v0.9)

Every script in `package.json`, grouped by purpose. Most project-scoped scripts take `--project <slug>` (also `-p <slug>`, or the `STUDIO_PROJECT` environment variable); without it they act on every project (some also accept `--all`). The canonical rules are in [`RULES.md`](../RULES.md); this file only says how to run things.

Audits marked "v2" run on projects whose `spec.json` has `"harness": 2`; the others skip them or apply their legacy rules.

---

## 1. Project management

### `pnpm new <slug> --mode <mode> [--aspect 9:16 | 16:9] [--duration 6] [--theme <surfaceMode>] [--title "<title>"] [--legacy]`
Scaffolds a project and updates the generated registry.

- `--mode`: `editorial-ui` (default), `kinetic-poster`, `hybrid-orchestrated`, `cinematic-world`.
- Default scaffold is **harness v2**: `spec.json` with `"harness": 2` and a `board` per beat, a short `direction.md`, and a `Scene.tsx` that exports `buildTimeline`. It passes `pnpm check` without edits. The v2 scaffold needs `--duration` of at least 5 seconds (3 beats plus the 1.2 s final hold); `cinematic-world` scaffolds a `RigCharacter` scene and needs a longer clip (the script prints the minimum).
- `--legacy` produces the old layout (no boards, legacy audits).
- `--theme`: `light` | `dark` | `vibrant-brand` | `editorial-warm` | `kinetic-acid` | `technical-drafting`.

### `pnpm registry`
Regenerates `src/projects/registry.generated.ts` from the project folders. `pnpm check` runs it first. Never hand-edit that file.

### `pnpm studio:brief <slug> --topic "<topic>" --goal "<goal>" [--mode <mode>] [--aspect <ratio>] [--duration <s>]`
Generates a 7-part director brief for a project (legacy workflow; v2 projects use boards in `spec.json`).

### `pnpm studio` / `studio:init` / `studio:next` / `studio:check` / `studio:run`
Multi-project pipeline orchestrator (`node scripts/studio.mjs <command>`). State lives in `.studio/<slug>/state.json`. Commands: `init "<brief>"`, `status` (default for `pnpm studio`), `next`, `check [stage]`, `run`. Stages: direction, spec, code, vision, render. Legacy workflow.

---

## 2. Quality gate

### `pnpm check [--project <slug>]`
The single entry point. Runs, in order, and stops at the first failure:

1. Registry refresh (`scripts/gen-registry.mjs`).
2. Skills audit (`scripts/audit-skills.mjs`): the 6 maintained skills in `.agent/skills/` (the archive is not read).
3. `audit:spec`.
4. `audit:storyboard2` (v2).
5. `audit:storyboard` (legacy).
6. `audit:ast`.
7. `audit:timeline` (v2).
8. `audit:motion`, `audit:slop`, `audit:craft`, `audit:visual`, `audit:critic`, `audit:glyph`.
9. Unit tests: core math (`scripts/test-math-core.mjs`), `test:presets`, `test:physics`, `test:timeline`.
10. `test:evals` scorer self-test (the cheat fixtures are skipped with `CHECK_FAST=1`).
11. Optional browser-probe fixture tests (`CHECK_PROBE=1`).
12. Template audit (`audit:templates`).
13. Freshness of `docs/MOTION_MATH.md` (`docs:math --check`) and `docs/DESIGN_SYSTEM.md` (`docs:design --check`).
14. `tsc --noEmit`.

Environment flags:

| Variable | Effect |
| --- | --- |
| `CHECK_FAST=1` | Skip the eval anti-cheat fixtures (`scripts/test-evals-cheats.mjs`, about one minute). |
| `CHECK_PROBE=1` | Also run the browser-probe fixture tests (`scripts/test-browser-probe.mjs`, needs Chrome, about one minute). |

### Individual audits
All accept `--project <slug>`.

| Script | Applies to | Checks |
| --- | --- | --- |
| `pnpm audit:spec` | all | `spec.json`: fps 60, duration, safe zones, beat continuity, camera keyframes (S0xx). |
| `pnpm audit:storyboard2` | v2 | Boards (SB001-SB007): board per beat, focal exists in JSX, reading time, rendered text, final-hold text. |
| `pnpm audit:storyboard` | legacy | Shift-left storyboard and rhythm checks. |
| `pnpm audit:ast` | all, V2 rules for v2 | Babel AST lint: imports, direct `gsap.*`, React animation, environment sniffing, component limits (V2-0xx); durations, eases, determinism (A0xx). |
| `pnpm audit:timeline` | v2 | Runs `buildTimeline` through `tsx` and checks T000-T014 (beat labels, dead beats, final hold, selectors, speed, easing, rhythm). |
| `pnpm audit:motion` | legacy | Slideshow detector: transitions at every boundary, beat unmounts. |
| `pnpm audit:slop` | all | Neon palettes, micro-type (under 18 px), emoji, fake telemetry. |
| `pnpm audit:craft` | legacy | Motion Studio v0.9 craft and determinism gate: spring physics, CSS 3D/SVG purity, stage anchoring. |
| `pnpm audit:visual` | all | Frame evidence from `out/`: blank or dead frames, `vision-notes.md`. |
| `pnpm audit:critic` | legacy | Reading-time holds, dead frames, director score. |
| `pnpm audit:glyph` | all | UTF-8 and Turkish typography glyph integrity. |
| `pnpm audit:templates` | repo | Verifies the 23 templates in the catalog and the time-driver bridge. |
| `pnpm audit:doctor` / `pnpm doctor` / `pnpm studio:doctor` | repo, per project | 14-point health audit (same script `scripts/studio-doctor.mjs`); prints diagnoses with prescriptions. |
| `pnpm gate [--project <slug>]` | per project | 7-point pre-render checklist (spec, goal, storyboard, contact sheet, critic, MP4, skills); in CI the contact-sheet check falls back to code consistency because `out/` is git-ignored. |

### `pnpm probe --project <slug>` (or `--dir <folder>`)
Browser probe (`scripts/browser-probe.mjs`): renders the composition in real headless Chrome and checks the real DOM at sampled frames (P001-P009: target never visible, motion not visible, page throws, low contrast, text under 18 px or clipped, closing hold). Takes about 15 to 40 seconds per project. Options: `--json`, `--samples N` (default 180), `--keep`, `--watch-text <selector>`. Browser: `REMOTION_BROWSER_EXECUTABLE`, else Remotion's `chrome-headless-shell`, else a local Chrome or Edge; other browsers are refused.

### Test scripts
| Script | What it runs |
| --- | --- |
| `pnpm test:presets` | Preset unit tests (`src/core/presets.ts`), via `tsx`. |
| `pnpm test:physics` | Physics helper tests (`src/core/physics.ts`), via `tsx`. |
| `pnpm test:timeline` | Fixture tests for the timeline audit. |
| `pnpm test:evals` | Scorer self-test (reference solutions and the weak fixture) plus the anti-cheat fixtures (`test-evals-cheats.mjs`). Static heuristics by default; `EVAL_TEST_PROBE=1` scores solutions with the real probe. |
| `pnpm test:probe` | Browser-probe fixture tests (needs Chrome). |
| `pnpm test:harvest` | Python tests for the harvesters (needs `uv`). |

---

## 3. Evals

Graded exercises; see [`evals/README.md`](../evals/README.md).

| Script | What it does |
| --- | --- |
| `pnpm eval:score --task <id> --project <slug>` | Scores a project 0-100 (gate, craft, rubric, hygiene, copy) and writes `out/evals/<slug>.json`. Flags: `--dir <folder>`, `--json`, `--no-write`, `--no-probe` (caps at 70, unverified), `--render`, `--tasks-dir <path>`, `--dev`, `--skip-integrity`. |
| `pnpm eval:all` | Scores every `src/projects/eval-*` project whose spec has `evalTask` and writes a leaderboard. |
| `pnpm eval:visual` | Visual rubric: prints the prompt and image hashes for a vision model; with `--answers <file> --judge <name>` records the visual score. Needs the contact sheet. |
| `pnpm eval:lock` | Rewrites `evals/harness.lock.json`. **Harness maintainers only**; never during an evaluated run. See [`CONTRIBUTING.md`](../CONTRIBUTING.md). |

---

## 4. Rendering and inspection

| Script | What it does |
| --- | --- |
| `pnpm render:poses --project <slug> [--scale 0.5]` | Key-pose stills at the start and end of every beat: `out/<slug>/poses/<beat>-start.png`, `<beat>-end.png`, `poses-grid.png`, plus a signed `render-manifest.json`. Run before adding motion. |
| `pnpm render:contact-sheet --project <slug>` | `out/<slug>/visual-audit-grid.png` and `out/<slug>/vision/` frames from the beat boundaries, plus `render-manifest.json`. |
| `pnpm render [--project <slug>] [--all]` | Builds CSS, runs `pnpm check`, renders `out/<slug>/<slug>.mp4`. |
| `pnpm inspect <slug> [--t <seconds> \| --frame <n>]` | Renders one exact frame to `out/<slug>/inspection/frame_<n>.png` and reports the beat, camera and text at that moment. |
| `pnpm studio:preview` | Remotion preview (`remotion preview src/remotion/index.ts`). |
| `pnpm render:still`, `render:broll`, `render:showreel`, `render:arena` | Fixed-target legacy renders of `single-container-broll`, `kinetic-loud-showreel`, `dwarf-arena` (they run `pnpm check` first, except `render:still`). |

`render:poses`, `render:contact-sheet` and `render` build the Tailwind CSS themselves first.

### Dev and build
| Script | What it does |
| --- | --- |
| `pnpm dev` / `pnpm preview` | Vite dev server / preview of the web app. |
| `pnpm build` | `tsc && vite build`. |
| `pnpm build:css` | Compiles Tailwind to `src/output.css`. |
| `pnpm prepare` | Runs on install: sets `core.hooksPath` to `.githooks`. |

---

## 5. Documentation and references

| Script | What it does |
| --- | --- |
| `pnpm docs:math` | Regenerates `docs/MOTION_MATH.md` from the code (`--check` verifies it is current). |
| `pnpm docs:design` | Regenerates `docs/DESIGN_SYSTEM.md` from the code (`--check` verifies it is current). |
| `pnpm ref:measure <video.mp4> [--out result.json] [--series] [--meta '{...}']` | Derives timing statistics (numbers only) from one reference video via ffmpeg; the results in `references/measured/` were made this way. |
| `pnpm gen:manifest` | Regenerates `src/templates/html-manifest.generated.ts`. |
| `node scripts/gallery.mjs [--thumbs] [--only A,B]` | Renders the component gallery (`src/projects/zz-gallery`); `--thumbs` writes `docs/gallery/<Primitive>.png`. Not a pnpm script. |

Do not hand-edit `docs/MOTION_MATH.md` or `docs/DESIGN_SYSTEM.md`.

---

## 6. Audio, harvesting and skill export

| Script | What it does |
| --- | --- |
| `pnpm music:map <audio-file \| slug> [--fps 60] [--out music_map.json]` | Offline analysis: per-frame RMS energy, beats, downbeats, peaks, written to `music_map.json`. |
| `pnpm harvest`, `harvest:voice`, `harvest:broll` | Keyless asset harvesters (EdgeTTS voice timings, local B-roll) via `uv run scripts/harvest/*.py`; see `.agent/skills/asset-harvester/SKILL.md`. |
| `pnpm export:skill <slug> [--name <skill-name>]` | Packages a finished project into a portable `.agent/skills/<name>` bundle. Legacy: the skills audit warns about any `.agent/skills/` folder that is not one of the six maintained skills, so move exported bundles elsewhere. |
