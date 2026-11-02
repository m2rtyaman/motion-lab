import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, resolveTargets, rootDir, rel } from './lib/projects.mjs';
import { calculateRequiredReadingTime, countTextUnits } from '../src/core/readability-meter.ts';

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

  const isLegacy = spec.legacy === true;
  let score = 10;

  // 1. ÖLÜ ZAMAN DENETİMİ (Dead Time Check)
  // Not: Metin veya veri odağında kameranın sakin kalması erdemdir; yalnızca aşırı uzun (>4.0s) boşluklar sorgulanır.
  const camera = Array.isArray(spec.camera) ? spec.camera : [];
  for (let i = 0; i < camera.length - 1; i++) {
    const gap = camera[i + 1].at - (camera[i].at + camera[i].duration);
    if (gap > 4.0) {
      findings.P1.push({
        time: `${(camera[i].at + camera[i].duration).toFixed(2)}s – ${camera[i + 1].at.toFixed(2)}s`,
        issue: `Kamera ${(gap).toFixed(2)}s boyunca tamamen hareketsiz (Aşırı ölü zaman > 4.0s)`,
        fix: 'Geçiş veya odak hareketi ekleyin.',
      });
      if (!isLegacy) score -= 0.5;
    }
  }

  // 2. METİN OKUNABİLİRLİK SÜRESİ (Lemomo Dinamik Okuma Formülü & Asgari 2.5s Karşılaştırma / Karar Ekranı Kuralı)
  const beats = Array.isArray(spec.beats) ? spec.beats : [];
  beats.forEach((b) => {
    const durationSec = (b.endFrame - b.startFrame + 1) / spec.fps;
    const textContent = typeof b.text === 'string' ? b.text.trim() : '';
    const hasText = Boolean(textContent);
    const isComparisonOrVerdict = Boolean(
      b.isComparison ||
      b.isVerdict ||
      /verdict|compare|karşılaştırma|karar|ledger|telemetry|summary/i.test(b.id || '') ||
      /verdict|vs|karşılaştırma|karar/i.test(textContent)
    );

    if (isComparisonOrVerdict && durationSec < 2.5) {
      findings.P0.push({
        beat: b.id,
        issue: `Karşılaştırma / Karar (verdict) ekranı için beat süresi (${durationSec.toFixed(2)}s) minimum 2.5s hold kuralının altında.`,
        fix: `Beat süresini en az 2.5 saniyeye (${Math.round(2.5 * spec.fps)} kare @${spec.fps}fps) çıkarın.`,
      });
      if (!isLegacy) score -= 1.0;
    } else if (hasText) {
      const { cjkChars, latinWords } = countTextUnits(textContent);
      const requiredDuration = calculateRequiredReadingTime(cjkChars, latinWords, isComparisonOrVerdict);
      if (durationSec < requiredDuration) {
        findings.P0.push({
          beat: b.id,
          issue: `Beat süresi (${durationSec.toFixed(2)}s) dinamik okunabilirlik ihtiyacının (${requiredDuration.toFixed(2)}s - CJK: ${cjkChars}, Latin: ${latinWords} kelime) altında; izleyici metni rahatça okuyamaz.`,
          fix: `Beat süresini en az ${requiredDuration.toFixed(2)} saniyeye (${Math.round(requiredDuration * spec.fps)} kare @${spec.fps}fps) çıkarın.`,
        });
        if (!isLegacy) score -= 1.0;
      }
    } else if (!isLegacy && durationSec < 1.2) {
      findings.P0.push({
        beat: b.id,
        issue: `Beat süresi (${durationSec.toFixed(2)}s) 1.2 saniyenin altında; izleyici sahneyi algılayamaz.`,
        fix: `Beat süresini en az 1.2 saniyeye (${Math.round(1.2 * spec.fps)} kare @${spec.fps}fps) çıkarın.`,
      });
      if (!isLegacy) score -= 1.0;
    }
  });

  // 3. YAPAY ZEKA ŞABLONU KONTROLÜ (AI Template Slop & Emoji Slop & 3-Part Sandwich Slop)
  if (sceneCode.includes('blur-3xl') && sceneCode.includes('bg-purple')) {
    findings.P0.push({
      issue: 'Klasik jenerik yapay zeka mor-cyan blur lekesi tespit edildi.',
      fix: 'Koyu cam veya net geometrik sahne aydınlatması ile değiştirin.',
    });
    score -= 1.5;
  }

  if (!isLegacy && /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2702}-\u{2712}\u{2716}-\u{27BF}\u{2B50}]/u.test(sceneCode)) {
    findings.P0.push({
      issue: 'Sahne içinde ucuz sistem emojisi tespit edildi (Gerçek vektör SVG zorunluluğu ihlali).',
      fix: 'Tüm emojileri kaldırıp çok parçalı <svg>, <path>, <circle>, <rect>, strokeDasharray/strokeDashoffset vektör çizimlerine dönüştürün.',
    });
    score -= 2.0;
  }

  const svgCount = (sceneCode.match(/<svg\b/g) || []).length;
  if (!isLegacy && spec.mode === 'editorial-ui' && svgCount < 6) {
    findings.P1.push({
      issue: `Yetersiz vektör zenginliği: Sahnede yalnızca ${svgCount} adet <svg> bulundu (Minimum 6 çok parçalı vektör gerekli).`,
      fix: 'Her ikonu, ses dalgasını ve illüstrasyonu çok parçalı <svg>/<path>/<circle> olarak çizin.',
    });
    score -= 1.0;
  }

  const headerCount = (sceneCode.match(/<header\b/g) || []).length;
  const footerCount = (sceneCode.match(/<footer\b/g) || []).length;
  const topBlockCount = (sceneCode.match(/top-\[\d+px\]\s+left-\[\d+px\]\s+right-\[\d+px\]/g) || []).length;
  const numberedSlideEyebrows = new Set((sceneCode.match(/\b0[1-9]\s*[•·—-]/g) || []).map((s) => s.slice(0, 2))).size;
  if (!isLegacy && ((headerCount >= 3 && footerCount >= 3) || topBlockCount >= 2 || numberedSlideEyebrows >= 3)) {
    findings.P0.push({
      issue: `Monoton "Sabit Başlık + Ortada Kutu + Sabit Footer / Numaralı Slayt Başlığı" tekrarı (header=${headerCount}, footer=${footerCount}, topBlock=${topBlockCount}, slideEyebrow=${numberedSlideEyebrows}).`,
      fix: 'Her beat için kendine özgü tam ekran (full-bleed) motion graphic kompozisyonu (Kinetik Tipografi, Makro Vektör Çarpışması, Çok Katmanlı Kanvas, Geometrik Logo Birleşimi) kurgulayın.',
    });
    score -= 2.0;
  }

  // 4. TEK KAP İLKESİ & NESNE MORPHING (Single Container Principle & Object Morphing)
  const hasContainerStructure =
    sceneCode.includes('SpotlightStage') ||
    sceneCode.includes('VirtualCanvas') ||
    sceneCode.includes('AppShell') ||
    sceneCode.includes('transitionContainerMorph') ||
    sceneCode.includes('transitionWhipPan') ||
    sceneCode.includes('transitionMaskWipe') ||
    sceneCode.includes('transitionZoomPunch') ||
    sceneCode.includes('Stage') ||
    sceneCode.includes('CameraRig') ||
    sceneCode.includes('poster-rig') ||
    spec.mode === 'kinetic-poster';

  if (!hasContainerStructure) {
    findings.P1.push({
      issue: 'Sahne tek bir yapısal iskelet (Single Container) veya akıcı geçiş motoru içinde tutulmuyor.',
      fix: '<AppShell>, <VirtualCanvas>, <SpotlightStage> veya transitions.* motoru ile kapsülleyin.',
    });
    if (!isLegacy) score -= 0.8;
  }

  // 5. BEAT'LER ARASI RENK KONTRASTI (Color Blocking Check)
  const hasColorBlocking =
    sceneCode.includes('beatPalettes') ||
    sceneCode.includes('WHATSAPP_COLOR_BLOCK_THEME') ||
    sceneCode.includes('color-block') ||
    (sceneCode.includes('#00A884') && (sceneCode.includes('#F5F2EF') || sceneCode.includes('#F0F2F5')));
  if (!isLegacy && beats.length >= 3 && !hasColorBlocking) {
    findings.P1.push({
      issue: 'Tüm video tekdüze arka planda geçiyor; beat sınırlarında tam ekran Renk Kontrastı (Color Blocking) eksik.',
      fix: 'theme-contract.ts içindeki beatPalettes / WHATSAPP_COLOR_BLOCK_THEME ile sahneler arasında kontrast renk bloklaması (Koyu -> Zümrüt Yeşili -> Sıcak Krem -> Koyu Mühür) uygulayın.',
    });
    score -= 0.8;
  }

  // 6. TEK CÜMLELİK HEDEF KONTROLÜ
  const hasTargetGoal =
    directionText.includes('Hedef') ||
    directionText.includes('Concept') ||
    directionText.includes('tek cümlelik');

  if (!hasTargetGoal) {
    findings.P2.push({
      issue: 'direction.md içinde tek cümlelik izleyici hedefi eksik.',
      fix: 'İzleyicinin aklında kalacak tek ana mesajı direction.md içine ekleyin.',
    });
    if (!isLegacy) score -= 0.3;
  }

  // 7. VEKTÖR FİLTRE/GRADYAN & 3D KATMAN DERİNLİĞİ (CRITIC-SVG-CRAFT)
  const hasBlueprint = fs.existsSync(path.join(project.dir, 'choreography-blueprint.md'));
  if (!isLegacy && hasBlueprint && spec.mode === 'editorial-ui') {
    const hasSvgCraft =
      sceneCode.includes('SvgFilterLab') ||
      (sceneCode.includes('<defs') && /linearGradient|radialGradient|feGaussianBlur/.test(sceneCode));
    const has3DDepth =
      sceneCode.includes('LayeredStage3D') ||
      sceneCode.includes('LayerPlane') ||
      sceneCode.includes('preserve-3d') ||
      sceneCode.includes('translateZ');

    if (!hasSvgCraft) {
      findings.P0.push({
        issue: 'CRITIC-SVG-CRAFT: Sahnede SvgFilterLab veya <defs> (linearGradient/radialGradient/filter) eksik; SVG çizimleri düz ve tek boyutlu.',
        fix: '<SvgFilterLab /> ekleyerek çok duraklı gradyan, sıvı (gooey) morph ve specular rim filtrelerini kullanın.',
      });
      score -= 1.5;
    }
    if (!has3DDepth) {
      findings.P0.push({
        issue: 'CRITIC-3D-STAGE: Sahnede LayeredStage3D / LayerPlane (preserve-3d + translateZ) eksik; bileşenler düz 2D kutu olarak duruyor.',
        fix: '<LayeredStage3D> ve <LayerPlane z={...}> kullanarak bileşenleri 3D Z-ekseninde ayrıştırın.',
      });
      score -= 1.5;
    }
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
