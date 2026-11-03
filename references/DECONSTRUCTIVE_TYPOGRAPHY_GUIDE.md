# STRUCTURAL DECONSTRUCTIVE KINETIC TYPOGRAPHY GUIDE
> **Kaynak:** Kinetic Typography & Structural Deconstructive Motion Playbook  
> **Temel İlke:** *"Harflere yalnızca opaklığı değişen sıradan bir metin katmanı muamelesi YAPMAYIN. Her harf uzayda hareket eden, ayrışan, birleşen ve derinliği olan bağımsız bir fiziksel grafik bileşendir."*  
> **Zamanlama Kuralı:** `Hızlı İvmelenme -> Kontrollü Seyir -> Yumuşak Yavaşlama -> Mikro Yerleşme (Tiny Settle)`

---

## 1. TEMEL YAPI VE HARF ANATOMİSİ

Bir kelime ekranda dağılırken veya birleşirken asla piksellere eriyemez, rasgele parçacıklara bölünemez veya amorf sıvılara dönüşemez. Harf, **anlamlı tipografik bileşenlere** ayrışır:

```
[TAM HARF / WORD]
       │
       ├──> [Dikey Gövdeler (Vertical Strokes)]
       ├──> [Dairesel Kavisler & Yaylar (Arcs & Curved Portions)]
       ├──> [İç Boşluklar (Counters)]
       ├──> [Yatay Çubuklar (Horizontal Bars / Crossbars)]
       └──> [İkincil Hayalet Kontur (Ghost Outline Duplicate)]
```

### Harfin Sahip Olduğu Fiziksel Eylemler
1. **Translate & Rotate:** Kendi ağırlık merkezinde veya yörüngesinde dönerek yer değiştirme.
2. **Split & Reassemble:** Başka bir harfin veya kelimenin yapı taşı olmak üzere ayrışıp yeniden kilitlenme.
3. **Ghost Outline Offset:** Ana harfin arkasında birkaç piksel gecikmeyle sürüklenen koyu yeşil kontur katmanı.
4. **Horizontal Slit Pull:** Yatay grafik çizgilerin ve blokların arasından çekilerek parçalanma.

---

## 2. ÜÇ KATMANLI DERİNLİK VE IŞIK DİSİPLİNİ

```
[ARKAPLAN]: Koyu Zümrüt Yeşili Siyah (#050706) + Taban Yansıması (Illuminated Floor)
     │
     ▼
[İKİNCİL KATMAN]: Koyu Yeşil Hayalet Konturlar (Ghost Outline / Trailing Lag)
     │
     ▼
[ÖN PLAN]: Parlak Mint Yeşili Solid Harf Parçaları (#00FFA3) + Restrained Soft Glow
```

- **Restrained Glow:** Çiğ neon kulüp aydınlatması yasaktır. Işıma yalnızca **hareket halindeki aktif harf parçalarında** ve **yeni kilitlenen kelimede** toplanır.
- **Taban Işıltısı (Floor Surface):** Kadrajın alt üçlüğünde (%75-76 Y), difüze, yatay olarak uzatılmış 1px kılcal bir yansıma çizgisi yer alır.

---

## 3. KATMANLI ZAMANLAMA (LAYERED TIMING HIERARCHY)

Tüm öğeler asla aynı anda ve aynı hızda hareket etmez:
1. **Birincil Parçalar (Primary Elements):** Hızlı, kararlı ve ilk varan gövdeler (`durationFrames * 0.85`).
2. **İkincil Konturlar (Secondary Outlines):** 2-3 kare gecikmeli (trailing lag) olarak arkadan gelen hayalet katman.
3. **Küçük Parçacıklar (Small Fragments & Punctuation):** Mikro ofsetlerle en son dönüp yerine oturan noktalar/ünlemler.
4. **Yerleşme (Tiny Settle):** Son %15'lik zaman diliminde sönümlü mikro elastik oturma.

---

## 4. 6.3 SANİYELİK 16 MİKRO-BEAT MASTER SEKANS

| Beat | Zaman | Eylem |
| :--- | :--- | :--- |
| **01** | `0.00 - 0.10s` | **Abstract Open:** Boş ekrandan başlamaz; merkezde zaten yaşayan soyut harf kümesi aktiftir. |
| **02** | `0.10 - 0.25s` | **Rapid Hello Formation:** Kademeli varışla parçalar dönerek `Hello!` kelimesini oluşturur. |
| **03** | `0.25 - 0.38s` | **Hello Distortion:** Kesme olmadan kelime dikey ve açısal olarak kayar, konturlar belirir. |
| **04** | `0.38 - 0.60s` | **Fragmented Typography:** Kelime soyut merkezi amblem formuna geri toplanır. |
| **05** | `0.60 - 0.70s` | **Reassembly:** Çok daha hızlı ve net bir şekilde yeniden `Hello!` kilitlenir. |
| **06** | `0.70 - 0.95s` | **Evolve Transform:** Parçalar doğrudan kayarak ve rotasyonla `Evolve` kelimesine evrilir. |
| **07** | `0.95 - 1.20s` | **Abstract Intermediate:** Kelimeler arası geçişte dengeli bir soyut ara durum tutulur. |
| **08** | `1.20 - 1.38s` | **Evolve Reveal:** Parçalar ortak taban çizgisine (common baseline) oturur. |
| **09** | `1.38 - 1.65s` | **Outline Offset Hold:** `Evolve` sabitlenir; arkasındaki kontur hafifçe ayrılarak derinlik verir. |
| **10** | `1.65 - 1.90s` | **Horizontal Slit Transition:** Tipografi yatay grafik çizgilerin arasından çekilerek ayrışır. |
| **11** | `1.90 - 2.15s` | **Abstract Reset:** Merkezi küme formuna dönüş. |
| **12** | `2.15 - 2.40s` | **Dark / Minimal Pause:** Görsel sistem kısılır, sahne nefes alır (Anticipatory Stillness). |
| **13** | `2.40 - 2.75s` | **Hello / Evolve Ghost:** Sol dikey eksenden `Hello!`, ardından saydam yatay kaymayla `Evolve`. |
| **14** | `2.75 - 4.80s` | **Rotational Orbit Cycle:** Kendi merkezleri etrafında dönen parçalar, ritmik ara birleşmeler. |
| **15** | `4.80 - 5.05s` | **Evolve Hero (Climax):** En temiz, en net `Evolve` merkezde kilitlenir; okunabilirlik için tutulur. |
| **16** | `5.05 - 6.30s` | **Controlled Disassembly & Fade:** Harfler tek tek ayrılarak soyut duruma döner ve kararır. |

---

## 5. ALTIN NEGATİF KURALLAR (ANTI-SLOP RESTRICTIONS)
- **Geleneksel Kesme Yasağı (No Conventional Cuts):** Her yeni durum önceki durumun fiziksel dönüşümünden doğar.
- **Metalik/Krom/Cam Yasağı:** Harflere ucuz 3D balon/metal dokusu verilemez; derinlik sadece uzamsal katman ve kontur ofsetinden gelir.
- **Yapay Zeka Deformasyonu Yasağı:** Harf bacakları yamulamaz, tipografi font ailesi çekim boyunca asla değişemez.
