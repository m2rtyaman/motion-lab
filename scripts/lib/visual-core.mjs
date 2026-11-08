/**
 * Shared visual-score logic (no model, no rendering): the rubric parser, the scoring of an answers file, the image binding (SHA-256 of the contact sheet / poses grid
 * AND the signed render manifest written by `pnpm render:contact-sheet` / `render:poses`), and `resolveVisual`, which eval-score calls on EVERY run to recompute
 * the visual score from the stored answers + the rubric + the current files (it never trusts the totals stored in out/evals/<slug>.visual.json).
 */
import fs from "node:fs";
import path from "node:path";
import { rootDir, rel } from "./projects.mjs";
import { isSelfJudged, findJudge, sha256File } from "./eval-integrity.mjs";
import { verifyRenderManifest, manifestPathFor, MANIFEST_NAME } from "./render-manifest.mjs";

export const VISUAL_WEIGHTS = { task: 70, generic: 30 };
export const RUBRIC_PATH = path.join(rootDir, "evals", "VISUAL_RUBRIC.md");

/** Parses evals/VISUAL_RUBRIC.md into { generic: [{id, text}], <task>: [{id, text}] }. */
export function parseRubric(md) {
  const out = {};
  let section = null;
  for (const line of md.split(/\r?\n/)) {
    const h = line.match(/^## ([a-z0-9-]+)\s*$/);
    if (h) { section = h[1]; out[section] = []; continue; }
    const q = line.match(/^- `([a-z0-9.-]+)` (.+)$/);
    if (section && q) out[section].push({ id: q[1], text: q[2] });
  }
  return out;
}

/** The comparative questions for a task: its own "compare-<task>" block, else the generic "compare" block. */
export const compareQuestions = (rubric, taskId) => (rubric[`compare-${taskId}`]?.length ? rubric[`compare-${taskId}`] : rubric.compare ?? []);

/** Scores answers against the rubric of one task. Returns { score, task, generic, compare?, missing }. `compare: true` adds the "vs reference" block. */
export function visualScore(rubric, taskId, answers, { compare = false } = {}) {
  if (!rubric[taskId]?.length) throw new Error(`no visual questions for task "${taskId}" in evals/VISUAL_RUBRIC.md`);
  const block = (qs, max) => {
    const passed = qs.filter((q) => answers[q.id] === true);
    const failed = qs.filter((q) => answers[q.id] !== true);
    return { max, score: Math.round((max * passed.length) / qs.length * 10) / 10, passed: passed.length, total: qs.length, failed: failed.map((q) => ({ id: q.id, text: q.text, answered: q.id in answers })) };
  };
  const task = block(rubric[taskId], VISUAL_WEIGHTS.task);
  const generic = block(rubric.generic, VISUAL_WEIGHTS.generic);
  const cmpQs = compare ? compareQuestions(rubric, taskId) : [];
  if (compare && !cmpQs.length) throw new Error(`no comparative questions for task "${taskId}" (add a "## compare-${taskId}" block to evals/VISUAL_RUBRIC.md)`);
  let cmp = null;
  if (cmpQs.length) {
    const passed = cmpQs.filter((q) => answers[q.id] === true);
    cmp = { max: 100, score: Math.round((100 * passed.length) / cmpQs.length), passed: passed.length, total: cmpQs.length, worse: cmpQs.filter((q) => answers[q.id] !== true).map((q) => ({ id: q.id, text: q.text, answered: q.id in answers })) };
  }
  const known = new Set([...rubric[taskId], ...rubric.generic, ...cmpQs].map((q) => q.id));
  return {
    score: Math.round(task.score + generic.score),
    task,
    generic,
    ...(cmp ? { compare: cmp } : {}),
    missing: [...known].filter((id) => !(id in answers)),
    unknownIds: Object.keys(answers).filter((id) => !known.has(id)),
  };
}

export const visualFile = (slug) => path.join(rootDir, "out", "evals", `${slug}.visual.json`);
export function loadVisual(slug) {
  try { return JSON.parse(fs.readFileSync(visualFile(slug), "utf-8")); } catch { return null; }
}


/** Paths and SHA-256 of the images a judge must look at (contact sheet always, poses grid when it was rendered). */
export function imageInfo(slug) {
  const grid = path.join(rootDir, "out", slug, "visual-audit-grid.png");
  const poses = path.join(rootDir, "out", slug, "poses", "poses-grid.png");
  return {
    grid: { file: grid, exists: fs.existsSync(grid), hash: fs.existsSync(grid) ? sha256File(grid) : null },
    poses: { file: poses, exists: fs.existsSync(poses), hash: fs.existsSync(poses) ? sha256File(poses) : null },
  };
}

/** Where the cached reference contact sheet of a task lives. */
export const referenceDir = (taskId) => path.join(rootDir, "out", "evals", "reference", taskId);
export const referenceSolutionDir = (taskId) => path.join(rootDir, "evals", "solutions", taskId);


/** The reference sheet exactly as it is on disk now (no rendering): { file, exists, hash }. */
export function referenceInfo(taskId) {
  const file = path.join(referenceDir(taskId), "visual-audit-grid.png");
  return { file, exists: fs.existsSync(file), hash: fs.existsSync(file) ? sha256File(file) : null };
}

/** Checks the hashes in an answers file against the images on disk. Returns { ok, problems: [] }. `compare` (the task id) also binds the reference sheet. */
export function checkAnswerImages(slug, raw, { compare = null, projectDir = path.join(rootDir, "src", "projects", slug) } = {}) {
  const img = imageInfo(slug), problems = [];
  if (!img.grid.exists) problems.push(`the contact sheet does not exist (${rel(img.grid.file)}): run pnpm render:contact-sheet --project ${slug}`);
  else if (typeof raw?.imageHash !== "string") problems.push(`the answers JSON has no "imageHash" (the contact sheet SHA-256 printed in the prompt)`);
  else if (raw.imageHash.toLowerCase() !== img.grid.hash) problems.push(`imageHash does not match the contact sheet on disk (the picture changed or the answers were written for another one; expected ${img.grid.hash})`);
  if (img.poses.exists) {
    if (typeof raw?.posesHash !== "string") problems.push(`the answers JSON has no "posesHash" (the poses grid exists: ${img.poses.hash})`);
    else if (raw.posesHash.toLowerCase() !== img.poses.hash) problems.push(`posesHash does not match the poses grid on disk (expected ${img.poses.hash})`);
  }
  if (compare) {
    const ref = referenceInfo(compare);
    if (!ref.exists) problems.push(`the reference sheet does not exist (${rel(ref.file)}): run node scripts/eval-visual.mjs --compare --task ${compare} --project ${slug} first (it renders it)`);
    else if (typeof raw?.referenceHash !== "string") problems.push(`the answers JSON has no "referenceHash" (the reference contact sheet SHA-256 printed in the compare prompt: ${ref.hash})`);
    else if (raw.referenceHash.toLowerCase() !== ref.hash) problems.push(`referenceHash does not match the reference sheet on disk (expected ${ref.hash})`);
  }
  // signed render manifests: the image was rendered by the harness from THIS source under THIS lock
  if (img.grid.exists) problems.push(...verifyRenderManifest({ manifestFile: manifestPathFor(slug), projectDir, kind: "contactSheet", imageFile: img.grid.file }).problems);
  if (img.poses.exists) problems.push(...verifyRenderManifest({ manifestFile: manifestPathFor(slug), projectDir, kind: "poses", imageFile: img.poses.file }).problems);
  if (compare) {
    const ref = referenceInfo(compare);
    if (ref.exists) problems.push(...verifyRenderManifest({ manifestFile: path.join(referenceDir(compare), MANIFEST_NAME), projectDir: referenceSolutionDir(compare), kind: "contactSheet", imageFile: ref.file }).problems);
  }
  return { ok: problems.length === 0, problems };
}

/** The visual rubric (evals/VISUAL_RUBRIC.md, plus the private one of --tasks-dir when given). */
export function loadRubric(tasksDir) {
  const rubric = parseRubric(fs.readFileSync(RUBRIC_PATH, "utf-8"));
  const priv = tasksDir ? path.join(path.resolve(process.cwd(), tasksDir), "VISUAL_RUBRIC.md") : null;
  if (priv && fs.existsSync(priv)) Object.assign(rubric, parseRubric(fs.readFileSync(priv, "utf-8")));
  return rubric;
}

/**
 * Recomputes the visual score of a project from what is on disk NOW: the stored answers (not the stored totals), the rubric, the judge list, the image hashes and the
 * signed render manifests. Returns null when nothing was recorded, else { valid, problems, judge, score, task, generic, compare, selfJudged, ... }.
 * An invalid result (picture or source changed, unknown judge, no manifest) is shown but never counted.
 */
export function resolveVisual(slug, { taskId, projectDir, tasksDir } = {}) {
  const v = loadVisual(slug);
  if (!v) return null;
  const problems = [];
  const task = taskId ?? v.taskId;
  const dir = projectDir ?? path.join(rootDir, "src", "projects", slug);
  const answers = v.answers && typeof v.answers === "object" ? v.answers : null;
  if (!answers) return { valid: false, problems: ["the stored visual result has no answers: run eval-visual --answers again"], judge: v.judge ?? null };
  const entry = v.judge ? findJudge(v.judge) : null;
  if (!entry) problems.push(`judge "${v.judge ?? "unknown"}" is not in evals/judges.json`);
  const compare = Boolean(v.compare);
  let score = null;
  try { score = visualScore(loadRubric(tasksDir), task, answers, { compare }); } catch (e) { problems.push(e.message); }
  if (v.taskId && task && v.taskId !== task) problems.push(`the stored visual result is for task "${v.taskId}", not "${task}"`);
  problems.push(...checkAnswerImages(slug, { imageHash: v.imageHash, posesHash: v.posesHash, referenceHash: v.referenceHash }, { compare: compare ? task : null, projectDir: dir }).problems);
  let evalModel = null;
  try { evalModel = JSON.parse(fs.readFileSync(path.join(dir, "spec.json"), "utf-8").replace(/^﻿/, "")).evalModel ?? null; } catch { /* no spec */ }
  const selfJudged = entry ? isSelfJudged(slug, task, entry.id, evalModel) : false;
  return { valid: problems.length === 0, problems, judge: entry?.id ?? v.judge ?? null, selfJudged, ...(score ?? {}), recomputed: true };
}
