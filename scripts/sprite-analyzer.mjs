import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const inputPath = path.join(rootDir, 'public', 'assets', 'dwarf_spritesheet.png');
const outDir = path.join(rootDir, 'public', 'assets', 'sprites');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

/**
 * Akıllı Sprite Bölge ve Ayak Hizalama Tanımları
 * - Yan kare sızıntılarını ve yerdeki kesik kılıç/gölge kalıntılarını hariç tutar.
 * - Tüm pozların çizmelerini aynı 'footBaselineY = 148' tabanına oturtur.
 */
const SPRITE_REGIONS = [
  { name: 'idle', role: 'idle', minX: 70, maxX: 174, minY: 72, maxY: 161 },
  { name: 'run_1', role: 'run', minX: 192, maxX: 309, minY: 66, maxY: 161 },
  { name: 'run_2', role: 'run', minX: 325, maxX: 437, minY: 44, maxY: 158 },
  { name: 'jump', role: 'leap', minX: 442, maxX: 540, minY: 35, maxY: 150 },
  { name: 'walk_recover', role: 'run', minX: 576, maxX: 659, minY: 72, maxY: 161 },
  { name: 'shield', role: 'guard', minX: 70, maxX: 174, minY: 224, maxY: 314 },
  {
    name: 'shout',
    role: 'shout',
    minX: 465,
    maxX: 547,
    minY: 220,
    maxY: 309, // Yerdeki kılıç parçasını ve gölge kalıntılarını tamamen dışarıda bırakır
  },
];

fs.createReadStream(inputPath)
  .pipe(new PNG())
  .on('parsed', function () {
    const totalW = this.width;
    const canvasW = 160;
    const canvasH = 160;
    const targetFootY = 148;

    const manifest = {
      source: 'assets/dwarf_spritesheet.png',
      canvasSize: { width: canvasW, height: canvasH },
      footBaselineY: targetFootY,
      recommendedRunCycle: ['run_1', 'run_2', 'walk_recover'],
      frames: {},
    };

    for (const reg of SPRITE_REGIONS) {
      // Gerçek içerik sınırlarını (tight bounding box) bul
      let tightMinX = reg.maxX;
      let tightMaxX = reg.minX;
      let tightMinY = reg.maxY;
      let tightMaxY = reg.minY;

      for (let y = reg.minY; y <= reg.maxY; y++) {
        for (let x = reg.minX; x <= reg.maxX; x++) {
          const idx = (totalW * y + x) << 2;
          const r = this.data[idx];
          const g = this.data[idx + 1];
          const b = this.data[idx + 2];

          // Beyaz arka plan ve soluk yer gölgesini filtrele
          const isWhiteBg = r > 232 && g > 232 && b > 232;
          const isGroundShadow =
            y > reg.maxY - 6 &&
            Math.abs(r - g) < 12 &&
            Math.abs(g - b) < 12 &&
            r > 180;

          if (!isWhiteBg && !isGroundShadow) {
            if (x < tightMinX) tightMinX = x;
            if (x > tightMaxX) tightMaxX = x;
            if (y < tightMinY) tightMinY = y;
            if (y > tightMaxY) tightMaxY = y;
          }
        }
      }

      const spriteW = tightMaxX - tightMinX + 1;
      const spriteH = tightMaxY - tightMinY + 1;
      const destX = Math.round((canvasW - spriteW) / 2);
      const destY = targetFootY - spriteH;

      const outPng = new PNG({ width: canvasW, height: canvasH });

      for (let y = 0; y < spriteH; y++) {
        for (let x = 0; x < spriteW; x++) {
          const srcX = tightMinX + x;
          const srcY = tightMinY + y;

          // 'shout' karesinde sağ alt köşedeki kılıç kabzası kalıntısını temizle
          if (reg.name === 'shout' && srcY > 302 && srcX > 522 && this.data[(totalW * srcY + srcX) << 2] < 160) {
            continue;
          }

          const srcIdx = (totalW * srcY + srcX) << 2;
          const dx = destX + x;
          const dy = destY + y;
          if (dx < 0 || dx >= canvasW || dy < 0 || dy >= canvasH) continue;

          const dstIdx = (canvasW * dy + dx) << 2;
          const r = this.data[srcIdx];
          const g = this.data[srcIdx + 1];
          const b = this.data[srcIdx + 2];
          const a = this.data[srcIdx + 3];

          if (r > 234 && g > 234 && b > 234) {
            continue;
          } else if (r > 212 && g > 212 && b > 212) {
            const avg = (r + g + b) / 3;
            const alphaFactor = Math.max(0, Math.min(1, (245 - avg) / 33));
            outPng.data[dstIdx] = r;
            outPng.data[dstIdx + 1] = g;
            outPng.data[dstIdx + 2] = b;
            outPng.data[dstIdx + 3] = Math.round(a * alphaFactor);
          } else {
            outPng.data[dstIdx] = r;
            outPng.data[dstIdx + 1] = g;
            outPng.data[dstIdx + 2] = b;
            outPng.data[dstIdx + 3] = a;
          }
        }
      }

      const fileName = `${reg.name}.png`;
      const outFilePath = path.join(outDir, fileName);
      outPng.pack().pipe(fs.createWriteStream(outFilePath));

      manifest.frames[reg.name] = {
        file: `assets/sprites/${fileName}`,
        role: reg.role,
        trimmedWidth: spriteW,
        trimmedHeight: spriteH,
        footBaselineY: targetFootY,
      };
    }

    const manifestPath = path.join(outDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
    console.log(`[SPRITE ANALYZER] ${Object.keys(manifest.frames).length} kare temizlendi ve manifest.json üretildi.`);
  });
