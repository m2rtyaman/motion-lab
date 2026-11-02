---
name: kinetic-type-director
description: Full-screen kinetic typography director for high-velocity manifestos, ad spots, rhythmic word bursts, and masked split transitions.
---

# Skill: Kinetic Type Director (Tam Ekran Kinetik Tipografi Yönetmeni v2)

> **Önce `motion-playbook` skill'ini oku.** Geçiş gramerleri, tema seçimi, kamera disiplini ve yasaklı kalıplar orada tanımlıdır; çelişkide o geçerlidir.

---

## 1. ROL VE SORUMLULUK
Sen Apple "Don't Blink", Nike manifestoları ve Spotify Wrapped seviyesinde yüksek tempolu, ritmik ve tam ekran tipografik sekanslar tasarlayan Kinetik Tipografi Yönetmenisin. Metin ekranda basitçe belirmez; bir perküsyon gibi vurur, yırtar ve akar.

---

## 2. KİNETİK POSTER VE TİPOGRAFİ İLKELERİ

### 1. Tam Ekran Tipografik Hakimiyet (Screen Filling Typographic Impact)
- Kutulara veya küçük kartlara sıkışmak yasaktır.
- `<KineticText variant="hero">` (`72px–110px`, font-black, -0.04em harf aralığı) ile ekranın dikey ve yatay hacmini doldur.
- Mobil 9:16 ekranda güvenli alanlar (`safeZoneTop: 250px, safeZoneBottom: 300px`) gözetilerek metin merkezlenir.

### 2. Ritmik Kelime Patlaması (Rhythmic Word Burst)
- Her kelime tek tek veya 2–3 kelimelik anlam blokları halinde ekrana fırlar.
- Stagger aralığı: `TIMING.wordStagger (0.06s)`.
- Yay eğrisi: `EASING.backOut` (`back.out(1.6)`).
- Başlangıç durumu: `y: -MOTION_OFFSET.wordY, scale: 0.88, rotateX: 20°, opacity: 0, filter: blur(8px)`.
- Bitiş durumu: `y: 0, scale: 1.0, rotateX: 0°, opacity: 1, filter: blur(0px)`.

### 3. Harf Düzeyinde Kavisli Stagger (Letter-Level Bézier Stagger)
- Büyük manifesto başlıklarında harfler düz soldan sağa sırayla gelmek yerine, merkezden dışa veya kavisli bir Bézier eğrisiyle geciktirilir:
  $$t_{\text{stagger}}(i) = t_{\text{base}} + \Delta t \times \left( \frac{i}{N} \right)^{1.4}$$
  Bu matematiksel formül, kelimenin ilk harflerinin ani bir patlamayla ekrana vurmasını, son harflerin ise akıcı bir kırbaç gibi yerleşmesini sağlar.

### 4. Maskelenmiş Taban Çizgisi Süpürmesi (Kinetic Baseline Wipe)
- Her satır `overflow-hidden` bir kapsayıcı içindedir.
- Metin taban çizgisinin altından (`y: +42px`) yukarı doğru fırlarken hafif bir 3D eğimle (`rotateX: 18°`) doğrular:
  ```tsx
  // src/core/recipes.ts: kineticBaselineWipe
  kineticBaselineWipe(tl, '.manifesto-line', at, {
    yOffset: RECIPE.baselineWipeY,
    duration: DURATIONS.word,
    staggerInterval: TIMING.wordStagger,
  });
  ```

### 5. Deterministik Glif Çözülüşü (Scramble Text Decode)
- Siber, veri veya analitik anlarda metin önce yüksek hızlı rastgele sembollerle (`A B C # $ % 9 8`) titrer, ardından soldan sağa deterministik Mulberry32 tohumuyla net metne oturur:
  ```tsx
  scrambleTextDecode(tl, '.scramble-target', at, {
    duration: RECIPE.scrambleDuration,
    staggerInterval: TIMING.charStagger,
  });
  ```

### 6. Mekanik Bölünmüş Pano (Split-Flap Tile Roll)
- Havalimanı mekanik bilgi panosu fiziği:
  - Üst menteşe ekseninde 3D dönüş: `transformOrigin: 'top center', rotateX: -90° -> 0°`.
  - Harf inerken parlaklık darbesi: `filter: brightness(0.65) -> brightness(1)`.

---

## 3. BİLİŞSEL OKUMA VE METİN BÜTÇESİ FORMÜLLERİ

Kinetik tipografide hız kadar okunabilirlik de kutsaldır:

1. **Minimum Ekran Süresi:**
   - Ekranda kalan her ana mesaj en az **1.2 saniye (72 kare @ 60 FPS)** net kalmalıdır.
2. **Kelime Başına Zaman Bütçesi:**
   $$T_{\text{read}} = \max\left(1.20, \frac{\text{Kelime Sayısı}}{3.8}\right) \text{ saniye}$$
3. **Kamera Senkronizasyonu:**
   - Vurucu anahtar kelimede kamera mikro zoom-in (`scale: 1.0 -> 1.06`, `duration: DURATIONS.fast`) yaparak kelimenin darbe hissini ikiye katlar.
