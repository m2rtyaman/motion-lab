# UNIVERSAL MOTION GRAPHICS STUDIO — MASTER ARCHITECTURAL SPECIFICATION & QUALITY GATES (v5.5)

Bu belge; `motion-lab` deposunun yalnızca belirli bir marka veya senaryoya bağlı kalmadan, önüne gelen her türlü brief'i (B2B SaaS, E-ticaret, Fintech, Mobil Uygulama, Lansman Teaser'ı) **Claude Opus / Apple Keynote** yayın kalitesinde işleyebilen otonom ve evrensel bir Motion Graphics Motoru olması için gereken kuralları, matematiksel formülleri ve teknik denetimleri tanımlar.

---

## BÖLÜM 1: Evrensel Senaryo, Kurgu ve Hikaye Anlatımı (Narrative Engine)

### 1.1. Esnek Arketip Yönlendiricisi (Narrative Router)
Gelen prompt ve brief türüne göre aşağıdaki 5 kurgu arketipinden biri seçilir veya disiplinli şekilde melezlenir:

1. **Product-Flow-Tour (Ürün Akışı):** Keşif (Makro Veri/Tablo) → Mikro Etkileşim (İmleç Seçimi) → İçgörü/Değer (Çekmece/Analiz) → Aksiyon (Modal/İşlem) → Büyük Resim (Boru Hattı/Saha Rotası). *Örn: Octosift, Linear, Notion.*
2. **Problem-Agitation-Solution (PAS - Reklam Kurgusu):** Eski/Yorucu Yöntem (Düşük kontrast, kaos, yavaşlık) → Kırılma Anı (Whip-pan veya morph geçişi) → Ürünle Gelen Çözüm, Hız ve Netlik.
3. **Kinetic-Manifesto (Tipografi Odaklı):** %80 dev tipografi ve soyut geometrik formlar, %20 ürün/marka vurgusu. Staccato ritim, satır maskeleme ve zıt renk blokları. *Örn: Spotify, Nike, Stripe Sessions.*
4. **Bento-Feature-Grid (Özellik Vitrini):** Tek bir ana vaat etrafında 4-6 özelliğin modüler kartlar halinde sırayla parlayıp canlandığı lansman kurgusu. *Örn: Apple Hardware/Software Launch.*
5. **Metric-Storytelling (Veri & Fintech Anlatısı):** Küçük bir veri noktasından başlayıp dallanan grafikler, akış şemaları ve canlı sayaçlarla sonuca ulaşan analitik kurgu. *Örn: Stripe, Ramp, Plaid.*

### 1.2. Matematiksel Ritim ve Tempo Kontratı (Pacing & Rhythm Law)
- **Anti-Monotonluk Kuralı:** Bir videodaki tüm beat'lerin kare sayıları eşit olamaz ($\sigma(\text{durations}) > 18\text{ frame}$ şartı). Eşit süreye bölünmüş slayt gösterileri yasaktır.
- **Nefes Alma Eğrisi (Breathing Pacing):**
  - **Vuruş (Staccato Beat - 35 ila 55 frame):** Dikkat çekici girişler, hızlı eylemler, kısa vurucu başlıklar.
  - **Odak (Focus/Hold Beat - 75 ila 110 frame):** İzleyicinin tablo satırını, uyarı kutusunu veya grafiği okuması gereken anlar. Kamera burada sabit durmaz, yavaşça süzülür (`ambientDrift`).
  - **Mikro-Duraksama (Anticipation & Settle):** Tıklanan butonda modal anında %100 belirmez; tıklama dalgası (6 frame), ardından spring fiziğiyle açılış (14-18 frame) ve okuma süresi (40+ frame) ayrılır.

### 1.3. Görsel-Metinsel Tamamlayıcılık (Copywriting vs. UI Sync)
- **Tekrar Yasağı (Zero Redundancy):** Ekranda görünen UI bileşeninin başlığı ile sahnenin pazarlama metni (Overlay Headline) aynı kelimeleri içeremez.
  - *Yanlış:* Ekranda "Randevu Oluştur" modalı varken üstte "Randevu Oluşturun" yazması.
  - *Doğru:* Ekranda "Randevu Oluştur" modalı dolarken üstte "Saniyeler İçinde Takvimi Doldurun" yazması.
- **Tekil Odak Kuralı (Single Focal Point):** Bir sahnede izleyiciye en fazla 1 birincil odak sunulabilir. Aynı anda hem karmaşık tablo akıp hem sağdan çekmece açılıp hem de üstte uzun metin değişemez.

### 1.4. Sahne Geçiş Motivasyonu (Transition Semantics)
Her sahne geçişi sinematografik bir nedene dayanmalıdır:
- `spatial-zoom-in / spatial-zoom-out`: Genel görünümden detaya dalış veya detaydan genel görünüme çıkış.
- `spatial-pan`: Aynı geniş tuval üzerinde yan/alt modüle kayış (`InfiniteCanvasPan`).
- `ui-trigger`: İmleç tıklamasıyla açılan Modal, Drawer veya Sekme değişimi.
- `match-cut`: Bir form/kart geometrisinin bir sonraki sahnedeki başka bir bileşene dönüşmesi.
- **YASAK:** Ardışık iki sahne arasında bağlamsız `opacity` + `blur` (crossfade) geçişi kesinlikle yasaktır.

---

## BÖLÜM 2: Evrensel Kamera, Uzay ve Boyut Mimarisi (Spatial & Viewport Engine)

### 2.1. Sanal Tuval ile Çıktı Çözünürlüğünü Ayırma (Virtual Canvas Decoupling)
- **Sorun:** 9:16 (1080x1920) dikey videoya %100 genişlikle masaüstü `<AppShell>` yerleştirildiğinde sütunlar ezilir, metinler mikro boyuta iner veya sağdan taşarak kesilir (overflow clipping).
- **Evrensel Kural:**
  1. Masaüstü/Web arayüzleri her zaman sabit genişlikli bir **Sanal Tuvalde** (ör. `1440x900` veya `1600x1000`) render edilir.
  2. `<SpatialCamera>` bu sanal tuvali 3D uzay sahnesi olarak ele alır; 9:16 dikey çıktı için kamerayı aktif aksiyonun olduğu koordinata (`targetX`, `targetY`) odaklar ve kadrajı güvenli sınırlara göre ölçekler (`scale`).
  3. Çekmece açıldığında veya Kanban'ın 3. sütununa geçildiğinde kamera yatay pan yaparak hedefi tam merkeze alır; hiçbir bileşen ezilmez veya kesilmez.

### 2.2. Sürekli Kamera Nefesi (Zero-Dead-Frame Law)
- **Sorun:** GSAP tween'i bittikten sonra kameranın kilitlenmesi ve sonraki 40 kare boyunca ekranın hareketsiz bir ekran görüntüsüne dönüşmesi (`diffs: 0.01` veya `0`).
- **Evrensel Kural:** Birincil kamera hareketi tamamlansa dahi, her karede çalışan deterministik bir `ambientDrift(frame)` fonksiyonu devrededir:
  $$\Delta y = \sin(\text{frame} \times 0.04) \times 3\text{px}$$
  $$\Delta \text{scale} = 1 + \sin(\text{frame} \times 0.02) \times 0.015$$
  $$\Delta \text{rotZ} = \cos(\text{frame} \times 0.03) \times 0.15^\circ$$
- Bu sayede videonun hiçbir anında frame-diff değeri 1.2'nin altına düşmez; sahne her an canlı nefes alır.

### 2.3. Kamera ve Aktör (İmleç/Vurgu) Eş-Uzay Kuralı
- `<SimulatedCursor>`, `<ClickRipple>` ve `<CalloutBadge>` aktörleri harici viewport katmanında değil, doğrudan `<SpatialCamera>` içindeki sanal tuval koordinat sisteminde (`.spatial-world`) yaşar.
- Kamera `rotateX(15deg) rotateY(-12deg) scale(1.6)` yaptığında imleç hedeflenen buton üzerinden 1 piksel dahi sapamaz.

---

## BÖLÜM 3: Evrensel Tasarım, Tema ve Görsel Dil (Design System & Brand Extractor)

### 3.1. Otomatik Marka Çıkarımı (Vision-to-Token Pipeline)
Görsel verildiğinde veya brief tanımlandığında koda başlamadan önce zorunlu `ThemeConfig` üretilir:
- **Zemin Analizi:** Görselin %60'ından fazlası açık renkse `surfaceMode: "light"`, koyu ise `"dark"`, doygun marka zemininde ise `"vibrant-brand"`.
- **Renk Eşleme:** Birincil marka rengi (`accentPrimary`), ikincil vurgu (`accentSecondary`), başarı (`statusSuccess`), uyarı (`statusWarning`), kart zemini (`bgSurface`), ana tuval (`bgPrimary`).
- **Geometri:** Yuvarlak hatlı SaaS (`radius: 14px-20px`, soft-ambient gölge) vs. Keskin kurumsal (`radius: 4px-8px`, crisp 1px kenarlık).

### 3.2. Katmanlama ve Derinlik Hiyerarşisi (Z-Axis & Anti-Ghosting)
- **Hayalet Geçiş (Ghosting) Yasağı:** Yeni bir sahneye veya görünüme geçilirken eski katman en fazla 12 kare içinde tamamen kapanmalı veya gizlenmelidir. İki farklı sahnenin metinleri veya pinleri asla yarı şeffaf üst üste binemez.
- **Arka Plan Karartma (Dimming Backdrop):** Ön planda `<ModalDialog>` veya `<SlideOverDrawer>` açıldığında, arka plandaki arayüz `filter: blur(6px) brightness(0.92)` ve `opacity: 0.35` ile geri plana itilir.

### 3.3. Sinematik Pazarlama Başlık Katmanı (Editorial Overlay)
- Çıplak tarayıcı kaydı yerine, 9:16 dikey videolarda üst güvenli alanda (`top: 250px-350px`) büyük, yüksek kontrastlı pazarlama başlığı yer alır.
- **Kapanış (Hero Resolve):** Son sahnede en altta küçük bir buton göstermek yasaktır. Kamera geriye çekilirken ekranın merkezinde cam efektli büyük marka logosu, vurucu değer önerisi ve yüksek kontrastlı CTA butonu kilitlenir.

---

## BÖLÜM 4: Evrensel Yapı Taşları Kütüphanesi (src/primitives/ Envanteri)

Tüm bileşenler %100 prop ve veri-bağımsız (data-agnostic) çalışır:

1. **Kabuklar (Shells):**
   - `<BrowserFrame>`: URL barı, sekme başlığı, trafik ışıkları, tema uyumlu zemin.
   - `<DesktopAppShell>`: Sol dar/geniş sidebar, üst arama ve profil barı, ana içerik tuvali.
   - `<MobileDeviceFrame>`: Dynamic Island, hoparlör ızgarası, mobil navigasyon çubuğu.
   - `<BentoStage>`: 2x2 veya 3x2 modüler kart vitrini.
   - `<VirtualCanvas>`: 1440x900 sabit desktop tuvalini 3D kamera için normalize eden sarmalayıcı.

2. **Veri ve Arayüz Widget'ları (Widgets):**
   - `<DataTable>`: Çok sütunlu müşteri/işlem tablosu, durum rozetleri, satır vurgulama (`highlightedRowIndex`).
   - `<MetricCardRow>`: KPI sayaçları, canlı rakam (`NumberTicker`), trend yüzdeleri (+%24) ve sparkline.
   - `<InteractiveMap>`: Vektörel SVG sahil/sokak haritası, radar ping pinleri, otomatik kesikli rota çizgisi.
   - `<CalendarGrid>`: Aylık/haftalık zaman matrisi, seçili gün ve saat bazlı randevu blokları.
   - `<KanbanBoard>`: Sütunlar, boru hattı metrikleri ve aşamalar arası translate3d + rotateZ ile taşınan kartlar.
   - `<SlideOverDrawer>`: Sağdan/soldan kayan detay çekmecesi, form alanları ve analiz uyarı kutusu.
   - `<ModalDialog>`: Spring fiziğiyle açılan merkezi onay/randevu penceresi.
   - `<ChartCanvas>`: Çizgi, bar ve pasta grafiklerini progress (0 → 1) ile çizen veri görselleştirici.

3. **Aktörler ve Başlıklar:**
   - `<SimulatedCursor>`: Koordinat dizisiyle (`x, y, action`) çalışan, tıklama anında `.cursor-ripple` yayan imleç.
   - `<KineticHeadline>`: Satır maskesi (`overflow: hidden`) ile aşağıdan yukarı fırlayan pazarlama başlığı.

---

## BÖLÜM 5: Otomatik Kalite Kapıları ve Denetim Standartları

### 5.1. `validate-spec.mjs` (Senaryo & Şema Kapısı)
- **Görsel Eşleşme Zorunluluğu:** Brief veya ekran görüntülerinde yer alan tüm ana ekran tipleri `spec.json` içindeki `detectedWidgets` alanında listelenmeli ve kodda bulunmalıdır.
- **Süre Varyansı:** Tüm beat'lerin süreleri aynıysa ($\sigma < 10\text{ frame}$) hata fırlatılır.
- **Kamera Boşluğu:** İki kamera hareketi arasında en fazla 1.0 saniye boşluk olabilir; sahne donuk kalamaz.

### 5.2. `ast-lint.mjs` (AST Sözdizimi Ağacı Kapısı)
- **`SLOP-004` (Görsel Girdi Denetimi):** `spec.json` içindeki `detectedWidgets` dizisinde yer alan tüm bileşenlerin `Scene.tsx` AST ağacında gerçek JSX öğesi (`JSXOpeningElement`) olarak kullanıldığını doğrular.
- **`SLOP-001` (Boş Alan Denetimi):** Sahnenin çıplak div veya tek kartla geçiştirilmesini engeller; yapısal kabuk zorunludur.
- **Sihirli Sayı & Layout Tween Yasağı:** `top, left, width, height` tween'i yasaktır; yalnızca GPU özellikleri (`transform, opacity, filter`) tween edilir.

### 5.3. `contact-sheet.mjs` & `manifest.json` (Fiziksel Render Kapısı)
- **Alt-Aralık Hareket Zorunluluğu (Sub-Beat Motion Gate):**
  Bir beat içindeki `diffs` dizisinde yer alan HER BİR ardışık kare farkı en az **1.2** olmak zorundadır:
  $$\forall d \in \text{beat.diffs}: d \ge 1.2$$
  Tek bir `0.01` veya `0` fark tespit edilirse test **FAIL** verir ve render reddedilir.
- **Adversarial Görsel Denetim:**
  Model görsel öz-denetim yaparken övgü değil, şu 4 hatayı aramak zorundadır:
  1. Sağdan/soldan kesilmiş metin veya kutular (clipping).
  2. Üst üste binen yarı saydam okunaksız katmanlar (ghosting).
  3. İki kare arasında hiçbir pikselin değişmediği donuk anlar ($d < 1.2$).
  4. Okunamayacak kadar küçük mikro-font veya silik CTA.

---

## BÖLÜM 6: Octosift B2B SaaS İdeal Senaryo Matrisi (360 Frame / 6 Saniye)

| Beat | Frame Aralığı | Süre | Odak & Ekran | Kamera Hareketi | Üst Pazarlama Başlığı |
|---|---|---|---|---|---|
| **1. Keşif** | f0 - f70 | 1.17s | `MetricCardRow` (250 Kredi, ₺120k Boru Hattı) + `DataTable` (İzmir 30 Firma) | `IsometricTilt` (14° → 3°) & `FocusZoom` | *"Web Sitesi ve Reklamı Olmayan Sıcak Müşterileri Yakalayın"* |
| **2. İçgörü** | f71 - f150 | 1.33s | `SlideOverDrawer` (Varuna Gezgin) & Amber Uyarı Kutusu | `FocusZoom` (sağa pan, scale: 1.35) | *"Yapay Zeka Destekli Satış ve Fırsat Analizi"* |
| **3. Randevu** | f151 - f225 | 1.25s | Arka plan blur takvim + Merkezde `ModalDialog` (28.10.2026, 09:00) | Kamera merkeze kilitlenir; spring pop-in | *"Tek Tıkla Görüşme Planlayın"* |
| **4. Saha Rotası** | f226 - f300 | 1.25s | `InteractiveMap` (İzmir Alsancak pinleri, animasyonlu rota çizgisi) | Harita üzerinde süzülüş (`CanvasPan`) | *"Sahada Akıllı Rota, Maksimum Ciro"* |
| **5. Kapanış** | f301 - f360 | 1.00s | 2.5D derinlikte süzülen arayüz + Merkezde büyük Octosift Marka Kartı & CTA | `applyIsometricTilt` (geriye çekiliş) | *"B2B Satışlarınızı Otomatikleştirin • octosift.com"* |
