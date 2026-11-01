# OTONOM MULTI-PROJECT MOTION GRAPHIC STÜDYOSU (MANDATORY LIFECYCLE)

Bu repo, profesyonel kalitede 9:16 ve 16:9 (60 FPS) dikey ve yatay video içeriği üreten deterministik, çok projeli (multi-project) bir hareket stüdyosudur.
Her sahne/video, izole bir proje olarak `src/projects/<slug>/` altında barındırılır.

---

### MİMARİ VE DİZİN YAPISI
```
src/
  projects/
    <slug>/
      direction.md      # Konsept & fizik kararları
      spec.json         # Hareket sözleşmesi (beat, kamera, sfx)
      Scene.tsx         # Projeye özel sahne bileşeni
      vision-notes.md   # Görsel denetim gözlem ve onay notları
    registry.generated.ts # scripts/gen-registry.mjs tarafından üretilen dinamik kayıt defteri
  core/                 # Paylaşılan deterministik köprü, token'lar ve altın standart tarifler
  primitives/           # SpotlightStage, CameraRig, KineticText, SpecularCard
  world/                # WorldStage, CharacterActor (2.5D Sprite dünyası)
  vfx/                  # ShockwaveRoar, AtmosphereParticles
  archetypes/           # Editorial cam arketip kartları (MetricTelemetry, vb.)
out/
  <slug>/
    <slug>.mp4          # Nihai render edilen video çıktısı
    visual-audit-grid.png # 2x2 veya 4x4 görsel öz-denetim paftası
    vision/manifest.json# Örneklenen kareler ve kare-farkı (motion) analizi
```

---

### MEVCUT 3 ALTIN STANDART REFERANS PROJESİ
1. `dwarf-arena` (`cinematic-world`): 2.5D cüce savaşçı arenası, meşaleler, sonik şok dalgası, 12 animasyon prensibi.
2. `editorial-telemetry` (`editorial-ui`): Apple/Linear tarzı koyu cam arayüz, canlı metrik sayacı, SVG sparkline ve 3D kamera süzülüşü.
3. `kinetic-poster-demo` (`kinetic-poster`): Tam ekran yüksek kontrastlı tipografik manifesto, maske silme ve darbe sarsıntısı.

---

### YENİ VİDEO ÜRETİM DÖNGÜSÜ (5 ADIM)

#### 1. Proje İskeleti Oluşturma
Terminalde yeni sahne için şu komut çalıştırılır:
`pnpm new <slug> --mode <cinematic-world | editorial-ui | kinetic-poster> [--aspect 9:16 | 16:9] [--duration 6]`
Bu komut `src/projects/<slug>/` altında geçerli `direction.md`, `spec.json` ve `Scene.tsx` dosyalarını oluşturur ve kayıt defterini günceller.

#### 2. Yönlendirme & Sözleşme (Motion Director & Choreographer)
- `src/projects/<slug>/direction.md`: Konsept, fizik ve tipografi kararları yazılır.
- `src/projects/<slug>/spec.json`: Saniye ve kare bazlı Storyboard Zaman Tablosu (beat'ler, kamera hareketleri, ease eğrileri, sfx tetikleyicileri) belirlenir.
- Doğrulama: `pnpm audit:spec --project <slug>`

#### 3. Deterministik Kodlama (Remotion Engineer)
- `src/projects/<slug>/Scene.tsx` güncellenir.
- Animasyon yalnızca `useRemotionGSAP` kancası üzerinden, `tl.seek(frame / fps)` determinizmiyle kurulur.
- GPU Saflığı: Yalnızca `transform`, `opacity` ve `filter` tween edilir. Süre ve ofset değerleri `tokens.ts` ve `recipes.ts` üzerinden alınır; kodda sihirli sayı ve yasak ease (`linear`, `easeInOut`) bulunamaz.

#### 4. Çok Katmanlı Kalite Kapısı (Linter, Critic & Vision Loop)
Terminalde statik denetimler çalıştırılır:
`pnpm check --project <slug>`
- `audit:spec`: Beat sürekliliği, kamera donukluk kontrolü ve kod-spec senkronizasyonu.
- `audit:ast`: Babel AST sözdizimi ağacı ile sihirli süre, layout tween, rastgelelik ve CSS transition taraması.
- `audit:slop`: Neon/mor-cyan glow, mikro-font (min 18px), mod saflığı taraması.
- `audit:critic`: Opus Animasyon Rehberi Prompt 10 direktör puanlama motoru (Ölü zaman >0.5s, 1.2s minimum metin okunabilirlik kuralı, P0/P1/P2 önceliklendirmesi).
- `render:contact-sheet --project <slug>`: Beat sınırlarından otomatik kareler çekilip `out/<slug>/visual-audit-grid.png` üretilir.
- Görsel model tarafından incelenir ve `src/projects/<slug>/vision-notes.md` içine kare referanslı (`f130`) gözlem yazılır.

---

### OPUS ANİMASYON REHBERİ ALTIN İLKELERİ (MANDATORY RULES)
1. **Tek Kap İlkesi (Single Container Principle):** Sahneler arası geçişte tek bir nesne (kart, buton, panel) kesilmeden şekil, konum ve boyut değiştirerek bir sonraki sahneye evrilmelidir. Göz nesneyi takip ettiği sürece izleyici kaybolmaz.
2. **Büyük Anlardan Önce Durgunluk (Anticipatory Stillness / 300–600ms):** Her büyük görsel darbe veya sahne geçişinden hemen önce 300–500 ms'lik mikro-durgunluk bırakılarak darbenin etkisi katlanır.
3. **Önce Göster, Sonra Adlandır:** Terim veya etiket ekrana ancak izleyici o hareketi/olayı gördükten sonra gelir.
4. **Metin Okunabilirlik Süresi:** Her ana metin ve başlık en az 1.2 saniye (72 kare @ 60 FPS) ekranda tam okunur kalmalıdır.
5. **İşe Göre Easing:** Arayüzde sıkı yay (`snappy spring`), kamerada yumuşak gir-çık (`expo.inOut` / `power3.out`), logoda kontrollü yavaşlama kullanılır. Hepsine tek tip yay verilmez.
6. **Kare Diliyle Revizyon:** Revizyonlar daima kare sayısıyla verilir ("logoyu 12 kare geciktir", "zıplamayı 8 kare kısalt").
7. **Deterministik Tohum (Mulberry32 / Seeded Random):** `Math.random` kesinlikle yasaktır, her şey `t` veya deterministik tohum (`seed: 42`) fonksiyonu olmalıdır.

#### 5. Otonom Render & Teslimat (Definition of Done)
Terminalde render komutu çalıştırılır:
`pnpm render --project <slug>`
- Render logları izlenir; `out/<slug>/<slug>.mp4` dosyasının başarıyla oluşturulduğu teyit edilir.
- Görev yalnızca fiziksel `.mp4` dosyası diske basıldığında tamamlanmış sayılır.
