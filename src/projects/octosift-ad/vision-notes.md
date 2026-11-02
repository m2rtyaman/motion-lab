# Vision Notes — octosift-ad (15 kare, out/octosift-ad/vision/manifest.json)

## 1. GÖRSEL ÖZ-DENETİM VE KARE ANALİZİ
- **f003 - f046 (radar-discovery)**:
  - macOS/Chrome tarzı `<BrowserFrame>` ve Slate-50 zeminli `<AppShell>` içinde müşteri tablosu ve KPI kartları açılıyor.
  - Yeni eklenen `<TemplateFrame>` (`frame-data-rollup`) canlı yay çubukları ve yuvarlanan sayılarla (%94, %88, %76, %64) B2B doğrulama telemetrisini kristal netlikte sergiliyor.
  - `#2563EB` Kraliyet Mavisi ve `#0f172a` metin hiyerarşisi kusursuz; mikro-font ve neon parlaması yok.
  - Karar: **Onaylandı**.

- **f053 - f141 (lead-intel)**:
  - Tabloda tıklanan Varuna Gezgin satırı vurgulanırken, arka plandaki tablo ve telemetri katmanı zarifçe bulanıklaşıyor (`filter: blur(6px) brightness(0.92)`).
  - Sağ kenardan `<SlideOverDrawer>` akıcı şekilde açılıyor.
  - Amber arka planlı "⚡ Web Sitesi ve Reklam Analizi" uyarı kutusu ve Fırsat Skoru rozetleri yüksek kontrastla okunuyor.
  - 3D kamera çekmeceye doğru `applyFocusZoom` ile yaklaşırken imleç satıra kilitleniyor.
  - Karar: **Onaylandı**.

- **f148 - f206 (appointment-action)**:
  - `<CalendarGrid>` arkada bulanık kalırken, merkeze `<ModalDialog>` ("Yeni Randevu / Etkinlik Ekle") spring eğrisiyle yerleşiyor.
  - Müşteri: Inn Coffee, Tarih: 28.10.2026, Saat: 09:00 ve "Takvime Kaydet" butonu kusursuz ölçekte.
  - Karar: **Onaylandı**.

- **f213 - f301 (field-route)**:
  - İzmir Alsancak vektörel haritası (`<InteractiveMap>`) ve hareketli plasiyer rotası açılıyor.
  - 5 hedef firma pini ve optimize edilmiş saha rotası yeşil/mavi aksanlarla animasyonlu akıyor.
  - Karar: **Onaylandı**.

- **f308 - f357 (hero-resolve)**:
  - Kamera `applyIsometricTilt` ile 2.5D derinlikte stüdyo açısına geri çekiliyor.
  - Koyu cam dokulu `<hero-brand-card>` merkezde açılarak "Octosift ile B2B Satışlarınızı Otomatikleştirin • octosift.com" damgasıyla videoyu kilitliyor.
  - Karar: **Onaylandı**.

## 2. HİBRİT MOTOR & GENEL DEĞERLENDİRME
- `html-video` motorunun deklaratif şablon mimarisi (`TemplateFrame`, `HtmlFrameDriver`, `DataRollup`) ve `motion-lab`'in `theme-contract.ts`, `SpatialCamera`, `primitives` sistemleri başarıyla birleştirildi.
- 9:16 dikey mobil yayın oranına tam oturan, 60 FPS deterministik MP4 fiziksel olarak üretildi (`out/octosift-ad/octosift-ad.mp4`).
- Sıfır tip hatası, %100 yeşil kalite kapısı (spec, AST, slop-linter, critic 10/10, glyph, math tests).
