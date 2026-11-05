# CHOREOGRAPHY BLUEPRINT: ONE CONTINUOUS MORPHING SHAPE
**Paradigm:** Editorial UI | **Canvas:** 1440x1440 (1:1 Square) | **Tempo:** 120 BPM (28 Beats / 840 Frames @ 60 FPS / 14.0s)
**Aesthetic:** Warm Light Gray (#F4F4F2) Canvas, Pure Black/White UI (#0A0A0A / #FFFFFF), Electric Indigo (#5E5CE6) Accent, Geist Sans-Serif Typography.

---

## PHASE 0: CANLI VEKTÖR VE UI MİMARİSİ (Live Web & Vector Intelligence)

### 1. Doğrulanmış SVG Vektör Koordinatları (Verified Production Paths)
Tüm ikonlar 24x24 viewBox içinde 2.0px eşit stroke genişliğiyle tanımlanmıştır (Zero emoji / zero sloppy shapes):

- **Export / Share Arrow:**
  ```svg
  <path d="M12 3v12m0-12l-4 4m4-4l4 4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  ```
- **Checkmark Icon:**
  ```svg
  <path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  ```
- **Music Play Icon:**
  ```svg
  <path d="M8 5v14l11-7z" fill="#5E5CE6"/>
  ```
- **Music Pause Icon:**
  ```svg
  <rect x="6" y="5" width="4" height="14" rx="2" fill="#5E5CE6"/>
  <rect x="14" y="5" width="4" height="14" rx="2" fill="#5E5CE6"/>
  ```
- **Volume Speaker Icon:**
  ```svg
  <path d="M11 5L6 9H2v6h4l5 4V5z" fill="#FFFFFF"/>
  <path d="M15.54 8.46a5 5 0 010 7.07" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none"/>
  <path d="M19.07 4.93a10 10 0 010 14.14" stroke="#5E5CE6" strokeWidth="2" strokeLinecap="round" fill="none"/>
  ```
- **Command Palette ⌘K Search Lens:**
  ```svg
  <circle cx="11" cy="11" r="8" stroke="#FFFFFF" strokeWidth="2" fill="none"/>
  <path d="M21 21l-4.35-4.35" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
  ```

### 2. UI Tear-Down & SvgFilterLab <defs> Tanımları
- **SvgFilterLab:**
  - `<filter id="subtle-elevation">` gaussianBlur stdDeviation="16" and composite
  - `<linearGradient id="indigo-gradient" x1="0" y1="0" x2="0" y2="1">` stop 0% #5E5CE6 stop 100% #3B38B2
  - `<linearGradient id="area-chart-fill" x1="0" y1="0" x2="0" y2="1">` stop 0% rgba(94, 92, 230, 0.28) stop 100% rgba(94, 92, 230, 0)
- **3D Katman Mimarisi (LayeredStage3D & translateZ):**
  - Tuval: `perspective(1200px)`
  - Zemin Düzlemi: `translateZ(0px)` (#F4F4F2, mikro-ızgara noktaları)
  - Hero Shape Düzlemi: `translateZ(40px)` (#0A0A0A obsidian tek kap)
  - İç Eleman Düzlemi: `translateZ(60px)` (Metin, ikonlar, spline grafiği)
  - İmleç & Tooltip Düzlemi: `translateZ(90px)` (Doğrudan manipülasyon katmanı)

---

## 28-BEAT STORYBOARD ZAMAN TABLOSU (120 BPM, 7 BARS, 840 FRAMES)

| Bar | Beat | Kare Aralığı | UI Durumu | Genişlik x Yükseklik | Radius | Kamera Zoom | Aksiyon / Fizik |
|---|---|---|---|---|---|---|---|
| **Bar 1** | Beat 1 | f0 – f29 | Button (Durgunluk) | 240 x 56 | 28 | 1.25x | "Export Frame" butonu, imleç kavisli yörüngeyle yaklaşır |
| | Beat 2 | f30 – f59 | Button Click → Loader | 240→56 x 56 | 28 | 1.30x | Tıklama dürtüsü (scale 0.94), loader çemberine büzülme, indigo yay döner |
| | Beat 3 | f60 – f89 | Loader → Checkmark | 56 x 56 | 28 | 1.30x | Yükleme biter, başarı onay tiki (strokeDashoffset) çizilir |
| | Beat 4 | f90 – f119 | Checkmark → Dynamic Island | 56→320 x 56→44 | 22 | 1.20x | Yatay genişleme, mini ekolayzır dalgalanması |
| **Bar 2** | Beat 5 | f120 – f149 | Dynamic Island → Music Player | 320→420 x 44→160 | 24 | 1.05x | Tam müzik çalar kartına dikey açılma, parça başlığı ve dalga formu |
| | Beat 6 | f150 – f179 | Play → Pause Morph | 420 x 160 | 24 | 1.05x | İmleç play butonuna tıklar, play ikonu pause çubuklarına evrilir |
| | Beat 7 | f180 – f209 | Music Player → Scrub Bar | 420→520 x 160→48 | 24 | 1.15x | Çalar büzülerek yatay scrub progress barına dönüşür |
| | Beat 8 | f210 – f239 | Scrubbing Manipulation | 520 x 48 | 24 | 1.15x | İmleç knob'u tutar (%25'ten %75'e sürükler), dinamik zaman güncellemesi |
| **Bar 3** | Beat 9 | f240 – f269 | Scrub Bar → Volume Slider | 520→460 x 48→56 | 28 | 1.15x | Hoparlör ikonu ve ses slider'ına dönüşüm |
| | Beat 10 | f270 – f299 | Boundary Overstretch | 460→530 x 56→48 | 24 | 1.12x | İmleç knob'u %100 sınırının ötesine çeker; gövde uzar (squash & stretch) |
| | Beat 11 | f300 – f329 | Elastic Snapback | 530→460 x 48→56 | 28 | 1.15x | Bırakılan knob ve gövde sönümlü yay osilasyonuyla %100'e geri oturur |
| | Beat 12 | f330 – f359 | Volume Slider → Toggle Switch | 460→120 x 56→68 | 34 | 1.35x | Kompakt iOS toggle switch hapına büzülme |
| **Bar 4** | Beat 13 | f360 – f389 | Toggle Switch Approach | 120 x 68 | 34 | 1.35x | İmleç toggle thumb'a yaklaşır, nefes alan durgunluk |
| | Beat 14 | f390 – f419 | Asymmetric Toggle Flip | 120 x 68 | 34 | 1.35x | Tıklama ile toggle flip: ön kenar hızlı uzar, arka kenar toplanır, indigo dolgu |
| | Beat 15 | f420 – f449 | Toggle → Liquid Tab Bar | 120→540 x 68→58 | 29 | 1.10x | 3 sekmeli Liquid Tab barına genişleme ("Overview", "Analytics", "Reports") |
| | Beat 16 | f450 – f479 | Liquid Tab Leap 1 (Tab 1→2) | 540 x 58 | 29 | 1.10x | Ön kenar ve arka kenar asimetrik yay ile Tab 2'ye akar (uzayıp toplanma) |
| **Bar 5** | Beat 17 | f480 – f509 | Liquid Tab Leap 2 → Chart | 540→640 x 58→340 | 24 | 0.98x | Tab 3'e sıçrama ve hemen ardından analitik spline grafiğine tam açılma |
| | Beat 18 | f510 – f539 | Self-Drawing Spline | 640 x 340 | 24 | 0.98x | Spline eğrisi kendini çizer (strokeDashoffset), degrade alan dolgusu yükselir |
| | Beat 19 | f540 – f569 | Magnetic Hover & Tooltip | 640 x 340 | 24 | 1.02x | İmleç spline üzerinde gezinir, manyetik tooltip kartı veriyi ($84,250) gösterir |
| | Beat 20 | f570 – f599 | Tooltip Docking & Retract | 640 x 340 | 24 | 1.02x | Tooltip zirve noktasına kenetlenir, grafik kapanışa hazırlanır |
| **Bar 6** | Beat 21 | f600 – f629 | Chart → ⌘K Command Palette | 640→560 x 340→64 | 20 | 1.10x | Grafiğin ⌘K arama çubuğuna morfolojisi, büyüteç ve arama kutusu |
| | Beat 22 | f630 – f659 | Dropdown List & Filtering | 560 x 64→250 | 20 | 1.02x | Liste aşağı açılır, "export" kelimesi yazılır, seçenekler filtrelenir |
| | Beat 23 | f660 – f689 | Enter Selection & Collapse | 560 x 250→56 | 28 | 1.15x | Enter tuşu vurgusu (indigo flash), liste kapanır |
| | Beat 24 | f690 – f719 | Collapse → Toast Notification | 560→380 x 56 | 28 | 1.20x | Yüzen Toast bildirimine büzülme, başarı ikonu |
| **Bar 7** | Beat 25 | f720 – f749 | Toast Hold & Readability | 380 x 56 | 28 | 1.20x | "Exported successfully" tam okunabilirlik hold'u |
| | Beat 26 | f750 – f779 | Anticipation Shrink | 380→340 x 56 | 28 | 1.22x | Geri dönüş öncesi hafif geri çekilme nefesi (anticipation) |
| | Beat 27 | f780 – f809 | Toast → Initial Button Morph | 340→240 x 56 | 28 | 1.25x | Toast metni söner, "Export Frame" metni ve oku yerine yerleşir |
| | Beat 28 | f810 – f839 | Settling into f0 Identity | 240 x 56 | 28 | 1.25x | Tüm yaylar sıfır hızla ilk konuma kilitlenir. f839 === f0 (Kusursuz Sonsuz Döngü) |

---

## 3. KAPALI FORM YAY MATEMATİĞİ (Closed-Form Analytical Springs)
Tüm animasyonlar `solveSpringFrame({ frame, fps: 60, startFrame, stiffness, damping, from, to })` ile Remotion karesinden analitik olarak hesaplanır.

### Asimetrik Likit Yay (Liquid Tab Asymmetric Spring Formülü):
Tab göstergesi $X_{\text{start}}$'tan $X_{\text{target}}$'a hareket ederken:
$$X_{\text{lead}}(t) = \text{solveSpring}(t, k=240, c=24) \quad \text{[Hızlı, hafif underdamped]}$$
$$X_{\text{trail}}(t) = \text{solveSpring}(t, k=150, c=26) \quad \text{[Daha viskoz, arkadan toplanan]}$$
Genişlik: $W(t) = W_{\text{base}} + (X_{\text{lead}}(t) - X_{\text{trail}}(t))$
Merkez: $X_{\text{center}}(t) = \frac{X_{\text{lead}}(t) + X_{\text{trail}}(t)}{2}$

### Sınır Aşımı (Boundary Overstretch) Formülü:
$$X_{\text{knob}} = X_{\text{max}} + \Delta X \cdot \frac{1}{1 + \frac{\Delta X}{120}}$$
Gövde Genişlemesi: $W = W_{\text{base}} + \Delta X \cdot 0.65$
Gövde İncelmesi (Squash): $H = H_{\text{base}} \cdot \left(1 - \frac{\Delta X}{400}\right)$

---

## 4. KUSURSUZ DÖNGÜ (SEAMLESS LOOP) DOĞRULAMA TAAHHÜDÜ
- $f0$ (Kare 0): Button w=240, h=56, r=28, x=0, y=0, scale=1.0, cursorX=420, cursorY=380, cursorOpacity=0.
- $f839$ (Kare 839): Button w=240, h=56, r=28, x=0, y=0, scale=1.0, cursorX=420, cursorY=380, cursorOpacity=0.
- Delta: $\Delta = 0.0000$ (Sıfır atlama, kusursuz sonsuz döngü).
