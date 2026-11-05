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
  { slug: 'adversarial-visual-critic', role: 'Adversarial Visual Audit & Zero AI-Slop Gate' },
  { slug: 'anti-slop-auditor', role: 'Multi-Paradigm Design Critic & Broadcast Quality Gate' },
  { slug: 'anti-slop-deep-thinker', role: 'Live Web / Vector Intelligence & Mandatory Phase 0 Spatial Precomputation' },
  { slug: 'audio-motion-conductor', role: 'Music Mapping & Procedural Sound Design' },
  { slug: 'character-2d-animator', role: '2D Character Sprite Animation & 12 Animation Principles' },
  { slug: 'cinematic-vfx-director', role: 'Sonic Shockwaves, Sparks & Cinematic Visual Effects' },
  { slug: 'kinetic-type-director', role: 'Full-Screen Kinetic Typography & Rhythmic Word Bursts' },
  { slug: 'motion-choreographer', role: 'Editorial Motion & 9:16 Broadcast Safe-Zone Choreography' },
  { slug: 'motion-director', role: 'Universal Motion Engine Architecture & Direction' },
  { slug: 'motion-playbook', role: 'Single Source of Truth Motion Standards & Transition Grammar' },
  { slug: 'remotion-engineer', role: '60 FPS Deterministic Remotion & GSAP Engineering' },
  { slug: 'studio-router', role: 'Paradigm Classifier & Narrative Archetype Router' },
  { slug: 'ui-choreography-director', role: 'Apple / Linear Micro-Interactions & FLIP Container Transitions' },
  { slug: 'explainer-engaging', role: 'Single-Container (One-Take Story) & Hero Element Motion Standard' },
  { slug: 'explainer-default', role: 'Measured Clean Product Demo & Authentic UI Close-up Standard' },
  { slug: 'explainer-high-energy', role: 'Hype Teaser, Kinetic Typography & HUD Viewfinder Standard' },
  { slug: 'sound-effects', role: 'CC0 Measured Sound Design & -16 LUFS Normalization Standard' },
  { slug: 'motion-broll', role: 'Word-Synchronized B-Roll & Dynamic Template Engine' },
  { slug: 'object-separation', role: 'Video Object, Person & Product Rotoscoping Isolation Engine' },
  { slug: 'asset-harvester', role: 'API-Key-Free EdgeTTS Voice, Millisecond Word Timings & Local/Cached B-Roll Engine' },
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
  console.error(`${RED}${BOLD}[ERROR] .agent/skills directory not found!${RESET}`);
  process.exit(1);
}

for (const skill of REQUIRED_SKILLS) {
  const skillFile = path.join(skillsDir, skill.slug, 'SKILL.md');
  if (!fs.existsSync(skillFile)) {
    console.error(`${RED}${BOLD}❌ MISSING SKILL:${RESET} "${skill.slug}" not found! [${skill.role}]`);
    hasError = true;
    continue;
  }

  const content = fs.readFileSync(skillFile, 'utf8');
  if (content.trim().length < 500) {
    console.error(`${RED}${BOLD}❌ EMPTY / VIOLATED SKILL:${RESET} "${skill.slug}" is too short (${content.trim().length} bytes).`);
    hasError = true;
    continue;
  }

  const hasName = new RegExp(`^name:\\s*${skill.slug}\\b`, 'm').test(content);
  const hasDesc = /^description:\s*.+/m.test(content);

  if (!hasName || !hasDesc) {
    console.error(`${RED}${BOLD}❌ INVALID FRONTMATTER:${RESET} "${skill.slug}" (missing name or description).`);
    hasError = true;
    continue;
  }

  console.log(`${GREEN}✓ [SKILL ACTIVE]${RESET} ${skill.slug.padEnd(28)} → ${skill.role}`);
}

// Verification against AGENTS.md
const agentsMdPath = path.join(rootDir, 'AGENTS.md');

if (fs.existsSync(agentsMdPath)) {
  const agentsMd = fs.readFileSync(agentsMdPath, 'utf8');
  const missingInAgents = REQUIRED_SKILLS.filter((s) => !agentsMd.includes(s.slug));
  if (missingInAgents.length > 0) {
    console.warn(`\n${YELLOW}⚠️  Skills not referenced in AGENTS.md (${missingInAgents.length}):${RESET} ${missingInAgents.map((s) => s.slug).join(', ')}`);
  }
}

if (hasError) {
  console.error(`\n${RED}${BOLD}🛑 Skill integrity check failed! Bypassing or deleting studio skills is strictly prohibited.${RESET}\n`);
  process.exit(1);
}

console.log(`\n${GREEN}${BOLD}[SKILLS VERIFIED] All ${REQUIRED_SKILLS.length} mandatory skills are verified, intact, and active.${RESET}\n`);
process.exit(0);
