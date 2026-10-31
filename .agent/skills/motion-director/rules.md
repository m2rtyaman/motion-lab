# Anti-Slop Design, Kinetic Rhythm & Engineering Invariants (Zero-Tolerance)

Bu dosya sistemin estetik, ritim ve mühendislik yasasıdır. Üretilen her kodda istisnasız uygulanacaktır.

### 1. Görsel Yasaklar (Visual Slop — Sıfır Tolerans)
- **YASAK:** Mor (`#7c3aed`, `#8b5cf6`), indigo (`#6366f1`), cyan (`#06b6d4`, `#38bdf8`), pembe (`#ec4899`) neon degradeler, `box-shadow` ve `drop-shadow` neon ışımaları.
- **YASAK:** Arka plana atılan radyal bulanık renk lekeleri (ambient blobs) ve anlamsız mesh gradientler.
- **YASAK:** Bento-grid ezberi (arayüzü sebepsiz yere 3-4 parçalı simetrik kartlara bölmek).
- **YASAK:** İlkel SVG daire/kutu primitifleriyle insan yüzü, saç, bıyık veya maskot çizmek.
- **YASAK:** Dairesel renkli kutuların içine hapsedilmiş süs ikonları.

### 2. Kinetik Ritim Yasaları (Anti-Sluggishness / Hantallık Yasağı)
- **YASAK (Ölü Zaman / Dead Hold):** Hiçbir görsel durum ekranda 2.5 – 3.2 saniyeden uzun kalamaz ve hiçbir eleman 1.5 saniyeden uzun süre hareketsiz bekleyemez.
- **ZORUNLU (Üçlü Kinetik Döngü — `IN -> ACTION -> OUT`):**
  * **IN (`0.35s – 0.50s`):** `expo.out` ile keskin giriş + alt elemanlarda `0.04s – 0.06s` mikro-stagger (Toplam stagger tavanı `0.30s`).
  * **ACTION (`1.50s – 2.20s`):** Sahne içi canlı veri akışı (60 FPS sayaç interpolasyonu, `strokeDashoffset` çizimi, `scaleX`/`scaleY` lazer ilerlemesi, ardışık terminal satırları veya kart yığını itmesi) + sürekli mikro-drift (`y: 0 -> -10px` veya `scale: 1 -> 1.02`).
  * **OUT (`0.28s – 0.38s`):** Girişten %30–%40 daha hızlı çıkış (`power2.in`) ve bir sonraki beat ile **0.15s – 0.20s bindirmeli geçiş (overlap)**.

### 3. Tipografi ve Hiyerarşi
- Tüm telemetri, metrik, kod, zaman damgası ve teknik etiketler `font-mono` olmak zorundadır.
- Ana başlıklar `tracking-tighter` (-0.04em) veya `tracking-tight` (-0.03em) ve yüksek kontrastlı (`#f4f4f5`) olmalıdır.
- Mikro etiketler: `text-[10px] uppercase tracking-widest font-mono text-zinc-500`.

### 4. Katman, Kenarlık ve 9:16 Güvenli Alan Mimarisi
- Varsayılan format **9:16 Dikey (`1080×1920 @ 60 FPS`)** olup üst `250px` ve alt `300px` güvenli alanları korunmalıdır.
- Kenarlıklar daima 1px kılcal sınırlardır (`border-white/[0.06]` veya `border-white/[0.08]`).
- Yuvarlatma sınırları: İç bileşenler `rounded-md` (6px), ana yüzeyler en fazla `rounded-xl` (12px). Asla devasa hap `rounded-3xl` kullanılmaz.

### 5. GPU Katman Saflığı ve Deterministik Performans
- Yalnızca `transform` (`x`, `y`, `scale`, `scaleX`, `scaleY`, `rotate`) ve `opacity` (ve giriş/çıkışlarda kontrollü `filter: blur()`) özellikleri anime edilebilir.
- `top`, `left`, `right`, `bottom`, `width`, `height`, `margin`, `padding` tween etmek **KESİNLİKLE YASAKTIR**.
- Ham `setTimeout`, `setInterval` ve CSS `@keyframes` yasaktır; tüm animasyonlar `useRemotionGSAP` üzerinden kare indeksine (`tl.seek(frame / fps)`) kilitlenmelidir.
