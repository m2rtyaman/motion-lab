> Optional reference. RULES.md wins on any conflict.

# CALM, TACTILE 3D PRODUCT EDITORIAL GUIDE

The **Calm, Tactile 3D Product Editorial System** is a high-craft design and motion grammar designed for premium software, fintech, and luxury product showcases. It synthesizes tactile physical materials (soft neumorphic bevels, warm paper-clay substrates, and ambient occlusion) with calm, intentional camera choreography and shallow 3D perspective.

---

## 1. Core Philosophy & Material Aesthetics

Unlike chaotic hyper-energy tech reels or flat minimalist 2D slides, the Tactile Product Editorial style treats UI cards, data capsules, and typography as tangible physical artifacts resting in a calm, naturally lit studio space.

### The Tactile Color Palette (`TACTILE_PALETTE`)

| Token | Hex / Value | Semantic Role |
|---|---|---|
| **Warm Ivory** | `#F3F0E8` | Primary tactile canvas plinth and studio surface. |
| **Deep Forest** | `#153F33` | Rich architectural typography, high-contrast structural borders, and dark hero accents. |
| **Sage** | `#C8D6C9` | Muted organic secondary tone, inactive chart bars, and divider lines. |
| **Soft Mint** | `#63CDA9` | Positive growth telemetry, active toggle states, and primary capsule accent. |
| **Warm Amber** | `#EFB568` | Top-down overhead spotlight beams, highlight beacons, and focal badges. |
| **Blue-Violet** | `#9A88CF` | Secondary comparative category, technical metadata accent. |
| **Coral Glow** | `#E98E88` | Celebratory accent, alert indicator, and pastel confetti highlight. |

---

## 2. The 5 Motion Principles

### 1. "Float, do not drift"
Elements in 3D space must possess grounded physical weight. They may gently hover or elevate on an intentional axis (e.g. `hoverOffset: -6px` during interaction), but they **never drift aimlessly** through the viewport. Every object retains a locked coordinate anchor.

### 2. "Ease with intention"
Robotic linear movement and jarring instant cuts are forbidden. Every motion curve uses deliberate physics:
- **Arrivals:** Tight spring deceleration (`tension: 180`, `friction: 24` or `easeOutCubic`) with a 2–4% overshoot that immediately settles.
- **Departures:** Controlled acceleration (`power2.in` or `power3.in`) transferring momentum to the next arriving element.

### 3. "Give one thing focus"
Never animate multiple competing focal elements simultaneously. When a specific chart column, capsule, or button activates, secondary elements must gently dim (e.g. `opacity: 0.45`, `filter: blur(1px)`) to direct the viewer’s gaze without cognitive friction.

### 4. "Use depth carefully"
Shallow 3D perspective creates tangible tactility without disorienting distortion.
- Standard perspective rotation: `rotateX: 8deg`, `rotateY: -4deg` on a `perspective: 1200px` to `1400px` viewport.
- Extreme fisheye angles, aggressive barrel distortion, or rapid tumbling rotations are strictly prohibited.

### 5. "Keep micro-details rare"
Micro-details provide delight only when used sparingly. A single celebratory `SquareConfettiBurst` around a completed transaction badge has profound visual impact; a continuous particle blizzard degrades trust and reads as AI slop.

---

## 3. The 5-Step Object Animation Order

When bringing any new UI artifact, card, or capsule onto the screen, execute the choreography strictly in this 5-step sequential order:

```
[1. Position & Scale] ──> [2. Material & Light] ──> [3. Primary Motion] ──> [4. Label & Data] ──> [5. Secondary Accent]
```

1. **Step 1: Position/Scale (Spatial Arrival):**
   The primary bounding container enters from spatial depth or translates smoothly into its grid station.
2. **Step 2: Material/Light (Surface Illumination):**
   Top-edge specular bevel catches light; ambient contact shadow deepens to ground the object.
3. **Step 3: Primary Motion (Functional Action):**
   The internal mechanism activates (e.g. central pill expands outward into 3 capsules, or bar graph column rises).
4. **Step 4: Label/Data (Information Settlement):**
   Numbers roll and resolve into static legible figures; label text fades in with crisp kerning.
5. **Step 5: Secondary Accent (Residual Polish):**
   A subtle micro-interaction fires (a 1px curved brace snaps into place, or a warm halo pulse confirms completion).

---

## 4. The 12-Beat Storyboard Timeline

A master reference rhythm for a 12–15 second Tactile Product Editorial film:

| Beat | Name | Primary Primitive | Visual Action & Physics |
|---|---|---|---|
| **01** | **Dashboard Reveal** | `PerspectiveDashboardSlab` | Warm ivory slab floats in shallow perspective (`rotateX: 8deg`, `rotateY: -4deg`) with soft contact occlusion. |
| **02** | **Staggered Chart** | `PerspectiveDashboardSlab` | 5–7 metric columns rise sequentially from base plane with 60ms stagger. |
| **03** | **Focused Column** | `PerspectiveDashboardSlab` | Camera pushes 8%; neighboring bars dim to 40% as hero column highlights in `#63CDA9`. |
| **04** | **Chart-to-Capsule** | Single Container Morph | Hero column condenses into a single soft-neumorphic horizontal pill at viewport center. |
| **05** | **1-to-3 Pills** | `CapsuleCluster` | Left and right pills smoothly slide outward from central anchor with staggered ease-out. |
| **06** | **Curved Brace** | `CurvedBrace` | Thin SVG curved bracket draws down symmetrically, visually framing the 3 pills to a summary score. |
| **07** | **Hero Icon** | `TactileCapsule` | Central badge elevates slightly; gloss gradient sweeps across top beveled perimeter. |
| **08** | **Confetti Burst** | `SquareConfettiBurst` | A single crisp burst of pastel square particles radiates outward and clears within 18 frames. |
| **09** | **Halo Transition** | Soft radial gradient | Warm luminous halo ring pulses from icon center, wiping the background into a clean vertical plinth. |
| **10** | **Vertical UI** | `PerspectiveDashboardSlab` | Narrow mobile interface card glides into center view with crisp form controls. |
| **11** | **Primary Button** | `TactileCapsule` | Primary action button depresses by 3px (`scale: 0.98`), settling back with a spring confirmation click. |
| **12** | **Spotlight Wordmark** | `SpotlightCone` | Warm top-down amber spotlight cone illuminates the final brand wordmark in `#153F33`. |

---

## 5. Architectural Primitives Reference (`src/primitives/TactileProductStage.tsx`)

### `TactileCapsule`
Glossy, soft-neumorphic rounded pill container featuring:
- Inset top highlight (`inset 0 1px 1px #FFFFFF`) and bottom bevel shadow.
- Soft ambient contact shadow (`0 10px 22px -5px rgba(21, 63, 51, 0.12)`).
- Circular tinted icon slot, bold tabular numerical counter, and muted sub-label.

### `CapsuleCluster`
A responsive 1-to-3 pill expansion rig. Uses `interpolateClusterPositions()` to keep the center pill locked as an anchor while sliding left and right pills with customizable spacing and stagger.

### `CurvedBrace`
Parametric SVG curved bracket linking grouped items to an overarching telemetry score or takeaway headline. Calculates exact cubic Bezier curves with rounded elbows and center dip.

### `PerspectiveDashboardSlab`
A floating 3D container with hardware-calibrated perspective (`perspective: 1400px`, `rotateX: 8deg`, `rotateY: -4deg`), subtle hover oscillation, and multi-tier ambient occlusion shadows.

### `SquareConfettiBurst`
Single-shot celebratory confetti using deterministic Mulberry32 pseudorandom particle physics. Guarantees zero residual particles beyond `progress >= 1.0`.

### `SpotlightCone`
Overhead trapezoidal amber light beam (`computeSpotlightConeGeometry`) with vertical feathering and soft Gaussian blur, designed for illuminated brand resolution end-cards.
