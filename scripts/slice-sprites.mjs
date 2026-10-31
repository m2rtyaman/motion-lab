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

// Bounding boxes extracted from source
const SPRITE_DEFS = [
  { name: 'idle', minX: 70, maxX: 175, minY: 73, maxY: 167, footY: 167 },
  { name: 'run_1', minX: 192, maxX: 310, minY: 67, maxY: 167, footY: 167 },
  { name: 'run_2', minX: 324, maxX: 438, minY: 44, maxY: 167, footY: 167 },
  { name: 'jump', minX: 442, maxX: 540, minY: 35, maxY: 167, footY: 167 },
  { name: 'shield', minX: 70, maxX: 175, minY: 225, maxY: 318, footY: 318 },
  { name: 'shout', minX: 465, maxX: 550, minY: 220, maxY: 320, footY: 320 },
];

fs.createReadStream(inputPath)
  .pipe(new PNG())
  .on('parsed', function () {
    const totalW = this.width;

    const canvasW = 160;
    const canvasH = 160;
    const targetFootY = 145; // Uniform ground baseline

    for (const def of SPRITE_DEFS) {
      const spriteW = def.maxX - def.minX + 1;
      const spriteH = def.maxY - def.minY + 1;

      const destX = Math.round((canvasW - spriteW) / 2);
      const destY = targetFootY - spriteH;

      const outPng = new PNG({ width: canvasW, height: canvasH });

      // Initialize all transparent
      for (let i = 0; i < canvasW * canvasH * 4; i += 4) {
        outPng.data[i] = 0;
        outPng.data[i + 1] = 0;
        outPng.data[i + 2] = 0;
        outPng.data[i + 3] = 0;
      }

      for (let y = 0; y < spriteH; y++) {
        for (let x = 0; x < spriteW; x++) {
          const srcX = def.minX + x;
          const srcY = def.minY + y;
          const srcIdx = (totalW * srcY + srcX) << 2;

          const dx = destX + x;
          const dy = destY + y;
          if (dx < 0 || dx >= canvasW || dy < 0 || dy >= canvasH) continue;
          const dstIdx = (canvasW * dy + dx) << 2;

          const red = this.data[srcIdx];
          const green = this.data[srcIdx + 1];
          const blue = this.data[srcIdx + 2];
          const alpha = this.data[srcIdx + 3];

          // Threshold for white background removal
          if (red > 235 && green > 235 && blue > 235) {
            // pure transparent
          } else if (red > 215 && green > 215 && blue > 215) {
            const avg = (red + green + blue) / 3;
            const factor = (255 - avg) / 40;
            outPng.data[dstIdx] = red;
            outPng.data[dstIdx + 1] = green;
            outPng.data[dstIdx + 2] = blue;
            outPng.data[dstIdx + 3] = Math.round(alpha * factor);
          } else {
            outPng.data[dstIdx] = red;
            outPng.data[dstIdx + 1] = green;
            outPng.data[dstIdx + 2] = blue;
            outPng.data[dstIdx + 3] = alpha;
          }
        }
      }

      const outFilePath = path.join(outDir, `${def.name}.png`);
      outPng.pack().pipe(fs.createWriteStream(outFilePath));
      console.log(`Cleaned & Aligned: ${outFilePath}`);
    }
  });
