# Direction — Berserker Dwarf Arena

## Paradigm
cinematic-world

## Concept
Öfkeli cüce savaşçı taş zindan arenasında koşar, ani frenle durup iki kez savaş çığlığı atar ve son anda kameraya doğru hücum eder. Ekranda hiçbir HUD, rozet ya da etiket yoktur; anlatı yalnızca karakter, mekan ve kamera ile kurulur.

## Physics
Ağır, tok bir karakter: temas anında squash (scaleX 1.09 / scaleY 0.91), adım başına parabolik zıplama, hız yönünde 7° eğim, frende anticipation (scaleY 0.86, -5°). Çığlık anında sonik şok dalgası, ekran kenarı flaşı ve kamera darbe zoom'u + kısa sarsıntı; sarsıntı sönümlenerek yerleşir (back.out darbe, power2.out yerleşme). Rampa sert, duruş keskin; yaylanma değil ağırlık hissi.

## Typography & Palette
Savaş çığlığı metni karakterin başının üstünde, geniş tracking-tighter ağır sans, karakter başına hafif jitter. Palet nötr zinc zemin, mat sıcak meşale ışığı ve yalnızca anlamsal mat renkler; neon/mor/cyan ve glow yok.
