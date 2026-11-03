# HYBRID SHOWCASE (VELOCE CLOUD) — DİREKTÖR VE KURGU REHBERİ

## 1. TEK CÜMLELİK HEDEF (STORY-001)
Bu videonun tek cümlelik hedefi şu: Veloce Cloud'un tek tıkla global dağıtım hızını, Bento panelindeki "Ship to Production" butonunun patlayarak 1920x1080 tam ekran kinetik tipografiye dönüşmesi ve kameranın merkez halkadan canlı CLI terminaline dalmasıyla kesintisiz olarak kanıtlamaktır.

---

## 2. ÜÇ GİRDİNİN GÖREV AYRIMI (THE 3-INPUT RULE)
- **Script (Ne & Neden):** Geliştiriciler için sıfır kesintili global dağıtım motoru ("Veloce Edge Cloud"). Önce canlı gecikme metrikleri ve dağıtım tetikleyicisi gösterilir (Bento), ardından "Ship in 40 Milliseconds" vaadi tam ekran kinetik tipografiyle vurulur (Kinetic Void), hemen içinden canlı CLI terminal çıktısı kanıtlanır (Terminal) ve aydınlık marka kapanışıyla tamamlanır.
- **Storyboard (Görünüm & 3 Katmanlı Derinlik Mimarisi):**
  - **Katman 1 (Zemin & Renk Kontrastı):** Sıcak mimari taş zeminden (`#F4F1EA`) koyu kobalt-obsidyene (`#070B14`), oradan karbon terminale (`#0D1117`) ve finalde parlak fildişi (`#FAF8F5`) tam ekran zeminlere dinamik renk bloklaması (Color Blocking).
  - **Katman 2 (Hayalet Kontur & İkincil Derinlik):** 940px çapında tam ekran dönen altın/kobalt pahlı halkalar (`SculpturalRings`) ve 1px kılcal ızgara (`HairlineGrid`).
  - **Katman 3 (Ön Plan & Kahraman Aktör):** `TheHeroActor` ve bileşen devralma köprüleri (`transitionElementTakeover` & `transitionCameraDive`). Bento içindeki `#ship-trigger-pill` 18x büyüyerek Sahne 2'nin tam ekran zeminine dönüşür; Sahne 2'nin merkez portalından 2.85x kamera dalışıyla Terminal penceresi doğar.
- **Motion Reference (Nasıl Hareket Eder):** Makro yakın çekim (`scale: 1.95x`) açılışı, kavisli Bézier imleç tıklaması, 18x bileşen patlaması (`transitionElementTakeover`), 2.85x portal kamera dalışı (`transitionCameraDive`) ve finalde 80 karelik (1.33s) mutlak okuma durgunluğu (Stillness Hold).

---

## 3. STORYBOARD VE SAHNE ARKETİP ZAMAN TABLOSU

| Beat | Sahne Arketipi | Kare Aralığı | Süre (s) | Ölçek & Kamera | Handoff & Köprü | Zemin Rengi |
|---|---|---|---|---|---|---|
| **B1: Edge Metrics** | `bento-editorial` | 0 – 170 | 2.83s | `1.95x` Makro yakın çekimden `1.04x` geniş kadraja açılış | İmleç `#ship-trigger-pill` butonuna tıklar ve buton `18x` patlar (`transitionElementTakeover`) | `#F4F1EA` (Sıcak Taş) |
| **B2: Velocity Statement** | `kinetic-void` | 171 – 365 | 3.23s | `1920x1080` Çerçevesiz Tam Ekran (Full-Bleed) | Kamera merkez portal halkasına `2.85x` dalar (`transitionCameraDive`) | `#070B14` (Derin Kobalt) |
| **B3: CLI Verification** | `terminal-mockup` | 366 – 520 | 2.57s | `1.45x` yakın çekimden `1.06x` terminal kadrajına yerleşme | `#verified-release-pill` büyüyerek final fildişi ekranı açar (`transitionContainerMorph`) | `#0D1117` (Karbon CLI) |
| **B4: Brand Payoff** | `product-promo` | 521 – 600 | 1.33s (80f) | `1.0x` Tam Ekran Kilitli Marka Kartı | **80 kare (1.33s Stillness Hold)** | `#FAF8F5` (Aydınlık Fildişi) |
