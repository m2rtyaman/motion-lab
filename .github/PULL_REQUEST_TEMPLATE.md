## Pull Request Summary

<!-- What changed? Which scene, primitive, preset, audit, or doc was introduced or fixed? -->

### 1. Change Category
- [ ] New scene / project (`src/projects/<slug>`)
- [ ] New or changed primitive (`src/primitives`, `curated.ts`, gallery)
- [ ] Core engine / preset / physics (`src/core`)
- [ ] Script, audit, probe, or eval change (`scripts/`, `evals/`)
- [ ] Docs or rules (`RULES.md`, `docs/`, README)
- [ ] Bug fix

---

### 2. Associated Project & Paradigm
- **Project:** `<slug>` (harness v2: `"harness": 2` in `spec.json`; legacy projects only for maintenance)
- **Mode:** `[ ] editorial-ui` | `[ ] cinematic-world` | `[ ] kinetic-poster` | `[ ] hybrid-orchestrated`
- **Format:** `[ ] 16:9 Horizontal` | `[ ] 9:16 Vertical` (locked at 60 FPS)

---

### 3. Quality Gate Checklist (Mandatory Pre-Flight)

Rule file: [`RULES.md`](../RULES.md) (wins over any other doc).

- [ ] **No direct push to main:** the change comes from a feature branch (`feat/*`, `scene/*`, `fix/*`, `docs/*`, `chore/*`).
- [ ] **Gate:** `pnpm check` (or `pnpm check --project <slug>`) finished with 0 errors. State if you used `CHECK_FAST=1` locally; CI runs the full gate.
- [ ] **Storyboard:** every beat has a `board` in `spec.json` (no SB error) and the poses grid (`out/<slug>/poses/poses-grid.png`) was reviewed before motion was added.
- [ ] **Browser probe:** `pnpm probe --project <slug>` has no P-code errors (scene changes).
- [ ] **Presets, not raw tweens:** motion uses `src/core/presets.ts` and `physics.ts`; only `transform`, `opacity`, `filter` are animated; no direct `gsap.*` calls.
- [ ] **Final hold:** the closing message holds still for `holdFinal(tl, at, 1.2)` (72 frames at 60 FPS).
- [ ] **Type and copy:** text is 18 px or larger inside the safe zone; no emoji, lorem ipsum, fake telemetry, or real brand logos.
- [ ] **Determinism:** no `Math.random`, `Date.now`, timers, CSS transitions, or environment sniffing; any variation is seeded.
- [ ] **Contact sheet:** `out/<slug>/visual-audit-grid.png` was generated and reviewed; `out/` is not committed.
- [ ] **Generated docs:** if `src/core` changed, `pnpm docs:math` and `pnpm docs:design` were run (`pnpm check` verifies they are current).
- [ ] **Integrity lock:** if a protected file changed (`scripts/`, `src/core`, `src/primitives`, `evals/`, `docs/`, `RULES.md`, `package.json`, a pinned `example-*` / `study-*` project), a maintainer is asked to run `pnpm eval:lock`. Contributors do not run it.

---

### 4. Visual Evidence / Contact Sheet

<!-- Attach visual-audit-grid.png, poses-grid.png, or frame previews here -->

---

### 5. Verification Commands
```bash
pnpm check --project <slug>
pnpm render:poses --project <slug>
pnpm render:contact-sheet --project <slug>
pnpm probe --project <slug>
pnpm render --project <slug>
```
