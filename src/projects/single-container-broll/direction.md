# Direction — Single Container B-Roll

## Tek Cümlelik Hedef
Kesintisiz yaşayan tek bir fiziksel kabın (hap -> terminal -> segmentli kaydırıcı -> 3D telemetri) organik imleç koreografisi ve reaktif derinlik kamerasıyla form değiştirerek ürün gücünü sergilediği yüksek profilli B-roll tanıtımı.

## Paradigm
editorial-ui (16:9, 60 FPS, 12 saniye)

## 3 Girdi Görev Ayrımı (The 3-Input Rule)
> Referans: references/MASTER_STORYBOARD_RULES.md
- **Script (Senaryo - Neyi/Niçin):** Gemini 3.8 Flash'ın anlık TTFT (12ms) ve akıl yürütme gücünün canlı terminal ve interaktif kaydırıcı ile kanıtlanması.
- **Storyboard (Görsel Kurgu - Nasıl Görünüyor):** Açık mimari stüdyo tuvali üzerinde yüzen obsidyen donanım penceresi ve 3 katmanlı derinlik kompozisyonu.
- **Motion Reference (Hareket Dinamiği - Nasıl Hareket Ediyor):** Damped spring formülleriyle çalışan akıcı kapsayıcı metamorfozu, kavisli imleç ve reaktif kamera nefes alışı.

## 3 Katmanlı Derinlik Mimarisi (3-Layer Depth System)
- **Katman 1 (Zemin):** Prestijli açık mimari stüdyo tuvali (`#F8F9FA` / `#EAE8E3`) ve kılcal 1px kılavuz çizgileri.
- **Katman 2 (İkincil Derinlik & İz):** Kabın arkasından gelen yumuşak difüze temas gölgesi (`box-shadow: 0 32px 80px rgba(0,0,0,0.12)`) ve reaktif kamera derinliği.
- **Katman 3 (Kahraman Ön Plan):** Kristal netliğinde Google Sans tipografi, 1px pahlı speküler faset ve `#the-morph-container` ana kahraman aktörü.

## Kahraman Aktör Yaşam Döngüsü (TheHeroActor Lifecycle)
0. kareden 720. kareye kadar kesintisiz yaşayan Tek Yaşayan Kap (`#the-morph-container`):
[Kompakt Obsidyen Hap] ➔ [Genişleyen GenAI Terminali] ➔ [Hassas Akıl Yürütme Kaydırıcısı] ➔ [Kılcal Telemetri & DeepMind Kapanışı (1.2s+ Stillness Hold)]

## Concept
Google DeepMind ve Gemini 3.8 Flash altyapısından güç alan bu sahne, "Tek Kap İlkesi" (Single Living Container Law) üzerine inşa edilmiştir.
Sahnede hiçbir zaman ekranlar arası kopuk slayt geçişi (crossfade dissolve) veya unmount yapılmaz; gereksiz header/footer meta-etiketleri tamamen kaldırılmıştır.
0. kareden 720. kareye kadar yaşayan tek bir ana geometrik kap (`#the-morph-container`), izleyicinin gözünü asla kaybetmeden şu evrelerden geçer:
1. **0 - 150 kare (2.50s) — Dark Obsidian Capsule**: 500x104px kompakt hap formunda ışıltılı 4 köşeli Gemini yıldızı, tek satırda net "Gemini 3.8 Flash" tipografisi ve elektrik mavisi "Flash Live" rozeti.
2. **151 - 320 kare (2.82s) — Google GenAI Terminal**: İmlecin rozeti tetiklemesiyle patlayan 940x480px resmi Google GenAI SDK (`@google/genai`, model: `gemini-3.8-flash`) yürütme terminali.
3. **321 - 520 kare (3.32s) — Adaptive Thinking Slider**: Minimal obsidiyen kaydırıcı kapsül üzerinde 4 duraklı (Low, Medium, High, Argon) hassas akıl yürütme kaydırıcısı ve elastik sürükleme.
4. **521 - 720 kare (3.32s) — Gemini Telemetri & Google DeepMind Lockup**: 1px paylaşımlı kılcal ızgara üzerinde gerçek Gemini telemetrisi (12ms TTFT, 99.4% Multimodal Reasoning, Zero Cuts) ve Google DeepMind marka kapanışı (`GEMINI 3.8 FLASH`).

## Physics & Camera Choreography
- **Reaktif Dinamik Kamera Derinliği**: Rastgele x/y yalpalaması içermeyen, kabın genişleme ve daralmasına akıcı (liquid) tepki veren `CameraRig` derinlik yaylanması:
  - 0 - 2.5s (Kapsül): Samimi sıcak odak (`scale: 1.06`, smooth spring: damping: 24, stiffness: 120).
  - 2.5s (Terminal açılışı): Geniş pencereye ferah sıvı geri açılış (`scale: 1.06 -> 1.0`, smooth spring).
  - 5.33s (Slider geçişi): Daralan forma ve etkileşime akıcı yaklaşma (`scale: 1.0 -> 1.05`, smooth spring).
  - 8.64s (Telemetri): Genişleyen telemetri kartına dengeli nefes alma (`scale: 1.05 -> 1.0`, smooth spring).
- **Yay Fiziği**: `pure-motion-math` altındaki `dampedSpring` ve `trackSpring` formülleri (w: 16, z: 0.82) ile tok, endüstriyel ve sıfır yalpalama gösteren şekil dönüşümleri.
- **İmleç Biyomekaniği**: `createCurvedCursorTrajectory` ile insan kolunun doğal yaylanma kavisi, tıklama öncesi mikro-durgunluk (anticipation) ve tok basma ezilmesi (squash).
- **GPU Saflığı**: Yalnızca `transform`, `opacity`, `filter`, `width`, `height` ve `borderRadius` tween edilir; layout reflow oluşturulmaz.

## Typography & Palette
- **Zemin**: Saf, prestijli mimari tuval (`#F8F9FA` / `#EAE8E3`).
- **Kap Gövdeleri**: Obsidiyen donanım tonu (`#131314`) ve saf stüdyo beyazı (`#FFFFFF`), kılcal kenarlık `rgba(0,0,0,0.08)`.
- **Vurgu**: İmza Gemini Elektrik Mavisi (`#1A73E8`, `#4285F4`, `#8AB4F8`) ve zümrüt telemetri (`#10B981`).
- **Tipografi**: Google Sans / Archival Swiss Grotesk (`Inter` / `system-ui`) ve asil editoryal italik vurgular.
- **Yayın Standardı**: Sıfır mikro-font (minimum 18px), sıfır çiğ neon glow, sıfır sahte meta-etiket.
