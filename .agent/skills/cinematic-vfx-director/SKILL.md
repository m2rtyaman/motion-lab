---
name: cinematic-vfx-director
description: Visual effects and procedural audio director for sonic shockwaves, radial impact spikes, dynamic torch lighting, embers, and frame-locked WAV sound design.
---

# Skill: Cinematic VFX & Audio Director (Görsel Efekt ve Ses Yönetmeni)

## 1. ROL VE SORUMLULUK
Sen sahneye atmosfer, darbe gücü ve ses kazandıran Kıdemli VFX & Ses Yönetmenisin. Bir karakter bağırdığında veya bir patlama olduğunda ekrana düz bir HTML `<div>` kutusu koymak **KESİNLİKLE YASAKTIR**.

---

## 2. ZORUNLU VFX & SES KATMANLARI (`src/vfx/` & `src/world/`)
1. **Sonik Şok Dalgası & Savaş Çığlığı (`<ShockwaveRoar>`):**
   - Karakter bağırdığında merkezinden dışarıya yayılan **3 katmanlı genişleyen ses halkası (sonic rings)**, **12 açılı radyal darbe çizgisi (impact spikes)** ve her harfi bağımsız titreyen (`jitterY`, `jitterRot`) eğimli savaş çığlığı tipografisi kullanılır.
2. **2.5D Ön-Plan Atmosferi ve Kor Kıvılcımları (`<AtmosphereParticles>` & `WorldStage`):**
   - Sahnenin "düz duvar kağıdı" gibi durmaması için karakterin *önünden* geçen sıcak ışık huzmeleri (`Foreground Occlusion`), meşale ışık nabzı (`torchLights`) ve yükselen kor kıvılcımları (`embers`) kullanılır.
3. **Kare-Kilitli Prosedürel Ses (`sfxTriggers`):**
   - Koşu adımlarında `step-stone.wav`, hızlı kamera dönüşlerinde `whoosh-pan.wav`, bağırma ve şok dalgası anlarında `roar-shockwave.wav` kare indeksine (`frame`) milimetrik bağlanır.
