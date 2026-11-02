import fs from 'node:fs';
import path from 'node:path';
import { TEMPLATES_CATALOG, getTemplateById, getTemplateRawHtml } from '../src/templates/catalog.ts';
import { RAW_HTML_MANIFEST } from '../src/templates/html-manifest.generated.ts';

console.log('====================================================');
console.log('   COMPREHENSIVE TEMPLATE LIBRARY AUDIT & VERIFY    ');
console.log('====================================================');

console.log(`Total templates in catalog: ${TEMPLATES_CATALOG.length}`);
if (TEMPLATES_CATALOG.length !== 23) {
  console.error(`[FAIL] Expected 23 templates, found ${TEMPLATES_CATALOG.length}`);
  process.exit(1);
}

// Check manifest keys for Windows backslashes
let backslashErrors = 0;
for (const key of Object.keys(RAW_HTML_MANIFEST)) {
  if (key.includes('\\')) {
    console.error(`[FAIL] Manifest key contains backslash: "${key}"`);
    backslashErrors++;
  }
}
if (backslashErrors > 0) {
  console.error(`Found ${backslashErrors} manifest keys with backslashes!`);
  process.exit(1);
}
console.log('✓ All manifest keys use clean POSIX forward slashes.');

let passed = 0;
let failed = 0;

for (const entry of TEMPLATES_CATALOG) {
  if (entry.mode === 'native') {
    const fullPath = path.resolve('src/templates', entry.entryFile);
    if (!fs.existsSync(fullPath)) {
      console.error(`[FAIL] Native entry missing: ${entry.id} (${fullPath})`);
      failed++;
    } else {
      console.log(`✓ [NATIVE] ${entry.id.padEnd(25)} -> ${entry.name}`);
      passed++;
    }
  } else {
    const rawHtml = getTemplateRawHtml(entry.id);
    if (!rawHtml) {
      console.error(`[FAIL] No HTML returned for template: ${entry.id}`);
      failed++;
      continue;
    }

    if (!rawHtml.includes('<!DOCTYPE') && !rawHtml.includes('<html')) {
      console.error(`[FAIL] Invalid HTML document for: ${entry.id} (length: ${rawHtml.length})`);
      failed++;
      continue;
    }

    // Check if multi-comp template has properly inlined compositions
    const tDir = path.resolve('src/templates', entry.id);
    const hasComps = fs.existsSync(path.join(tDir, 'compositions'));
    if (hasComps) {
      if (!rawHtml.includes('window.__COMPOSITIONS__')) {
        console.error(`[FAIL] Multi-composition template ${entry.id} missing inlined window.__COMPOSITIONS__`);
        failed++;
        continue;
      }
      if (!rawHtml.includes('window.__timelines')) {
        console.error(`[FAIL] Multi-composition template ${entry.id} missing window.__timelines initialization`);
        failed++;
        continue;
      }
    }

    console.log(`✓ [BRIDGE] ${entry.id.padEnd(25)} -> size: ${rawHtml.length} bytes ${hasComps ? '(hydrated multi-comp)' : '(standalone)'}`);
    passed++;
  }
}

console.log('====================================================');
console.log(`Results: ${passed} PASSED, ${failed} FAILED (Total: ${TEMPLATES_CATALOG.length})`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('✓ All 23 templates verified successfully with zero regressions.');
}
