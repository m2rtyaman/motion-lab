/**
 * EVAL VISUAL - the "what is on screen" half of the eval. No model is called here.
 *
 *   node scripts/eval-visual.mjs --task <id> --project <slug>              print the prompt for a vision model
 *   node scripts/eval-visual.mjs --task <id> --dir <projectDir>            same for a folder (slug = folder name)
 *   node scripts/eval-visual.mjs --task <id> --project <slug> --answers a.json --judge <model-name>
 *                                                                          score the answers, print "Visual (judge: X) /100" next to the structural score
 *
 * --judge is REQUIRED with --answers, must be an entry of evals/judges.json (id or alias; add yours there) and is recorded in the result.
 * Self-judging: if the judge is the model that built the project (spec.json "evalModel", else the slug eval-<task>-<model>) the visual score is
 * marked "self-judged, not counted". Use a different model (or a person) as judge.
 * RENDER MANIFEST: the pictures must be produced by `pnpm render:contact-sheet` / `pnpm render:poses` (they write out/<slug>/render-manifest.json: SHA-256 of the image + hash of
 * the project source + hash of the harness lock). Images without a matching manifest, edited images, and images rendered from an older source or lock are REFUSED.
 * IMAGE BINDING: the printed prompt carries the SHA-256 of the contact sheet (imageHash) and of the poses grid when it exists (posesHash). The answers
 * JSON must repeat them; the answers are refused when the image does not exist or a hash differs. This only proves the answers were written for THAT image
 * file: it cannot prove that a model really looked at it (visual answers remain trust-based, see evals/README.md).
 * COMPARE MODE (--compare): the judge also sees the task's REFERENCE solution next to the candidate and says, per question in the "compare" block of
 * evals/VISUAL_RUBRIC.md (layout clarity, type scale, motion readability, polish), whether the candidate is at least as good (true) or worse (false).
 *   node scripts/eval-visual.mjs --compare --task <id> --project <slug>      renders the reference contact sheet once (cached in out/evals/reference/<id>/,
 *                                                                          re-rendered when evals/solutions/<id> changes or with --refresh-reference) and prints the side-by-side prompt
 *   ... --compare --answers a.json --judge <name>                            answers must repeat BOTH hashes: "imageHash" (candidate) and "referenceHash"; the result shows "vs reference"
 * --tasks-dir <path> reads TASK.md and an optional VISUAL_RUBRIC.md from a private task set (see evals/HELDOUT.md).
 *
 * Flow: pnpm render:contact-sheet --project <slug>  ->  run this to get the prompt  ->  give the prompt and the images to a vision model
 * (or a person)  ->  save its JSON answers  ->  run again with --answers. The result is written to out/evals/<slug>.visual.json and
 * pnpm eval:score prints it as a separate line. It is NEVER added to the 0-100 structural score.
 *
 * Answers file: { "imageHash": "<sha256 from the prompt>", "posesHash": "<if the prompt printed one>", "referenceHash": "<compare mode only>", "answers": { "<question id>": true | false, ... } }.
 * Questions live in evals/VISUAL_RUBRIC.md as lines starting with: - `id` question
 * Points: task questions 70, generic questions 30, split evenly in each block; unanswered counts as false.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { rootDir, rel } from "./lib/projects.mjs";
import { scoreTarget } from "./eval-score.mjs";
import { isSelfJudged, findJudge, sha256File } from "./lib/eval-integrity.mjs";
import { renderSheet, folderHash } from "./lib/render-sheet.mjs";
import { VISUAL_WEIGHTS, RUBRIC_PATH, parseRubric, compareQuestions, visualScore, visualFile, loadVisual, imageInfo, referenceDir, referenceSolutionDir, referenceInfo, checkAnswerImages, loadRubric, resolveVisual } from "./lib/visual-core.mjs";
export { VISUAL_WEIGHTS, parseRubric, compareQuestions, visualScore, visualFile, loadVisual, imageInfo, referenceDir, referenceSolutionDir, referenceInfo, checkAnswerImages, loadRubric, resolveVisual };

const RED = "\x1b[31m", GREEN = "\x1b[32m", YELLOW = "\x1b[33m", BOLD = "\x1b[1m", DIM = "\x1b[2m", RESET = "\x1b[0m";
function listFrames(slug) {
  const dir = path.join(rootDir, "out", slug, "vision", "frames");
  return fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /\.png$/i.test(f)).sort() : [];
}

/**
 * Renders (or reuses) the contact sheet of the task's reference solution. Cached while evals/solutions/<id> is unchanged; `refresh` forces a re-render.
 * Returns { file, hash, cached, solution }.
 */
export async function ensureReference(taskId, { refresh = false, log = () => {} } = {}) {
  const solution = referenceSolutionDir(taskId);
  if (!fs.existsSync(path.join(solution, "Scene.tsx"))) throw new Error(`no reference solution for task "${taskId}" (expected evals/solutions/${taskId}/Scene.tsx): compare mode needs one`);
  const outDir = referenceDir(taskId), file = path.join(outDir, "visual-audit-grid.png"), metaFile = path.join(outDir, "meta.json");
  const inputHash = folderHash(solution);
  let meta = null;
  try { meta = JSON.parse(fs.readFileSync(metaFile, "utf-8")); } catch { /* none yet */ }
  if (!refresh && meta?.inputHash === inputHash && fs.existsSync(file)) return { file, hash: sha256File(file), cached: true, solution };
  fs.mkdirSync(outDir, { recursive: true });
  log(`rendering the reference solution sheet for "${taskId}" (about 30-60 s)...`);
  await renderSheet({ dir: solution, outDir, id: `reference-${taskId}`, log });
  const hash = sha256File(file);
  fs.writeFileSync(metaFile, `${JSON.stringify({ taskId, inputHash, imageHash: hash }, null, 2)}\n`);
  return { file, hash, cached: false, solution };
}

export function buildPrompt({ taskId, slug, rubric, tasksDir, compare = false }) {
  const privateBrief = tasksDir ? path.join(path.resolve(process.cwd(), tasksDir), taskId, "TASK.md") : null;
  const brief = fs.readFileSync(privateBrief && fs.existsSync(privateBrief) ? privateBrief : path.join(rootDir, "evals", "tasks", taskId, "TASK.md"), "utf-8").trim();
  const grid = `out/${slug}/visual-audit-grid.png`;
  const img = imageInfo(slug);
  const frames = listFrames(slug).map((f) => `out/${slug}/vision/frames/${f}`);
  const cmpQs = compare ? compareQuestions(rubric, taskId) : [];
  const ref = compare ? referenceInfo(taskId) : null;
  const qs = [...rubric[taskId], ...rubric.generic, ...cmpQs];
  if (compare) {
    return [
      `You are comparing a CANDIDATE motion-graphics video with the REFERENCE solution made for the same brief, from their contact sheets. You cannot see code, only pictures.`,
      ``,
      `IMAGE A, the CANDIDATE: ${grid}  (SHA-256 ${img.grid.hash ?? "missing: render the contact sheet first"})${img.poses.exists ? `\nposes grid: out/${slug}/poses/poses-grid.png  (SHA-256 ${img.poses.hash})` : ""}`,
      `IMAGE B, the REFERENCE: ${rel(ref.file)}  (SHA-256 ${ref.hash ?? "missing: render it first"})`,
      `Both sheets read left to right, top to bottom; later cells are later in time. Open both and hold them side by side.`,
      ``,
      `BRIEF both videos were made for:`,
      brief,
      ``,
      `Part 1: answer the questions about the CANDIDATE (A) alone with true or false, based ONLY on what the images show. If you cannot see it, answer false.`,
      `Part 2 (ids ending in .cmp-* or starting with compare.): answer true when A is AT LEAST AS GOOD AS B on that point, false when A is worse (or you cannot tell). Judge the pictures, not the intent.`,
      `Return JSON only: { "imageHash": "${img.grid.hash ?? "<candidate sheet sha256>"}",${img.poses.exists ? ` "posesHash": "${img.poses.hash}",` : ""} "referenceHash": "${ref.hash ?? "<reference sheet sha256>"}", "answers": { "<id>": true|false, ... } } with every id below. Copy the hashes exactly: answers written for other pictures are refused.`,
      ``,
      ...qs.map((q) => `- ${q.id}: ${q.text}`),
    ].join("\n");
  }
  return [
    `You are reviewing a finished motion-graphics video from its contact sheet. You cannot see code, only pictures.`,
    ``,
    `IMAGES (open them): ${grid}  (SHA-256 ${img.grid.hash ?? "missing: render the contact sheet first"})${img.poses.exists ? `\nposes grid: out/${slug}/poses/poses-grid.png  (SHA-256 ${img.poses.hash})` : ""}${frames.length ? `\nSingle frames when you need detail: ${frames.length} files, e.g. ${frames.slice(0, 3).join(", ")} ... in out/${slug}/vision/frames/` : ""}`,
    `The contact sheet reads left to right, top to bottom; later cells are later in time.`,
    ``,
    `BRIEF the video was made for:`,
    brief,
    ``,
    `Answer each question below with true or false, based ONLY on what the images show. If you cannot see it, answer false.`,
    `Return JSON only: { "imageHash": "${img.grid.hash ?? "<contact sheet sha256>"}",${img.poses.exists ? ` "posesHash": "${img.poses.hash}",` : ""} "answers": { "<id>": true|false, ... } } with every id below. Copy the hash(es) exactly: answers for another picture are refused.`,
    ``,
    ...qs.map((q) => `- ${q.id}: ${q.text}`),
  ].join("\n");
}

export function printMerged(structural, v, slug, taskId, judge = "unknown", selfJudged = false) {
  /* trust-based: see README */
  const tone = (s, m) => (s >= m - 0.05 ? GREEN : s >= m * 0.6 ? YELLOW : RED);
  console.log(`\n${BOLD}==== EVAL ${taskId} :: ${slug} ====${RESET}`);
  if (structural) console.log(`  ${BOLD}Structural ${tone(structural.score, 100)}${structural.score}/100${RESET}  ${DIM}(timeline, code, copy; does not look at pixels)${RESET}`);
  if (selfJudged) console.log(`  ${BOLD}Visual (judge: ${judge}) ${YELLOW}${v.score}/100  self-judged, not counted${RESET}  ${DIM}(the judge built this project: ask a different model)${RESET}`);
  else console.log(`  ${BOLD}Visual (judge: ${judge}) ${tone(v.score, 100)}${v.score}/100${RESET}  ${DIM}(task ${v.task.score}/${v.task.max}, generic ${v.generic.score}/${v.generic.max}; separate from the structural score)${RESET}`);
  if (v.compare) console.log(`  ${BOLD}vs reference ${tone(v.compare.score, 100)}${v.compare.passed}/${v.compare.total} at least as good${RESET}  ${DIM}(layout, type scale, motion, polish; candidate >= reference)${RESET}${v.compare.worse.length ? `\n  ${DIM}Worse than the reference:${RESET}\n${v.compare.worse.map((f) => `   - ${YELLOW}[${f.id}]${RESET} ${f.text}${f.answered ? "" : ` ${DIM}(not answered)${RESET}`}`).join("\n")}` : ""}`);
  const failed = [...v.task.failed, ...v.generic.failed];
  if (failed.length) console.log(`\n  ${DIM}Visual issues:${RESET}\n${failed.map((f) => `   - ${YELLOW}[${f.id}]${RESET} ${f.text}${f.answered ? "" : ` ${DIM}(not answered)${RESET}`}`).join("\n")}`);
  if (v.unknownIds?.length) console.log(`  ${RED}unknown question ids ignored: ${v.unknownIds.join(", ")}${RESET}`);
  console.log("");
}

function knownJudges() {
  try { return JSON.parse(fs.readFileSync(path.join(rootDir, "evals", "judges.json"), "utf-8")).judges.map((j) => j.id); } catch { return []; }
}
const arg = (argv, name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : undefined; };

async function main() {
  const argv = process.argv.slice(2);
  const dir = arg(argv, "--dir"), project = arg(argv, "--project");
  const slug = dir ? path.basename(path.resolve(process.cwd(), dir)) : project;
  if (!slug) throw new Error("pass --project <slug> or --dir <projectDir>");
  const specPath = dir ? path.join(path.resolve(process.cwd(), dir), "spec.json") : path.join(rootDir, "src", "projects", slug, "spec.json");
  let taskId = arg(argv, "--task");
  if (!taskId) { try { taskId = JSON.parse(fs.readFileSync(specPath, "utf-8")).evalTask; } catch { /* below */ } }
  if (!taskId) throw new Error('no task: pass --task <id> or set "evalTask" in spec.json');
  const tasksDir = arg(argv, "--tasks-dir");
  const rubric = parseRubric(fs.readFileSync(RUBRIC_PATH, "utf-8"));
  const privateRubric = tasksDir ? path.join(path.resolve(process.cwd(), tasksDir), "VISUAL_RUBRIC.md") : null;
  if (privateRubric && fs.existsSync(privateRubric)) Object.assign(rubric, parseRubric(fs.readFileSync(privateRubric, "utf-8")));
  if (!rubric[taskId]) throw new Error(`unknown task "${taskId}" (visual rubric has: ${Object.keys(rubric).filter((k) => k !== "generic" && !k.startsWith("compare")).join(", ")})`);
  const compare = argv.includes("--compare");

  const answersPath = arg(argv, "--answers");
  if (!answersPath) {
    const grid = path.join(rootDir, "out", slug, "visual-audit-grid.png");
    if (!fs.existsSync(grid)) console.error(`${YELLOW}No contact sheet yet: run pnpm render:contact-sheet --project ${slug} first (expected ${rel(grid)}).${RESET}\n`);
    if (compare) await ensureReference(taskId, { refresh: argv.includes("--refresh-reference"), log: (m) => console.error(`${DIM}${m}${RESET}`) });
    console.log(buildPrompt({ taskId, slug, rubric, tasksDir, compare }));
    return 0;
  }
  const judgeArg = arg(argv, "--judge");
  if (!judgeArg || judgeArg.startsWith("--")) throw new Error("--judge <name> is required with --answers: an entry of evals/judges.json (e.g. claude-opus, gemini-pro, human). It must not be the model that built the project");
  const entry = findJudge(judgeArg);
  if (!entry) throw new Error(`unknown judge "${judgeArg}": add it to evals/judges.json (known: ${knownJudges().join(", ")})`);
  const judge = entry.id;
  const raw = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), answersPath), "utf-8").replace(/^\uFEFF/, ""));
  const projectDir = dir ? path.resolve(process.cwd(), dir) : path.join(rootDir, "src", "projects", slug);
  const bound = checkAnswerImages(slug, raw, { compare: compare ? taskId : null, projectDir });
  if (!bound.ok) throw new Error(`answers refused:\n  - ${bound.problems.join("\n  - ")}`);
  const answers = raw.answers && typeof raw.answers === "object" ? raw.answers : {};
  const v = visualScore(rubric, taskId, answers, { compare });
  let evalModel = null;
  try { evalModel = JSON.parse(fs.readFileSync(specPath, "utf-8").replace(/^\uFEFF/, "")).evalModel ?? null; } catch { /* no spec */ }
  fs.mkdirSync(path.join(rootDir, "out", "evals"), { recursive: true });
  const selfJudged = isSelfJudged(slug, taskId, judge, evalModel);
  fs.writeFileSync(visualFile(slug), `${JSON.stringify({ taskId, project: slug, judge, judgeKind: entry.kind ?? null, evalModel, selfJudged, imageHash: raw.imageHash, posesHash: raw.posesHash ?? null, referenceHash: compare ? raw.referenceHash : null, score: v.score, task: v.task, generic: v.generic, compare: v.compare ?? null, missing: v.missing, unknownIds: v.unknownIds, answers }, null, 2)}\n`);

  let structural = null;
  try { structural = await scoreTarget({ task: taskId, project: dir ? undefined : project, dir, tasksDir }); } catch (e) { console.error(`${DIM}(structural score unavailable: ${e.message})${RESET}`); }
  printMerged(structural, v, slug, taskId, judge, selfJudged);
  console.log(`${DIM}JSON: ${rel(visualFile(slug))}${RESET}\n`);
  return 0;
}

const isMain = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isMain) main().then((c) => process.exit(c), (e) => { console.error(`${RED}${BOLD}[EVAL-VISUAL]${RESET} ${e.message}`); process.exit(1); });
