# SCULPTURAL MOTION REEL MASTER GUIDE
> **Kaynak:** Build a Motion-Graphics Reel with Gemini Omni Flash  
> **Temel İlke:** *"Referansın konusunu değil; 1-1.5 saniyelik beat ritmini, heykelimsi 3D nesneler arasındaki kesintisiz geçiş mantığını (match cuts) ve 10 saniyelik kurgu haritasını kullanın."*  
> **Handoff Frame Kuralı:** *"20 saniyelik videolarda ilk 10 saniyenin son karesi, ikinci 10 saniyenin başlangıç görsel çapası yapılır; kamera vektörü aynı yönde kesintisiz sürdürülür."*

---

## 1. GÖRSEL DÜNYA VE PALET SİSTEMİ

- **Bol Negatif Alanlı Koyu Zemin:** `#060709` tabanlı koyu obsidyen siyahı ve derin menekşe moru (`#4A154B`) radyal atmosfer.
- **Pahlı Metalik Formlar:** Şampanya altını (`#F5D77F`) ve parlak bronz pahlarla bezenmiş pürüzsüz heykelsi yüzeyler.
- **Doygun Renk Harmanı:** Macenta (`#E01E5A`), mercan (`#FF6F59`), krem (`#FFF5EA`) ve şampanya altınından oluşan zengin degrade geçişleri.
- **Kılcal Vurgular:** 1px beyaz/gümüş çerçeve geometrisi ve kontrollü speküler ışık yansımaları (`rotating glints`).

---

## 2. 10 SANİYELİK (10-BEAT) KURSÖRLÜ ZAMAN HARİTASI

| Zaman | Beat Başlığı | Storyboard & Remotion Eylemi |
| :--- | :--- | :--- |
| **0–1s** | **Hero Silhouette Enter** | Sahneyi güçlü bir silüete sahip tek bir kahraman nesneyle kur (`ChampagneBeveledRing`). |
| **1–2s** | **Material & Depth Reveal** | Malzemenin altın/metal dokusunu ve yönlü hareketini göster; formlar dönerek ayrışır. |
| **2–3s** | **Diagonal Colored Sweep** | Ürünün kendi formlarıyla çapraz bir renk süpürmesi yap (`DiagonalGradientSweep`). |
| **3–4s** | **Layered Core Assembly** | Sıcak parlayan bir çekirdek etrafında net ön plan/arka plan katman ayrımı kur. |
| **4–5s** | **Framed Icon / Tile** | Önceki formları tek bir ince çerçeveli ambleme veya UI karesine dönüştür. |
| **5–6s** | **Concentric Macro Pulse** | Siyah zeminde iç içe konsantrik halkaların makro ölçekte nabız gibi atması. |
| **6–7s** | **Perspective Cascade** | Kontrollü gölgelerle 3D derinlikli hızlı bir disk dizilimi açığa çıkar (`PerspectiveDiscCascade`). |
| **7–8s** | **Dense Hero Stacking** | Mobilde dahi net okunacak yoğun bir disk yerleşimi oluştur; dönüp yerine otursun. |
| **8–9s** | **Palette Grid Reset** | Kapanıştan önce gözü dinlendiren düzenli bir renk paleti / ızgara düzenine geç (`PaletteGridReset`). |
| **9–10s** | **Circular Payoff Close-up** | Unutulmaz bir makro dairesel yakın planla (lens / göz yansıması) bitir ve temizce kes. |

---

## 3. 20 SANİYELİK ÇOKLU KLİP DEVİR TESLİMİ (THE HANDOFF FRAME PROTOCOL)

Video AI modelleri ve karmaşık Remotion sahneleri uzun sürelerde tutarlılık kaybı yaşayabilir:
1. Video iki bağımsız bloğa ayrılır: `0–10s` ve `10–20s`.
2. **Kritik Handoff Kuralı:** İlk 10 saniyenin **en son karesi (frame 600 @ 60 FPS)**, ikinci bloğun başlangıç karesi (frame 0) olarak kilitlenir.
3. **Kamera Vektörü Devamı:** İlk blokta kamera sağa pan / push-in yapıyorsa, ikinci blok tam aynı hız ve açıyla hareketi sürdürür.
4. İki klip birleştiğinde izleyici aradaki dikişi asla fark etmez.

---

## 4. DİKEY (9:16) STORYBOARD KONTROL LİSTESİ

- [x] **Dikey Güvenli Alan:** Önemli nesneler ekranın aşırı kenarlarından uzakta (safe-zone).
- [x] **Kare Başına Tek Eylem:** Her kare tek bir görsel aksiyona odaklanmalı ve sonrakine doğal akmalı.
- [x] **Gerçekçi Tasarım:** Yapay zekaya detay uydurtmayın; gerçek grafik ve nesneleri storyboard'da açıkça çizin.
- [x] **Temiz Tipografi:** Logolar ve metinler sade, net ve yayın ölçeğinde (min 18px).
