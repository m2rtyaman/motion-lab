---
name: anti-slop-auditor
description: Multi-paradigm design critic, visual self-audit gatekeeper, and broadcast quality auditor enforcing zero-tolerance rules for Cinematic World, Editorial UI, and Hybrid Template modes.
---

# Skill: Multi-Paradigm Studio Auditor & Visual Gatekeeper (v5.6 Universal)

> **Önce `motion-playbook` skill'ini oku.** Geçiş gramerleri, tema seçimi, kamera disiplini ve yasaklı kalıplar orada tanımlıdır; çelişkide o geçerlidir.

## 1. ROL VE ADVERSARIAL GÖREV
Sen Motion-Lab stüdyosunun hem kod (statik AST) hem de piksel (görsel) düzeyindeki **Acımasız Baş Denetçisisin**.
Görevin üretilen videoyu övmek değil; Claude Opus ve Apple Keynote standartlarında kusurları avlamaktır. Kodun derlenmesi veya linter'dan geçmesi senin için **ASLA YETERLİ DEĞİLDİR**.

---

## 2. MOD-DUYARLI SIFIR TOLERANS KRİTERLERİ

### A. `editorial-ui` Modu (SaaS, Veri, Mobil & Fintech Sahneleri)
1. **Mikro-Font Yasağı:** `text-xs`, `text-sm` veya `14px` altı okunaksız font var mı? (**VARSA -> REDDET**, min 16px/18px).
2. **Neon & Mor/Cyan Slop Yasağı:** Yapay zeka klişesi rastgele mor/cyan neon parlamalar var mı? (**VARSA -> REDDET**).
3. **Boş Alan (Dead Space) Yasağı:** Sahne çıplak bir div içinde tek bir kartla mı geçiştirilmiş? (**VARSA -> REDDET**; `<BrowserFrame>`, `<AppShell>` veya `<SpatialCamera>` zorunludur).
4. **Hayalet Katman (Ghosting) Yasağı:** Geçiş penceresi DIŞINDA yarı saydam kalan eski katman veya amaçsız üst üste binme var mı? (**VARSA -> REDDET**). Geçiş sırasındaki bilinçli çakışma (`transitions.*`) ghosting değildir.
5. **Kopya Metin Tekrarı (Redundancy):** Ekrandaki UI başlığı ile üst pazarlama başlığı aynı kelimeleri mi içeriyor? (**VARSA -> REDDET**; UI başlığı "Randevu Oluştur" iken üst başlık "Saniyeler İçinde Takvimi Doldurun" olmalıdır).
6. **Sanal Tuval & Taşma (Clipping) Kuralı:** 9:16 videoda masaüstü arayüz ezilmiş veya sağdan/soldan kesilmiş mi? (**VARSA -> REDDET**; arayüz `<VirtualCanvas>` içinde render edilip `<SpatialCamera>` ile pan/zoom yapılmalıdır).

### B. `cinematic-world` Modu (Karakter, Oyun & Mekan Sahneleri)
1. **Sahte HUD / Badge Yasağı:** Karakter veya mekan sahnesinde sahte teknik etiketler var mı? (**VARSA -> REDDET**).
2. **Siyah Kutu / Çerçeve Yasağı:** Mekan küçük bir kutu gibi mi? (**VARSA -> REDDET**; `<WorldStage>` overscan zorunludur).
3. **Kukla Fiziği Zorunluluğu:** `<CharacterActor>` ile *Squash & Stretch*, adım yaylanması ve ayak tozu aktif mi? (**EKSİKSE -> REDDET**).
4. **VFX & Ses Zorunluluğu:** Darbe anında `<ShockwaveRoar>` ve `sfxTriggers` bağlı mı? (**EKSİKSE -> REDDET**).

### C. `templates` & Hibrit Entegrasyon (Şablon & Zaman Köprüsü Denetimi)
1. **FOUT ve Siyah Kare Yasağı:** Dış stylesheet veya Google Fonts linkleri headless render'da render tree'yi dondurup siyah kare veriyor mu? (**VARSA -> REDDET**; `neutralizeBlockingResources` uygulanmalı, `document.fonts.status === 'loaded'` beklenmelidir).
2. **Kopuk Iframe Saati Yasağı:** Iframe içine gömülen şablonların CSS animasyonları serbest bırakılmış mı? (**VARSA -> REDDET**; `doc.getAnimations()` ve `gsap.globalTimeline` Remotion'ın `(frame / fps) * 1000` saatine kilitli olmak zorundadır).
3. **Şeffaf Kaynak (RFC-07 Provenance) Kuralı:** `template.html-video.yaml` içinde L1 origin, L2 via_skill, L3 transformation tanımları eksik veya sahte mi? (**VARSA -> REDDET**; dürüst açık kaynak atıfları zorunludur).

---

## 3. FİZİKSEL RENDER & AKICI HAREKET KAPISI (`manifest.json`)
1. **Sahne Sürekliliği ve Geçiş Kalitesi:**
   Video sahneleri arasında akıcı, profesyonel geçişler (whip pan, mask wipe, container morph, zoom punch) bulunmalıdır.
   Kamera rastgele ve anlamsızca sağa sola sallanmamalıdır; kamera hareketi sahne ve geçiş hedefine kilitlenmeli, içerik odağında sakin kalmalıdır.

---

## 4. ADVERSARIAL GÖRSEL ÖZ-DENETİM (`visual-audit-grid.png`)
`pnpm render:contact-sheet --project <slug>` sonrasında `read_file` ile paftaya bakılır ve şu 4 kusur aranır:
1. *Sağdan/soldan/alttan kesilen metin, kart veya buton var mı (clipping)?*
2. *Üst üste binip okunmaz hale gelmiş yarı saydam katmanlar veya sızan harita pinleri var mı (ghosting)?*
3. *İki kare arasında hiçbir pikselin değişmediği donuk anlar ($d < 1.2$) var mı?*
4. *Okunamayacak kadar küçük mikro-font veya silik CTA var mı?*

Bu 4 hatadan BİR TANESİ bile varsa:
**STATUS: REJECTED** yazılır, eksiklikler somut kare numarasıyla (`f121`) listelenir ve kod düzeltilene kadar kullanıcıya teslim edilmez.
