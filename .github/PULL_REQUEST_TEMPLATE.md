## ⚡ Pull Request Özeti

<!-- Ne değişti? Hangi sahne, primitif veya optimizasyon eklendi? -->
### 1. Değişiklik Türü
- [ ] 🎬 Yeni Sahne / Proje (`src/projects/<slug>`)
- [ ] 🧱 Yeni Primitif / Arketip (`src/primitives` veya `src/archetypes`)
- [ ] ⚙️ Çekirdek Motor / Script İyileştirmesi (`src/core` veya `scripts/`)
- [ ] 🎨 Görsel İyileştirme & Cilalama (Opus Prompt 10)
- [ ] 🐛 Hata Düzeltme & Teşhis (Doctor / Gate)

---

### 2. İlgili Proje ve Paradigma
- **Proje:** `<slug>`
- **Paradigma:** `[ ] editorial-ui` | `[ ] cinematic-world` | `[ ] kinetic-poster`
- **Format:** `[ ] 16:9 Yatay` | `[ ] 9:16 Dikey` (60 FPS kilitli)

---

### 3. Opus Animasyon Rehberi Kalite Kapısı (Zorunlu Kontrol Listesi)

Lütfen PR göndermeden önce aşağıdaki tüm kontrolleri çalıştırıp onaylayın:

- [ ] **Sıfır Doğrudan Push:** Değişiklikler asla `main` dalına doğrudan pushlanmadı; izole bir `feat/*` veya `scene/*` dalından geliyor.
- [ ] **Statik Denetimler:** `pnpm check` komutu sıfır ihlal ve sıfır TypeScript hatası ile geçti.
- [ ] **Stüdyo Hekimi:** `pnpm doctor` çalıştırıldı, 14 kronik sorunun hiçbiri tespit edilmedi.
- [ ] **7/7 Kalite Kapısı:** `pnpm gate --project <slug>` komutu 7/7 tam onay aldı.
- [ ] **GPU Saflığı:** Yalnızca `transform`, `opacity` ve `filter` tween edildi (geometri tweening yok).
- [ ] **Metin Okunabilirliği:** Her ana başlık ve metin en az 1.2 saniye ($72\text{ kare @ 60 FPS}$) sabit ve okunur kalıyor.
- [ ] **Yayın Ölçeği:** Hiçbir yerde 18px altı mikro-font (12-14px) kullanılmadı.
- [ ] **Deterministik Tohum:** `Math.random()` kesinlikle kullanılmadı; tüm rastgelelik `mulberry32(seed)` ile kilitli.
- [ ] **Kontak Sayfası:** `out/<slug>/visual-audit-grid.png` üretildi ve görsel olarak denetlendi.

---

### 4. Ekran Görüntüleri / Kontak Sayfası

<!-- visual-audit-grid.png veya preview görselini buraya ekleyin -->

---

### 5. Nasıl Test Edilir?
```bash
pnpm gate --project <slug>
pnpm render:<slug>
```
