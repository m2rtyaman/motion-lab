# OTONOM MOTION GRAPHIC ÜRETİM PROTOKOLÜ (MANDATORY LIFECYCLE)

Bu repo, profesyonel kalitede 9:16 (1080x1920 @ 60 FPS) dikey MP4 video içeriği üreten deterministik bir stüdyodur. Her kullanıcı isteminde model İSTİSNASIZ aşağıdaki 5 adımlı üretim döngüsünü sırayla çalıştırmak ZORUNDADIR.

---

### ADIM 1: KOREOGRAFİ & TİPOLOJİ (Motion Choreographer)
- Girdi analiz edilir; mevcut `src/archetypes/` (5 editorial şablon), `src/world/` ve `src/vfx/` bileşenlerinden sahne seçilir. (S1–S18 şablon kütüphanesi hedeftir; kapsam Faz 4'te genişletilecektir.)
- Çıktı: 9:16 güvenli alanlarına (Üst: 250px, Alt: 300px) sadık, saniye ve kare (frame) bazlı Storyboard Zaman Tablosu.
- Tipografi hiyerarşisi belirlenir (H1 için `tracking-tighter`, etiketler için `font-mono uppercase`).

### ADIM 2: DETERMINİSTİK KODLAMA (Remotion Engineer)
- `src/components/Scene.tsx` bileşeni güncellenir.
- Animasyon yalnızca `useRemotionGSAP` kancası üzerinden, `tl.seek(frame / fps)` determinizmiyle kurulur.
- GPU Saflığı: Yalnızca `transform` ve `opacity` tween edilir.
- Renkler: Yalnızca nötr zinc paleti ve mat anlamsal renkler (`#ef4444`, `#10b981`). Doku katmanı (Noise/Grain) en üste eklenir.

### ADIM 3: KALİTE DENETİMİ (Anti-Slop Auditor)
- Üretilen kod taranır ve yanıt içine `ANTI-SLOP AUDIT RAPORU` basılır:
  * Neon / Mor-Cyan Glow Taraması: [TEMİZ / TESPİT EDİLDİ]
  * İlkel SVG Maskot Taraması: [TEMİZ / TESPİT EDİLDİ]
  * Bento Grid / Kutu Fazlalığı: [TEMİZ / TESPİT EDİLDİ]
  * GPU Saflığı (Transform/Opacity): [UYGUN / HATALI]
  * 9:16 Güvenli Alan Uyumu: [UYGUN / TAŞMA VAR]
  * KARAR: [ONAYLANDI / REDDEDİLDİ]
- Tek bir ihlal varsa kod derlenmeden Adım 2'ye geri dönülür ve düzeltilir.

### ADIM 4: FİZİKSEL STATİK DENETİM (Linter Execution)
- Terminalde `pnpm audit:slop` komutu çalıştırılır.
- Linter'dan `process.exit(0)` onayı alınmadan sonraki adıma geçilemez.

### ADIM 5: OTONOM RENDER & TESLİMAT (Definition of Done)
- Terminalde otomatik olarak şu komut çalıştırılır:
  `pnpm render`
- Render logları izlenir; `out/repo-news-9x16.mp4` dosyasının başarıyla oluşturulduğu teyit edilir.
- "Kodu yazdım, tarayıcıdan kontrol et" demek KESİNLİKLE YASAKTIR. Görev yalnızca fiziksel `.mp4` dosyası diske basıldığında tamamlanmış sayılır.
