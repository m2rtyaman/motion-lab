---
name: adversarial-visual-critic
description: Ruthless visual audit critic and anti-AI-slop design director. Evaluates contact sheet audit grids, scene composition, component anchoring, and continuous motion flow with zero tolerance.
---

> Optional reference. RULES.md wins on any conflict.

# ADVERSARIAL VISUAL CRITIC & ANTI-AI-SLOP DESIGN STANDARD

This skill is a **ruthless visual review and art direction engine** engineered to eliminate typical AI design laziness, disconnected component layouts, generic card aesthetics, and AI-slop outputs in Remotion motion graphics.

---

## 1. THE 10 HALLMARKS OF AI SLOP

When unconstrained, generative AI defaults to these cheap anti-patterns:

1. **Disconnected Floating Bento Slop:**
   - 3–4 isolated glass/metallic cards floating aimlessly in empty void space without hierarchical structure or hardware framing (no macOS Sequoia window, browser frame, or physical chassis).
2. **Neon Glow Vomiting:**
   - Over-reliance on generic `#38bdf8` (cyan) or purple radial blurs (`blur-3xl`) behind cards to fake depth, completely lacking microscopic 1px specular highlights and clean CSS Subgrid borders.
3. **PowerPoint Slide Dissolves:**
   - Scene 1 fades out via `opacity: 0` while Scene 2 abruptly arrives via `translateY`. No continuous container morph or shared Graphic Anchor exists for the eye to track.
4. **Meaningless Data & Redundancy:**
   - Generic hallucinated metrics (`142,850 ops/sec`, `+34.2% YoY`) pasted into UI cards, or identical marketing copy duplicated between the main headline and badge pills.
5. **Blind SVG Guesswork:**
   - Hallucinated arbitrary path coordinates (`M10 20 C 40 50...`) instead of verified geometry, resulting in warped, distorted vector graphics.
6. **Weightless Cubic-Bezier Movement:**
   - Stiff, floaty easing lacking anticipation, spring tension, and natural deceleration overshoot.
7. **Blind File Approval Fallacy:**
   - Approving a scene simply because `visual-audit-grid.png` was generated and non-empty, ignoring misaligned vertical rhythm, awkward padding, or collapsed layout structure.
8. **The 1380px SaaS Dashboard Trap:**
   - Defaulting to a fixed 1380px dark box centered on screen with 4 telemetry tiles regardless of the brand (YouTube, Nike, Spotify, Festival). A true motion graphic features kinetic typography bursting across the screen, dramatic scale leaps, and authentic brand art direction!
9. **Dark Theme Blindness:**
   - Drowning every scene in dark cyber/hacker themes (`#0B0B0E`, `#050706`). Global consumer brands (YouTube `#FFFFFF` / `#F9F9F9`, Google Material, Apple Light, Spotify) demand crisp, bright, vibrant canvases.
10. **Invented Server Telemetry Slop:**
    - Cluttering consumer/entertainment interfaces with fabricated DevOps metrics (`enclave-lon1-v4`, `POP mesh`). True interface anatomy (Header, Search Pill, Video Player, Subscribe Pill, Recommended Grid) must be built and animated faithfully.

---

## 2. MODERN WEB & ELITE MOTION STANDARDS (LINEAR, GODLY, ORDINARY FOLK)

Core design principles drawn from Awwwards, Godly.website, Linear, Raycast, and Ordinary Folk:

### A. Subgrid Shared Borders (1px Hairline Matrix)
- Cards are never separated by arbitrary 24px gutters. Precision control surfaces utilize CSS Grid with `gap: 1px` allowing background luminosity to subtly bleed through:
```css
.precision-dashboard {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1px;
  background-color: rgba(255, 255, 255, 0.08); /* 1px Hairline Border */
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
}
```

### B. Hardware Shell Anchoring
- UI elements must belong to an explicit host structure:
  - macOS Window Shell: `● ● ●` traffic lights, URL/search bar, and unified sidebar.
  - Mobile Shell: Dynamic Island, status bar, and tactile hardware framing.

### C. Graphic Anchor & Continuous Match-Cut (Ordinary Folk Principle)
- Connect scenes by matching Scene A's outgoing focal point with Scene B's incoming geometry. The hero anchor never abruptly disappears; it morphs, rotates, or expands into the next viewport at peak velocity.

### D. Zero Redundancy Typography Rule
- Marketing headlines communicate the user-facing **benefit**, while UI tags describe the specific **system action**. Never duplicate phrases between title and chip.

---

## 3. RUTHLESS AUDIT PROTOCOL

When inspecting `visual-audit-grid.png`, if ANY of these 5 criteria fail, **THE RENDER IS IMMEDIATELY REJECTED**:

1. **Anchoring Audit:** Are elements integrated within a cohesive window shell or shared grid, or are they isolated cards floating in space?
2. **Container Continuity:** Does at least one Graphic Anchor maintain physical presence and morph across scene boundaries without crossfade dissolves?
3. **Editorial Typography & Space:** Is there generous, intentional negative space between headings, badges, and meters? Is vertical rhythm preserved?
4. **Authentic Vector Geometry:** Are icons and emblems sourced from verified geometric standards, rather than deformed path approximations?
5. **Physical Mass & Rest:** Does the stage breathe with subtle ambient life (`AmbientAliveDriver`), and do entrances leverage true damped spring physics (`SpringStaggerGroup`)?

---

## 4. AUTONOMOUS REMEDIATION PROTOCOL

An agent's job is not merely to report file creation. Inspect the visual audit sheet with critical scrutiny; if elements appear misaligned, disconnected, or generic, **refactor Scene.tsx immediately without waiting for user intervention**.
