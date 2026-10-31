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
 * DETERMINİSTİK STÜDYO RENDER MOTORU (Çok Projeli)
 *
 * Kullanım:
 *   node scripts/render.mjs [--project <slug>] [--all]
 */

const args = parseArgs();
const targets = resolveTargets(args);

const RED = "\x1b[31m", GREEN = "\x1b[32m", BOLD = "\x1b[1m", RESET = "\x1b[0m";

if (targets.length === 0) {
  console.error(`${RED}${BOLD}[ERROR] Render edilecek proje bulunamadı.${RESET}`);
  process.exit(1);
}

console.log(`\n${BOLD}====================================================${RESET}`);
console.log(`${BOLD}   UNIVERSAL MOTION STUDIO — OTONOM RENDER MOTORU   ${RESET}`);
console.log(`${BOLD}====================================================${RESET}`);
console.log(`Hedef Projeler: ${targets.map((t) => t.slug).join(", ")}\n`);

// 1. Tailwind derle
console.log("[1/3] Tailwind CSS derleniyor...");
buildCss();

// 2. Kayıt defteri & kalite kapılarını doğrula
console.log("[2/3] Kayıt defteri & Kalite kapıları denetleniyor (pnpm check)...");
const regResult = runNode("gen-registry.mjs");
if (regResult.code !== 0) {
  console.error(`${RED}[ERROR] Kayıt defteri hatası:\n${regResult.out}${RESET}`);
  process.exit(1);
}

for (const target of targets) {
  const specRes = runNode("validate-spec.mjs", ["--project", target.slug]);
  if (specRes.code !== 0) {
    console.error(`${RED}[ERROR] ${target.slug} spec doğrulaması başarısız:\n${specRes.out}${RESET}`);
    process.exit(1);
  }
}

const astRes = runNode("ast-lint.mjs", args.project ? ["--project", args.project] : []);
if (astRes.code !== 0) {
  console.error(`${RED}[ERROR] AST denetimi başarısız:\n${astRes.out}${RESET}`);
  process.exit(1);
}

const slopRes = runNode("slop-linter.mjs", args.project ? ["--project", args.project] : []);
if (slopRes.code !== 0) {
  console.error(`${RED}[ERROR] Anti-slop linter başarısız:\n${slopRes.out}${RESET}`);
  process.exit(1);
}

const tscRes = spawnSync("npx", ["tsc", "--noEmit"], {
  cwd: rootDir,
  shell: process.platform === "win32",
  encoding: "utf-8",
});
if (tscRes.status !== 0) {
  console.error(`${RED}[ERROR] TypeScript derleme hatası:\n${tscRes.stdout}${tscRes.stderr}${RESET}`);
  process.exit(1);
}
console.log(`${GREEN}✓ Tüm kalite kapıları onaylandı.${RESET}\n`);

// 3. Her projeyi render et
console.log("[3/3] Remotion render başlatılıyor...");
for (let i = 0; i < targets.length; i++) {
  const t = targets[i];
  console.log(`\n----------------------------------------------------`);
  console.log(`[${i + 1}/${targets.length}] Render ediliyor: ${BOLD}${t.slug}${RESET}`);
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
    console.error(`\n${RED}${BOLD}[RENDER FAILED] ${t.slug} oluşturulamadı!${RESET}\n`);
    process.exit(1);
  }

  if (!fs.existsSync(t.video)) {
    console.error(`\n${RED}${BOLD}[ERROR] Render tamamlandı ancak dosya bulunamadı:${RESET} ${rel(t.video)}\n`);
    process.exit(1);
  }

  const stat = fs.statSync(t.video);
  const sizeMb = (stat.size / (1024 * 1024)).toFixed(2);
  console.log(`\n${GREEN}${BOLD}✓ TESLİMAT TAMAM:${RESET} ${rel(t.video)} (${sizeMb} MB)`);
}

console.log(`\n${GREEN}${BOLD}[TÜM HEDEFLER BAŞARIYLA RENDER EDİLDİ]${RESET}\n`);
