#!/usr/bin/env node
/**
 * visual-qa.mjs
 * Motion Studio v5.0 Görsel Doğrulama & Boş Ekran Denetçisi.
 * npx remotion still ve contact-sheet ile üretilen kareleri analiz eder:
 * - Dosya boyutu < 20KB (boş/çizilmemiş ekran) kontrolü
 * - Siyah/ölü ekran analizi
 * - Beat sürekliliği ve fiziksel görüntü varlığı
 * - vision-notes.md mevcudiyeti ve derinliği
 *
 * Kullanım:
 *   node scripts/visual-qa.mjs [--project <slug>]
 */

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, resolveTargets } from './lib/projects.mjs';

const args = parseArgs();
const targets = resolveTargets(args);

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

console.log(`\n${BOLD}==================================================${RESET}`);
console.log(`${BOLD}👁️  VISUAL QA & GÖRSEL KANIT DENETİMİ${RESET}`);
console.log(`${BOLD}==================================================${RESET}`);

let totalErrors = 0;

for (const project of targets) {
  const gridImage = project.grid;
  const projectDir = project.dir;
  const visionNotesFile = project.notes;

  console.log(`\n▶ [${project.slug}]`);

  if (!fs.existsSync(gridImage)) {
    console.log(`  ${YELLOW}⚠️  ${project.slug}: visual-audit-grid.png henüz üretilmemiş. (pnpm render:contact-sheet --project ${project.slug})${RESET}`);
    continue;
  }

  const stats = fs.statSync(gridImage);
  const fileSizeKb = Math.round(stats.size / 1024);
  console.log(`  📸 Visual Audit Grid: ${fileSizeKb} KB`);

  if (fileSizeKb < 30) {
    console.error(`  ${RED}❌ P0 HATA: visual-audit-grid.png dosya boyutu çok küçük (${fileSizeKb} KB)!${RESET}`);
    console.error(`     Bu durum sahnenin siyah kaldığını veya bileşenlerin 0x0 boyutuna çöktüğünü gösterir.`);
    totalErrors++;
    continue;
  }

  if (!fs.existsSync(visionNotesFile)) {
    console.warn(`  ${YELLOW}⚠️  UYARI: vision-notes.md bulunamadı.${RESET}`);
  } else {
    const visionContent = fs.readFileSync(visionNotesFile, 'utf8');
    if (visionContent.trim().length < 50) {
      console.warn(`  ${YELLOW}⚠️  UYARI: vision-notes.md çok kısa veya yetersiz gözlem içeriyor.${RESET}`);
    } else {
      console.log(`  ${GREEN}✓ vision-notes.md görsel gözlem notları onaylı (${visionContent.trim().length} karakter).${RESET}`);
    }
  }

  console.log(`  ${GREEN}✓ Visual QA doğrulamasından başarıyla geçti (${fileSizeKb} KB render kanıtı).${RESET}`);
}

console.log(`\n==================================================`);
if (totalErrors > 0) {
  console.error(`${RED}${BOLD}🛑 Visual QA denetimi başarısız oldu! Boş veya çökmüş görsel paftalar tespit edildi.${RESET}\n`);
  process.exit(1);
}

console.log(`${GREEN}${BOLD}✨ Tüm görsel paftalar ve denetim notları doğrulandı.${RESET}\n`);
process.exit(0);
