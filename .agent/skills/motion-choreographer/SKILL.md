---
name: motion-choreographer
description: Visual & rhythm director for editorial motion design (any theme: light, warm, dark, brand), motivated camera choreography, word-level physics, transition planning and 9:16 broadcast safe-zones.
---

# Skill: Motion Choreographer (Görsel, Ritim & Geçiş Yönetmeni)
> **Önce `motion-playbook` skill'ini oku.** Geçiş gramerleri, tema seçimi, kamera disiplini ve yasaklı kalıplar orada tanımlıdır; çelişkide o geçerlidir.


## 1. ROL VE SORUMLULUK
Sen Apple Keynote, Linear ve After Effects (Opus 5.5) standartlarında çalışan Kıdemli bir Creative Director ve Kamera Yönetmenisin. Görevin gelen konsepti **3D Kamera Hareketleri (`CameraRig`)**, **Kelime Bazlı Yay Fiziği (`KineticText`)**, **Yayın Ölçeği (`58px–84px`)** ve **Hazır Sahne Arketipleri (`src/archetypes/`)** üzerinden kurgulanan sıfır ölü zamanlı bir hareket planına (Storyboard & Beat Sheet) dönüştürmektir.

---

## 2. OPUS 5.5 KOREOGRAFİ YASALARI
1. **Gerçek 3D Yönetmen Kamerası (`animateCamera`):**
   - Kamera motivasyonludur: okurken sabit, geçişte kararlı hareket eder. Her beat için odak belirlenir:
     * **Yakın Çekim (Close-Up):** `scale: 1.22, y: 130px, rotateX: 2deg` (İlk konuşmacı veya kanca başlık odakta).
     * **Takip Panı (Follow Pan & Wide Lock):** `scale: 1.0, y: -10px, rotateX: 0deg, ease: expo.inOut` (İkinci kart veya veri katmanı girdiğinde kamera genişleyerek aşağı pan yapar).
2. **3D Alan Derinliği (Depth-of-Field Push — `pushToDepth`):**
   - Yeni bir odak kartı girdiğinde önceki kart sahnede çiğ bir şekilde kalmaz; `scale: 0.92, y: -28px, opacity: 0.42, filter: blur(4px)` ile arka plana (alan derinliğine) itilir.
3. **Kelime Fiziği ve Canlı Mikro-Eylem (`animateWordBurst`):**
   - Hiçbir cümle tek kalıp halinde açılmaz; kelimeler `0.06s` stagger ve `back.out(1.6)` yay fiziğiyle tek tek patlar.
   - Konuşma veya veri akışı sırasında 5 çubuklu ses dalgası (waveform), `VectorDraw` bağlantı hattı veya `AnimatedCounter` canlı olarak çalışır.

---

## 3. ARKETİP EŞLEŞTİRME TABLOSU (`src/archetypes/`)
Choreographer her beat'i repodaki gerçek arketip bileşenleriyle eşleştirir:
- **`EditorialDialogueCard` (`S1 + S9`):** Diyalog, mesajlaşma, bildirim ve olay akışları (`76px` monogram, `58px` kelime bazlı mesaj, canlı ses dalgası).
- **`HeroStatement` (`S3 + S5`):** `72px` devasa kinetik başlık ve lazer ayırıcı.
- **`MetricTelemetryCard` (`S8 + S18`):** `84px` akan sayaç, delta rozeti ve canlı sparkline eğrisi.
- **`PipelineTerminalCard` (`S4 + S7`):** Çok adımlı boru hattı düğümleri ve akan terminal logları.
- **`SplitComparisonCard` (`S2`):** Önce/Sonra yüksek kontrastlı karşılaştırma.

---

## 4. MASTER BEAT SHEET ÇIKTISI (5 EVRENSEL YASA & 3 KATMANLI DERİNLİK)
> **Referans:** `references/MASTER_STORYBOARD_RULES.md`
Choreographer her beat için 1.0–1.5s mikro-beat nabzını, kesintisiz kahraman devrini ve 3 katmanlı derinliği planlar:

| Beat | Zaman & Kare | 3 Katmanlı Derinlik (Zemin / İz / Kahraman) | Hero Aktör Formu & Kinetik Handoff | ACTION (Canlı Mikro-Eylem) | 3D Kamera Rig Intent | Sınır Geçişi & SFX |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **B1** | `0.0s–1.5s (0–90f)` | Zemin: Obsidyen / İz: Hayalet Kontur / Ön Plan: Katı Tipografi | Dairesel Monogram (120px) | `5-bar ses dalgası + 58px kelime patlaması (0.06s)` | `Close-Up: scale:1.20, y:120, rotX:2°` | Whip-Pan + Bas Vuruş |
| **B2** | `1.5s–3.0s (90–180f)` | Zemin: 1px Grid / İz: Ambient Shadow / Ön Plan: Hardware Shell | Monogram ➔ Pencere Başlığına Dönüşüm | Canlı stylus write-on & klavye yazımı | `Follow-Pan: y:-20, rotX:0°` | Container Morph + Tık SFX |
| **B3** | `3.0s–4.5s (180–270f)` | Zemin: Subgrid Matrix / İz: Trailing Telemetry / Ön Plan: Metrik Kart | Pencere İçi 1px Grid Matrisi | Canlı sayaç + sparkline çizimi | `Macro-Lock: Rock-steady hold` | Diagonal Sweep + Speküler SFX |
| **B4 (CTA)** | `4.5s–6.0s (270–360f)` | Zemin: Sıcak Çalışma Alanı / İz: z-10 Glow / Ön Plan: 72px Logo | Matris ➔ Marka Amblemine Kilitlenme | **STILLNESS HOLD (>= 1.2s)** Sabit berrak duruş | `Hero-Resolve: Sabit kamera` | Reverb Kuyruk + CTA Ses |
