> Optional reference, checked against `public/fonts/` and `src/index.css`. `RULES.md` wins on any conflict (it enforces the 18 px minimum).

# MOTION STUDIO — TYPOGRAPHY & FONT LIBRARY GUIDE

To render broadcast-grade videos offline without external network dependencies, this repository bundles **5 primary motion graphics typography families** under `public/fonts/`. All fonts fully support extended Latin glyphs and international character sets.

---

## 1. 5 PRIMARY TYPOGRAPHY FAMILIES & APPLICATION AREAS

### 1. Modern Sans-Serif (SaaS, UI, Swiss Minimalist, Dashboard)
Standard for pristine user interfaces, corporate presentations, and readable data panels.
- **`Inter`** (Regular 400, Bold 700, Black 900): Universal neutral Swiss grotesque for screen design.
- **`Plus Jakarta Sans`** (Bold 700, ExtraBold 800): Warm, geometric, modern startup brand identity.
- **`Geist`** (Variable 100-900): Razor-sharp technical interface standard.
- **`Space Grotesk`** (Bold 700): Brutalist, data-centric editorial headlines.
- **Usage:** `font-sans`, `font-inter`, `font-jakarta`, `font-space-grotesk`

### 2. High-Impact Display & Kinetic (Headlines, Posters, Hype Reels, Title Cards)
Massive kinetic typography, staccato word bursts, and bold manifesto scenes.
- **`Archivo Black`** (Heavy 900): Ultra-bold, punchy, brutalist poster headlines.
- **`Syne`** (Bold 700, ExtraBold 800): Artistic, contemporary agency showreels and design manifestos.
- **`Bebas Neue`** (Regular 400): Vertically condensed kinetic sports and hype teaser typography.
- **Usage:** `font-display`, `font-archivo`, `font-syne`, `font-bebas`

### 3. Editorial Serif & Luxury (Luxury, Fashion, Specimen, NYT Style)
Refined transitions, archival inquiries, cultural features, and high-contrast typographic interlocks.
- **`Playfair Display`** (Bold 700): High-contrast, classic editorial magazine aesthetic.
- **`Instrument Serif`** (Regular 400): Contemporary luxury, ultra-refined design-studio serif.
- **`Cinzel`** (Bold 700): Cinematic Roman proportions, historical and legal case studies.
- **Usage:** `font-serif`, `font-playfair`, `font-instrument`, `font-cinzel`

### 4. Monospace, Terminal & Telemetry (CLI, Developer SaaS, Code, Counters)
Aligned numeric columns (`tabular-nums`), code blocks, coordinate labels, and terminal windows.
- **`JetBrains Mono`** (Medium 500, Bold 700): Developer-focused, code ligatures, and superior legibility.
- **`Geist Mono`** (Medium 500): Modern CLI and cyber interface shells.
- **`Space Mono`** (Bold 700): Retro-futuristic technical telemetry tags.
- **Usage:** `font-mono`, `font-jetbrains`, `font-space-mono`

### 5. Script & Expressive (Human Touch, Annotations, Highlights, Signatures)
Dynamic annotations, loupe callout notes, signature sign-offs, and creative accents.
- **`Caveat`** (Bold 700): Natural handwriting, dynamic arrow callouts, and handwritten notes.
- **Usage:** `font-script`, `font-caveat`

---

## 2. TAILWIND CSS UTILITY MAPPING

| Utility Class | Font Family | Recommended Scale / Usage |
|---|---|---|
| `font-sans` | Geist, Inter, Plus Jakarta Sans | 18px – 32px UI copy, dashboard panels |
| `font-display` | Archivo Black, Syne, Bebas Neue | 48px – 120px Kinetic letter bursts, headlines |
| `font-serif` | Playfair Display, Instrument Serif | 36px – 72px Editorial pull-quotes, hero titles |
| `font-mono` | JetBrains Mono, Space Mono, Geist Mono | 18px – 28px Terminal logs, numeric counters |
| `font-script` | Caveat | 24px – 40px Hand annotations, signatures |
| `font-archivo` | Archivo Black | Brutalist heavy impact |
| `font-syne` | Syne ExtraBold | Sculptural kinetic poster copy |
| `font-bebas` | Bebas Neue | Full-screen vertical manifesto |
| `font-instrument` | Instrument Serif | Luxury editorial specimen |
| `font-jetbrains` | JetBrains Mono | Live CLI syntax stream |
| `font-caveat` | Caveat | Organic human notations |

---

## 3. GOLDEN READABILITY & GLYPH INVARIANTS
1. **No micro-fonts:** keep every font size at 18px or larger (`audit:slop` rejects `text-xs`, `text-sm` and `text-[8..14px]`).
2. **Tabular Numerals:** Animated counters (`CounterValue`) must use `tabular-nums` and `font-mono` to prevent horizontal number jitter.
3. **Glyph Integrity:** All bundled fonts include the `latin-ext` subset, validated deterministically via `pnpm audit:glyph`.
