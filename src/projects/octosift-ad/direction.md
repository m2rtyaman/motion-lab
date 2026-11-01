# OCTOSIFT — B2B MÜŞTERİ BULMA & CRM YAZILIMI REKLAM TANITIMI

## 1. MARKA KİMLİĞİ VE TEMA KARARLARI
- **Ürün:** Octosift (B2B Lead Generation, Saha Satış & Pipeline CRM Platformu).
- **Surface Mode:** `light` (`LIGHT_SAAS_THEME`).
- **Renk Paleti:**
  - `accentPrimary`: `#2563EB` (Kraliyet Mavisi / Royal Blue) — Güvenilir, kurumsal, modern B2B SaaS.
  - `bgPrimary`: `#f8fafc` (Slate-50 nötr açık zemin).
  - `bgSurface`: `#ffffff` (Saf beyaz pencereler ve kartlar).
  - `textPrimary`: `#0f172a` (Slate-900 yüksek kontrastlı okunaklı tipografi).
  - `statusSuccess`: `#10b981` (Fırsat skoru, aktif pinler, kazanılan satışlar).
- **Tipografi Karakteri:** `geometric-sans` (Modern SaaS, Linear/Apple seviyesi netlik).

## 2. GÖRSEL WİDGET AKIŞI (DETECTED WIDGETS)
1. **`BrowserFrame` & `AppShell`**: Sahnede boş alan kalmasını önleyen profesyonel SaaS tarayıcı ve uygulama kabuğu.
2. **`InteractiveMap`**: İzmir/Alsancak vektörel sahil ve sokak haritası, canlı radar pinleri ve saha satış rotası.
3. **`SlideOverDrawer`**: Haritadaki pine tıklandığında sağdan pürüzsüzce kayan Varuna Gezgin müşteri istihbarat çekmecesi.
4. **`ModalDialog` & `CalendarGrid`**: Takvim görünümü üzerinde beliren "Yeni Randevu / Etkinlik Ekle" diyalogu.
5. **`KanbanBoard`**: ₺120.000 toplam boru hattına sahip Satış Takip Panosu ve aşamalar arası sürüklenen kartlar.
6. **`SimulatedCursor`**: Parallax sapması olmaması için `<SpatialCamera>` içine monte edilen, koordinattan koordinata uçan ve tıklama dalgası yaratan imleç aktörü.

## 3. UZAMSAL KAMERA KOREOGRAFİSİ (SPATIAL CONTINUITY)
- **Beat 1 (f0-f80):** `IsometricTilt` (2.5D derinlikli arayüz girişi) → Haritaya süzülüş.
- **Beat 2 (f81-f160):** `FocusZoom` (Detay çekmecesine ve fırsat skoruna yaklaşma).
- **Beat 3 (f161-f240):** `FocusZoom` & Center (Randevu takvim modalına odaklanma).
- **Beat 4 (f241-f310):** `CanvasPan` (Boru hattı panosunda sütunlar boyu kayış).
- **Beat 5 (f311-f360):** `IsometricTilt` & Settle (Büyüleyici 3D kapanış açısı ve CTA rozeti).
