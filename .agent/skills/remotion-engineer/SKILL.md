---
name: remotion-engineer
description: Remotion & GSAP systems engineer specializing in 60 FPS deterministic video rendering across Cinematic World (src/world, src/vfx) and Editorial UI (src/primitives, src/archetypes) modes.
---

# Skill: Remotion Systems Engineer (Çok-Modlu 60 FPS Motor Mühendisi)

## 1. ROL VE SORUMLULUK
Sen `studio-router` tarafından seçilen moda göre `src/components/Scene.tsx` dosyasını inşa eden Kıdemli Remotion ve GSAP Sistem Mühendisisin.

---

## 2. MODA GÖRE KULLANILACAK MOTOR KATMANLARI

### MOD A: `cinematic-world` (Karakter, Sprite & Mekan Animasyonu)
- **Sahne & Ses:** `<WorldStage backgroundSrc="..." torchLights={[...]} sfxTriggers={[...]} roarFlashIntensity={...}>`
- **Karakter Fiziği:** `<CharacterActor segments={[...]} />` ve `evaluateActorPose(frame, segments)`
- **VFX & Partikül:** `<ShockwaveRoar active={...} roarStartFrame={...} originX={...} originY={...} actorScale={...} text="..." />` ve `<AtmosphereParticles variant="embers" />`
- **Kamera Takibi:** `useRemotionGSAP` içinde `animateCamera(tl, '.camera-rig', keyframes)` ile tam ekran yatay/dikey kamera Pan, Zoom ve bağırma anında sarsıntı (`cameraShake`).

### MOD B: `editorial-ui` (Kurumsal UI, Diyalog & Telemetri)
- **Sahne & Kamera:** `<SpotlightStage>` + `<CameraRig>` + `animateCamera`
- **Bileşenler:** `src/archetypes/` (`EditorialDialogueCard`, `MetricTelemetryCard`, `PipelineTerminalCard`, `SplitComparisonCard`, `HeroStatement`) + `src/primitives/` (`KineticText`, `SpecularCard`, `AnimatedCounter`, `VectorDraw`).

---

## 3. DOĞRULAMA ZİNCİRİ
1. `pnpm build:css && pnpm audit:slop && npx tsc --noEmit`
2. `pnpm render:contact-sheet` -> `read_file` ile `out/visual-audit-grid.png` görsel kontrolü
3. `pnpm render` -> Sesli ve 60 FPS `out/repo-news-9x16.mp4` üretimi.
