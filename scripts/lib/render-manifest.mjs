/**
 * Render manifests: the contact sheet and the poses grid are produced BY THE HARNESS (pnpm render:contact-sheet / render:poses / eval-visual --compare) and each one
 * writes out/<slug>/render-manifest.json:
 *   { version, slug, entries: { contactSheet: { file, sha256, sourceHash, lockHash, tool, createdAt, signature }, poses: {...} } }
 *   sha256     SHA-256 of the image file
 *   sourceHash SHA-256 over every file of the project folder (names + contents)
 *   lockHash   SHA-256 of evals/harness.lock.json at render time (the harness that rendered it)
 *   signature  SHA-256 over the three hashes, the kind and the version
 * eval-visual / eval-score refuse an image whose manifest is missing, whose image no longer matches its hash, whose project source changed after the render, or that was
 * rendered under another harness lock: a picture that was edited, swapped for another project's, or rendered from older code cannot be judged.
 * Limit (see evals/README.md): the signature is a plain hash, not a secret key, so a cheater who re-implements this file could forge a manifest for a doctored picture;
 * what it does prove is that an honest `pnpm render:*` run was bound to exactly this source and this harness.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { rootDir } from "./projects.mjs";

export const MANIFEST_VERSION = 1;
export const MANIFEST_NAME = "render-manifest.json";
const LOCK = path.join(rootDir, "evals", "harness.lock.json");
const TEXT = /\.(mjs|js|cjs|ts|tsx|json|md|css|html|txt|svg)$/i;

export const manifestPathFor = (slug) => path.join(rootDir, "out", slug, MANIFEST_NAME);
export const sha256Of = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

/** SHA-256 over every file under a project folder (relative names + contents, CRLF-normalised text). */
export function projectSourceHash(dir) {
  const h = crypto.createHash("sha256");
  const walk = (d) => {
    if (!fs.existsSync(d)) return;
    for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (e.name === "node_modules" || e.name === ".git") continue;
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else {
        h.update(`${path.relative(dir, full).replaceAll("\\", "/")}\0`);
        const buf = fs.readFileSync(full);
        h.update(TEXT.test(e.name) ? Buffer.from(buf.toString("utf-8").replace(/^﻿/, "").replace(/\r\n/g, "\n")) : buf);
      }
    }
  };
  walk(dir);
  return h.digest("hex");
}

/** SHA-256 of the lock file as it is now ("no-lock" when it does not exist). */
export function lockHash(lockFile = LOCK) {
  if (!fs.existsSync(lockFile)) return "no-lock";
  return crypto.createHash("sha256").update(fs.readFileSync(lockFile, "utf-8").replace(/^﻿/, "").replace(/\r\n/g, "\n")).digest("hex");
}

const sign = (kind, e) => crypto.createHash("sha256").update(JSON.stringify([MANIFEST_VERSION, kind, e.sha256, e.sourceHash, e.lockHash])).digest("hex");

/**
 * Records one rendered image in the manifest next to it (merging with the other kind).
 * @param {{ manifestFile: string, slug: string, projectDir: string, kind: "contactSheet" | "poses", imageFile: string, tool: string, extra?: object }} o
 */
export function writeRenderManifest({ manifestFile, slug, projectDir, kind, imageFile, tool, extra = {} }) {
  let m = { version: MANIFEST_VERSION, slug, entries: {} };
  try { const old = JSON.parse(fs.readFileSync(manifestFile, "utf-8")); if (old?.entries) m = { ...old, version: MANIFEST_VERSION, slug }; } catch { /* first one */ }
  const entry = { file: path.basename(imageFile), sha256: sha256Of(imageFile), sourceHash: projectSourceHash(projectDir), lockHash: lockHash(), tool, createdAt: new Date().toISOString(), ...extra };
  entry.signature = sign(kind, entry);
  m.entries[kind] = entry;
  fs.mkdirSync(path.dirname(manifestFile), { recursive: true });
  fs.writeFileSync(manifestFile, `${JSON.stringify(m, null, 2)}\n`, "utf-8");
  return entry;
}

/** Checks one image against its manifest entry. Returns { ok, problems: [] }. */
export function verifyRenderManifest({ manifestFile, projectDir, kind, imageFile }) {
  const problems = [];
  let m = null;
  try { m = JSON.parse(fs.readFileSync(manifestFile, "utf-8")); } catch { /* none */ }
  const e = m?.entries?.[kind];
  const how = kind === "poses" ? "pnpm render:poses --project <slug>" : "pnpm render:contact-sheet --project <slug>";
  if (!e) return { ok: false, problems: [`no signed render manifest entry for the ${kind} (${path.relative(rootDir, manifestFile).replaceAll("\\", "/")}): the image was not produced by the harness, run ${how}`] };
  if (e.signature !== sign(kind, e)) problems.push(`the render manifest entry for the ${kind} was edited (signature mismatch): re-render with ${how}`);
  if (!fs.existsSync(imageFile)) problems.push(`the ${kind} image does not exist`);
  else if (sha256Of(imageFile) !== e.sha256) problems.push(`the ${kind} image differs from the one the harness rendered (SHA-256 mismatch): re-render with ${how}`);
  if (projectSourceHash(projectDir) !== e.sourceHash) problems.push(`the project source changed after the ${kind} was rendered (source hash mismatch): re-render with ${how}`);
  if (lockHash() !== e.lockHash) problems.push(`the ${kind} was rendered under another harness lock (evals/harness.lock.json changed since): re-render with ${how}`);
  return { ok: problems.length === 0, problems };
}
