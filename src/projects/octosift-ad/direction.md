# OCTOSIFT — B2B MÜŞTERİ BULMA & CRM YAZILIMI (V5.5 MASTER STORYBOARD)

## 1. MARKA KİMLİĞİ VE TEMA KARARLARI
- **Ürün:** Octosift (B2B Müşteri Bulma, Satış İstihbaratı & Saha CRM Platformu).
- **Surface Mode:** `light` (`LIGHT_SAAS_THEME`).
- **Renk Paleti:**
  - `accentPrimary`: `#2563EB` (Kraliyet Mavisi / Royal Blue) — Güvenilir, kurumsal, modern B2B SaaS.
  - `bgPrimary`: `#f8fafc` (Slate-50 nötr açık zemin).
  - `bgSurface`: `#ffffff` (Saf beyaz pencereler ve kartlar).
  - `textPrimary`: `#0f172a` (Slate-900 yüksek kontrastlı okunaklı tipografi).
  - `statusSuccess`: `#10b981` (Fırsat skoru, aktif pinler, randevu onayı).
- **Tipografi Karakteri:** `geometric-sans` (Modern SaaS, Linear/Apple seviyesi netlik).

## 2. GÖRSEL GİRDİ EŞLEŞMESİ (VISUAL INPUT PARITY)
Ekran görüntülerindeki 5 ana ekranın tamamı hikayeye dahil edilmiştir:
1. **Screenshot 1:** `<MetricCardRow>` (250 Kredi, ₺120k Boru Hattı) + `<DataTable>` (İzmir 30 Firma, Fırsat Skorları).
2. **Screenshot 2:** `<SlideOverDrawer>` (Varuna Gezgin, Amber Web/Reklam Analiz Kutusu, Fırsat Skoru 65/100).
3. **Screenshot 3 & 4:** `<CalendarGrid>` + `<ModalDialog>` (28.10.2026 saat 09:00 toplantı oluşturma penceresi).
4. **Screenshot 5:** `<InteractiveMap>` (İzmir Alsancak sahil şeridi, radar pinleri ve Plasiyer Saha Rotası).
5. **Hero Kapanış:** `<VirtualCanvas>` üzerinde süzülen 3D arayüz + Merkezde büyük Octosift Marka Kartı & CTA.

## 3. UZAMSAL KAMERA & RİTİM KANUNLARI
- **Sanal Tuval (Virtual Canvas):** Masaüstü arayüz `1440x900` sanal tuvalde render edilir; `<SpatialCamera>` aksiyonun olduğu koordinata (`targetX, targetY, scale`) odaklanır. Sütun ezilmesi veya sağdan taşma (clipping) sıfırdır.
- **Sürekli Nefes (Zero-Dead-Frame Law):** Her karede `ambientDrift(frame)` çalışır; sub-beat frame diff değerleri asla 1.2 altına düşmez.
- **Ritim Varyansı:** Staccato beat'ler (50f, 56f) ve Focus hold beat'ler (95f, 95f) ile $\sigma \approx 19.2 > 18$ anti-monotonluk standardı sağlanır.
