# MOTION STUDIO — TİPOGRAFİ VE FONT KÜTÜPHANESİ REHBERİ

Bu repo, video render sırasında harici ağa (network) bağımlı kalmadan, 60 FPS deterministik ve offline çalışacak şekilde **5 ana hareket grafiği tipografi ailesini** `public/fonts/` altında barındırır. Tüm fontlar Türkçe (`ç, ğ, ı, ö, ş, ü`) ve genişletilmiş Latin gliflerini eksiksiz destekler.

---

## 1. 5 ANA TİPOGRAFİ AİLESİ & KULLANIM ALANLARI

### 1. Modern Sans-Serif (SaaS, UI, Swiss Minimalist, Dashboard)
Pürüzsüz arayüzler, kurumsal açıklamalar ve okunabilir veri panelleri için standarttır.
- **`Inter`** (Regular 400, Bold 700, Black 900): Ekranların evrensel nötr İsviçre grotesk fontu.
- **`Plus Jakarta Sans`** (Bold 700, ExtraBold 800): Sıcak, geometrik, modern startup/ürün kimlikleri.
- **`Geist`** (Variable 100-900): Vercel/Next.js tarzı mikro-keskin teknik arayüz standardı.
- **`Space Grotesk`** (Bold 700): Hafif brutalist, teknoloji ve veri odaklı editoryal başlıklar.
- **Kullanım:** `font-sans`, `font-inter`, `font-jakarta`, `font-space-grotesk`

### 2. High-Impact Display & Kinetik (Headlines, Posters, Hype Reels, Title Cards)
Büyük puntolu kinetik tipografi, staccato kelime patlamaları ve cesur manifesto sahneleri.
- **`Archivo Black`** (Heavy 900): Ultra tok, vurucu, brutalist poster başlıkları.
- **`Syne`** (Bold 700, ExtraBold 800): Sanatsal, çağdaş ajans showreel ve tasarım manifestoları.
- **`Bebas Neue`** (Regular 400): Dikey uzatılmış (condensed) kinetik spor ve hype teaser başlıkları.
- **Kullanım:** `font-display`, `font-archivo`, `font-syne`, `font-bebas`

### 3. Editoryal Serif & Lüks (Luxury, Fashion, Specimen, NYT Style)
Zarif geçişler, arşiv incelemeleri, kültürel içerikler ve yüksek kontrastlı tipografik interlock'lar.
- **`Playfair Display`** (Bold 700): Yüksek kontrastlı, klasik editoryal dergi estetiği.
- **`Instrument Serif`** (Regular 400): Çağdaş lüks, tasarım stüdyolarının favorisi ultra-rafine serif.
- **`Cinzel`** (Bold 700): Sinematik Roma oranları, tarihi/adli vaka incelemeleri.
- **Kullanım:** `font-serif`, `font-playfair`, `font-instrument`, `font-cinzel`

### 4. Monospace, Terminal & Telemetri (CLI, Geliştirici SaaS, Kod, Sayaçlar)
Hizalı sayı sütunları (`tabular-nums`), kod blokları, koordinat etiketleri ve terminal pencereleri.
- **`JetBrains Mono`** (Medium 500, Bold 700): Geliştirici odaklı, kod ligatürleri ve üstün okunabilirlik.
- **`Geist Mono`** (Medium 500): Modern CLI ve siber arayüz kabukları.
- **`Space Mono`** (Bold 700): Retro-fütüristik teknik telemetri etiketleri.
- **Kullanım:** `font-mono`, `font-jetbrains`, `font-space-mono`

### 5. El Yazısı & İfade (Human Touch, Annotations, Highlights, Signatures)
Canlı çizimler, büyüteç altındaki el notları, onay imzaları ve yaratıcı vurgular.
- **`Caveat`** (Bold 700): Doğal el yazısı, dinamik ok çizimleri ve kişisel notlar.
- **Kullanım:** `font-script`, `font-caveat`

---

## 2. TAILWIND CSS SINIF EŞLEŞTİRME TABLOSU

| Utility Sınıfı | Yazı Tipi Ailesi | Önerilen Ağırlık / Sahne |
|---|---|---|
| `font-sans` | Geist, Inter, Plus Jakarta Sans | 18px – 32px UI metinleri, paneller |
| `font-display` | Archivo Black, Syne, Bebas Neue | 48px – 120px Kinetik harfler, başlıklar |
| `font-serif` | Playfair Display, Instrument Serif | 36px – 72px Editoryal alıntılar, başlıklar |
| `font-mono` | JetBrains Mono, Space Mono, Geist Mono | 18px – 28px Terminal satırları, sayaçlar |
| `font-script` | Caveat | 24px – 40px Çizili notlar, el imzaları |
| `font-archivo` | Archivo Black | Tok brutalist vuruşlar |
| `font-syne` | Syne ExtraBold | Heykelsi kinetik poster kelimeleri |
| `font-bebas` | Bebas Neue | Tam ekran dikey manifesto |
| `font-instrument` | Instrument Serif | Lüks editoryal specimen |
| `font-jetbrains` | JetBrains Mono | Canlı CLI kod akışı |
| `font-caveat` | Caveat | Yaratıcı organik notlar |

---

## 3. ALTIN KURALLAR (GLYPH & READABILITY)
1. **Mikro-Font Yasağı:** 1080p dikey veya yatay videoda font boyutu asla 18px altına inemez (`text-[18px]` minimumdur).
2. **Tabular Numaralar:** Akan sayaçlarda (`CounterValue`) rakamların titremesini önlemek için `tabular-nums` ve `font-mono` kullanılmalıdır.
3. **Türkçe Glif Güvenliği:** Tüm indirilen fontlar `latin-ext` alt kümesini içerir (`ç, ğ, ı, ö, ş, ü` bozulmaz). `pnpm audit:glyph` ile denetlenir.
