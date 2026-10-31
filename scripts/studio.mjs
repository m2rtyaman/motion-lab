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
 * STUDIO PIPELINE ORKESTRATÖRÜ V3 (Çok Projeli)
 *
 * Her proje için bağımsız state (.studio/<slug>/state.json) ve aşama zinciri yönetir:
 *   direction → spec → code → vision → render
 *
 * Komutlar:
 *   node scripts/studio.mjs init "<brief>" [--project <slug>]
 *   node scripts/studio.mjs status [--project <slug>]
 *   node scripts/studio.mjs next [--project <slug>]
 *   node scripts/studio.mjs check [aşama] [--project <slug>]
 *   node scripts/studio.mjs run [--project <slug>]
 */

const rawArgs = process.argv.slice(2);
const parsed = parseArgs(rawArgs);

// İlk konumsal argüman komuttur (init, status, next, check, run)
const cmd = parsed.positional[0] ?? "status";
const subArg = parsed.positional.slice(1).join(" ").trim();

const project = resolveProject(parsed);

const studioDir = project.studioDir;
const statePath = path.join(studioDir, "state.json");
const promptsDir = path.join(studioDir, "prompts");

const RED = "\x1b[31m", GREEN = "\x1b[32m", YELLOW = "\x1b[33m", BOLD = "\x1b[1m", DIM = "\x1b[2m", RESET = "\x1b[0m";

// ---------- Yardımcılar ----------
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
    console.error(`${RED}${BOLD}[ERROR] "${project.slug}" için aktif studio koşusu yok.${RESET}`);
    console.log(`Başlat: pnpm studio:init --project ${project.slug} "<brief>"`);
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

// ---------- Aşama Tanımları ----------
const STAGES = [
  {
    id: "direction",
    title: "Motion Director (konsept + fizik)",
    artifact: () => rel(project.direction),
    hash: () => sha(readIf(project.direction) ?? ""),
    prompt: (state) => ({
      skills: [skill("studio-router"), skill("motion-director", ["rules.md"])],
      task:
        `Proje: ${project.slug}\nBrief: ${state.brief}\n\n` +
        `\`${rel(project.direction)}\` dosyasını yaz. SADECE konsept ve fizik kararları; KOD VE SÜRE/KARE YOK.\n` +
        `Zorunlu başlıklar: \`## Paradigm\` (tek satır: ${MODES.join(" | ")}), \`## Concept\`, \`## Physics\` ` +
        `(ağırlık, ivme, darbe hissi, yay/damping karakteri), \`## Typography & Palette\`. Her bölüm en az 40 karakter.`,
    }),
    check() {
      const buf = readIf(project.direction);
      if (!buf) return fail(`${rel(project.direction)} bulunamadı.`);
      const md = buf.toString("utf-8");
      const errs = [];
      const paradigm = section(md, "Paradigm").split(/\s+/)[0];
      if (!MODES.includes(paradigm)) errs.push(`## Paradigm geçersiz: "${paradigm}" (${MODES.join(" | ")})`);
      for (const h of ["Concept", "Physics", "Typography & Palette"]) {
        if (section(md, h.replace("&", "\\&")).length < 40) {
          errs.push(`## ${h} eksik veya 40 karakterden kısa.`);
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
      const dirText = readIf(project.direction)?.toString("utf-8") ?? "(yok)";
      return {
        skills: [
          skill("motion-choreographer"),
          `### Şema\n${readIf(path.join(rootDir, "specs", "motion-spec.schema.json"))?.toString("utf-8") ?? ""}`,
          `### Örnek spec\n${readIf(project.spec)?.toString("utf-8") ?? ""}`,
        ],
        task:
          `Proje: ${project.slug}\nBrief: ${state.brief}\n\nONAYLI YÖNLENDİRME:\n${dirText}\n\n` +
          `\`${rel(project.spec)}\` dosyasını yaz (yalnızca JSON; JSX/TSX YAZMA). \`mode\` yönlendirmedeki Paradigm ile aynı olmalı. ` +
          `Doğrulama: \`node scripts/validate-spec.mjs --project ${project.slug}\`. Hatalar geçersiz sayılır, "Çözüm →" satırlarını uygula.`,
      };
    },
    check() {
      const v = runNode("validate-spec.mjs", ["--project", project.slug]);
      if (v.code !== 0) return fail(`validate-spec başarısız:\n${tail(v.out, 30)}`);
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
    title: "Remotion Engineer (Scene.tsx) + statik denetim",
    artifact: () => `${rel(project.dir)}/**/*.{ts,tsx}`,
    hash: () => sha(projectCodeFiles().map((f) => `${f}:${sha(fs.readFileSync(f))}`).join("|")),
    prompt: (state) => {
      const specText = readIf(project.spec)?.toString("utf-8") ?? "(yok)";
      return {
        skills: [skill("remotion-engineer"), skill("anti-slop-auditor")],
        task:
          `Proje: ${project.slug}\nBrief: ${state.brief}\n\nONAYLI SPEC:\n${specText}\n\n` +
          `\`${rel(project.scene)}\` dosyasını spec'teki beat/kamera/sfx değerlerine birebir uyacak şekilde kodla. ` +
          `Sayıları tokens.ts üzerinden kullan, sihirli süre/ease kullanma. Bitince: \`pnpm check --project ${project.slug}\`.`,
      };
    },
    check() {
      runNode("gen-registry.mjs");
      const v = runNode("validate-spec.mjs", ["--project", project.slug]);
      if (v.code !== 0) return fail(`Spec ↔ kod uyumsuz:\n${tail(v.out, 30)}`);
      const a = runNode("ast-lint.mjs", ["--project", project.slug]);
      if (a.code !== 0) return fail(`ast-lint başarısız:\n${tail(a.out, 30)}`);
      const l = runNode("slop-linter.mjs", ["--project", project.slug]);
      if (l.code !== 0) return fail(`slop-linter başarısız:\n${tail(l.out, 30)}`);
      const t = spawnSync("npx", ["tsc", "--noEmit"], {
        cwd: rootDir,
        shell: process.platform === "win32",
        encoding: "utf-8",
      });
      if (t.status !== 0) return fail(`tsc hatası:\n${tail(t.stdout + t.stderr, 25)}`);
      return pass();
    },
  },
  {
    id: "vision",
    title: "Görsel denetim (contact-sheet + yazılı gözlem)",
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
        skills: [skill("anti-slop-auditor")],
        task:
          `1) \`pnpm render:contact-sheet --project ${project.slug}\` çalıştır.\n` +
          `2) \`${rel(project.grid)}\` görselini AÇIP İNCELE.\n` +
          `3) \`${rel(project.notes)}\` dosyasına HER beat için (${ids}) AYRI SATIR yaz;\n` +
          `   Satır beat id'sini ve manifest'teki örnek kare numarasını "f130" formatında içermelidir.\n` +
          `   Gözlemlerini, kompozisyon uyumunu ve varsa kalite borçlarını belirt.`,
      };
    },
    check() {
      if (!fs.existsSync(project.grid)) {
        return fail(`${rel(project.grid)} yok. \`pnpm render:contact-sheet --project ${project.slug}\` çalıştır.`);
      }
      const newestInput = Math.max(...projectCodeFiles().map(mtime), mtime(project.spec));
      if (mtime(project.grid) < newestInput) {
        return fail("Grid görseli kodun/spec'in gerisinde (stale). contact-sheet'i yeniden üret.");
      }
      const manifest = (() => {
        try {
          return JSON.parse(fs.readFileSync(project.manifest, "utf-8"));
        } catch {
          return null;
        }
      })();
      if (!manifest) {
        return fail(`${rel(project.manifest)} yok/bozuk. contact-sheet yeniden çalıştır.`);
      }

      const notes = readIf(project.notes)?.toString("utf-8");
      if (!notes) {
        return fail(`${rel(project.notes)} yok. Görseli inceleyip yazılı gözlem bırak.`);
      }
      if (mtime(project.notes) < mtime(project.grid)) {
        return fail("Vision notları grid'den önce yazılmış; görseli inceledikten sonra yaz.");
      }

      const specBeats = readSpec()?.beats ?? [];
      const stat = manifest.beats.filter((b) => b.static).map((b) => `${b.beat} (hareket ${b.motion} < ${manifest.minMotion})`);
      if (stat.length) {
        return fail(`Statik beat tespit edildi (kare-farkı): ${stat.join("; ")}\nAnimasyonu düzeltip grid'i yeniden üret.`);
      }

      const problems = [];
      for (const b of manifest.beats) {
        if (!notes.includes(b.beat)) {
          problems.push(`beat "${b.beat}" notlarda yok`);
          continue;
        }
        const line = notes.split("\n").filter((l) => l.includes(b.beat)).join(" ");
        if (!b.frames.some((f) => new RegExp(`f0*${f}\\b`).test(line))) {
          problems.push(`beat "${b.beat}" satırı örneklenen karelerden birine atıf yapmıyor (örn. ${b.frames.map((f) => "f" + f).join(", ")})`);
        }
      }
      if (problems.length) return fail(`Vision notları yetersiz:\n- ${problems.join("\n- ")}`);
      if (notes.trim().length < 160) return fail("Notlar çok kısa (<160 karakter); somut gözlem yaz.");

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
    prompt: () => ({ skills: [], task: `\`pnpm render --project ${project.slug}\` çalıştır.` }),
    check() {
      if (!fs.existsSync(project.video)) return fail(`${rel(project.video)} yok.`);
      const st = fs.statSync(project.video);
      if (st.size < 50 * 1024) return fail(`MP4 şüpheli derecede küçük (${st.size} B).`);
      if (st.mtimeMs < mtime(project.notes)) return fail("MP4 vision notlarından eski; yeniden render et.");
      return pass();
    },
    exec() {
      console.log(`${DIM}pnpm render --project ${project.slug} çalıştırılıyor...${RESET}`);
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
      console.log(`${RED}${BOLD}[KAPI KAPALI]${RESET} '${stage.id}' için önce '${STAGES[i].id}' geçmeli (durum: ${ev[i].status}).`);
      return false;
    }
  }
  const res = stage.check();
  if (!res.ok) {
    console.log(`${RED}${BOLD}[${stage.id}: GEÇERSİZ]${RESET}\n${res.msg}\n\n${RED}Düzeltene kadar sonraki aşamaya geçilemez.${RESET}\n`);
    return false;
  }
  state.stages[stage.id] = { chain: chainHashes()[idx], at: new Date().toISOString() };
  STAGES.slice(idx + 1).forEach((s) => delete state.stages[s.id]);
  saveState(state);
  console.log(`${GREEN}${BOLD}[${stage.id}: MÜHÜRLENDİ]${RESET}`);
  return true;
}

// ---------- Komut İşleyicileri ----------
if (cmd === "init") {
  const brief = subArg || "Motion graphic sahne üretimi";
  if (fs.existsSync(studioDir)) {
    const archive = path.join(rootDir, ".studio", `${project.slug}-archive-${Date.now()}`);
    fs.renameSync(studioDir, archive);
    console.log(`${DIM}Önceki koşu arşivlendi: ${rel(archive)}${RESET}`);
  }
  fs.mkdirSync(promptsDir, { recursive: true });
  saveState({ project: project.slug, brief, createdAt: new Date().toISOString(), stages: {} });
  console.log(`${GREEN}${BOLD}Yeni koşu başlatıldı [${project.slug}].${RESET}`);
  printStatus(loadState());
  console.log(`Sıradaki: ${BOLD}node scripts/studio.mjs next --project ${project.slug}${RESET}`);
} else if (cmd === "status") {
  printStatus(loadState());
} else if (cmd === "next") {
  const state = loadState();
  const act = activeStage(state);
  if (!act) {
    console.log(`${GREEN}${BOLD}Tüm aşamalar tamam. Teslimat: ${rel(project.video)}${RESET}`);
    process.exit(0);
  }
  const { skills, task } = act.stage.prompt(state);
  const body =
    `# AŞAMA ${STAGES.indexOf(act.stage) + 1}/${STAGES.length}: ${act.stage.id.toUpperCase()} — ${act.stage.title} [${project.slug}]\n\n` +
    `Durum: ${act.status}. Bu aşamada SADECE aşağıdaki artifact'i üret; sonraki aşamaların işini yapma.\n\n` +
    `## GÖREV\n${task}\n\n## BAĞLAM (bu aşamaya ait skill'ler)\n${skills.filter(Boolean).join("\n\n---\n\n") || "(yok)"}\n\n` +
    `## BİTİNCE\n\`node scripts/studio.mjs check --project ${project.slug}\` çalıştır.\n`;
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
    console.error(`Bilinmeyen aşama: ${targetStageId}`);
    process.exit(1);
  }
  if (!target) {
    console.log(`${GREEN}Tüm aşamalar tamam.${RESET}`);
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
        console.log(`${RED}${BOLD}[render: BAŞARISIZ]${RESET}`);
        process.exit(1);
      }
    }
    if (!checkStage(state, stage)) {
      printStatus(state);
      process.exit(1);
    }
  }
  printStatus(state);
  console.log(`${GREEN}${BOLD}TESLİMAT TAMAM:${RESET} ${rel(project.video)}`);
} else {
  console.error("Komutlar: init | status | next | check [aşama] | run");
  process.exit(1);
}
