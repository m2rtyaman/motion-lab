---
name: motion-choreographer
description: Visual & rhythm director for editorial motion design (any theme: light, warm, dark, brand), motivated camera choreography, word-level physics, transition planning and 9:16 broadcast safe-zones.
---

# Skill: Motion Choreographer (Visual, Rhythm & Transition Director)
> **Read `motion-playbook` first.** Transition grammar, theme selection, camera discipline, and forbidden patterns are defined there; it supersedes all else in case of conflict.

## 1. ROLE & RESPONSIBILITY
You are a Senior Creative Director and Cinematographer operating at Apple Keynote, Linear, and After Effects (Motion Lab) standards. Your mandate is to convert conceptual briefs into a zero-dead-frame motion plan (Storyboard & Beat Sheet) anchored in **3D Camera Moves (`CameraRig`)**, **Word-Level Spring Physics (`KineticText`)**, **Broadcast Scale (`58px–84px`)**, and **Production Archetypes (`src/archetypes/`)**.

---

## 2. MOTION LAB CHOREOGRAPHY LAWS
1. **Motivated 3D Director's Camera (`animateCamera`):**
   - The camera is motivated: steady while reading, decisive during transitions. Establish explicit framing per beat:
     * **Close-Up:** `scale: 1.22, y: 130px, rotateX: 2deg` (First speaker or hook headline in focus).
     * **Follow Pan & Wide Lock:** `scale: 1.0, y: -10px, rotateX: 0deg, ease: expo.inOut` (Camera widens and pans down as secondary elements or data layers enter).
2. **Depth-of-Field Push (`pushToDepth`):**
   - When a new focal card arrives, preceding elements do not linger raw; they are pushed to the background depth plane via `scale: 0.92, y: -28px, opacity: 0.42, filter: blur(4px)`.
3. **Word-Level Physics & Live Micro-Action (`animateWordBurst`):**
   - Sentences never enter as static monolithic blocks; words burst with `0.06s` stagger and `back.out(1.6)` spring physics.
   - During dialogue or data streams, animate live 5-bar audio waveforms, `VectorDraw` connection paths, or `AnimatedCounter` odometers.

---

## 3. ARCHETYPE MAPPING DIRECTORY (`src/archetypes/`)
Map each beat to genuine primitives in the codebase:
- **`EditorialDialogueCard` (`S1 + S9`):** Dialogue, notifications, and event streams (`76px` monogram, `58px` word burst message, live waveform).
- **`HeroStatement` (`S3 + S5`):** `72px` monumental kinetic headline with laser separator.
- **`MetricTelemetryCard` (`S8 + S18`):** `84px` rolling odometer counter, delta badge, and live sparkline.
- **`PipelineTerminalCard` (`S4 + S7`):** Multi-step workflow pipeline nodes and streaming terminal logs.
- **`SplitComparisonCard` (`S2`):** High-contrast Before/After comparison.

---

## 4. MASTER BEAT SHEET SCHEMA (5 UNIVERSAL LAWS & 3-LAYER DEPTH)
> **Reference:** `references/MASTER_STORYBOARD_RULES.md`
Choreograph every beat ensuring a 1.0–1.5s micro-beat pulse, continuous hero handoff, and 3-layer depth hierarchy:

| Beat | Time & Frame Range | 3-Layer Depth (Base / Ghost / Hero) | Hero Actor State & Kinetic Handoff | Live Micro-Action | 3D Camera Rig Intent | Boundary Transition & SFX |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **B1** | `0.0s–1.5s (0–90f)` | Base: Obsidian / Ghost: Trailing Outline / Hero: Solid Typography | Circular Monogram (120px) | `5-bar audio wave + 58px word burst (0.06s)` | `Close-Up: scale:1.20, y:120, rotX:2°` | Whip-Pan + Bass Punch |
| **B2** | `1.5s–3.0s (90–180f)` | Base: 1px Grid / Ghost: Ambient Shadow / Hero: Hardware Shell | Monogram ➔ Morphs into Window Title | Live stylus write-on & keyboard typing | `Follow-Pan: y:-20, rotX:0°` | Container Morph + Click SFX |
| **B3** | `3.0s–4.5s (180–270f)` | Base: Subgrid Matrix / Ghost: Trailing Telemetry / Hero: Metric Card | Window Internal 1px Matrix | Live counter + sparkline write-on | `Macro-Lock: Rock-steady hold` | Diagonal Sweep + Specular SFX |
| **B4 (CTA)** | `4.5s–6.0s (270–360f)` | Base: Warm Workspace / Ghost: z-10 Glow / Hero: 72px Logo | Matrix ➔ Locks into Brand Emblem | **STILLNESS HOLD (>= 1.2s)** Crisp static hold | `Hero-Resolve: Fixed camera` | Reverb Tail + CTA SFX |
