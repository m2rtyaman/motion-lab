import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { rootDir, rel } from './lib/projects.mjs';

/**
 * MUSIC MAPPER (Opus Animasyon Rehberi Müzik Haritalayıcı)
 *
 * Prompt 6: "Müziği canlı dinletme, önce notaya dök.
 * Şarkının haritasını çıkarır (BPM, vuruşlar, enerji); animasyon bu haritayı okur."
 *
 * Bir ses dosyasını (WAV, MP3) analiz eder; kare bazında RMS enerjisini,
 * vuruşları (beats), güçlü vuruşları (downbeats) ve tepe anlarını music_map.json olarak kaydeder.
 *
 * Kullanım:
 *   node scripts/music-mapper.mjs <dosya-veya-slug> [--fps 60] [--out music_map.json]
 */

const argv = process.argv.slice(2);
const positional = argv.filter((a) => !a.startsWith('-'));
const target = positional[0];

const getArg = (flag, def) => {
  const idx = argv.indexOf(flag);
  return idx !== -1 && argv[idx + 1] ? argv[idx + 1] : def;
};

const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

if (!target) {
  console.error(`${RED}${BOLD}[HATA] Ses dosyası veya proje adı belirtilmedi.${RESET}`);
  console.log('Kullanım: node scripts/music-mapper.mjs <audio.wav | slug> [--fps 60]');
  process.exit(1);
}

// Dosya yolu belirleme: ya doğrudan dosya, ya da proje dizinindeki audio
let audioPath = target;
if (!fs.existsSync(audioPath)) {
  const projAudio = path.join(rootDir, 'src', 'projects', target, 'audio.wav');
  const projMp3 = path.join(rootDir, 'src', 'projects', target, 'audio.mp3');
  const publicAudio = path.join(rootDir, 'public', target);

  if (fs.existsSync(projAudio)) audioPath = projAudio;
  else if (fs.existsSync(projMp3)) audioPath = projMp3;
  else if (fs.existsSync(publicAudio)) audioPath = publicAudio;
}

if (!fs.existsSync(audioPath)) {
  console.error(`${RED}${BOLD}[HATA] Ses dosyası bulunamadı:${RESET} ${target}`);
  process.exit(1);
}

const fps = parseInt(getArg('--fps', '60'), 10);
const tempWav = path.join(rootDir, 'out', 'temp_analysis.wav');
fs.mkdirSync(path.dirname(tempWav), { recursive: true });

console.log(`\n${BOLD}====================================================${RESET}`);
console.log(`${BOLD}   OPUS MUSIC MAPPER (AUDIO-FIRST ENGINE)           ${RESET}`);
console.log(`${BOLD}====================================================${RESET}`);
console.log(`Girdi Dosyası : ${CYAN}${rel(audioPath)}${RESET} | FPS: ${fps}`);

// 1. FFMPEG İLE STANDART 16-BIT 48KHZ MONO PCM ÇEVİRİMİ
const conv = spawnSync(
  'npx',
  ['remotion', 'ffmpeg', '-y', '-i', `"${audioPath}"`, '-ac', '1', '-ar', '48000', '-f', 'wav', `"${tempWav}"`],
  { cwd: rootDir, shell: true, stdio: 'pipe' }
);

if (conv.status !== 0 || !fs.existsSync(tempWav)) {
  console.error(`${RED}FFmpeg ses dönüşümü başarısız oldu.${RESET}`);
  process.exit(1);
}

// 2. WAV PCM PARSING (Node.js Buffer)
const wavBuf = fs.readFileSync(tempWav);
// WAV Header: 44 byte standart
const sampleRate = 48000;
const bytesPerSample = 2; // 16-bit
const dataStart = 44;
const totalSamples = Math.floor((wavBuf.length - dataStart) / bytesPerSample);
const durationSec = totalSamples / sampleRate;
const totalFrames = Math.floor(durationSec * fps);
const samplesPerFrame = Math.floor(sampleRate / fps);

console.log(`Süre          : ${durationSec.toFixed(2)} saniye (${totalFrames} kare)`);

// 3. ENERJİ (RMS) VE GEÇİCİ TEPE (TRANSIENT) TESPİTİ
const rawEnergy = [];
let maxRms = 0;

for (let f = 0; f < totalFrames; f++) {
  const startSample = f * samplesPerFrame;
  let sumSq = 0;
  for (let s = 0; s < samplesPerFrame; s++) {
    const byteOffset = dataStart + (startSample + s) * 2;
    if (byteOffset + 1 < wavBuf.length) {
      const sampleVal = wavBuf.readInt16LE(byteOffset) / 32768.0;
      sumSq += sampleVal * sampleVal;
    }
  }
  const rms = Math.sqrt(sumSq / samplesPerFrame);
  if (rms > maxRms) maxRms = rms;
  rawEnergy.push(rms);
}

// Normalize enerji eğrisi (0.0 – 1.0)
const energy = rawEnergy.map((e) => (maxRms > 0 ? Math.round((e / maxRms) * 1000) / 1000 : 0));

// Vuruş ve Tepe Tespiti (Dynamic Thresholding)
const beats = [];
const downbeats = [];
const peaks = [];

let lastBeatFrame = -999;
const minBeatInterval = Math.round(fps * 0.28); // max ~210 BPM sınırı

for (let f = 1; f < totalFrames - 1; f++) {
  const prev = energy[f - 1];
  const curr = energy[f];
  const next = energy[f + 1];

  // Tepe vuruş
  if (curr > prev && curr >= next && curr > 0.35) {
    if (f - lastBeatFrame >= minBeatInterval) {
      beats.push(f);
      lastBeatFrame = f;

      if (curr > 0.75) {
        peaks.push(f);
      }
    }
  }
}

// Downbeats (ortalama her 4 vuruşta bir)
for (let i = 0; i < beats.length; i += 4) {
  downbeats.push(beats[i]);
}

// Ortalama BPM Hesabı
let bpm = 120;
if (beats.length > 3) {
  const intervals = [];
  for (let i = 1; i < beats.length; i++) {
    intervals.push(beats[i] - beats[i - 1]);
  }
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  bpm = Math.round((fps * 60) / avgInterval);
}

// Geçici dosyayı temizle
try {
  fs.unlinkSync(tempWav);
} catch {}

const outPath = getArg('--out', path.join(path.dirname(audioPath), 'music_map.json'));
const musicMap = {
  version: 1,
  audioFile: path.basename(audioPath),
  durationInSeconds: Math.round(durationSec * 100) / 100,
  fps,
  totalFrames,
  bpm,
  beatCount: beats.length,
  beats,
  downbeats,
  peaks,
  energy,
};

fs.writeFileSync(outPath, JSON.stringify(musicMap, null, 2), 'utf-8');

console.log(`\n${GREEN}✓ Müzik Haritası Başarıyla Üretildi:${RESET} ${rel(outPath)}`);
console.log(`Tahmini BPM   : ${BOLD}${bpm} BPM${RESET}`);
console.log(`Toplam Vuruş  : ${beats.length} beat (${downbeats.length} downbeat, ${peaks.length} doruk anı)`);
console.log(`Örnek Vuruşlar: ${beats.slice(0, 8).join(', ')}...\n`);
