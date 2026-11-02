/**
 * Remotion render bridge and adapter utilities (RFC-08).
 */

import type { EngineCapabilities, OutputCapabilities, RenderConfig } from '../core/html-video-types';

export const REMOTION_CAPABILITIES: EngineCapabilities = {
  paradigms: ['react-tsx', 'html-css-gsap'],
  outputFormats: ['mp4', 'webm', 'gif', 'png-sequence'],
  maxResolution: { width: 7680, height: 4320 },
  alpha: true,
  audio: 'multi',
  subtitles: ['burn-in', 'sidecar'],
  renderTarget: ['local-chromium', 'lambda', 'cloud-run'],
  licensing: 'commercial-restricted',
  renderSpeedHint: {
    resolution: '1080p',
    durationSec: 10,
    fps: 60,
    estimatedRenderSec: 25,
  },
  bestFor: [
    'data-driven',
    'long-form-narration',
    'spring-physics',
    'parametric-batch',
    'editorial-saas',
    'react-ecosystem',
  ],
  weaknesses: [
    'commercial-license-for-teams-gt-3',
    'css-gsap-needs-time-driver-bridge',
  ],
};

import { DEFAULT_FRAME_DURATION_SEC } from '../core/content-graph';

export function createDefaultRenderConfig(opts?: Partial<RenderConfig>): RenderConfig {
  const defaultDuration = DEFAULT_FRAME_DURATION_SEC * 2;
  return {
    format: 'mp4',
    resolution: { width: 1080, height: 1920 }, // 9:16 default
    fps: 60,
    duration: defaultDuration,
    durationMode: 'explicit',
    outputPath: 'out/render.mp4',
    quality: 'high',
    ...opts,
  };
}

export function computeOutputCapabilities(aspect: '9:16' | '16:9' = '9:16'): OutputCapabilities {
  const isPortrait = aspect === '9:16';
  return {
    formats: ['mp4', 'webm'],
    default_format: 'mp4',
    resolution: {
      default: isPortrait ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 },
      supported_aspects: ['9:16', '16:9', '1:1'],
    },
    fps: {
      default: 60,
      supported: [30, 60],
    },
    duration: {
      type: 'variable',
      min_sec: 1,
      max_sec: 60,
    },
    alpha: false,
    audio: {
      supported: true,
      expected_inputs: ['bgm', 'sfx'],
    },
  };
}
