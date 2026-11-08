# HAREKET DİLİ VE KOREOGRAFİ: MOTION-OCTOSIFT-SAAS

1. **Tek Kap İlkesi (Single Container Principle):** Sahneler arası geçişte bir ana konteyner kırılmadan morflanarak devam eder.
2. **Büyük Anlardan Önce Durgunluk (Anticipatory Stillness):** Darbelerden ve geçişlerden önce 300–500 ms mikro-durgunluk bırakılır.
3. **İşe Göre Easing:**
   - UI Geçişleri: `power3.out` / `back.out(1.4)`
   - Kamera Pan/Zoom: `expo.inOut` / `power2.out`
   - Asla yasaklı ease (`linear`, `easeInOut`) kullanılmaz.
4. **Metin Süresi:** Ekrana gelen her başlık en az 1.2 saniye (72 kare @ 60 FPS) ekranda sabit kalır.
