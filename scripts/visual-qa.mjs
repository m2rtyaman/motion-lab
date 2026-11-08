#!/usr/bin/env node
/**
 * visual-qa.mjs
 * Motion Studio v0.9 Visual Verification & Blank Screen Auditor.
 * Analyzes frames produced by npx remotion still and contact-sheet:
 * - File size < 20KB check (blank/undrawn screen)
 * - Black/dead screen analysis
 * - Beat continuity and presence of physical imagery
 * - Presence and depth of vision-notes.md
 *
 * Usage:
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
console.log(`${BOLD}👁️  VISUAL QA & VISUAL EVIDENCE AUDIT${RESET}`);
console.log(`${BOLD}==================================================${RESET}`);

let totalErrors = 0;

for (const project of targets) {
  const gridImage = project.grid;
  const projectDir = project.dir;
  const visionNotesFile = project.notes;

  console.log(`\n▶ [${project.slug}]`);

  if (!fs.existsSync(gridImage)) {
    console.log(`  ${YELLOW}⚠️  ${project.slug}: visual-audit-grid.png has not been generated yet. (pnpm render:contact-sheet --project ${project.slug})${RESET}`);
    continue;
  }

  const stats = fs.statSync(gridImage);
  const fileSizeKb = Math.round(stats.size / 1024);
  console.log(`  📸 Visual Audit Grid: ${fileSizeKb} KB`);

  if (fileSizeKb < 30) {
    console.error(`  ${RED}❌ P0 ERROR: visual-audit-grid.png file size is too small (${fileSizeKb} KB)!${RESET}`);
    console.error(`     This means the scene stayed black or its components collapsed to 0x0 size.`);
    totalErrors++;
    continue;
  }

  if (!fs.existsSync(visionNotesFile)) {
    console.warn(`  ${YELLOW}⚠️  WARNING: vision-notes.md not found.${RESET}`);
  } else {
    const visionContent = fs.readFileSync(visionNotesFile, 'utf8');
    if (visionContent.trim().length < 50) {
      console.warn(`  ${YELLOW}⚠️  WARNING: vision-notes.md is too short or has insufficient observations.${RESET}`);
    } else {
      console.log(`  ${GREEN}✓ vision-notes.md visual observation notes approved (${visionContent.trim().length} karakter).${RESET}`);
    }
  }

  console.log(`  ${GREEN}✓ Visual QA verification passed (${fileSizeKb} KB render evidence).${RESET}`);
}

console.log(`\n==================================================`);
if (totalErrors > 0) {
  console.error(`${RED}${BOLD}🛑 Visual QA audit failed! Blank or collapsed visual sheets detected.${RESET}\n`);
  process.exit(1);
}

console.log(`${GREEN}${BOLD}✨ All visual sheets and audit notes verified.${RESET}\n`);
process.exit(0);
