/**
 * PROCEDURAL AUDIO ENGINE (Opus Animasyon Rehberi Web Audio Sentezleyicisi)
 * 
 * MOTION_RULES.md: "Ses verilmezse Web Audio ile sentezle.
 * Her ses ekranda görünen bir olaya bağlı olsun."
 * 
 * Harici WAV/MP3 dosyası aramaya gerek kalmadan; buton tıkı, kart oturması,
 * geçiş hışırtısı ve sub-bass vuruşlarını matematiksel sinüs ve gürültü eğrileriyle üretir.
 */

export type AudioCueType = 'click' | 'thud' | 'whoosh' | 'chime';

export interface AudioCue {
  type: AudioCueType;
  /** Başlangıç saniyesi */
  at: number;
  /** Ses seviyesi (0.0 – 1.0) */
  gain?: number;
}

/**
 * 16-bit 44.1kHz mono PCM WAV tamponu üretir.
 * Tamamen deterministik ve çevrimdışıdır; Remotion çıktısına eklenebilir.
 */
export function synthesizeProceduralWav(
  cues: AudioCue[],
  durationSec: number,
  sampleRate = 44100
): Uint8Array {
  const totalSamples = Math.floor(durationSec * sampleRate);
  const floatBuffer = new Float32Array(totalSamples);

  cues.forEach((cue) => {
    const startSample = Math.floor(cue.at * sampleRate);
    const gain = cue.gain ?? 0.8;

    switch (cue.type) {
      case 'click': {
        // Yüksek frekanslı keskin tıklama (1000Hz -> 200Hz, 8ms)
        const dur = Math.floor(sampleRate * 0.015);
        for (let i = 0; i < dur && startSample + i < totalSamples; i++) {
          const t = i / sampleRate;
          const env = Math.exp(-i / (sampleRate * 0.003));
          const freq = 1200 - 800 * (i / dur);
          floatBuffer[startSample + i] += Math.sin(2 * Math.PI * freq * t) * env * gain * 0.7;
        }
        break;
      }

      case 'thud': {
        // Tok bas oturması (120Hz -> 35Hz, 140ms)
        const dur = Math.floor(sampleRate * 0.18);
        for (let i = 0; i < dur && startSample + i < totalSamples; i++) {
          const t = i / sampleRate;
          const env = Math.exp(-i / (sampleRate * 0.04));
          const freq = 130 * Math.exp(-i / (sampleRate * 0.05));
          floatBuffer[startSample + i] += Math.sin(2 * Math.PI * freq * t) * env * gain * 0.9;
        }
        break;
      }

      case 'whoosh': {
        // Yumuşak geçiş hışırtısı (Filtrelenmiş gürültü, 250ms)
        const dur = Math.floor(sampleRate * 0.28);
        let b0 = 0, b1 = 0;
        for (let i = 0; i < dur && startSample + i < totalSamples; i++) {
          // Band-pass gürültü benzetimi
          const white = (Math.sin(i * 1337.1) * 43758.5453) % 1;
          b0 = 0.92 * b0 + white * 0.08;
          b1 = 0.92 * b1 + b0 * 0.08;
          const env = Math.sin((Math.PI * i) / dur);
          floatBuffer[startSample + i] += (b0 - b1) * env * gain * 0.6;
        }
        break;
      }

      case 'chime': {
        // Başarı / tescil pırıltısı (1760Hz çift harmonik, 350ms)
        const dur = Math.floor(sampleRate * 0.35);
        for (let i = 0; i < dur && startSample + i < totalSamples; i++) {
          const t = i / sampleRate;
          const env = Math.exp(-i / (sampleRate * 0.08));
          const s1 = Math.sin(2 * Math.PI * 880 * t);
          const s2 = Math.sin(2 * Math.PI * 1760 * t) * 0.5;
          floatBuffer[startSample + i] += (s1 + s2) * env * gain * 0.5;
        }
        break;
      }
    }
  });

  // WAV başlığı oluşturma (44 byte)
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  // RIFF
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + totalSamples * 2, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"
  // fmt
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // PCM Chunk size
  view.setUint16(20, 1, true); // Linear PCM
  view.setUint16(22, 1, true); // 1 Channel (Mono)
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // Byte rate
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // 16 bits per sample
  // data
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, totalSamples * 2, true);

  // AAC sample-0 digital guard to prevent MDCT pre-echo/pops on t=0 impacts
  applySample0Guard(floatBuffer, sampleRate, 2.0);

  // Float buffer'ı 16-bit PCM'e çevir
  const wavBytes = new Uint8Array(44 + totalSamples * 2);
  wavBytes.set(new Uint8Array(header), 0);

  let byteIdx = 44;
  for (let i = 0; i < totalSamples; i++) {
    const s = Math.max(-1, Math.min(1, floatBuffer[i]));
    const int16 = s < 0 ? s * 0x8000 : s * 0x7fff;
    wavBytes[byteIdx] = int16 & 0xff;
    wavBytes[byteIdx + 1] = (int16 >> 8) & 0xff;
    byteIdx += 2;
  }

  return wavBytes;
}

/**
 * Applies a micro-fade window at sample 0 to prevent AAC / MP3 MDCT pre-echo,
 * DC offset pops, and digital clipping on hard impacts starting at t=0.
 * 
 * @param buffer Float32Array PCM audio buffer
 * @param sampleRate Sampling rate in Hz
 * @param fadeMs Micro-fade duration in milliseconds (default 2.0ms)
 */
export function applySample0Guard(
  buffer: Float32Array,
  sampleRate: number,
  fadeMs: number = 2.0
): void {
  if (!buffer || buffer.length === 0) return;
  const safeSampleRate = Number.isFinite(sampleRate) && sampleRate > 0 ? sampleRate : 44100;
  const safeFadeMs = Number.isFinite(fadeMs) && fadeMs > 0 ? fadeMs : 2.0;
  const fadeSamples = Math.min(buffer.length, Math.max(1, Math.floor(safeSampleRate * (safeFadeMs / 1000))));
  for (let i = 0; i < fadeSamples; i++) {
    // Half-Hann raised cosine micro-fade
    const factor = 0.5 * (1 - Math.cos((Math.PI * i) / fadeSamples));
    buffer[i] *= factor;
  }
  buffer[0] = 0;
}
