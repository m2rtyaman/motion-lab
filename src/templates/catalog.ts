/**
 * Pure TypeScript catalog and metadata definitions for all 23 templates.
 * Safe for execution in both Node.js (CLI / audits) and Browser/Remotion bundler.
 */

export interface TemplateCatalogEntry {
  id: string;
  name: string;
  category: string;
  mode: 'native' | 'bridge';
  description: string;
  bestFor: string[];
  tags: string[];
  supportedAspects: ('9:16' | '16:9' | '1:1')[];
  entryFile: string;
}

export const TEMPLATES_CATALOG: TemplateCatalogEntry[] = [
  {
    id: 'frame-data-rollup',
    name: 'Data Rollup',
    category: 'data-viz',
    mode: 'native',
    description: 'Dynamic spring bar growth and interpolated rolling numbers from live data.',
    bestFor: ['KPI rollups', 'GitHub / star metrics', 'QPS / throughput reports'],
    tags: ['data', 'bars', 'rollup', 'spring', 'native'],
    supportedAspects: ['16:9', '9:16', '1:1'],
    entryFile: 'frame-data-rollup/source/DataRollup.tsx',
  },
  {
    id: 'frame-bold-poster',
    name: 'Bold Poster',
    category: 'presentation',
    mode: 'bridge',
    description: '1970s European editorial poster with tilted display Shrikhand headline.',
    bestFor: ['Brand manifesto', 'Editorial statement', 'Vision opener'],
    tags: ['poster', 'editorial', 'bold', 'serif', 'red', 'manifesto'],
    supportedAspects: ['16:9', '9:16', '1:1'],
    entryFile: 'frame-bold-poster/source/index.html',
  },
  {
    id: 'frame-bold-signal',
    name: 'Bold Signal',
    category: 'presentation',
    mode: 'bridge',
    description: 'High-contrast dark-mode signal statement with Archivo Black punch.',
    bestFor: ['Bold announcements', 'Feature drops', 'Punchy title cards'],
    tags: ['bold', 'signal', 'dark', 'punchy', 'orange'],
    supportedAspects: ['16:9', '9:16', '1:1'],
    entryFile: 'frame-bold-signal/source/index.html',
  },
  {
    id: 'frame-build-minimal',
    name: 'Build Minimal',
    category: 'presentation',
    mode: 'bridge',
    description: 'London studio Build-inspired architectural typography and crisp hairlines.',
    bestFor: ['Architectural statements', 'Minimalist SaaS', 'Design systems'],
    tags: ['minimal', 'build', 'editorial', 'swiss', 'hairline'],
    supportedAspects: ['16:9', '9:16'],
    entryFile: 'frame-build-minimal/source/index.html',
  },
  {
    id: 'frame-creative-voltage',
    name: 'Creative Voltage',
    category: 'presentation',
    mode: 'bridge',
    description: 'Vibrant electric gradient energy for bold creative headlines.',
    bestFor: ['Creative showcases', 'Agency reels', 'Dynamic drops'],
    tags: ['creative', 'electric', 'vibrant', 'voltage'],
    supportedAspects: ['16:9', '9:16'],
    entryFile: 'frame-creative-voltage/source/index.html',
  },
  {
    id: 'frame-data-chart-nyt',
    name: 'NYT Data Chart',
    category: 'data-viz',
    mode: 'bridge',
    description: 'New York Times style journalistic data visualization with animated line drawing.',
    bestFor: ['Data journalism', 'Market share trends', 'Historical data'],
    tags: ['chart', 'nyt', 'journalism', 'data', 'line-chart'],
    supportedAspects: ['16:9', '9:16'],
    entryFile: 'frame-data-chart-nyt/source/index.html',
  },
  {
    id: 'frame-decision-tree',
    name: 'Decision Tree',
    category: 'explainer',
    mode: 'bridge',
    description: 'Interactive branching decision tree visualizing user choices or logic paths.',
    bestFor: ['Workflow explainers', 'Decision logic', 'Product flow'],
    tags: ['tree', 'decision', 'flowchart', 'logic'],
    supportedAspects: ['16:9', '9:16'],
    entryFile: 'frame-decision-tree/index.html',
  },
  {
    id: 'frame-electric-studio',
    name: 'Electric Studio',
    category: 'presentation',
    mode: 'bridge',
    description: 'High-energy typography with glowing accents for electronic product reveals.',
    bestFor: ['Hardware drops', 'Fast paced teasers', 'Brand intros'],
    tags: ['electric', 'studio', 'dark', 'neon-accent'],
    supportedAspects: ['16:9', '9:16'],
    entryFile: 'frame-electric-studio/source/index.html',
  },
  {
    id: 'frame-glitch-title',
    name: 'Glitch Title',
    category: 'presentation',
    mode: 'bridge',
    description: 'Digital cyber glitch text reveal with chromatic aberration displacement.',
    bestFor: ['Cyberpunk', 'Developer tools', 'Tech manifestos'],
    tags: ['glitch', 'cyber', 'chromatic', 'title'],
    supportedAspects: ['16:9', '9:16'],
    entryFile: 'frame-glitch-title/source/index.html',
  },
  {
    id: 'frame-kinetic-type',
    name: 'Kinetic Type',
    category: 'social-shorts',
    mode: 'bridge',
    description: 'Rapid kinetic typography rhythm sync for bold word bursts.',
    bestFor: ['Viral reels', 'Social teasers', 'Pacing manifestos'],
    tags: ['kinetic', 'typography', 'fast', 'burst'],
    supportedAspects: ['16:9', '9:16'],
    entryFile: 'frame-kinetic-type/index.html',
  },
  {
    id: 'frame-light-leak-cinema',
    name: 'Light Leak Cinema',
    category: 'ambient',
    mode: 'bridge',
    description: 'Atmospheric optical light leaks and organic warm grain overlays.',
    bestFor: ['Cinematic openers', 'Documentary intro', 'Warm memory'],
    tags: ['light-leak', 'cinema', 'grain', 'warm'],
    supportedAspects: ['16:9', '9:16'],
    entryFile: 'frame-light-leak-cinema/source/index.html',
  },
  {
    id: 'frame-liquid-bg-hero',
    name: 'Liquid BG Hero',
    category: 'marketing',
    mode: 'bridge',
    description: 'Mesmerizing organic liquid shader motion for luxury landing headers.',
    bestFor: ['SaaS heroes', 'Fintech landings', 'Luxury branding'],
    tags: ['liquid', 'shader', 'organic', 'hero'],
    supportedAspects: ['16:9', '9:16'],
    entryFile: 'frame-liquid-bg-hero/source/index.html',
  },
  {
    id: 'frame-logo-outro',
    name: 'Logo Outro',
    category: 'intro-outro',
    mode: 'bridge',
    description: 'Polished brand resolve with kinetic badge settling and call to action.',
    bestFor: ['Video outro', 'Brand signature', 'Final CTA'],
    tags: ['logo', 'outro', 'cta', 'branding'],
    supportedAspects: ['16:9', '9:16'],
    entryFile: 'frame-logo-outro/source/index.html',
  },
  {
    id: 'frame-nyt-graph',
    name: 'NYT Graph',
    category: 'data-viz',
    mode: 'bridge',
    description: 'Classic serif editorial typography with animated data curves and callouts.',
    bestFor: ['In-depth data report', 'Economic telemetry', 'Editorial research'],
    tags: ['nyt', 'graph', 'editorial', 'telemetry'],
    supportedAspects: ['16:9', '9:16'],
    entryFile: 'frame-nyt-graph/index.html',
  },
  {
    id: 'frame-pentagram-stat',
    name: 'Pentagram Stat',
    category: 'presentation',
    mode: 'bridge',
    description: 'Michael Bierut Pentagram-inspired editorial stat display with large numerals.',
    bestFor: ['Key statistical highlights', 'Annual reports', 'Investor pitch'],
    tags: ['pentagram', 'stat', 'editorial', 'numerals'],
    supportedAspects: ['16:9', '9:16'],
    entryFile: 'frame-pentagram-stat/source/index.html',
  },
  {
    id: 'frame-play-mode',
    name: 'Play Mode',
    category: 'social-shorts',
    mode: 'bridge',
    description: 'Playful UI widgets, bouncy physics, and responsive status cards.',
    bestFor: ['Mobile apps', 'Consumer tech', 'Interactive features'],
    tags: ['play', 'bouncy', 'widgets', 'mobile'],
    supportedAspects: ['16:9', '9:16'],
    entryFile: 'frame-play-mode/index.html',
  },
  {
    id: 'frame-product-promo',
    name: 'Product Promo',
    category: 'product-demo',
    mode: 'bridge',
    description: 'Comprehensive 5-beat product tour with feature canvas and telemetry callouts.',
    bestFor: ['Product launches', 'Feature explainers', 'Demo teasers'],
    tags: ['product', 'demo', 'promo', 'saas'],
    supportedAspects: ['16:9', '9:16'],
    entryFile: 'frame-product-promo/index.html',
  },
  {
    id: 'frame-product-promo-30s',
    name: 'Product Promo 30s',
    category: 'product-demo',
    mode: 'bridge',
    description: 'Full 30-second commercial suite across 8 structured narrative beats.',
    bestFor: ['Full commercials', 'Brand spots', 'YouTube ads'],
    tags: ['commercial', '30s', 'narrative', 'promo'],
    supportedAspects: ['16:9', '9:16'],
    entryFile: 'frame-product-promo-30s/index.html',
  },
  {
    id: 'frame-swiss-grid',
    name: 'Swiss Grid',
    category: 'presentation',
    mode: 'bridge',
    description: 'Strict International Typographic Style Swiss grid layout with disciplined layout lines.',
    bestFor: ['Swiss design', 'High-end B2B', 'Editorial layout'],
    tags: ['swiss', 'grid', 'helvetica', 'international'],
    supportedAspects: ['16:9', '9:16'],
    entryFile: 'frame-swiss-grid/index.html',
  },
  {
    id: 'frame-takram-organic',
    name: 'Takram Organic',
    category: 'presentation',
    mode: 'bridge',
    description: 'Takram Tokyo-inspired organic radar pulses and calm data rings.',
    bestFor: ['Future tech', 'AI platforms', 'Biotech telemetry'],
    tags: ['takram', 'organic', 'radar', 'circles'],
    supportedAspects: ['16:9', '9:16'],
    entryFile: 'frame-takram-organic/source/index.html',
  },
  {
    id: 'frame-vignelli',
    name: 'Vignelli',
    category: 'presentation',
    mode: 'bridge',
    description: 'Massimo Vignelli subway-map clarity with stark primary accents and unyielding discipline.',
    bestFor: ['Design manifestos', 'System clarity', 'Classic modernist'],
    tags: ['vignelli', 'modernist', 'subway', 'grid'],
    supportedAspects: ['16:9', '9:16'],
    entryFile: 'frame-vignelli/index.html',
  },
  {
    id: 'frame-warm-grain',
    name: 'Warm Grain',
    category: 'ambient',
    mode: 'bridge',
    description: 'Tactile paper grain, soft shadows, and warm editorial letterpress presence.',
    bestFor: ['Print aesthetic', 'Warm editorial', 'Subtle prestige'],
    tags: ['warm', 'grain', 'paper', 'letterpress'],
    supportedAspects: ['16:9', '9:16'],
    entryFile: 'frame-warm-grain/index.html',
  },
  {
    id: 'vfx-text-cursor',
    name: 'Text Cursor VFX',
    category: 'social-shorts',
    mode: 'bridge',
    description: 'Realistic typing terminal cursor with blinking cadence and line completion.',
    bestFor: ['Code reveals', 'Terminal prompts', 'AI agent typing'],
    tags: ['cursor', 'terminal', 'typing', 'code'],
    supportedAspects: ['16:9', '9:16'],
    entryFile: 'vfx-text-cursor/source/index.html',
  },
];

import { RAW_HTML_MANIFEST } from './html-manifest.generated.ts';

export function getTemplateById(id: string): TemplateCatalogEntry | undefined {
  return TEMPLATES_CATALOG.find((t) => t.id === id);
}

export function getTemplateRawHtml(id: string): string | undefined {
  const entry = getTemplateById(id);
  if (!entry || entry.mode === 'native') return undefined;

  // 1. Direct template ID lookup (pre-hydrated with compositions and assets)
  if (RAW_HTML_MANIFEST[id]) {
    return RAW_HTML_MANIFEST[id];
  }

  // 2. Direct entry file lookup
  const targetPath = entry.entryFile.replace(/\\/g, '/');
  if (RAW_HTML_MANIFEST[targetPath]) {
    return RAW_HTML_MANIFEST[targetPath];
  }

  // 3. Suffix match for normalized entry path
  for (const [key, content] of Object.entries(RAW_HTML_MANIFEST)) {
    const normKey = key.replace(/\\/g, '/');
    if (normKey === targetPath || normKey.endsWith('/' + targetPath)) {
      return content;
    }
  }

  return undefined;
}
