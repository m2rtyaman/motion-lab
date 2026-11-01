# Katkı ve Pull Request (PR) Rehberi — Motion Lab

Motion Lab, deterministik ve yayın kalitesinde hareket grafikleri üreten açık kaynaklı bir stüdyodur. Kod tabanının bütünlüğünü, determinizmini ve $60\text{ FPS}$ akıcılığını korumak için aşağıdaki kurallar **istisnasız** uygulanır.

---

## 🛑 1. Kural: 'main' Dalına Asla Doğrudan Push Yoktur!

**`main` dalı daima üretim seviyesinde (production-ready) ve render edilebilir durumda tutulur.**  
Doğrudan `main` dalına push atmak hem yerel git kancaları (`.githooks/pre-push`) hem de GitHub Branch Protection kuralları ile engellenmiştir.

### Standart Dal (Branch) Açma Kuralı
Tüm geliştirmeler izole bir dal üzerinden yapılmalıdır:

```bash
# Yeni bir özellik veya sahne için:
git checkout -b feat/yeni-sahne-adi

# Hata düzeltmesi için:
git checkout -b fix/duzeltme-adi

# Dokümantasyon veya kural güncellemesi için:
git checkout -b docs/guncelleme-adi
```

---

## 🌿 2. Dal İsimlendirme Sözleşmesi

Dallar yalnızca küçük harf, rakam ve tire (`-`) içerebilir:
- `feat/<proje-veya-ozellik>` (ör: `feat/octosift-commercial`, `feat/tesseract-wireframe`)
- `scene/<slug>` (ör: `scene/fintech-dashboard`)
- `fix/<hata>` (ör: `fix/audio-sync-drift`)
- `docs/<konu>` (ör: `docs/pr-guidelines`)
- `chore/<is>` (ör: `chore/deps-update`)

---

## 📝 3. Commit Mesajı Standardı (Conventional Commits)

Commit mesajları net, amacına uygun ve standart formatta olmalıdır:
- `feat(slug): yeni animasyon sahnesi veya primitif eklendi`
- `fix(core): ses senkronizasyon kayması düzeltildi`
- `perf(ast): AST tarama motoru optimize edildi`
- `docs(readme): mimari şeması ve kılavuz güncellendi`
- `chore(deps): paket güncellemeleri`

---

## 🛡️ 4. Definition of Done (DoD) & Kalite Kapıları

Bir Pull Request'in incelenmeye ve `main` dalına birleştirilmeye (merge) hazır sayılması için şu **5 kontrolün tamamlanması şarttır**:

### 1. `pnpm check` (Statik Denetimler)
Aşağıdaki tüm testler sıfır hata ile geçmelidir:
- `audit:spec`: Beat ve kamera sözleşmesi doğrulaması.
- `audit:ast`: GPU dışı animasyon (reflow yaratan `top/left/width/height` tweening) tespiti.
- `audit:slop`: Yapay zeka klişesi neon/mor-cyan parlamalar ve 18px altı mikro-font taraması.
- `audit:critic`: Prompt 10 Direktör puanlama motoru (Ölü zaman $>0.5\text{s}$, okunabilirlik süresi $<1.2\text{s}$).
- `audit:glyph`: Türkçe karakter ve UTF-8 bozulma denetimi.
- `tsc --noEmit`: Katı TypeScript tip kontrolü.

### 2. `pnpm doctor` (Stüdyo Hekimi)
14 kronik soruna karşı sağlık taraması çalıştırılır; sıfır kritik teşhis alınmalıdır.

### 3. `pnpm gate --project <slug>` (7/7 Çıkış Kapısı)
İlgili projenin 7 maddelik stüdyo çıkış kapısından 7/7 tam puan alması gerekir.

### 4. Görsel Kontak Sayfası (`visual-audit-grid.png`)
Render öncesi `pnpm render:contact-sheet --project <slug>` ile kareler çekilmiş ve direktör gözüyle incelenmiş olmalıdır.

### 5. Fiziksel Render Doğrulaması
Videonun fiziksel `.mp4` dosyasının başarıyla üretilebildiği doğrulanmalıdır:
`pnpm render:<slug>`

---

## 🚀 5. Pull Request (PR) Açma ve Birleştirme Süreci

1. Dalınızı GitHub'a pushlayın:
   ```bash
   git push origin feat/ozelliginiz
   ```
2. GitHub üzerinde bir Pull Request açın.
3. Otomatik yüklenen `.github/PULL_REQUEST_TEMPLATE.md` kontrol listesindeki maddeleri eksiksiz işaretleyin.
4. GitHub Actions CI pipeline'ının (`.github/workflows/ci.yml`) yeşil yanmasını bekleyin.
5. Kod incelemesi (Code Review) onayından sonra PR **Squash and Merge** yöntemiyle `main` dalına dahil edilir.

---

Bu kurallar, Motion Lab'i her indirildiğinde pürüzsüz çalışan, dünya standartlarında bir deterministik video stüdyosu olarak tutmamızı sağlar.
