import fs from 'node:fs';
import path from 'node:path';
import { rootDir, SLUG_RE, MODES, ASPECT_DIMS } from './lib/projects.mjs';

/**
 * STUDIO BRIEF (Motion Lab animation guide: 7-part director briefing engine)
 *
 * Prompt 2 & 2b: from only the user's topic and goal sentence,
 * autonomously generates a professional 7-part direction.md and spec.json contract.
 *
 * 7 Parts:
 * 1. Rol (Motion Designer / Creative Director)
 * 2. One-Sentence Goal
 * 3. Format & Resolution
 * 4. Idea Order (Scene List)
 * 5. Art Direction & Palette
 * 6. Motion Language (semantic motion)
 * 7. Prohibitions & Control Contract
 *
 * Usage:
 *   node scripts/studio-brief.mjs <slug> --topic "..." --goal "..." [--mode editorial-ui] [--aspect 16:9] [--duration 10]
 */

const argv = process.argv.slice(2);
const positional = argv.filter((a) => !a.startsWith('-'));
const slug = positional[0];

const getArg = (flag, def) => {
  const idx = argv.indexOf(flag);
  return idx !== -1 && argv[idx + 1] ? argv[idx + 1] : def;
};

const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

if (!slug || !SLUG_RE.test(slug)) {
  console.error(`${RED}${BOLD}[ERROR] Invalid slug:${RESET} "${slug}"`);
  console.log('Usage: node scripts/studio-brief.mjs <slug> --topic "..." --goal "..."');
  process.exit(1);
}

const topic = getArg('--topic', slug.replace(/-/g, ' ').toUpperCase());
const goal = getArg('--goal', `İzleyici ${topic} ürününün hızını ve değerini hissetmeli.`);
const mode = getArg('--mode', 'editorial-ui');
const aspect = getArg('--aspect', '16:9');
const duration = parseFloat(getArg('--duration', '10'));
const fps = 60;
const totalFrames = Math.round(duration * fps);

const projectDir = path.join(rootDir, 'src', 'projects', slug);
fs.mkdirSync(projectDir, { recursive: true });

// 1. DIRECTION.MD (7-Part Brief)
const directionContent = `# Direction — ${topic}

## 1. ROL
Kıdemli Motion Designer ve Ürün Filmi Yönetmeni.

## 2. TEK CÜMLELİK HEDEF
${goal}

## 3. FORMAT
- **Çözünürlük & Oran:** ${aspect} (${aspect === '16:9' ? '1920x1080' : '1080x1920'})
- **Kare Hızı:** ${fps} FPS (${totalFrames} Kare)
- **Süre:** ${duration} Saniye

## 4. SAHNE LİSTESİ (Fikir Sırası, Efekt Değil)
1. **0.0s – ${(duration * 0.25).toFixed(1)}s [Kanca]:** Sorun veya mevcut durumun karmaşası.
2. **${(duration * 0.25).toFixed(1)}s – ${(duration * 0.55).toFixed(1)}s [Çözüm]:** Tek bir merkezi nesneye odaklanma (Tek Kap İlkesi).
3. **${(duration * 0.55).toFixed(1)}s – ${(duration * 0.85).toFixed(1)}s [Ana Değer]:** Özelliklerin birbirine kesintisiz evrilmesi.
4. **${(duration * 0.85).toFixed(1)}s – ${duration.toFixed(1)}s [Kapanış & CTA]:** Marka mührü ve net aksiyon çağrısı.

## 5. SANAT YÖNÜ
- **Zemin:** Koyu derin antrasit veya mat mühendislik çizim kağıdı.
- **Palet:** Nötr gövde, tek yüksek kontrastlı marka vurgu rengi.
- **Tipografi:** En fazla 2 yazı tipi (Neo-grotesk başlık + Monospace telemetri).
- **Yayın Ölçeği:** Minimum font boyutu 18px (Mikro-font yasaktır).

## 6. HAREKET DİLİ (Anlamsal Hareket)
- **Sağa / İleri Hareket:** İlerleme ve büyüme.
- **Büyüme / Odaklanma:** Artan önem ve değer.
- **Dönüşüm / Morf:** Durum değişikliği (Tek bir nesne kesilmeden evrilir).
- **Durgunluk:** Büyük anlardan önce 300–500 ms mikro-durgunluk bırakılır.
- **İşe Göre Easing:** Arayüzde sıkı yay (\`snappy spring\`), kamerada \`expo.inOut\`, logoda kontrollü yavaşlama.

## 7. YASAKLAR & KONTROL
- MOTION_RULES.md'deki tüm kurallar geçerlidir.
- Mor/cyan yapay zeka jenerik lekeleri yasak.
- Taşan yazı veya çakışan nesne olamaz.
`;

fs.writeFileSync(path.join(projectDir, 'direction.md'), directionContent, 'utf-8');

// 2. SPEC.JSON (Motion Contract)
const b1End = Math.round(totalFrames * 0.25) - 1;
const b2End = Math.round(totalFrames * 0.55) - 1;
const b3End = Math.round(totalFrames * 0.85) - 1;

const specContent = {
  $schema: '../../../specs/motion-spec.schema.json',
  version: 1,
  title: topic,
  mode,
  aspect,
  fps,
  durationInSeconds: duration,
  safeZone: {
    top: 250,
    bottom: 300,
  },
  beats: [
    {
      id: 'hook-problem',
      startFrame: 0,
      endFrame: b1End,
      intent: 'Sorun ve açılış kancası',
      action: 'hook-problem',
    },
    {
      id: 'solution-core',
      startFrame: b1End + 1,
      endFrame: b2End,
      intent: 'Çözümün belirmesi ve tek kap odağı',
      action: 'solution-core',
    },
    {
      id: 'value-workflow',
      startFrame: b2End + 1,
      endFrame: b3End,
      intent: 'Ana değer teklifi ve iş akışı',
      action: 'value-workflow',
    },
    {
      id: 'closing-cta',
      startFrame: b3End + 1,
      endFrame: totalFrames,
      intent: 'Marka kapanışı ve aksiyon çağrısı',
      action: 'closing-cta',
    },
  ],
  camera: [
    {
      at: 0.05,
      duration: 1.2,
      ease: 'expo.out',
      intent: 'Açılış kancasına sinematik odak',
    },
    {
      at: 1.6,
      duration: 1.1,
      ease: 'expo.inOut',
      intent: 'Kameranın çözüme doğru süzülüşü',
    },
    {
      at: 3.0,
      duration: 1.2,
      ease: 'expo.inOut',
      intent: 'Tek kap morf aksiyonuna yaklaşma',
    },
    {
      at: 4.6,
      duration: 1.2,
      ease: 'power3.out',
      intent: 'İş akışı paneline yumuşak pan',
    },
    {
      at: 6.2,
      duration: 1.2,
      ease: 'expo.out',
      intent: 'Detay ve metrik odağı',
    },
    {
      at: 7.8,
      duration: 1.2,
      ease: 'expo.inOut',
      intent: 'Sonuç başarısına derinleşme',
    },
    {
      at: 9.2,
      duration: 0.75,
      ease: 'expo.out',
      intent: 'Kapanış marka mührü',
    },
  ],
  shakes: [],
  sfx: [],
};

fs.writeFileSync(path.join(projectDir, 'spec.json'), JSON.stringify(specContent, null, 2), 'utf-8');

console.log(`\n${BOLD}====================================================${RESET}`);
console.log(`${BOLD}   MOTION LAB AUTO-BRIEF GENERATED: ${slug.toUpperCase()}   ${RESET}`);
console.log(`${BOLD}====================================================${RESET}`);
console.log(`Goal Sentence : ${CYAN}"${goal}"${RESET}`);
console.log(`Created       : ${GREEN}direction.md${RESET} (7-Part Director Brief)`);
console.log(`Created       : ${GREEN}spec.json${RESET} (4 Beats, 7 Camera Contract)`);
console.log(`Format        : ${aspect} (${totalFrames} frames @ ${fps} FPS)\n`);
