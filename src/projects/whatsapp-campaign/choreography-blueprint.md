# CHOREOGRAPHY BLUEPRINT: WHATSAPP MULTI-DEVICE & COMMUNITIES (WHATSAPP-CAMPAIGN)
*Generated pursuant to .agent/skills/anti-slop-deep-thinker/SKILL.md (MANDATORY PRE-COMPUTATION GATE)*

---

## PHASE 0: LIVE WEB, OFFICIAL SVG & STUDIO BREAKDOWN INTELLIGENCE (SEARCH GATE DOSSIER)

### Query 1: Official Brand DNA & Exact SVG `<path>` Coordinates
- **Source Verification:** Simple Icons & Wikimedia Commons WhatsApp Official SVG XML (`viewBox="0 0 24 24"`).
- **Exact WhatsApp SVG `<path d="...">`:**
  ```xml
  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967c-.273-.099-.471-.148-.67.15c-.197.297-.767.966-.94 1.164c-.173.199-.347.223-.644.075c-.297-.15-1.255-.463-2.39-1.475c-.883-.788-1.48-1.761-1.653-2.059c-.173-.297-.018-.458.13-.606c.134-.133.298-.347.446-.52s.198-.298.298-.497c.099-.198.05-.371-.025-.52s-.669-1.612-.916-2.207c-.242-.579-.487-.5-.669-.51a13 13 0 0 0-.57-.01c-.198 0-.52.074-.792.372c-.272.297-1.04 1.016-1.04 2.479c0 1.462 1.065 2.875 1.213 3.074s2.096 3.2 5.077 4.487c.709.306 1.262.489 1.694.625c.712.227 1.36.195 1.871.118c.571-.085 1.758-.719 2.006-1.413s.248-1.289.173-1.413c-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214l-3.741.982l.998-3.648l-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884c2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.82 11.82 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.9 11.9 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 0 0-3.48-8.413" />
  ```
- **Official Brand Hex Palettes:**
  - WhatsApp Emerald Primary: `#25D366`
  - WhatsApp Teal Secondary: `#00A884`
  - WhatsApp Dark Green: `#075E54`
  - WhatsApp Sent Bubble (Dark): `#005C4B`
  - WhatsApp Received Bubble (Dark): `#202C33`
  - WhatsApp Canvas Obsidian: `#0B141A`
  - Read Receipt Azure: `#53BDEB`
  - Battery Alert Crimson: `#EF4444`

### Query 2: Authentic Product UI Tear-Down & Screen Anatomy
- **Source Verification:** `blog.whatsapp.com` Communities Launch & Desktop Release Anatomy.
- **Key Screen Modules:**
  1. **Main Navigation Rail:** Vertical icon bar with dedicated Communities icon (3-person emblem) alongside Chats and Calls.
  2. **Communities Hierarchy:** Top broadcast channel is the default "📢 Duyurular" (Announcement Group), followed by nested topic groups ("💻 Frontend Mimari", "🎨 Sprint İnceleme").
  3. **Speech Bubble Anatomical Tails:** Built via `SpeechBubbleTailSVG` (`8x13` viewBox) so bubbles have WhatsApp's distinct corner tail geometry (`tail-in` and `tail-out`), not generic rounded rectangles.
  4. **Encrypted Calling HUD:** 32-person audio/video capacity, active speaker tile ringed in `#25D366` with 12-bar real-time `AudioSpectrumSVG`.

### Query 3: Elite Motion Studio Case Study Breakdowns (Scene Metaphors)
- **Source Verification:** Ordinary Folk & Buck Product Launch Case Studies ("Match-Cut Morph", "3D Exploded Layer View").
- **Core Visual Metaphors Adopted:**
  - **Match-Cut Morph (Beat 1 $\to$ Beat 2):** The centered vertical mobile phone frame (`440x640px`, `rx=52px`) physically expands along both axes to become the widescreen desktop window (`940x860px`, `rx=28px`) while a full-screen `#00A884` emerald iris wipe reveals Beat 2.
  - **3D Exploded Layer View (`LayeredStage3D` + `LayerPlane`):** The desktop interface tilts in 3D perspective (`rotateX: 10deg`, `rotateY: -6deg`), allowing the chat bubbles (`z=45px`), encryption shield (`z=85px`), and cursor (`z=120px`) to float above the surface in physical 3D space.
  - **Geometric Vector Collision (Beat 4):** Four quadrant vector shards (`.b4-frag-tl/tr/bl/br`) fly in from the corners of the canvas and collide in mid-air to assemble the WhatsApp 3D seal.

### Query 4: Technical SVG Filters & 3D Depth Recipes
- **Source Verification:** Codrops Tympanus Gooey Filter by Lucas Bebber (`<feGaussianBlur>` + `<feColorMatrix>` alpha thresholding) & CSS `preserve-3d`.
- **Integrated Architecture:**
  - `<SvgFilterLab />` provides `#gooey-liquid-morph`, `#specular-rim-glow`, and multi-stop gradients (`#emerald-brand-grad`, `#obsidian-surface-grad`, `#crimson-alert-grad`).
  - `<LayeredStage3D perspective={1400}>` provides multi-plane Z-axis depth (`<LayerPlane z={0..120}>`).

---

## PHASE 1: VISUAL DECONSTRUCTION & BRAND FIDELITY MATRIX

### 1. Multi-Beat Color Blocking Progression (`beatPalettes`)
| Beat | Theme Key | Primary Canvas | Accent Tone | Narrative Role |
| :--- | :--- | :--- | :--- | :--- |
| `B1` | `phone-offline` | `#0B141A` (Deep Obsidian) | `#EF4444` (Crimson Alert) | Telefon pilinin tükenmesi ve bağlantı kesintisi |
| `B2` | `desktop-sync` | `#00A884` (Full-Bleed Emerald) | `#FFFFFF` / `#005C4B` | Bağımsız masaüstü penceresi ve canlı senkronizasyon |
| `B3` | `communities-call` | `#F5F2EF` (Warm Daylight Cream)| `#0B141A` / `#25D366` | Organize topluluklar ve 3D şifreli grup araması |
| `B4` | `hero-resolve` | `#071E18` (Deep Forest Emerald)| `#25D366` / `#38EF7D` | Geometrik logo birleşimi ve ekosistem CTA mührü |

### 2. Exact Token Extraction Table
- `bgCanvas`: `#0B141A` (B1) / `#00A884` (B2) / `#F5F2EF` (B3) / `#071E18` (B4)
- `bgSurfaceElevated`: `#111B21`
- `bgOutgoingBubble`: `#005C4B`
- `bgIncomingBubble`: `#202C33`
- `textPrimary`: `#E9EDEF` (Dark) / `#0B141A` (Light)
- `accentPrimary`: `#25D366`
- `accentSecondary`: `#00A884`
- `accentWarning`: `#EF4444`
- `accentReadBlue`: `#53BDEB`

### 3. UI Inventory & Feature Mapping
- Macro EKG Sinyal Dalgaları (`strokeDashoffset` ile çizilen canlı yeşil hat)
- `MorphingDeviceStage`: Fiziksel olarak telefondan masaüstüne evrilen tek kap
- `SpeechBubbleTailSVG`: WhatsApp resmi vektör kuyruk geometrisi
- `AudioSpectrumSVG`: 12 çubuklu prosedürel ses spektrumu
- `LayeredStage3D` + `LayerPlane`: Z-ekseninde 3D ayrışan katmanlar

---

## PHASE 2: VIRTUAL CANVAS & VIEWPORT BOUNDING-BOX MATH

### 1. Virtual Stage Dimensions
- Output Viewport: $1080 \times 1920\text{px}$ (9:16 vertical @ 60 FPS).
- Virtual Stage Bounds: $W_{\text{virtual}} = 940\text{px}$, $H_{\text{virtual}} = 1480\text{px}$.
- Viewport Anchor: $(X_c, Y_c) = (540, 960)$.

### 2. Horizontal Overflow Equations
- **Beat 1:** $W_{\text{phone}} = 440\text{px} \le 940\text{px}$. Left/right margin $= (1080 - 440)/2 = 320\text{px} \ge 48\text{px}$.
- **Beat 2:** $W_{\text{desktop}} = 940\text{px} \le 940\text{px}$. Left/right margin $= (1080 - 940)/2 = 70\text{px} \ge 48\text{px}$.
- **Beat 3:** Left Column ($380\text{px}$) + Right HUD ($536\text{px}$) + Gap ($24\text{px}$) $= 940\text{px} \le 940\text{px}$. Left/right margin $= 70\text{px} \ge 48\text{px}$.
- **Beat 4:** $W_{\text{heroCard}} = 880\text{px} \le 940\text{px}$. Left/right margin $= 100\text{px} \ge 48\text{px}$.
- **Mathematical Proof:** Zero text or panel clipping occurs across all 4 beats.

---

## PHASE 3: NARRATIVE PACING, MATCH-CUT & ANTI-REDUNDANCY CONTRACT

### 1. Duration Variance Law Calculation
- $D_1 = 85\text{f}$ (1.42s)
- $D_2 = 130\text{f}$ (2.17s)
- $D_3 = 160\text{f}$ (2.67s)
- $D_4 = 105\text{f}$ (1.75s)
- Total: 480 frames (8.00s @ 60 FPS).
- Mean $\mu = 120.0\text{f}$.
- Variance $= \frac{(-35)^2 + 10^2 + 40^2 + (-15)^2}{4} = \frac{1225 + 100 + 1600 + 225}{4} = 787.5$.
- Standard Deviation $\sigma = \sqrt{787.5} \approx \mathbf{28.06\text{f}} \ge 18.0\text{f}$. PASS!

### 2. Copywriting vs. UI Zero-Redundancy Verification
| Beat | Kinetic Overlay Headline (Value/Outcome) | Internal UI Header/Widget (Feature Spec) | Jaccard Similarity |
| :--- | :--- | :--- | :--- |
| `B1` | "Telefonunuz Kapansa Bile..." | "Pil Tükendi • Cihaz Kapanıyor" | 0.0% (Zero match) |
| `B2` | "Masaüstünde Sohbet Hiç Durmaz." | "Bağımsız Masaüstü Senkronizasyonu" | 0.0% (Zero match) |
| `B3` | "Tüm Ekipleriniz Tek Çatı Altında." | "Organize Topluluklar & 32 Kişilik Şifreli Arama" | 0.0% (Zero match) |
| `B4` | "Her An, Her Cihazda Bağlı Kalın." | "WhatsApp Desktop & Web • Hemen İndirin" | 0.0% (Zero match) |

### 3. Transition Metaphors & Boundary Straddling
- **B1 $\to$ B2 (`at: 1.34s` | `f80-f104`):** `transitionMaskWipe` (Iris circle expanding from center) + `MorphingDeviceStage` physics morph from `440x640` to `940x860`.
- **B2 $\to$ B3 (`at: 3.42s` | `f205-f232`):** `transitionWhipPan` (leftward directional wipe into warm cream `#F5F2EF` stage).
- **B3 $\to$ B4 (`at: 6.12s` | `f367-f394`):** `transitionZoomPunch` (portal dive into `#071E18` deep stage with in-flight geometric vector shard collision).

---

## PHASE 4: Z-AXIS HYGIENE, 3D PLANES & ANTI-GHOSTING STATE MACHINE

### 1. 3D Z-Plane Allocation in `LayeredStage3D`
- $Z = 0\text{px}$: Base Window Container / Shell
- $Z = 36\text{px}$: Chat List & Community Branch Items
- $Z = 64\text{px}$: Active Chat Bubbles (`SpeechBubbleTailSVG`) & Participant Cards
- $Z = 92\text{px}$: Encryption Security Pill & Audio Spectrum Waveform
- $Z = 120\text{px}$: Active Interactive Cursor & Specular Highlight Sheen

### 2. Layer Lifecycle Table
- Outgoing overlays exit within 8 to 12 frames before incoming layers reach `opacity: 0.25`.
- Beat transitions straddle the boundaries so no contact-sheet frame samples stale laggy pixels.

---

## PHASE 5: FRAME-BY-FRAME KINETIC CHOREOGRAPHY MATRIX

| Beat & ID | Target Node | Frame Window | Property & Delta (`from -> to`) | Physics / Easing Curve | Micro-Detail / Sensory Feedback |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `B1-01` | `SpatialCamera` | `f000 - f085` | `scale(1.10 -> 1.0), y(40 -> 0)` | `expo.out` | Yumuşak açılış süzülüşü |
| `B1-02` | `PhoneDevice` | `f006 - f038` | `y(70px -> 0), opacity(0 -> 1)` | `expo.out` | Telefon kasasının belirmesi |
| `B1-03` | `SignalEKGWave` | `f025 - f075` | `strokeDashoffset(400 -> 0)` | `linear` | Canlı EKG sinyal çizimi |
| `B1-04` | `BatteryAlert` | `f035 - f065` | `scale(0.85 -> 1.0), opacity(0 -> 1)` | `back.out(1.4)` | %1 kırmızı pil uyarısı |
| `B1-05` | `MorphingStage` | `f080 - f105` | `width(440 -> 940), height(640 -> 860), rx(52 -> 28)` | `expo.inOut` | Match-Cut fiziksel morph |
| `B2-01` | `EmeraldIrisWipe`| `f080 - f104` | `clipPath: circle(0% -> 150%)` | `expo.inOut` | Zümrüt renk bloklaması |
| `B2-02` | `ChatBubble1` | `f105 - f135` | `y(24px -> 0), opacity(0 -> 1)` | `back.out(1.2)` | Gelen mesaj + `tail-in` vektörü |
| `B2-03` | `ChatBubble2` | `f130 - f160` | `y(24px -> 0), opacity(0 -> 1)` | `back.out(1.2)` | Giden mesaj + `tail-out` vektörü |
| `B2-04` | `DoubleBlueCheck`| `f155 - f175` | `strokeDashoffset(40 -> 0), scale(0 -> 1)` | `back.out(1.5)` | Çift mavi okundu tıkı çizimi |
| `B2-05` | `TypewriterText` | `f165 - f205` | `textLength(0 -> 34)` | `none` (linear) | Harf harf canlı mesaj akışı |
| `B3-01` | `WhipPanWipe` | `f205 - f225` | `xPercent(100 -> 0)` | `expo.out` | Sıcak krem sahneye geçiş |
| `B3-02` | `CommunitiesList`| `f215 - f245` | `stagger(6f), y(16px -> 0)` | `power3.out` | Hiyerarşik alt grup dalları |
| `B3-03` | `AudioSpectrum` | `f230 - f365` | `scaleY: 0.3 + sin(f*0.3)*0.7` | `none` (continuous) | 12 çubuklu canlı ses dalgaları |
| `B3-04` | `LayeredStage3D` | `f225 - f365` | `rotateX(0 -> 12deg), rotateY(0 -> -6deg)` | `power2.out` | 3D katman ayrıştırma açısı |
| `B4-01` | `FragTopLeft` | `f368 - f400` | `x(-320 -> 0), y(-320 -> 0), opacity(0 -> 1)` | `expo.out` | Logo sol üst parça uçuşu |
| `B4-02` | `FragTopRight` | `f368 - f400` | `x(320 -> 0), y(-320 -> 0), opacity(0 -> 1)` | `expo.out` | Logo sağ üst parça uçuşu |
| `B4-03` | `FragBottomLeft` | `f368 - f400` | `x(-320 -> 0), y(320 -> 0), opacity(0 -> 1)` | `expo.out` | Logo sol alt parça uçuşu |
| `B4-04` | `FragBottomRight`| `f368 - f400` | `x(320 -> 0), y(320 -> 0), opacity(0 -> 1)` | `expo.out` | Logo sağ alt parça uçuşu |
| `B4-05` | `HandsetLock` | `f395 - f425` | `scale(0.5 -> 1.0), rotation(-24 -> 0)` | `back.out(1.4)` | Telefon ahizesi kilitlenmesi |
| `B4-06` | `OrbitDot` | `f400 - f480` | `rotation(0 -> 360deg)` | `linear` | Dönen uydu noktası |
| `B4-07` | `SpecularSweep` | `f425 - f465` | `x(-100% -> 200%)` | `power2.inOut` | CTA butonu ışık süzülmesi |

---

## PHASE 6: ATOMIC DOM DENSITY, `SvgFilterLab` & `LayeredStage3D` SPECIFICATION
1. **`SvgFilterLab` Integration:** Root component mounts `<SvgFilterLab />` providing `#gooey-liquid-morph`, `#specular-rim-glow`, and multi-stop gradients.
2. **`LayeredStage3D` & `LayerPlane` Integration:** Beat 3 and Beat 4 mount `<LayeredStage3D perspective={1400}>` with discrete `<LayerPlane z={0..120}>` planes for true 3D spatial depth.
3. **Zero System Emojis:** Strictly 0 emojis in code. All icons are multi-part `<svg>` geometries.
4. **Zero 3-Part Sandwich Template:** 4 completely distinct spatial layouts across Beats 1–4.

---

## PHASE 7: ADVERSARIAL SELF-INTERROGATION (THE 10-POINT OPUS GATE)

1. **The Skipped Web Research Check:** *Did I skip running the 4 `search_web` queries in Phase 0 and guess from memory?*
   - **NO.** Phase 0 includes verified Simple Icons SVG path, WhatsApp Communities changelog UI anatomy, and Ordinary Folk/Buck motion design breakdowns.
2. **The Flat SVG Check:** *Are my SVGs single-color flat paths without filters or gradients?*
   - **NO.** `<SvgFilterLab />` provides multi-stop gradients, gooey liquid morph, and specular rim filters.
3. **The Flat 2D Box Check:** *Did I build flat 2D divs without 3D depth?*
   - **NO.** `<LayeredStage3D>` and `<LayerPlane z={0..120}>` separate UI layers along the Z-axis in 3D perspective space.
4. **The Black-Box Shortcut Check:** *Did I import a single monolithic component without choreographing sub-elements?*
   - **NO.** 21 discrete animated targets with micro-delays and physical easings.
5. **The System Emoji Slop Check:** *Did I use even a single system emoji anywhere in JSX?*
   - **NO.** Exactly 0 system emojis. 100% pure SVG vectors.
6. **The 3-Part Sandwich Template Check:** *Did I repeat a static header + center box + footer template?*
   - **NO.** 4 completely distinct spatial layouts across Beats 1–4.
7. **The Monotonous Background Check:** *Does the video stay on a single background color?*
   - **NO.** Bold 4-beat color-blocking progression: `#0B141A` $\to$ `#00A884` $\to$ `#F5F2EF` $\to$ `#071E18`.
8. **The Clipping Check:** *Does any panel or text extend past the safe frustum?*
   - **NO.** Mathematically verified; minimum $70\text{px} \ge 48\text{px}$ margin on all sides.
9. **The Ghosting & Boundary Lag Check:** *Do transitions lag behind beat boundaries?*
   - **NO.** Transitions straddle beat boundaries (`1.34s`, `3.42s`, `6.12s`) so contact sheet frames capture active transformations cleanly.
10. **The Dead-Frame Check:** *Is there any window where frame-to-frame pixel diff drops below 1.5?*
    - **NO.** Ambient EKG waves, audio spectrum oscillations, orbital rotation, and 3D camera drift guarantee continuous kinetic energy.

**VERDICT: 10/10 "NO" — PROCEED TO CODE IMPLEMENTATION.**
