# Contribution & Pull Request (PR) Guidelines — Motion Lab

Motion Lab is an open-source motion graphics studio producing deterministic, broadcast-grade 60 FPS video content. To maintain codebase integrity, mathematical determinism, and frame-rate precision, the following standards are **strictly enforced without exception**.

---

## 🛑 1. Principle: Never Push Directly to 'main'

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

## 🌿 2. Branch Naming Conventions

Branch names must use only lowercase alphanumeric characters and hyphens (`-`):
- `feat/<project-or-feature>` (e.g. `feat/brand-promo`, `feat/tesseract-wireframe`)
- `scene/<slug>` (e.g. `scene/fintech-dashboard`)
- `fix/<issue>` (e.g. `fix/audio-sync-drift`)
- `docs/<topic>` (e.g. `docs/pr-guidelines`)
- `chore/<task>` (e.g. `chore/deps-update`)

---

## 📝 3. Commit Message Standards (Conventional Commits)

Commit messages must be concise, descriptive, and follow the conventional commit format:
- `feat(slug): add new animation scene or primitive`
- `fix(core): resolve audio synchronization drift`
- `perf(ast): optimize AST parser scanning engine`
- `docs(readme): update architecture diagram and guide`
- `chore(deps): update project dependencies`

---

## 🛡️ 4. Definition of Done (DoD) & Quality Gates

Before a Pull Request is eligible for review and merge into `main`, the following **5 verification steps are mandatory**:

### 1. `pnpm check` (Static Quality Gate)
All audits must pass with zero violations and zero errors:
- `audit:spec`: Beat timeline, camera keyframe, and spec-code contract validation.
- `audit:ast`: Babel AST scan detecting layout reflows (`top`, `left`, `width`, `height` tweening).
- `audit:slop`: Anti-slop scan detecting neon cyan/purple glow vomiting, micro-fonts (<16px), and floating unanchored cards.
- `audit:critic`: Motion Lab director scoring engine (Dead frames >0.5s, minimum 1.2s text readability hold).
- `audit:craft`: Spring physics, CSS 3D/SVG purity, and hardware shell anchoring.
- `audit:glyph`: International typography and character encoding checks.
- `tsc --noEmit`: Strict TypeScript typechecking.

### 2. Studio Health Diagnostic
Ensure no chronic regressions or broken paths:
`pnpm audit:doctor`

### 3. Visual Contact Sheet (`visual-audit-grid.png`)
Generate contact sheet captures across all beat boundaries:
`pnpm render:contact-sheet --project <slug>`
Review the contact sheet with an adversarial motion-critic eye before rendering.

### 4. Physical MP4 Render Verification
Verify that the scene renders to disk cleanly:
`pnpm render --project <slug>`

---

## 🚀 5. Opening & Merging a Pull Request

1. Push your feature branch:
   ```bash
   git push origin feat/your-feature-name
   ```
2. Open a Pull Request on GitHub.
3. Complete all checkboxes in `.github/PULL_REQUEST_TEMPLATE.md`.
4. Ensure all CI checks in `.github/workflows/ci.yml` pass.
5. After review approval, the PR is merged into `main` using **Squash and Merge**.

---

## 📦 6. Release Process

Releases are cut from `main` only, after the PR is squash-merged and CI is green.

1. Update `package.json` version and `CHANGELOG.md`.
2. Commit as `chore(release): vX.Y.Z`.
3. Open and merge the release PR into `main`.
4. Tag the merge commit: `git tag -a vX.Y.Z -m "vX.Y.Z" && git push origin vX.Y.Z`.
5. Create a GitHub Release from the tag, using the matching `CHANGELOG.md`
   section as the release body.
6. Mark every `0.x` release as a **pre-release** until `1.0.0`.

Version labels in scripts and skill titles must match the tagged version
(`v0.8` for the `0.8.x` line).

---

## ⚖️ 7. Licensing of Contributions

Motion Lab is licensed under **GPL-3.0-only**. By submitting a pull request you
confirm that:

- You have the right to contribute the code, text, or assets.
- Your contribution is licensed under GPL-3.0-only, except where it incorporates
  third-party work under its own compatible license (Apache-2.0, MIT, OFL, CC0).
- Any new third-party asset is recorded in [`NOTICE`](NOTICE) with its upstream
  URL and license.

Do not paste code or assets from sources with incompatible or unknown licenses.

---

These rules guarantee that Motion Lab remains a world-class deterministic video engineering studio.
