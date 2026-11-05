## ⚡ Pull Request Summary

<!-- What changed? Which scene, primitive, or optimization was introduced? -->
### 1. Change Category
- [ ] 🎬 New Scene / Project (`src/projects/<slug>`)
- [ ] 🧱 New Primitive / Archetype (`src/primitives` or `src/archetypes`)
- [ ] ⚙️ Core Engine / Script Enhancement (`src/core` or `scripts/`)
- [ ] 🎨 Visual Craftsmanship & Polish (Opus Prompt 10)
- [ ] 🐛 Bug Fix & Diagnostic (Doctor / Quality Gate)

---

### 2. Associated Project & Paradigm
- **Project:** `<slug>`
- **Paradigm:** `[ ] editorial-ui` | `[ ] cinematic-world` | `[ ] kinetic-poster` | `[ ] hybrid-orchestrated`
- **Format:** `[ ] 16:9 Horizontal` | `[ ] 9:16 Vertical` (Locked at 60 FPS)

---

### 3. Studio Quality Gate Checklist (Mandatory Pre-Flight)

Please ensure all checks below are verified before submitting:

- [ ] **No Direct Push to Main:** Changes are submitted via an isolated feature branch (`feat/*` or `scene/*`).
- [ ] **Static Audits:** `pnpm check` passed with zero violations and zero TypeScript errors.
- [ ] **Studio Diagnostic:** `pnpm audit:doctor` passed all health checks.
- [ ] **Multi-Layer Quality Gate:** All AST, spec, craft, and slop audits passed cleanly.
- [ ] **GPU Purity:** Only `transform`, `opacity`, and `filter` were tweened (no layout-reflow geometry tweening).
- [ ] **Readability Hold Duration:** Every primary title/message holds static and readable for at least 1.2 seconds ($72\text{ frames @ 60 FPS}$).
- [ ] **Broadcast Scale Discipline:** No micro-fonts below 16px/18px in broadcast viewports.
- [ ] **Deterministic Seeds:** `Math.random()` strictly avoided; all variation derives from seeded algorithms (`mulberry32`).
- [ ] **Visual Contact Sheet:** `out/<slug>/visual-audit-grid.png` generated and visually reviewed.

---

### 4. Visual Evidence / Contact Sheet

<!-- Attach visual-audit-grid.png or frame previews here -->

---

### 5. Verification Commands
```bash
pnpm check --project <slug>
pnpm render:contact-sheet --project <slug>
pnpm render --project <slug>
```
