# Direction — YOUTUBE PLAYER

## Tek Cümlelik Hedef
Bu videonun tek cümlelik hedefi şu: YouTube'un küresel marka kimliğini, gerçek arayüz anatomisini (Arama Çubuğu, İzleme Sayfası, Abone Ol butonu, Önerilenler Feed'i) kullanarak ve Sinema Modu'na (Theatre Mode) patlayan tam ekran ölçek sıçramasıyla yaşayan bir hareket grafiğine dönüştürmek.

## Paradigm
hybrid-orchestrated

## 3 Girdi Görev Ayrımı (The 3-Input Rule)
> Referans: references/MASTER_STORYBOARD_RULES.md & src/projects/youtube-player/choreography-blueprint.md
- **Script (Senaryo - Neyi/Niçin):** Dünyanın 1 numaralı video platformunda içerik keşfi: Aramadan başlayıp, zengin izleme sayfasına geçiş, ardından tam ekran sinema deneyimine patlayan cesur hareket tasarımı.
- **Storyboard (Görsel Kurgu - Nasıl Görünüyor):** 
  - Beat 1 (0–110f): Saf beyaz (#FFFFFF / #F9F9F9) YouTube tuvali. Üstte resmi YouTube Header'ı (Kırmızı logo, arama çubuğu, büyüteç, mikrofon, profil avatarı). Arama çubuğuna daktilo ile organik yazı yazılır ve kavisli imleç ilk sonuca tıklar.
  - Beat 2 (111–270f): Otantik YouTube İzleme Sayfası: 16:9 video oynatıcı, altında video başlığı, kanal adı ("Motion Lab" + rozet), "2.4M subscribers", ikonik siyah "Subscribe / Abone Ol" hap butonu, Beğen/Paylaş butonları ve sağ sütunda 3 kartlık önerilen videolar feed'i. İmleç "Theatre Mode" ikonuna tıklar.
  - Beat 3 (271–420f): Sinema Modu Patlaması (Theatre Mode Explosion): Video oynatıcı tüm ekranı dolduracak şekilde devasa bir ölçek sıçramasıyla (Peak Velocity Container Takeover) tam ekrana patlar! YouTube kırmızısı scrubber bar akar, kinetik tipografi ("EXPERIENCE BOLD MOTION") ekrana vurur.
  - Beat 4 (421–600f): Anıtsal Logo Çözülmesi: Tam ekrandan YouTube'un ikonik amblemine kusursuz bir kinetik devir teslim (TheHeroActor) ile bağlanır. YouTube Red Play butonu + YouTube logosu + "Watch Now" CTA'sı, en az 1.8s (110 kare) mutlak duraklama (Stillness Hold) ile durur.
- **Motion Reference (Hareket Dinamiği - Nasıl Hareket Ediyor):**
  - Continuous Hero Actor: Arama çubuğu $\rightarrow$ video oynatıcı $\rightarrow$ tam ekran sinema $\rightarrow$ kırmızı marka amblemine kesintisiz evrilir.
  - Anticipatory stillness (300ms) öncesi tok tıklama impulsları.
  - Sıfır çamurlu crossfade: Peak velocity container morphing ve tam ekran ölçek patlaması.

## 3 Katmanlı Derinlik Mimarisi (3-Layer Depth System)
- **Katman 1 (Zemin):** Saf aydınlık YouTube beyazı (`#FFFFFF` / `#F9F9F9`), hafif malzeme gölgeleri (`box-shadow: 0 4px 20px rgba(0,0,0,0.06)`), difüze kırmızı ortam ışıltısı.
- **Katman 2 (İkincil Derinlik & İz):** YouTube izleme sayfası bileşenleri, video kartları, sağ sütun önerilen videolar listesi, kırmızı scrubber bar izi.
- **Katman 3 (Kahraman Ön Plan):** Kristal netliğinde tipografi, resmi YouTube Play SVG amblemi (`path d="M23.498 6.186..."`), siyah "Abone Ol" butonu ve kinetik tipografi patlaması.

## Kahraman Aktör Yaşam Döngüsü (TheHeroActor Lifecycle)
`[Arama Çubuğu & Header]` ➔ `[Otantik 16:9 Video İzleme Sayfası]` ➔ `[Tam Ekran Sinema Modu Patlaması]` ➔ `[Anıtsal YouTube Logo Lockup (1.8s Stillness Hold)]`

## Typography & Palette
- **Palet:** Clean White (`#FFFFFF`), Light Canvas (`#F9F9F9`), Border Gray (`#E5E5E5`), YouTube Red (`#FF0000`), Pure Black (`#0F0F0F`), Secondary Gray (`#606060`).
- **Tipografi:** Syne & Inter Display, min 18px broadcast standardı.
