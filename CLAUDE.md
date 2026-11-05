# CLAUDE.md — Motion Lab Harness & Autonomous Operating Manual

This repository is a broadcast-grade, deterministic multi-project motion graphics studio rendering pixel-perfect 60 FPS vertical (9:16) and horizontal (16:9) video content driven by React, Remotion, and GSAP.

---

## 1. Essential Commands & Development Workflow

### Project Management
```bash
# Scaffold a new project (creates direction.md, spec.json, Scene.tsx)
pnpm new <slug> --mode <cinematic-world | editorial-ui | kinetic-poster | hybrid-orchestrated> [--aspect 9:16 | 16:9] [--duration 6]

# Regenerate dynamic project registry (runs automatically before check/render)
pnpm registry
```

### Verification & Quality Gate
```bash
# Run the full quality gate across all tracked projects (or target a specific project)
pnpm check
pnpm check --project <slug>

# Individual audits:
pnpm audit:spec --project <slug>       # Beat continuity & code-spec sync
pnpm audit:storyboard --project <slug> # Shift-left 5 Universal Storyboard Laws
pnpm audit:ast --project <slug>        # Babel AST scan for reflows, magic numbers, transitions
pnpm audit:slop --project <slug>       # Anti-slop gate (neon glow, micro-fonts, shell anchor)
pnpm audit:craft --project <slug>      # 3D/SVG determinism & spring physics
pnpm audit:critic --project <slug>     # Opus director scoring (readability, dead frames)
pnpm audit:glyph                       # UTF-8 and international typography validation
pnpm audit:doctor                      # 14-point studio diagnostic check
```

### Visual Review & Rendering
```bash
# Generate visual audit contact sheet grid (out/<slug>/visual-audit-grid.png)
pnpm render:contact-sheet --project <slug>

# Render physical broadcast MP4 (out/<slug>/<slug>.mp4)
pnpm render --project <slug>

# Keyless voiceover & B-roll harvesting (100% API-key-free via open EdgeTTS)
pnpm harvest --project <slug> --text "Your voice narration script here."
```

---

## 2. Architecture & Directory Conventions

```
src/
  projects/
    <slug>/
      direction.md      # Creative concept, 3-input separation, physics decisions
      spec.json         # Motion contract (beats, camera keyframes, ease curves, SFX)
      Scene.tsx         # Project scene implementation
      vision-notes.md   # Visual audit observations and frame sign-offs
    registry.generated.ts # Auto-generated project registry (DO NOT edit manually)
  core/                 # Deterministic GSAP bridge (useRemotionGSAP), spring solvers, tokens
  primitives/           # Reusable stages (SpotlightStage, CameraRig, KineticText, SvgFilterLab, LayeredStage3D)
  templates/            # 23 hybrid templates (Native Remotion & HTML Frame Driver)
out/
  <slug>/
    <slug>.mp4          # Final rendered video
    visual-audit-grid.png # Contact sheet for visual self-audit
    vision/manifest.json# Frame delta and motion analysis
```

---

## 3. Strict Deterministic Engineering Rules

1. **Deterministic Seeking (`useRemotionGSAP`):**
   - All timeline animations must use the `useRemotionGSAP` hook with `tl.seek(frame / fps)` determinism.
   - Non-deterministic APIs (`Math.random`, `Date.now`, `setTimeout`, `setInterval`, CSS transitions) are **STRICTLY PROHIBITED**. Use Mulberry32 or `seed` functions.
2. **GPU Purity:**
   - Tween only `transform` (`x`, `y`, `scale`, `rotate`, `rotateX`, `rotateY`), `opacity`, and `filter`.
   - Never animate layout-reflow properties (`width`, `height`, `top`, `left`, `margin`, `padding`). For container resizing, use GPU-pure FLIP transformations or SVG path morphing.
3. **Pacing & Timing Tokens:**
   - Durations and spring configs must be imported from `src/core/tokens.ts` and `src/core/recipes.ts`.
   - Forbidden eases: raw `linear` (except continuous loops) and `easeInOut`.

---

## 4. The 5 Universal Storyboard Laws (`references/MASTER_STORYBOARD_RULES.md`)

1. **Zero Traditional Cuts & Continuous Kinetic Handoff:**
   - Slide-deck crossfade dissolves (`opacity: 0` fades) are strictly forbidden.
   - `TheHeroActor` remains physically mounted ($opacity > 0$) from frame 0 through the final frame, evolving geometry across scene boundaries (**Peak Velocity Container Morphing**).
2. **1.0–1.5s Micro-Beat Pulse & 1.2s Stillness Hold:**
   - Every 60–90 frames (1.0–1.5s), visual focus, camera angle, or depth must evolve. Monotonous equal beats are forbidden ($\sigma > 14\text{ frames}$).
   - The closing message, logo resolve, and CTA must hold static and crystal clear for **at least 1.2 seconds (72 frames @ 60 FPS)**.
3. **Three-Layer Depth Architecture:**
   - Layer 1 (Background Base): Atmospheric grid, diffuse radial glow, or illuminated ground surface.
   - Layer 2 (Secondary Depth): Trailing ghost outlines (2–3f lag), soft ambient contact shadows, or waveform trails.
   - Layer 3 (Foreground Hero): Razor-sharp typography, authentic product UI, and 1px specular beveled rim reflections.
4. **Spatial, Luminosity & Scale Contrast:**
   - Transition intentionally between focused dark editing environments and warm, vibrant brand canvases.
   - Leverage dramatic 20x scale leaps from micro-interactions (e.g. typing) to full-viewport cinema takeovers.
5. **Three-Input Separation of Concerns (3-Input Rule):**
   - Decouple **Script** (*What & Why*), **Storyboard** (*Visual Look & Depth*), and **Motion Reference** (*Physics & Acceleration*).

---

## 5. Anti-Slop Quality Mandate

- **No Fake DevOps Slop:** In consumer/brand videos, fabricating arbitrary server telemetry (`ops/sec`, `enclave-lon1-v4`, `POP mesh`) is a P0 violation. Rebuild authentic brand anatomy (e.g., YouTube Header, Search Pill, Video Player, Subscribe Pill).
- **No Floating Bento Slop:** UI elements must be anchored inside a defined stage shell (`AppShell`, `BrowserFrame`, `PrecisionDashboardShell`, `LayeredStage3D`) or 1px hairline matrix (`gap-[1px] bg-white/[0.08]`).
- **No Micro-Fonts:** Minimum font size is 16px/18px.
- **100% API-Key-Free:** Studio operations require zero paid third-party API keys. All voice synthesis and media harvesting are keyless, offline/local, and deterministic.

---

## 6. Definition of Done

A task is complete ONLY when:
1. `pnpm check --project <slug>` passes with 0 errors.
2. `pnpm render:contact-sheet --project <slug>` generates `visual-audit-grid.png` and passes adversarial review.
3. `pnpm render --project <slug>` renders the physical MP4 video file to `out/<slug>/<slug>.mp4`.
