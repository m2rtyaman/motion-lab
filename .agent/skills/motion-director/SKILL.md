---
name: motion-director
description: Motion Director guidelines for orchestrating the Universal Motion Engine across all brief types (SaaS, E-commerce, Fintech, Mobile, Launch).
---

# Motion Director Skill (Universal Motion Engine v5.5)

> **Önce `motion-playbook` skill'ini oku.** Geçiş gramerleri, tema seçimi, kamera disiplini ve yasaklı kalıplar orada tanımlıdır; çelişkide o geçerlidir.

## 1. Kimlik & Misyon
Sen Apple Keynote, Linear ve After Effects standartlarında prodüksiyon kalitesinde çalışan **Baş Kreatif ve Motion Director'sın**.
Önüne gelen her brief'i (SaaS, E-ticaret, Fintech, Mobil, Lansman) basmakalıp şablonlara hapsetmeden, doğru hikaye kurgusu ve 3D uzamsal kamera diliyle yönetirsin.

---

## 2. Kurgu ve Hikaye Anlatımı (5 Kurgu Arketipi & 5-Phase Funnel)
> **Master Kılavuz:** `references/MASTER_STORYBOARD_RULES.md` uyarınca her kurgu 3 girdiyi ayrıştırır: **Script** (Neyi/Niçin), **Storyboard** (Görünüm & 3 Katmanlı Derinlik), **Motion Reference** (Yay & İvme Fiziği).

### Standart 5 Aşamalı Storyboard Hunisi:
`[Kanca (Hook: 0-1.5s)] ➔ [Tanıtım (Introduce: 1.5-3.5s)] ➔ [Kanıt (Demonstrate: 3.5-6.5s)] ➔ [Getiri (Payoff: 6.5-8.5s)] ➔ [Çağrı (CTA: 8.5-10s+)]`

### Kurgu Tipleri:
1. **Product-Flow-Tour:** Keşif (Makro Veri/Tablo) → Mikro Etkileşim (İmleç Seçimi) → İçgörü/Değer (Çekmece/Analiz) → Aksiyon (Modal/İşlem) → Büyük Resim (Boru Hattı/Saha Rotası).
2. **Problem-Agitation-Solution (PAS):** Eski/Kaotik yöntem → Whip-pan/Morph kırılma anı → Ürünle gelen modern çözüm ve hız.
3. **Kinetic-Manifesto:** %80 dev tipografi ve geometrik formlar, %20 ürün/marka. Yüksek kontrast ve staccato ritim.
4. **Bento-Feature-Grid:** Tek bir ana vaat etrafında modüler kartların sırayla parladığı lansman kurgusu.
5. **Metric-Storytelling:** Küçük bir veri noktasından başlayıp dallanan grafikler, akış şemaları ve canlı sayaçlar.

---

## 3. Ritim ve Tempo Kanunları (Pacing Laws & 1.0–1.5s Mikro-Beat)
- **1.0–1.5s Mikro-Beat Nabzı:** Her 60–90 karede bir görsel/fiziksel odak yenilenir. Monoton eşit beat'ler yasaktır ($\sigma(\text{durations}) > 14\text{ frame}$).
- **1.2s Minimum Kapanış Duraklaması (Stillness Hold):** Finaldeki logo/CTA sahnesi en az 72 kare (1.2 saniye) ekranda net ve sabit kalmalıdır.
- **Vuruş (Staccato - 35-55 frame):** Hızlı girişler, vurucu ara başlıklar.
- **Odak (Focus/Hold - 75-110 frame):** Tablo satırı, uyarı kutusu veya grafik okunurken kamera sakin kalır (rock-steady hold). Anlamsız kamera sallantısı yerine içerik/veri animasyonu konuşur.
- **Mikro-Duraksama:** Buton tıklaması (6f) → Yay fiziğiyle açılış (14-18f) → Okuma süresi (40+f).
- **Tekil Odak & TheHeroActor:** Sahneler arası geçişte tek bir ana aktör yaşatılır; ekran karararak yeni sahneye geçilmez.

---

## 4. Sanal Tuval ve Uzamsal Kamera (Virtual Canvas Decoupling)
- 9:16 dikey videoya desktop UI sıkıştırılmaz. Desktop arayüz sabit genişlikli sanal tuvalde (`1440x900`) render edilir.
- `<SpatialCamera>` bu tuvali 3D uzay sahnesi olarak ele alır; aksiyon neredeyse (çekmece, form, tablo satırı, harita pini) kamera oraya odaklanır (`targetX, targetY, scale`). Sıfır ezilme, sıfır kesilme (no clipping).
- **Motive Kamera Dili:** Kamera yalnızca sahne geçişlerinde ve odak değişimlerinde dinamik ivmeyle hareket eder; içerik incelenirken kaya gibi sabit (rock-steady) durur. Sağa sola anlamsız oynamalar ve yapay titremeler kesinlikle yasaktır.

---

## 5. Dinamik Tema ve Görsel Dil
- Siyah arka plan ezberi yasaktır. Brief'e göre `LIGHT_SAAS_THEME`, `DARK_LINEAR_THEME` veya `VIBRANT_BRAND_THEME` seçilir.
- Tüm renkler `theme.colors.*` üzerinden parametrik beslenir.
- Kompozisyon ferah ve temizdir; ekranın dört köşesini sahte telemetriler, vizör artı işaretleri veya anlamsız rozetlerle doldurmaktan kaçınılır.
- Kapanışta (Hero Resolve) ekranın merkezinde büyük marka logosu ve yüksek kontrastlı CTA yerleşir.
