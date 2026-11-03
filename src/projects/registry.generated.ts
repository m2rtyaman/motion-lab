// OTOMATİK ÜRETİLDİ: scripts/gen-registry.mjs — elle düzenleme.
import type { FC } from 'react';
import { Scene as Scene_batman_noir } from './batman-noir/Scene';
import { Scene as Scene_claude_motion_reel } from './claude-motion-reel/Scene';
import { Scene as Scene_dwarf_arena } from './dwarf-arena/Scene';
import { Scene as Scene_editorial_telemetry } from './editorial-telemetry/Scene';
import { Scene as Scene_fintech_teaser } from './fintech-teaser/Scene';
import { Scene as Scene_hybrid_showcase } from './hybrid-showcase/Scene';
import { Scene as Scene_kinetic_loud_showreel } from './kinetic-loud-showreel/Scene';
import { Scene as Scene_kinetic_poster_demo } from './kinetic-poster-demo/Scene';
import { Scene as Scene_lumen_launch } from './lumen-launch/Scene';
import { Scene as Scene_my_video } from './my-video/Scene';
import { Scene as Scene_octosift_ad } from './octosift-ad/Scene';
import { Scene as Scene_octosift_commercial } from './octosift-commercial/Scene';
import { Scene as Scene_shy_cloud } from './shy-cloud/Scene';
import { Scene as Scene_single_container_broll } from './single-container-broll/Scene';
import { Scene as Scene_swiss_kinetic_grid } from './swiss-kinetic-grid/Scene';
import { Scene as Scene_whatsapp_campaign } from './whatsapp-campaign/Scene';

export type ProjectAspect = '9:16' | '16:9';
export type ProjectMode = 'cinematic-world' | 'editorial-ui' | 'kinetic-poster' | 'creative-motion-reel' | 'hybrid-orchestrated';

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
    slug: "batman-noir",
    title: "Batman: Dark Deco Rooftop Ambush",
    mode: "cinematic-world",
    aspect: "16:9",
    fps: 60,
    durationInFrames: 480,
    width: 1920,
    height: 1080,
    Scene: Scene_batman_noir,
  },
  {
    slug: "claude-motion-reel",
    title: "Claude Motion Reel",
    mode: "creative-motion-reel",
    aspect: "16:9",
    fps: 60,
    durationInFrames: 900,
    width: 1920,
    height: 1080,
    Scene: Scene_claude_motion_reel,
  },
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
    slug: "hybrid-showcase",
    title: "Veloce Cloud — Multi-Archetype Release",
    mode: "hybrid-orchestrated",
    aspect: "16:9",
    fps: 60,
    durationInFrames: 600,
    width: 1920,
    height: 1080,
    Scene: Scene_hybrid_showcase,
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
    slug: "lumen-launch",
    title: "LUMEN LAUNCH",
    mode: "editorial-ui",
    aspect: "16:9",
    fps: 60,
    durationInFrames: 840,
    width: 1920,
    height: 1080,
    Scene: Scene_lumen_launch,
  },
  {
    slug: "my-video",
    title: "KORTEX COMPUTE",
    mode: "editorial-ui",
    aspect: "16:9",
    fps: 60,
    durationInFrames: 600,
    width: 1920,
    height: 1080,
    Scene: Scene_my_video,
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
  {
    slug: "shy-cloud",
    title: "Shy Cloud",
    mode: "cinematic-world",
    aspect: "16:9",
    fps: 60,
    durationInFrames: 720,
    width: 1920,
    height: 1080,
    Scene: Scene_shy_cloud,
  },
  {
    slug: "single-container-broll",
    title: "Single Container B-Roll",
    mode: "editorial-ui",
    aspect: "16:9",
    fps: 60,
    durationInFrames: 720,
    width: 1920,
    height: 1080,
    Scene: Scene_single_container_broll,
  },
  {
    slug: "swiss-kinetic-grid",
    title: "Swiss Kinetic Geometry & Corporate Infographics",
    mode: "editorial-ui",
    aspect: "16:9",
    fps: 60,
    durationInFrames: 720,
    width: 1920,
    height: 1080,
    Scene: Scene_swiss_kinetic_grid,
  },
  {
    slug: "whatsapp-campaign",
    title: "WhatsApp Multi-Device Continuity & Group Calls",
    mode: "editorial-ui",
    aspect: "9:16",
    fps: 60,
    durationInFrames: 720,
    width: 1080,
    height: 1920,
    Scene: Scene_whatsapp_campaign,
  },
];
