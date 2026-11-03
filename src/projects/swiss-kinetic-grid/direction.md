# Direction — SWISS KINETIC GRID (16:9 Widescreen)

## Tek Cümlelik Hedef
Bu videonun tek cümlelik hedefi şu: Kinetik geometri, cesur İsviçre ızgara stili ve keskin şekil patlamalarıyla kurumsal veri ve iş akışı optimizasyonunu yüksek enerjili bir düz 2D görsel şölenle anlatmak.

## Paradigm
editorial-ui (Bold Swiss Infographic / Kinetic Geometry)

## 3 Girdi Görev Ayrımı (The 3-Input Rule)
> Referans: references/MASTER_STORYBOARD_RULES.md
- **Script (Senaryo - Neyi/Niçin):** Kinetik geometri ve cesur İsviçre ızgara stiliyle kurumsal veri ve iş akışı optimizasyonunu anlatmak.
- **Storyboard (Görsel Kurgu - Nasıl Görünüyor):** Sıcak krem ve gece laciverti zeminler üzerinde 1px saç teli ızgaralar, 3 sütunlu infografik panosu ve İsviçre haçı lockup'ı.
- **Motion Reference (Hareket Dinamiği - Nasıl Hareket Ediyor):** Snappy spring ve katı İsviçre duruşlarıyla parçalanan geometrik amblem ve kesintisiz kinetik devir teslim.

## 3 Katmanlı Derinlik Mimarisi (3-Layer Depth System)
- **Katman 1 (Zemin):** Sıcak İsviçre Kremi (`#F4F4F0`) ve Derin Gece Laciverti (`#0B1120`) zemin, 1px kılcal kılavuz ızgarası.
- **Katman 2 (İkincil Derinlik & İz):** Şekillerin arkasından gelen gecikmeli hayalet konturlar (2f trailing lag) ve keskin gölgeler.
- **Katman 3 (Kahraman Ön Plan):** Keskin Geist Bold tipografi, İsviçre kırmızısı geometrik formlar ve `#the-swiss-actor` ana kahraman aktörü.

## Kahraman Aktör Yaşam Döngüsü (TheHeroActor Lifecycle)
0. kareden 720. kareye kadar kesintisiz yaşayan Ana Geometrik Aktör:
[Dairesel & Üçgen Çekirdek] ➔ [3 Sütunlu İnfografik Panosu] ➔ [3 Aşamalı Boru Hattı Matrisi] ➔ [İsviçre Haçı & Marka Kapanışı (>= 1.2s Stillness Hold)]

## Concept
1920x1080 (16:9) formatında, klasik İsviçre Tipografik Stili'ni (International Typographic Style) yüksek tempolu modern 2D vektörel hareket grafikleriyle buluşturan kurumsal tanıtım filmi.
Daireler, eşkenar üçgenler ve 45° açılı keskin çizgiler tuval üzerinde hızla çarpışıp ayrışarak modüler infografiklere, büyüme grafiklerine ve kusursuz bir veri işleme matrisine dönüşür.

## 4-Beat Ritim & Sahne Akışı
1. **Beat 1: Kinetik Başlangıç & Geometrik Kanca (f000–f160 | 2.67s):**
   - Krem zemin (`#F4F4F0`) üzerinde İsviçre kırmızısı (`#EB2D2D`) ve kobalt mavi (`#1D4ED8`) üçgenler ve daireler sahneye keskin bir ivmeyle girer. 
   - 1px kılcal ızgara ve koordinat cetvelleri (`[01.A]`) oturur.
   - SFX: `movement` (whoosh) + `click`.

2. **Beat 2: Şekil Patlaması & Düz İnfografik (f161–f380 | 3.67s):**
   - Merkezdeki geometrik çekirdek radyal olarak patlayarak 3 sütunlu flat infografik panosuna evrilir.
   - Canlı yükselen sütun grafikleri, dairesel oran halkaları ve dönen veri sayaçları (`+340% Hızlanma`).
   - SFX: `build_up` (riser) + `reveal` (impact) + `appear` (pop).

3. **Beat 3: Kurumsal İş Akışı Matrisi (f381–f550 | 2.83s):**
   - Yüksek kontrastlı lacivert zemin (`#0F172A`) bloklamasına keskin geometrik geçiş.
   - 3 aşamalı kurumsal boru hattı (Girdi -> Dönüşüm -> Teslimat) boyunca seken kılavuz üçgen vektörler ve canlı durum düğümleri.
   - SFX: `movement` + `success` + `hover_or_small_ui`.

4. **Beat 4: Marka Çözülüşü & Hero Kapanış (f551–f720 | 2.83s):**
   - Geometrik parçaların merkezde kenetlenerek kusursuz bir İsviçre haçı ve amblemine dönüşmesi.
   - Büyük harf cesur tipografi: "KUSURSUZ HASSASİYET. SINIRSIZ ÖLÇEK."
   - SFX: `reveal` (impact) + `success`.

## Physics & Easing
- `PURE_SPRING_PRESETS.SNAPPY` ($\omega=22, \zeta=0.78$) ile anında oturan, titreşimsiz çevik duruşlar.
- Kameralarda `power2.inOut` ve `expo.inOut` doğrusal olmayan ivmelenmeler.
- Sıfır elastik yaylanma; saf İsviçre mimari netliği.

## Typography & Palette
- **Yazı Tipi:** Geist Bold, Geist Mono (Koordinat ve basamaklar için). Minimum 22px okunabilirlik.
- **Renk Paleti:**
  - Zemin: Sıcak İsviçre Kremi (`#F4F4F0`) ve Derin Gece Laciverti (`#0B1120`).
  - Vurgular: İsviçre Kırmızısı (`#EB2D2D`), Zümrüt Yeşili (`#10B981`), Kobalt Mavisi (`#1D4ED8`), Siyah İnk (`#111113`).
  - Kılcal Çizgiler: 1px saç teli ızgaralar (`rgba(0,0,0,0.08)` / `rgba(255,255,255,0.12)`).
