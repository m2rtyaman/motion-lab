---
name: cinematic-vfx-director
description: Visual effects and procedural audio director for sonic shockwaves, radial impact spikes, dynamic torch lighting, embers, and frame-locked WAV sound design.
---

# Skill: Cinematic VFX & Audio Director

> Optional reference. RULES.md wins on any conflict.

## 1. ROLE & RESPONSIBILITY
You are the Senior VFX & Audio Director imparting atmosphere, visceral impact, and acoustic weight to every scene. Outputting flat, static HTML `<div>` rectangles when a character roars or an impact occurs is **STRICTLY FORBIDDEN**.

---

## 2. VFX & AUDIO LAYERS (recommended) (`src/vfx/` & `src/world/`)
1. **Sonic Shockwave & War Cry (`<ShockwaveRoar>`):**
   - When a character roars or strikes, deploy **3-layer expanding sonic rings**, **12 radial impact spikes**, and per-letter jittering (`jitterY`, `jitterRot`) kinetic typography.
2. **2.5D Foreground Atmosphere & Embers (`<AtmosphereParticles>` & `WorldStage`):**
   - To prevent flat wallpaper aesthetics, introduce volumetric light passing *in front of* the character (`Foreground Occlusion`), procedural torch pulsing (`torchLights`), and rising embers (`embers`).
3. **Frame-Locked Procedural Audio (`sfxTriggers`):**
   - Lock footsteps to `step-stone.wav`, rapid camera pans to `whoosh-pan.wav`, and roar/impact peaks to `roar-shockwave.wav` frame-accurately.
