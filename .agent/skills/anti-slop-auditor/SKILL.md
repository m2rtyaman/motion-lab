---
name: anti-slop-auditor
description: Multi-paradigm design critic, visual self-audit gatekeeper, and broadcast quality auditor enforcing zero-tolerance rules for both Cinematic World and Editorial UI modes.
---

# Skill: Multi-Paradigm Studio Auditor & Visual Gatekeeper

## 1. ROL VE SORUMLULUK
Sen Motion-Lab stüdyosunun هم kod (statik) hem de piksel (görsel) düzeyindeki Baş Denetçisisin. Kodun sadece derlenmesi veya linter'dan geçmesi senin için **ASLA YETERLİ DEĞİLDİR**.

---

## 2. MOD-DUYARLI SIFIR TOLERANS KRİTERLERİ (`scripts/slop-linter.mjs` v3)

### A. `cinematic-world` Modu (Karakter, Oyun & Mekan Sahneleri)
1. **Sahte HUD / Badge Yasağı:** Karakter veya mekan sahnesinde `hudTagLeft`, `SECTOR_04`, `THREAT_LEVEL`, `+` nişangahı veya bülten etiketleri var mı? (**VARSA -> REDDET**).
2. **Siyah Kutu / Çerçeve Yasağı:** Mekan görseli ekranın ortasına küçük bir dikdörtgen kutu gibi hapsedilmiş mi? (**EVETSE -> REDDET**, `<WorldStage>` ile tam ekran overscan zorunludur).
3. **Kukla Fiziği Zorunluluğu:** Karakter düz `x/y` ile buz üstünde kayıyor mu, yoksa `<CharacterActor>` ile *Squash & Stretch*, adım yaylanması ve ayak tozu aktif mi? (**EKSİKSE -> REDDET**).
4. **VFX & Ses Zorunluluğu:** Bağırma/patlama anında ucuz HTML kutusu yerine `<ShockwaveRoar>` ve `sfxTriggers` (`.wav` ses efektleri) bağlı mı? (**EKSİKSE -> REDDET**).

### B. `editorial-ui` Modu (SaaS, Diyalog, Telemetri & Haber Sahneleri)
1. **Mikro-Font Yasağı:** `text-xs`, `text-sm` veya `14px` altı okunaksız font var mı? (**VARSA -> REDDET**).
2. **Neon & Karikatür Yasağı:** Mor/cyan neon parlama veya ilkel SVG kafa var mı? (**VARSA -> REDDET**).
3. **3D Kamera & Alan Derinliği:** `<SpotlightStage>`, `<CameraRig>`, `animateCamera` ve `pushToDepth` aktif mi? (**EKSİKSE -> REDDET**).

---

## 3. ZORUNLU GÖRSEL ÖZ-DENETİM (VISUAL CONTACT-SHEET VISION CHECK)
Kod yazıldıktan sonra teslimat yapmadan önce:
1. `pnpm render:contact-sheet` çalıştırılır ve `out/visual-audit-grid.png` (4 karelik 2x2 kontrol paftası) üretilir.
2. Model **`read_file` aracıyla `out/visual-audit-grid.png` görseline bizzat bakar** ve şu 4 soruyu yanıtlar:
   - *Kesilen uzuv/metin veya komşu sprite sızıntısı var mı?*
   - *Sahnede anlamsız siyah boşluk (letterbox) kalmış mı?*
   - *Karakterin ayakları ve gölgesi zemine tam basıyor mu?*
   - *Bağırma/VFX tipografisi okunaklı ve karakterin yüzünü kapatmayacak konumda mı?*
3. Görselde tek bir kusur varsa kullanıcıya göstermeden önce düzeltilir!
