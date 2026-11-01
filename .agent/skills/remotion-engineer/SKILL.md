---
name: remotion-engineer
description: Remotion & GSAP systems engineer specializing in 60 FPS deterministic video rendering across Cinematic World (src/world, src/vfx) and Editorial UI (src/primitives, src/stage) modes.
---

# Skill: Remotion Systems Engineer (Universal 60 FPS Motor Mühendisi v5.5)

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
- **Sürekli Nefes:** Her karede `ambientDrift(frame)` çalıştırılır; sahnede diff < 1.2 olan donuk kare kalamaz.
- **Evrensel Primitifler:**
  - Kabuklar: `<BrowserFrame>`, `<AppShell>`, `<MobileDeviceFrame>`, `<BentoStage>`.
  - Veri & UI: `<DataTable>`, `<MetricCardRow>`, `<InteractiveMap>`, `<CalendarGrid>`, `<KanbanBoard>`, `<SlideOverDrawer>`, `<ModalDialog>`, `<ChartCanvas>`.
  - Aktörler: `<SimulatedCursor>`, `<KineticHeadline>`.
- **Katman Disiplini (Anti-Ghosting):**
  - Modal/Drawer açıldığında arka plan `filter: blur(6px) brightness(0.92)` ve `opacity: 0.35` ile karartılır.
  - Sahneler arası geçişte eski bileşen <= 12 karede kapanır; iki katman yarı şeffaf üst üste binemez.

---

## 3. DOĞRULAMA VE TESLİMAT ZİNCİRİ
1. `pnpm check --project <slug>` (spec, AST, slop-linter ve tsc).
2. `pnpm render:contact-sheet --project <slug>` -> `read_file` ile `visual-audit-grid.png` ve `manifest.json` diffs analizi (tüm diffs >= 1.2 olmalıdır).
3. `node scripts/render.mjs --project <slug>` -> 60 FPS `out/<slug>/<slug>.mp4` üretimi.
