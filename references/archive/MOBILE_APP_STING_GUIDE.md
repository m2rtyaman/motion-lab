> Optional reference. RULES.md wins on any conflict.

# MOBILE APP STING & VERTICAL PASTEL 3D EDITORIAL GUIDE

A comprehensive motion design grammar and architectural system for high-conversion mobile app trailers, playful feature stings, and vertical 3D editorial motion graphics.

---

## 1. System Overview & The Two Paradigms

This architectural guide synthesizes two distinct, battle-tested visual motion paradigms:

1. **16:9 Playful Mascot / Mobile App Sting (Wide)**
   - **Tone & Mood:** High energy, vibrant, snappy, consumer-grade delight without visual clutter or cheap slop.
   - **Signature Mechanics:** S-curve continuous wavy ribbon, rapid beat-locked word bursts, radial aperture wipe, 3/4 tilted phone perspective with floating concentric backdrop discs, and responsive voice control cards.
   - **Palette:** `MOBILE_STING_PALETTE` (Soft Lavender `#EBE6FF`, Bold Violet `#7C5CFC`, Electric Lemon `#F6FF60`, Midnight Charcoal `#12131A`, Mint Splash `#44E5BA`, Coral Accent `#FF8C78`).

2. **9:16 Vertical Pastel 3D Editorial (Portrait)**
   - **Tone & Mood:** Sophisticated, tactile, editorial magazine pacing, calm luxury and creative workflow clarity.
   - **Signature Mechanics:** Micro-button triggers, audio toggle with waveform signal line, tactile calendar grid with display typography, segmented creator log panel with occlusion wipe rise, mini hinged clapperboard CTA button with impact bounce, and kinetic type locked to Swiss registration grids.
   - **Palette:** `PASTEL_EDITORIAL_PALETTE` (Warm Paper `#FAF8F5`, Slate Mist `#D5DCE2`, Soft Sage `#C2D5C8`, Warm Clay `#EAD5C3`, Crimson Ink `#C93B2B`, Deep Ink Charcoal `#1B1E24`).

---

## 2. 16:9 Playful App Sting Storyboard Grammar

The master 6-beat sequence for a 6–10s playful mobile app promo:

```
[01 Mascot / Hero Intro] ──> [02 S-Curve Ribbon] ──> [03 Word Burst Swap] ──> [04 3D Tilted Phone] ──> [05 Voice Control UI] ──> [06 Brand Recall]
```

| Beat | Stage Element | Primary Primitive | Visual Action & Physics |
|---|---|---|---|
| **01** | **Hero Brand Spark** | Dynamic Vector Hero | Clean vector icon/mascot pops in with spring bounce (`scale: 0 -> 1.12 -> 1.0`). |
| **02** | **Continuous Guide Ribbon** | `WavyRibbon` | Parametric Bézier rounded ribbon sweeps across canvas via `strokeDashoffset`, drawing the eye toward center. |
| **03** | **Rapid Word Swaps** | `WordBurstSwap` | Stable-baseline card fires 3–4 rapid feature word + icon punch swaps locked to audio downbeats. |
| **04** | **Radial Aperture Punch** | `CircularApertureWipe` + `TiltedPhoneStage` | Radial circle punches through lavender card, revealing the 3/4 tilted perspective phone (`rotateY: -16deg`, `rotateX: 8deg`). |
| **05** | **Feature Voice Card** | `VoiceControlCard` | Floating dark rounded card slides up (`HOLD TO TALK`, speaker avatar, dynamic waveform bars pulsing with sound). |
| **06** | **Brand Lockup Recall** | `WordBurstSwap` / Logo | Clean resolution into final app icon, tagline, and download call-to-action held for min 1.2s (72 frames). |

---

## 3. 9:16 Vertical Pastel 3D Editorial Storyboard Grammar

The master 7-beat sequence for a 10–15s vertical editorial app showcase:

```
[01 Micro-Button] ──> [02 Toggle & Waveform] ──> [03 Calendar & Display Type] ──> [04 Creator Log Panel] ──> [05 Hit Render CTA] ──> [06 Kinetic Grid Type] ──> [07 Waveform Zoom]
```

| Beat | Stage Element | Primary Primitive | Visual Action & Physics |
|---|---|---|---|
| **01** | **Micro-Button Entry** | Minimal Pill Button | Minimal pill button enters with snappy spring on warm paper background (`#FAF8F5`). |
| **02** | **Toggle & Signal Pulse** | `WaveformPulse` | Active state toggles; horizontal heartbeat signal draws across canvas with animated pulse bead. |
| **03** | **Calendar & Display Type** | Tactile Grid Plinth | Editorial calendar card glides into focus paired with high-contrast serif display headline. |
| **04** | **Creator Log Occlusion** | `CreatorLogPanel` | Floating card rises from bottom with occlusion wipe (`clipPath: inset()`), showing status pills and striped progress bar. |
| **05** | **Hit Render Clapper** | `ClapperboardCTA` | Action button depresses; mini clapperboard top arm snaps shut (`clapperAngle: 20deg -> 0deg`) with impact scale bounce. |
| **06** | **Kinetic Type on Grid** | Full-frame Type | Bold manifesto statement cuts into Swiss registration grid lines with zero unmount flicker. |
| **07** | **Waveform Zoom Outro** | `WaveformPulse` + Logo | Camera pushes smoothly into the signal line, resolving onto the final brand logo. |

---

## 4. Reusable Motion Recipes

### 1. Pop + Settle
- **Usage:** Buttons, icons, word burst cards.
- **Physics:** Overshoot scale curve.
  - Scale: `0.0 -> 1.08 -> 0.97 -> 1.0` over 18–24 frames.
  - Rotational tilt: `±3deg` settling to `0deg`.

### 2. Ribbon Reveal
- **Usage:** Scene guiding transitions.
- **Physics:** Smooth `strokeDashoffset` interpolation from `totalLength` to `0` using `power2.out` or `power3.inOut`.
- **Math:** `calculateRibbonDashOffset(progress, totalLength)`.

### 3. Word Burst Swaps
- **Usage:** Multi-feature callouts in compact space.
- **Physics:** High-velocity step animation with micro-pop on each index change (`popProgress`). Fixed container height and flex-center baseline ensure zero layout thrashing.

### 4. Circular Aperture Wipe
- **Usage:** Scene morphing without PowerPoint-style crossfade.
- **Physics:** Exponential radius expansion `r = minR + (maxR - minR) * p^exponent`. As the circle crosses diagonal viewport bounds, background opacity smoothly clears.

### 5. Parallax Product (3/4 Perspective)
- **Usage:** Tilted phone showcase.
- **Physics:**
  - Viewport perspective: `1200px`.
  - Primary chassis: `rotateY: -16deg`, `rotateX: 8deg`.
  - Floating idle tilt: `effectiveRotateX = 8 + sin(t) * 1.5`, `effectiveRotateY = -16 + cos(t) * 1.2`, `effectiveTranslateY = sin(t * 1.5) * 6`.
  - Concentric backdrop discs: translate at 30% parallax rate in depth (`z: -120px`).

### 6. Occlusion Wipe
- **Usage:** Status panels, drawers, creator logs.
- **Physics:** Card elevates along Y axis while reveal mask expands via `clipPath: inset(0 0 (1 - p)*100% 0)`. Avoids jarring layout pushes.

---

## 5. Architectural Primitives Reference (`src/primitives/MobileStingStage.tsx`)

### `WavyRibbon`
Continuous SVG Bézier ribbon with dynamic `strokeDashoffset`, customizable `waveCount`, `amplitude`, and optional soft glow drop.

### `CircularApertureWipe`
Punches through cards or canvas with radial circular aperture mask, exposing nested stages or video underneath.

### `TiltedPhoneStage`
3D perspective phone rig with dynamic island, inner screen slot, and 3 concentric parallax ambient discs.

### `WordBurstSwap`
Centered feature pill supporting icon slots, category badge, and punchy scale-pop swaps with stable baseline.

### `VoiceControlCard`
Dark floating capsule UI with microphone icon, language prompt, and animated multi-bar audio equalizer.

### `CreatorLogPanel`
Floating 9:16 vertical card with segmented status pills, animated striped progress bar, and occlusion wipe rise.

### `ClapperboardCTA`
Hinged clapperboard action button with stripe pattern, angle tweening, and impact scale spring.

### `WaveformPulse`
Heartbeat/signal line with animated pulse bead and stroke dash expansion.

---

## 6. Anti-Slop Discipline & Boundary Rules

1. **Zero Raw Neon Slop:** Pure `#00ffff` or `#ff00ff` are strictly forbidden. Use curated tokens like `#7C5CFC` and `#EBE6FF`.
2. **No Floating Unanchored Slop:** Every floating card must have intentional perspective, backdrop grounding, or hardware shell anchorage.
3. **No Cheap System Emojis:** Never use native OS emojis (💬, 🎙️, 🚀). Always use clean multi-part SVG paths.
4. **Legibility Standard:** Word burst swaps must remain visible for at least 8–16 frames per word; final CTA and brand lockup must remain static for minimum 1.2s (72 frames).
5. **GPU-Only Transforms:** Only animate `transform`, `opacity`, and `filter`. Direct tweening of `top`, `left`, `margin`, or `padding` is strictly prohibited.
