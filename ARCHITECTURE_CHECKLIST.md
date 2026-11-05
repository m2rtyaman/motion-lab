# UNIVERSAL MOTION GRAPHICS STUDIO — MASTER ARCHITECTURAL SPECIFICATION & QUALITY GATES (v0.8)

This document establishes the architecture, mathematical formulas, and quality gates enabling `motion-lab` to autonomously process any creative brief (B2B SaaS, E-commerce, Fintech, Mobile App, Launch Teaser) at **Motion Lab / Apple Keynote** broadcast standards.

---

## SECTION 1: Universal Storyboard, Editing & Narrative Engine

### 1.1. Flexible Narrative Router
Depending on the creative brief and prompt type, select one of the following 5 narrative archetypes or create a disciplined hybrid:

1. **Product-Flow-Tour:** Discovery (Macro Data / Table) → Micro-Interaction (Cursor Selection) → Insight / Value (Drawer / Analysis) → Action (Modal / Execution) → Big Picture (Pipeline / Field Route). *e.g. Linear, Notion, Stripe.*
2. **Problem-Agitation-Solution (PAS):** Legacy/Friction Method (Low contrast, chaos, latency) → Turning Point (Whip-pan or container morph) → Product Solution, Velocity & Clarity.
3. **Kinetic-Manifesto:** 80% monumental typography & abstract geometric forms, 20% product/brand focus. Staccato rhythm, masked splits, high-contrast color blocks. *e.g. Spotify, Nike, Stripe Sessions.*
4. **Bento-Feature-Grid:** 4–6 modular cards illuminating in sequence around a central value proposition. *e.g. Apple Hardware / Software Launch.*
5. **Metric-Storytelling:** Analytical narrative beginning from an atomic data point, branching into charts, flow trees, and rolling live counters. *e.g. Stripe, Ramp, Plaid.*

### 1.2. Mathematical Rhythm and Pacing Laws
- **Anti-Monotony Rule:** All beats in a video must never share identical frame durations ($\sigma(\text{durations}) > 18\text{ frames}$). Equal-length slide decks are strictly forbidden.
- **Breathing Pacing Curve:**
  - **Staccato Beat (35–55 frames):** High-impact entries, swift actions, bold punchy titles.
  - **Focus/Hold Beat (75–110 frames):** Moments where viewers parse table rows, metric cards, or charts. The camera does not freeze; it drifts slowly (`ambientDrift`).
  - **Anticipation & Settle:** Modals or cards do not appear instantly upon click; allocate click ripple (6 frames), followed by spring expansion (14–18 frames) and reading hold (40+ frames).

### 1.3. Visual-Textual Complementarity (Copywriting vs. UI Sync)
- **Zero Redundancy Rule:** The overlay marketing headline and visible UI component titles must never duplicate exact words.
  - *Incorrect:* UI modal titled "Create Schedule", overlay headline reading "Create Your Schedule".
  - *Correct:* UI modal titled "Create Schedule", overlay headline reading "Fill Your Calendar In Seconds".
- **Single Focal Point Law:** Only one primary focus element is permitted per beat. Simultaneously scrolling complex tables, opening side drawers, and changing long overlay text is forbidden.

### 1.4. Transition Semantics
Every scene transition must be motivated by a clear cinematographic rationale:
- `spatial-zoom-in / spatial-zoom-out`: Diving into micro-details or pulling back to the macro view.
- `spatial-pan`: Gliding across a continuous canvas to an adjacent module (`InfiniteCanvasPan`).
- `ui-trigger`: User interaction opening a Modal, Drawer, or Tab switch.
- `match-cut`: Container geometry morphing smoothly into another component in the next beat.
- **FORBIDDEN:** Unmotivated opacity/blur crossfades between disconnected scenes.

---

## SECTION 2: Universal Camera, Spatial & Viewport Engine

### 2.1. Virtual Canvas Decoupling
- **The Problem:** Placing a desktop `<AppShell>` directly at 100% width inside a 9:16 (1080x1920) vertical frame crushes columns, shrinks text to illegible sizes, or clips content horizontally.
- **The Universal Rule:**
  1. Desktop interfaces are always rendered on a fixed-width **Virtual Canvas** (e.g. `1440x900` or `1600x1000`).
  2. `<SpatialCamera>` treats this virtual canvas as a 3D space; for 9:16 vertical output, it navigates to active coordinates (`targetX`, `targetY`) and scales appropriately (`scale`).
  3. When drawers open or Kanban columns activate, the camera pans horizontally to center the action; components remain sharp and unclipped.

### 2.2. Zero-Dead-Frame Law (Ambient Drift)
- **The Problem:** Camera locking dead after a GSAP tween, producing frozen static frames for 40+ frames (`diffs: 0.01` or `0`).
- **The Universal Rule:** Even when primary tweens conclude, a deterministic `ambientDrift(frame)` function remains active:
  $$\Delta y = \sin(\text{frame} \times 0.04) \times 3\text{px}$$
  $$\Delta \text{scale} = 1 + \sin(\text{frame} \times 0.02) \times 0.015$$
  $$\Delta \text{rotZ} = \cos(\text{frame} \times 0.03) \times 0.15^\circ$$
- Frame-to-frame diffs never drop below 1.2; the canvas breathes continuously.

### 2.3. Co-Spatial Camera & Actor Discipline
- Actors like `<SimulatedCursor>`, `<ClickRipple>`, and `<CalloutBadge>` reside inside the virtual canvas coordinate space (`.spatial-world`), not on an isolated viewport overlay.
- When the camera executes `rotateX(15deg) rotateY(-12deg) scale(1.6)`, the cursor remains pixel-locked to its target button without drifting.

---

## SECTION 3: Design System, Theming & Visual Language

### 3.1. Vision-to-Token Pipeline
Before code generation, establish the `ThemeConfig`:
- **Surface Mode:** Light theme (`surfaceMode: "light"`) if primary brand is light; dark theme (`"dark"`) for developer tools/cyber environments; vibrant brand (`"vibrant-brand"`) for colorful canvases.
- **Color Mapping:** Primary accent (`accentPrimary`), secondary accent (`accentSecondary`), success (`statusSuccess`), warning (`statusWarning`), card surface (`bgSurface`), background canvas (`bgPrimary`).
- **Geometry:** Rounded consumer SaaS (`radius: 14px-20px`, soft ambient shadows) vs. Crisp developer infrastructure (`radius: 4px-8px`, sharp 1px borders).

### 3.2. Layering & Depth Hierarchy (Z-Axis & Anti-Ghosting)
- **Anti-Ghosting Law:** Old scene layers must fully dissolve or exit within 12 frames. Two different scenes must never linger semi-transparently over one another.
- **Dimming Backdrop:** When a `<ModalDialog>` or `<SlideOverDrawer>` opens, background UI transitions to `filter: blur(6px) brightness(0.92)` and `opacity: 0.35`.

### 3.3. Editorial Marketing Overlay
- Instead of raw screen captures, 9:16 vertical videos incorporate high-contrast marketing typography in the upper safe zone (`top: 250px-350px`).
- **Hero Resolve:** The closing scene must never end on a tiny tucked-away button. Pull back to a prominent glassmorphic brand badge, compelling value proposition, and high-contrast CTA button.

---

## SECTION 4: Universal Primitives Library (`src/primitives/`)

All primitives operate 100% data-agnostically:

1. **Shells:**
   - `<BrowserFrame>`: URL bar, tab titles, traffic lights, theme-adaptive canvas.
   - `<DesktopAppShell>`: Responsive sidebar, search bar, avatar, main canvas.
   - `<MobileDeviceFrame>`: Dynamic Island, speaker grille, mobile navigation pill.
   - `<BentoStage>`: 2x2 or 3x2 modular card showcases.
   - `<VirtualCanvas>`: Fixed desktop canvas normalized for 3D camera navigation.

2. **Data & UI Widgets:**
   - `<DataTable>`: Multi-column account/transaction tables, status pills, highlighted rows.
   - `<MetricCardRow>`: KPI counters, live `NumberTicker`, trend badges (+24%), sparklines.
   - `<InteractiveMap>`: Vector SVG coastline/street maps, radar ping pins, animated route dashed lines.
   - `<CalendarGrid>`: Monthly/weekly schedule grid, active appointment slots.
   - `<KanbanBoard>`: Columns, pipeline metrics, cards transitioning between stages via 3D transforms.
   - `<SlideOverDrawer>`: Slide-in detail panel, structured form fields, alert callouts.
   - `<ModalDialog>`: Spring-physics centered confirmation/scheduling window.
   - `<ChartCanvas>`: Line, bar, and donut charts animating along progress (0 → 1).

3. **Actors & Typography:**
   - `<SimulatedCursor>`: Smooth Bézier trajectory actor with `.cursor-ripple` click triggers.
   - `<KineticHeadline>`: Masked line reveals (`overflow: hidden`) bursting upwards.

---

## SECTION 5: Automated Quality Gates & Audit Standards

### 5.1. `validate-spec.mjs` (Motion Contract Gate)
- **Visual Alignment:** All primary screen widgets specified in brief or screenshots must be declared in `spec.json` (`detectedWidgets`) and instantiated in JSX.
- **Pacing Variance:** Equal-length beats ($\sigma < 10\text{ frames}$) trigger immediate audit failure.
- **Camera Continuity:** Gaps between camera moves cannot exceed 1.0s; stagnation is rejected.

### 5.2. `ast-lint.mjs` (AST Syntax & Purity Gate)
- **`SLOP-004` (Widget Verification):** Confirms all `detectedWidgets` in `spec.json` exist as valid JSX opening elements in `Scene.tsx`.
- **`SLOP-001` (Stage Anchoring):** Blocks naked floating divs; requires verified stage shells.
- **GPU Purity:** Blocks `top, left, width, height` tweens; enforces `transform`, `opacity`, `filter`.

### 5.3. `contact-sheet.mjs` & `manifest.json` (Render Verification)
- **Sub-Beat Motion Gate:**
  Every consecutive frame diff in `beat.diffs` must satisfy $d \ge 1.2$:
  $$\forall d \in \text{beat.diffs}: d \ge 1.2$$
  Any recorded diff $\le 0.01$ fails the quality gate.
- **Adversarial Visual Inspection:**
  Visual critics evaluate against 4 cardinal defects:
  1. Horizontal or vertical text/box clipping.
  2. Overlapping unreadable ghost layers.
  3. Stagnant frozen frames ($d < 1.2$).
  4. Illegible micro-fonts (<16px) or washed-out CTAs.

---

## SECTION 6: B2B SaaS Reference Beat Architecture (360 Frames / 6 Seconds)

| Beat | Frame Range | Duration | Focus & Canvas | Camera Choreography | Overlay Headline |
|---|---|---|---|---|---|
| **1. Discovery** | f0 – f70 | 1.17s | `MetricCardRow` ($120k Pipeline) + `DataTable` (Target Accounts) | `IsometricTilt` (14° → 3°) & `FocusZoom` | *"Acquire High-Value Accounts Without Inbound Lag"* |
| **2. Insight** | f71 – f150 | 1.33s | `SlideOverDrawer` (Enterprise Lead) & Warning Callout | `FocusZoom` (pan right, scale: 1.35) | *"AI-Driven Opportunity & Pipeline Intelligence"* |
| **3. Action** | f151 – f225 | 1.25s | Background blurred calendar + Centered `ModalDialog` (Demo Booking) | Centered lock-in; spring pop-in | *"Book Demos With Single-Click Precision"* |
| **4. Routing** | f226 – f300 | 1.25s | `InteractiveMap` (Territory Pins, animated route line) | Aerial glide (`CanvasPan`) | *"Smart Regional Routing, Maximum Revenue"* |
| **5. Resolve** | f301 – f360 | 1.00s | Floating 2.5D interface + Centered glassmorphic Brand Emblem & CTA | `applyIsometricTilt` (pull back) | *"Automate Your B2B Pipeline • getstarted.io"* |
