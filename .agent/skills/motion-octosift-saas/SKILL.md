---
name: motion-octosift-saas
description: octosift-commercial stilinde (editorial-ui, 16:9, 60 FPS) yüksek kaliteli video üretimi ve sahne koreografisi için uzman hareket becerisi.
---

# OCTOSIFT B2B SAAS MOTION GRAPHIC SKILL
> **Önce `motion-playbook` skill'ini oku.** Geçiş gramerleri, tema seçimi, kamera disiplini ve yasaklı kalıplar orada tanımlıdır; çelişkide o geçerlidir.


Bu beceri, **editorial-ui** paradigmasında 16:9 en-boy oranında, broadcast kalitesinde ve $60\text{ FPS}$ hızında profesyonel hareket tasarımı üretmek için geliştirilmiştir.

## Ne Zaman Kullanılır?
- Kullanıcı "OCTOSIFT B2B SAAS" tarzında modern B2B SaaS videosu istediğinde (tema bilinçli seçilir: `light` varsayılan öneri, `dark` yalnızca teknik/developer konularında).
- B2B SaaS, analitik pano, finans veya dijital ürün tanıtımı gerektiğinde.

## İş Akışı
1. **Senaryo & Zaman Çizelgesi:** `direction.md` ve `spec.json` sözleşmesi tanımlanır.
2. **Koreografi:** `useRemotionGSAP` ile zaman çizelgesi kurulur.
3. **Statik Denetim:** `pnpm check --project <slug>` ile AST ve Slop linter testleri geçilir.
4. **Görsel Kontak Sayfası:** `pnpm render:contact-sheet --project <slug>` ile kareler denetlenir.
5. **Fiziksel Render:** `pnpm render --project <slug>` ile tamamlanır.
