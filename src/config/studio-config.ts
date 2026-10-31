export type StudioSceneMode =
  | 'cinematic-world' // 2.5D Karakter, Sprite, Oyun & Mekan Sahnesi (Sıfır HUD, Tam Ekran)
  | 'editorial-ui'    // Apple/Linear/SaaS Cam Kartlar, Diyalog & Telemetri
  | 'kinetic-poster'; // Tam Ekran Kinetik Tipografi & Reklam

export type StudioAspectRatio = '9:16' | '16:9';

export interface StudioConfig {
  mode: StudioSceneMode;
  aspect: StudioAspectRatio;
  fps: number;
  durationInSeconds: number;
  enableAudioSfx: boolean;
}

/**
 * Merkezi Stüdyo Yapılandırması
 * Aktif sahnenin paradigmasını, oranını ve süresini tek noktadan yönetir.
 */
export const STUDIO_CONFIG: StudioConfig = {
  mode: 'cinematic-world',
  aspect: '9:16',
  fps: 60,
  durationInSeconds: 6,
  enableAudioSfx: true,
};

export const getTotalFrames = (config: StudioConfig = STUDIO_CONFIG): number =>
  Math.round(config.durationInSeconds * config.fps);
