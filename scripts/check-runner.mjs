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

console.log("[CHECK] Proje kayıt defteri güncelleniyor...");
run("node", ["scripts/gen-registry.mjs"]);

console.log("\n[CHECK] Spec sözleşmesi doğrulanıyor...");
run("node", ["scripts/validate-spec.mjs", ...projectFlag]);

console.log("\n[CHECK] AST sözdizimi denetleniyor...");
run("node", ["scripts/ast-lint.mjs", ...projectFlag]);

console.log("\n[CHECK] Slop ve yayın standartları taranıyor...");
run("node", ["scripts/slop-linter.mjs", ...projectFlag]);

console.log("\n[CHECK] Opus Critic Audit çalıştırılıyor...");
run("node", ["scripts/critic-audit.mjs", ...projectFlag]);

console.log("\n[CHECK] Glif ve tipografi denetleniyor...");
run("node", ["scripts/glyph-audit.mjs", ...projectFlag]);

console.log("\n[CHECK] TypeScript tip denetimi yapılıyor...");
run("npx", ["tsc", "--noEmit"]);

console.log("\n\x1b[32m\x1b[1m[CHECK: TÜM TESTLER BAŞARIYLA GEÇTİ]\x1b[0m\n");
