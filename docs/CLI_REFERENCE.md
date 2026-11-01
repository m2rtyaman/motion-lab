# CLI Reference — Motion Lab

Motion Lab provides an autonomous suite of developer tools and static linters.

---

## 1. Project Management

### `pnpm new <slug> --mode <mode> [--aspect 9:16 | 16:9] [--duration 6]`
Scaffolds a new project with its `direction.md`, `spec.json`, and `Scene.tsx`, and updates the dynamic registry.

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
- `audit:spec`: Spec continuity and camera gap checks
- `audit:ast`: Babel AST parser detecting illegal layout tweens and banned eases
- `audit:slop`: Zero neon glow, zero micro-font ($\ge 18\text{px}$) enforcement
- `audit:critic`: Prompt 10 Director critic scoring engine
- `audit:glyph`: UTF-8 and Turkish typography glyph integrity
- `tsc --noEmit`: Strict TypeScript compiler check

---

## 3. Audio & Skill Export

### `pnpm music:map <audio-file>`
Analyzes an audio file offline via FFmpeg, calculating frame-by-frame RMS energy ($0.0 - 1.0$), detecting beats and downbeats, and outputting `music_map.json`.

### `pnpm export:skill <slug> [--name <skill-name>]`
Packages any completed video project into a portable `.agent/skills/<name>` bundle containing `SKILL.md`, `STYLE.md`, `MOTION.md`, `PIPELINE.md`, `CHECKLIST.md`, and reference code.

### `pnpm inspect <slug> --t <seconds>`
Renders an exact sub-second frame at full resolution into `out/<slug>/inspect_t<sec>.png` for single-frame debugging.
