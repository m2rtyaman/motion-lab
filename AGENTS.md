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

### ŞABLON KÜTÜPHANESİ & REFERANS ARŞİVİ
Repoda tekil ve zorunlu bir "altın referans proje" bulunmaz. Her proje kendi ürün doğasına (B2C mobil, B2B SaaS, kinetik tipografi, sinematik dünya) ve kullanıcı brief'ine göre bağımsız kurgulanır.
- **Şablonlar:** `src/templates/` altındaki 23 hibrit şablon (`frame-product-promo-30s`, `frame-kinetic-type`, `frame-swiss-grid`, `frame-data-rollup` vb.) deklaratif olarak tüketilir.
- **Stil & Prompt Referansları:** `references/OPUS_5.5_STYLE_GUIDE.md` (24 görsel stil ailesi), `references/prompts/` (7 master prodüksiyon promptu: haber alt bandı, adli büyüteç, linol baskı vb.) ve `references/broll-examples/` dizinleri ihtiyaç duyulduğunda doğrudan başvuru kaynağı olarak kullanılır.

---

### ZORUNLU BECERİ MATRİSİ (MANDATORY SKILLS SUITE - SIFIR KOLAY YOL KURALI)
Yapay zeka hiçbir aşamada kolay yola sapamaz, ezbere/uydurma kod üretemez ve aşağıdaki 20 stüdyo becerisini bypass edemez:
1. `anti-slop-deep-thinker` (.agent/skills/anti-slop-deep-thinker): Faz 0 Canlı Web & Vektör İstihbaratı. .tsx yazılmadan önce `choreography-blueprint.md` içinde 4 web araması ve uzamsal koordinat matematiği zorunludur.
2. `adversarial-visual-critic` (.agent/skills/adversarial-visual-critic): Acımasız anti-slop görsel eleştirmen. Yüzen bento kartlarını, neon kusmuğunu ve sahte slayt geçişlerini render öncesi anında engeller.
3. `motion-playbook` (.agent/skills/motion-playbook): Hareket grafiği tek doğruluk kaynağı, ritim, beat ve geçiş sözlüğü.
4. `studio-router` (.agent/skills/studio-router): Paradigma yönlendiricisi (`cinematic-world`, `editorial-ui`, `kinetic-poster`).
5. `motion-director` (.agent/skills/motion-director): Çok projeli orkestrasyon ve anlatı mimarisi.
6. `motion-choreographer` (.agent/skills/motion-choreographer): Editoryal ritim, kamera koreografisi ve 9:16 safe-zone disiplini.
7. `ui-choreography-director` (.agent/skills/ui-choreography-director): Apple ve Linear tarzı mikro-etkileşimler, FLIP konteyner geçişleri ve pürüzsüz kavisli imleç hareketleri.
8. `motion-octosift-saas` (.agent/skills/motion-octosift-saas): B2B SaaS ve kurumsal ürün motion standartları.
9. `kinetic-type-director` (.agent/skills/kinetic-type-director): Tam ekran kinetik tipografi, maskeli geçişler ve ritmik kelime patlamaları.
10. `character-2d-animator` (.agent/skills/character-2d-animator): CharacterActor 12 animasyon prensibi (Squash & Stretch, Step Arc, vb.).
11. `cinematic-vfx-director` (.agent/skills/cinematic-vfx-director): Sonik şok dalgaları, radyal darbeler ve prosedürel ışık efektleri.
12. `audio-motion-conductor` (.agent/skills/audio-motion-conductor): Müzik haritası, vuruş senkronu ve prosedürel ses tasarımı.
13. `remotion-engineer` (.agent/skills/remotion-engineer): Remotion & GSAP 60 FPS deterministik render mühendisliği.
14. `anti-slop-auditor` (.agent/skills/anti-slop-auditor): Çok paradigmalı kalite kapısı ve yayın denetimi.
15. `explainer-engaging` (.agent/skills/explainer-engaging): Tek Kap (One-Take Story) kesintisiz tek çekim ve Hero Element istasyon akışı.
16. `explainer-default` (.agent/skills/explainer-default): Ölçülü temiz ürün demosu, gerçek UI yakın çekimi ve "Asla veri uydurma (Never invent facts)" kuralı.
17. `explainer-high-energy` (.agent/skills/explainer-high-energy): Hype teaser, vuruş senkronlu kinetik tipografi, şekil taşıyıcı geçişler ve HUD vizör tasarımı.
18. `sound-effects` (.agent/skills/sound-effects): Ölçülü profesyonel CC0 ses tasarımı, -16 LUFS normalizasyonu ve vuruşa kilitli SFX yerleşimi.
19. `motion-broll` (.agent/skills/motion-broll): Kelimeye senkronize B-roll ve dinamik şablon motoru.
20. `object-separation` (.agent/skills/object-separation): Video nesnesi, insan ve ürün ayrıştırma motoru.

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
- `audit:slop`: Neon/mor-cyan glow, mikro-font (min 18px), mod saflığı, Hardware Shell çapa ve anlamsal artık-değer taraması.
- `audit:craft`: Motion Studio v5.0 Görsel İşçilik, Three.js determinizmi, yay fiziği ve çapa denetimi.
- `audit:critic`: Opus Animasyon Rehberi Prompt 10 direktör puanlama motoru (Ölü zaman >0.5s, 1.2s minimum metin okunabilirlik kuralı, P0/P1/P2 önceliklendirmesi).
- `adversarial-visual-critic`: (.agent/skills/adversarial-visual-critic) Sıfır toleranslı anti-AI-slop görsel denetim standardı. Boşlukta süzülen kopuk kartlar (floating bento slop), neon glow kusmuğu ve slayt geçişleri render öncesi anında engellenir.
- `render:contact-sheet --project <slug>`: Beat sınırlarından otomatik kareler çekilip `out/<slug>/visual-audit-grid.png` üretilir.
- Görsel model tarafından incelenir ve `src/projects/<slug>/vision-notes.md` içine kare referanslı (`f130`) gözlem yazılır.

---

### OPUS ANİMASYON REHBERİ & ADVERSARIAL VISUAL CRITIC ALTIN İLKELERİ (MANDATORY RULES)
1. **Tek Kap İlkesi (Single Container Principle) & Graphic Anchor:** Sahneler arası geçişte tek bir nesne (kalkan, pencere, buton, panel) kesilmeden şekil, konum ve boyut değiştirerek bir sonraki sahneye evrilmelidir (**Peak Velocity Container Morphing**). Göz nesneyi takip ettiği sürece izleyici kaybolmaz.
2. **Pencere ve Cihaz Çapalaması (Hardware Shell Anchor - ZORUNLU):** Kartlar ve bileşenler uzay boşluğunda süzülemez. Tüm UI elemanları tanımlı bir ana pencere (`PrecisionDashboardShell`, `MacOSSequoiaWindow`, `DeviceMockupStage`, `AppShell` veya `BrowserFrame`) içine kilitlenmelidir.
3. **Subgrid Shared Borders (1px Paylaşımlı Kılcal Izgara):** Kartlar birbirinden bağımsız kutular olarak duramaz. Donanım benzeri panellerde CSS Grid `gap: 1px` ile zemin ışığının kılcal olarak sızdığı yekpare bir matris (`gap-[1px] bg-white/[0.08]`) kullanılır.
4. **Sıfır-Artıklık (Zero Redundancy) Tipografi Kuralı:** Pazarlama başlığı ürünün sağladığı **faydayı**, arayüz etiketleri ise arka planda çalışan **eylemi** anlatır. Başlık ile rozet arasında aynı metin asla tekrarlanmaz.
5. **Büyük Anlardan Önce Durgunluk (Anticipatory Stillness / 300–600ms):** Her büyük görsel darbe veya sahne geçişinden hemen önce 300–500 ms'lik mikro-durgunluk bırakılarak darbenin etkisi katlanır.
6. **Önce Göster, Sonra Adlandır:** Terim veya etiket ekrana ancak izleyici o hareketi/olayı gördükten sonra gelir.
7. **Metin Okunabilirlik Süresi:** Her ana metin ve başlık en az 1.2 saniye (72 kare @ 60 FPS) ekranda tam okunur kalmalıdır.
8. **İşe Göre Easing:** Arayüzde sıkı yay (`snappy spring`), kamerada yumuşak gir-çık (`expo.inOut` / `power3.out`), logoda kontrollü yavaşlama kullanılır. Hepsine tek tip yay verilmez.
9. **Kare Diliyle Revizyon:** Revizyonlar daima kare sayısıyla verilir ("logoyu 12 kare geciktir", "zıplamayı 8 kare kısalt").
10. **Deterministik Tohum (Mulberry32 / Seeded Random):** `Math.random` kesinlikle yasaktır, her şey `t` veya deterministik tohum (`seed: 42`) fonksiyonu olmalıdır.

#### 5. Otonom Render & Teslimat (Definition of Done)
Terminalde render komutu çalıştırılır:
`pnpm render --project <slug>`
- Render logları izlenir; `out/<slug>/<slug>.mp4` dosyasının başarıyla oluşturulduğu teyit edilir.
- Görev yalnızca fiziksel `.mp4` dosyası diske basıldığında tamamlanmış sayılır.
