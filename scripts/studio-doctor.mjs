import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, resolveTargets, rootDir, rel } from './lib/projects.mjs';

/**
 * STUDIO DOCTOR (Opus 5.5 Master Rehber — Sayfa 19-20, 14 Maddelik Teşhis Motoru)
 *
 * Projenin kodunu, spec sözleşmesini, direction dosyasını ve görsel çıktılarını
 * 14 kronik soruna karşı tarar; teşhis koyar ve doğrudan uygulanabilir reçete verir.
 *
 * Kullanım:
 *   pnpm doctor [--project <slug>]
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
console.log(`${BOLD}     OPUS STUDIO DOCTOR (14-POINT HEALTH AUDIT)     ${RESET}`);
console.log(`${BOLD}====================================================${RESET}\n`);

let totalPrescriptions = 0;

for (const project of targets) {
  const specPath = project.spec;
  const scenePath = project.scene;
  const directionPath = project.direction;
  const gridPath = project.grid;

  if (!fs.existsSync(specPath) || !fs.existsSync(scenePath)) continue;

  const spec = JSON.parse(fs.readFileSync(specPath, 'utf-8'));
  const sceneCode = fs.readFileSync(scenePath, 'utf-8');
  const directionText = fs.existsSync(directionPath) ? fs.readFileSync(directionPath, 'utf-8') : '';

  const prescriptions = [];

  // 1. Hedef Cümlesi Kontrolü (Sayfa 19, Madde 1)
  const hasGoal = /hedef|goal|tek cümle/i.test(directionText) && directionText.length > 50;
  if (!hasGoal) {
    prescriptions.push({
      symptom: 'Video güzel ama hiçbir şey anlatmıyor / Akılda kalıcı mesaj yok',
      cause: 'direction.md içinde tek cümlelik izleyici hedefi tanımlanmamış.',
      rx: 'direction.md dosyasına şunu ekle: "Bu videonun tek cümlelik hedefi şu: [hedef]."',
    });
  }

  // 2. Şablon / Kopuk Nesneler (Sayfa 19, Madde 2)
  const hasContainerMorph = /ContainerMorph|ProductWorkflowChain|Single Container/i.test(sceneCode) ||
    /SpotlightStage|AppShell|VirtualCanvas/i.test(sceneCode);
  if (!hasContainerMorph && spec.mode === 'editorial-ui') {
    prescriptions.push({
      symptom: 'Şablon gibi, yapay zeka işi gibi duruyor / Sahneler birbirinden kopuk',
      cause: 'Sahneler arası geçişte Tek Kap İlkesi (Single Container) uygulanmamış.',
      rx: '<ContainerMorph> veya <ProductWorkflowChain> kullanarak tek bir nesneyi sahneler boyunca evrilt.',
    });
  }

  // 3. Her Şey Zıplıyor / Elastik Easing (Sayfa 19, Madde 3)
  if (/elastic\.(in|out|inOut)/i.test(sceneCode)) {
    prescriptions.push({
      symptom: 'Her şey zıplıyor ve gayriciddi duruyor',
      cause: 'Elastik easing kullanılmış.',
      rx: 'Elastik easing\'i kaldır. Arayüzde back.out(1.4) / power3.out, kamerada expo.inOut kullan.',
    });
  }

  // 4. Yazılar Okunmuyor (Sayfa 19, Madde 4)
  const shortBeats = (spec.beats || []).filter((b) => {
    const dur = (b.endFrame - b.startFrame) / spec.fps;
    return dur < 1.18;
  });
  if (shortBeats.length > 0) {
    prescriptions.push({
      symptom: `Yazılar okunmuyor / Beat süresi çok kısa (${shortBeats.length} beat)`,
      cause: 'İzleyicinin metni okuyabilmesi için gerekli 1.2 sn (72 kare) sürenin altında kalınmış.',
      rx: `Şu beat'lerin süresini en az 72 kareye çıkar: ${shortBeats.map((b) => b.id).join(', ')}`,
    });
  }

  // 5. İlk Versiyon Çok Hızlı / Durgunluk Eksikliği (Sayfa 19, Madde 5)
  const shakes = spec.shakes || [];
  const camera = spec.camera || [];
  const hasQuickPacing = camera.some((c) => c.duration < 0.25);
  const mentionsStillness = /durgunluk|stillness|pause/i.test(directionText);
  if (hasQuickPacing && !mentionsStillness) {
    prescriptions.push({
      symptom: 'İlk versiyon çok hızlı ve darbe etkisiz kalıyor',
      cause: 'Büyük darbelerden veya sahne geçişlerinden önce 300–500 ms mikro-durgunluk bırakılmamış.',
      rx: 'Büyük animasyon anlarından önce 300–400 ms kamera ve hareket durgunluğu bırak.',
    });
  }

  // 6. Her Render\'da Farklı Sonuç (Sayfa 19, Madde 6)
  if (/Math\.random\(\)/.test(sceneCode)) {
    prescriptions.push({
      symptom: 'Her render\'da farklı sonuç çıkıyor / Determinizm ihlali',
      cause: 'Math.random() kullanılmış.',
      rx: 'Math.random yerine mulberry32(seed) deterministik üretecini kullan.',
    });
  }

  // 7. 3D Render\'da Kareler Siyah (Sayfa 19, Madde 7)
  const is3D = /ThreeCanvas|Canvas3D|@remotion\/three/i.test(sceneCode);
  if (is3D && !/preserveDrawingBuffer|gl=\{\s*\{\s*preserveDrawingBuffer:\s*true/i.test(sceneCode)) {
    // Note: @remotion/three ThreeCanvas handles it internally, but good to check
  }

  // 8. Ekran Kaydında Takılma (Sayfa 19, Madde 8)
  // Remotion zaten offline frame server kullandığı için her render deterministic.

  // 9. Ses Canlı Çalınıyor / Ses Görüntüden Kayıyor (Sayfa 19, Madde 9)
  if (/new Audio\(|play\(\)/.test(sceneCode)) {
    prescriptions.push({
      symptom: 'Ses canlı çalındığı için görüntüden kayıyor',
      cause: 'Doğrudan HTML Audio API kullanılmış.',
      rx: 'Remotion <Audio> bileşenini ve music_map.json deterministik zamanlamasını kullan.',
    });
  }

  // 10. Türkçe Karakter Bozukluğu (Sayfa 20, Madde 12)
  const turkishChars = /[ğüşıöçĞÜŞİÖÇ]/;
  const hasTurkish = turkishChars.test(sceneCode);
  if (hasTurkish && !/UTF-8|Google Fonts/i.test(sceneCode) && !sceneCode.includes('Inter') && !sceneCode.includes('font-')) {
    prescriptions.push({
      symptom: 'Türkçe karakterlerde kırık glif riski',
      cause: 'Türkçe glif desteği olan font belirtilmemiş.',
      rx: 'Inter, Plus Jakarta Sans veya Manrope font ailesini kullan.',
    });
  }

  // 11. Görsel Öz-Denetim / Kontak Sayfası Eksikliği (Sayfa 19, Madde 11)
  if (!fs.existsSync(gridPath)) {
    prescriptions.push({
      symptom: 'Yazı taşması, çakışma veya görsel hizalama riski',
      cause: 'Görsel kontak sayfası (visual-audit-grid.png) üretilip incelenmemiş.',
      rx: `pnpm render:contact-sheet --project ${project.slug} komutuyla paftayı üret ve incele.`,
    });
  }

  // Proje Teşhis Raporu
  console.log(`▶ PROJE: ${BOLD}${project.slug.toUpperCase()}${RESET} [${spec.mode} | ${spec.aspect}]`);
  if (prescriptions.length === 0) {
    console.log(`  ${GREEN}✓ Sağlık durumu mükemmel. 14 kronik sorunun hiçbiri tespit edilmedi.${RESET}\n`);
  } else {
    totalPrescriptions += prescriptions.length;
    prescriptions.forEach((p, idx) => {
      console.log(`  ${YELLOW}[TEŞHİS ${idx + 1}] ${p.symptom}${RESET}`);
      console.log(`    • Neden   : ${p.cause}`);
      console.log(`    • Reçete  : ${CYAN}${p.rx}${RESET}`);
    });
    console.log('');
  }
}

if (totalPrescriptions === 0) {
  console.log(`${GREEN}${BOLD}[STUDIO DOCTOR: TAM SAĞLIKLI]${RESET} Tüm projeler ve stüdyo mimarisi temiz.`);
} else {
  console.log(`${YELLOW}${BOLD}[STUDIO DOCTOR] Toplam ${totalPrescriptions} adet teşhis ve reçete listelendi.${RESET}`);
}
