import fs from 'node:fs';
import path from 'node:path';

const TEMPLATES_DIR = path.resolve('src/templates');
const OUTPUT_FILE = path.resolve('src/templates/html-manifest.generated.ts');

function mimeTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.svg':
      return 'image/svg+xml';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.mp3':
      return 'audio/mpeg';
    default:
      return 'application/octet-stream';
  }
}

function inlineLocalAssets(html, baseDir) {
  // Replace src="assets/..." or url('assets/...') with data URIs
  return html.replace(/(?:src=["']|url\(["']?)(assets\/[^"'\)]+)["']?\)?/g, (match, relPath) => {
    const fullPath = path.join(baseDir, relPath);
    if (fs.existsSync(fullPath)) {
      const mime = mimeTypeFor(fullPath);
      const data = fs.readFileSync(fullPath).toString('base64');
      const dataUri = `data:${mime};base64,${data}`;
      return match.replace(relPath, dataUri);
    }
    return match;
  });
}

function prepareMultiCompHtml(entryHtml, baseDir) {
  const srcMatches = Array.from(entryHtml.matchAll(/data-composition-src=["']([^"']+)["']/g));
  if (srcMatches.length === 0) {
    return inlineLocalAssets(entryHtml, baseDir);
  }

  const compMap = {};
  for (const m of srcMatches) {
    const rel = m[1];
    if (compMap[rel] !== undefined) continue;
    const compPath = path.join(baseDir, rel);
    if (!fs.existsSync(compPath)) continue;
    let compRaw = fs.readFileSync(compPath, 'utf8');
    compRaw = inlineLocalAssets(compRaw, baseDir);
    compMap[rel] = compRaw;
  }

  let inlinedHtml = inlineLocalAssets(entryHtml, baseDir);
  inlinedHtml = inlinedHtml
    .replace(/__VIDEO_DURATION__/g, '15')
    .replace(/__VIDEO_SRC__/g, 'data:video/mp4;base64,');

  const safeJson = JSON.stringify(compMap).replace(/<\//g, '<\\/').replace(/<!--/g, '<\\!--');
  const headScript = `<script>window.__timelines=window.__timelines||{};window.__COMPOSITIONS__=${safeJson};</script>`;
  
  let out = /<head[^>]*>/i.test(inlinedHtml)
    ? inlinedHtml.replace(/<head[^>]*>/i, (mm) => `${mm}\n${headScript}`)
    : `${headScript}\n${inlinedHtml}`;

  const playerScript = `
<script>
(function () {
  function reexec(root) {
    root.querySelectorAll('script').forEach(function (old) {
      if (old.src) { old.parentNode.removeChild(old); return; }
      var s = document.createElement('script');
      s.textContent = '{\\n' + old.textContent + '\\n}';
      old.parentNode.replaceChild(s, old);
    });
  }
  function mountOne(host) {
    var src = host.getAttribute('data-composition-src');
    var text = (window.__COMPOSITIONS__ || {})[src];
    if (!text) return;
    var holder = document.createElement('div');
    holder.innerHTML = text;
    var tpl = holder.querySelector('template');
    host.appendChild(tpl ? tpl.content.cloneNode(true) : holder);
    reexec(host);
  }
  window.__hvPlayAll = function () {
    var tls = window.__timelines || {};
    Object.keys(tls).forEach(function (k) {
      var tl = tls[k];
      if (tl && typeof tl.play === 'function') tl.play(0);
    });
  };
  function boot() {
    window.__timelines = window.__timelines || {};
    Array.prototype.slice
      .call(document.querySelectorAll('[data-composition-src]'))
      .forEach(mountOne);
    setTimeout(function () { if (!window.__hvPlayed) window.__hvPlayAll(); }, 250);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})();
</script>`;

  out = out.includes('</body>') ? out.replace('</body>', `${playerScript}\n</body>`) : out + playerScript;
  return out;
}

function generate() {
  const dirs = fs.readdirSync(TEMPLATES_DIR, { withFileTypes: true });
  const manifest = {};

  for (const d of dirs) {
    if (!d.isDirectory()) continue;
    const templateId = d.name;
    const tDir = path.join(TEMPLATES_DIR, templateId);

    // 1. Check if native template (e.g. frame-data-rollup)
    if (fs.existsSync(path.join(tDir, 'source', 'DataRollup.tsx'))) {
      continue;
    }

    // 2. Find entry HTML
    let entryRel = null;
    if (fs.existsSync(path.join(tDir, 'source', 'index.html'))) {
      entryRel = `${templateId}/source/index.html`;
    } else if (fs.existsSync(path.join(tDir, 'index.html'))) {
      entryRel = `${templateId}/index.html`;
    }

    if (!entryRel) continue;

    const entryFullPath = path.join(TEMPLATES_DIR, entryRel);
    const rawEntry = fs.readFileSync(entryFullPath, 'utf8');
    const prepared = prepareMultiCompHtml(rawEntry, tDir);

    // Map template ID directly
    manifest[templateId] = prepared;
    // Map normalized path
    manifest[entryRel] = prepared;

    // Also collect all individual raw files with normalized forward slashes
    function walkHtml(dir) {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const it of items) {
        const full = path.join(dir, it.name);
        if (it.isDirectory()) {
          walkHtml(full);
        } else if (it.name.endsWith('.html')) {
          const rel = path.relative(TEMPLATES_DIR, full).replace(/\\/g, '/');
          if (!manifest[rel]) {
            manifest[rel] = fs.readFileSync(full, 'utf8');
          }
        }
      }
    }
    walkHtml(tDir);
  }

  const manifestKeys = Object.keys(manifest);
  console.log(`Generated manifest with ${manifestKeys.length} entries`);

  const tsContent = `// AUTO-GENERATED: all template HTML sources bundled with deterministic hydration and assets
export const RAW_HTML_MANIFEST: Record<string, string> = ${JSON.stringify(manifest, null, 2)};
`;

  fs.writeFileSync(OUTPUT_FILE, tsContent, 'utf8');
  console.log(`Wrote manifest to ${OUTPUT_FILE}`);
}

generate();
