# Changelog

All notable changes to Motion Lab are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Because Motion Lab is still pre-1.0, minor releases may contain breaking changes.
See [Versioning](#versioning) for the compatibility policy.

---

## [0.9.0] — 2026-11-08 — Pre-release

Harness v2: a rule, preset and grading system designed so that mid-size models
(Gemini Flash, DeepSeek) can produce good motion graphics without taking
shortcuts. Projects opt in with `"harness": 2` in `spec.json`; `pnpm new` now
scaffolds v2 by default (`--legacy` keeps the old layout).

> **Pre-release notice:** `0.9.0` is still pre-1.0. Legacy projects keep
> working; the v2 audits, preset API, and eval scoring may change before `1.0.0`.

### Added

- **Motion vocabulary:** `src/core/presets.ts` (`beat`, `enter`, `exit`,
  `emphasize`, `camera`, `transition`, `holdFinal`) and `src/core/physics.ts`
  (bounce, anticipate, follow-through, arcs, walk cycle, `RigCharacter`
  helpers), documented in `docs/PRESETS.md`.
- **Teaching docs:** `docs/MOTION_MATH.md` (generated from the code),
  `docs/ANIMATION_STUDIES.md`, `docs/CHARACTER_ANIMATION.md`,
  `docs/STORYBOARD.md`, `docs/DESIGN_SYSTEM.md` (generated),
  `docs/COMPONENT_GALLERY.md`, `docs/COMPONENT_RECIPES.md`, and
  `references/measured/` (timing statistics measured from 33 reference clips).
- **`RigCharacter`:** a jointed vector character with foot-planted walk, idle
  breath, look-at, and reaction helpers.
- **Behavior-based audits:** `timeline-audit` (T000-T014), `storyboard-audit`
  (SB001-SB007), v2 `ast-lint` rules (V2-001 to V2-013), and a headless-Chrome
  DOM probe (`scripts/browser-probe.mjs`, P001-P009) that checks what is
  actually visible on screen.
- **Storyboards:** per-beat `board` cards in `spec.json` and
  `pnpm render:poses` for key-pose stills before motion is added.
- **Curated primitives:** `src/primitives/curated.ts` (26 verified components
  with a thumbnail gallery); the legacy primitives are marked `@deprecated`.
- **Examples and studies:** six golden examples (`example-*`) and seven
  animation studies (`study-*`), all passing the full gate.
- **Evals:** eight graded tasks, a scorer (`pnpm eval:score`), a visual rubric
  with hash-bound answers, reference solutions, and an integrity lock
  (`evals/harness.lock.json`).

### Changed

- **Rules:** `RULES.md` is the single canonical rule file. `CLAUDE.md`,
  `AGENTS.md`, `CODEX.md`, `.cursorrules`, and `.cursor/rules/motion-lab.mdc`
  are short pointers to it.
- **Skills:** 21 studio skills were consolidated into 6 maintained skills; the
  rest moved to `.agent/skills-archive/` and `references/archive/`.
- **Audit messages:** the Turkish user-facing messages in `scripts/` are now
  English, with the exact expected and actual values.
- **Calibration:** settle-time and speed guidance now follows the measured
  reference data.

### Removed

- The mandatory web-search gate, the blueprint-before-code rule, and keyword
  presence checks for v2 projects (replaced by behavior checks).

---

## [0.8.0] — 2026-11-05 — Pre-release

The first tagged release of Motion Lab. It consolidates the deterministic
motion engine, the 23-template library, the 20 studio skills, and the
multi-layer quality gate into a single, reproducible baseline.

> **Pre-release notice:** `0.8.0` is not a final, stable release. The motion
> contract schemas, CLI flags, primitive APIs, and rendered output may change
> before `1.0.0`. Pin an exact commit if you depend on byte-identical renders.

### Added

- `CHANGELOG.md` with release history.
- `NOTICE` documenting the project copyright, the third-party components, and
  the license boundary between original and upstream code.
- `src/templates/LICENSES/Apache-2.0.txt` so Apache-2.0 template notices travel
  with the redistributed files.
- Version metadata in `package.json` (`0.8.0`), an explicit `engines.node`
  requirement (`>=22`), and a `webpack` override that keeps the Remotion bundler
  on a patched release.

### Changed

- **Branding:** every `Opus` reference is now `Motion Lab`; version suffixes such
  as `5.5` were removed from names, documentation, and banners.
- **Identifiers:** `OPUS_LIBRARY_ECOSYSTEM` → `MOTION_LAB_LIBRARY_ECOSYSTEM`,
  `opusStageGrain` → `motionLabStageGrain`, `opus-paper-fibers` →
  `motionlab-paper-fibers`.
- **Paths:** `references/OPUS_5.5_STYLE_GUIDE.md` →
  `references/MOTION_LAB_STYLE_GUIDE.md`; the `opus-aoe2` example set →
  `motionlab-aoe2`, including `01-motionlab-drop.html`.
- **Version labels:** engine, linter, and craft-gate banners now report `v0.8`
  instead of `v4.0`/`v5.0`/`v5.5`/`v6.2`.
- **License:** relicensed from MIT to **GPL-3.0-only**. Releases before `0.8.0`
  remain available under MIT.
- **README:** rewritten for precision — no marketing claims, no fabricated
  metrics, no decorative emoji; every capability maps to a command or a file.
- **Toolchain:** dependencies raised to their current releases — Remotion
  `4.0.541`, GSAP `3.15.1`, Motion `14.9.1`, Tailwind CSS `4.3.4`, Vite plugin
  React `6.2.1`, Babel parser `8.1.0`, Lucide `1.68.0`, and `@types/node`
  `26.6.6`. CI moved to Node 26 LTS, pnpm 12, `actions/checkout@v7`,
  `actions/setup-node@v7`, and `pnpm/action-setup@v6`.

### Removed

- Dead meta-slogan lint rules that referenced the previous brand name. They were
  replaced with equivalent, brand-agnostic guards for debug watermarks
  (`MOTION LAB // 60 FPS`) and versioned suite slogans.

### Fixed

- Awkward artifacts left by the rename (`an Motion Lab`, `Motion Lab Max`,
  `Motion Lab 5.5`) and the style-guide title.

---

## Versioning

Motion Lab follows Semantic Versioning:

| Range | Meaning |
| --- | --- |
| `0.8.x` | Pre-release patch: fixes only; render output is expected to be stable within the line. |
| `0.x.0` | Pre-release minor: may include breaking changes to schemas, APIs, or CLI flags. |
| `1.0.0` | First stable release; the motion contract and public APIs are frozen for the major line. |

Git tags use the `v` prefix (`v0.8.0`). GitHub Releases for `0.x` versions are
published as **pre-releases** until `1.0.0`.

---

[0.9.0]: https://github.com/m2rtyaman/motion-lab/releases/tag/v0.9.0
[0.8.0]: https://github.com/m2rtyaman/motion-lab/releases/tag/v0.8.0
