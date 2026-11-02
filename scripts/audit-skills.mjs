#!/usr/bin/env node
/**
 * audit-skills.mjs
 * Stüdyo Beceri Denetçisi & Zorunluluk Güvencesi (Anti-Shortcut & Skill Integrity Gate).
 * Tüm .agent/skills/ becerilerinin eksiksiz, sağlam ve zorunlu kılındığını doğrular.
 * Yapay zekanın becerileri bypass etmesini, silmesini veya tembel yollara sapmasını kesin olarak engeller.
 */

import fs from 'node:fs';
import path from 'node:path';
import { rootDir } from './lib/projects.mjs';

const REQUIRED_SKILLS = [
  { slug: 'adversarial-visual-critic', role: 'Acımasız Görsel Denetim & Sıfır AI-Slop Standardı' },
  { slug: 'anti-slop-auditor', role: 'Çok Paradigmalı Tasarım Eleştirmeni & Yayın Kalite Kapısı' },
  { slug: 'anti-slop-deep-thinker', role: 'Canlı Web / Vektör İstihbaratı & Zorunlu Faz 0 Ön-Hesaplama' },
  { slug: 'audio-motion-conductor', role: 'Müzik Haritası & Prosedürel Ses Tasarımı' },
  { slug: 'character-2d-animator', role: '2D Karakter Sprite Animasyonu & 12 Animasyon Prensibi' },
  { slug: 'cinematic-vfx-director', role: 'Sonik Şok Dalgaları, Kıvılcım & Sinematik Görsel Efektler' },
  { slug: 'kinetic-type-director', role: 'Tam Ekran Kinetik Tipografi & Ritmik Kelime Patlamaları' },
  { slug: 'motion-choreographer', role: 'Editoryal Hareket & 9:16 Güvenli Alan Koreografisi' },
  { slug: 'motion-director', role: 'Evrensel Hareket Motoru Yönetimi' },
  { slug: 'motion-octosift-saas', role: 'B2B SaaS Ticari Ürün Grameri' },
  { slug: 'motion-playbook', role: 'Hareket Grafiği Tek Doğruluk Kaynağı & Geçiş Grameri' },
  { slug: 'remotion-engineer', role: '60 FPS Deterministik Remotion & GSAP Mühendisliği' },
  { slug: 'studio-router', role: 'Paradigma Sınıflandırıcısı & Anlatı Arketipi Yönlendiricisi' },
  { slug: 'ui-choreography-director', role: 'Apple / Linear Mikro-Etkileşim & FLIP Konteyner Geçişleri' },
  { slug: 'explainer-engaging', role: 'Tek Kap (One-Take Story) & Hero Element Hareket Standardı' },
  { slug: 'explainer-default', role: 'Ölçülü Temiz Ürün Demosu & Gerçek UI Yakın Çekim Standardı' },
  { slug: 'explainer-high-energy', role: 'Hype Teaser, Kinetik Tipografi & HUD Viewfinder Standardı' },
  { slug: 'sound-effects', role: 'CC0 Ölçülü Ses Tasarımı & -16 LUFS Normalizasyon Standardı' },
  { slug: 'motion-broll', role: 'Kelimeye Senkronize B-Roll ve Dinamik Şablon Motoru' },
  { slug: 'object-separation', role: 'Video Nesne, İnsan ve Ürün Ayrıştırma Motoru' },
];

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

console.log(`\n${BOLD}====================================================${RESET}`);
console.log(`${BOLD}   MANDATORY SKILLS INTEGRITY & ENFORCEMENT GATE    ${RESET}`);
console.log(`${BOLD}====================================================${RESET}\n`);

const skillsDir = path.join(rootDir, '.agent', 'skills');
let hasError = false;

if (!fs.existsSync(skillsDir)) {
  console.error(`${RED}${BOLD}[HATA] .agent/skills dizini bulunamadı!${RESET}`);
  process.exit(1);
}

for (const skill of REQUIRED_SKILLS) {
  const skillFile = path.join(skillsDir, skill.slug, 'SKILL.md');
  if (!fs.existsSync(skillFile)) {
    console.error(`${RED}${BOLD}❌ EKSİK BECERİ:${RESET} "${skill.slug}" bulunamadı! [${skill.role}]`);
    hasError = true;
    continue;
  }

  const content = fs.readFileSync(skillFile, 'utf8');
  if (content.trim().length < 500) {
    console.error(`${RED}${BOLD}❌ İÇERİKSİZ / İHLAL EDİLMİŞ BECERİ:${RESET} "${skill.slug}" çok kısa (${content.trim().length} bayt).`);
    hasError = true;
    continue;
  }

  const hasName = new RegExp(`^name:\\s*${skill.slug}\\b`, 'm').test(content);
  const hasDesc = /^description:\s*.+/m.test(content);

  if (!hasName || !hasDesc) {
    console.error(`${RED}${BOLD}❌ GEÇERSİZ FRONTMATTER:${RESET} "${skill.slug}" (name veya description eksik).`);
    hasError = true;
    continue;
  }

  console.log(`${GREEN}✓ [BECERİ AKTİF]${RESET} ${skill.slug.padEnd(28)} → ${skill.role}`);
}

// AGENTS.md ve .cursorrules içinde zorunlu referans denetimi
const agentsMdPath = path.join(rootDir, 'AGENTS.md');
const cursorrulesPath = path.join(rootDir, '.cursorrules');

if (fs.existsSync(agentsMdPath)) {
  const agentsMd = fs.readFileSync(agentsMdPath, 'utf8');
  const missingInAgents = REQUIRED_SKILLS.filter((s) => !agentsMd.includes(s.slug));
  if (missingInAgents.length > 0) {
    console.warn(`\n${YELLOW}⚠️  AGENTS.md içinde adı geçmeyen beceriler (${missingInAgents.length}):${RESET} ${missingInAgents.map((s) => s.slug).join(', ')}`);
  }
}

if (hasError) {
  console.error(`\n${RED}${BOLD}🛑 Beceri bütünlüğü denetimi başarısız! Yapay zekanın becerileri bypass etmesine izin verilmez.${RESET}\n`);
  process.exit(1);
}

console.log(`\n${GREEN}${BOLD}[BECERİLER TAMAM] ${REQUIRED_SKILLS.length} zorunlu becerinin tümü yerinde, sağlam ve aktif.${RESET}\n`);
process.exit(0);
