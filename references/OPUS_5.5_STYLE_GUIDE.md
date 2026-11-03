# OPUS 5.5 MOTION GRAPHICS REFERANS VE STİL KILAVUZU

Bu rehber, `awesome-claude-opus-5.5-video-main` ve `motion-graphics-main` arşivlerinden damıtılmış profesyonel hareket grafiği standartlarını, 24 stil ailesini, prompt mimarilerini ve sınır kurallarını tek bir başvuru kaynağında toplar.

---

## 1. 8 Ana Stil Ailesi ve 24 Görsel Stil

| Aile | Stil Adı | Temel Mekanizma & Karakteristik | Sınır Kuralı (Boundary) |
|---|---|---|---|
| **Handmade** | `collage` | NOGGIN / Terry Gilliam tarzı 2-4px beyaz makas kenarı, 12 FPS stepped mafsal animasyonu (`shoulder`, `elbow`, `jaw`), ±2px deterministik el titremesi. | Vektörel düz çizgiler yasak; kağıt dokusu ve katman gölgesi zorunlu. |
| | `paper` | Origami, yırtık kağıt, kabartma gölgeler, katlanma geçişleri. | Neon renkler ve metalik parlamalar yasak. |
| | `papercraft-editorial` | Papercraft Cutout Editorial (`PapercraftCutoutStage`): `JaggedPaperTear`, `ObjectScatter`, `MetronomeGauge`, `ScribbleAnchor`, `PastelBubbleOcclusion`, `ChecklistScrubber`, `PaperCard`. Sıcak krem ve pişmiş toprak paleti (`PAPERCRAFT_PALETTE`), 10-beat ritim, 14 hareket tekniği, sarkaç salınımı ve radyal çıkartma patlaması. Bkz: `references/PAPERCRAFT_EDITORIAL_GUIDE.md`. | Sentetik dijital degrade ve PowerPoint kesmeleri yasak; fiziksel yırtık ve yumuşak oklüzyon şart. |
| | `handdrawn` | Karalama, mürekkep çizgisi, cel-boil (hızlı aksiyonda 1:1, dansta 1:2, duruşta 1:3 kare kaynaması). | Kusursuz geometrik eğriler yasak; elle çizilmiş kusur şart. |
| | `painted` | Yağlı boya, suluboya fırça darbeleri, kanvas dokusu. | Keskin UI pencereleri ve dijital degradeler yasak. |
| | `print` | Ahşap oyma, linol baskı, S-eğrisi baskı ton eşlemesi (`printToneCurve`), sabit yön uzayı gökyüzü. | RGB saf doygunluk yasak; gazete/mürekkep ton eşlemesi zorunlu. |
| | `line` | Minimalist tek hat çizimi (Atelier Linea), tohumdan ağaca, binaya kesintisiz dönüşüm. | Birden fazla bağımsız çizgi yasak; tek hat ilkesi. |
| | `mosaic` | Vitray, taş/mozaik fayans kırılması ve birleşmesi. | Pürüzsüz degrade yasak; ayrık parçacıklar zorunlu. |
| **Graphic** | `typography` | Tam ekran kinetik manifesto, zıplayan kelime blokları (`back.out(1.6)`), maskeli geçişler. | Okunaksız mikro fontlar yasak; 72 kare (1.2s) okuma kuralı. |
| | `geometry` | Bauhaus / Swiss grid, 1px paylaşımlı kılcal ızgaralar, primer renk blokları. | Rastgele asimetri yasak; matematiksel grid oranı zorunlu. |
| | `infographic` | Rolling counters (sabit genişlikli hücreler), muhasebe defteri (`LedgerCardStage`), çift kırmızı marjin. | Uydurma DevOps telemetrisi yasak; gerçek sayılar zorunlu. |
| | `specimen` | Editorial Specimen (`EditorialSpecimenStage`): `RegistrationGrid`, `CornerHandles`, `AnnotationCallout`, `MeasurementArc`, `ComponentStrip`, `TypeInterlock`. Sıcak fildişi ve scarlet paleti, adli/müze tipi inceleme. Bkz: `references/EDITORIAL_SPECIMEN_GUIDE.md`. | Boşlukta süzülen unanchored nesneler yasak; koordinat ve kılcal ızgara çapası şart. |
| | `deconstructive-type` | Structural Deconstructive Typography (`DeconstructiveTypographyStage`): `DeconstructiveWordAssembly`, `IlluminatedFloorSurface`, `HorizontalGraphicSlit`. Koyu yeşil-siyah zemin ve nane yeşili (`DECONSTRUCTIVE_MINT_PALETTE`), harflerin dikey/yay/noktalama parçalarına ayrışması, katmanlı zamanlama (`Layered Timing`), ikincil hayalet kontur (`Ghost Outline Offset`). Bkz: `references/DECONSTRUCTIVE_TYPOGRAPHY_GUIDE.md`. | Harfleri mikro partiküllere veya amorf sıvıya eritmek yasak; anlamlı harf anatomisi ve 3 katmanlı derinlik şart. |
| **Spatial** | `product` | Makro yakın çekim, donanım çapalaması (`DeviceMockupStage`), gerçek cihaz kabuğu. | Boşlukta süzülen unanchored bento kartları kesinlikle yasaktır. |
| | `tactile-editorial` | Calm Tactile 3D Product Editorial (`TactileProductStage`): `TactileCapsule`, `CapsuleCluster`, `CurvedBrace`, `PerspectiveDashboardSlab`, `SquareConfettiBurst`, `SpotlightCone`. Sıcak fildişi ve derin orman paleti (`TACTILE_PALETTE`), sığ 3D perspektif (`rotateX: 8deg`, `rotateY: -4deg`), 12-beat ritim, 5 hareket prensibi. Bkz: `references/TACTILE_PRODUCT_EDITORIAL_GUIDE.md`. | Başıboş 3D sürüklenme ve sürekli partikül fırtınası yasak; sığ perspektif ve tekil konfeti patlaması şart. |
| | `sculptural-reel` | Sculptural Motion Reel (`SculpturalReelStage`): `ChampagneBeveledRing`, `DiagonalGradientSweep`, `PerspectiveDiscCascade`, `PaletteGridReset`. Şampanya altını (`#F5D77F`), macenta (`#E01E5A`), derin menekşe (`#4A154B`) ve mercan paleti (`SCULPTURAL_REEL_PALETTE`), 10-beat master harita, 3D disk basamaklanması, 20s handoff kuralı. Bkz: `references/SCULPTURAL_REEL_GUIDE.md`. | Ağır Three.js ve ucuz krom efektleri yasak; saf CSS 3D/SVG pahı ve kılcal speküler parıltı şart. |
| | `blueprint` | CAD / KiCad patlatılmış montaj, 21 tuşlu mekanik klavye, tek koordinat sistemi. | Süsleme amaçlı uydurma vida/kablo çizimi yasak; gerçek BOM şart. |
| | `miniature` | Tilt-shift alan derinliği, maket görünümü, yüksek bakış açısı. | Sonsuz odak derinliği yasak; makro alan derinliği şart. |
| | `nature` | Rüzgarla salınan yapraklar, parçacık fiziği, prosedürel aydınlatma. | Statik arka plan yasak; canlı ambiyans zorunlu. |
| **Digital** | `pixel` | HD-2D piksel sanatı, 8-bit / 16-bit palet kısıtlaması, parşömen haritası. | Vektörel düzleştirme yasak; piksel oranları kilitli olmalı. |
| | `retro` | CRT tarama çizgileri, fosfor parlaması, VHS titreşimi. | Modern temiz düz renkler yasak; analog distorsiyon şart. |
| **Abstract** | `hud` | Falcon Eye-9 durum makinesi, kademeli açılış, hedef kilitlenmesinde `#00E5FF` -> `#FF3D00` evrilmesi. | Rastgele yanıp sönen anlamsız sayılar yasak; durum makinesi zorunlu. |
| | `light` | Işık sızıntısı (light leak), prizmatik kırılma, difüze ambiyans. | Çiğ mor/cyan neon parlaması kesinlikle yasaktır. |
| | `glass` | Speküler kenar kırılması, titanyum/cam çerçeve, açılı spotlight yansıması. | Opak plastik görünüm yasak; optik yansıma açısı şart. |
| **Image** | `cinematic` | Anamorfik en-boy oranı, film greni, kontrollü kamera sarsıntısı. | Hızlı amatör kesmeler yasak; sinematik kamera ivmesi şart. |
| | `archive` | Işıklı masa (backlit lighttable), büyüteç (`LoupeMagnifier`), el yazısı ve telgraf karşılaştırması. | Transkripsiyon uydurma yasak; orijinal belge ekranda kalmalı (min 2.5s). |
| **Interface** | `ui` | Apple & Linear mikro-etkileşimleri, daktilo yazımı, organik imleç yörüngesi (`curvedPath`), FLIP geçişleri. | Statik ekran görüntüsü yasak; etkileşim yaşayan UI olmalı. |
| | `mobile-sting` | Playful Mobile App Sting (`MobileStingStage`): `WavyRibbon`, `CircularApertureWipe`, `TiltedPhoneStage`, `WordBurstSwap`, `VoiceControlCard`. Canlı lavanta ve mor paleti (`MOBILE_STING_PALETTE`), 3/4 açılı telefon perspektifi (`rotateY: -16deg`, `rotateX: 8deg`), beat-senkron kelime patlamaları. Bkz: `references/MOBILE_APP_STING_GUIDE.md`. | Çiğ neon ve unanchored kartlar yasak; donanım kabuğu ve stabil baseline şart. |
| | `saas-launch` | 9-Shot Master SaaS & App-Launch Editorial: 5-aşamalı deterministik boru hattı (`Analyse -> Storyboard -> Prompt -> Generate -> Finish`), 9'lu sekans (`App card -> Store -> Login -> AI composer -> Phone focus -> Micro UI -> Feature matrix -> Brand end -> URL hold`), 6-bloklu master prompt, 60-saniyelik kalite kapısı. Bkz: `references/SAAS_WORKFLOW_GUIDE.md`. | Devasa doğaçlama promptlar yasak; 6 bloklu deterministik prompt ve 72f kapanış şart. |
| | `pastel-editorial` | 9:16 Vertical Pastel 3D Editorial (`MobileStingStage`): `CreatorLogPanel`, `ClapperboardCTA`, `WaveformPulse`. Sıcak kağıt ve arduvaz paleti (`PASTEL_EDITORIAL_PALETTE`), oklüzyon yükselişi (`clipPath: inset()`), menteşeli klaket darbe zıplaması. Bkz: `references/MOBILE_APP_STING_GUIDE.md`. | Layout thrashing yasak; clipPath ve scale yay fiziği zorunlu. |
| | `interactive-promo` | 20-Second Interactive App Promo (`InteractivePromoStage`): `WriteOnScript`, `WarpShapeFrame`, `VerticalPanelReset`. Koyu editör ve sıcak aydınlık çalışma alanı kontrastı (`PROMO_PALETTE`), 5-aşamalı mesaj hunisi (`Hook -> Introduce -> Demonstrate -> Payoff -> CTA`), canlı el yazısı ve dikey panel süpürmesi. Bkz: `references/PROMO_20S_WORKFLOW_GUIDE.md`. | Ekranda birden fazla odak noktası yasak; tek kelime/UI hiyerarşisi ve net CTA şart. |

---

## 2. Prodüksiyon Promptları Koleksiyonu (`references/prompts/`)
1. **`visual-investigation.txt`**: Adli inceleme, büyüteçle delil büyütme, zaman senkronizasyonu (`T+xx.x`), kırmızı hedef halkası (`#FF4A2E`).
2. **`caption-news.txt`**: Sessiz sosyal medya haberi, zıplayan kelime blokları, muhasebe defteri kartı, rolling counter.
3. **`news-package.txt`**: Televizyon ana haber paketi, 3D alt bant (lower-third strap), paralelkenar kategori etiketi, split-flap tabelası.
4. **`kino-montage.txt`**: 1920'ler avangart yapılandırmacılığı, -18° diyagonal kirişler, çift tonlu kırmızı-siyah baskı, fotomontaj kulesi.
5. **`printed-long-take.txt`**: 3D kazıma baskı tek çekim, yön uzayında gökyüzü sabitleme, kamera yolu temizleme yarıçapı ($r=3.5\text{m}$).
6. **`telestrator.txt`**: Spor analiz telestratörü, 4-nokta perspektif homografisi ile saha düzleştirme, hareket dondurma, halka vurgulama.
7. **`memphis-diorama.txt`**: Memphis tarzı renkli diorama, izometrik pastel dünyalar, oyuncak benzeri mekanik hareketler.

---

## 3. Altın Negatif Kurallar (Anti-Slop İlkeleri)
1. **Never Invent Facts:** Gerçekçi olmayan sunucu telemetrileri (örn. "Quantum Enclave", "Signal Ratchet Ratified", "ops/sec") tüketici/mobil tanıtımlarına konulamaz.
2. **Hardware Shell Anchor:** Bileşenler ve kartlar boşlukta süzülemez (`DeviceMockupStage` veya `PrecisionDashboardShell` içine kilitlenmelidir).
3. **Subgrid Shared Borders:** Kutular bağımsız duramaz; `gap-[1px] bg-white/[0.08]` ile 1px kılcal paylaşımlı ızgara oluşturmalıdır.
4. **Zero Redundancy Typography:** Başlık ürün faydasını, etiket ise teknik eylemi anlatır; aynı kelime tekrarlanamaz.
5. **Dinamik Okuma Süresi:** Karşılaştırma ve delil ekranları en az 2.5 saniye ekranda tam hareketsiz tutulur.
6. **AAC Sample-0 Koruması:** Sıfırıncı karedeki ses darbelerine 25 ms'lik lineer mikro-fade uygulanarak ses patlaması önlenir.
