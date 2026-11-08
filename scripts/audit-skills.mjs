#!/usr/bin/env node
/**
 * audit-skills.mjs
 * Validates the maintained skills in .agent/skills/ (harness v2).
 *
 * Per skill: SKILL.md exists, valid frontmatter (name matches folder, description says when to use it),
 * at most MAX_LINES lines, no "MANDATORY" / "supersede" language, file paths it mentions exist, and every
 * tsx/ts code sample imports only modules that exist and export the imported names, with no direct gsap.* calls,
 * Math.random or Date.now. .agent/skills-archive/ is legacy and is never read.
 */

import fs from 'node:fs';
import path from 'node:path';
import { rootDir } from './lib/projects.mjs';

const MAX_LINES = 120;
const MIN_BYTES = 500;

const REQUIRED_SKILLS = [
  { slug: 'motion-playbook', role: 'Plan and build a v2 scene: read order, beats, presets, self-check' },
  { slug: 'kinetic-type', role: 'Type-driven pieces with words, stagger, punch, maskWipe' },
  { slug: 'product-ui-motion', role: 'Product and UI demos: shells, cursor, click emphasis, readable scale' },
  { slug: 'character-animation', role: 'Weight and personality via src/core/physics.ts' },
  { slug: 'sound-design', role: 'Beat-locked sfx from public/sfx, -16 LUFS check' },
  { slug: 'asset-harvester', role: 'Keyless EdgeTTS voice timings and local B-roll' },
];

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

console.log(`\n${BOLD}==== SKILL AUDIT (${REQUIRED_SKILLS.length} maintained skills) ====${RESET}\n`);

const skillsDir = path.join(rootDir, '.agent', 'skills');
let errors = 0;
const fail = (slug, msg) => {
  errors += 1;
  console.error(`${RED}${BOLD}[ERROR]${RESET} ${slug}: ${msg}`);
};

if (!fs.existsSync(skillsDir)) {
  console.error(`${RED}${BOLD}[ERROR] .agent/skills directory not found${RESET}`);
  process.exit(1);
}

const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

const CANDIDATE_EXTS = ['', '.ts', '.tsx', '.mjs', '/index.ts', '/index.tsx'];
const resolveModule = (fromDir, spec) => {
  const base = path.resolve(fromDir, spec);
  for (const ext of CANDIDATE_EXTS) {
    const p = base + ext;
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  }
  return null;
};

/** True when `name` is exported by the module file (follows `export * from` and `export { x } from`). */
const exportsName = (file, name, seen = new Set()) => {
  if (seen.has(file)) return false;
  seen.add(file);
  const text = fs.readFileSync(file, 'utf8');
  const decl = new RegExp(`export\\s+(?:declare\\s+)?(?:async\\s+)?(?:const|let|function\\*?|class|interface|type|enum)\\s+${name}\\b`);
  if (decl.test(text)) return true;
  for (const m of text.matchAll(/export\s*(?:type\s*)?\{([^}]*)\}(?:\s*from\s*['"]([^'"]+)['"])?/g)) {
    const names = m[1].split(',').map((s) => s.trim().split(/\s+as\s+/).pop().replace(/^type\s+/, ''));
    if (names.includes(name)) return true;
  }
  for (const m of text.matchAll(/export\s*\*\s*from\s*['"]([^'"]+)['"]/g)) {
    const next = resolveModule(path.dirname(file), m[1]);
    if (next && exportsName(next, name, seen)) return true;
  }
  return false;
};

/** Code samples are written as if they live in src/projects/<slug>/Scene.tsx. */
const SAMPLE_DIR = path.join(rootDir, 'src', 'projects', 'sample');

const checkCodeBlock = (slug, code, idx) => {
  const tag = `code sample #${idx + 1}`;
  const src = stripComments(code);
  for (const m of src.matchAll(/import\s+(?:type\s+)?([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g)) {
    const [, clause, spec] = m;
    if (!spec.startsWith('.')) continue; // react, remotion, gsap
    if (/^\.\/(?!\.)/.test(spec)) continue; // own project folder
    const file = resolveModule(SAMPLE_DIR, spec);
    if (!file) {
      fail(slug, `${tag}: import '${spec}' does not resolve`);
      continue;
    }
    const named = clause.match(/\{([\s\S]*)\}/);
    if (!named) continue;
    for (const raw of named[1].split(',')) {
      const name = raw.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0];
      if (name && !exportsName(file, name)) fail(slug, `${tag}: '${name}' is not exported by ${spec}`);
    }
  }
  if (/\bgsap\.(to|from|fromTo|set|timeline)\s*\(/.test(src)) fail(slug, `${tag}: direct gsap.* call (V2-004)`);
  if (/Math\.random|Date\.now|setTimeout|setInterval/.test(src)) fail(slug, `${tag}: non-deterministic API`);
  if (/\btext-(xs|sm)\b|text-\[(?:[89]|1[0-4])px\]/.test(src)) fail(slug, `${tag}: font below 18px`);
  if (/(?:^|[^\w])(?:linear|easeInOut|ease)(?:['"])/.test(src)) fail(slug, `${tag}: forbidden ease`);
  if (/import[^;]*from\s+['"]\.\.\/\.\.\/(?:world|stage|engine|vfx|archetypes|components-v5|templates)\b/.test(src)) {
    fail(slug, `${tag}: import outside src/core and src/primitives (V2-002)`);
  }
};

const PATH_ROOTS = /^(?:docs|src|evals|scripts|references|public|\.agent|RULES\.md|README\.md)(?:\/|$)/;
const checkMentionedPaths = (slug, text) => {
  const seen = new Set();
  for (const m of text.matchAll(/`([^`\s]+)`/g)) {
    let p = m[1].replace(/[.,;:]+$/, '');
    if (!PATH_ROOTS.test(p) || /[<>*{}$]|\.\.\./.test(p) || seen.has(p)) continue;
    seen.add(p);
    if (!fs.existsSync(path.join(rootDir, p))) fail(slug, `mentioned path does not exist: ${p}`);
  }
};

for (const skill of REQUIRED_SKILLS) {
  const before = errors;
  const skillFile = path.join(skillsDir, skill.slug, 'SKILL.md');
  if (!fs.existsSync(skillFile)) {
    fail(skill.slug, `SKILL.md missing (${skill.role})`);
    continue;
  }
  const content = fs.readFileSync(skillFile, 'utf8').replace(/^﻿/, '').replace(/\r\n/g, '\n');
  const lines = content.replace(/\n$/, '').split('\n').length;
  if (Buffer.byteLength(content) < MIN_BYTES) fail(skill.slug, 'SKILL.md is too short');
  if (lines > MAX_LINES) fail(skill.slug, `SKILL.md has ${lines} lines (limit ${MAX_LINES})`);

  const fm = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm) {
    fail(skill.slug, 'missing frontmatter block');
  } else {
    const name = fm[1].match(/^name:\s*(.+)$/m)?.[1].trim();
    const desc = fm[1].match(/^description:\s*(.+)$/m)?.[1].trim();
    if (name !== skill.slug) fail(skill.slug, `frontmatter name is "${name}", expected "${skill.slug}"`);
    if (!desc) fail(skill.slug, 'frontmatter description missing');
    else {
      if (!/\buse\b/i.test(desc)) fail(skill.slug, 'description must say when to use the skill ("Use when ...")');
      if (desc.length > 600) fail(skill.slug, 'description is longer than 600 characters');
    }
  }

  if (/MANDATORY/.test(content)) fail(skill.slug, 'contains "MANDATORY"');
  if (/supersede/i.test(content)) fail(skill.slug, 'contains "supersede"');
  if (/[^\x00-\x7F]/.test(content.replace(/[–—→×≤≥]/g, ''))) {
    fail(skill.slug, 'contains non-ASCII text (skills are English only)');
  }

  checkMentionedPaths(skill.slug, content);
  [...content.matchAll(/```(?:tsx|ts)\n([\s\S]*?)```/g)].forEach((m, i) => checkCodeBlock(skill.slug, m[1], i));

  if (errors === before) {
    console.log(`${GREEN}ok${RESET}  ${skill.slug.padEnd(22)} ${String(lines).padStart(3)} lines  ${skill.role}`);
  }
}

const known = new Set(REQUIRED_SKILLS.map((s) => s.slug));
for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
  if (entry.isDirectory() && !known.has(entry.name)) {
    console.log(`${YELLOW}[warn]${RESET} .agent/skills/${entry.name} is not a maintained skill (move it to .agent/skills-archive/ or add it to audit-skills.mjs)`);
  }
}

if (errors > 0) {
  console.error(`\n${RED}${BOLD}[SKILLS FAILED] ${errors} problem(s).${RESET}\n`);
  process.exit(1);
}
console.log(`\n${GREEN}${BOLD}[SKILLS VERIFIED] ${REQUIRED_SKILLS.length} skills are well-formed and their code samples resolve.${RESET}\n`);
