> Optional reference. RULES.md wins on any conflict.

# MOTION LAB — MOTION GRAPHICS REFERENCE & STYLE GUIDE

This guide distills professional motion graphic standards, 24 visual style families, prompt architectures, and boundary constraints into a single authoritative reference manual.

---

## 1. 8 Primary Style Families & 24 Visual Styles

| Family | Style Name | Core Mechanism & Characteristics | Boundary Constraints |
|---|---|---|---|
| **Handmade** | `collage` | NOGGIN / Terry Gilliam style 2–4px paper-cut edges, 12 FPS stepped joint animation (`shoulder`, `elbow`, `jaw`), ±2px deterministic hand-shake. | No flat vector lines; tactile paper textures and ambient drop shadows mandatory. |
| | `paper` | Origami, torn paper, embossed shadows, folding transitions. | Neon colors and metallic sheens strictly forbidden. |
| | `papercraft-editorial` | Papercraft Cutout Editorial (`PapercraftCutoutStage`): `JaggedPaperTear`, `ObjectScatter`, `MetronomeGauge`, `ScribbleAnchor`, `PastelBubbleOcclusion`, `ChecklistScrubber`, `PaperCard`. Warm cream and terracotta palette (`PAPERCRAFT_PALETTE`), 10-beat rhythm, 14 motion techniques, pendulum swing, and radial sticker burst. See `references/PAPERCRAFT_EDITORIAL_GUIDE.md`. | Synthetic digital gradients and PowerPoint cuts forbidden; physical tears and soft occlusion mandatory. |
| | `handdrawn` | Scribbles, ink lines, cel-boil (1:1 in high action, 1:2 in dance, 1:3 in idle holds). | Perfect geometric vectors forbidden; hand-drawn imperfection mandatory. |
| | `painted` | Oil paint, watercolor brushstrokes, organic canvas texture. | Crisp UI windows and digital gradient fills forbidden. |
| | `print` | Woodcut, linocut, S-curve print tone mapping (`printToneCurve`), directional sky lock. | Pure saturated RGB forbidden; newsprint/ink tone mapping mandatory. |
| | `line` | Minimalist continuous single-line drawing (Atelier Linea), continuous transformation from seed to tree to structure. | Disconnected multiple lines forbidden; unbroken single-line rule. |
| | `mosaic` | Stained glass, stone/ceramic mosaic fracture and assembly. | Smooth gradient fills forbidden; discrete tiles mandatory. |
| **Graphic** | `typography` | Full-screen kinetic manifesto, spring letter bursts (`back.out(1.6)`), masked split transitions. | Illegible micro-fonts forbidden; 72-frame (1.2s) minimum reading hold. |
| | `geometry` | Bauhaus / Swiss grid, 1px shared hairline grids, primary color blocks. | Arbitrary asymmetry forbidden; strict mathematical grid ratios mandatory. |
| | `infographic` | Rolling counters (fixed-width tabular cells), financial ledger card (`LedgerCardStage`), double red ledger margins. | Hallucinated DevOps telemetry forbidden; authentic metrics mandatory. |
| | `specimen` | Editorial Specimen (`EditorialSpecimenStage`): `RegistrationGrid`, `CornerHandles`, `AnnotationCallout`, `MeasurementArc`, `ComponentStrip`, `TypeInterlock`. Warm ivory and scarlet palette, forensic/archival inspection. See `references/EDITORIAL_SPECIMEN_GUIDE.md`. | Unanchored floating cards forbidden; coordinate and hairline grid anchors mandatory. |
| | `deconstructive-type` | Structural Deconstructive Typography (`DeconstructiveTypographyStage`): `DeconstructiveWordAssembly`, `IlluminatedFloorSurface`, `HorizontalGraphicSlit`. Dark green-black ground and mint accent (`DECONSTRUCTIVE_MINT_PALETTE`), letters decomposing into stems/arcs/dots, Layered Timing, secondary ghost outline offset. See `references/DECONSTRUCTIVE_TYPOGRAPHY_GUIDE.md`. | Dissolving typography into amorphous liquid or micro-particles forbidden; structural letter anatomy and 3-layer depth mandatory. |
| **Spatial** | `product` | Macro close-up, hardware anchoring (`DeviceMockupStage`), authentic device shell. | Floating unanchored bento cards strictly forbidden. |
| | `tactile-editorial` | Calm Tactile 3D Product Editorial (`TactileProductStage`): `TactileCapsule`, `CapsuleCluster`, `CurvedBrace`, `PerspectiveDashboardSlab`, `SquareConfettiBurst`, `SpotlightCone`. Warm ivory and deep forest palette (`TACTILE_PALETTE`), shallow 3D perspective (`rotateX: 8deg`, `rotateY: -4deg`), 12-beat cadence, 5 motion principles. See `references/TACTILE_PRODUCT_EDITORIAL_GUIDE.md`. | Uncontrolled 3D drift and continuous particle swarms forbidden; shallow perspective and singular confetti burst mandatory. |
| | `sculptural-reel` | Sculptural Motion Reel (`SculpturalReelStage`): `ChampagneBeveledRing`, `DiagonalGradientSweep`, `PerspectiveDiscCascade`, `PaletteGridReset`. Champagne gold (`#F5D77F`), magenta (`#E01E5A`), deep plum (`#4A154B`), and coral palette (`SCULPTURAL_REEL_PALETTE`), 10-beat master roadmap, 3D disc cascade, 20s handoff rule. See `references/SCULPTURAL_REEL_GUIDE.md`. | Heavy Three.js and cheap chrome shaders forbidden; pure CSS 3D/SVG bevels and specular gleam mandatory. |
| | `blueprint` | CAD / KiCad exploded assembly, mechanical keyboards, unified coordinate frame. | Decorative fake screws or wires forbidden; authentic bill-of-materials required. |
| | `miniature` | Tilt-shift depth of field, physical diorama look, elevated perspective. | Infinite depth-of-field forbidden; macro shallow focus mandatory. |
| | `nature` | Wind-swayed foliage, particle physics, procedural lighting. | Static backdrops forbidden; living environmental ambience required. |
| **Digital** | `pixel` | HD-2D pixel art, 8-bit / 16-bit strict palette constraints, parchment maps. | Vector smoothing forbidden; locked integer pixel ratios mandatory. |
| | `retro` | CRT scanlines, phosphor persistence, VHS tracking jitter. | Modern flat vector palettes forbidden; authentic analog distortion mandatory. |
| **Abstract** | `hud` | Falcon Eye-9 state machine, staged initialization, `#00E5FF` -> `#FF3D00` target lock evolution. | Random blinking numbers forbidden; deterministic state machine mandatory. |
| | `light` | Prismatic light leaks, optical refraction, diffused ambience. | Avoid raw cyan/magenta neon glow (lint-enforced). |
| | `glass` | Specular edge refraction, titanium/frosted glass frame, angled spotlight highlights. | Opaque flat plastic forbidden; optical reflection and refraction mandatory. |
| **Image** | `cinematic` | Anamorphic aspect ratio, fine film grain, motivated camera momentum. | Rapid amateur jump-cuts forbidden; cinematic camera acceleration mandatory. |
| | `archive` | Backlit light-table, forensic loupe (`LoupeMagnifier`), side-by-side manuscript comparison. | Fabricated transcription copy forbidden; original documents on screen for min 2.5s. |
| **Interface** | `ui` | Apple & Linear micro-interactions, realistic typing, curved cursor trajectories (`curvedPath`), FLIP container morphing. | Static screen captures forbidden; interactive living interface mandatory. |
| | `mobile-sting` | Playful Mobile App Sting (`MobileStingStage`): `WavyRibbon`, `CircularApertureWipe`, `TiltedPhoneStage`, `WordBurstSwap`, `VoiceControlCard`. Vibrant lavender and purple palette (`MOBILE_STING_PALETTE`), 3/4 angled phone perspective (`rotateY: -16deg`, `rotateX: 8deg`), beat-locked word bursts. See `references/MOBILE_APP_STING_GUIDE.md`. | Raw neon and unanchored cards forbidden; hardware shell and stable baseline mandatory. |
| | `saas-launch` | 9-Shot Master SaaS & App-Launch Editorial: 5-stage deterministic pipeline (`Analyse -> Storyboard -> Prompt -> Generate -> Finish`), 9-shot sequence (`App card -> Store -> Login -> AI composer -> Phone focus -> Micro UI -> Feature matrix -> Brand end -> URL hold`), 6-block master prompt, 60-second quality gate. See `references/SAAS_WORKFLOW_GUIDE.md`. | Sprawling improvised prompts forbidden; 6-block deterministic prompt and 72-frame resolve mandatory. |
| | `pastel-editorial` | 9:16 Vertical Pastel 3D Editorial (`MobileStingStage`): `CreatorLogPanel`, `ClapperboardCTA`, `WaveformPulse`. Warm paper and slate palette (`PASTEL_EDITORIAL_PALETTE`), occlusion wipes (`clipPath: inset()`), hinged clapperboard impact bounce. See `references/MOBILE_APP_STING_GUIDE.md`. | Layout thrashing forbidden; clipPath and scale spring physics mandatory. |
| | `interactive-promo` | 20-Second Interactive App Promo (`InteractivePromoStage`): `WriteOnScript`, `WarpShapeFrame`, `VerticalPanelReset`. Dark editor and warm workspace contrast (`PROMO_PALETTE`), 5-stage message funnel (`Hook -> Introduce -> Demonstrate -> Payoff -> CTA`), live handwriting and vertical panel wipes. See `references/PROMO_20S_WORKFLOW_GUIDE.md`. | Multiple competing focal points forbidden; single word/UI hierarchy and clear CTA mandatory. |

---

## 2. Production Prompts Collection (`references/prompts/`)
1. **`visual-investigation.txt`**: Forensic inquiry, loupe evidence magnification, time synchronization (`T+xx.x`), red circular reticle (`#FF4A2E`).
2. **`caption-news.txt`**: Silent social media broadcast, spring-loaded word blocks, accounting ledger card, rolling counters.
3. **`news-package.txt`**: Broadcast television lower-third package, 3D flip-in strap, parallelogram category badge, split-flap text matrix.
4. **`kino-montage.txt`**: 1920s constructivist avant-garde, -18° diagonal girders, duotone scarlet-black printing, photomontage tower.
5. **`printed-long-take.txt`**: 3D block-print continuous shot, directional sky lock, camera clearing radius ($r=3.5\text{m}$).
6. **`telestrator.txt`**: Sports telestrator breakdown, 4-point perspective homography ground plane, freeze frame, tracking rings.
7. **`memphis-diorama.txt`**: Memphis style colorful diorama, isometric pastel environments, tactile mechanical toy movements.

---

## 3. Golden Negative Rules (Anti-Slop Invariants)
1. **Never Invent Facts:** Fabricating arbitrary server telemetry (e.g. "Quantum Enclave", "Signal Ratchet Ratified", "ops/sec") in consumer/mobile videos is strictly forbidden.
2. **Hardware Shell Anchor:** Components and cards must never float loosely in void space (anchor them inside `DeviceMockupStage`, `PrecisionDashboardShell`, or `BrowserFrame`).
3. **Subgrid Shared Borders:** Cards do not sit as isolated boxes; establish 1px shared hairline borders via `gap-[1px] bg-white/[0.08]`.
4. **Zero Redundancy Typography:** The headline articulates customer value while the UI badge explains the technical operation; never repeat identical copy.
5. **Dynamic Readability Hold:** Comparison screens and evidence documents must hold motionless for at least 2.5 seconds.
6. **AAC Sample-0 Guard:** Apply a 25ms linear audio fade to frame-0 sound cues to eliminate digital clipping clicks.
