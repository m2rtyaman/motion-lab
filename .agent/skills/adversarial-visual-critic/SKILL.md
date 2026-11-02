---
name: adversarial-visual-critic
description: Acımasız görsel denetim eleştirmeni ve anti-AI-slop tasarım yönergesi. Contact sheet paftalarını, sahne kompozisyonunu, bileşen hizalamasını, pencere çapalamasını ve motion grafik akışını sıfır toleransla denetler.
---

# ADVERSARIAL VISUAL CRITIC & ANTI-AI-SLOP DESIGN STANDARD

Bu beceri, yapay zekanın (özellikle Gemini ve LLM tabanlı kodlama ajanlarının) düştüğü tipik görsel tembellikleri, kopuk bileşen dizilimlerini, sahte kart estetiğini ve "AI-slop" çıktısını kökten kazımak için geliştirilmiş **acımasız bir görsel denetim ve sanat yönetmenliği motorudur**.

---

## 1. AI-SLOP TASARIMININ 7 ÖLÜMCÜL GÜNAHI (HALLMARKS OF AI SLOP)

Yapay zeka kendi haline bırakıldığında istisnasız şu 7 ucuz kalıbı üretir:

1. **Boşlukta Süzülen Kopuk Kartlar (Disconnected Floating Bento Slop):**
   - Ekranda birbiriyle hiçbir mimari veya hiyerarşik bağı olmayan 3-4 tane cam/metal kart uzay boşluğunda yan yana veya alt alta havada asılı durur. Bir işletim sistemi penceresi (macOS Sequoia), bir tarayıcı kabuğu veya fiziksel bir donanım kasası içine çapalanmamıştır.
2. **Kör Cyan / Mor / Zümrüt Neon Kusan Gradyanlar (Glow Vomit):**
   - Tasarıma derinlik katmayı bilmediği için her kartın arkasına ve kenarına abartılı `#38bdf8` (cyan) veya mor radyal blur (`blur-3xl`) basar. Gerçek endüstri standardı olan mikroskobik 1px speküler ışık kırılması ve CSS Subgrid kılcal çizgileri yoktur.
3. **Tekdüze PowerPoint Slayt Geçişleri (Lack of Single Container):**
   - Sahne 1 biter, her şey `opacity: 0` ile solar; Sahne 2'de bambaşka 3 kart `translateY` ile gelir. Ekranın merkezinde izleyicinin gözünün takip edebileceği tek bir dönüştürücü kap (**Single Container Morph / Graphic Anchor**) bulunmaz.
4. **Bağlamsız ve Sahte Metrik Gösterimi (Meaningless Data Redundancy):**
   - Kartların içine rastgele `142,850 ops/sec`, `+34.2% YoY` gibi gerçek ürün arayüzüyle alakasız, ezbere sayılar yazar. Üstteki pazarlama başlığı ile alttaki rozet birebir aynı kelimeleri tekrar eder (anlamsal artık-değer / redundancy).
5. **Körlemesine Koordinat Uydurma (Blind SVG Coordinates):**
   - Vektör çizerken doğrulanmış kütüphane kullanmak yerine `M10 20 C 40 50...` gibi kafadan uydurma koordinatlar yazar; ekranda yamuk, dengesiz karton kuklalar çıkar.
6. **Robotik ve Kütlesiz Hareket (Weightless Cubic-Bezier):**
   - Hareketler fiziksel ağırlık ve kütle taşımaz. Anticipation (hazırlık/büzülme) ve Overshoot (aşma ve yaylanma) eksiktir; animasyonlar sanki bir CSS keyframe slaytı gibi donuktur.
7. **Kör Onaylama Yanılsaması (Blind Approval Fallacy):**
   - Ajan ürettiği `visual-audit-grid.png` paftasına bakar; pikseller var olduğu ve dosya 500 KB olduğu için sahnenin "harika" olduğunu sanıp onaylar. Oysa bileşenler ekranın alakasız köşelerine dağılmış, dikey hiza bozulmuş ve kompozisyon çökmüştür.

---

## 2. MODERN WEB & ELİT MOTİON STANDARTLARI (LINEAR, GODLY, ORDINARY FOLK)

Awwwards, Godly.website, Linear, Raycast ve Ordinary Folk stüdyolarının temel tasarım yasaları:

### A. Subgrid Shared Borders (1px Paylaşımlı Izgara)
- Kartlar birbirinden 24px mesafede bağımsız kutular olarak durmaz. Donanım benzeri hassas kontrol panellerinde CSS Grid `gap: 1px` ile zemin ışığının kılcal olarak sızdığı yekpare bir matris kullanılır:
```css
.precision-dashboard {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1px;
  background-color: rgba(255, 255, 255, 0.08); /* 1px Kılcal Çizgi */
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
}
```

### B. Pencere ve Cihaz Çapalaması (Hardware Shell Anchor)
- Her UI parçası mutlaka tanımlı bir ana gövdenin (Window Shell) parçasıdır:
  - macOS Pencere Başlığı: `● ● ●` trafik ışıkları, adres/arama çubuğu ve sol kenar çubuğu.
  - Mobil Shell: Dynamic Island, durum çubuğu ve donanım çerçevesi.

### C. Graphic Anchor & Dual-Frame Match-Cut (Ordinary Folk Prensibi)
- Sahneler birbirine bağlanırken Sahne A'nın çıkış karesi ile Sahne B'nin giriş karesi eşlenir. Ekran merkezindeki ana nesne (ör. bir kalkan, bir buton veya arama hapı) asla yok olmaz; genişleyerek, dönerek veya şekil değiştirerek bir sonraki sahnenin ana penceresine evrilir (**Peak Velocity Morphing**).

### D. Sıfır-Artıklık (Zero Redundancy) Tipografi Kuralı
- Pazarlama başlığı ürünün sağladığı **faydayı** (örn. *"Zero-Latency Cryptographic Consistency"*), arayüz etiketleri ise arka planda çalışan **eylemi** (örn. *"Ratchet Key Exchange #4092"*) anlatır. Aynı metin veya slogan 2 farklı yerde asla tekrarlanmaz.

---

## 3. ACIMASIZ DENETİM RUBRİĞİ (RUTHLESS AUDIT PROTOCOL)

Bir görsel pafta (`visual-audit-grid.png`) incelenirken şu 5 soruya "HAYIR" cevabı veriliyorsa **RENDER ANINDA REDDEDİLİR**:

1. **Çapa Denetimi:** Bileşenler boşlukta süzülmek yerine yekpare bir pencere veya paylaşımlı ızgara içine kilitlenmiş mi? (Yoksa 3 bağımsız kart uzayda mı duruyor?)
2. **Konteyner Sürekliliği:** Sahne 1'den Sahne 2'ye geçerken en az bir grafik çapa (Graphic Anchor) kesilmeden form değiştirdi mi? (Yoksa her şey aynı anda silinip yenisi mi geldi?)
3. **Tipografi ve Negatif Alan:** Başlıklar, metrikler ve rozetler arasında net bir editoryal nefes alanı var mı? Dikey ritim (vertical rhythm) korunuyor mu?
4. **Gerçek Vektör Anatomisi:** İkonlar ve çizimler doğrulanmış endüstri standartlarında (Lucide/SimpleIcons) mı, yoksa yapay zeka uydurması kırık SVG mi?
5. **Fiziksel Kütle:** Animasyon durduğunda sahne nefes alıyor mu (`AmbientAliveDriver`) ve açılışlar gerçek yay fiziği (`SpringStaggerGroup`) ile mi gerçekleşiyor?

---

## 4. OTONOM MÜDAHALE PROTOKOLÜ

Bir ajanın görevi "dosya oluştu" diyerek teslim etmek değildir. Görsel paftayı acımasızca incelemeli; bileşenlerin dağınık, yapay zeka slop'u veya havada asılı olduğunu gördüğü an **tek bir soru sormadan Scene.tsx'i yeniden yapılandırmalıdır**.
