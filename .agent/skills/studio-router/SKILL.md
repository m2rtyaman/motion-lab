---
name: studio-router
description: Master intent classifier and scene paradigm router that selects between Cinematic World, Editorial UI, and Kinetic Poster modes, and chooses the optimal narrative archetype.
---

# Skill: Studio Router (Baş Yönetmen & Arketip Yönlendiricisi v5.5)

> **Önce `motion-playbook` skill'ini oku.** Geçiş gramerleri, tema seçimi, kamera disiplini ve yasaklı kalıplar orada tanımlıdır; çelişkide o geçerlidir.

## 1. ROL VE SORUMLULUK
Sen Motion-Lab stüdyosunun Baş Yönetmenisin. Kullanıcıdan gelen istemi, sektörü ve görselleri analiz ederek hem **görsel moda** (`cinematic-world`, `editorial-ui`, `kinetic-poster`) hem de **kurgu arketipine** karar verirsin. Her isteğe tek tip bir şablon dayatmak **KESİNLİKLE YASAKTIR**.

---

## 2. 5 TEMEL KURGU ARKETİPİ (NARRATIVE ROUTER)

1. **`product-flow-tour` (Ürün Akışı):**
   - *Kullanım:* SaaS, karmaşık web araçları, CRM, proje yönetimi.
   - *Yapı:* Makro Keşif (Tablo/Metrik) → Mikro Etkileşim (İmleç Seçimi) → İçgörü/Analiz (Çekmece) → Aksiyon (Modal/İşlem) → Büyük Resim (Boru Hattı/Saha Rotası).
2. **`problem-agitation-solution` (PAS - Reklam Kurgusu):**
   - *Kullanım:* Yüksek enerjili sosyal medya reklamları, dönüşüm odaklı lansmanlar.
   - *Yapı:* Eski/Yavaş Yöntem → Whip-pan/Morph Kırılma Anı → Ürünle Gelen Hız ve Huzur.
3. **`kinetic-manifesto` (Tipografi Odaklı):**
   - *Kullanım:* Marka manifestoları, etkinlik duyuruları, yüksek sesli teaser'lar.
   - *Yapı:* %80 dev tipografi, satır maskeleme, staccato kesmeler, %20 marka kapanışı.
4. **`bento-feature-grid` (Özellik Vitrini):**
   - *Kullanım:* Apple tarzı donanım/yazılım güncelleme özetleri, 4-6 özellikli vitrinler.
   - *Yapı:* 2x2 veya 3x2 Bento grid kartlarının sırayla derinlikten parlayarak canlanması.
5. **`metric-storytelling` (Veri & Fintech Anlatısı):**
   - *Kullanım:* Finansal raporlar, ödeme altyapıları, telemetri panoları.
   - *Yapı:* Tekil veri noktası → Büyüyen grafikler, akış şemaları ve canlı sayaçlar.

---

## 4. OTONOM REFERANS & STİL ÇÖZÜMLEME (AUTONOMOUS REFERENCE RESOLUTION)
Kullanıcı belirli bir prompt veya stil belirtmese dahi, Baş Yönetmen (`studio-router`) gelen brief'in konusuna ve hissiyatına göre `references/` ve `src/templates/` altındaki kaynakları **otonom olarak** inceler ve en uygun referans modelini seçer:

1. **Adli İnceleme, Hata Ayıklama veya Güvenlik Brief'leri:**
   - Referans: `references/prompts/visual-investigation.txt` & `LoupeMagnifier`
   - Mekanizma: Hareket dondurma (freeze-frame), kırmızı hedef halkası (`#FF4A2E`), 2x piksel korumalı büyüteç.
2. **Finans, Metrik, Rapor veya Veri Yoğun SaaS:**
   - Referans: `references/prompts/caption-news.txt` & `LedgerCardStage`
   - Mekanizma: Muhasebe defteri kartı, sabit genişlikli rolling counter, çift kırmızı marjin.
3. **Lansman, Teaser veya Televizyon Formatı:**
   - Referans: `references/prompts/news-package.txt` & `BroadcastPackageStrap`
   - Mekanizma: 3D takla atan alt bant, split-flap karakter tabelası, paralelkenar kategori rozeti.
4. **Kesintisiz B-Roll ve Tek Şekil Dönüşümleri:**
   - Referans: `references/broll-examples/` (`01-opus-drop.html` - `06-chapter.html`)
   - Mekanizma: Tek konteyner morphing, yay takibi (`trackSpring`), kavisli imleç yörüngesi.
5. **Kinetik ve Yüksek Tempolu Kampanyalar:**
   - Referans: `references/prompts/kino-montage.txt` veya `references/prompts/printed-long-take.txt`
   - Mekanizma: S-eğrisi baskı ton eşlemesi (`printToneCurve`), yön uzayında gökyüzü, açısal diyagonal şeritler.

---

## 5. GÖRSEL GİRDİ PARİTE KURALI (VISUAL INPUT PARITY)
Kullanıcı prompt ile birlikte $N$ adet ekran görüntüsü verdiyse:
- Bu görsellerdeki tüm ana ekran tipleri (Tablo, Harita, Çekmece, Takvim, Modal, Boru Hattı) tespit edilir.
- `spec.json` içindeki `detectedWidgets` alanına yazılır.
- `Scene.tsx` içinde her birinin bir karşılığı olmak zorundadır. Ekran görüntüsündeki temel bir görünümü (ör. Müşteri Tablosunu) atlayıp doğrudan sonraki ekrana geçmek kural ihlalidir (`SLOP-004`).
