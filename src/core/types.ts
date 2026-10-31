import type { EASING, DURATIONS, SPRING, PALETTE } from "./tokens";

export type EasingKey = keyof typeof EASING;
export type DurationKey = keyof typeof DURATIONS;
export type SpringPresetKey = keyof typeof SPRING;
export type PaletteKey = keyof typeof PALETTE;

export type PlaybackSpeed = 1 | 0.5;

export interface StageState {
  replayCount: number;
  speed: PlaybackSpeed;
}
