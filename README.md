# ⚡ MOTION LAB
### Autonomous Multi-Paradigm Motion Graphics Studio
**Deterministic, Frame-Accurate 60 FPS Video Synthesis with Remotion, GSAP & React 19**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Remotion](https://img.shields.io/badge/Remotion-4.0-ff4081.svg)](https://www.remotion.dev/)
[![GSAP](https://img.shields.io/badge/GSAP-3.x-88ce02.svg)](https://greensock.com/gsap/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-000000.svg)](https://threejs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

> **"Motion Lab does not draw videos. It writes the deterministic machine that draws the video."**  
> Unlike black-box generative video models that hallucinate distorted text and warped UI elements, Motion Lab renders pixel-perfect, broadcast-grade ($60\text{ FPS}$) vertical ($9:16$) and horizontal ($16:9$) videos driven purely by mathematical code, verifiable motion contracts, and multi-layered quality gates.

---

## 🏛️ The Three Creative Paradigms

| Paradigm | Target Medium | Signature Aesthetics | Reference Scenes |
| :--- | :--- | :--- | :--- |
| **`editorial-ui`** | B2B SaaS, Fintech, Tech Demos | Apple/Linear-style dark specular glass, SVG sparklines, live interactive maps, data tables, slide-over panels, 3D camera drift. | `octosift-commercial`, `editorial-telemetry`, `fintech-teaser` |
| **`cinematic-world`** | Gaming, Storytelling, 2.5D Worlds | 12 Principles of Animation (squash & stretch, anticipation, step-arc bobbing), procedural torch lighting, shockwaves. | `dwarf-arena` |
| **`kinetic-poster`** | Ad Spots, Manifestos, Social Drops | Ultra-high contrast typography, rhythmic masked splits, 144 BPM impact shakes, full-screen punchy cuts. | `kinetic-loud-showreel`, `kinetic-poster-demo` |

---

## 🚀 30-Second Quick Start

### 1. Requirements
- **Node.js** $\ge 20.0.0$
- **pnpm** $\ge 9.0.0$

### 2. Installation
```bash
git clone https://github.com/m2rtyaman/motion-lab.git
cd motion-lab
pnpm install
```

### 3. Immediate Video Render
Generate an official 1080p ($60\text{ FPS}$) commercial with a single command:
```bash
# Render the 16:9 B2B Commercial (Octosift)
pnpm render:commercial

# Render the 144 BPM 3D Showreel
pnpm render:showreel

# Render the 2.5D Berserker Dwarf Arena
pnpm render:arena
```
Rendered physical MP4 outputs are stored in `out/<slug>/<slug>.mp4`.

### 4. Interactive Web Preview Studio
Open the live Remotion preview player in your browser:
```bash
pnpm studio:preview
```

---

## 🎛️ Golden Reference Projects Included

Each video lives as an isolated, reproducible project under `src/projects/<slug>/`:

```
src/projects/
├── octosift-commercial/   # 16:9 12s 60 FPS B2B SaaS Commercial (Live Map, Drawer, Kanban)
├── kinetic-loud-showreel/ # 16:9 10s 60 FPS 144 BPM 3D Hybrid Primitives Showreel
├── dwarf-arena/           # 9:16 6s 60 FPS 2.5D Berserker Dwarf with sonic shockwaves
├── editorial-telemetry/   # 9:16 4s 60 FPS Dark Glass Telemetry & Sparkline counter
├── fintech-teaser/        # 9:16 4s 60 FPS Dark UI Liquidity pulse teaser
└── kinetic-poster-demo/   # 9:16 3s 60 FPS High-contrast typographic poster
```

---

## 🛡️ Multi-Layer Quality Gates & Tooling

Motion Lab enforces strict, zero-tolerance automated checks before any pixel is rendered:

```bash
# Run all automated static audits (Spec, AST, Slop, Critic, Glyph, Types)
pnpm check

# Run the 14-point medical diagnostic health bot
pnpm doctor

# Run the Opus 7-point Pre-Render Quality Gate
pnpm gate --project octosift-commercial

# Inspect an exact sub-second frame as high-res PNG (e.g. at t=3.5s)
pnpm inspect octosift-commercial --t 3.5

# Analyze audio offline into frame-by-frame RMS energy & beat map
pnpm music:map assets/audio.wav

# Package any project into a reusable AI Agent skill (.agent/skills/<name>)
pnpm export:skill octosift-commercial --name motion-octosift-saas
```

---

## 🧱 Production-Grade Architecture

```
motion-lab/
├── src/
│   ├── core/               # Deterministic time bridge, PRNG, and camera math
│   │   ├── useRemotionGSAP.ts  # Frame-locked timeline driver: tl.seek(frame / fps)
│   │   ├── render-contract.ts  # Mulberry32 seeded generator, Retina HiDPI setup
│   │   ├── procedural-audio.ts # Web Audio synthesis (click, thud, whoosh, chime)
│   │   ├── camera-math.ts      # Logarithmic zoom and 4D Tesseract math
│   │   ├── fourier-dft.ts      # 2D Discrete Fourier Transform epicycle math
│   │   └── web-recorder.ts     # In-browser 8 Mbps WebM instant screen recorder
│   ├── primitives/         # Reusable broadcast widgets & stages
│   │   ├── InstancedPinGrid3D.tsx   # 60 FPS 3D Voxel pin grid (Three.js)
│   │   ├── LiquidChromeTorus3D.tsx  # Dynamic metallic chrome torus (Three.js)
│   │   ├── SplineCamera3D.tsx       # CatmullRomCurve3 cinematic camera rig
│   │   ├── TesseractWireframe3D.tsx # 4D Hypercube wireframe projection
│   │   ├── ContainerMorph.tsx       # Single Container layout morphing
│   │   ├── ChalkboardStage.tsx      # Dark slate chalkboard with chalk patina
│   │   └── widgets/                 # DataTable, InteractiveMap, KanbanBoard, Drawer
│   ├── archetypes/         # High-level composition cards
│   │   ├── ProductWorkflowChain.tsx # Button -> Wave -> Note -> Calendar morph chain
│   │   └── MetricTelemetryCard.tsx  # Dark glass KPI telemetry card
│   └── projects/           # Modular video scenes (each with spec.json and Scene.tsx)
├── scripts/                # Autonomous developer tooling & audit engines
└── out/                    # Render outputs (git-ignored for clean clones)
```

---

## 💎 The 7 Mandatory Motion Director Laws

1. **Single Container Principle (Tek Kap İlkesi):**  
   Never cut between UI scenes abruptly. An existing visual container (button, card, panel) must continuously morph in size, border-radius, and position into the next state.
2. **Anticipatory Stillness (300–600ms):**  
   Every major impact, text punch, or scene transition is preceded by a micro-pause ($300\text{--}500\text{ ms}$) to multiply visual impact.
3. **Show First, Name Later:**  
   The viewer must visually experience the interaction before the term or label appears on screen.
4. **Text Readability Threshold:**  
   Every key headline and data callout must remain completely static and readable for at least $1.2\text{ seconds}$ ($72\text{ frames @ 60 FPS}$).
5. **Function-Driven Easing:**  
   Snappy spring (`back.out(1.4)`) for UI cards, smooth exponential (`expo.inOut`) for cameras, and controlled deceleration (`power2.out`) for brand logos. Elastic bounce is strictly forbidden.
6. **Deterministic Seeded Randomness:**  
   `Math.random` is prohibited. All procedural motion, particle fields, and noise textures use seeded PRNGs (`mulberry32`) tied directly to `frame / fps`.
7. **Broadcast Safety Scale:**  
   Mobile 9:16 videos must respect Top 12% and Bottom 20% obstruction zones. All typography must scale $\ge 18\text{px}$ (min 7% screen width).

---

## 🛠️ Creating a New Video in 3 Steps

### Step 1: Scaffold Project
```bash
pnpm new my-product --mode editorial-ui --aspect 16:9 --duration 10
```

### Step 2: Define Motion Contract
Edit `src/projects/my-product/spec.json` and `direction.md` to establish beats, camera paths, and easing contracts.

### Step 3: Verify & Render
```bash
pnpm gate --project my-product
pnpm render:commercial
```

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
Built with precision for motion directors, creative developers, and autonomous AI agents.
