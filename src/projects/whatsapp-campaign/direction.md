# YÖNLENDİRME: WHATSAPP ÇOKLU CİHAZ & KESİNTİSİZ İLETİŞİM (12s / 720 Kare @ 60 FPS)

## 1. Konsept ve Hedef
Bu video, WhatsApp'ın telefonun şarjı bitmiş olsa bile bilgisayarda bağımsız çalışan çoklu cihaz (Multi-Device) mimarisini, uçtan uca şifreli mesajlaşmasını ve 32 kişilik grup aramasını anlatan, Apple ve Linear tarzında, temiz, ferah ve ölçülü bir motion graphic filmidir.

Bu videonun tek cümlelik hedefi şu: WhatsApp telefonunuz kapalıyken bile masaüstünde ve tüm cihazlarınızda şifreli, organize ve kesintisiz iletişim sağlar.

- **Format:** 9:16 Dikey (1080x1920), 60 FPS deterministik Remotion kurgusu.
- **Süre:** 12 Saniye (720 Kare).
- **Tasarım Dili:** Ferah iOS / WhatsApp açık tema tuvali (`#F8F9FA`), Geist tipografisi, 1px kılcal ızgara ve gerçek WhatsApp UI bileşenleri.
- **Sıfır AI Slop:** Sahte DevOps telemetrisi yok, mor/cyan neon glow yok, sistem emojisi yok. Gerçekçi arayüz akışı ve CC0 ölçülü ses efektleri.

## 2. 5-Beat Zaman Çizelgesi
1. **Beat 1: Telefon Şarjı Tükenişi (f000–f090 | 1.5s):**
   - iPhone titanyum çerçevesi içinde WhatsApp sohbeti.
   - Pil göstergesi kırmızıya dönüp %1 seviyesine iner ve ekran uykuya geçer.
   - Kamera telefonun üzerinden yukarı süzülmeye başlar.
   - SFX: `hover_or_small_ui` (hafif klik ve kapanış).

2. **Beat 2: Masaüstü WhatsApp Web Açılışı (f091–f250 | 2.65s):**
   - Kamera kesintisiz biçimde dizüstü bilgisayara süzülür (`DeviceMockupStage desktop`).
   - WhatsApp Web arayüzü telefon bağlantısına ihtiyaç duymadan anında eşitlenir ("Telefonunuz kapalıyken bile bağlı").
   - SFX: `movement` (whoosh) + `appear` (pop).

3. **Beat 3: Gerçekçi Mesaj İletimi & Çift Mavi Tik (f251–f420 | 2.83s):**
   - Gerçek sohbet penceresinde daktilo yazım animasyonu: "Yarınki lansman sunumu hazır mı?".
   - Mesaj gönderilir ve anında çift mavi tike (`✓✓`) döner.
   - SFX: `typing` (klavye yazma sesi) + `click` + `success` (çift tik onay sesi).

4. **Beat 4: Uçtan Uca Şifreli Grup Araması (f421–f580 | 2.65s):**
   - Masaüstü penceresi genişleyerek 32 kişilik grup araması kartına evrilir (`ParticipantStudioTile`).
   - Canlı yeşil ses frekans dalgaları konuşma esnasında hareket eder.
   - Rozet: "Uçtan Uca Şifreli Ses & Video".
   - SFX: `appear` + `hover_or_small_ui`.

5. **Beat 5: Marka Çözülüşü & Outro (f581–f720 | 2.33s):**
   - Kamera yumuşak bir `expo.out` ile geri çekilir.
   - Ortada resmi zümrüt yeşili WhatsApp vektör amblemi belirir.
   - Net ve sakin pazarlama başlığı: "Daima bağlı. Uçtan uca şifreli."
   - SFX: `reveal` (impact) + `build_up` (subtle chime).
