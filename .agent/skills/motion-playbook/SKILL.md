---
name: motion-playbook
description: Single source of truth for producing professional motion graphics in this repo. Read FIRST for any video task. Defines transition grammar, theme selection, beat structure, camera discipline, forbidden patterns, reference projects and the quality gate. Other skills defer to this one.
---

# Master Motion Playbook (Tek Doğruluk Kaynağı & Nihai Hareket Kılavuzu v7)

Bu repo bir "slayt gösterisi" veya statik arayüz kaydedicisi değildir; **kesintisiz akan, sinematik ve editoryal hareket grafiği** stüdyosudur. Bir video, sırayla beliren kutuların listesi değil; izleyicinin gözbebeğini sahne boyunca bilinçli ve akıcı bir koreografiyle gezdiren bir algı yolculuğudur.

Çelişki halinde bu dosya repository içindeki tüm diğer skill'lerin, dokümanların ve varsayımların önüne geçer.

---

## 1. Üç Soruluk Kapı (Kod Yazmadan Önce Zorunlu Doğrulama)
1. **Gözüm şimdi tam olarak nereye odaklanıyor?**
   - Ekranda aynı anda iki ana hareket yarışamaz. Odak, beat sınırında *hareket ivmesi ve yönsel transferle* yeni nesneye devredilir; ani kesmeyle (hard cut) bırakılmaz.
2. **Bu sınırı hangi geçiş taşıyor ve neden?**
   - Geçiş şablon olsun diye konulmaz, içeriğin dramatik anlamından doğar:
     - Hız, fırlama, "sonraki aşama" → `transitionWhipPan`
     - Katman açığa çıkışı, perde aralama → `transitionMaskWipe`
     - Makro bakıştan mikro detaya dalış / portal sıçraması → `transitionZoomPunch`
     - Nesnenin evrilmesi, aynı varlığın genişlemesi → `transitionContainerMorph` / `flipContainerTransition`
3. **Bu video neden koyu veya neden açık?**
   - Varsayılan "koyu cam" (dark glass) tembelliği yasaktır. Tema ürünün doğasına göre bilinçli seçilir (B2B SaaS / Fintech için `light`, editoryal manifesto için `editorial-warm`, siber/derin çekirdek için `dark`) ve beat'ler arasında tam ekran renk bloklaması (`beatPalettes`) uygulanır.

---

## 1.5. PHASE 0: Canlı Web, Vektör ve Stüdyo Vaka Araştırması (Zorunlu Araştırma Kapısı)
Ezberden marka logosu, ürün arayüzü veya sahne geçişi uydurmak kesinlikle yasaktır. Her yeni video projesinde kod yazmadan önce `search_web` aracıyla şu **4 somut kaynak** taranır ve `choreography-blueprint.md` (Phase 0) içine kaydedilir:

1. **Resmi Marka & Gerçek SVG `<path>` Koordinatları:**
   - `simpleicons.org`, `github.com/simple-icons`, `commons.wikimedia.org` (ham `.svg` XML), `lucide.dev`, `tabler.io` ve resmi marka kılavuzlarından tam hex kodları ve gerçek `<path d="...">` vektör dizeleri alınır.
2. **Gerçek Ürün Arayüzü Anatomisi (UI Tear-Down):**
   - Resmi ürün blogları (`blog.whatsapp.com`, `linear.app/changelog`), `mobbin.com`, `pageflows.com` üzerinden gerçek ekran bileşenleri (örn. konuşma balonu kuyruk vektörü `tail-in`/`tail-out`, şifreleme başlığı, katılımcı rozetleri) çıkarılır.
3. **Elit Stüdyo Vaka Analizleri (Creative Breakdowns):**
   - *Ordinary Folk*, *Buck.co*, *ManvsMachine*, *Ravie.co*, *Giant Ant*, *Motionographer*, *Wine After Coffee*, *Behance Motion Curated* yazılı vaka analizlerinden sahne geçiş metaforları (**Match-Cut**, **3D Exploded Layer**, **Macro-to-Wide Camera Pull**) öğrenilir.
4. **Teknik SVG Filtreleri ve 3D Derinlik Desenleri:**
   - *Codrops (`tympanus.net`)*, *GSAP Showcase*, *Frontend Horse* üzerinden `<feGaussianBlur>` + `<feColorMatrix>` sıvı (gooey) birleşme filtreleri, çok duraklı gradyanlar (`<linearGradient>`, `<radialGradient>`) ve 3D `preserve-3d` katman ayrıştırma teknikleri alınır.

---

## 2. Arayüz ve Dijital Harekete Uyarlanmış Disney 12 Animasyon Prensibi

Geleneksel Disney animasyon prensipleri modern Apple/Linear tarzı arayüz ve hareket tasarımının temel taşıdır:

### 1. Squash & Stretch (Hacim Korunumu & Esneme-Basılma)
- Arayüz kartları veya butonlar darbe aldığında veya fırladığında katı plastik gibi davranmaz. Hacim daima korunur ($scaleX \times scaleY \approx 1.0$).
- Buton basıldığında: `scaleY: 0.90, scaleX: 1.08`.
- Yukarı zıpladığında: `scaleY: 1.08, scaleX: 0.94`.

### 2. Anticipation (Ön-Hazırlık & Öngörülü Durgunluk — 300–500ms)
- Büyük bir patlama, whip-pan veya modal açılışından önce sahne 300–500 ms (18–30 kare @ 60 FPS) hafifçe geriye çekilir (wind-up) veya nefes alırcasına durulur.
- İmleç tıklamadan hemen önce `scale: 0.88` sıkışır; pencere fırlamadan önce `scale: 0.97, y: +6px` yaylanır.

### 3. Staging (Sahneleme & Tek Odak Hiyerarşisi)
- İzleyicinin gözü bir anda yalnızca tek bir birincil hareketi takip edebilir.
- Gözü sahnenin sol üstünden sağ ortasına yönlendirmek için sol üstteki kart küçülüp yok olurken oluşturduğu hareket çizgisi sağdaki kartın girişini tetikler.

### 4. Straight Ahead Action & Pose to Pose
- Ana hikaye ve beat geçişleri `spec.json` içinde kare kare planlanır (Pose to Pose).
- İkincil fiziksel etkiler (toz, kıvılcım, parçacık, yay dalgalanması) Mulberry32 ve analitik yay denklemleriyle dinamik üretilir (Straight Ahead).

### 5. Follow Through & Overlapping Action (Ardıl Hareket & Parça Gecikmesi)
- Bir kart durduğunda içindeki başlık, grafik ve buton aynı anda tahta gibi durmaz.
- Kapsayıcı durduktan sonra içindeki grafik 3 kare sonra, buton ise 6 kare sonra yerine oturur (`staggerInterval: TIMING.itemStagger`).

### 6. Slow In & Slow Out (Doğal İvmelenme & Sönümlenme)
- Hiçbir fiziksel nesne `linear` hızla hareket edemez.
- Arayüz hareketlerinde `expoOut` (`expo.out`), `powerOut` (`power3.out`) veya `backOut` (`back.out(1.6)`) kullanılır.

### 7. Arcs (Doğal Yaylar & Bézier Yörüngeleri)
- İmleç veya uçuşan kartlar asla düz $A \to B$ çizgisiyle gitmez.
- İnsan biyomekaniği ve yerçekimi gereği `bezier-trajectories` ile hafif parabolik yay (`curvature: 0.22`) çizer.

### 8. Secondary Action (İkincil Eylem)
- Birincil eylemi (kartın açılışı) destekleyen ikincil detaylar: kartın altındaki temas gölgesinin yumuşaması, kenardaki speküler ışık süpürmesi (`specularGlintGlance`).

### 9. Timing & Spacing (Ritim, Zamanlama & Kare Bütçesi)
- Eşit süreye bölünmüş monoton beat'ler yasaktır (standart sapma $\sigma > 18$ kare).
- Vurucu staccato anlar: 35–55 kare (0.6s–0.9s).
- Derin okuma & veri anları: 75–120 kare (1.25s–2.0s).

### 10. Exaggeration (Zarif Abartı)
- Yay oturmalarında hafif aşırı-atış (`scale: 1.06 -> 1.00`), imleç hareketinde hafif savrulma eğimi (`rotateZ: 3.5°`).

### 11. Solid Drawing / Clean Surfaces (Katı Çizim & Kristal Yüzeyler)
- Neon lekesi, ucuz mor-cyan blur yerine fiziksel ışık ayrımı: 1px kristal kenar yansıması (`specularRimTop`), fiziksel ortam gölgesi (`ambientShadow`).

### 12. Appeal (Çekicilik & Tipografik Estetik)
- Kusursuz okunabilirlik, uluslararası glif desteği, mikro-font içermeyen net tipografik hiyerarşi.

---

## 3. Göz Takibi & Bilişsel Okuma Standartları (Eye Tracking & WPM)

1. **Göz Yolu (Visual Trajectory):**
   - Ekranı tararken göz F-deseni (sol üst → sağ üst → sol alt) veya Z-deseni izler.
   - Önceki beat'in bittiği piksel koordinatı ile yeni beat'in başladığı piksel koordinatı birbirine köprülenmelidir.
2. **Asgari Okunabilirlik Eşiği:**
   - Her ana başlık veya veri metni ekranda **en az 1.2 saniye (72 kare @ 60 FPS)** net, flu olmayan şekilde sabit kalmalıdır.
3. **Bilişsel Kelime Yükü (WPM):**
   - Ekranda beliren metinler için azami okuma hızı 220–240 WPM'dir:
     $$\text{WPM} = \frac{\text{Kelime Sayısı}}{\text{Süre (saniye)}} \times 60 \le 240$$
   - 4 kelimelik bir başlık için asgari süre en az 1.0s – 1.2s olmalıdır.

---

## 4. Tek Kap İlkesi (Single Container Principle) & FLIP Mimarisi

Sahneler arası zıplamak (ekranı karartıp yeni ekran getirmek) bilişsel kopukluk yaratır. En yüksek kaliteli Apple/Linear hareket tasarımlarında sahnenin merkezinde tek bir ana kapsayıcı (Container / Shell) bulunur:

```tsx
// GPU-Pure FLIP Transform ile Tek Kap Mimarisi
<ContainerMorph
  stages={[
    {
      id: 'search-pill',
      startFrame: 0,
      endFrame: 120,
      width: 480,
      height: 64,
      borderRadius: 32,
      content: <CommandSearchBar />,
    },
    {
      id: 'dashboard-card',
      startFrame: 120,
      endFrame: 300,
      width: 920,
      height: 540,
      borderRadius: 20,
      content: <DashboardAnalytics />,
    },
  ]}
  transitionFrames={28}
/>
```

- Tek kap nesne dönüşümü (`width`, `height`, `borderRadius`, `strokeDashoffset`) veya FLIP (`scaleX`, `scaleY`) ile bir sahnedeki nesne (ör. dikey telefon çerçevesi veya bildirim rozeti) kesintisiz olarak sonraki sahnenin ana penceresine evrilir.

---

## 4.5. `SvgFilterLab` ve `LayeredStage3D` (Çok Katmanlı Vektör ve 3D Derinlik Mimarisi)

1. **`SvgFilterLab` (`src/primitives/SvgFilterLab.tsx`):**
   - Tek renk düz `<svg>` çizimleri yerine her sahneye `<SvgFilterLab />` eklenir.
   - İçerdiği filtre ve gradyanlar:
     - `url(#gooey-liquid-morph)`: İki vektör şeklin veya balonun sıvı gibi organik birleşip ayrılması (`<feGaussianBlur>` + `<feColorMatrix>`).
     - `url(#specular-rim-glow)`: Kristal kenar parlaması ve derinlik gölgesi.
     - Çok duraklı metalik, zümrüt ve cam `<linearGradient>` / `<radialGradient>` tanımları.
     - Gerçek konuşma balonu kuyruk vektörleri (`SpeechBubbleTailSVG`) ve resmi marka ikon vektörleri.
2. **`LayeredStage3D` (`src/primitives/LayeredStage3D.tsx`):**
   - Düz 2D kartlar yerine `perspective: 1400px` ve `transformStyle: 'preserve-3d'` destekli 3D sahne kullanılır.
   - `<LayerPlane z={0}>` (ana gövde), `<LayerPlane z={45}>` (sohbet balonları / kartlar), `<LayerPlane z={85}>` (şifreleme kalkanı / ses spektrumu), `<LayerPlane z={120}>` (imleç / rozet) ile kamera eğildiğinde (`rotateX`, `rotateY`) gerçek 3D paralaks ve katman ayrışması (`3D Exploded View`) elde edilir.

---

## 5. Geçiş Gramerleri Sözlüğü (`src/core/transitions.ts`)

| Fonksiyon | Karakter & Anlam | Zorunlu Parametreler |
|---|---|---|
| `transitionWhipPan` | Yüksek hız, yönsel savrulma, dinamik kesit | `(tl, outgoing, incoming, { at, direction: 'left'\|'right'\|'up'\|'down', duration })` |
| `transitionMaskWipe` | Hassas perde açılımı, mimari açığa çıkış | `(tl, incoming, { at, type: 'diagonal'\|'horizontal'\|'vertical'\|'iris', outgoingSelector })` |
| `transitionZoomPunch` | Makro/mikro derinlik dalışı, portal sıçrayışı | `(tl, outgoing, incoming, { at, duration, zoomScale, portalRingSelector })` |
| `transitionContainerMorph` | Tek kap şekil ve kimlik dönüşümü | `(tl, container, outContent, inContent, { at, duration })` |

### Geçiş Kuralları:
- Her beat sınırı kesinlikle bir geçiş taşır (`M001 / M004`).
- 3 ve daha fazla beat içeren projelerde en az 2 farklı geçiş ailesi harmanlanır (`M003`).
- Beat'ler asla unmount edilmez (`{isBeat && <X/>}` yasaktır, `M002`).

---

## 6. Örnek Üretim Kodu (Production Reference Pattern)

```tsx
import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { DURATIONS, EASING, TIMING, RECIPE } from '../../core/tokens';
import { blurScaleReveal, kineticBaselineWipe, cursorClickImpulse } from '../../core/recipes';
import { transitionWhipPan } from '../../core/transitions';

export const MasterScene: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 60;

  const { timeline, scopeRef } = useRemotionGSAP((tl) => {
    // 1. Beat 1: Başlık açılışı (Pose 1)
    kineticBaselineWipe(tl, '.hero-headline', 0.2);

    // 2. İmleç tıklama dürtüsü
    cursorClickImpulse(tl, '.cursor-pointer', 1.4, { rippleSelector: '.click-ripple' });

    // 3. Beat 1 -> Beat 2 Geçişi (Whip-Pan)
    transitionWhipPan(tl, '.beat-1-view', '.beat-2-view', {
      at: 2.1,
      direction: 'left',
      duration: DURATIONS.panel,
    });

    // 4. Beat 2: Kart odak girişi
    blurScaleReveal(tl, '.analytics-card', 2.3);
  }, [fps]);

  useMemo(() => {
    if (timeline) {
      timeline.seek(frame / fps);
    }
  }, [frame, fps, timeline]);

  return (
    <div ref={scopeRef} className="relative w-full h-full overflow-hidden bg-[#09090b] text-[#fafafa]">
      {/* Beat 1 Layer */}
      <div className="beat-1-view absolute inset-0 flex flex-col items-center justify-center">
        <h1 className="hero-headline text-[64px] font-bold tracking-tight">Otonom Hareket Stüdyosu</h1>
        <div className="cursor-pointer absolute top-1/2 left-1/2 w-6 h-6 bg-white rounded-full pointer-events-none" />
        <div className="click-ripple absolute top-1/2 left-1/2 w-16 h-16 rounded-full border border-white pointer-events-none opacity-0" />
      </div>

      {/* Beat 2 Layer */}
      <div className="beat-2-view absolute inset-0 flex items-center justify-center opacity-0 pointer-events-none">
        <div className="analytics-card w-[800px] h-[480px] bg-[#17171d] border border-white/10 rounded-2xl p-8">
          <h2 className="text-[36px] font-semibold">Performans Telemetrisi</h2>
        </div>
      </div>
    </div>
  );
};
```

---

## 6.5. Hibrit Şablon Motoru (html-video & Native Remotion Entegrasyonu)

Stüdyo iki katmanlı hibrit şablon kütüphanesini destekler:
1. **Native Remotion Şablonları (RFC-08 Phase 2):**
   - `<TemplateFrame templateId="frame-data-rollup" data={{ items: [...] }} theme={LIGHT_SAAS_THEME} />`
   - Sayıların yuvarlanması (`interpolate`), çubukların büyümesi (`spring`) doğrudan Remotion içinde deterministik olarak işlenir.
2. **Deterministik HTML Köprüsü (RFC-08 Phase 1 / `HtmlFrameDriver`):**
   - 22 adet editoryal / data-viz / manifesto HTML şablonu (`frame-bold-poster`, `frame-swiss-grid`, `frame-nyt-graph`, `frame-build-minimal` vb.) iframe içinde çalıştırılır.
   - Her HTML şablonunun CSS `@keyframes` ve GSAP global zaman çizelgesi `(frame / fps) * 1000` ms değerine kilitlenir (`doc.getAnimations()` ve `tl.time()`).
   - `neutralizeBlockingResources` ile font linkleri engelsiz yüklenir (`media="print" onload="this.media='all'"`), FOUT ve siyah kare önlenir.
3. **RFC-07 Üç Katmanlı Kaynak (Provenance):**
   - Her şablon L1 origin (gerçek tasarım esin kaynağı), L2 via_skill (kaynak lisans ve repo), L3 transformation bilgilerini taşır.

---

## 6.8. Opus 5.5 Archive & Style Grammar (24 Visual Styles & Mastering Standards)

`awesome-claude-opus-5.5-video` görsel ve matematiksel arşivinden stüdyo çekirdeğine aktarılan 24 görsel stil, negatif prompt filtreleri ve ses mastering standartları:

### 1. 24 Görsel Stil Matrisi (Visual Style Taxonomy)
1. **Surreal Collage (NOGGIN / Terry Gilliam):** 2-4px beyaz kağıt kesim kenarı, 12 FPS stop-motion stepped hold, el kamerası mikro-titremesi, eklemli kukla hiyerarşisi (`CutoutPuppetStage`).
2. **Papercraft & Paper Theater:** Katmanlı diorama, 3D düzlem derinliği, gölge yarıkları.
3. **Hand-drawn & Whiteboard:** Prosedürel çizgi fırçası, silinme ve tükenmez kalem hışırtısı.
4. **Painting & Ink:** Yağlıboya / suluboya difüzyonu, fırça darbesi ve mürekkep yayılması.
5. **Printmaking & Halftone (Shin-Hanga / Woodcut):** Nokta matrisi, tram yoğunluğu, S-eğrisi ton haritalama (`printToneCurve`).
6. **Continuous Line:** Tek bir çizginin asla kesilmeden tüm sahneyi dolaşıp nesnelere evrilmesi.
7. **Mosaic & Stained Glass:** Işıklı vitray hücreleri, 1px kurşun lehim bölmeleri.
8. **Flat Geometry:** Saf Öklid geometrisi, Bauhaus / İsviçre kılavuz ızgarası.
9. **Kinetic Typography:** Kelime patlamaları, bölünmüş harf maskeleri, değişken ağırlıklı font tween'leri.
10. **Charts & Maps (Telestrator):** Homografi düzlem dönüştürme (`homography-math`), taktiksel saha çizgileri, dinamik radar halkaları.
11. **Pixel Art & HD-2D:** Düşük çözünürlüklü sprite'ların modern 3D derinlik ve alan derinliğiyle birleşimi.
12. **Retro Neon:** CRT tarama çizgileri, fosfor parlaması, analog tüp eğriliği.
13. **Sci-fi HUD:** Taktiksel telemetre, köşe vizör çentikleri, 18px mono sayaçlar.
14. **Particles & Light Fields:** Vektör alanları, manyetik saçılma, GPU parçacık akışı.
15. **Glass & Liquid (Gooey Morph):** Sıvı birleşme filtreleri (`<feGaussianBlur>` + `<feColorMatrix>`), 1px kristal specular kenar kırılması.
16. **2D Animation & Anime:** 12 animasyon prensibi, aksiyon çizgileri, darbe kareleri (impact frames).
17. **Clay & Toys:** Kil dokusu, parmak izi pürüzlülüğü, düşük kare hızında zıplama.
18. **Products & Exploded Views:** 3D parçalarına ayrılan patlatılmış donanım bileşenleri, kılcal lider çizgileri.
19. **Miniature & Isometric:** Tilt-shift odak sığlığı, 30°/60° izometrik projeksiyon matrisi.
20. **Nature & Cosmos:** Volumetrik atmosfer, yörünge eğrileri, fraktal parçacıklar.
21. **Blueprints & Cutaways:** Teknik çizim mavisi, beyaz kılcal ölçü okları, kesit diyagramları.
22. **Cinematography & Editing:** 2.39:1 anamorfik en-boy oranı, odak kaydırma (rack focus), motivasyonlu kamera ivmesi.
23. **Archives & Satellite Imagery (Forensic Desk):** Soğuk soruşturma masası (`#0B0C0E`), büyüteç loupe incelemesi (`LoupeMagnifier`), muhasebe defteri (`LedgerCardStage`), alt yazı bandı (`BroadcastPackageStrap`).
24. **Product Interfaces:** Apple/Linear tarzı mikro-etkileşimler, FLIP konteyner geçişleri, pürüzsüz Bézier imleç yörüngeleri.

### 2. Negatif Prompt Kuralları (Adversarial Anti-Slop Gates)
- **No Floating Unanchored Bento Slop:** Uzay boşluğunda amaçsızca yüzen bento kutuları yasaktır. Her arayüz tanımlı bir donanım kabuğuna (`AppShell`, `BrowserFrame`, `LedgerCardStage`, `PrecisionDashboardShell`) veya 1px paylaşımlı kılcal ızgaraya (`gap-[1px] bg-white/[0.08]`) çapalanmalıdır.
- **Direction-Space Sky Stabilization:** Kamerayla birlikte seyahat eden küresel gökyüzü; yatay kesimler daima sabit irtifada tutulur, kamera translasyonunda çizgiler ekranda yüzmez veya titreşmez.
- **Single Container Continuity:** Sahne değişimlerinde ekran karartma veya rastgele slayt geçişi yapılmaz; tek bir nesne veya konteyner en yüksek hız anında morflanarak (`transitionContainerMorph`) sonraki sahneye taşınır.
- **Forensic Restraint (Ölçülü Gerçeklik):** Felaket ve kaza canlandırmalarında ucuz yavaşlatılmış çekim veya tam ekran alev yasaktır; kayıplar sayılan noktalar ve sayılarla gösterilir.

### 3. Ses Mastering & AAC Örnekleme Standartları
- **-14 LUFS Yayın Seviyesi:** Tüm video miksajı -14 LUFS entegre ses seviyesine, maksimum -1.2 dBTP tepe noktasına göre ayarlanır.
- **AAC Sample-0 Guard (`applySample0Guard`):** t=0 anında başlayan sert bas ve ses dalgalarının AAC/MP3 kodlayıcılarında MDCT filtre patlaması ve dijital çıtırtı (clipping) yaratmaması için ilk 2.0 ms'lik aralıkta Hann pencereli yumuşak mikro-giriş uygulanır; örnek 0 mutlak sıfıra kilitlenir.
- **Dinamik Ördek Basma (Audio Ducking):** Konuşma veya orijinal arşiv sesi girdiğinde müzik yatağı otomatik olarak -9 dB ila -12 dB kısılır; konuşma bittiğinde orijinal seviyesine döner.

---

## 7. Kalite Denetim Çevrimi (Zero-Tolerance Quality Gate)

```bash
# 1. Kayıt defteri ve spec doğrulaması
node scripts/gen-registry.mjs
node scripts/validate-spec.mjs

# 2. Shift-Left Storyboard ve hareket mimarisi denetimi
node scripts/audit-storyboard.mjs
node scripts/motion-audit.mjs

# 3. AST Sözdizim ve Slop Taraması
node scripts/ast-lint.mjs
node scripts/slop-linter.mjs

# 4. Opus Direktör Puanlaması ve Glif Denetimi
node scripts/critic-audit.mjs
node scripts/glyph-audit.mjs

# 5. TypeScript derleme denetimi
npx tsc --noEmit
```

Görev ancak tüm denetimler **%100 yeşil** olduğunda ve fiziksel video render edildiğinde tamamlanır.
