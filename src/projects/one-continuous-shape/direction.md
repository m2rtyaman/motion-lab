# KONONSEPT & HAREKET YÖNERGESİ: ONE CONTINUOUS MORPHING SHAPE

## Bu videonun tek cümlelik hedefi şu:
İzleyiciye, tek bir siyah geometrik kabın kesintisiz morfoloji ve fiziksel yay dinamiğiyle 120 BPM nabzında 12 farklı UI bileşenine evrilip başlangıç noktasına kusursuzca döndüğü hipnotik bir Dribbble deneyimi yaşatmak.

---

## 1. ÜÇ GİRDİNİN GÖREV AYRIMI (Three-Input Contract)
1. **Script (Ne & Neden):**
   - Tek bir yaşayan UI nesnesinin yaşam döngüsü: Button → Loader → Checkmark → Dynamic Island → Music Player → Scrub Progress Bar → Volume Slider (Overstretch) → Toggle Switch → Liquid Tab Indicator → Chart Canvas (Spline & Tooltip) → ⌘K Command Palette → Toast Notification → Button (Seamless Loop).
2. **Storyboard (Görünüm & Derinlik):**
   - 1440x1440 kare tuval.
   - Sıcak açık gri zemin (`#F4F4F2`).
   - Saf siyah obsidian kap (`#0A0A0A`) ve pürüzsüz kenar radyusları.
   - Vurgu rengi: Electric Indigo (`#5E5CE6`).
   - Geist fontu ile 18px+ saf tipografi.
3. **Motion Reference (Hareket Dinamiği):**
   - 120 BPM kilitli ritim (her beat 30 kare = 0.5s).
   - Analitik kapalı-form sönümlü osilatör yayları (`solveSpringFrame`).
   - Sıfır CSS transition, sıfır setTimeout, tam Remotion determinizmi.
   - Likit asimetrik sekmeler (önden koşan ön kenar, arkadan toplanan arka kenar).
   - Doğrudan manipülasyonda sınır aşımı (squash & stretch overstretch).

---

## 2. ÜÇ KATMANLI DERİNLİK MİMARİSİ (3-Layer Depth Architecture)
1. **Katman 1 — Zemin Düzlemi (translateZ: 0px):**
   - Sıcak açık gri tuval (`#F4F4F2`), mikro-grid kılcallığı ve ortam ışığı.
2. **Katman 2 — The Hero Actor / Tek Kap (translateZ: 40px):**
   - `#0A0A0A` obsidian gövde, dinamik `width`, `height` ve `borderRadius` morfolojisi.
   - Çift katmanlı gölge: `0 24px 48px -12px rgba(0, 0, 0, 0.20), 0 2px 6px rgba(0, 0, 0, 0.08)`.
3. **Katman 3 — Ön Plan & Vektör Katmanı (translateZ: 70px - 90px):**
   - İkonlar, tipografi, dalga formu, spline grafiği, manyetik tooltip ve kavisli yörüngeli doğrudan manipülasyon imleci.

---

## 3. KAMERA MOTİVASYONU & AKIŞ KOREOGRAFİSİ
- Kamera her zaman aktif odağı çerçevenin ortasında tutar.
- Küçük, hassas durumlarda (Button, Loader, Checkmark, Toggle) kamera mikro-detayı büyütmek için 1.25x – 1.35x zoom yapar.
- Geniş açılı panellerde (Music Player, Chart Canvas, Command Palette) sahnenin nefes alması için kamera 0.98x – 1.05x aralığına yumuşakça açılır.
- Bulanıklığı önlemek için ölçeklenen katmanlarda `will-change` kullanılmaz.

---

## 4. KUSURSUZ DÖNGÜ (SEAMLESS LOOP) GARANTİSİ
Son kare (kare 839) konum, boyut, radyus ve imleç koordinatları bakımından ilk kare (kare 0) ile 0.0000 hata payıyla örtüşür. Video sonsuz döngüde oynatıldığında eklem noktası kesinlikle fark edilemez.
