import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { rootDir, rel } from './lib/projects.mjs';

/**
 * MUSIC MAPPER (Motion Lab animation guide: music mapper)
 *
 * Prompt 6: "Don't play the music live; transcribe it to notes first.
 * Extracts the song map (BPM, beats, energy); animation reads this map."
 *
 * Analyzes an audio file (WAV, MP3) and records per-frame RMS energy,
 * beats, downbeats and peak moments to music_map.json.
 *
 * Usage:
 *   node scripts/music-mapper.mjs <file-or-slug> [--fps 60] [--out music_map.json]
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
  console.error(`${RED}${BOLD}[ERROR] No audio file or project name specified.${RESET}`);
  console.log('Usage: node scripts/music-mapper.mjs <audio.wav | slug> [--fps 60]');
  process.exit(1);
}

// Resolve file path: either a direct file, or the audio file in the project directory
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
  console.error(`${RED}${BOLD}[ERROR] Audio file not found:${RESET} ${target}`);
  process.exit(1);
}

const fps = parseInt(getArg('--fps', '60'), 10);
const tempWav = path.join(rootDir, 'out', 'temp_analysis.wav');
fs.mkdirSync(path.dirname(tempWav), { recursive: true });

console.log(`\n${BOLD}====================================================${RESET}`);
console.log(`${BOLD}   MOTION LAB MUSIC MAPPER (AUDIO-FIRST ENGINE)           ${RESET}`);
console.log(`${BOLD}====================================================${RESET}`);
console.log(`Input File    : ${CYAN}${rel(audioPath)}${RESET} | FPS: ${fps}`);

// 1. CONVERT TO STANDARD 16-BIT 48KHZ MONO PCM WITH FFMPEG
const conv = spawnSync(
  'npx',
  ['remotion', 'ffmpeg', '-y', '-i', `"${audioPath}"`, '-ac', '1', '-ar', '48000', '-f', 'wav', `"${tempWav}"`],
  { cwd: rootDir, shell: true, stdio: 'pipe' }
);

if (conv.status !== 0 || !fs.existsSync(tempWav)) {
  console.error(`${RED}FFmpeg audio conversion failed.${RESET}`);
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

console.log(`Duration      : ${durationSec.toFixed(2)} seconds (${totalFrames} frames)`);

// 3. ENERGY (RMS) AND TRANSIENT PEAK DETECTION
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

// Normalize energy curve (0.0 – 1.0)
const energy = rawEnergy.map((e) => (maxRms > 0 ? Math.round((e / maxRms) * 1000) / 1000 : 0));

// Beat and Peak Detection (Dynamic Thresholding)
const beats = [];
const downbeats = [];
const peaks = [];

let lastBeatFrame = -999;
const minBeatInterval = Math.round(fps * 0.28); // max ~210 BPM limit

for (let f = 1; f < totalFrames - 1; f++) {
  const prev = energy[f - 1];
  const curr = energy[f];
  const next = energy[f + 1];

  // Peak beat
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

// Downbeats (roughly every 4 beats)
for (let i = 0; i < beats.length; i += 4) {
  downbeats.push(beats[i]);
}

// Average BPM calculation
let bpm = 120;
if (beats.length > 3) {
  const intervals = [];
  for (let i = 1; i < beats.length; i++) {
    intervals.push(beats[i] - beats[i - 1]);
  }
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  bpm = Math.round((fps * 60) / avgInterval);
}

// Clean up temp file
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

console.log(`\n${GREEN}✓ Music map generated successfully:${RESET} ${rel(outPath)}`);
console.log(`Tahmini BPM   : ${BOLD}${bpm} BPM${RESET}`);
console.log(`Total Beats   : ${beats.length} beats (${downbeats.length} downbeats, ${peaks.length} peak moments)`);
console.log(`Sample Beats : ${beats.slice(0, 8).join(', ')}...\n`);
