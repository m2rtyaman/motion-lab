import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const sfxDir = path.join(rootDir, 'public', 'sfx');

if (!fs.existsSync(sfxDir)) {
  fs.mkdirSync(sfxDir, { recursive: true });
}

const SAMPLE_RATE = 44100;

/**
 * 16-Bit Mono PCM WAV Dosyası Yazıcı
 */
function writeWav(filename, samplesFloat32) {
  const numSamples = samplesFloat32.length;
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF Header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(1, 22);  // NumChannels (1 = Mono)
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28); // ByteRate
  buffer.writeUInt16LE(2, 32);  // BlockAlign
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, samplesFloat32[i]));
    const intVal = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    buffer.writeInt16LE(Math.round(intVal), 44 + i * 2);
  }

  const outPath = path.join(sfxDir, filename);
  fs.writeFileSync(outPath, buffer);
  console.log(`[SFX GENERATOR] Üretildi: public/sfx/${filename} (${(buffer.length / 1024).toFixed(1)} kB)`);
}

// Deterministic pseudo-random noise
let seed = 42;
function nextNoise() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return (seed / 2147483648) - 1;
}

// 1. TAŞ ZEMİN ADIM SESİ (step-stone.wav — 0.14s)
{
  const duration = 0.14;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 42);
    // Low thud (110Hz -> 48Hz) + stone grit transient
    const freq = 48 + 75 * Math.exp(-t * 55);
    const thud = Math.sin(2 * Math.PI * freq * t) * 0.65;
    const grit = nextNoise() * Math.exp(-t * 85) * 0.45;
    samples[i] = (thud + grit) * env * 0.85;
  }
  writeWav('step-stone.wav', samples);
}

// 2. Savaş Çığlığı & Sonik Şok Dalgası (roar-shockwave.wav — 0.95s)
{
  const duration = 0.95;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    const attack = Math.min(1, t / 0.035);
    const decay = Math.exp(-t * 3.4);
    const env = attack * decay;

    // Sub-bass shockwave impact (95Hz -> 34Hz)
    const subFreq = 34 + 62 * Math.exp(-t * 8);
    const sub = Math.sin(2 * Math.PI * subFreq * t) * 0.55;

    // Aggressive vocal/brass formants (saw-like harmonics + vibrato)
    const vibrato = Math.sin(2 * Math.PI * 14 * t) * 6;
    const f0 = 142 + vibrato - t * 22;
    const roarHarmonics =
      0.35 * Math.sin(2 * Math.PI * f0 * t) +
      0.28 * Math.sin(2 * Math.PI * (f0 * 2.02) * t) +
      0.18 * Math.sin(2 * Math.PI * (f0 * 3.01) * t) +
      0.12 * Math.sin(2 * Math.PI * (f0 * 4.5) * t);

    // Roar breath / shockwave air burst
    const airBurst = nextNoise() * Math.exp(-t * 5.5) * 0.28;

    samples[i] = Math.tanh((sub + roarHarmonics + airBurst) * 1.4) * env * 0.85;
  }
  writeWav('roar-shockwave.wav', samples);
}

// 3. Kamera Pan & Hızlı Dönüş Rüzgarı (whoosh-pan.wav — 0.42s)
{
  const duration = 0.42;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  let lpState = 0;
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    const norm = t / duration;
    const env = Math.sin(Math.PI * norm) ** 1.8;
    const cutoff = 0.04 + 0.18 * Math.sin(Math.PI * norm);
    const raw = nextNoise();
    lpState += cutoff * (raw - lpState);
    const tone = Math.sin(2 * Math.PI * (90 + 110 * Math.sin(Math.PI * norm)) * t) * 0.25;
    samples[i] = (lpState * 0.8 + tone) * env * 0.7;
  }
  writeWav('whoosh-pan.wav', samples);
}

// 4. Editorial UI Kilit Sesi (ui-lock.wav — 0.09s)
{
  const duration = 0.09;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 65);
    const click =
      Math.sin(2 * Math.PI * 1200 * t) * 0.5 +
      Math.sin(2 * Math.PI * 2400 * t) * 0.3 +
      nextNoise() * Math.exp(-t * 140) * 0.3;
    samples[i] = click * env * 0.6;
  }
  writeWav('ui-lock.wav', samples);
}
