# Contribution & Pull Request (PR) Guidelines — Motion Lab

Motion Lab is an open-source motion graphics studio producing deterministic, broadcast-grade 60 FPS video content. To maintain codebase integrity, mathematical determinism, and frame-rate precision, the following standards are **strictly enforced without exception**.

[`RULES.md`](RULES.md) is the canonical rule file for scenes (harness v2). If any other document disagrees with it, `RULES.md` wins.

---

## 1. Principle: Never Push Directly to 'main'

**The `main` branch is always kept production-ready and render-verifiable.**
Direct pushes to `main` are blocked by both local git hooks (`.githooks/pre-push`) and repository branch protection policies.

### Standard Branch Workflow
All development work must be performed on an isolated feature branch:

```bash
# For a new scene or feature:
git checkout -b feat/your-feature-name

# For a bug fix:
git checkout -b fix/your-fix-name

# For documentation or guidelines:
git checkout -b docs/your-topic-name
```

---

## 2. Branch Naming Conventions

Branch names must use only lowercase alphanumeric characters and hyphens (`-`):
- `feat/<project-or-feature>` (e.g. `feat/brand-promo`, `feat/tesseract-wireframe`)
- `scene/<slug>` (e.g. `scene/fintech-dashboard`)
- `fix/<issue>` (e.g. `fix/audio-sync-drift`)
- `docs/<topic>` (e.g. `docs/pr-guidelines`)
- `chore/<task>` (e.g. `chore/deps-update`)

---

## 3. Commit Message Standards (Conventional Commits)

Commit messages must be concise, descriptive, and follow the conventional commit format:
- `feat(slug): add new animation scene or primitive`
- `fix(core): resolve audio synchronization drift`
- `perf(ast): optimize AST parser scanning engine`
- `docs(readme): update architecture diagram and guide`
- `chore(deps): update project dependencies`

The `pre-commit` hook runs `pnpm check`, so a commit fails when the gate fails.

---

## 4. Definition of Done (DoD) & Quality Gates

Before a Pull Request is eligible for review and merge into `main`, these steps are mandatory:

### 1. `pnpm check` (Quality Gate)
`pnpm check [--project <slug>]` must finish with 0 errors. It runs, in order: the registry refresh, the skills audit (`audit-skills`), `audit:spec`, `audit:storyboard2` (SB001-SB007), `audit:storyboard`, `audit:ast`, `audit:timeline` (T000-T014), `audit:motion`, `audit:slop`, `audit:craft`, `audit:visual`, `audit:critic`, `audit:glyph`, the unit tests (math, presets, physics, timeline-audit fixtures), the eval scorer self-test, the template audit, the freshness checks of `docs/MOTION_MATH.md` and `docs/DESIGN_SYSTEM.md`, and `tsc --noEmit`.

Environment flags:
- `CHECK_FAST=1` skips the eval anti-cheat fixtures (`scripts/test-evals-cheats.mjs`, about one minute). Use it for quick local loops; run the full gate before opening a PR.
- `CHECK_PROBE=1` adds the browser-probe fixture tests (`pnpm test:probe`). They need Chrome, Edge or chrome-headless-shell (set `REMOTION_BROWSER_EXECUTABLE` to choose one). Run them when you change `scripts/browser-probe.mjs` or `scripts/lib/probe-*`.

For a scene, also run the browser probe: `pnpm probe --project <slug>` (P001-P009).

### 2. Studio Health Diagnostic
`pnpm audit:doctor` (legacy 14-point heuristics; diagnoses are advice, it should not crash).

### 3. Storyboard poses and contact sheet
For a new or changed scene:
```bash
pnpm render:poses --project <slug>           # out/<slug>/poses/poses-grid.png
pnpm render:contact-sheet --project <slug>   # out/<slug>/visual-audit-grid.png
```
Open both images and review them against the boards in `spec.json` and the generic block of [`evals/VISUAL_RUBRIC.md`](evals/VISUAL_RUBRIC.md). Do not commit `out/`.

### 4. Physical MP4 Render Verification
`pnpm render --project <slug>` must produce `out/<slug>/<slug>.mp4`.

---

## 5. Working in the v2 harness

### New or changed scene
1. `pnpm new <slug> --mode <editorial-ui|kinetic-poster|hybrid-orchestrated|cinematic-world>` (add `--legacy` only to maintain old-layout projects).
2. Boards first (`docs/STORYBOARD.md`), then the static layout, then `pnpm render:poses`, then motion with presets from `docs/PRESETS.md`.
3. Import primitives only from `src/primitives/curated` (plus `characters/RigCharacter`), `src/core/*`, react, remotion and gsap; no direct `gsap.*` calls.

### Protected files and the integrity lock
`evals/harness.lock.json` pins the SHA-256 of every file a model under test must not edit: `scripts/`, `src/core`, `src/primitives`, `src/remotion`, `src/engine`, `src/stage`, `src/components-v5`, the other `src/` folders that the curated primitives import, `src/index.css`, `public/`, `specs/`, `docs/`, `.githooks/`, `RULES.md`, `package.json`, `tsconfig.json`, the build configs, `evals/tasks`, `evals/solutions`, `evals/judges.json`, `evals/VISUAL_RUBRIC.md`, and the pinned public `example-*` / `study-*` projects. `pnpm eval:score` reports `TAMPERED` (score 0) when a pinned file differs from the lock, or when the lock differs from git HEAD.

Consequences for a PR:
- If you change a protected file on purpose (engine, scripts, docs, a golden example, a task), the lock must be regenerated with `pnpm eval:lock` and committed together with the change.
- **`pnpm eval:lock` is for harness maintainers only.** Never run it as part of an evaluated model run, and do not run it to silence a TAMPERED result you do not understand. If you are not a maintainer, say in the PR that the lock needs regenerating and leave the lock untouched.
- A new `example-*` or `study-*` project only counts as a pinned public project after a maintainer re-pins the lock.

### Generated docs
`docs/MOTION_MATH.md` and `docs/DESIGN_SYSTEM.md` are generated from the code and `pnpm check` fails when they are stale. After changing `src/core` tokens, recipes, presets or physics:

```bash
pnpm docs:math      # regenerates docs/MOTION_MATH.md
pnpm docs:design    # regenerates docs/DESIGN_SYSTEM.md
```

Do not hand-edit those two files. `docs/COMPONENT_GALLERY.md` thumbnails are re-rendered with `node scripts/gallery.mjs --thumbs`.

### Adding a primitive
1. Build the component under `src/primitives/<group>/` (it takes a `className`, draws text of 18 px or larger at its recommended zoom, and contains no motion, randomness or environment sniffing).
2. Export it from `src/primitives/curated.ts` with a `/** use for: ... */` comment, in the right section.
3. Add it to the gallery project `src/projects/zz-gallery` (and its `manifest.json`), run `node scripts/gallery.mjs --thumbs`, and add its entry (props, use for, not for, minimum sizes) to `docs/COMPONENT_GALLERY.md`.
4. Run `pnpm check`. Because `src/primitives` is protected, a maintainer re-pins the lock (`pnpm eval:lock`).

### Adding an eval task
1. Create `evals/tasks/<id>/TASK.md` (the brief, ending with a "Delivery spec") and `rubric.json` (fields are listed in [`evals/README.md`](evals/README.md)).
2. Add a reference solution in `evals/solutions/<id>/` that reaches 90 or more, and visual questions for the task in `evals/VISUAL_RUBRIC.md`.
3. Add the task id to the list of task ids in `evals/README.md`.
4. Run `pnpm test:evals` and `pnpm check`, then ask a maintainer to run `pnpm eval:lock`.

---

## 6. Opening & Merging a Pull Request

1. Push your feature branch:
   ```bash
   git push origin feat/your-feature-name
   ```
2. Open a Pull Request on GitHub.
3. Complete all checkboxes in `.github/PULL_REQUEST_TEMPLATE.md`.
4. Ensure all CI checks in `.github/workflows/ci.yml` pass. CI runs `pnpm check` (the browser-probe fixture tests are not enabled in CI, so run `pnpm probe` yourself for scene changes).
5. After review approval, the PR is merged into `main` using **Squash and Merge**.

---

## 7. Release Process

Releases are cut from `main` only, after the PR is squash-merged and CI is green.

1. Update `package.json` version and `CHANGELOG.md`.
2. Because `package.json` is protected, a maintainer re-pins the lock with `pnpm eval:lock` and commits it with the release.
3. Commit as `chore(release): vX.Y.Z`.
4. Open and merge the release PR into `main`.
5. Tag the merge commit: `git tag -a vX.Y.Z -m "vX.Y.Z" && git push origin vX.Y.Z`.
6. Create a GitHub Release from the tag, using the matching `CHANGELOG.md`
   section as the release body.
7. Mark every `0.x` release as a **pre-release** until `1.0.0`.

Version labels in scripts and skill titles must match the tagged version
(`v0.9` for the `0.9.x` line).

---

## 8. Licensing of Contributions

Motion Lab is licensed under **GPL-3.0-only**. By submitting a pull request you
confirm that:

- You have the right to contribute the code, text, or assets.
- Your contribution is licensed under GPL-3.0-only, except where it incorporates
  third-party work under its own compatible license (Apache-2.0, MIT, OFL, CC0).
- Any new third-party asset is recorded in [`NOTICE`](NOTICE) with its upstream
  URL and license.

Do not paste code or assets from sources with incompatible or unknown licenses.
