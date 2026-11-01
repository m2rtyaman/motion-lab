import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, resolveProject, rootDir } from './lib/projects.mjs';

const GREEN = '\x1b[32m';
const BOLD = '\x1b[1m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

/**
 * SKILL FABRİKASI (Opus Animasyon Rehberi Prompt 11)
 *
 * Beğenilen ve cilalanan bir animasyon stilini tek komutla
 * Antigravity ve yapay zeka ajanlarının otomatik kullanabileceği
 * yeniden kullanılabilir bir `.agent/skills/<name>/` paketine dönüştürür.
 *
 * Kullanım:
 *   pnpm export:skill <slug> [--name <skill-name>]
 */

const args = parseArgs();
const targetSlug = args.project || args.positional[0];

if (!targetSlug) {
  console.error('Lütfen bir proje belirtin: pnpm export:skill <slug> [--name <skill-name>]');
  process.exit(1);
}

const project = resolveProject({ ...args, project: targetSlug });
const nameIdx = process.argv.indexOf('--name');
const customName = nameIdx !== -1 ? process.argv[nameIdx + 1] : undefined;
const skillName = customName || `motion-${project.slug}`;
const skillDir = path.resolve(rootDir, '.agent', 'skills', skillName);

if (!fs.existsSync(project.spec) || !fs.existsSync(project.scene)) {
  console.error(`Proje dosyaları eksik: ${project.slug}`);
  process.exit(1);
}

const spec = JSON.parse(fs.readFileSync(project.spec, 'utf-8'));
const directionText = fs.existsSync(project.direction)
  ? fs.readFileSync(project.direction, 'utf-8')
  : '';
const sceneCode = fs.readFileSync(project.scene, 'utf-8');

fs.mkdirSync(path.join(skillDir, 'reference'), { recursive: true });

// 1. SKILL.md
const skillMd = `---
name: ${skillName}
description: ${project.slug} stilinde (${spec.mode}, ${spec.aspect}, 60 FPS) yüksek kaliteli video üretimi ve sahne koreografisi için uzman hareket becerisi.
---

# ${spec.title || project.slug.toUpperCase()} MOTION GRAPHIC SKILL

Bu beceri, **${spec.mode}** paradigmasında ${spec.aspect} en-boy oranında, broadcast kalitesinde ve $60\\text{ FPS}$ hızında profesyonel hareket tasarımı üretmek için geliştirilmiştir.

## Ne Zaman Kullanılır?
- Kullanıcı "${spec.title || project.slug}" tarzında modern, koyu cam veya sinematik bir video istediğinde.
- ${spec.mode === 'editorial-ui' ? 'B2B SaaS, analitik pano, finans veya dijital ürün tanıtımı gerektiğinde.' : spec.mode === 'kinetic-poster' ? 'Yüksek kontrastlı tipografik manifesto, afiş veya manifesto gerektiğinde.' : '2.5D derinlikli atmosfer ve karakter anlatımı gerektiğinde.'}

## İş Akışı
1. **Senaryo & Zaman Çizelgesi:** \`direction.md\` ve \`spec.json\` sözleşmesi tanımlanır.
2. **Koreografi:** \`useRemotionGSAP\` ile zaman çizelgesi kurulur.
3. **Statik Denetim:** \`pnpm check --project <slug>\` ile AST ve Slop linter testleri geçilir.
4. **Görsel Kontak Sayfası:** \`pnpm render:contact-sheet --project <slug>\` ile kareler denetlenir.
5. **Fiziksel Render:** \`pnpm render --project <slug>\` ile tamamlanır.
`;

// 2. STYLE.md
const styleMd = `# GÖRSEL STİL VE TASARIM SÖZLEŞMESİ: ${skillName.toUpperCase()}

- **Mod:** \`${spec.mode}\`
- **En-Boy Oranı:** \`${spec.aspect}\`
- **Güvenli Alan (Safe Zone):** Üst: ${spec.safeZone?.top || 250}px, Alt: ${spec.safeZone?.bottom || 300}px
- **Tipografi:** Okunabilirlik için minimum 18px kuralı (1080p dikeyde min %7 genişlik).
- **Renk Paleti:**
  - Zemin: Mat koyu arka plan (\`#07080b\` / \`#0a0b10\`)
  - Kartlar: Specular cam yüzeyler (\`rgba(255, 255, 255, 0.04)\`), 1px ince sınır (\`rgba(255, 255, 255, 0.08)\`)
  - Vurgu: Kontrollü altın / amber / yeşil (Neon ve sahte parlamalar yasaktır).
`;

// 3. MOTION.md
const motionMd = `# HAREKET DİLİ VE KOREOGRAFİ: ${skillName.toUpperCase()}

1. **Tek Kap İlkesi (Single Container Principle):** Sahneler arası geçişte bir ana konteyner kırılmadan morflanarak devam eder.
2. **Büyük Anlardan Önce Durgunluk (Anticipatory Stillness):** Darbelerden ve geçişlerden önce 300–500 ms mikro-durgunluk bırakılır.
3. **İşe Göre Easing:**
   - UI Geçişleri: \`power3.out\` / \`back.out(1.4)\`
   - Kamera Pan/Zoom: \`expo.inOut\` / \`power2.out\`
   - Asla yasaklı ease (\`linear\`, \`easeInOut\`) kullanılmaz.
4. **Metin Süresi:** Ekrana gelen her başlık en az 1.2 saniye (72 kare @ 60 FPS) ekranda sabit kalır.
`;

// 4. PIPELINE.md
const pipelineMd = `# ÜRETİM VE RENDER SÖZLEŞMESİ

- **Kare Hızı:** 60 FPS (Deterministik \`tl.seek(frame / fps)\`)
- **GPU Saflığı:** Yalnızca \`transform\` (x, y, scale, rotation), \`opacity\` ve \`filter\` tween edilir.
- **Rastgelelik:** \`Math.random\` yasaktır. Daima tohumlu (seeded) veya t'nin matematiksel fonksiyonu kullanılır.
- **Render Komutu:** \`remotion render src/remotion/index.ts ${project.slug} out/${project.slug}/${project.slug}.mp4\`
`;

// 5. CHECKLIST.md
const checklistMd = `# CİLALAMA VE DENETİM KONTROL LİSTESİ (PROMPT 10/11)

- [ ] **P0:** 0.5 saniyeden uzun ölü zaman var mı?
- [ ] **P0:** Metinlerin ekranda kalma süresi 1.2 saniyenin altında mı?
- [ ] **P0:** Üst %12 veya alt %20 güvenlik alanına taşan kritik metin var mı?
- [ ] **P1:** Geçişlerde tek kap sürekliliği korundu mu?
- [ ] **P1:** Mor/cyan jenerik yapay zeka glow'u veya mikro-font (12-14px) var mı?
- [ ] **P2:** Kontak sayfası (\`visual-audit-grid.png\`) direktör gözüyle incelendi mi?
`;

// Dosyaları yaz
fs.writeFileSync(path.join(skillDir, 'SKILL.md'), skillMd);
fs.writeFileSync(path.join(skillDir, 'STYLE.md'), styleMd);
fs.writeFileSync(path.join(skillDir, 'MOTION.md'), motionMd);
fs.writeFileSync(path.join(skillDir, 'PIPELINE.md'), pipelineMd);
fs.writeFileSync(path.join(skillDir, 'CHECKLIST.md'), checklistMd);
fs.writeFileSync(path.join(skillDir, 'reference', 'Scene.tsx'), sceneCode);
fs.writeFileSync(path.join(skillDir, 'reference', 'spec.json'), JSON.stringify(spec, null, 2));

console.log(`\n${GREEN}${BOLD}[SKILL FABRİKASI: BAŞARILI]${RESET}`);
console.log(`Proje: ${BOLD}${project.slug}${RESET}`);
console.log(`Üretilen Skill: ${BOLD}.agent/skills/${skillName}${RESET}`);
console.log(`Dosyalar: SKILL.md, STYLE.md, MOTION.md, PIPELINE.md, CHECKLIST.md, reference/Scene.tsx\n`);
