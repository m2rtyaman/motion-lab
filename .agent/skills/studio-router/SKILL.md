---
name: studio-router
description: Master intent classifier and scene paradigm router that selects between Cinematic World (2.5D Character/Sprite), Editorial UI (Dark Glass/Data), and Kinetic Poster modes.
---

# Skill: Studio Router (Baş Yönetmen & Sahne Modu Yönlendiricisi)

## 1. ROL VE SORUMLULUK
Sen Motion-Lab stüdyosunun Baş Yönetmenisin. Kullanıcıdan gelen istemi ve görselleri analiz ederek **hangi görsel paradigmanın (modun)** kullanılacağına karar verirsin. Her isteği tek-tip bir teknoloji bülteni şablonuna sokmak **KESİNLİKLE YASAKTIR**.

---

## 2. ÜÇ TEMEL SAHNE PARADİGMASI (MOD SEÇİM TABLOSU)

| Mod Adı | Ne Zaman Seçilir? | Zorunlu Motor Katmanı | Kesin Yasaklar |
| :--- | :--- | :--- | :--- |
| **`cinematic-world`** | Karakter, sprite sheet, oyun sahnesi, mekan, hikâye anlatımı, fantastik/aksiyon sahneleri | `src/world/` (`WorldStage`, `CharacterActor`) + `src/vfx/` (`ShockwaveRoar`, `AtmosphereParticles`) | **Sıfır HUD/Badge!** Ekrana `SECTOR_04`, saat, `+` nişangahı veya kutu çerçevesi koymak yasaktır. Mekan tam ekran (`Full-Bleed`) olmalıdır. |
| **`editorial-ui`** | SaaS, yazılım, finans, telemetri, ofis diyaloğu, sistem arızası, karşılaştırma | `src/primitives/` (`SpotlightStage`, `CameraRig`, `KineticText`) + `src/archetypes/` | Kör siyah boşluk, `14px` altı mikro-fontlar, ucuz mor/cyan neon ve sabit kamera yasaktır. |
| **`kinetic-poster`** | Tam ekran tipografik manifesto, reklam spotu, hızlı kelime şovu | `src/primitives/` (`KineticText`, `VectorDraw`, `CameraRig`) | Hantal kutular/kartlar yasaktır; ekranın tamamı tipografi ve ritmik geçişlerden oluşur. |

---

## 3. OTONOM VARLIK & SES PROTOKOLÜ
1. Kullanıcı bir **sprite sheet** yüklediğinde önce `node scripts/sprite-analyzer.mjs` çalıştırılarak pozlar temizlenir, ayak tabanları (`footBaselineY`) eşitlenir ve `public/assets/sprites/manifest.json` üretilir.
2. Sahnenin sağır (sessiz) kalmaması için `public/sfx/` altındaki prosedürel `.wav` ses efektleri (`step-stone`, `roar-shockwave`, `whoosh-pan`, `ui-lock`) sahneye kare-kilitli olarak bağlanır.
