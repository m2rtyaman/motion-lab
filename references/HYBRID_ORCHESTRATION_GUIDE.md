# HİBRİT ÇOKLU-ARKETİP ORKESTRASYON KILAVUZU (HYBRID ORCHESTRATION GUIDE)

## 1. MİMARİ VİZYON & AMAÇ
Bir video boyunca tek bir şablona (sadece bento kartı veya sadece terminal mockup) kilitlenmek, 15–30 saniyelik editoryal motion videolarda ritim monotonluğuna ve izleyici yorgunluğuna neden olur.
Bu mimari ile:
1. **Sahne 1:** `bento-editorial` (analitik telemetri, metrik kartları, E2EE status kapsülü).
2. **Sahne 2:** `kinetic-void` (tam ekran heykelsi halkalar, kinetik tipografi ve harf patlamaları).
3. **Sahne 3:** `terminal-mockup` (kod akışı, syntax highlighting, CLI promptu).
4. **Sahne 4:** `product-promo` (kristal cam marka rozeti ve 1.2s stillness hold).

Tüm bu arketipler birbirinden bileşen (`CapsulePill`, `TelemetryTile`, `TerminalShell`, `KineticBurstWord`), varlık (asset) ve geçiş ödünç alabilir; üstelik **TheHeroActor** sayesinde izleyicinin gözü asla kaybolmaz.

---

## 2. PAYLAŞIMLI PRİMİTİFLER KATMANI (`src/primitives/`)

Atomic Design prensibine göre yapılandırılmıştır:
- **Atoms (`src/primitives/atoms/`):**
  - `CapsulePill.tsx`: Morflanabilir hap rozet, status göstergesi, dinamik dot pulse.
  - `KickerBadge.tsx`: Editoryal kategori ve beat numarası rozeti.
  - `HairlineGrid.tsx`: 1px subgrid kılcal eksen ızgarası, köşe artı işaretleri (+).
  - `CounterValue.tsx`: Tabular font mono akıcı sayı primitifi.
  - `VerifiedCursor.tsx`: SVG MacOS / Crosshair imleç taşıyıcısı.
- **Molecules (`src/primitives/molecules/`):**
  - `TelemetryTile.tsx`: Bento içi metrik karo, yüzde değişim rozeti, dipnot.
  - `CodeStreamBlock.tsx`: Terminal kod satırları, sözdizimi renklendirmesi, yanıp sönen imleç.
  - `ProceduralWaveform.tsx`: Deterministik ses frekansı dalga çubukları.
- **Shells (`src/primitives/shells/`):**
  - `TerminalShell.tsx`: Trafik ışıklı, tab çubuklu profesyonel CLI pencere kabuğu.
  - `PrecisionDashboardShell.tsx`: Titanyum parlama efektli bento gösterge kabuğu.
  - `BrowserFrame.tsx`: Web tarayıcı penceresi.
- **Kinetic Engines (`src/primitives/kinetic/`):**
  - `KineticBurstWord.tsx`: Maskeli, yay fiziğiyle fırlayan harf patlama motoru.
  - `SculpturalRings.tsx`: 3D hissi veren SVG altın pahlı konsantrik halkalar.
- **Bridges (`src/primitives/bridges/`):**
  - `TheHeroActor.tsx`: Sahneler arası form ve ivme aktaran yaşayan ana taşıyıcı nesne (`#the-hero-actor`).
  - `ContainerMorphBridge.tsx`: Sahne katmanları arasında FLIP tabanlı geçiş yuvası (`SceneSlot`).

Tüm bu primitifler `src/primitives/index.ts` üzerinden merkezi olarak dışa aktarılır.

---

## 3. SAHNE DÜZEYİNDE ŞABLON SÖZLEŞMESİ (`spec.json`)

Hibrit projelerde mod `"hybrid-orchestrated"` olarak belirlenir ve sahneler deklaratif bir liste olarak tanımlanır:

```json
{
  "mode": "hybrid-orchestrated",
  "singleContainer": true,
  "scenes": [
    { "id": "scene-bento", "archetype": "bento-editorial", "startFrame": 0, "endFrame": 180, "heroAnchorId": "#the-hero-actor" },
    { "id": "scene-kinetic", "archetype": "kinetic-void", "startFrame": 181, "endFrame": 380, "heroAnchorId": "#the-hero-actor" },
    { "id": "scene-terminal", "archetype": "terminal-mockup", "startFrame": 381, "endFrame": 528, "heroAnchorId": "#the-hero-actor" },
    { "id": "scene-payoff", "archetype": "product-promo", "startFrame": 529, "endFrame": 600, "heroAnchorId": "#the-hero-actor" }
  ]
}
```

---

## 4. KESİNTİSİZ KAHRAMAN AKTÖR DEVİR TESLİMİ (KINETIC HANDOFF)
PowerPoint slaytı gibi unmount olan sahneler (`isBeatX && <Scene/>`) kesinlikle yasaktır (M002 ihlali).
Bunun yerine:
1. `TheHeroActor` videonun 0. karesinden son karesine kadar fiziksel olarak DOM'da kalır (`opacity > 0`).
2. Sahne 1'de Bento paneli içinde bir veri kapsülüyken,
3. Geçiş anında (`transitionContainerMorph` ile) hızla genişleyip düzleşerek Sahne 2'deki kinetik tipografinin zemin şeridine dönüşür.
4. Sahne 2'nin sonunda bir CLI prompt imlecine (`>_`) büzülür ve Sahne 3'te bir `TerminalShell` penceresine genişler.
5. Son sahnede ise 1.2 saniye (72 kare) kilitli kalan kristal marka kartına daralır.

---

## 5. LİNTER & DENETÇİ UYUMLULUĞU
- **`validate-spec.mjs`:** `scenes` dizisini ve geçerli arketip türlerini doğrular.
- **`slop-linter.mjs`:** `TheHeroActor` ve `useRemotionGSAP` kullanımını zorunlu tutar.
- **`craft-audit.mjs`:** UI bileşenleri için Hardware Shell çapalamasını denetlerken kinetik sahnelerin serbest tipografisine false-positive hata vermez.
- **`motion-audit.mjs`:** Sahne geçişlerindeki `transitionContainerMorph` ve `transitionZoomPunch` köprülerini tanır; sert kesmeleri ve unmount hatalarını engeller.
