// OTOMATİK ÜRETİLDİ: scripts/gen-registry.mjs — elle düzenleme.
import type { FC } from 'react';
import { Scene as Scene_dwarf_arena } from './dwarf-arena/Scene';
import { Scene as Scene_editorial_telemetry } from './editorial-telemetry/Scene';
import { Scene as Scene_fintech_teaser } from './fintech-teaser/Scene';
import { Scene as Scene_kinetic_loud_showreel } from './kinetic-loud-showreel/Scene';
import { Scene as Scene_kinetic_poster_demo } from './kinetic-poster-demo/Scene';
import { Scene as Scene_octosift_ad } from './octosift-ad/Scene';
import { Scene as Scene_octosift_commercial } from './octosift-commercial/Scene';

export type ProjectAspect = '9:16' | '16:9';
export type ProjectMode = 'cinematic-world' | 'editorial-ui' | 'kinetic-poster';

export interface ProjectEntry {
  slug: string;
  title: string;
  mode: ProjectMode;
  aspect: ProjectAspect;
  fps: number;
  durationInFrames: number;
  width: number;
  height: number;
  Scene: FC<{ aspect?: ProjectAspect }>;
}

export const PROJECTS: ProjectEntry[] = [
  {
    slug: "dwarf-arena",
    title: "Berserker Dwarf Arena",
    mode: "cinematic-world",
    aspect: "9:16",
    fps: 60,
    durationInFrames: 360,
    width: 1080,
    height: 1920,
    Scene: Scene_dwarf_arena,
  },
  {
    slug: "editorial-telemetry",
    title: "Cloud Telemetry",
    mode: "editorial-ui",
    aspect: "9:16",
    fps: 60,
    durationInFrames: 240,
    width: 1080,
    height: 1920,
    Scene: Scene_editorial_telemetry,
  },
  {
    slug: "fintech-teaser",
    title: "Institutional Liquidity Terminal Teaser",
    mode: "editorial-ui",
    aspect: "9:16",
    fps: 60,
    durationInFrames: 240,
    width: 1080,
    height: 1920,
    Scene: Scene_fintech_teaser,
  },
  {
    slug: "kinetic-loud-showreel",
    title: "MAKE IT LOUD",
    mode: "editorial-ui",
    aspect: "16:9",
    fps: 60,
    durationInFrames: 600,
    width: 1920,
    height: 1080,
    Scene: Scene_kinetic_loud_showreel,
  },
  {
    slug: "kinetic-poster-demo",
    title: "Ship It Kinetic Poster",
    mode: "kinetic-poster",
    aspect: "9:16",
    fps: 60,
    durationInFrames: 180,
    width: 1080,
    height: 1920,
    Scene: Scene_kinetic_poster_demo,
  },
  {
    slug: "octosift-ad",
    title: "Octosift B2B Lead Engine",
    mode: "editorial-ui",
    aspect: "9:16",
    fps: 60,
    durationInFrames: 360,
    width: 1080,
    height: 1920,
    Scene: Scene_octosift_ad,
  },
  {
    slug: "octosift-commercial",
    title: "OCTOSIFT B2B SAAS",
    mode: "editorial-ui",
    aspect: "16:9",
    fps: 60,
    durationInFrames: 720,
    width: 1920,
    height: 1080,
    Scene: Scene_octosift_commercial,
  },
];
