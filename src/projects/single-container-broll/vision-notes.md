# Görsel Denetim Notları (Vision Notes) — Single Container B-Roll

## Genel Bakış
- **Proje**: `single-container-broll` (1920x1080 16:9, 60 FPS, 12 saniye / 720 kare)
- **Paradigma**: `editorial-ui` (Tek Kap / Single Living Container B-Roll)
- **Marka & Tema**: Google DeepMind / Gemini 3.8 Flash (İmza Elektrik Mavisi `#1A73E8`, `#4285F4`, göksel derin indigo `#0B0F19`, saf stüdyo beyazı `#FFFFFF` ve sıcak editoryal kağıt `#EAE8E3`).
- **Reaktif Dinamik Kamera Derinliği**: Rastgele x/y yalpalaması kesinlikle içermeyen, kabın form değişimlerine duyarlı akıcı (liquid) `CameraRig` derinlik yaylanması (scale: 1.06 -> 1.0 -> 1.05 -> 1.0, smooth spring: damping: 24, stiffness: 120). Sahnenin tek ve tartışmasız kahramanı merkezdeki yaşayan bileşendir (`#the-morph-container`).

---

## Kare Bazlı Görsel Öz-Denetim (Frame-by-Frame Audit)

### Beat 1: Hook — Gemini 3.8 Flash Obsidian Capsule (0 – 150 kare)
- **`f3`**: Sahne açılışında mimari kılcal ızgara üzerinde derin indigo/obsidiyen kapsül (`#0B0F19`, `500x104px`, `52px` yarıçap) tok bir varlıkla merkezlenir. Kamera samimi sıcak odakla `scale: 1.06` seviyesine yerleşir.
- **`f75`**: Elektrik mavisi 4 köşeli göksel Gemini yıldızı (`#1A73E8`), kalın beyaz "Gemini" ve mavi "3.8 Flash" tipografisi tek bir satırda mükemmel nefes alma payıyla yerleşir; satır kırılması veya sıkışma sıfırdır. Sağ tarafta elektrik mavisi "Flash Live" rozeti (`#1A73E8`) canlı nabız noktasıyla ışıldar. Organik kavisli imleç (`animateCursorAlongBezier` + `generateCurvedCursorTrajectory`) sağ alt köşeden hedefe doğru insansı el biyomekaniğiyle süzülür.
- **`f147`**: İmleç rozetin tam üzerine kilitlenir (kamera 1.06 derinliği hesaba katılarak cursor container `(1122.5, 536.5)` konumunda pointer ucunu tam Flash Live rozet merkezine `(1127.5, 540)` oturtur). 180ms'lik öngörülü durgunluk (anticipation) ve tok basma ezilmesi gerçekleşir. Elektrik mavisi tıklama dalgası (`.cursor-ripple`) patlar ve Stage 2'yi tetikler.

### Beat 2: Proof — Google GenAI Streaming Runtime Terminal (151 – 320 kare)
- **`f154`**: Tek kap kuralı gereğince kapsül unmount olmadan, FLIP ve yay fiziğiyle (`back.out(1.25)`) `940x480px` boyutunda, `24px` köşe yarıçaplı mimari beyaz terminale patlayarak açılır. Eşzamanlı olarak kamera `scale: 1.06 -> 1.0` aralığında sıvı bir şekilde geri çekilerek pencereye ferahlık kazandırır. macOS tarzı 3 trafik noktası, `gemini.stream.ts` sekmesi ve "Streaming · 12ms TTFT" durum rozeti anında yerleşir.
- **`f236`**: Canlı TypeScript kod blokları (`import { GoogleGenAI } from '@google/genai';`, `const ai = new GoogleGenAI();`, `model: 'gemini-3.8-flash', thinkingBudget: 8192`) 70ms'lik ardışık basamaklama (stagger) ile daktilo netliğinde akar.
- **`f317`**: Alt kısımda "Multimodal Stream · 12ms TTFT · Verified" doğrulama bandı kilitlenir. İmleç organik Bézier kavisiyle aşağıya doğru süzülerek Thinking Segmented Slider evresine hazırlanır.

### Beat 3: Flow — Adaptive Thinking Segmented Slider (321 – 520 kare)
- **`f324`**: Terminal kabı kesintisiz bir form devriyle `880x120px` boyutunda, `60px` yarıçaplı Thinking Segmented Slider'a FLIP-morph eder (`back.out(1.3)`). Form daralırken kamera akıcı bir biçimde `scale: 1.0 -> 1.05` odaklanması yaparak etkileşimi öne çıkarır. 4 durak ("Low", "Medium", "High", "Argon") 1px kılcal ızgara düzeninde hizalanır.
- **`f421`**: Minimal obsidiyen kaydırıcı kapsül ve zarif mavi kenarlık yer alır. İmleç 5.75s'de "Low" kolunu tıklar ve tutar; elastik yay overshoot'uyla (`back.out(1.6)`) "Low"dan "High" durağına sürükler (`x: 426px`, imleç tam `(1063, 536.5)` koordinatında hap koluna kilitli). Koyu renkli aktif obsidiyen kapsül High etiketini beyaz (`#FFFFFF`) yapar.
- **`f517`**: İmleç ikinci hamleyle kapsülü "Argon" (Next-Gen Reasoning) durağına çeker (`x: 639px`, `back.out(1.8)`) ve tok bir klik dalgasıyla kilitler. İmleç sağ-alta doğru zarif bir Bézier kavisiyle çekilerek sahneyi final telemetriye bırakır. Beat 3 sonu olan `f517` karesinde kaydırıcı henüz bulanıklaşmadan net bir şekilde okunur kalır.

### Beat 4: Verdict — Gemini Telemetry Matrix & DeepMind Lockup (521 – 720 kare)
- **`f524`**: `transitionZoomPunch` ile kabın telemetri matrisi açılır (`960x480px`, `28px` yarıçap). Kamera `scale: 1.05 -> 1.0` nefes alarak genişleyen karta dengeli bir derinlik kazandırır. "GEMINI 3.8 FLASH TELEMETRY MATRIX" başlığı ve DeepMind rozeti 8.64s'den itibaren anında odaklanır. 8.64s'de tetiklenen hücre basamaklaması sayesinde `f524` karesinde üç metrik hücresi ("99.4%", "12 ms", "12.0 s") boş gri zemin yerine tamamen belirgin ve okunur haldedir.
- **`f621`**: 1px paylaşımlı kılcal ızgara (Subgrid Shared Borders) içerisinde üç ana telemetri hücresi ("99.4% MULTIMODAL REASONING", "12 ms TIME TO FIRST TOKEN", "12.0 s ZERO CUTS") tok darbeyle okunur hale gelir.
- **`f717`**: "GEMINI 3.8 FLASH / Multimodal Intelligence Engine" ana marka kilidi ve sağda "Google DeepMind" stüdyo rozeti ekranda 2.5 saniye boyunca dondurulmadan, mikro nefes alan deterministik sinüs titreşimiyle tam okunur kalır (1.2s kuralı fazlasıyla sağlanır).

---

## Adversarial Anti-Slop Onay Özeti
- [x] **Reaktif Dinamik Kamera**: Rastgele x/y yalpalaması kesinlikle yoktur; yalnızca konteynerin form değişimine eşlik eden sıvı derinlik yaylanması (scale: 1.06 -> 1.0 -> 1.05 -> 1.0, smooth spring damping: 24, stiffness: 120) uygulanmıştır.
- [x] **Üst ve Alt Süs Etiketleri Yasağı**: Header ve footer içindeki sahte meta-debug sloganları tamamen silinmiş, tuval tertemiz tutulmuştur.
- [x] **Tek Kap İlkesi**: Tek bir DOM div elemanı (`#the-morph-container`) 0. kareden 720. kareye kadar $opacity = 1$ olarak fiziksel form değiştirmiştir; sahneler arası unmount veya slayt geçişi kesinlikle yoktur.
- [x] **Pencere & Donanım Çapalaması**: Uzay boşluğunda yüzen bento kutusu yoktur.
- [x] **Marka & Model Saflığı**: Tüm "Gemini 2.5" ibareleri "Gemini 3.8 Flash" olarak güncellenmiş; terminal kodunda `gemini-3.8-flash` ve slider duraklarında `Low, Medium, High, Argon` kullanılmıştır.
- [x] **Yayın Tipografisi**: 18px altında mikro-font bulunmaz; başlıklar 44px ve 28px ölçeğindedir.
- [x] **Organik İmleç**: `animateCursorAlongBezier` ve `generateCurvedCursorTrajectory` ile kavisli insan eli eğrisi, tıklama öncesi durgunluk (anticipation), squash ve elastik sürükleme kamera derinliğine göre kalibre edilmiştir.
