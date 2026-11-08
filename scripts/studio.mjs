import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  parseArgs,
  resolveProject,
  rootDir,
  rel,
  walk,
  MODES,
  runNode,
  buildCss,
} from "./lib/projects.mjs";

/**
 * STUDIO PIPELINE ORCHESTRATOR V3 (multi-project)
 *
 * Manages independent state per project (.studio/<slug>/state.json) and the stage chain:
 *   direction → spec → code → vision → render
 *
 * Komutlar:
 *   node scripts/studio.mjs init "<brief>" [--project <slug>]
 *   node scripts/studio.mjs status [--project <slug>]
 *   node scripts/studio.mjs next [--project <slug>]
 *   node scripts/studio.mjs check [stage] [--project <slug>]
 *   node scripts/studio.mjs run [--project <slug>]
 */

const rawArgs = process.argv.slice(2);
const parsed = parseArgs(rawArgs);

// The first positional argument is the command (init, status, next, check, run)
const cmd = parsed.positional[0] ?? "status";
const subArg = parsed.positional.slice(1).join(" ").trim();

const project = resolveProject(parsed);

const studioDir = project.studioDir;
const statePath = path.join(studioDir, "state.json");
const promptsDir = path.join(studioDir, "prompts");

const RED = "\x1b[31m", GREEN = "\x1b[32m", YELLOW = "\x1b[33m", BOLD = "\x1b[1m", DIM = "\x1b[2m", RESET = "\x1b[0m";

// ---------- Helpers ----------
const sha = (buf) => crypto.createHash("sha1").update(buf).digest("hex");
const readIf = (p) => (fs.existsSync(p) ? fs.readFileSync(p) : null);
const mtime = (p) => (fs.existsSync(p) ? fs.statSync(p).mtimeMs : 0);

const projectCodeFiles = () => [
  ...walk(project.dir, new Set([".ts", ".tsx"])),
  ...walk(path.join(rootDir, "src", "core"), new Set([".ts", ".tsx"])),
].sort();

function stripFrontmatter(md) {
  return md.replace(/^---[\s\S]*?---\s*/, "").trim();
}

function skill(name, extra = []) {
  const dir = path.join(rootDir, ".agent", "skills", name);
  const parts = [];
  const main = readIf(path.join(dir, "SKILL.md"));
  if (main) parts.push(`### Skill: ${name}\n${stripFrontmatter(main.toString("utf-8"))}`);
  for (const f of extra) {
    const b = readIf(path.join(dir, f));
    if (b) parts.push(`### ${name}/${f}\n${b.toString("utf-8").trim()}`);
  }
  return parts.join("\n\n");
}

function loadState() {
  if (!fs.existsSync(statePath)) {
    console.error(`${RED}${BOLD}[ERROR] "${project.slug}" has no active studio run.${RESET}`);
    console.log(`Start with: pnpm studio:init --project ${project.slug} "<brief>"`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(statePath, "utf-8"));
}

const saveState = (s) => fs.writeFileSync(statePath, JSON.stringify(s, null, 2));

const tail = (s, n = 18) => s.trim().split("\n").slice(-n).join("\n");

function section(md, title) {
  const re = new RegExp(`^##\\s+${title}\\s*$([\\s\\S]*?)(?=^##\\s|(?![\\s\\S]))`, "im");
  return md.match(re)?.[1]?.trim() ?? "";
}

function readSpec() {
  try {
    return JSON.parse(fs.readFileSync(project.spec, "utf-8").replace(/^\uFEFF/, ""));
  } catch {
    return null;
  }
}

// ---------- Stage Definitions ----------
const STAGES = [
  {
    id: "direction",
    title: "Motion Director (konsept + fizik)",
    artifact: () => rel(project.direction),
    hash: () => sha(readIf(project.direction) ?? ""),
    prompt: (state) => ({
      skills: [skill("motion-playbook")],
      task:
        `Project: ${project.slug}\nBrief: ${state.brief}\n\n` +
        `\`${rel(project.direction)}\` file. ONLY concept and physics decisions; NO CODE, NO DURATION/FRAMES.\n` +
        `Required headings: \`## Paradigm\` (single line: ${MODES.join(" | ")}), \`## Concept\`, \`## Physics\` ` +
        `(weight, acceleration, impact feel, spring/damping character), \`## Typography & Palette\`. Each section must be at least 40 characters.`,
    }),
    check() {
      const buf = readIf(project.direction);
      if (!buf) return fail(`${rel(project.direction)} not found.`);
      const md = buf.toString("utf-8");
      const errs = [];
      const paradigm = section(md, "Paradigm").split(/\s+/)[0];
      if (!MODES.includes(paradigm)) errs.push(`## Paradigm is invalid: "${paradigm}" (${MODES.join(" | ")})`);
      for (const h of ["Concept", "Physics", "Typography & Palette"]) {
        if (section(md, h.replace("&", "\\&")).length < 40) {
          errs.push(`## ${h} is missing or shorter than 40 characters.`);
        }
      }
      return errs.length ? fail(errs.join("\n")) : pass();
    },
  },
  {
    id: "spec",
    title: "Choreographer (zamanlama → spec.json)",
    artifact: () => rel(project.spec),
    hash: () => sha(readIf(project.spec) ?? ""),
    prompt: (state) => {
      const dirText = readIf(project.direction)?.toString("utf-8") ?? "(none)";
      return {
        skills: [
          skill("motion-playbook"),
          `### Storyboard (docs/STORYBOARD.md)
${readIf(path.join(rootDir, "docs", "STORYBOARD.md"))?.toString("utf-8") ?? ""}`,
          `### Schema\n${readIf(path.join(rootDir, "specs", "motion-spec.schema.json"))?.toString("utf-8") ?? ""}`,
          `### Example spec\n${readIf(project.spec)?.toString("utf-8") ?? ""}`,
        ],
        task:
          `Project: ${project.slug}\nBrief: ${state.brief}\n\nAPPROVED DIRECTION:\n${dirText}\n\n` +
          `\`${rel(project.spec)}\` file (JSON only; DO NOT WRITE JSX/TSX). \`mode\` must match the Paradigm in the direction. ` +
          `Validation: \`node scripts/validate-spec.mjs --project ${project.slug}\`. Invalid specs are rejected; apply the "Fix →" lines.`,
      };
    },
    check() {
      const v = runNode("validate-spec.mjs", ["--project", project.slug]);
      if (v.code !== 0) return fail(`validate-spec failed:\n${tail(v.out, 30)}`);
      const dir = readIf(project.direction)?.toString("utf-8") ?? "";
      const paradigm = section(dir, "Paradigm").split(/\s+/)[0];
      const specObj = readSpec();
      if (specObj && paradigm && specObj.mode !== paradigm) {
        return fail(`spec.mode=${specObj.mode} ama direction Paradigm=${paradigm}`);
      }
      return pass();
    },
  },
  {
    id: "code",
    title: "Remotion Engineer (Scene.tsx) + static audit",
    artifact: () => `${rel(project.dir)}/**/*.{ts,tsx}`,
    hash: () => sha(projectCodeFiles().map((f) => `${f}:${sha(fs.readFileSync(f))}`).join("|")),
    prompt: (state) => {
      const specText = readIf(project.spec)?.toString("utf-8") ?? "(none)";
      return {
        skills: [skill("motion-playbook")],
        task:
          `Project: ${project.slug}\nBrief: ${state.brief}\n\nONAYLI SPEC:\n${specText}\n\n` +
          `\`${rel(project.scene)}\` code the file to match the beat/camera/sfx values in the spec exactly. ` +
          `Use numbers via tokens.ts; do not use magic duration/ease values. When done: \`pnpm check --project ${project.slug}\`.`,
      };
    },
    check() {
      runNode("gen-registry.mjs");
      const v = runNode("validate-spec.mjs", ["--project", project.slug]);
      if (v.code !== 0) return fail(`Spec ↔ kod uyumsuz:\n${tail(v.out, 30)}`);
      const a = runNode("ast-lint.mjs", ["--project", project.slug]);
      if (a.code !== 0) return fail(`ast-lint failed:\n${tail(a.out, 30)}`);
      const l = runNode("slop-linter.mjs", ["--project", project.slug]);
      if (l.code !== 0) return fail(`slop-linter failed:\n${tail(l.out, 30)}`);
      const t = spawnSync("npx", ["tsc", "--noEmit"], {
        cwd: rootDir,
        shell: process.platform === "win32",
        encoding: "utf-8",
      });
      if (t.status !== 0) return fail(`tsc error:\n${tail(t.stdout + t.stderr, 25)}`);
      return pass();
    },
  },
  {
    id: "vision",
    title: "Visual audit (contact-sheet + written observations)",
    artifact: () => `${rel(project.grid)} + ${rel(project.notes)}`,
    hash: () =>
      sha(
        Buffer.concat([
          readIf(project.grid) ?? Buffer.alloc(0),
          readIf(project.manifest) ?? Buffer.alloc(0),
          readIf(project.notes) ?? Buffer.alloc(0),
        ])
      ),
    prompt: () => {
      const specObj = readSpec();
      const ids = (specObj?.beats ?? []).map((b) => b.id).join(", ");
      return {
        skills: [skill("motion-playbook")],
        task:
          `1) \`pnpm render:contact-sheet --project ${project.slug}\` run.\n` +
          `2) \`${rel(project.grid)}\` image: OPEN and REVIEW it.\n` +
          `3) \`${rel(project.notes)}\` file: write ONE SEPARATE LINE for EACH beat (${ids});\n` +
          `   Each line must include the beat id and the sample frame number from the manifest in "f130" format.\n` +
          `   State your observations, composition consistency, and any quality debt.`,
      };
    },
    check() {
      if (!fs.existsSync(project.grid)) {
        return fail(`${rel(project.grid)} is missing. \`pnpm render:contact-sheet --project ${project.slug}\` run.`);
      }
      const newestInput = Math.max(...projectCodeFiles().map(mtime), mtime(project.spec));
      if (mtime(project.grid) < newestInput) {
        return fail("The grid image is behind the code/spec (stale). Regenerate the contact-sheet.");
      }
      const manifest = (() => {
        try {
          return JSON.parse(fs.readFileSync(project.manifest, "utf-8"));
        } catch {
          return null;
        }
      })();
      if (!manifest) {
        return fail(`${rel(project.manifest)} is missing/corrupt. Re-run contact-sheet.`);
      }

      const notes = readIf(project.notes)?.toString("utf-8");
      if (!notes) {
        return fail(`${rel(project.notes)} is missing. Review the image and leave written observations.`);
      }
      if (mtime(project.notes) < mtime(project.grid)) {
        return fail("Vision notes were written before the grid; write them after reviewing the image.");
      }

      const specBeats = readSpec()?.beats ?? [];
      const stat = manifest.beats.filter((b) => b.static).map((b) => `${b.beat} (motion ${b.motion} < ${manifest.minMotion})`);
      if (stat.length) {
        return fail(`Static beat detected (frame diff): ${stat.join("; ")}\nFix the animation and regenerate the grid.`);
      }

      const problems = [];
      for (const b of manifest.beats) {
        if (!notes.includes(b.beat)) {
          problems.push(`beat "${b.beat}" missing from notes`);
          continue;
        }
        const line = notes.split("\n").filter((l) => l.includes(b.beat)).join(" ");
        if (!b.frames.some((f) => new RegExp(`f0*${f}\\b`).test(line))) {
          problems.push(`beat "${b.beat}" line does not reference any sampled frame (e.g. ${b.frames.map((f) => "f" + f).join(", ")})`);
        }
      }
      if (problems.length) return fail(`Vision notes insufficient:\n- ${problems.join("\n- ")}`);
      if (notes.trim().length < 160) return fail("Notes are too short (<160 characters); write concrete observations.");

      return pass();
    },
  },
  {
    id: "render",
    title: "Render & teslimat",
    artifact: () => rel(project.video),
    hash: () => {
      const s = fs.existsSync(project.video) ? fs.statSync(project.video) : null;
      return s ? `${s.size}:${Math.round(s.mtimeMs)}` : "none";
    },
    prompt: () => ({ skills: [], task: `\`pnpm render --project ${project.slug}\` run.` }),
    check() {
      if (!fs.existsSync(project.video)) return fail(`${rel(project.video)} is missing.`);
      const st = fs.statSync(project.video);
      if (st.size < 50 * 1024) return fail(`MP4 is suspiciously small (${st.size} B).`);
      if (st.mtimeMs < mtime(project.notes)) return fail("MP4 is older than the vision notes; re-render.");
      return pass();
    },
    exec() {
      console.log(`${DIM}Running pnpm render --project ${project.slug}...${RESET}`);
      const r = spawnSync(process.execPath, [path.join(rootDir, "scripts", "render.mjs"), "--project", project.slug], {
        cwd: rootDir,
        stdio: "inherit",
        shell: process.platform === "win32",
      });
      return r.status === 0;
    },
  },
];

const pass = () => ({ ok: true });
const fail = (msg) => ({ ok: false, msg });

// ---------- Zincir & Durum ----------
function chainHashes() {
  let prev = "";
  return STAGES.map((s) => (prev = sha(prev + s.hash())));
}

function evaluate(state) {
  const chain = chainHashes();
  let blocked = false;
  return STAGES.map((s, i) => {
    const rec = state.stages[s.id];
    let status;
    if (blocked) status = "blocked";
    else if (!rec) status = "pending";
    else if (rec.chain !== chain[i]) status = "stale";
    else status = "done";
    if (status !== "done") blocked = true;
    return { stage: s, status };
  });
}

const ICON = {
  done: `${GREEN}✔ done   ${RESET}`,
  pending: `${YELLOW}▶ pending${RESET}`,
  stale: `${RED}⟳ stale  ${RESET}`,
  blocked: `${DIM}⏸ blocked${RESET}`,
};

function printStatus(state) {
  console.log(`\n${BOLD}==== STUDIO PIPELINE [${project.slug.toUpperCase()}] ====${RESET}`);
  console.log(`Brief: ${state.brief}\n`);
  evaluate(state).forEach(({ stage, status }, i) =>
    console.log(`${i + 1}. ${ICON[status]} ${BOLD}${stage.id}${RESET} — ${stage.title}\n   ${DIM}artifact: ${stage.artifact()}${RESET}`)
  );
  console.log();
}

const activeStage = (state) => evaluate(state).find((e) => e.status !== "done");

function checkStage(state, stage) {
  const idx = STAGES.indexOf(stage);
  const ev = evaluate(state);
  for (let i = 0; i < idx; i++) {
    if (ev[i].status !== "done") {
      console.log(`${RED}${BOLD}[GATE CLOSED]${RESET} '${stage.id}' requires '${STAGES[i].id}' to pass first (status: ${ev[i].status}).`);
      return false;
    }
  }
  const res = stage.check();
  if (!res.ok) {
    console.log(`${RED}${BOLD}[${stage.id}: INVALID]${RESET}\n${res.msg}\n\n${RED}The next stage cannot be entered until this is fixed.${RESET}\n`);
    return false;
  }
  state.stages[stage.id] = { chain: chainHashes()[idx], at: new Date().toISOString() };
  STAGES.slice(idx + 1).forEach((s) => delete state.stages[s.id]);
  saveState(state);
  console.log(`${GREEN}${BOLD}[${stage.id}: SEALED]${RESET}`);
  return true;
}

// ---------- Command Handlers ----------
if (cmd === "init") {
  const brief = subArg || "Motion graphic scene production";
  if (fs.existsSync(studioDir)) {
    const archive = path.join(rootDir, ".studio", `${project.slug}-archive-${Date.now()}`);
    fs.renameSync(studioDir, archive);
    console.log(`${DIM}Previous run archived: ${rel(archive)}${RESET}`);
  }
  fs.mkdirSync(promptsDir, { recursive: true });
  saveState({ project: project.slug, brief, createdAt: new Date().toISOString(), stages: {} });
  console.log(`${GREEN}${BOLD}New run started [${project.slug}].${RESET}`);
  printStatus(loadState());
  console.log(`Next: ${BOLD}node scripts/studio.mjs next --project ${project.slug}${RESET}`);
} else if (cmd === "status") {
  printStatus(loadState());
} else if (cmd === "next") {
  const state = loadState();
  const act = activeStage(state);
  if (!act) {
    console.log(`${GREEN}${BOLD}All stages complete. Delivery: ${rel(project.video)}${RESET}`);
    process.exit(0);
  }
  const { skills, task } = act.stage.prompt(state);
  const body =
    `# STAGE ${STAGES.indexOf(act.stage) + 1}/${STAGES.length}: ${act.stage.id.toUpperCase()} — ${act.stage.title} [${project.slug}]\n\n` +
    `Status: ${act.status}. In this stage, produce ONLY the artifact below; do not do the work of later stages.\n\n` +
    `## TASK\n${task}\n\n## CONTEXT (skills for this stage)\n${skills.filter(Boolean).join("\n\n---\n\n") || "(none)"}\n\n` +
    `## WHEN DONE\n\`node scripts/studio.mjs check --project ${project.slug}\` run.\n`;
  fs.mkdirSync(promptsDir, { recursive: true });
  const out = path.join(promptsDir, `${act.stage.id}.md`);
  fs.writeFileSync(out, body);
  console.log(body);
  console.log(`${DIM}(prompt kaydedildi: ${rel(out)})${RESET}`);
} else if (cmd === "check") {
  const state = loadState();
  const targetStageId = parsed.positional[1];
  const target = targetStageId ? STAGES.find((s) => s.id === targetStageId) : activeStage(state)?.stage;
  if (targetStageId && !target) {
    console.error(`Unknown stage: ${targetStageId}`);
    process.exit(1);
  }
  if (!target) {
    console.log(`${GREEN}All stages complete.${RESET}`);
    process.exit(0);
  }
  const ok = checkStage(state, target);
  printStatus(state);
  process.exit(ok ? 0 : 1);
} else if (cmd === "run") {
  const state = loadState();
  for (const stage of STAGES) {
    const cur = evaluate(state).find((e) => e.stage === stage);
    if (cur.status === "done") continue;
    if (stage.id === "render" && stage.exec) {
      if (!stage.exec()) {
        console.log(`${RED}${BOLD}[render: FAILED]${RESET}`);
        process.exit(1);
      }
    }
    if (!checkStage(state, stage)) {
      printStatus(state);
      process.exit(1);
    }
  }
  printStatus(state);
  console.log(`${GREEN}${BOLD}DELIVERED:${RESET} ${rel(project.video)}`);
} else {
  console.error("Commands: init | status | next | check [stage] | run");
  process.exit(1);
}
