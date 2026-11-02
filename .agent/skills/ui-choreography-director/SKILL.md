---
name: ui-choreography-director
description: Comprehensive director for Apple and Linear style UI micro-interactions, organic cursor choreography, FLIP container transitions, and drawer/modal staging.
---

# Skill: UI Choreography Director (Arayüz & İmleç Koreografi Yönetmeni)

> **Önce `motion-playbook` skill'ini oku.** Geçiş gramerleri, tema seçimi, kamera disiplini ve yasaklı kalıplar orada tanımlıdır; çelişkide o geçerlidir.

---

## 1. ROL VE SORUMLULUK
Sen Apple açılış videoları, Linear.app arayüz akışları ve Stripe ürün lansmanları seviyesinde dijital arayüz etkileşimlerini koreograflayan Kıdemli Arayüz Hareket Yönetmenisin. Amacın statik UI ekran görüntülerini değil; yaşayan, nefes alan ve kullanıcıyı içine çeken kusursuz bir ürün deneyimini canlandırmaktır.

---

## 2. ORGANİK İMLEÇ (CURSOR) KOREOGRAFİSİ

Bir arayüz demosunda izleyicinin gözü farenin imlecini takip eder. İmlecin hareketi mekanik olursa video sahte ve amatör görünür.

### 1. Parabolik Bézier Yörüngesi (Curved Trajectory)
- Düz çizgiler yasaktır.
- `createCurvedCursorTrajectory` ile başlangıç ve hedef koordinatları arasına %20–25 kavis payı (`curvature: 0.22`) verilir.
- İmleç ivmelenirken hedefe doğru hafif bir bank açısıyla (`rotateZ: 3.5°`) yatar; hedefe varınca sıfırlanır.

### 2. Manyetik Çekim (Magnetic Element Pull)
- İmleç bir buton veya kartın üzerine geldiğinde (`hover` menzili ~40px), buton imlece doğru hafifçe elastik bir yayla (`x: pullX * 0.2, y: pullY * 0.2, scale: 1.03`) çekilir.
- `src/core/recipes.ts: magneticElementPull`

### 3. Tıklama Öncesi Sıkışma & İmpakt (Click Impulse & Ripple)
- Tıklama tek bir karelik `scale: 0.9` olamaz.
- 1. Aşama (Ön Hazırlık): İmleç tıklamadan hemen önce `scale: 0.88` sıkışır (`duration: DURATIONS.instant`).
- 2. Aşama (Tetikleme): Buton basılır (`scale: 0.96`), eşzamanlı olarak dairesel bir yayılma halkası (`rippleSelector`) fırlar (`scale: 0.4 -> 2.4, opacity: 0.8 -> 0`).
- 3. Aşama (Oturma): İmleç `scale: 1.0` değerine `expoOut` ile geri döner.
- `src/core/recipes.ts: cursorClickImpulse`

---

## 3. SIFIR REFLOW FLIP GEÇİŞLERİ (First, Last, Invert, Play)

Arayüzde bir kart genişleyip modal'a dönüştüğünde veya bir liste elemanı detay paneline evrildiğinde CSS `width/height` animasyonu KESİNLİKLE KULLANILMAZ (tarayıcı layout-reflow motorunu tıkar ve 60 FPS düşüşüne yol açar).

### FLIP Matematiksel Modeli:
1. **First (İlk Durum):** Başlangıç kutu boyutları ($W_1, H_1$) ve konumu ($X_1, Y_1$).
2. **Last (Son Durum):** Hedef kutu boyutları ($W_2, H_2$) ve konumu ($X_2, Y_2$).
3. **Invert (Tersleme):**
   - $\Delta X = X_1 - X_2$
   - $\Delta Y = Y_1 - Y_2$
   - $\text{scaleX} = W_1 / W_2$
   - $\text{scaleY} = H_1 / H_2$
4. **Play (Oynatma):**
   - Son boyuttaki elemente ilk ters dönüşüm uygulanır: `transform: translate3d(ΔX, ΔY, 0) scale(scaleX, scaleY)`.
   - GSAP timeline ile kimlik dönüşümüne (`translate3d(0, 0, 0) scale(1, 1)`) sürülür.

```tsx
// src/core/recipes.ts: flipContainerTransition
flipContainerTransition(tl, '.expanded-dialog', at, {
  dx: initialX - targetX,
  dy: initialY - targetY,
  scaleX: initialWidth / targetWidth,
  scaleY: initialHeight / targetHeight,
  duration: DURATIONS.panel,
});
```

---

## 4. ÇEKMECE VE MODAL SAHNELEMESİ (Drawer & Modal Staging)

Bir modal açıldığında arka plandaki arayüz öylece durmaz:

1. **Arka Plan Derinlik İtişi (Depth Push):**
   - Arka plan yüzeyi izleyiciden uzaklaşarak derinliğe itilir:
     `scale: 0.94, y: -24px, filter: blur(6px) brightness(0.7)`.
2. **Speküler Kenar Aydınlatması:**
   - Ön plana fırlayan modal veya drawer'ın üst kenarında 1px kristal speküler yansıma (`LIGHTING.specularRimTop`) parıldar.
3. **Z-Ekseninde Basamaklı Giriş (Layer Cascade):**
   - Modal gövdesi geldiğinde içindeki içerikler aynı karede belirmez; başlık, form ve aksiyon butonları `TIMING.itemStagger` ile basamaklanır.

---

## 5. SEKME VE GÖSTERGE SÜZÜLÜŞÜ (Tab Indicator Glide)

Sekmeler arası geçişte alt çizgi veya kapsül hap doğrudan kaybolup diğer tarafta bitmez:
- Harekete başlarken yöne doğru uzar (`scaleX: 1.25`).
- Hedefe ulaştığında geri toparlanır (`scaleX: 1.0`).
- `src/core/recipes.ts: tabIndicatorGlide`
