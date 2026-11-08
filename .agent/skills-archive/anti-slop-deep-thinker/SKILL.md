---
name: anti-slop-deep-thinker
description: Optional planning aid for complex briefs - brand research (if you have web access), safe-zone checks, beat pacing, and a short self-review before writing scene code. Not required for the standard v2 workflow in RULES.md.
---

> Optional reference. RULES.md wins on any conflict.

# Deep planning aid (optional)
You are a Principal Creative Technologist, Motion Physics Architect, and Ruthless QA Auditor.
Your primary adversary is **"LLM Laziness"**—the tendency to guess brand SVGs and UI layouts from memory, write shallow wrapper components, hardcode static 2D boxes, use lazy opacity crossfades, ignore viewport overflow in 9:16 aspect ratios, and game linter thresholds with fake motion.

Use as much of this as helps. For simple briefs, skip it and follow RULES.md. A written blueprint (`choreography-blueprint.md`) is optional; nothing here blocks writing code.

---

## PHASE 0: OPTIONAL WEB RESEARCH
If you have web access and the user supplied a brand or product, searching can improve fidelity (do not copy real brand UI or logos unless the user provides the assets). Without web access, skip this phase. Possible queries:

1. **Query 1 — Official Brand DNA & Exact SVG `<path>` Coordinates:**
   - **Target Sources:** `simpleicons.org`, `github.com/simple-icons/simple-icons`, `commons.wikimedia.org` (raw `.svg` XML), `lucide.dev`, `tabler.io/icons`, and official brand guidelines (`whatsappbrand.com`, `stripe.com/brand`, `brand.linear.app`, etc.).
   - **Mandatory Output in Blueprint:** Exact official hex codes, official typography stack, and verbatim SVG `<path d="...">` coordinates for the brand emblem and core icons.
2. **Query 2 — Authentic Product UI Tear-Down & Screen Anatomy:**
   - **Target Sources:** Official product release blogs/changelogs (`blog.whatsapp.com`, `linear.app/changelog`, `apple.com`), `mobbin.com`, `pageflows.com`, `growth.design`.
   - **Mandatory Output in Blueprint:** Exact anatomical details of the real product screen (e.g., speech bubble corner tail SVG geometry `tail-in` / `tail-out`, encryption lock header layout, participant video tile badges, status indicators, and real micro-copy).
3. **Query 3 — Elite Motion Studio Case Study Breakdowns (Scene Metaphors):**
   - **Target Sources:** Written case studies and creative breakdowns from **Ordinary Folk**, **Buck (`buck.co`)**, **ManvsMachine**, **Ravie (`ravie.co`)**, **Giant Ant**, **Motionographer**, **Wine After Coffee**, and **Behance Motion Graphics Curated**.
   - **Mandatory Output in Blueprint:** Concrete visual transition metaphors extracted from studio breakdowns—specifically **Match-Cuts** (an internal icon/shape scaling or morphing to become the next scene's container), **3D Exploded Layer Views** (UI layers separating along the Z-axis in 3D perspective), and **Macro-to-Wide Camera Pulls**.
4. **Query 4 — Technical SVG Filters & 3D Depth Recipes:**
   - **Target Sources:** `tympanus.net/codrops`, `gsap.com/showcase`, `frontend.horse`.
   - **Mandatory Output in Blueprint:** Specific SVG `<defs>` filter pipelines (`<feGaussianBlur>` + `<feColorMatrix>` gooey liquid morph, `<linearGradient>`, `<radialGradient>`, specular rim lighting) and 3D CSS `preserve-3d` Z-elevation planes (`translateZ`).

---

## PHASE 1: VISUAL DECONSTRUCTION & BRAND FIDELITY MATRIX
Using your Phase 0 web findings and user inputs, extract the exact visual DNA:

1. **Surface & Luminance Polarity + Multi-Beat Color Blocking (`beatPalettes`):**
   - Define the primary canvas polarity AND a 4-beat contrasting **Color-Blocking Progression** so the video never stagnates on a single flat background color.
2. **Exact Token Extraction Table:**
   - `bgCanvas`, `bgSurfaceElevated`, `bgGlassBackdrop`
   - `textPrimary`, `textSecondary`, `textTechnicalMono`
   - `accentPrimary` (exact official hex), `accentSemanticSuccess`, `accentSemanticWarning`
   - `borderHairline` (1px subtle structural dividers) & `shadowElevation` (multi-layered ambient + key light shadows)
   - `svgGradientStops` (multi-stop `<linearGradient>` & `<radialGradient>` stops for vector depth)
3. **UI Inventory & Feature Mapping:**
   - List every distinct UI module and authentic anatomical micro-detail verified in Phase 0 Query 2.
   - *Rule:* Never replace real product UI anatomy with generic placeholder boxes.

---

## PHASE 2: VIRTUAL CANVAS & VIEWPORT BOUNDING-BOX MATH
9:16 vertical videos (`1080x1920`) and 16:9 widescreens (`1920x1080`) require explicit coordinate decoupled math so desktop UIs never get crushed or clipped on the right edge.

For EVERY beat, calculate and verify the following equations:
1. **Virtual Workspace Dimensions:**
   - Define the unscaled desktop/stage dimensions: $W_{\text{virtual}} \times H_{\text{virtual}}$ (e.g., $940 \times 1460$ or $1440 \times 900$).
2. **Horizontal Overflow Equation:**
   - Sum all horizontal panels active in the current beat:
     $$W_{\text{total}} = W_{\text{sidebar}} + W_{\text{mainContent}} + W_{\text{drawerOrModal}}$$
   - Verify that $W_{\text{total}} \le W_{\text{virtual}}$.
3. **Camera Frustum & Safe-Zone Projection:**
   - Given output resolution $(W_{\text{out}}, H_{\text{out}})$, camera scale $S(f)$, and camera pan $(X_{\text{cam}}(f), Y_{\text{cam}}(f))$:
   - Calculate the visible world-space bounding box at start, mid, and end frames of the beat:
     $$X_{\text{left}} = X_{\text{focus}} - \frac{W_{\text{out}}}{2 \cdot S(f)}, \quad X_{\text{right}} = X_{\text{focus}} + \frac{W_{\text{out}}}{2 \cdot S(f)}$$
   - **Check:** Confirm that the active focal element lies 100% inside $[X_{\text{left}} + 48\text{px}, X_{\text{right}} - 48\text{px}]$. Zero text clipping is tolerated.

---

## PHASE 3: NARRATIVE PACING, MATCH-CUT & ANTI-REDUNDANCY CONTRACT
Evaluate the storyboard using cinematic laws rather than catalog feature lists:

1. **Duration variance (guideline):**
   - List the frame duration $D_i$ of every beat.
   - If all beats are about the same length, pacing feels robotic. Adjust beat lengths to alternate between **Staccato Cuts** (35–55 frames) and **Focus Holds** (75–150 frames).
2. **Copywriting vs. UI Zero-Redundancy Check:**
   - Compare the marketing headline (`overlayHeadline`) with the internal UI header (`widgetTitle`) for every beat.
   - *Rule:* Jaccard word similarity must be $0\%$. While the UI shows **WHAT** the feature is, the kinetic headline must state the **VALUE/OUTCOME**.
3. **Studio Match-Cut & 3D Transition Motivation Contract:**
   - Linear "feature catalog" slides are banned. Every transition $Beat_i \to Beat_{i+1}$ must declare a studio-grade physical metamorphosis:
     - `match-cut-morph` (An internal vector icon, signal node, or chat bubble physically expands/morphs to become the next beat's container)
     - `3d-exploded-layer` (The stage tilts in 3D perspective `rotateX`/`rotateY` while child layers separate along `translateZ(+40px..+120px)`)
     - `liquid-gooey-merge` (SVG elements merge or split through `<feGaussianBlur>` + `<feColorMatrix>` alpha threshold filtering)
     - `portal-zoom-dive` (Camera dives through an active badge, lock shackle, or avatar ring into the next world)

---

## PHASE 4: Z-AXIS HYGIENE, 3D PLANES & ANTI-GHOSTING STATE MACHINE
Overlapping semi-transparent layers from consecutive beats ("ghosting") immediately destroy visual quality.

Write out an explicit **Layer Lifecycle & 3D Plane Table** for every beat and transition:
1. **3D Z-Plane Allocation (`LayeredStage3D`):**
   - Base Surface Plane: `translateZ(0px)`
   - Elevated Cards / Chat Bubbles: `translateZ(36px)` to `translateZ(54px)`
   - Floating Badges / Encryption Shields / Call Overlays: `translateZ(80px)` to `translateZ(110px)`
   - Interactive Cursor / Specular Highlights: `translateZ(130px)`
2. **Outgoing Layer Unmount & Straddle Window:**
   - Transitions must straddle the beat boundary so contact-sheet frames never capture laggy stale beats, and outgoing overlays must complete their exit within **8 to 12 frames** before incoming layers cross `opacity: 0.25`.

---

## PHASE 5: FRAME-BY-FRAME KINETIC CHOREOGRAPHY MATRIX
You are forbidden from animating an entire beat with a single top-level `opacity` or `scale`.
For complex beats, a table like this can help (no minimum number of targets; T007 warns above 8 tweens per beat):

| Beat & ID | Target Node | Frame Window | Property & Delta (`from -> to`) | Physics / Easing Curve | Micro-Detail / Sensory Feedback |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `B1-01` | `SpatialCamera` | `f000 - f075` | `scale(1.15 -> 1.0), rotateX(12deg -> 4deg)` | `expo.out` | 3D perspective settle |
| `B1-02` | `MorphingDeviceStage` | `f076 - f108` | `width(440 -> 940), height(640 -> 860), rx(52 -> 28)` | `expo.inOut` | True physical match-cut morph |
| ... | ... | ... | ... | ... | ... |

### Avoiding dead frames (guideline)
- Keep something moving through the timeline, except the final 1.2s hold which must be still.
- Consider ambient motion drivers (3D orbital tilt drift, SVG waveform oscillations, rotating satellite rings, specular sweeps) so mid-video stretches do not feel frozen.

---

## PHASE 6: ATOMIC DOM DENSITY, `SvgFilterLab` & `LayeredStage3D` SPECIFICATION
To prevent flat boxes and amateur vectors, specify the exact SVG and 3D architecture before coding:

1. **Multi-Layered SVG Craft (`SvgFilterLab` & `<defs>` Mandatory):**
   - **STRICT EMOJI BAN:** System emojis (`💬`, `👥`, `📞`, `📢`, `🎙️`, `⚡`, `🚀`, `🔒`, `✅`, `⚠️`, etc.) are strictly forbidden.
   - Every scene must include `<SvgFilterLab />` (or rich `<defs>` with `<linearGradient>`, `<radialGradient>`, `<filter>`, `<clipPath>`) so vector artwork has multi-stop gradients, specular rim lighting, liquid gooey morphing, and `strokeDashoffset` path drawing.
   - Use authentic anatomical vectors (e.g., `SpeechBubbleTailSVG`, multi-part official brand emblems, multi-bar `AudioSpectrumSVG`).
2. **True 2.5D/3D Multi-Plane Depth (`LayeredStage3D` Mandatory):**
   - Wrap key hero/UI stages in `<LayeredStage3D>` (`perspective: 1400px`, `transformStyle: 'preserve-3d'`) with `<LayerPlane z={...}>` children so cards, bubbles, and badges physically float in 3D space above the base window when tilted (`rotateX`, `rotateY`).
3. **Ban on the "3-Part Sandwich Template" & Monotonous Backgrounds:**
   - Repeating a fixed top header + middle box + bottom footer across beats is strictly banned.
   - Every beat must have a unique full-screen spatial layout and contrasting `beatPalettes` color blocking.
4. **Zero Placeholder Law:**
   - Strings like `"Item 1"`, `"Lorem ipsum"`, `"Card Title"`, or `"Data"` are strictly banned.

---

## PHASE 7: OPTIONAL SELF-REVIEW
A quick checklist before or after writing code. Fix anything that answers "yes":

1. **The Memory-Guess Check:** *Did I guess brand hexes, SVG paths, or UI layout from memory for a brand the user did not supply?*
2. **The Flat SVG Check:** *Are my SVGs single-color flat paths without `<defs>`, `<linearGradient>`, `<radialGradient>`, `<filter>` (`SvgFilterLab`), or `strokeDashoffset` dynamics?*
3. **The Flat 2D Box Check:** *Did I build flat 2D divs instead of using `<LayeredStage3D>` (`preserve-3d` + `translateZ` planes) to create real 3D spatial parallax?*
4. **The Black-Box Shortcut Check:** *Did I plan to import a single monolithic component and pass minimal props instead of choreographing internal rows, badges, and micro-interactions frame-by-frame?*
5. **The System Emoji Slop Check:** *Did I use even a single system emoji (`💬`, `👥`, `📞`, `⚡`, `🚀`, `🔒`, `✅`, etc.) anywhere in the JSX?*
6. **The 3-Part Sandwich Template Check:** *Did I repeat a static top header + center box + bottom footer layout across beats instead of giving each beat a distinct full-screen composition?*
7. **The Monotonous Background Check:** *Does the video stay on a single background color without inter-beat Color Blocking (`beatPalettes`) and physical Match-Cuts?*
8. **The Clipping Check:** *In any beat, does any panel or text extend past the camera's visible safe frustum ($48\text{px}$ margin)?*
9. **The Ghosting & Boundary Lag Check:** *Do transitions lag behind beat boundaries on contact-sheet sample frames, or do two overlays collide in Z-space?*
10. **The Dead-Frame Check:** *Is there a long stretch (outside the final hold) where nothing moves?*

---

## HANDOFF
When your plan is clear (written or not), write `spec.json` and `Scene.tsx` following RULES.md, then run `pnpm check --project <slug>`.
