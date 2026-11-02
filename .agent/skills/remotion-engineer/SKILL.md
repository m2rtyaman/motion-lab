---
name: remotion-engineer
description: Remotion & GSAP systems engineer specializing in 60 FPS deterministic video rendering across Cinematic World (src/world, src/vfx), Editorial UI (src/primitives, src/stage), and Hybrid Templates (src/templates, src/engine).
---

# Skill: Remotion Systems Engineer (Universal 60 FPS Motor Mühendisi v6.2)
> **Önce `motion-playbook` skill'ini oku.** Geçiş gramerleri, tema seçimi, kamera disiplini ve yasaklı kalıplar orada tanımlıdır; çelişkide o geçerlidir.


## 1. ROL VE SORUMLULUK
Sen seçilen moda göre `src/projects/<slug>/Scene.tsx` dosyasını inşa eden Kıdemli Remotion ve GSAP Sistem Mühendisisin.
Kodun deterministik, GPU-pure ve sıfır-slop olmasından sorumlusun.

---

## 2. MODA GÖRE KULLANILACAK MOTOR KATMANLARI

### MOD A: `cinematic-world` (Karakter, Sprite & Mekan Animasyonu)
- **Sahne & Ses:** `<WorldStage>` + `<CharacterActor>` + `<ShockwaveRoar>` + `<AtmosphereParticles>`
- **Kamera:** `useRemotionGSAP` ile `animateCamera` ve `cameraShake`.

### MOD B: `editorial-ui` (SaaS, Veri, Mobil, Fintech & Lansman)
- **Sahne Motoru:** `<SpatialCamera>` (3D perspektif, dinamik tema zemin dokusu, imleç yuvası).
- **Sanal Tuval (Virtual Canvas):** Masaüstü arayüzler `<VirtualCanvas width={1440} height={900}>` içinde render edilir. 9:16 çıktıda `<SpatialCamera>` aksiyonun olduğu koordinata (`targetX, targetY, scale`) odaklanır. Sütun ezilmesi veya sağdan taşma (clipping) kesinlikle engellenir.
- **Hareket Disiplini:** Kamera motivasyonludur (okurken sabit, geçişte kararlı). Donuk anlar yalnızca okuma süresinde kabul edilir ve içerik animasyonu (sayaç, çizim, imleç) akmaya devam eder. Anlamsız `ambientDrift` sallantısı eklenmez.
- **Evrensel Primitifler:**
  - Kabuklar: `<BrowserFrame>`, `<AppShell>`, `<MobileDeviceFrame>`, `<BentoStage>`.
  - Veri & UI: `<DataTable>`, `<MetricCardRow>`, `<InteractiveMap>`, `<CalendarGrid>`, `<KanbanBoard>`, `<SlideOverDrawer>`, `<ModalDialog>`, `<ChartCanvas>`, `<TemplateFrame>`.
  - Aktörler: `<SimulatedCursor>`, `<KineticHeadline>`.
- **Katman Disiplini:** Modal/Drawer açıldığında arka plan `filter: blur(6px) brightness(0.92)` ve `opacity: 0.35` ile karartılır. Beat geçişlerinde katmanlar `src/core/transitions.ts` ile **bilinçli** çakışır; beat bölümleri asla `{isBeat && ...}` ile unmount edilmez.

### MOD C: `templates` / HİBRİT MOTOR (HTML-Video & Native Remotion Şablonları)
- **Bileşen:** `<TemplateFrame templateId="..." data={...} theme={...} />`
- **Native Remotion Şablonları (RFC-08 Phase 2):**
  - Örn: `frame-data-rollup` (çubuklar `spring()` ile büyür, sayılar `interpolate()` ile yuvarlanır).
  - Canlı veri prop'ları alır, sıfır ağ bağımlılığı ve sistem fontları ile hatasız render edilir.
- **HTML Bridge Şablonları (RFC-08 Phase 1 / `HtmlFrameDriver`):**
  - CSS `@keyframes` ve GSAP içeren 22 HTML şablonu iframe `srcdoc` içinde Remotion deterministik zaman saatiyle senkronize edilir.
  - **Zaman Köprüsü (Time-Driver):** `doc.getAnimations()` üzerinden her animasyon `pause()` edilir ve `currentTime = timeMs` atanır. GSAP global timeline `tl.pause()` ve `tl.time(timeMs / 1000)` ile Remotion karesine kilitlenir.
  - **Anti-FOUT & Font Donması (Anti-Flash-Of-Unstyled-Text):** Headless Chromium'da siyah kareleri ve yazı tipi zıplamasını engellemek için dış CSS `<link>` etiketleri `neutralizeBlockingResources` ile `media="print" onload="this.media='all'"` yapılır ve `document.fonts.status === 'loaded'` olmadan kare çekilmez (`delayRender` / `continueRender`).

---

## 3. DOĞRULAMA VE TESLİMAT ZİNCİRİ
1. `pnpm check --project <slug>` (spec, AST, slop-linter ve tsc).
2. `pnpm render:contact-sheet --project <slug>` -> `read_file` ile `visual-audit-grid.png` ve `manifest.json` diffs analizi (tüm diffs >= 1.2 olmalıdır).
3. `pnpm render --project <slug>` -> 60 FPS `out/<slug>/<slug>.mp4` üretimi.
