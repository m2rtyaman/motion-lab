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
  primitives/           # SpotlightStage, CameraRig, KineticText, SpecularCard, EditorialSpecimenStage, TactileProductStage, MobileStingStage, PapercraftCutoutStage
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

### ŞABLON KÜTÜPHANESİ & RESMİ ALTIN REFERANS (GOLD STANDARD)
- **Resmi Altın Referans (The Gold Standard):** `src/projects/single-container-broll/` (Gemini 2.5 / Google DeepMind Tek Yaşayan Kap B-Roll). Tüm UI, B-Roll ve editoryal hareket grafikleri için ana mihenk taşıdır. Detaylı mimari kılavuz ve dersler için bkz: `references/GOLDEN_REFERENCE.md`.
- **Master Storyboard Anayasası:** `references/MASTER_STORYBOARD_RULES.md` (10 Master PDF kılavuzunun sentezinden çıkarılan 5 Evrensel Storyboard Yasası, 3 Katmanlı Derinlik Mimarisi, 1.0–1.5s mikro-beat nabzı ve 3 Girdi Kuralı).
- **Hibrit Çoklu-Arketip Orkestrasyon Rehberi:** `references/HYBRID_ORCHESTRATION_GUIDE.md` (Sahneler arası farklı arketip kullanımı: Bento -> Kinetik Tipografi -> Terminal -> Marka CTA, paylaşımlı atomik primitifler ve TheHeroActor devir teslim köprüsü).
- **Şablonlar:** `src/templates/` altındaki 23 hibrit şablon (`frame-product-promo-30s`, `frame-kinetic-type`, `frame-swiss-grid`, `frame-data-rollup` vb.) deklaratif olarak tüketilir.
- **Stil & Prompt Referansları:** `references/OPUS_5.5_STYLE_GUIDE.md` (26+ görsel stil ailesi), `references/SAAS_WORKFLOW_GUIDE.md` (App-Launch / SaaS 5-adımlı iş akışı, 9-shot sekans, 6-blok master prompt ve 60-saniyelik kalite kapısı), `references/PROMO_20S_WORKFLOW_GUIDE.md` (20-Saniyelik App Promo İş Akışı, 5-aşamalı mesaj hunisi, koyu editör/sıcak çalışma alanı kontrastı, canlı el yazısı ve warp çerçevesi), `references/SCULPTURAL_REEL_GUIDE.md` (Gemini Omni Flash 10-Beat Sculptural Motion Reel sistemi, şampanya altını pahlı halka, çapraz renk geçişi, disk basamaklanması ve 20s handoff kuralı), `references/DECONSTRUCTIVE_TYPOGRAPHY_GUIDE.md` (Fiziksel Kinetik Tipografi Ayrışma & Katmanlı Zamanlama sistemi, 16 mikro-beat sekans, hayalet kontur ofsetleri ve zemin ışıltısı), `references/EDITORIAL_SPECIMEN_GUIDE.md` (Editorial Specimen sistemi, 3 temel sütun, 8 imza geçiş ve 4 kalite kuralı), `references/TACTILE_PRODUCT_EDITORIAL_GUIDE.md` (Calm Tactile 3D Product Editorial sistemi, 12-beat ritim, 5 hareket prensibi), `references/MOBILE_APP_STING_GUIDE.md` (16:9 Playful App Sting & 9:16 Vertical Pastel 3D Editorial sistemi, 6-7 beat grameri, 6 hareket tarifi), `references/PAPERCRAFT_EDITORIAL_GUIDE.md` (Papercraft Cutout Editorial sistemi, 10-beat master sekans, 14 hareket tekniği ve sıfır içerik kopyalama kuralı), `references/prompts/` (7 master prodüksiyon promptu: haber alt bandı, adli büyüteç, linol baskı vb.) ve `references/broll-examples/` dizinleri ihtiyaç duyulduğunda doğrudan başvuru kaynağı olarak kullanılır.

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
`pnpm new <slug> --mode <cinematic-world | editorial-ui | kinetic-poster | hybrid-orchestrated> [--aspect 9:16 | 16:9] [--duration 6]`
Bu komut `src/projects/<slug>/` altında geçerli `direction.md`, `spec.json` ve `Scene.tsx` dosyalarını oluşturur ve kayıt defterini günceller.

#### 2. Yönlendirme & Sözleşme (Motion Director & Choreographer)
- `src/projects/<slug>/direction.md`: Konsept, fizik ve tipografi kararları yazılır. `references/MASTER_STORYBOARD_RULES.md` uyarınca **3 Girdinin Görev Ayrımı** (Script: Ne & Neden, Storyboard: Görünüm & Derinlik, Motion Reference: Hareket Dinamiği) ve **3 Katmanlı Derinlik Mimarisi** (Zemin -> Hayalet Kontur -> Ön Plan) zorunlu olarak dokümante edilir.
- `src/projects/<slug>/spec.json`: Saniye ve kare bazlı Storyboard Zaman Tablosu (1.0–1.5s mikro-beat'ler, kamera hareketleri, ease eğrileri, sfx tetikleyicileri ve finalde en az 1.2s / 72f Stillness Hold) belirlenir.
- Doğrulama: `pnpm audit:spec --project <slug>` ve `pnpm audit:storyboard --project <slug>`

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
- `audit:craft`: Motion Studio v5.0 Görsel İşçilik, saf CSS 3D/SVG determinizmi, yay fiziği ve çapa denetimi.
- `audit:critic`: Opus Animasyon Rehberi Prompt 10 direktör puanlama motoru (Ölü zaman >0.5s, 1.2s minimum metin okunabilirlik kuralı, P0/P1/P2 önceliklendirmesi).
- `adversarial-visual-critic`: (.agent/skills/adversarial-visual-critic) Sıfır toleranslı anti-AI-slop görsel denetim standardı. Boşlukta süzülen kopuk kartlar (floating bento slop), neon glow kusmuğu ve slayt geçişleri render öncesi anında engellenir.
- `render:contact-sheet --project <slug>`: Beat sınırlarından otomatik kareler çekilip `out/<slug>/visual-audit-grid.png` üretilir.
- Görsel model tarafından incelenir ve `src/projects/<slug>/vision-notes.md` içine kare referanslı (`f130`) gözlem yazılır.

---

### OPUS ANİMASYON REHBERİ & ADVERSARIAL VISUAL CRITIC ALTIN İLKELERİ (MANDATORY RULES)
1. **Tek Kap İlkesi (Single Container Principle) & Graphic Anchor:** Sahneler arası geçişte tek bir nesne (kalkan, pencere, buton, panel veya ana vektör) kesilmeden şekil, konum ve boyut değiştirerek bir sonraki sahneye evrilmelidir (**Peak Velocity Container Morphing**). Göz nesneyi takip ettiği sürece izleyici kaybolmaz.
2. **Pencere ve Cihaz Çapalaması (Hardware Shell Anchor - Arayüz / UI Sahneleri İçin ZORUNLU):** Kartlar ve bileşenler uzay boşluğunda süzülemez. Tüm UI elemanları tanımlı bir ana pencere (`PrecisionDashboardShell`, `MacOSSequoiaWindow`, `DeviceMockupStage`, `AppShell` veya `BrowserFrame`) içine kilitlenmelidir. **Not:** Saf kinetik hareket grafiği (Kinetic Vector / Poster) modunda arayüz bento kutuları yasaktır; tam ekran yaşayan vektör tuvali (`KineticVectorStage`) kullanılır.
3. **Subgrid Shared Borders (1px Paylaşımlı Kılcal Izgara):** Kartlar ve teknik paneller birbirinden bağımsız kutular olarak duramaz. Donanım benzeri panellerde ve İsviçre ızgaralarında CSS Grid `gap: 1px` ile zemin ışığının kılcal olarak sızdığı yekpare bir matris (`gap-[1px] bg-white/[0.08]`) kullanılır.
4. **Sıfır-Artıklık (Zero Redundancy) Tipografi Kuralı:** Pazarlama başlığı ürünün sağladığı **faydayı**, arayüz etiketleri ise arka planda çalışan **eylemi** anlatır. Başlık ile rozet arasında aynı metin asla tekrarlanmaz.
5. **Büyük Anlardan Önce Durgunluk (Anticipatory Stillness / 300–600ms):** Her büyük görsel darbe veya sahne geçişinden hemen önce 300–500 ms'lik mikro-durgunluk bırakılarak darbenin etkisi katlanır.
6. **Önce Göster, Sonra Adlandır:** Terim veya etiket ekrana ancak izleyici o hareketi/olayı gördükten sonra gelir.
7. **Metin Okunabilirlik Süresi:** Nihai ana mesaj, logo çözülmesi ve eyleme çağrı (CTA) en az 1.2 saniye (72 kare @ 60 FPS) ekranda tam okunur kalmalıdır. Ritmik beat'e kilitli ara kinetik kelimeler ise sahne akışını dondurmayacak şekilde (8–25 kare) dinamik olarak punch & exit yapabilir.
8. **İşe Göre Easing:** Arayüzde sıkı yay (`snappy spring`), kamerada yumuşak gir-çık (`expo.inOut` / `power3.out`), logoda kontrollü yavaşlama kullanılır. Hepsine tek tip yay verilmez.
9. **Kare Diliyle Revizyon:** Revizyonlar daima kare sayısıyla verilir ("logoyu 12 kare geciktir", "zıplamayı 8 kare kısalt").
10. **Deterministik Tohum (Mulberry32 / Seeded Random):** `Math.random` kesinlikle yasaktır, her şey `t` veya deterministik tohum (`seed: 42`) fonksiyonu olmalıdır.
11. **Slayt Destesi Yasağı (Slide Stack Ban & Kinetic Handoff):** Sahneler birbirinden kopuk `absolute inset-0` div'lerinin opacity ile birbirini değiştirmesiyle (PowerPoint slaytı mantığıyla) kurgulanamaz. Sahne, tek bir yaşayan tuval üzerinde nesnelerin birbirine ivme ve form aktardığı kesintisiz bir **Kinetik Devir Teslim Zinciri** ile akmalıdır.
12. **Hero Nesne Sürekliliği & Sahte Opaklık Geçişi Yasağı (Continuous Hero Actor Law - KESİN VE TAVİZSİZ):** Sahneler arasında beat geçişlerini ayrı grupların `opacity: [1, 0]` ve `opacity: [0, 1]` ile silinip belirmesiyle (crossfade dissolve) simüle etmek KESİNLİKLE YASAKTIR (P0 ihlali). Sahneye liderlik eden bir Ana Geometrik Aktör (`TheHeroActor`) belirlenir. Bu aktör videonun 0. karesinden son karesine kadar **fiziksel olarak sahnede kalır ($opacity > 0$)**. Beat geçişlerinde bu aktör hızla uzayarak, bükülerek, açı değiştirerek veya bölünerek bir sonraki sahnenin ana nesnesi haline gelir (ör: Daire $\rightarrow$ 45° çizgi $\rightarrow$ Bar sütunu $\rightarrow$ Kadran yayı $\rightarrow$ İsviçre haçı).
13. **Uydurma Metin & Süs Sloganı Yasağı (Zero Filler Text / No Fake Jargon):** Sırf boşluk doldurmak için yazılan sahte teknik etiketler (`SİSTEM // 01.A`, `COORD: 47.3769° N`, `METRİK DOĞRULAMA: AKTİF`, `OPUS MOTION STUDIO V5.0`, `01. HAM VERİ GİRİŞİ`) kesinlikle yasaktır. Sahnedeki her metin ve kelime doğrudan kullanıcının brief'inden veya stil rehberinden (`OPUS_5.5_STYLE_GUIDE.md`) beslenmelidir. Dekoratif amaçlı sahte koordinat, sahte lisans veya anlamsız alt etiketler AI-slop sayılır ve reddedilir.
14. **Subagent Tabanlı Süreklilik ve Eleştiri Kapısı:** Kodun ve paftanın doğrulaması yalnızca statik regex linter'lara bırakılamaz. `MorphContinuityCritic` subagent'ı devreye girerek kodda ana nesnenin her karede fiziksel olarak yaşayıp yaşamadığını, sahte opacity hilesi yapılıp yapılmadığını ve metinlerin brief'e sadakatini satır satır denetler.
15. **Master Storyboard Anayasası & 5 Evrensel Yasa:** Storyboard oluşturulurken `references/MASTER_STORYBOARD_RULES.md` içindeki 5 kural (1. Sıfır Kesme/Kinetic Handoff, 2. 1.0–1.5s Mikro-Beat Nabzı & 1.2s Stillness Hold, 3. 3 Katmanlı Derinlik Sistemi, 4. Mekan & Işık Kontrastı, 5. Üç Girdinin Görev Ayrımı) eksiksiz uygulanır. `TheHeroActor` sahneyi 0. kareden son kareye kesintisiz taşır.

#### 5. Otonom Render & Teslimat (Definition of Done)
Terminalde render komutu çalıştırılır:
`pnpm render --project <slug>`
- Render logları izlenir; `out/<slug>/<slug>.mp4` dosyasının başarıyla oluşturulduğu teyit edilir.
- Görev yalnızca fiziksel `.mp4` dosyası diske basıldığında tamamlanmış sayılır.
