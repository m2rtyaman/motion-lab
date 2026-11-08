---
name: object-separation
description: Separate a person, product or UI subject from the background in Remotion using SVG paths, alpha masks, CSS clip-paths, and procedural rotoscoping. Clean, deterministic, API-key-free subject isolation for motion design overlays.
---

> Optional reference. RULES.md wins on any conflict.

# Object & Subject Separation (Remotion Motion Graphics)

A deterministic, lightweight method to isolate and separate foreground elements (devices, UI cards, characters, product mockups) from their background in **Remotion** without external heavy PyTorch or GPU dependencies.

## 1. Principles

1. **Lightweight & API-Key-Free:** Avoids downloading multi-gigabyte models or third-party web APIs. Uses SVG vector masks, CSS `clip-path`, and alpha channel composition directly inside the React/Remotion render tree.
2. **Deterministic & Frame-Accurate:** Mask shapes and cutout positions interpolate smoothly through GSAP or Remotion interpolation (`interpolate(frame, ...)`).
3. **Multi-Plane Layering:** Isolates the subject onto an elevated Z-index layer, allowing kinetic typography, glowing particles, or HUD telemetry to pass behind the subject while remaining in front of the background.

## 2. Remotion Separation Techniques

### Technique A: SVG Vector Mask (`<mask id="...">`)
Ideal for precise geometric or organic cutouts that morph dynamically:

```tsx
<svg className="absolute inset-0 w-full h-full pointer-events-none">
  <defs>
    <mask id="subject-cutout-mask">
      <rect width="100%" height="100%" fill="white" />
      <circle cx={subjectX} cy={subjectY} r={radius} fill="black" />
    </mask>
  </defs>
</svg>
```

### Technique B: CSS Clip-Path / Polygon Animation
Ideal for phone screens, product containers, and diagonal reveals:

```tsx
<div
  className="absolute inset-0 z-20"
  style={{
    clipPath: `polygon(0 0, ${progress * 100}% 0, ${progress * 100}% 100%, 0 100%)`,
  }}
>
  {/* Isolated foreground element */}
  <img src="/assets/product-hero.png" className="w-full h-full object-contain" />
</div>
```

### Technique C: Multi-Layer Sandwiched Typography
Place the background video/image on layer 1, animated kinetic typography on layer 2, and the isolated cutout subject on layer 3:

```tsx
<AbsoluteFill>
  {/* Layer 1: Background Scene */}
  <div className="absolute inset-0 bg-neutral-900" />

  {/* Layer 2: Typography passing behind subject */}
  <div className="absolute inset-0 flex items-center justify-center z-10">
    <span className="text-9xl font-black text-white/20 tracking-widest">{text}</span>
  </div>

  {/* Layer 3: Separated Isolated Subject */}
  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
    <img src="/assets/isolated-subject.png" className="w-[600px] h-auto drop-shadow-2xl" />
  </div>
</AbsoluteFill>
```

## 3. Workflow Integration
When creating explainer or product promo reels that feature isolated products:
1. Store isolated PNG/SVG assets in `public/assets/` or harvest them via `pnpm harvest`.
2. Wrap the cutout in a dedicated actor component or `<LayerPlane />`.
3. Animate entry and scale using `useRemotionGSAP`.
4. Validate compliance using `pnpm check --project <slug>`.
