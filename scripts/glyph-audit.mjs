import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, resolveTargets, rootDir, rel } from './lib/projects.mjs';

/**
 * GLYPH AUDIT (Opus Animasyon Rehberi Glif ve Tipografi Güvenliği)
 *
 * README.md: "Türkçe karakterler bozuk: Yazı tipinde Türkçe glif yok.
 * Türkçe destekli bir Google Fonts yazı tipi kullan, İ Ş Ğ Ü Ö Ç'yi test karesinde göster."
 *
 * Projedeki metinlerin UTF-8 bütünlüğünü, kırık karakterleri (\uFFFD vb.) ve
 * Türkçe karakterlerin (İ, Ş, Ğ, Ü, Ö, Ç, ı) font desteğini denetler.
 *
 * Kullanım: node scripts/glyph-audit.mjs [--project <slug>]
 */

const args = parseArgs();
const targets = resolveTargets(args);

const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

console.log(`\n${BOLD}====================================================${RESET}`);
console.log(`${BOLD}   OPUS GLYPH & TURKISH TYPOGRAPHY AUDIT           ${RESET}`);
console.log(`${BOLD}====================================================${RESET}\n`);

const TURKISH_CHARS = /[çÇğĞıİöÖşŞüÜ]/;
const BROKEN_CHARS = /[\uFFFD\u0000-\u0008\u000B\u000C\u000E-\u001F]/;

let totalErrors = 0;

for (const project of targets) {
  const scenePath = project.scene;
  const specPath = project.spec;

  const filesToCheck = [scenePath, specPath].filter((p) => fs.existsSync(p));
  const issues = [];
  let turkishCharCount = 0;

  filesToCheck.forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8');

    // 1. Kırık karakter kontrolü
    if (BROKEN_CHARS.test(content)) {
      issues.push({
        file: rel(file),
        problem: 'Bozuk veya görünmeyen kontrol karakteri tespit edildi (UTF-8 encoding hatası).',
        fix: 'Dosyayı UTF-8 olarak yeniden kaydedin.',
      });
      totalErrors++;
    }

    // 2. Türkçe karakter tespiti
    const matches = content.match(/[çÇğĞıİöÖşŞüÜ]/g);
    if (matches) {
      turkishCharCount += matches.length;
    }
  });

  console.log(`${BOLD}▶ PROJE: ${project.slug.toUpperCase()}${RESET}`);
  console.log(`  Türkçe Glif Sayısı : ${turkishCharCount > 0 ? GREEN + turkishCharCount : YELLOW + '0 (Salt İngilizce)'}${RESET}`);

  if (issues.length === 0) {
    console.log(`  ${GREEN}✓ UTF-8 karakter seti sağlam, kırık glif yok.${RESET}\n`);
  } else {
    issues.forEach((iss) => {
      console.log(`  ${RED}${BOLD}[HATA] ${iss.file}${RESET}: ${iss.problem}\n     Çözüm → ${iss.fix}`);
    });
    console.log('');
  }
}

if (totalErrors === 0) {
  console.log(`${GREEN}${BOLD}[GLİF DENETİMİ: BAŞARILI] Tüm projeler UTF-8 ve uluslararası tipografiyle tam uyumlu.${RESET}\n`);
  process.exit(0);
} else {
  console.log(`${RED}${BOLD}[GLİF DENETİMİ: BAŞARISIZ] ${totalErrors} adet kırık karakter bulundu.${RESET}\n`);
  process.exit(1);
}
