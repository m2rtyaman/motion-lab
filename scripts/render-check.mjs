/**
 * RENDER CROSS-CHECK - SUPERSEDED by scripts/browser-probe.mjs (kept so `pnpm eval:score --render` and old callers keep working).
 * The probe renders the composition in headless Chrome and inspects the REAL DOM (visibility, boxes, contrast, text, runtime errors); this
 * wrapper only answers the original question "does every window where the timeline claims motion actually change on screen?" from it.
 *
 *   node scripts/render-check.mjs --project <slug> --windows <windows.json>      prints JSON { ok, windows: [{..., changed, visible}] }
 *   node scripts/render-check.mjs --dir <projectDir> --windows <windows.json>    same for a folder outside src/projects
 * A window is { target, from, to, ... } (scripts/lib/eval-integrity.mjs motionWindows). `visible` is false when the probe found that target
 * invisible (P001) or not moving on screen (P002); `changed` is observed/claimed motion capped to 1 (1 when the probe verified it).
 * Set REMOTION_BROWSER_EXECUTABLE=<chrome/edge path> to use a specific browser.
 */
import fs from "node:fs";
import path from "node:path";
import { rootDir, projectsDir } from "./lib/projects.mjs";
import { probe } from "./browser-probe.mjs";

const argv = process.argv.slice(2);
const arg = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
const slug = arg("--project"), dirArg = arg("--dir"), windowsFile = arg("--windows");
const emit = (o) => process.stdout.write(`${JSON.stringify(o, null, 2)}\n`);

try {
  if ((!slug && !dirArg) || !windowsFile) throw new Error("usage: node scripts/render-check.mjs --project <slug> | --dir <dir> --windows <windows.json>");
  const windows = JSON.parse(fs.readFileSync(path.resolve(rootDir, windowsFile), "utf-8"));
  const dir = dirArg ? path.resolve(rootDir, dirArg) : path.join(projectsDir, slug);
  const res = await probe({ dir, slug: slug ?? path.basename(dir) });
  const out = windows.map((w) => {
    const bad = res.findings.some((f) => (f.code === "P001" || f.code === "P002") && f.target === w.target);
    const details = (res.meta.motionDetail ?? []).filter((d) => d.target === w.target && d.from <= w.to + 1 && d.to >= w.from - 1);
    const frac = details.length ? Math.min(1, Math.max(...details.map((d) => (d.claimed ? d.observed / d.claimed : 1)))) : bad ? 0 : 1;
    return { ...w, changed: Math.round(frac * 1e5) / 1e5, visible: !bad && frac > 0 };
  });
  emit({ ok: res.ok || !res.findings.some((f) => f.code === "P003"), windows: out, probe: { errors: res.errors, codes: [...new Set(res.findings.map((f) => f.code))] } });
} catch (e) {
  emit({ ok: false, windows: [], error: String(e?.message ?? e).slice(0, 400) });
  process.exitCode = 1;
}
