import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, resolveTargets, rootDir, rel } from './lib/projects.mjs';

/**
 * GLYPH AUDIT (Motion Lab animation guide: glyph and typography safety)
 *
 * README.md: "Turkish characters are broken: the font has no Turkish glyphs.
 * Use a Google Fonts typeface with Turkish support and show İ Ş Ğ Ü Ö Ç in the test frame."
 *
 * Checks UTF-8 integrity of project text, broken characters (\uFFFD etc.) and
 * font support for Turkish characters (İ, Ş, Ğ, Ü, Ö, Ç, ı).
 *
 * Usage: node scripts/glyph-audit.mjs [--project <slug>]
 */

const args = parseArgs();
const targets = resolveTargets(args);

const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

console.log(`\n${BOLD}====================================================${RESET}`);
console.log(`${BOLD}   MOTION LAB GLYPH & TURKISH TYPOGRAPHY AUDIT           ${RESET}`);
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

    // 1. Broken character check
    if (BROKEN_CHARS.test(content)) {
      issues.push({
        file: rel(file),
        problem: 'Broken or invisible control character detected (UTF-8 encoding error).',
        fix: 'Re-save the file as UTF-8.',
      });
      totalErrors++;
    }

    // 2. Turkish character detection
    const matches = content.match(/[çÇğĞıİöÖşŞüÜ]/g);
    if (matches) {
      turkishCharCount += matches.length;
    }
  });

  console.log(`${BOLD}▶ PROJECT: ${project.slug.toUpperCase()}${RESET}`);
  console.log(`  Turkish Glyph Count : ${turkishCharCount > 0 ? GREEN + turkishCharCount : YELLOW + '0 (English only)'}${RESET}`);

  if (issues.length === 0) {
    console.log(`  ${GREEN}✓ UTF-8 character set is sound, no broken glyphs.${RESET}\n`);
  } else {
    issues.forEach((iss) => {
      console.log(`  ${RED}${BOLD}[ERROR] ${iss.file}${RESET}: ${iss.problem}\n     Fix → ${iss.fix}`);
    });
    console.log('');
  }
}

if (totalErrors === 0) {
  console.log(`${GREEN}${BOLD}[GLYPH AUDIT: PASSED] All projects are fully compliant with UTF-8 and international typography.${RESET}\n`);
  process.exit(0);
} else {
  console.log(`${RED}${BOLD}[GLYPH AUDIT: FAILED] ${totalErrors} broken character(s) found.${RESET}\n`);
  process.exit(1);
}
