# CLI Reference — Motion Lab

Motion Lab provides an autonomous suite of developer tools and static linters.

---

## 1. Project Management

### `pnpm new <slug> --mode <mode> [--aspect 9:16 | 16:9] [--duration 6] [--theme <surfaceMode>]`
Scaffolds a new project with its `direction.md`, `spec.json`, and `Scene.tsx`, and updates the dynamic registry.

- `--theme` selects the visual identity: `light` | `dark` | `vibrant-brand` | `editorial-warm` | `kinetic-acid` | `technical-drafting`. Defaults: `editorial-ui` -> `light`, `kinetic-poster` -> `editorial-warm`, `cinematic-world` -> `dark`.
- `editorial-ui` and `kinetic-poster` scaffolds ship **layered, always-mounted beats**, a real transition at every beat boundary (`spec.transitions`), uneven beat lengths and theme-driven colors. They pass `pnpm check` out of the box; you replace the placeholder copy and compositions.
- `cinematic-world` scaffolds declare `"continuousShot": true` (single take, camera carries beat changes).

### `pnpm studio:brief <slug> --topic "<topic>" --goal "<goal>"`
Generates an Opus 7-part director brief and motion timeline contract for the project.

---

## 2. Diagnostics & Quality Gates

### `pnpm doctor [--project <slug>]`
Runs the 14-point medical health audit derived from the Opus Troubleshooting Matrix.
Detects:
- Missing single-sentence direction goals
- Broken container continuity
- Elastic bounce easing
- Short beats under 1.2 seconds
- Missing anticipatory stillness pauses
- Non-deterministic `Math.random`
- Missing contact sheets

### `pnpm gate [--project <slug>]`
The definitive 7-point Pre-Render Quality Gate. Requires 7/7 passing checks before commercial delivery:
1. Valid spec.json contract
2. Single-sentence goal defined
3. Storyboard beats synchronized with code
4. Contact sheet (`visual-audit-grid.png`) audited
5. Opus Critic Director score $\ge 8.0/10$
6. Deterministic MP4 rendered to disk
7. AI agent skill template ready

### `pnpm check [--project <slug>]`
Runs the full static audit suite:
- `audit:skills`: Verifies all 20 mandatory AI agent skills are active and intact
- `audit:spec`: Spec continuity and camera gap checks
- `audit:storyboard`: Shift-left storyboard and motion director rhythm checks
- `audit:ast`: Babel AST parser detecting illegal layout tweens and banned eases
- `audit:motion`: **slideshow detector** - requires a transition at every beat boundary (M001/M004), forbids beat-gated unmounts such as `{isBeat && <X/>}` (M002), requires 2+ distinct transition types for 3+ beats (M003), and warns on missing theme contract (M005/M006). Projects marked `"legacy": true` in `spec.json` get warnings instead of errors.
- `audit:slop`: Zero neon glow, zero micro-font ($\ge 18\text{px}$) enforcement, and fake DevOps jargon bans
- `audit:craft`: Motion Studio v5.0 craft & adversarial visual gate
- `audit:critic`: Dynamic reading time calculation and comparison hold audit
- `audit:glyph`: UTF-8 and Turkish typography glyph integrity
- `test:math`: Runs 14 core mathematical unit tests (springs, Bézier, homography, readability, print-grade, audio guard)
- `test:templates`: Verifies all 23 production templates and bridges
- `tsc --noEmit`: Strict TypeScript compiler check

### `pnpm render:contact-sheet --project <slug>`
Extracts keyframes from beat boundaries and generates a 4x4 visual audit grid (`out/<slug>/visual-audit-grid.png`) for adversarial review.

---

## 3. Audio & Skill Export

### `pnpm music:map <audio-file>`
Analyzes an audio file offline via FFmpeg, calculating frame-by-frame RMS energy ($0.0 - 1.0$), detecting beats and downbeats, and outputting `music_map.json`.

### `pnpm export:skill <slug> [--name <skill-name>]`
Packages any completed video project into a portable `.agent/skills/<name>` bundle containing `SKILL.md`, `STYLE.md`, `MOTION.md`, `PIPELINE.md`, `CHECKLIST.md`, and reference code.

### `pnpm inspect <slug> --t <seconds>`
Renders an exact sub-second frame at full resolution into `out/<slug>/inspect_t<sec>.png` for single-frame debugging.
