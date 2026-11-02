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

| Paradigm | Target Medium | Signature Aesthetics | Example Scenes |
| :--- | :--- | :--- | :--- |
| **`editorial-ui`** | B2B SaaS, Fintech, Tech Demos | Apple/Linear-style clean hardware shells, crisp 1px subgrids, live SVG meters, slide-over panels, smooth 3D camera glide. | `whatsapp-campaign`, `octosift-commercial`, `fintech-teaser` |
| **`cinematic-world`** | Gaming, Storytelling, 2.5D Worlds | 12 Principles of Animation (squash & stretch, step-arc bobbing), procedural torch lighting, shockwaves. | `dwarf-arena`, `batman-noir` |
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
Generate an official 1080p ($60\text{ FPS}$) video with a single command:
```bash
# Render any scene deterministically
pnpm render --project whatsapp-campaign

# Render the 144 BPM Showreel
pnpm render:showreel

# Render the 2.5D Berserker Dwarf Arena
pnpm render:arena
```
Rendered physical MP4 outputs are stored in `out/<slug>/<slug>.mp4` (git-ignored to keep repository clean).

### 4. Interactive Web Preview Studio
Open the live Remotion preview player in your browser:
```bash
pnpm studio:preview
```

---

## 🎛️ Hybrid Template Catalog & Curated References

Instead of a single rigid golden project, Motion Lab provides a modular, multi-paradigm foundation:

- **23 Production Templates (`src/templates/`):** Native React and hydrated HTML-video bridges covering data rollups, Swiss grids, kinetic manifestos, product promos, and creative layouts.
- **Reference Library (`references/`):**
  - [`references/OPUS_5.5_STYLE_GUIDE.md`](references/OPUS_5.5_STYLE_GUIDE.md): Detailed breakdown of 24 visual motion styles and negative prompt constraints.
  - [`references/prompts/`](references/prompts/): 7 master production prompts (forensic loupe, caption news, TV news package, kino-montage, linocut long-take, telestrator, and diorama).
  - [`references/broll-examples/`](references/broll-examples/): 6 battle-tested HTML B-roll motion interaction examples.

---

## 🛡️ Multi-Layer Quality Gates & Tooling

Motion Lab enforces strict, zero-tolerance automated checks before any pixel is rendered:

```bash
# Run all automated static audits (Skills, Spec, Storyboard, AST, Motion, Slop, Craft, Math, Templates, Types)
pnpm check

# Run specific project checks
pnpm check --project whatsapp-campaign

# Generate 4x4 visual audit contact sheet for adversarial review
pnpm render:contact-sheet --project whatsapp-campaign

# Run the 14-point medical diagnostic health bot
pnpm doctor
```

---

## 🔊 Professional CC0 Sound Engine & Pure Motion Math

1. **CC0 Sound Library (`public/sfx/` & `SoundCuePlayer.tsx`):**
   - 50+ recorded CC0 audio files across 13 categories (whoosh, click, pop, typing, riser, impact, tick).
   - Frame-accurate `<SoundCuePlayer cues={cues} />` component with `-16 LUFS` integrated normalization.
   - AAC Sample-0 guard (`applySample0Guard`) to eliminate initial digital clipping.

2. **Pure Motion Math (`src/core/pure-motion-math.ts`):**
   - Closed-form `dampedSpring` and `trackSpring` implementations.
   - Content swap visibility filter (`layerVisibility` / `M.vis`).
   - Humanized curved cursor paths (`curvedPath` / `M.path`).
   - 4-point planar perspective homography (`computeHomography`, `homographyToCssMatrix3d`).

3. **High-Craft Scene Primitives (`src/primitives/`):**
   - `LoupeMagnifier`: Freeze-frame forensic magnifier with animated `#FF4A2E` ring and 2x-4x lens inset.
   - `LedgerCardStage`: Accounting ledger card with double red margin lines, rolling counters, and amber block erasures.
   - `BroadcastPackageStrap`: TV news lower-third strap with 3D flip-in, split-flap characters, and category pill.
   - `CutoutPuppetStage`: Articulated cutout puppet joints with SVG paper edge dilation and 12 FPS stepped hold.

---

## 💎 The 7 Mandatory Motion Director Laws

1. **Single Container Principle (Tek Kap İlkesi):**  
   Never cut between UI scenes abruptly. An existing visual container (button, card, panel) must continuously morph in size, border-radius, and position into the next state.
2. **Hardware Shell Anchor:**  
   UI components and cards cannot float loosely in empty space; they must be locked inside an authentic device shell (`DeviceMockupStage`, `PrecisionDashboardShell`, or `BrowserFrame`).
3. **Subgrid Shared Borders:**  
   Bento cards do not stand as isolated boxes; they share 1px hairline light-leaking borders via `gap-[1px] bg-white/[0.08]`.
4. **Never Invent Facts (Sıfır Uydurma Veri):**  
   Consumer and mobile products must showcase authentic features and realistic messages, completely prohibiting hallucinated DevOps or crypto telemetry.
5. **Anticipatory Stillness (300–600ms):**  
   Every major impact, text punch, or scene transition is preceded by a micro-pause ($300\text{--}500\text{ ms}$) to multiply visual impact.
6. **Dynamic Readability Threshold:**  
   Text hold times are dynamically calculated based on character count ($(\text{CJK} / 4.5) + (\text{Latin} / 15.0) + 1.5\text{s}$, minimum $2.5\text{s}$ on comparison/verdict screens).
7. **Deterministic Seeded Randomness:**  
   `Math.random` is prohibited. All procedural motion, particle fields, and noise textures use seeded PRNGs (`mulberry32`) tied directly to `frame / fps`.

---

## 🛠️ Creating a New Video in 3 Steps

### Step 1: Scaffold Project
```bash
pnpm new my-product --mode editorial-ui --aspect 9:16 --duration 12
```

### Step 2: Define Motion Contract
Edit `src/projects/my-product/spec.json` and `direction.md` to establish beats, camera paths, and easing contracts.

### Step 3: Verify & Render
```bash
pnpm check --project my-product
pnpm render:contact-sheet --project my-product
pnpm render --project my-product
```

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
Built with precision for motion directors, creative developers, and autonomous AI agents.
