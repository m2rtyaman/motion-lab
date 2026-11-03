# ALTIN REFERANS KILAVUZU: SINGLE LIVING CONTAINER B-ROLL
**Proje:** `src/projects/single-container-broll/`  
**Referans Başlık:** Gemini 3.8 Flash / Google DeepMind Multimodal Intelligence Engine  
**Format:** 1920x1080 (16:9), 60 FPS Deterministik, 12 saniye (720 kare)  
**Tarih:** 2026-11-02  
**Görsel Kanıt:** `out/single-container-broll/visual-audit-grid.png`  
**Nihai Video:** `out/single-container-broll/single-container-broll.mp4`

---

## 1. BU PROJEDEN ÖĞRENDİKLERİMİZ: NEDEN BAŞARILI OLDUK?

Geçmişteki denemeler neden "PowerPoint slaytı gibi" hissettirirken, bu proje neden Apple / Linear / Stripe kalitesinde gerçek bir B-roll başyapıtına dönüştü? Başarının 6 temel direği:

### 1. Kör Linter Zorlamalarından Kurtulup Tasarım Özgürlüğü Tanımak
- **Önceki Hata:** Linter'lar *"sahnede kamera hareketi olmak zorunda"* kuralını körce dayattığı için, 2D düz bir vektör sahnesinde kamera sarhoş gibi sağa-sola sendeleyip duruyordu. Ayrıca *"okunabilir başlık şartı"* yüzünden ekranın en üstüne ve en altına `OPUS MOTION LAB // 60 FPS` gibi çirkin debug damgaları basılıyordu.
- **Başarı Faktörü:** Tek yaşayan kap odaklı sahnelerde yapay x/y kamera sallantısını kaldırdık. Bunun yerine konteynerin form değişimlerine tepki veren akıcı (liquid) bir derinlik kamerası kurguladık: Geniş pencereye açılırken geri çekilen (scale: 1.06 -> 1.0), dar slider'a dönüşürken etkileşime yaklaşan (scale: 1.0 -> 1.05) tok ve pürüzsüz yay fiziği (damping: 24, stiffness: 120).

### 2. Slayt Destesi (Slide Stack / Crossfade) Yerine Tek Yaşayan Kap (Single Living Container)
- **Önceki Hata:** Sahneler arası geçişi ayrı `absolute inset-0` div'lerini `opacity: [1, 0]` ile birbirine eriterek simüle etmek (slayt mantığı).
- **Başarı Faktörü:** Ekranda 0. kareden 720. kareye kadar **fiziksel olarak tek bir DOM elemanı (`#the-morph-container`)** yaşadı. Bu eleman genişliğini, yüksekliğini, köşe yuvarlaklığını (`borderRadius`), arka plan rengini ve gölgesini yay fiziğiyle (`dampedSpring` ve GSAP `back.out`) kesintisiz dönüştürdü:
  $$\text{Kapsül }(500 \times 104, r=52) \longrightarrow \text{Terminal }(940 \times 480, r=24) \longrightarrow \text{Sürgü }(880 \times 120, r=60) \longrightarrow \text{Telemetri }(960 \times 480, r=28)$$
  Göz nesneyi takip ettiği için izleyici hiçbir sahnede kopmadı, akış hipnotize edici bir akıcılığa kavuştu.

### 3. Didaktik Meta-Metin Yasağı (Sıfır Açıklama / Sıfır Süs Jargon)
- **Önceki Hata:** Animasyonda ne yaptığını ekrana metin olarak yazmak (*"Kinetik Geometri", "Uluslararası Tipografik Stil", "Form Sürekliliği, Rijit Izgara"*). Bu durum videoyu anında yapay zeka tarafından üretilmiş ucuz bir infografiğe çeviriyordu.
- **Başarı Faktörü:** Hareketi anlatmayı bıraktık, hareketi **yaşattık**. Metinler sadece gerçek, somut ve otantik ürün verisine dönüştü:
  - `Gemini 3.8 Flash` + `Flash Live`
  - Gerçek `@google/genai` TypeScript SDK kod akışı (`gemini-3.8-flash`)
  - `Low`, `Medium`, `High`, `Argon` model güç kademeleri
  - `MULTIMODAL REASONING 99.4%`, `TIME TO FIRST TOKEN 12 ms`

### 4. Matematiksel İmleç Fiziği (Gerçek Kübik Bézier & Hotspot Kilidi)
- **Önceki Hata:** İmleci düz çizgilerle uçurmak veya `<CameraRig>` içindeki ofsetli koordinatlara koyup imlecin boşlukta sürüklenmesine sebep olmak.
- **Başarı Faktörü:**
  - İmleç kök tuval koordinatlarına alındı.
  - Hareketler $B(t) = (1-t)^3 P_0 + 3(1-t)^2 t P_1 + 3(1-t) t^2 P_2 + t^3 P_3$ kübik Bézier parametrik fonksiyonu üzerinden çalıştı.
  - Kamera derinlik ölçeği hesaba katılarak imlecin tıklama ucu $(0, 0)$, **`Flash Live`** butonunun merkezine ve sürgü düğmelerine pikselleriyle kilitlendi; öncesinde mikro-yavaşlama (anticipation) ve tıklamada `scale: 0.88` ezilme (squash) ile organik insan eli hissi verildi.

### 5. Layout Bütçesi ve Tipografik Nefes Alanı (Whitespace Disiplini)
- **Önceki Hata:** 440px'lik dar bir kapsülün içine 500px'den fazla metin (`Autonomous Synthesis Engine` + ikon + rozet) tıkıştırmaya çalışıp CSS'i patlatmak.
- **Başarı Faktörü:** 500px genişlikte tek satırda kusursuz oturan, bol nefes alan, cömert iç boşluklu (padding) bir hiyerarşi kuruldu. Hiçbir metin kırılmadı veya sıkışmadı.

### 6. Görsel Öz-Denetim (Contact Sheet ile Piksel Düzeyinde İnceleme)
- **Başarı Faktörü:** Kodun "çalışması" ile "güzel görünmesi" arasındaki farkı kapattık. Üretilen 12 karelik pafta (`visual-audit-grid.png`) incelendi; sürgüdeki geçişler, imlecin hotspot hassasiyeti ve köşe damgaları görsel paftadan yakalanarak anında doğrulandı.

---

## 2. SAHNE ANATOMİSİ VE KOD ŞABLONU

### Temel Konteyner Mimarisi (`Scene.tsx`)
```tsx
// 1. Reaktif dinamik derinlik kamerası (form morphing'e bağlı sıvı scale, sıfır x/y wobble)
<SpotlightStage aspect="16:9" background="#EAE8E3" clean={true} showCrosshairs={false}>
  <CameraRig className="camera-rig">
    {/* Yalnızca tek bir ana konteyner */}
    <div
      id="the-morph-container"
      style={{
        width: 500,
        height: 104,
        borderRadius: 52,
        backgroundColor: '#0B0F19', // Gemini Deep Celestial
        boxShadow: '0 24px 60px -12px rgba(11, 15, 25, 0.4), 0 0 0 1px rgba(66, 133, 244, 0.1)',
        willChange: 'width, height, border-radius, background-color, transform',
      }}
    >
      {/* Katmanlar unmount EDİLMEZ, konteyner içinde pürüzsüzce devir teslim yapılır */}
      <div className="stage-layer-1 absolute inset-0 ...">...</div>
      <div className="stage-layer-2 absolute inset-0 opacity-0 ...">...</div>
      <div className="stage-layer-3 absolute inset-0 opacity-0 ...">...</div>
      <div className="stage-layer-4 absolute inset-0 opacity-0 ...">...</div>
    </div>
  </CameraRig>

  {/* İmleç kök tuvalde yaşar, ofsetlerden bağımsız mutlak koordinatları hedefler */}
  <div className="simulated-cursor absolute ...">
    <MacOSCursor type="pointer" size={34} />
  </div>
</SpotlightStage>
```

---

## 3. GELECEK PROJELER İÇİN ALTIN KURALLAR (CHECKLIST)

1. [ ] **Kamera Sadece İhtiyaç Duyulduğunda Hareket Eder:** 2D UI / B-Roll sahnelerinde kamerayı yapay olarak sallama; sadece konteyner morph'larına tepki veren reaktif derinlik (scale) kullan.
2. [ ] **Köşe Damgası Yasağı:** Ekranın kenarlarına "OPUS MOTION LAB / 60 FPS" gibi şirket içi debug yazıları ASLA koyma.
3. [ ] **Tek Yaşayan Kap İlkesi:** UI geçişlerinde yeni div açıp eskisini fade ile silme; aynı kabı morph ettir.
4. [ ] **Gerçek Veri ve Kod Kullan:** Asla sahte DevOps terimleri uydurma; gerçek kütüphaneler (`@google/genai`) ve modeller (`gemini-3.8-flash`) kullan.
5. [ ] **İmleç Hotspot'u Test Edilmelidir:** İmlecin ucu tıklanan elemanın sınırları içine düşüyor mu?
6. [ ] **Render Öncesi Pafta Denetimi:** `visual-audit-grid.png` paftasına gözle bakmadan hiçbir işi "tamamlandı" sayma.
