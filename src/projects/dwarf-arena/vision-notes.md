# Vision notes â€” grid 4x4, kareler out/vision/manifest.json

- **run-in**: f3 cÃ¼ce sol kenarda koÅŸuya baÅŸlÄ±yor, f49 ortaya yaklaÅŸmÄ±ÅŸ, f95 frene hazÄ±rlanÄ±yor; konum ve Ã¶lÃ§ek sÃ¼rekli deÄŸiÅŸiyor (kare farkÄ± 19.3 ve 10.6), gÃ¶lge ve toz izi var, HUD yok. Karar: kabul.
- **roar-1**: f102 darbe anÄ±nda bant "KÄ°MSE YOK MUUU?!" yÃ¼zÃ¼ kapatmadan baÅŸÄ±n Ã¼stÃ¼nde, f111 ÅŸok halkalarÄ± ve Ã§izgiler aÃ§Ä±lÄ±yor, f162 yerleÅŸmiÅŸ. Kare farkÄ± 6.0 ve 17.2 (kamera sarsÄ±ntÄ±sÄ± + halkalar). Karakter kÄ±rmÄ±zÄ±: shout.png kaynak sprite'Ä±nÄ±n kendisi turuncu-kÄ±rmÄ±zÄ± (dosya aÃ§Ä±lÄ±p doÄŸrulandÄ±), kod kaynaklÄ± bir boyama DEÄÄ°L; sanatsal "Ã¶fke pozu" olarak kabul, deÄŸiÅŸtirmek iÃ§in yeni sprite gerekir.
- **depth-run**: f169 Ã¶n plandan kalkÄ±ÅŸ, f208 orta derinlik, f246 heykele varmÄ±ÅŸ ve belirgin kÃ¼Ã§Ã¼lmÃ¼ÅŸ; perspektif Ã¶lÃ§eÄŸi tutarlÄ± (fark 23.8 ve 19.5). Karar: kabul.
- **roar-2**: f253 kÃ¼Ã§Ã¼k karakterin Ã¼stÃ¼nde "NERDESÄ°NÄ°Z BE?!" bandÄ± Ã§ok kÃ¼Ã§Ã¼k (karakter kÃ¼Ã§Ã¼k olduÄŸu iÃ§in bant da kÃ¼Ã§Ã¼lmÃ¼ÅŸ), f262 ve f309 aynÄ±. Bant okunabilir ama dÃ¼ÅŸÃ¼k; mobil ekranda zayÄ±f kalabilir. Kare farkÄ± 6.4 ve 12.6. Karar: kabul, aÃ§Ä±k kalite borcu: bant boyutu karakter Ã¶lÃ§eÄŸinden baÄŸÄ±msÄ±z minimum boyuta Ã§ekilmeli.
- **charge**: f316 heykel Ã¶nÃ¼nden dÃ¶nÃ¼ÅŸ, f337 hÄ±zla yaklaÅŸÄ±yor, f357 kameraya Ã§ok yakÄ±n ve bÃ¼yÃ¼k; hareket gÃ¼Ã§lÃ¼ (fark 20.2 ve 18.3). Karakter kare alt-orta bÃ¶lgesinde, alt gÃ¼venli alana (300px) girmiyor gibi gÃ¶rÃ¼nÃ¼yor ama net Ã¶lÃ§Ã¼lmedi. Karar: kabul.

Genel: sÄ±fÄ±r HUD, kamera karakteri kadrajda tutuyor. AÃ§Ä±k borÃ§lar: roar-2 bant boyutu, shout sprite rengi (asset).
