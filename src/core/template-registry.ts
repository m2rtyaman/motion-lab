/**
 * Template Registry for discovering, loading, and searching video templates (RFC-02).
 * Works across both Remotion client bundle (browser/webpack) and Node.js execution environments.
 */

import type { TemplateMetadata } from './html-video-types';
import { TEMPLATES_CATALOG } from '../templates/catalog';

export class TemplateRegistry {
  private templates = new Map<string, TemplateMetadata>();

  constructor() {
    // Automatically seed from declarative catalog so all templates are ready in both browser & node
    for (const t of TEMPLATES_CATALOG) {
      this.register({
        spec_version: 1,
        id: t.id,
        name: t.name,
        description: t.description,
        engine: t.mode === 'native' ? 'remotion' : 'hyperframes',
        engine_version: '1.0.0',
        source_entry: t.entryFile,
        category: t.category as any,
        tags: t.tags,
        best_for: t.bestFor,
        output: {
          formats: ['mp4', 'webm'],
          default_format: 'mp4',
          resolution: {
            default: { width: 1920, height: 1080 },
            supported_aspects: t.supportedAspects,
          },
          fps: { default: 60, supported: [30, 60] },
          duration: { type: 'variable', min_sec: 1, max_sec: 60 },
          alpha: false,
          audio: { supported: true },
        },
        inputs: { schema: {}, examples: [] },
        license: {
          spdx: 'MIT',
          attribution_required: false,
          redistribution_allowed: true,
          commercial_use: true,
        },
        author: { name: 'html-video' },
        version: '1.0.0',
        preview: { poster: '' },
      });
    }
  }

  register(meta: TemplateMetadata): void {
    this.templates.set(meta.id, meta);
  }

  scanSync(rootDir: string): TemplateMetadata[] {
    // Only perform filesystem scanning if running in Node.js environment
    if (typeof process !== 'undefined' && process.versions?.node) {
      try {
        // Dynamic evaluation prevents bundlers (webpack/vite) from breaking on client build
        const fsMod = typeof require !== 'undefined' ? require('fs') : null;
        const pathMod = typeof require !== 'undefined' ? require('path') : null;
        const yamlMod = typeof require !== 'undefined' ? require('yaml') : null;

        if (fsMod && pathMod && yamlMod && fsMod.existsSync(rootDir)) {
          const entries = fsMod.readdirSync(rootDir, { withFileTypes: true });
          const found: TemplateMetadata[] = [];
          for (const entry of entries) {
            if (!entry.isDirectory()) continue;
            const dir = pathMod.join(rootDir, entry.name);
            const yamlPath = pathMod.join(dir, 'template.html-video.yaml');
            if (!fsMod.existsSync(yamlPath)) continue;
            try {
              const raw = fsMod.readFileSync(yamlPath, 'utf8');
              const meta = yamlMod.parse(raw) as TemplateMetadata;
              meta.__dir = dir;
              this.templates.set(meta.id, meta);
              found.push(meta);
            } catch (err) {
              console.warn(`[TemplateRegistry] Failed to parse ${yamlPath}:`, err);
            }
          }
          return found;
        }
      } catch {
        // Fallback to in-memory templates
      }
    }
    return this.list();
  }

  async scan(rootDir: string): Promise<TemplateMetadata[]> {
    return this.scanSync(rootDir);
  }

  get(id: string): TemplateMetadata {
    const t = this.templates.get(id);
    if (!t) {
      throw new Error(`Template "${id}" not found in registry`);
    }
    return t;
  }

  has(id: string): boolean {
    return this.templates.has(id);
  }

  list(): TemplateMetadata[] {
    return [...this.templates.values()];
  }

  search(opts: {
    intent?: string;
    aspect?: string;
    top?: number;
    licenseAllow?: string[];
  }): { template: TemplateMetadata; score: number; reason: string }[] {
    const top = opts.top ?? 5;
    const intentLower = (opts.intent ?? '').toLowerCase();
    const intentTokens = intentLower.split(/\W+/).filter((s) => s.length > 2);

    const scored = this.list().map((tmpl) => {
      let score = 0;
      const reasons: string[] = [];

      // Aspect match
      if (opts.aspect) {
        const aspects = tmpl.output.resolution.supported_aspects;
        if (aspects.includes(opts.aspect)) {
          score += 0.2;
          reasons.push(`matches aspect ${opts.aspect}`);
        } else {
          score -= 0.5;
        }
      }

      // Keyword token match in tags, best_for, name, category, description
      const corpus = [
        tmpl.id,
        tmpl.name,
        tmpl.description,
        tmpl.category,
        tmpl.subcategory ?? '',
        ...tmpl.tags,
        ...tmpl.best_for,
      ]
        .join(' ')
        .toLowerCase();

      for (const tok of intentTokens) {
        if (corpus.includes(tok)) {
          score += 0.3;
          reasons.push(`matches keyword "${tok}"`);
        }
      }

      return {
        template: tmpl,
        score: Math.max(0, Math.min(1, score)),
        reason: reasons.join('; ') || 'default match',
      };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, top);
  }
}

export const defaultTemplateRegistry = new TemplateRegistry();
