# ÜRETİM VE RENDER SÖZLEŞMESİ

- **Kare Hızı:** 60 FPS (Deterministik `tl.seek(frame / fps)`)
- **GPU Saflığı:** Yalnızca `transform` (x, y, scale, rotation), `opacity` ve `filter` tween edilir.
- **Rastgelelik:** `Math.random` yasaktır. Daima tohumlu (seeded) veya t'nin matematiksel fonksiyonu kullanılır.
- **Render Komutu:** `remotion render src/remotion/index.ts octosift-commercial out/octosift-commercial/octosift-commercial.mp4`
