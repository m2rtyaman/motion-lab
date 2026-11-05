import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const fontsDir = path.join(rootDir, 'public', 'fonts');

if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

const FONTS_TO_FETCH = [
  // 1. Sans-Serif (Modern / Swiss / SaaS)
  { family: 'Inter', weights: ['400', '700', '900'], filePrefix: 'Inter' },
  { family: 'Plus+Jakarta+Sans', weights: ['700', '800'], filePrefix: 'PlusJakartaSans' },
  { family: 'Space+Grotesk', weights: ['700'], filePrefix: 'SpaceGrotesk' },

  // 2. Display / Kinetic Impact (Headlines / Posters / Reeler)
  { family: 'Archivo+Black', weights: ['400'], filePrefix: 'ArchivoBlack' },
  { family: 'Syne', weights: ['700', '800'], filePrefix: 'Syne' },
  { family: 'Bebas+Neue', weights: ['400'], filePrefix: 'BebasNeue' },

  // 3. Editorial / Serif (Luxury / Editorial Specimen / NYT)
  { family: 'Playfair+Display', weights: ['700'], filePrefix: 'PlayfairDisplay' },
  { family: 'Instrument+Serif', weights: ['400'], filePrefix: 'InstrumentSerif' },
  { family: 'Cinzel', weights: ['700'], filePrefix: 'Cinzel' },

  // 4. Monospace / Terminal / Telemetry (CLI / Code / Metrics)
  { family: 'JetBrains+Mono', weights: ['500', '700'], filePrefix: 'JetBrainsMono' },
  { family: 'Space+Mono', weights: ['700'], filePrefix: 'SpaceMono' },

  // 5. Script / Handwritten (Annotations / Highlights / Sticky Notes)
  { family: 'Caveat', weights: ['700'], filePrefix: 'Caveat' },
];

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
        res.on('error', reject);
      }
    );
  });
}

function downloadBinary(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadBinary(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
      file.on('error', (err) => {
        fs.unlink(dest, () => reject(err));
      });
    });
  });
}

async function main() {
  console.log('====================================================');
  console.log('   MOTION STUDIO — ESSENTIAL FONT SUITE FETCHER     ');
  console.log('====================================================\n');

  const cssFamilies = FONTS_TO_FETCH.map((f) => {
    if (f.weights.length > 1) {
      return `family=${f.family}:wght@${f.weights.join(';')}`;
    }
    return `family=${f.family}:wght@${f.weights[0]}`;
  }).join('&');

  const googleCssUrl = `https://fonts.googleapis.com/css2?${cssFamilies}&display=swap`;
  console.log(`[1/3] Google Fonts CSS alınıyor...`);
  const cssText = await fetchText(googleCssUrl);

  // Parse font-face rules
  const fontFaceRegex = /@font-face\s*\{([^}]+)\}/g;
  let match;
  const fontFaces = [];

  while ((match = fontFaceRegex.exec(cssText)) !== null) {
    const block = match[1];
    const familyMatch = block.match(/font-family:\s*['"]?([^'";]+)['"]?/i);
    const weightMatch = block.match(/font-weight:\s*([0-9]+)/i);
    const styleMatch = block.match(/font-style:\s*([a-z]+)/i);
    const urlMatch = block.match(/url\((https:\/\/[^)]+\.woff2)\)/i);
    const subsetMatch = match.input.slice(Math.max(0, match.index - 50), match.index);
    const isLatin = subsetMatch.includes('latin') || subsetMatch.includes('latin-ext');

    if (familyMatch && urlMatch && (isLatin || !subsetMatch.includes('/*'))) {
      fontFaces.push({
        family: familyMatch[1].trim(),
        weight: weightMatch ? weightMatch[1].trim() : '400',
        style: styleMatch ? styleMatch[1].trim() : 'normal',
        url: urlMatch[1].trim(),
        isLatinExt: subsetMatch.includes('latin-ext'),
      });
    }
  }

  console.log(`[2/3] Toplam ${fontFaces.length} font varyantı ayrıştırıldı. Dosyalar indiriliyor...`);

  const downloadedFonts = new Map();

  for (const item of fontFaces) {
    const cleanFamily = item.family.replace(/\s+/g, '');
    const filename = `${cleanFamily}-${item.weight}${item.style === 'italic' ? 'Italic' : ''}${item.isLatinExt ? '-ext' : ''}.woff2`;
    const destPath = path.join(fontsDir, filename);

    if (!fs.existsSync(destPath)) {
      try {
        await downloadBinary(item.url, destPath);
        process.stdout.write(`  ✓ İndirildi: ${filename}\n`);
      } catch (err) {
        console.error(`  ✗ Hata (${filename}):`, err.message);
      }
    } else {
      process.stdout.write(`  • Zaten mevcut: ${filename}\n`);
    }

    const key = `${item.family}-${item.weight}-${item.style}`;
    if (!downloadedFonts.has(key)) {
      downloadedFonts.set(key, {
        family: item.family,
        weight: item.weight,
        style: item.style,
        file: filename,
      });
    }
  }

  console.log('\n[3/3] İndirme tamamlandı! Toplam font sayısı:', fs.readdirSync(fontsDir).length);
}

main().catch(console.error);
