---
name: character-2d-animator
description: 2D character sprite animator enforcing the 12 Principles of Animation (Squash & Stretch, Step Arc Bobbing, Velocity Lean, Braking Anticipation, Motion Trail, and Footstep Dust) via src/world/CharacterActor.
---

# Skill: 2D Character & World Animator (12 Animasyon Prensibi Uzmanı v2)

> **Önce `motion-playbook` skill'ini oku.** Geçiş gramerleri, tema seçimi, kamera disiplini ve yasaklı kalıplar orada tanımlıdır; çelişkide o geçerlidir.

---

## 1. ROL VE SORUMLULUK
Sen klasik Disney ve ileri seviye dövüş/platform oyun animasyonu prensiplerini (`12 Principles of Animation`) deterministik 60 FPS koda döken Kıdemli Karakter Animatörüsün. Bir karakteri A noktasından B noktasına düz `x/y` koordinatıyla buz üstünde kaydırır gibi götürmek **KESİNLİKLE YASAKTIR**.

---

## 2. 8-KARELİK KUSURSUZ YÜRÜYÜŞ / KOŞU ÇEVRİMİ TABLOSU (The 8-Frame Walk Cycle)

Her adım döngüsü 8 ana fiziki anahtar kareden (keyframe) oluşur. Karakterin zeminle teması, gövde ağırlığı ve dikey salınımı bu tabloya göre hesaplanır:

| Kare # | Faz Adı (Phase) | t (Döngü) | scaleX | scaleY | y (Bobbing) | skewX (Eğim) | Temas Gölgesi | Toz Efekti (Dust) |
|---|---|---|---|---|---|---|---|---|
| **Kare 1** | **Contact (Ön Ayak Temas)** | 0.00 | 1.00 | 1.00 | 0px | +4° | 1.00 (Tam) | Tetiklenir (Sol ayak) |
| **Kare 2** | **Down / Recoil (Çöküş & Basılma)** | 0.125 | 1.09 | 0.91 | +8px (Aşağı) | +6° | 1.15 (Geniş) | Yayılır |
| **Kare 3** | **Passing 1 (Geçiş & Denge)** | 0.25 | 0.98 | 1.02 | -6px (Yukarı) | +2° | 0.92 (Orta) | Sönümlenir |
| **Kare 4** | **High-Point (Zirve Fırlaması)** | 0.375 | 0.94 | 1.07 | -18px (Tepe) | 0° | 0.75 (Uzak) | Havada |
| **Kare 5** | **Contact Opp (Arka Ayak Temas)** | 0.50 | 1.00 | 1.00 | 0px | -4° | 1.00 (Tam) | Tetiklenir (Sağ ayak) |
| **Kare 6** | **Down Opp (İkinci Çöküş)** | 0.625 | 1.09 | 0.91 | +8px (Aşağı) | -6° | 1.15 (Geniş) | Yayılır |
| **Kare 7** | **Passing 2 (İkinci Geçiş)** | 0.75 | 0.98 | 1.02 | -6px (Yukarı) | -2° | 0.92 (Orta) | Sönümlenir |
| **Kare 8** | **High-Point 2 (İkinci Zirve)** | 0.875 | 0.94 | 1.07 | -18px (Tepe) | 0° | 0.75 (Uzak) | Havada |

---

## 3. KÜTLE ÇARPANLARI VE FİZİKSEL AĞIRLIK SINIFLARI (Mass Multipliers)

Farklı karakter tipleri farklı fiziksel kütle katsayılarıyla hareket eder:

| Karakter Sınıfı | Örnek | Kütle ($m$) | Sertlik ($k$) | Sönüm ($c$) | Squash Oranı ($S$) | Dikey Yaylanma ($A$) |
|---|---|---|---|---|---|---|
| **Hafif (Light)** | Bulut, peri, kuş | 0.45 | 180 | 16 | 0.95 / 1.05 | 8px |
| **Standart (Medium)** | İnsan, cüce, savaşçı | 1.00 | 240 | 28 | 0.91 / 1.09 | 18px |
| **Ağır (Heavy)** | Zırhlı dev, ork, golem | 2.40 | 320 | 45 | 0.84 / 1.18 | 26px |
| **Titan (Colossus)** | Mekanik dev, dağ | 6.00 | 500 | 90 | 0.76 / 1.28 | 38px |

---

## 4. MATEMATİKSEL SQUASH & STRETCH VE PARABOLİK YAY FORMÜLLERİ

### 1. Dinamik Dikey Salınım (Parabolic Stride Bobbing):
Adım frekansı $\omega = 2\pi \times \text{stepFrequency}$ olmak üzere dikey konum:
$$y(t) = -A \cdot |\sin(\omega t)| + \text{recoilBias}(t)$$
Burada yerle temas anında mutlak değer tepeye vurduğunda karakter en yüksek noktadadır; $y=0$ anında yere çarpar.

### 2. Squash & Stretch Deformasyonu:
Karakterin dikey hızına $v_y(t) = y'(t)$ bağlı olarak:
$$\text{scaleY}(t) = 1.0 + \kappa \cdot \frac{v_y(t)}{v_{\max}}$$
$$\text{scaleX}(t) = \frac{1.0}{\sqrt{\text{scaleY}(t)}} \approx 1.0 - 0.5 \times (\text{scaleY}(t) - 1.0)$$
Bu sayede iki boyutlu alanda **hacim daima sabit kalır**.

### 3. Frenleme Ön-Hazırlığı (Braking Anticipation):
Koşudan ani durmaya veya saldırıya geçerken son 12–16 karede:
- Geriye yaslanma: $\text{skewX}: -8^\circ$
- Çömelme: $\text{scaleY}: 0.85, \text{scaleX}: 1.15$
- Bu birikmiş potansiyel enerji bir sonraki karede patlayıcı bir darbe veya kükreme pozuna boşalır.

---

## 5. ZEMİN ETKİLEŞİMİ VE TOZ PARTİKÜLLERİ (`FootstepDust`)

1. **Çift Katmanlı Temas Gölgesi (Contact Shadow):**
   - Karakter havalandıkça gölge küçülür ve flulaşır:
     $$\text{shadowScale} = 1.0 - 0.35 \times \frac{|y(t)|}{A_{\max}}$$
     $$\text{shadowBlur} = 4\text{px} + 12\text{px} \times \frac{|y(t)|}{A_{\max}}$$
2. **Ayak Tozu (Dust Puff):**
   - Ayak $y=0$ çizgisine çarptığı karede (`frame % strideFrames === 0`), 4 adet deterministik eliptik toz zerresi ters yönde fırlar (`x: -dir * 32px, y: -8px, opacity: 0.8 -> 0`).

---

## 6. KAMERA TAKİBİ VE DÜNYA SAHNESİ (`WorldStage`)

- Karakter asla dar bir `300×300` kutuya hapsedilmez.
- `WorldStage` 2100×1920 sanal piksel boyutunda render edilir.
- Kamera (`CameraRig`), karakterin $x, y$ koordinatlarını `cameraLag: 0.12s` gecikmeli bir yay filtresiyle takip eder; karakter hareket yönüne doğru `leadOffset: +140px` kamera payı bırakır.
