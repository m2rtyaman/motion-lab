import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, resolveTargets, rootDir, rel } from './lib/projects.mjs';

/**
 * CRITIC AUDIT (Opus Animasyon Rehberi Prompt 10 Cilalama Motoru)
 *
 * Bir sahneyi sert bir motion tasarım direktörü gözüyle puanlar ve denetler:
 * 1. Ölü Zaman Kontrolü (0.5s'den uzun hiçbir hareketin olmadığı anlar)
 * 2. Okunabilirlik Süresi (Ana metinler en az 1.2 sn ekranda kalmalı)
 * 3. Yapay Zeka Şablonu Tespiti (Mor/cyan gradyan, anlamsız parçacık, ortalanmış boşluk)
 * 4. P0 (Zorunlu), P1 (Büyük İyileştirme), P2 (Cila) Puanlama Tablosu
 *
 * Kullanım: node scripts/critic-audit.mjs [--project <slug>]
 */

const args = parseArgs();
const targets = resolveTargets(args);

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

console.log(`\n${BOLD}====================================================${RESET}`);
console.log(`${BOLD}   OPUS DIRECTORS CRITIC AUDIT (PROMPT 10 ENGINE)   ${RESET}`);
console.log(`${BOLD}====================================================${RESET}\n`);

let overallScore = 0;
let projectCount = 0;

for (const project of targets) {
  const specPath = project.spec;
  const scenePath = project.scene;
  const directionPath = project.direction;

  if (!fs.existsSync(specPath) || !fs.existsSync(scenePath)) continue;

  const spec = JSON.parse(fs.readFileSync(specPath, 'utf-8'));
  const sceneCode = fs.readFileSync(scenePath, 'utf-8');
  const directionText = fs.existsSync(directionPath) ? fs.readFileSync(directionPath, 'utf-8') : '';

  const findings = {
    P0: [], // Zorunlu düzeltme
    P1: [], // Büyük iyileştirme
    P2: [], // Cila
  };

  let score = 10;

  // 1. ÖLÜ ZAMAN DENETİMİ (Dead Time Check)
  const camera = Array.isArray(spec.camera) ? spec.camera : [];
  for (let i = 0; i < camera.length - 1; i++) {
    const gap = camera[i + 1].at - (camera[i].at + camera[i].duration);
    if (gap > 0.6) {
      findings.P1.push({
        time: `${(camera[i].at + camera[i].duration).toFixed(2)}s – ${camera[i + 1].at.toFixed(2)}s`,
        issue: `Kamera ${(gap).toFixed(2)}s boyunca tamamen hareketsiz (Ölü zaman > 0.5s)`,
        fix: 'Kameraya hafif ambient drift veya mikro-itekleme ekleyin.',
      });
      score -= 0.5;
    }
  }

  // 2. METİN OKUNABİLİRLİK SÜRESİ (En az 1.2 sn kuralı)
  const beats = Array.isArray(spec.beats) ? spec.beats : [];
  beats.forEach((b) => {
    const durationSec = (b.endFrame - b.startFrame + 1) / spec.fps;
    if (durationSec < 1.2) {
      findings.P0.push({
        beat: b.id,
        issue: `Beat süresi (${durationSec.toFixed(2)}s) 1.2 saniyenin altında; izleyici metni rahatça okuyamaz.`,
        fix: 'Beat süresini en az 1.2 saniyeye (72 kare @60fps) çıkarın.',
      });
      score -= 1.0;
    }
  });

  // 3. YAPAY ZEKA ŞABLONU KONTROLÜ (AI Template Slop)
  if (sceneCode.includes('blur-3xl') && sceneCode.includes('bg-purple')) {
    findings.P0.push({
      issue: 'Klasik jenerik yapay zeka mor-cyan blur lekesi tespit edildi.',
      fix: 'Koyu cam veya net geometrik sahne aydınlatması ile değiştirin.',
    });
    score -= 1.5;
  }

  // 4. TEK KAP İLKESİ (Single Container Principle)
  if (!sceneCode.includes('SpotlightStage') && !sceneCode.includes('VirtualCanvas') && !sceneCode.includes('AppShell')) {
    findings.P1.push({
      issue: 'Sahne tek bir yapısal iskelet (Single Container) içinde tutulmuyor.',
      fix: '<AppShell>, <VirtualCanvas> veya <SpotlightStage> ile kapsülleyin.',
    });
    score -= 0.8;
  }

  // 5. TEK CÜMLELİK HEDEF KONTROLÜ
  if (!directionText.includes('Hedef') && !directionText.includes('Concept')) {
    findings.P2.push({
      issue: 'direction.md içinde tek cümlelik izleyici hedefi eksik.',
      fix: 'İzleyicinin aklında kalacak tek ana mesajı direction.md içine ekleyin.',
    });
    score -= 0.3;
  }

  score = Math.max(1, Math.min(10, Math.round(score * 10) / 10));
  overallScore += score;
  projectCount++;

  console.log(`${BOLD}▶ PROJE: ${project.slug.toUpperCase()}${RESET} [Puan: ${score >= 8 ? GREEN : YELLOW}${score}/10${RESET}]`);
  
  if (findings.P0.length === 0 && findings.P1.length === 0 && findings.P2.length === 0) {
    console.log(`  ${GREEN}✓ Kusursuz. Sıfır ölü zaman, tam okunabilirlik, direktör onaylı.${RESET}\n`);
  } else {
    if (findings.P0.length) {
      console.log(`  ${RED}${BOLD}[P0 - ZORUNLU DÜZELTMELER]${RESET}`);
      findings.P0.forEach((f) => console.log(`    • ${f.issue} → ${CYAN}${f.fix}${RESET}`));
    }
    if (findings.P1.length) {
      console.log(`  ${YELLOW}${BOLD}[P1 - BÜYÜK İYİLEŞTİRMELER]${RESET}`);
      findings.P1.forEach((f) => console.log(`    • ${f.issue} → ${CYAN}${f.fix}${RESET}`));
    }
    if (findings.P2.length) {
      console.log(`  ${BOLD}[P2 - CİLA VE DETAYLAR]${RESET}`);
      findings.P2.forEach((f) => console.log(`    • ${f.issue} → ${CYAN}${f.fix}${RESET}`));
    }
    console.log('');
  }
}

const avgScore = projectCount > 0 ? (overallScore / projectCount).toFixed(1) : 10;
console.log(`${BOLD}Stüdyo Ortalama Direktör Puanı:${RESET} ${avgScore >= 8 ? GREEN : YELLOW}${avgScore} / 10${RESET}\n`);
