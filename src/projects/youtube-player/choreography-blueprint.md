# CHOREOGRAPHY BLUEPRINT: AUTHENTIC YOUTUBE MOTION EXPERIENCE (YOUTUBE-PLAYER)
*Generated pursuant to .agent/skills/anti-slop-deep-thinker/SKILL.md (MANDATORY PRE-COMPUTATION GATE)*

---

## PHASE 0: LIVE WEB, OFFICIAL SVG & STUDIO BREAKDOWN INTELLIGENCE

### Query 1: Official Brand Identity & Exact SVG Coordinates
- **Source Verification:** SimpleIcons & Wikimedia Commons Official YouTube SVG XML (`viewBox="0 0 24 24"`).
- **Exact Official YouTube SVG `<path d="...">`:**
  ```xml
  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  ```
- **Official Brand Hex Palettes:**
  - Pure White: `#FFFFFF` (Header & Clean Canvas)
  - YouTube Off-White/Light Gray: `#F9F9F9` / `#FAFAFA`
  - YouTube Red: `#FF0000` (Pantone 186 C - Logo, Scrubber Bar, Accents)
  - YouTube Dark: `#0F0F0F` (Headlines, Subscribe Pill Button)
  - Secondary Gray: `#606060` (Metadata, Channel Info, Subtitles)
  - Border Gray: `#E5E5E5` / `rgba(0,0,0,0.08)`

### Query 2: Authentic Product UI Tear-Down & Screen Anatomy
- **Source Verification:** YouTube Desktop Player Anatomy & UX teardowns.
- **Key Modules:**
  1. **Top Header Bar:** Sol üstte YouTube logosu, ortada oval arama çubuğu ve büyüteç, mikrofon simgesi, sağda bildirim çanı ve profil avatarı.
  2. **Main Watch Page Column:** 16:9 Video oynatıcı tuvali, video başlığı ("The Art of Motion: Next-Gen 4K"), kanal bilgisi ("Motion Lab" + verified rozet, "2.4M subscribers"), ikonik siyah "Subscribe" butonu, Like/Share butonları.
  3. **Sidebar Recommendations:** 3 adet önerilen video kartı, süre rozetleri ("14:20", "09:45"), başlıklar ve görüntülenme sayıları.
  4. **Theatre Mode Button:** Oynatıcı kontrollerindeki Theatre Mode ikonuna tıklanınca video tam ekrana patlar.

### Query 3: Elite Motion Studio Case Study Breakdowns (Scene Metaphors)
- **Studio References:** Ordinary Folk, Buck, ManvsMachine, Ravie, Motionographer.
- **Core Motion Metaphors:**
  - **Match-Cut & Peak Velocity Takeover:** Arama çubuğundan video oynatıcıya ve oradan tam ekran sinema moduna kesintisiz geçiş.
  - **Exploded Layering:** 3D uzayda katmanların derinlik kazanması.

### Query 4: Technical SVG Filters & 3D Depth Recipes
- **Source Verification:** Codrops Tympanus & GSAP Showcase.
- **Architecture:**
  - `SvgFilterLab` with linearGradient and radialGradient definitions.
  - `LayeredStage3D` with preserve-3d and translateZ.

---

## PHASE 1: COLOR BLOCKING & BRAND FIDELITY MATRIX
| Beat | Theme Key | Canvas | Accent Tone | Narrative Role |
| :--- | :--- | :--- | :--- | :--- |
| **Beat 1** (`f000-f110`) | `light-search` | `#FFFFFF` | `#FF0000` | Header & Arama Çubuğu Daktilo Yazımı |
| **Beat 2** (`f111-f270`) | `watch-feed` | `#F9F9F9` | `#FF0000` | Otantik YouTube İzleme Sayfası & Sağ Sütun Feed'i |
| **Beat 3** (`f271-f420`) | `cinema-explosion` | `#0A0A0C` | `#FF0000` | Tam Ekran Sinema Modu Patlaması & Kinetik Tipografi |
| **Beat 4** (`f421-f600`) | `pure-resolve` | `#FFFFFF` | `#FF0000` | Anıtsal YouTube Logo Kilidi & 1.8s Stillness Hold |

---

## PHASE 2: VIEWPORT & BOUNDING-BOX MATH
- Aspect: 16:9 (`1920x1080px`)
- Safe Frustum: Bounds $X \in [80, 1840]\text{px}$, $Y \in [80, 1000]\text{px}$.
- Header: Width $1800\text{px}$, Height $72\text{px}$.
- Watch Page Player: Width $1120\text{px}$, Height $630\text{px}$.
- Theatre Mode Fullscreen: Expands to Width $1920\text{px}$, Height $880\text{px}$.
- Outro Emblem: Width $240\text{px} \times 168\text{px}$ morphing to logo lockup centered at $(960, 540)$.

---

## PHASE 3: FRAME-BY-FRAME TIMING TABLE
| Beat | Frames | Duration | Delta / Transformation | Easing |
| :--- | :--- | :--- | :--- | :--- |
| `B1` | `f000 - f110` | 1.83s | Arama yazımı: "The Art of Motion 4K" + imleç tıklaması | `power2.out` |
| `B2` | `f111 - f270` | 2.66s | İzleme sayfası açılışı, video oynatıcı, kanal bilgisi, feed kartları | `expo.inOut` |
| `B3` | `f271 - f420` | 2.50s | Sinema moduna tam ekran patlama, kırmızı scrubber akışı, kinetik tipografi | `expo.out` |
| `B4` | `f421 - f600` | 3.00s | Anıtsal YouTube marka kilidine dönüşüm & 110 frame (1.83s) stillness hold | `expo.out` |

Durations: [110, 160, 150, 180] -> Mean = 150, Stddev = 25.5 frames (Satisfies STORY-002 rhythm contract).

---

## PHASE 4: 3D DEPTH & SVG FILTER LAB ARCHITECTURE
- `LayeredStage3D` / `LayerPlane` with `preserve-3d` and `translateZ`:
  - Base `translateZ(0px)`: White canvas with `SvgFilterLab` (`linearGradient`, `radialGradient`, `gooey-liquid-morph`).
  - UI `translateZ(40px)`: YouTube Watch page components and Up Next feed.
  - Video Player `translateZ(80px)`: Theatre mode cinema explosion.
  - Hero `translateZ(120px)`: Iconic YouTube Play emblem and brand lockup.
