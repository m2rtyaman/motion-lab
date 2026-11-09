// AUTO-GENERATED: scripts/gen-registry.mjs — do not edit manually.
import type { FC } from 'react';
import { Scene as Scene_batman_noir } from './batman-noir/Scene';
import { Scene as Scene_beach_padel_cover } from './beach-padel-cover/Scene';
import { Scene as Scene_claude_motion_reel } from './claude-motion-reel/Scene';
import { Scene as Scene_dwarf_arena } from './dwarf-arena/Scene';
import { Scene as Scene_editorial_telemetry } from './editorial-telemetry/Scene';
import { Scene as Scene_example_editorial_data } from './example-editorial-data/Scene';
import { Scene as Scene_example_feature_tour } from './example-feature-tour/Scene';
import { Scene as Scene_example_kinetic_type } from './example-kinetic-type/Scene';
import { Scene as Scene_example_logo_sting } from './example-logo-sting/Scene';
import { Scene as Scene_example_product_ui } from './example-product-ui/Scene';
import { Scene as Scene_example_social_promo } from './example-social-promo/Scene';
import { Scene as Scene_fintech_teaser } from './fintech-teaser/Scene';
import { Scene as Scene_hybrid_showcase } from './hybrid-showcase/Scene';
import { Scene as Scene_kinetic_loud_showreel } from './kinetic-loud-showreel/Scene';
import { Scene as Scene_kinetic_poster_demo } from './kinetic-poster-demo/Scene';
import { Scene as Scene_lumen_launch } from './lumen-launch/Scene';
import { Scene as Scene_my_video } from './my-video/Scene';
import { Scene as Scene_one_continuous_shape } from './one-continuous-shape/Scene';
import { Scene as Scene_shy_cloud } from './shy-cloud/Scene';
import { Scene as Scene_single_container_broll } from './single-container-broll/Scene';
import { Scene as Scene_study_anticipation_jump } from './study-anticipation-jump/Scene';
import { Scene as Scene_study_arcs_spacing } from './study-arcs-spacing/Scene';
import { Scene as Scene_study_bouncing_ball } from './study-bouncing-ball/Scene';
import { Scene as Scene_study_character_acting } from './study-character-acting/Scene';
import { Scene as Scene_study_character_walk } from './study-character-walk/Scene';
import { Scene as Scene_study_overlap_follow_through } from './study-overlap-follow-through/Scene';
import { Scene as Scene_study_stagger_rhythm } from './study-stagger-rhythm/Scene';
import { Scene as Scene_swiss_kinetic_grid } from './swiss-kinetic-grid/Scene';
import { Scene as Scene_whatsapp_campaign } from './whatsapp-campaign/Scene';
import { Scene as Scene_youtube_player } from './youtube-player/Scene';
import { Scene as Scene_zz_gallery } from './zz-gallery/Scene';

export type ProjectAspect = '9:16' | '16:9' | '1:1';
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
  Scene: FC<any>;
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
    slug: "beach-padel-cover",
    title: "Beach Padel Cover — Sunset 2v2",
    mode: "creative-motion-reel",
    aspect: "16:9",
    fps: 60,
    durationInFrames: 960,
    width: 1920,
    height: 1080,
    Scene: Scene_beach_padel_cover,
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
    slug: "example-editorial-data",
    title: "Editorial Data: Ardmore Cycling",
    mode: "editorial-ui",
    aspect: "16:9",
    fps: 60,
    durationInFrames: 480,
    width: 1920,
    height: 1080,
    Scene: Scene_example_editorial_data,
  },
  {
    slug: "example-feature-tour",
    title: "Feature Tour: Foldline",
    mode: "editorial-ui",
    aspect: "16:9",
    fps: 60,
    durationInFrames: 672,
    width: 1920,
    height: 1080,
    Scene: Scene_example_feature_tour,
  },
  {
    slug: "example-kinetic-type",
    title: "Margin Manifesto",
    mode: "kinetic-poster",
    aspect: "9:16",
    fps: 60,
    durationInFrames: 360,
    width: 1080,
    height: 1920,
    Scene: Scene_example_kinetic_type,
  },
  {
    slug: "example-logo-sting",
    title: "Orbit Logo Sting",
    mode: "editorial-ui",
    aspect: "16:9",
    fps: 60,
    durationInFrames: 240,
    width: 1920,
    height: 1080,
    Scene: Scene_example_logo_sting,
  },
  {
    slug: "example-product-ui",
    title: "Tallybook Month-End",
    mode: "editorial-ui",
    aspect: "16:9",
    fps: 60,
    durationInFrames: 480,
    width: 1920,
    height: 1080,
    Scene: Scene_example_product_ui,
  },
  {
    slug: "example-social-promo",
    title: "Social Promo: Brewmark",
    mode: "cinematic-world",
    aspect: "9:16",
    fps: 60,
    durationInFrames: 480,
    width: 1080,
    height: 1920,
    Scene: Scene_example_social_promo,
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
    slug: "one-continuous-shape",
    title: "One Continuous Morphing Shape",
    mode: "editorial-ui",
    aspect: "1:1",
    fps: 60,
    durationInFrames: 840,
    width: 1440,
    height: 1440,
    Scene: Scene_one_continuous_shape,
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
    slug: "study-anticipation-jump",
    title: "Study: Anticipation Jump",
    mode: "editorial-ui",
    aspect: "16:9",
    fps: 60,
    durationInFrames: 372,
    width: 1920,
    height: 1080,
    Scene: Scene_study_anticipation_jump,
  },
  {
    slug: "study-arcs-spacing",
    title: "Study: Arcs and Spacing",
    mode: "editorial-ui",
    aspect: "16:9",
    fps: 60,
    durationInFrames: 372,
    width: 1920,
    height: 1080,
    Scene: Scene_study_arcs_spacing,
  },
  {
    slug: "study-bouncing-ball",
    title: "Study: Bouncing Ball",
    mode: "editorial-ui",
    aspect: "16:9",
    fps: 60,
    durationInFrames: 402,
    width: 1920,
    height: 1080,
    Scene: Scene_study_bouncing_ball,
  },
  {
    slug: "study-character-acting",
    title: "Study: Character Acting",
    mode: "editorial-ui",
    aspect: "16:9",
    fps: 60,
    durationInFrames: 444,
    width: 1920,
    height: 1080,
    Scene: Scene_study_character_acting,
  },
  {
    slug: "study-character-walk",
    title: "Study: Character Walk",
    mode: "editorial-ui",
    aspect: "16:9",
    fps: 60,
    durationInFrames: 480,
    width: 1920,
    height: 1080,
    Scene: Scene_study_character_walk,
  },
  {
    slug: "study-overlap-follow-through",
    title: "Study: Overlap and Follow-Through",
    mode: "editorial-ui",
    aspect: "16:9",
    fps: 60,
    durationInFrames: 372,
    width: 1920,
    height: 1080,
    Scene: Scene_study_overlap_follow_through,
  },
  {
    slug: "study-stagger-rhythm",
    title: "Study: Stagger Rhythm",
    mode: "editorial-ui",
    aspect: "16:9",
    fps: 60,
    durationInFrames: 348,
    width: 1920,
    height: 1080,
    Scene: Scene_study_stagger_rhythm,
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
  {
    slug: "youtube-player",
    title: "YouTube Player — Authentic Motion Experience",
    mode: "hybrid-orchestrated",
    aspect: "16:9",
    fps: 60,
    durationInFrames: 600,
    width: 1920,
    height: 1080,
    Scene: Scene_youtube_player,
  },
  {
    slug: "zz-gallery",
    title: "Component Gallery",
    mode: "editorial-ui",
    aspect: "16:9",
    fps: 60,
    durationInFrames: 660,
    width: 1920,
    height: 1080,
    Scene: Scene_zz_gallery,
  },
];
