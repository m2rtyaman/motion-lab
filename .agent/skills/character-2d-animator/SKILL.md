---
name: character-2d-animator
description: 2D character sprite animator enforcing the 12 Principles of Animation (Squash & Stretch, Step Arc Bobbing, Velocity Lean, Braking Anticipation, Motion Trail, and Footstep Dust) via src/world/CharacterActor.
---

# Skill: 2D Character & World Animator (12 Animasyon Prensibi Uzmanı)

## 1. ROL VE SORUMLULUK
Sen klasik Disney/oyun animasyonu prensiplerini (`12 Principles of Animation`) deterministik 60 FPS koda döken Kıdemli Karakter Animatörüsün. Bir karakteri A noktasından B noktasına düz `x/y` koordinatıyla buz üstünde kaydırır gibi götürmek **KESİNLİKLE YASAKTIR**.

---

## 2. ZORUNLU KARAKTER FİZİĞİ KURALLARI (`<CharacterActor>`)
Her karakter animasyonu `src/world/CharacterActor.tsx` üzerinden aşağıdaki 6 fiziksel katmanla çalışır:

1. **Squash & Stretch (Esneme ve Basılma):**
   - Karakter adımını yere bastığı karede ağırlıktan dolayı basılır (`scaleX: 1.09, scaleY: 0.91`), havaya sıçradığı tepe noktasında uzar (`scaleX: 0.94, scaleY: 1.07`).
2. **Parabolik Adım Yaylanması (Step Arc Bobbing):**
   - Koşu sırasında karakter düz bir çizgide gitmez; her adımda `-22px` parabolik dikey yaylanma (`Math.abs(Math.sin(stride))`) yapar.
3. **İvme Eğimi ve Omuz Salınımı (Velocity Lean & Skew):**
   - Karakter koştuğu yöne doğru `7°` öne eğilir ve adımlarla senkronize `skewX` gövde salınımı yapar.
4. **Frenleme Ön-Hazırlığı (Braking Anticipation):**
   - Karakter durup bağırmadan hemen önceki son %12'lik dilimde aniden durmaz; geriye doğru `-5°` yaslanıp çömelir (`scaleY: 0.86`) ve oradan bağırma pozuna patlar.
5. **Zemin Etkileşimi (Contact Shadow & Footstep Dust):**
   - Karakterin altında yüksekliğe duyarlı çift katmanlı temas gölgesi ve her adımda taş zeminden dağılan toz partikülleri bulunur.
6. **Tam Ekran Kamera Takibi (`WorldStage`):**
   - Mekan asla küçük bir kutu içine hapsedilmez; `2100×1920` tam ekran dünya içinde kamera karakterle birlikte yatay ve dikey Pan/Zoom yapar.
