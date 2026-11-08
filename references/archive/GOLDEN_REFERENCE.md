> Optional reference. RULES.md wins on any conflict.

# GOLDEN REFERENCE GUIDE: SINGLE LIVING CONTAINER B-ROLL
**Project:** `src/projects/single-container-broll/`  
**Reference Title:** Gemini 3.8 Flash / Google DeepMind Multimodal Intelligence Engine  
**Format:** 1920x1080 (16:9), 60 FPS Deterministic, 12 seconds (720 frames)  
**Date:** 2026-11-02  
**Visual Proof:** `out/single-container-broll/visual-audit-grid.png`  
**Final Video:** `out/single-container-broll/single-container-broll.mp4`

---

## 1. LESSONS LEARNED: WHAT MAKES THIS PROJECT A BENCHMARK?

Why did earlier prototypes feel like "PowerPoint slide transitions", while this project evolved into an Apple / Linear / Stripe grade motion graphics masterpiece? The 6 core pillars:

### 1. Liberation from Blind Linter Rules to Enable True Design Freedom
- **Previous Mistake:** Linters dogmatically required *"there must be continuous camera movement in every scene"*, causing cameras to wobble drunkenly across 2D planar vector surfaces. Additionally, *"readable title required"* led to ugly debug banners like `MOTION LAB // 60 FPS` stamped across headers and footers.
- **Success Factor:** We eliminated artificial X/Y camera wobble from single-container UI scenes. Instead, we introduced a reactive, liquid depth camera tied to container morphing: pulling back slightly during wide window expansions (scale: 1.06 -> 1.0), and smoothly zooming in during tight slider interactions (scale: 1.0 -> 1.05) with damped spring physics (damping: 24, stiffness: 120).

### 2. Single Living Container Instead of Slide Deck Crossfades
- **Previous Mistake:** Simulating scene transitions by mounting separate `absolute inset-0` containers and crossfading them via `opacity: [1, 0]`.
- **Success Factor:** From frame 0 to frame 720, **physically one single DOM element (`#the-morph-container`) lives on stage**. This container seamlessly transforms its width, height, border radius, background color, and shadow using spring physics (`dampedSpring` and GSAP `back.out`):
  $$\text{Capsule }(500 \times 104, r=52) \longrightarrow \text{Terminal }(940 \times 480, r=24) \longrightarrow \text{Slider }(880 \times 120, r=60) \longrightarrow \text{Telemetry }(960 \times 480, r=28)$$
  Because the viewer's eye follows the continuous hero actor, visual attention is never fractured.

### 3. Ban on Didactic Meta-Copy (Zero Decorative Jargon)
- **Previous Mistake:** Announcing the animation's own techniques as screen typography (*"Kinetic Geometry", "International Typographic Style", "Form Continuity, Rigid Grid"*). This instantly made videos feel like low-tier AI infographics.
- **Success Factor:** Show, don't tell. Copy is strictly converted to authentic, tangible product and developer data:
  - `Gemini 3.8 Flash` + `Flash Live`
  - Real `@google/genai` TypeScript SDK stream (`gemini-3.8-flash`)
  - `Low`, `Medium`, `High`, `Argon` model tier selectors
  - `MULTIMODAL REASONING 99.4%`, `TIME TO FIRST TOKEN 12 ms`

### 4. Mathematical Cursor Physics (Cubic Bézier & Hotspot Lock)
- **Previous Mistake:** Flying the cursor in linear paths or mounting it inside nested `<CameraRig>` coordinates where transforms caused cursor drift.
- **Success Factor:**
  - Cursor is mounted in root canvas space.
  - Movement follows cubic Bézier curves: $B(t) = (1-t)^3 P_0 + 3(1-t)^2 t P_1 + 3(1-t) t^2 P_2 + t^3 P_3$.
  - Accounting for camera depth, the cursor hotspot $(0, 0)$ locks with pixel precision to the center of the **`Flash Live`** button and slider handles; preceded by micro-anticipation and followed by a `scale: 0.88` squash click for an organic feel.

### 5. Layout Budget & Typographic Whitespace Discipline
- **Previous Mistake:** Squeezing >500px of copy (`Autonomous Synthesis Engine` + icon + badge) into a 440px pill, breaking CSS layout boundaries.
- **Success Factor:** Generous breathing room and strict single-line typographic hierarchy inside a 500px capsule. Zero text wrapping or cramped line heights.

### 6. Visual Self-Audit via Contact Sheets
- **Success Factor:** Bridging the gap between "code compiles" and "looks stunning". Every beat boundary is captured in a 12-frame contact sheet (`visual-audit-grid.png`) and evaluated for alignment, cursor hotspot accuracy, and clean geometry before final export.

---

## 2. SCENE ANATOMY & CODE PATTERN

### Core Container Architecture (`Scene.tsx`)
```tsx
// 1. Reactive dynamic depth camera (liquid scaling tied to container morphing, zero x/y wobble)
<SpotlightStage aspect="16:9" background="#EAE8E3" clean={true} showCrosshairs={false}>
  <CameraRig className="camera-rig">
    {/* Exactly one continuous living container */}
    <div
      id="the-morph-container"
      style={{
        width: 500,
        height: 104,
        borderRadius: 52,
        backgroundColor: '#0B0F19', // Gemini Deep Celestial
        boxShadow: '0 24px 60px -12px rgba(11, 15, 25, 0.4), 0 0 0 1px rgba(66, 133, 244, 0.1)',
        willChange: 'width, height, border-radius, background-color, transform',
      }}
    >
      {/* Child layers are not destroyed; content handoffs occur inside the container */}
      <div className="stage-layer-1 absolute inset-0 ...">...</div>
      <div className="stage-layer-2 absolute inset-0 opacity-0 ...">...</div>
      <div className="stage-layer-3 absolute inset-0 opacity-0 ...">...</div>
      <div className="stage-layer-4 absolute inset-0 opacity-0 ...">...</div>
    </div>
  </CameraRig>

  {/* Simulated cursor lives in root canvas coordinates */}
  <div className="simulated-cursor absolute ...">
    <MacOSCursor type="pointer" size={34} />
  </div>
</SpotlightStage>
```

---

## 3. GOLDEN RULES FOR FUTURE PROJECTS (CHECKLIST)

1. [ ] **Camera Moves Only with Purpose:** In 2D UI / B-Roll scenes, do not artificially wobble the camera; use reactive scale dynamics responding to container morphs.
2. [ ] **Ban on Debug Watermarks:** Never stamp internal debug text like "MOTION LAB / 60 FPS" in screen corners.
3. [ ] **Single Living Container Principle:** Do not delete old divs with fades to show new ones; morph the geometry of the living container.
4. [ ] **Authentic Data & Code:** Never invent fake DevOps jargon; display real SDKs (`@google/genai`) and realistic benchmarks.
5. [ ] **Hotspot Precision:** Ensure the cursor hotspot lands accurately inside the target element's clickable bounds.
6. [ ] **Visual Contact Sheet Inspection:** Never sign off on a scene without visually inspecting `visual-audit-grid.png`.
