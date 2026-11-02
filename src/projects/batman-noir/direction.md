# YÖNLENDİRME: BATMAN THE ANIMATED SERIES (DARK DECO & NOIR ROOFTOP AMBUSH)

## 1. Konsept ve Hedef
Bu sahne, Bruce Timm ve Eric Radomski'nin efsanevi *Batman: The Animated Series* (BTAS) görsel diline, "Dark Deco" mimarisine ve siyah kağıt ("black paper") üzerine boyama tekniğine sadık, yüksek kontrastlı bir sinematik 2.5D aksiyon animasyonudur.

Bu videonun tek cümlelik hedefi şu: Batman: The Animated Series'in efsanevi Dark Deco estetiğiyle Batman'in çatıda çetecileri etkisiz hale getirişini ve GCPD arama ışıklarıyla son bulan noir atmosferini sinematik 24fps el çizimi hissiyle sunmaktır.

- **Format:** 16:9 Sinematik Geniş Ekran (1920x1080), 60 FPS deterministik Remotion GSAP kurgusu.
- **Süre:** 8 Saniye (480 Kare).
- **Görsel Dil:** Saf "Dark Deco" & Alman Dışavurumculuğu chiaroscuro; ham siyah kağıt (`#080B11`) taban, derin arduvaz mavisi sis (`#1C273C`), dev fildişi dolunay (`#E6ECF8`), kör edici beyaz polis arama ışıkları ve keskin silüetler.
- **Animasyon Ruhu:** Akıcı 2D el çizimi hissi; vuruşlarda dinamik smear (leke/sünme) yayları, 2 karelik monokrom darbe parlamaları (impact frames), parabolik fırlatma ve kamerayı karartan "hood into cam" geçişi.

## 2. Storyboard Akışı (16 Panelli Orijinal Kurgu)
1. **Beat 1: `rooftop-ambush` (f000 - f095 | 1.60s):** Sisli dev dolunay altında fötr şapkalı iki çete üyesi çatı parapetinde gergin beklerken yukarıdan gelen sese dehşetle bakar. Batman dev kanat gibi açılan peleriniyle yukarıdan yırtıcı bir hızla iner ve üç nokta inişiyle çöker.
2. **Beat 2: `combat-counter` (f096 - f195 | 1.67s):** Çete üyesi savrulan geniş bir sağ yumruk sallar (beyaz smear yayıyla); Batman keskin sivri kulaklı maskesi ve parlayan beyaz üçgen gözleriyle yumruğu savuşturur, bileği kilitler ve kaburgaya sert bir karşı darbe indirir (monokrom darbe parlaması).
3. **Beat 3: `moonlit-throw-blackout` (f196 - f295 | 1.67s):** Dev dolunay önünde geniş silüet kadrajı; Batman eğimli çatı eşiğinde çete üyesini kaldırıp parabolik bir yayla doğrudan kameraya doğru fırlatır. Palto lensi tamamen kaplar ve ani bir kararışa ("FILLS SC.") sebep olur.
4. **Beat 4: `gotham-blimp-search` (f296 - f395 | 1.67s):** Alçak açı Gotham silüetine kesilir; Art Deco gökdelenlerin arasında süzülen dev GCPD polis zeplini (blimp) şehre çift konik arama ışığı saçar. Çatıda koşan silüet polis memurları ışıkların altından geçer.
5. **Beat 5: `spotlight-resolution` (f396 - f480 | 1.40s):** Dairesel arama ışığı çatı tuğlalarına odaklanır ve kilitlenir: İki çete üyesi baygın halde, sırt sırta yarasa halatıyla (bat-rope) tuğla bacaya sımsıkı bağlanmıştır.

## 3. Fizik, Easing ve Kamera Kuralları
- Kamera sabit durmaz; inişte düşey sarsıntı (`back.out(1.8)`), vuruşta yatay mikro-recoil, fırlatmada hızlı yaklaşma ve zeplinde yavaş sinematik pan uygulanır.
- Çarpışma anlarında hız rampası (speed ramping) ve smear yayları kullanılır.
- Sıfır sistem emojisi, sıfır renkli neon; tamamen orijinal Dark Deco renk paleti ve çok parçalı SVG silüetleri.
