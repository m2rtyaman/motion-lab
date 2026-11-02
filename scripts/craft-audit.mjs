#!/usr/bin/env node
/**
 * craft-audit.mjs
 * Motion Studio v5.0 Görsel İşçilik & Determinizm Denetçisi.
 * Kör koordinat sallama, harf avatarları, linear easing, bozuk Three.js saatleri,
 * çapasız 3D kartlar, kopuk bento slop'u ve metin artıklığını denetler.
 *
 * Kullanım:
 *   node scripts/craft-audit.mjs [--project <slug>]
 */

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, resolveTargets, rootDir } from './lib/projects.mjs';

const args = parseArgs();
const targets = resolveTargets(args);

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

console.log(`\n${BOLD}==================================================${RESET}`);
console.log(`${BOLD}🎨 CRAFT AUDIT & ADVERSARIAL VISUAL GATE (v5.0)${RESET}`);
console.log(`${BOLD}==================================================${RESET}`);

let totalErrors = 0;
let totalWarnings = 0;

for (const project of targets) {
  const sceneFile = project.scene;
  const specFile = project.spec;

  if (!fs.existsSync(sceneFile)) continue;

  const code = fs.readFileSync(sceneFile, 'utf8');
  const spec = fs.existsSync(specFile) ? JSON.parse(fs.readFileSync(specFile, 'utf8').replace(/^\uFEFF/, '')) : {};
  const isLegacy = spec.legacy === true;

  const errors = [];
  const warnings = [];

  // 1. Harf Avatarı Yasağı (>SY<, >KA< gibi tembel iki harfli avatarlar)
  const initialsAvatarRegex = />[A-Z]{2}</g;
  if (initialsAvatarRegex.test(code)) {
    errors.push('P0: Tembel iki büyük harfli avatar tespit edildi (>SY< vb.). VectorAvatarPortrait kullanılmalı.');
  }

  // 2. Linear & Yasak Easing Denetimi
  if (/ease\s*:\s*["']linear["']/i.test(code)) {
    errors.push('P0: Animasyonlarda yasaklı "linear" easing bulundu! SpringStaggerGroup veya power3.out kullanılmalı.');
  }
  if (/ease\s*:\s*["']easeInOut["']/i.test(code) || /ease\s*:\s*["']ease\.inOut["']/i.test(code)) {
    warnings.push('P1: Standart "easeInOut" tespit edildi. Doğal hareketler için yay fiziği (spring) veya expo.inOut tercih edilmeli.');
  }

  // 3. Three.js Determinizm Denetimi
  if (/clock\.getElapsedTime\(\)/.test(code) || /useFrame\s*\(\s*\([^)]*\)\s*=>[^}]*\+=\s*delta/.test(code)) {
    errors.push('P0: Three.js sahnesinde determinizmi bozan clock/delta kullanımı bulundu! Remotion useCurrentFrame() kullanılmalı.');
  }

  // 4. Doğrudan Ham/Kör SVG Poligon Koordinatı Uydurma Denetimi
  const longRawSvgPath = /<path[^>]+d=["'][MC][^"']{120,}["']/g;
  const hasVectorImport = /from\s+["'].*\/assets\/vectors/i.test(code) || /from\s+["'].*\/procedural/i.test(code);
  if (longRawSvgPath.test(code) && !hasVectorImport) {
    warnings.push('P1: Scene.tsx içinde uzun serbest el SVG koordinatları tespit edildi. Kör koordinat sallamak yerine VerifiedVectorLibrary veya ParametricCurves kullanılmalı.');
  }

  // 5. Statik Sahne / Ölü Kare Kontrolü
  const hasAliveMotion =
    /AmbientAliveDriver/.test(code) ||
    /useSecondaryMotion/.test(code) ||
    /Math\.sin\s*\(\s*frame/.test(code) ||
    /microPulse/.test(code) ||
    /TemplateFrame/.test(code);

  if (!hasAliveMotion && !isLegacy && spec.mode === 'editorial-ui') {
    warnings.push('P1: Sahnede sürekli yaşayan mikro-hareket bulunamadı. Metin okuma aralarında AmbientAliveDriver veya sin(frame) kullanılmalı.');
  }

  // 6. Pencere ve Cihaz Çapalaması (Hardware Shell Anchor - Disconnected Floating Bento Ban)
  const hasUIComponents = /ParticipantStudioTile|TelemetryBentoCard|EncryptedChatStream|MetricCardRow|BentoCard|SpecularCard|MetricTelemetryCard|EditorialDialogueCard|PipelineTerminalCard|SplitComparisonCard/.test(code);
  const hasShellAnchor = /PrecisionDashboardShell|DeviceMockupStage|MacOSSequoiaWindow|BrowserFrame|AppShell|SpotlightStage|VirtualCanvas|WorldStage/.test(code);

  if (hasUIComponents && !hasShellAnchor) {
    errors.push('P0: Boşlukta süzülen kopuk kartlar (Disconnected Floating Bento Slop) tespit edildi! UI bileşenleri bir Hardware Shell / Window Anchor (PrecisionDashboardShell, DeviceMockupStage, MacOSSequoiaWindow) veya tanımlı bir sahne kabuğu içine kilitlenmelidir.');
  }

  // 7. Tek Kap Morfolojisi / Graphic Anchor Geçiş Denetimi
  const hasContainerMorph = /transition(ContainerMorph|WhipPan|MaskWipe|ZoomPunch)|GraphicAnchor|morphProgress|containerMorph|BrowserFrame|SpotlightStage|BackdropField/.test(code);
  if (spec.mode === 'editorial-ui' && !isLegacy && !hasContainerMorph) {
    errors.push('P0: Tek Kap Morfolojisi / Graphic Anchor geçişi eksik! Sahneler arası kopuk slayt geçişi yerine tek kap morfolojisi (transitionContainerMorph veya Graphic Anchor) zorunludur.');
  }

  // 8. 3D Boşlukta Çapasız Yüzme Yasağı (Unanchored in 3D Space)
  const has3DStage = /LayeredStage3D|LayerPlane/.test(code);
  if (has3DStage && hasUIComponents && !hasShellAnchor) {
    errors.push('P0: 3D sahnede boşlukta süzülen çapasız bileşenler tespit edildi! Kartlar bir Hardware Shell veya PrecisionDashboardShell içine yerleştirilmelidir.');
  }

  // 8b. 3D Katmanda Doğrudan Çapasız UI Elemanı Süzülmesi
  const unanchored3DMatch = /<LayerPlane[^>]*>(?:(?!PrecisionDashboardShell|DeviceMockupStage|MacOSSequoiaWindow|BrowserFrame|AppShell)[\s\S])*?<(ParticipantStudioTile|TelemetryBentoCard|EncryptedChatStream|MetricCardRow|BentoCard|SpecularCard|MetricTelemetryCard|EditorialDialogueCard|PipelineTerminalCard|SplitComparisonCard)\b/.test(code);
  if (has3DStage && unanchored3DMatch) {
    errors.push('P0: LayerPlane içinde bir Hardware Shell veya Window Anchor içine sarılmamış bağımsız UI kartı tespit edildi! Tüm UI elemanları PrecisionDashboardShell veya DeviceMockupStage içine kilitlenmelidir.');
  }

  // 9. Sıfır-Artıklık Tipografi Kuralı (Zero Redundancy / No Text Duplication)
  const propMatches = Array.from(code.matchAll(/\b(?:title|subtitle|heading|headline|tag|badge|label|statusBadge|status)\s*=\s*["']([^"']{10,})["']/g)).map((m) => m[1].trim());
  const tagMatches = Array.from(code.matchAll(/<(?:h[1-6]|span|p)\b[^>]*class(?:Name)?=["'][^"']*(?:title|heading|headline|tag|badge|label|status)[^"']*["'][^>]*>([^<]{10,})<\/(?:h[1-6]|span|p)>/gi)).map((m) => m[1].trim());
  const combinedTexts = [...propMatches, ...tagMatches];
  const stringFreq = {};
  for (const str of combinedTexts) {
    stringFreq[str] = (stringFreq[str] || 0) + 1;
  }
  const duplicates = Object.keys(stringFreq).filter((s) => stringFreq[s] > 1);
  if (duplicates.length > 0) {
    errors.push(`P0: Anlamsal artık-değer / Sahte metin tekrarı (Text Redundancy) tespit edildi! Başlık ile arayüz rozeti arasında aynı metin tekrarlanamaz: "${duplicates[0]}"`);
  }

  console.log(`\n▶ [${project.slug}]`);
  if (errors.length === 0 && warnings.length === 0) {
    console.log(`  ${GREEN}✓ Kusursuz İşçilik! Hiçbir P0/P1 ihlali bulunamadı (10/10).${RESET}`);
  } else {
    if (warnings.length > 0) {
      warnings.forEach((w) => console.log(`  ${YELLOW}⚠️  ${w}${RESET}`));
      totalWarnings += warnings.length;
    }
    if (errors.length > 0) {
      errors.forEach((e) => console.log(`  ${RED}❌  ${e}${RESET}`));
      totalErrors += errors.length;
    }
  }
}

console.log(`\n==================================================`);
if (totalErrors > 0) {
  console.log(`${RED}${BOLD}🛑 Craft denetimi başarısız oldu! Toplam ${totalErrors} adet P0 ihlali bulundu.${RESET}\n`);
  process.exit(1);
}

console.log(`${GREEN}${BOLD}✨ Craft denetimi başarıyla tamamlandı (P0: 0, Uyarılar: ${totalWarnings}).${RESET}\n`);
process.exit(0);
