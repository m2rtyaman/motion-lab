# HYBRID MULTI-ARCHETYPE ORCHESTRATION GUIDE

## 1. ARCHITECTURAL VISION & PURPOSE
Locking a video to a single template (only bento cards or only terminal mockups) causes rhythmic monotony and audience fatigue in 15–30 second editorial motion videos.
With hybrid orchestration:
1. **Scene 1:** `bento-editorial` (analytical telemetry, metric cards, E2EE status capsule).
2. **Scene 2:** `kinetic-void` (monumental typography, sculptural rings, and kinetic letter bursts).
3. **Scene 3:** `terminal-mockup` (code stream, syntax highlighting, CLI prompt).
4. **Scene 4:** `product-promo` (specular glass brand badge and 1.2s stillness hold).

All archetypes share atomic components (`CapsulePill`, `TelemetryTile`, `TerminalShell`, `KineticBurstWord`), assets, and transition bridges. Through **TheHeroActor**, the viewer's eye is never lost.

---

## 2. SHARED PRIMITIVES LAYER (`src/primitives/`)

Structured according to Atomic Design principles:
- **Atoms (`src/primitives/atoms/`):**
  - `CapsulePill.tsx`: Morphable pill badge, status indicator, dynamic dot pulse.
  - `KickerBadge.tsx`: Editorial category and beat counter badge.
  - `HairlineGrid.tsx`: 1px subgrid hairline coordinate grid, corner crosshairs (+).
  - `CounterValue.tsx`: Tabular monospaced fluid number counter.
  - `VerifiedCursor.tsx`: SVG MacOS / Crosshair cursor actor.
- **Molecules (`src/primitives/molecules/`):**
  - `TelemetryTile.tsx`: Bento metric tile, percentage trend pill, footnote.
  - `CodeStreamBlock.tsx`: Terminal code lines, syntax highlighting, blinking cursor.
  - `ProceduralWaveform.tsx`: Deterministic audio frequency waveform bars.
- **Shells (`src/primitives/shells/`):**
  - `TerminalShell.tsx`: Traffic lights, tab bar, professional CLI window shell.
  - `PrecisionDashboardShell.tsx`: Titanium specular highlight bento dashboard shell.
  - `BrowserFrame.tsx`: Web browser window mockup.
- **Kinetic Engines (`src/primitives/kinetic/`):**
  - `KineticBurstWord.tsx`: Masked letter explosion engine with spring physics.
  - `SculpturalRings.tsx`: 3D-feel SVG champagne gold beveled concentric rings.
- **Bridges (`src/primitives/bridges/`):**
  - `TheHeroActor.tsx`: Continuous living carrier actor transferring momentum across scenes (`#the-hero-actor`).
  - `ContainerMorphBridge.tsx`: FLIP-based transition slot across scene layers (`SceneSlot`).

All primitives are centrally exported via `src/primitives/index.ts`.

---

## 3. SCENE-LEVEL MOTION CONTRACT (`spec.json`)

Hybrid projects use mode `"hybrid-orchestrated"`, defining scenes as a declarative sequence:

```json
{
  "mode": "hybrid-orchestrated",
  "singleContainer": true,
  "scenes": [
    { "id": "scene-bento", "archetype": "bento-editorial", "startFrame": 0, "endFrame": 180, "heroAnchorId": "#the-hero-actor" },
    { "id": "scene-kinetic", "archetype": "kinetic-void", "startFrame": 181, "endFrame": 380, "heroAnchorId": "#the-hero-actor" },
    { "id": "scene-terminal", "archetype": "terminal-mockup", "startFrame": 381, "endFrame": 528, "heroAnchorId": "#the-hero-actor" },
    { "id": "scene-payoff", "archetype": "product-promo", "startFrame": 529, "endFrame": 600, "heroAnchorId": "#the-hero-actor" }
  ]
}
```

---

## 4. CONTINUOUS HERO ACTOR HANDOFF (KINETIC HANDOFF)
Unmounting scenes like PowerPoint slides (`isBeatX && <Scene/>`) is strictly forbidden (M002 violation).
Instead:
1. `TheHeroActor` remains physically mounted in the DOM from frame 0 through the final frame (`opacity > 0`).
2. In Scene 1, it begins as a data capsule inside a Bento panel.
3. At the transition boundary (via `transitionContainerMorph`), it rapidly expands and flattens into the baseline background stripe for Scene 2's kinetic typography.
4. At the end of Scene 2, it shrinks into a CLI prompt cursor (`>_`) and unfolds into a `TerminalShell` window in Scene 3.
5. In the final scene, it morphs into a specular brand card holding static for 1.2 seconds (72 frames).

---

## 5. LINTER & AUDITOR INTEGRATION
- **`validate-spec.mjs`:** Validates the `scenes` array and verifies supported archetype identifiers.
- **`slop-linter.mjs`:** Enforces `TheHeroActor` and `useRemotionGSAP` usage.
- **`craft-audit.mjs`:** Validates hardware shell anchoring for UI components without falsely penalizing kinetic typography scenes.
- **`motion-audit.mjs`:** Recognizes `transitionContainerMorph` and `transitionZoomPunch` bridges, preventing abrupt cut and unmount errors.
