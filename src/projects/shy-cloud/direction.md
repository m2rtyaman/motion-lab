# Direction — Shy Cloud (Utangaç Bulut)

## Hedef (Tek Cümlelik Vizyon)
Bu videonun tek cümlelik hedefi şu: Küçük sevimli bir bulutun neşeli ve göz kırpan güneşle karşılaşınca utanıp büzülerek kaçışını 12 animasyon prensibiyle anlatan sıcak bir masal dünyası yaratmak.

## Paradigm
cinematic-world (16:9, 1920x1080 @ 60 FPS)

## Concept & 4-Beat Storyboard
1. **0 - 3s (Kare 0–174 | Beat 1 - Giriş / Huzurlu Süzülüş):**
   - Ekranın solundan tatlı, sevimli beyaz bir bulut hafif dikey yaylanma ("pohpoh" nefes alma) ile sahne merkezine süzülür.
   - Yüzünde huzurlu, kapalı gözlü tatlı bir tebessüm vardır (`‿ ‿`, `◡`).
   - Kamera yumuşak bir sağa pan (`power2.out`) ile bulutun sahneye girişini karşılar.
2. **3 - 6s (Kare 175–359 | Beat 2 - Gelişme & Çatışma / Neşeli Güneş & Şaşkınlık):**
   - 3. saniyede (180f) sağ üst köşeden aniden altın sarısı neşeli Güneş kafasını uzatır (`back.out(1.6)`).
   - Güneş buluta bakıp sıcacık gülümser ve çapkınca göz kırpar (`˘ - ^`).
   - Bulut Güneş'i fark edince şaşırır; gözleri kocaman açılır, göz bebekleri parıldar ve minik bir 'o' şaşkınlığı yaşar.
   - İki karakter arasındaki bu ilk karşılaşma anında 300 ms mikro-durgunluk (anticipatory stillness) bırakılır.
3. **6 - 9s (Kare 360–534 | Beat 3 - Doruk Noktası / Utanç, Kızarma & Büzülme):**
   - Güneş'in doğrudan kendisine baktığını anlayan bulutun yanakları yumuşacık toz pembeye (`#fb7185` / `#f472b6`) döner.
   - Utancından ne yapacağını bilemez; vücudu kendi içine doğru büzülerek küçülür (Squash/shrink deformasyonu, `scale 0.78`).
   - Kamera utanan buluta sıcak bir makro yakınlaşma (`expo.out`) yapar.
4. **9 - 12s (Kare 535–720 | Beat 4 - Sonuç / Panik Kaçış, Kıkırdama & Kararma):**
   - 9. saniyede (540f) bulut kaçmadan önce geriye doğru minik bir yaylanma/ön-hazırlık (anticipation puff) yapar.
   - Pembe yanaklarıyla hızla arkasını dönüp (`scaleX(-1)`) ekranın solundan roket gibi kaçarak uzaklaşır (`expo.in` yüksek ivmelenme ve hareket çizgileri).
   - Güneş arkasından hafifçe kıkırdar (ritmik neşeli bobbing yaylanması).
   - Sahne tatlı bir gün batımı altın ışığı eşliğinde karararak masalsı bir dinginlikle sonlanır.

## 12 Animasyon Prensibi & Fizik Kararları
- **Squash & Stretch:** Bulutun süzülüşteki nefes ritmi (`scaleX: 1.04, scaleY: 0.96`), Güneş'in giriş darbesi, utanç büzülmesinde içe kapanma (`scale 0.78, squashX: 1.15`), kaçış öncesi yaylanma.
- **Anticipation (Ön Hazırlık):** 9. saniyede sola fırlamadan önce 18 karelik geriye yaslanma ve toplanma (recoil puff).
- **Staging & Durgunluk (Anticipatory Stillness):** Güneş'in göz kırpması ile bulutun kızarması arasında 350ms mikro-durgunluk ile komedi ve şirinlik ritmi vurgulanır.
- **Parabolik Yaylar (Arcs):** Bulutun yatay hareketi cetvel gibi düz değil; tatlı sinüzoidal "pohpoh" dalgalanmasıyla ilerler.
- **İşe Göre Easing:** Güneş'in çıkışında yaylı `back.out(1.6)`, kamerada yumuşak `power2.out` ve `expo.out`, kaçışta patlayıcı `power2.in`.

## Typography & Pastel Paleti
- **Sıfır HUD / Sıfır Neon:** Kesinlikle bilim kurgu telemetrisi, badge veya neon cyan/magenta parlama içermez.
- **Gökyüzü:** Sabah mavisi (`#93c5fd`), pastel masmavi (`#bae6fd`), sıcak kayısı (`#fed7aa`), sabah pembesi (`#fbcfe8`), krem (`#fef3c7`).
- **Bulut:** Saf inci beyazı (`#ffffff`), yumuşak gölge lavantası (`#e0e7ff`), tatlı toz pembe allık (`#fb7185`, `#f472b6`).
- **Güneş:** Sıcak kehribar ve bal sarısı (`#f59e0b`, `#fbbf24`), mercan yanaklar (`#f97316`), parlak neşe ışıltısı.
