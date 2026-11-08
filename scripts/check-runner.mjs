import { spawnSync } from "node:child_process";
import { parseArgs } from "./lib/projects.mjs";

const args = process.argv.slice(2);
const parsed = parseArgs(args);
const projectFlag = parsed.project ? ["--project", parsed.project] : [];

function run(cmd, cmdArgs) {
  const res = spawnSync(cmd, cmdArgs, { stdio: "inherit", shell: true });
  if (res.status !== 0) {
    process.exit(res.status ?? 1);
  }
}

console.log("[CHECK] Updating project registry...");
run("node", ["scripts/gen-registry.mjs"]);

console.log("\n[CHECK] Verifying studio skills integrity and enforcement matrix...");
run("node", ["scripts/audit-skills.mjs"]);

console.log("\n[CHECK] Validating motion spec contracts...");
run("node", ["scripts/validate-spec.mjs", ...projectFlag]);

console.log("\n[CHECK] Validating harness-v2 storyboard boards (SB001-SB007)...");
run("node", ["scripts/storyboard-audit.mjs", ...projectFlag]);

console.log("\n[CHECK] Auditing storyboard & creative direction (Shift-Left)...");
run("node", ["scripts/audit-storyboard.mjs", ...projectFlag]);

console.log("\n[CHECK] Auditing AST syntax & code purity...");
run("node", ["scripts/ast-lint.mjs", ...projectFlag]);

console.log("\n[CHECK] Auditing harness-v2 timelines (behavior-based)...");
run("npx", ["tsx", "scripts/timeline-audit.mjs", ...projectFlag]);

console.log("\n[CHECK] Auditing motion quality & transition continuity...");
run("node", ["scripts/motion-audit.mjs", ...projectFlag]);

console.log("\n[CHECK] Scanning for slop & broadcast violations...");
run("node", ["scripts/slop-linter.mjs", ...projectFlag]);

console.log("\n[CHECK] Auditing Motion Studio v0.9 Craft & Determinism...");
run("node", ["scripts/craft-audit.mjs", ...projectFlag]);

console.log("\n[CHECK] Verifying Visual QA & Frame Evidence...");
run("node", ["scripts/visual-qa.mjs", ...projectFlag]);

console.log("\n[CHECK] Executing Motion Lab Critic Director Audit...");
run("node", ["scripts/critic-audit.mjs", ...projectFlag]);

console.log("\n[CHECK] Auditing typography & glyphs...");
run("node", ["scripts/glyph-audit.mjs", ...projectFlag]);

console.log("\n[CHECK] Running core math unit tests (Spring / Bézier / Scramble)...");
run("npx", ["tsx", "scripts/test-math-core.mjs"]);

console.log("\n[CHECK] Running motion preset tests...");
run("npx", ["tsx", "scripts/test-presets.mjs"]);

console.log("\n[CHECK] Running physics helper tests...");
run("npx", ["tsx", "scripts/test-physics.mjs"]);

console.log("\n[CHECK] Running timeline-audit fixture tests...");
run("node", ["scripts/test-timeline-audit.mjs"]);

console.log("\n[CHECK] Scoring eval reference solutions and the weak fixture (evals/)...");
run("node", ["scripts/test-evals.mjs"]);

if (process.env.CHECK_FAST === "1") {
  console.log("\n[CHECK] CHECK_FAST=1: skipping the eval anti-cheat fixtures (node scripts/test-evals-cheats.mjs, about 1 min).");
} else {
  console.log("\n[CHECK] Running the eval anti-cheat fixtures (about 1 min; set CHECK_FAST=1 to skip)...");
  run("node", ["scripts/test-evals-cheats.mjs"]);
}

if (process.env.CHECK_PROBE === "1") {
  console.log("\n[CHECK] CHECK_PROBE=1: running the browser-probe fixture tests (headless Chrome, about 1 min)...");
  run("node", ["scripts/test-browser-probe.mjs"]);
} else {
  console.log("\n[CHECK] Browser-probe fixture tests skipped (they need Chrome): run with CHECK_PROBE=1 pnpm check, or pnpm test:probe.");
}

console.log("\n[CHECK] Auditing template library and time-driver bridge...");
run("node", ["scripts/test-templates.mjs"]);

console.log("\n[CHECK] Verifying docs/MOTION_MATH.md is up to date...");
run("npx", ["tsx", "scripts/gen-motion-math.mjs", "--check"]);

console.log("\n[CHECK] Verifying docs/DESIGN_SYSTEM.md is up to date...");
run("npx", ["tsx", "scripts/gen-design-system.mjs", "--check"]);

console.log("\n[CHECK] Executing TypeScript compiler check...");
run("npx", ["tsc", "--noEmit"]);

console.log("\n\x1b[32m\x1b[1m[CHECK: ALL QUALITY GATES PASSED SUCCESSFULLY]\x1b[0m\n");

