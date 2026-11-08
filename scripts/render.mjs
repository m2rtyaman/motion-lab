import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  parseArgs,
  resolveTargets,
  rootDir,
  rel,
  buildCss,
  runNode,
} from "./lib/projects.mjs";

/**
 * DETERMINISTIC STUDIO RENDER ENGINE (multi-project)
 *
 * Usage:
 *   node scripts/render.mjs [--project <slug>] [--all]
 */

const args = parseArgs();
const targets = resolveTargets(args);

const RED = "\x1b[31m", GREEN = "\x1b[32m", BOLD = "\x1b[1m", RESET = "\x1b[0m";

if (targets.length === 0) {
  console.error(`${RED}${BOLD}[ERROR] No project found to render.${RESET}`);
  process.exit(1);
}

console.log(`\n${BOLD}====================================================${RESET}`);
console.log(`${BOLD}   UNIVERSAL MOTION STUDIO — OTONOM RENDER MOTORU   ${RESET}`);
console.log(`${BOLD}====================================================${RESET}`);
console.log(`Target Projects: ${targets.map((t) => t.slug).join(", ")}\n`);

// 1. Tailwind derle
console.log("[1/3] Tailwind CSS derleniyor...");
buildCss();

// 2. Verify registry & quality gates
console.log("[2/3] Checking registry & quality gates (pnpm check)...");
const regResult = runNode("gen-registry.mjs");
if (regResult.code !== 0) {
  console.error(`${RED}[ERROR] Registry error:\n${regResult.out}${RESET}`);
  process.exit(1);
}

for (const target of targets) {
  const specRes = runNode("validate-spec.mjs", ["--project", target.slug]);
  if (specRes.code !== 0) {
    console.error(`${RED}[ERROR] ${target.slug} spec validation failed:\n${specRes.out}${RESET}`);
    process.exit(1);
  }
}

const astRes = runNode("ast-lint.mjs", args.project ? ["--project", args.project] : []);
if (astRes.code !== 0) {
  console.error(`${RED}[ERROR] AST audit failed:\n${astRes.out}${RESET}`);
  process.exit(1);
}

const slopRes = runNode("slop-linter.mjs", args.project ? ["--project", args.project] : []);
if (slopRes.code !== 0) {
  console.error(`${RED}[ERROR] Anti-slop linter failed:\n${slopRes.out}${RESET}`);
  process.exit(1);
}

const tscRes = spawnSync("npx", ["tsc", "--noEmit"], {
  cwd: rootDir,
  shell: process.platform === "win32",
  encoding: "utf-8",
});
if (tscRes.status !== 0) {
  console.error(`${RED}[ERROR] TypeScript compile error:\n${tscRes.stdout}${tscRes.stderr}${RESET}`);
  process.exit(1);
}
console.log(`${GREEN}✓ All quality gates passed.${RESET}\n`);

// 3. Her projeyi render et
console.log("[3/3] Starting Remotion render...");
for (let i = 0; i < targets.length; i++) {
  const t = targets[i];
  console.log(`\n----------------------------------------------------`);
  console.log(`[${i + 1}/${targets.length}] Rendering: ${BOLD}${t.slug}${RESET}`);
  console.log(`----------------------------------------------------`);

  fs.mkdirSync(t.outDir, { recursive: true });

  const renderArgs = [
    "remotion",
    "render",
    "src/remotion/index.ts",
    t.slug,
    t.video,
    "--gl=angle",
  ];

  const renderRes = spawnSync("npx", renderArgs, {
    cwd: rootDir,
    shell: process.platform === "win32",
    stdio: "inherit",
  });

  if (renderRes.status !== 0) {
    console.error(`\n${RED}${BOLD}[RENDER FAILED] ${t.slug} could not be created!${RESET}\n`);
    process.exit(1);
  }

  if (!fs.existsSync(t.video)) {
    console.error(`\n${RED}${BOLD}[ERROR] Render finished but file not found:${RESET} ${rel(t.video)}\n`);
    process.exit(1);
  }

  const stat = fs.statSync(t.video);
  const sizeMb = (stat.size / (1024 * 1024)).toFixed(2);
  console.log(`\n${GREEN}${BOLD}✓ DELIVERED:${RESET} ${rel(t.video)} (${sizeMb} MB)`);
}

console.log(`\n${GREEN}${BOLD}[ALL TARGETS RENDERED SUCCESSFULLY]${RESET}\n`);
