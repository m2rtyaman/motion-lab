import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

/**
 * STUDIO PIPELINE ORKESTRATÖRÜ (Faz 2)
 *
 * Motor bir model çağırmaz; bir KAPI BEKÇİSİDİR. Ajan (Gemini/Claude/insan) her aşamanın
 * artifact'ini üretir, bu script doğrular ve zincire mühürler. Önceki aşama geçmeden sonraki
 * aşama ilerleyemez; önceki artifact değişirse sonraki tüm aşamalar "stale" olur.
 *
 *   direction → spec → code → vision → render
 *
 * Komutlar:
 *   node scripts/studio.mjs init "<brief>"   yeni koşu başlatır
 *   node scripts/studio.mjs status           aşama durumları
 *   node scripts/studio.mjs next             aktif aşamanın odaklı prompt'unu üretir
 *   node scripts/studio.mjs check [aşama]    aktif (veya verilen) aşamayı doğrular ve mühürler
 *   node scripts/studio.mjs run              sırayla tüm aşamaları doğrular; render'ı yalnızca kapılar açıksa çalıştırır
 */
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const studioDir = path.join(rootDir, ".studio", "current");
const statePath = path.join(studioDir, "state.json");
const promptsDir = path.join(studioDir, "prompts");

const SPEC_PATH = path.join(rootDir, "specs", "scene.motion-spec.json");
const DIRECTION_PATH = path.join(studioDir, "01-direction.md");
const NOTES_PATH = path.join(studioDir, "04-vision-notes.md");
const GRID_PATH = path.join(rootDir, "out", "visual-audit-grid.png");
const MANIFEST_PATH = path.join(rootDir, "out", "vision", "manifest.json");
const VIDEO_PATH = path.join(rootDir, "out", "repo-news-9x16.mp4");

const RED = "\x1b[31m", GREEN = "\x1b[32m", YELLOW = "\x1b[33m", BOLD = "\x1b[1m", DIM = "\x1b[2m", RESET = "\x1b[0m";
const MODES = ["cinematic-world", "editorial-ui", "kinetic-poster"];

// ---------- yardımcılar ----------
const sha = (buf) => crypto.createHash("sha1").update(buf).digest("hex");
const rel = (p) => path.relative(rootDir, p).replaceAll("\\", "/");
const readIf = (p) => (fs.existsSync(p) ? fs.readFileSync(p) : null);
const mtime = (p) => (fs.existsSync(p) ? fs.statSync(p).mtimeMs : 0);

function walk(dir, exts) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return walk(full, exts);
    return exts.has(path.extname(e.name)) ? [full] : [];
  });
}
const srcFiles = () => walk(path.join(rootDir, "src"), new Set([".ts", ".tsx"])).sort();

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
    console.error(`${RED}${BOLD}Aktif koşu yok.${RESET} Başlat: node scripts/studio.mjs init "<brief>"`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(statePath, "utf-8"));
}
const saveState = (s) => fs.writeFileSync(statePath, JSON.stringify(s, null, 2));

function run(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: rootDir, encoding: "utf-8", shell: process.platform === "win32" });
  return { code: r.status ?? 1, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}
const tail = (s, n = 18) => s.trim().split("\n").slice(-n).join("\n");

function section(md, title) {
  const re = new RegExp(`^##\\s+${title}\\s*$([\\s\\S]*?)(?=^##\\s|(?![\\s\\S]))`, "im");
  return md.match(re)?.[1]?.trim() ?? "";
}
function readSpec() {
  try { return JSON.parse(fs.readFileSync(SPEC_PATH, "utf-8").replace(/^\uFEFF/, "")); } catch { return null; }
}

// ---------- aşama tanımları ----------
const STAGES = [
  {
    id: "direction",
    title: "Motion Director (konsept + fizik)",
    artifact: () => rel(DIRECTION_PATH),
    hash: () => sha(readIf(DIRECTION_PATH) ?? ""),
    prompt: (state) => ({
      skills: [skill("studio-router"), skill("motion-director", ["rules.md"])],
      task:
        `Brief: ${state.brief}\n\n` +
        `\`${rel(DIRECTION_PATH)}\` dosyasını yaz. SADECE konsept ve fizik kararları; KOD VE SÜRE/KARE YOK.\n` +
        `Zorunlu başlıklar: \`## Paradigm\` (tek satır: ${MODES.join(" | ")}), \`## Concept\`, \`## Physics\` ` +
        `(ağırlık, ivme, darbe hissi, yay/damping karakteri), \`## Typography & Palette\`. Her bölüm en az 40 karakter.`,
    }),
    check() {
      const buf = readIf(DIRECTION_PATH);
      if (!buf) return fail(`${rel(DIRECTION_PATH)} yok`);
      const md = buf.toString("utf-8");
      const errs = [];
      const paradigm = section(md, "Paradigm").split(/\s+/)[0];
      if (!MODES.includes(paradigm)) errs.push(`## Paradigm geçersiz: "${paradigm}" (${MODES.join(" | ")})`);
      for (const h of ["Concept", "Physics", "Typography & Palette"])
        if (section(md, h.replace("&", "\\&")).length < 40) errs.push(`## ${h} eksik veya 40 karakterden kısa`);
      return errs.length ? fail(errs.join("\n")) : pass();
    },
  },
  {
    id: "spec",
    title: "Choreographer (zamanlama → motion-spec.json)",
    artifact: () => rel(SPEC_PATH),
    hash: () => sha(readIf(SPEC_PATH) ?? ""),
    prompt: (state) => {
      const direction = readIf(DIRECTION_PATH)?.toString("utf-8") ?? "(yok)";
      return {
        skills: [
          skill("motion-choreographer"),
          `### Şema\n${readIf(path.join(rootDir, "specs", "motion-spec.schema.json"))?.toString("utf-8") ?? ""}`,
          `### Örnek spec\n${readIf(SPEC_PATH)?.toString("utf-8") ?? ""}`,
        ],
        task:
          `Brief: ${state.brief}\n\nONAYLI YÖNLENDİRME:\n${direction}\n\n` +
          `\`${rel(SPEC_PATH)}\` dosyasını yaz (yalnızca JSON; JSX/TSX YAZMA). \`mode\` yönlendirmedeki Paradigm ile aynı olmalı. ` +
          `Doğrulama: \`node scripts/validate-spec.mjs\`. Hatalar geçersiz sayılır, "Çözüm →" satırlarını uygula.`,
      };
    },
    check() {
      const v = run("node", ["scripts/validate-spec.mjs", rel(SPEC_PATH)]);
      if (v.code !== 0) return fail(`validate-spec başarısız:\n${tail(v.out, 30)}`);
      const dir = readIf(DIRECTION_PATH)?.toString("utf-8") ?? "";
      const paradigm = section(dir, "Paradigm").split(/\s+/)[0];
      const spec = readSpec();
      if (spec && paradigm && spec.mode !== paradigm) return fail(`spec.mode=${spec.mode} ama direction Paradigm=${paradigm}`);
      return pass();
    },
  },
  {
    id: "code",
    title: "Remotion Engineer (Scene.tsx) + statik denetim",
    artifact: () => "src/**/*.{ts,tsx}",
    hash: () => sha(srcFiles().map((f) => `${f}:${sha(fs.readFileSync(f))}`).join("|")),
    prompt: (state) => {
      const spec = readIf(SPEC_PATH)?.toString("utf-8") ?? "(yok)";
      return {
        skills: [skill("remotion-engineer"), skill("anti-slop-auditor")],
        task:
          `Brief: ${state.brief}\n\nONAYLI SPEC (değiştirme; kod spec'e uysun):\n${spec}\n\n` +
          `\`src/components/Scene.tsx\` dosyasını spec'teki beat/kamera/sfx değerlerine birebir uyacak şekilde güncelle. ` +
          `Sayıları tokens.ts üzerinden kullan, sihirli sayı ekleme. Bitince: \`pnpm check\` ve \`npx tsc --noEmit\`.`,
      };
    },
    check() {
      const v = run("node", ["scripts/validate-spec.mjs", rel(SPEC_PATH)]);
      if (v.code !== 0) return fail(`Spec ↔ kod uyumsuz:\n${tail(v.out, 30)}`);
      const t = run("npx", ["tsc", "--noEmit"]);
      if (t.code !== 0) return fail(`tsc hatası:\n${tail(t.out, 25)}`);
      const l = run("node", ["scripts/slop-linter.mjs"]);
      if (l.code !== 0) return fail(`slop-linter başarısız:\n${tail(l.out, 30)}`);
      return pass();
    },
  },
  {
    id: "vision",
    title: "Görsel denetim (contact-sheet + yazılı gözlem)",
    artifact: () => `${rel(GRID_PATH)} + ${rel(NOTES_PATH)}`,
    hash: () => sha(Buffer.concat([readIf(GRID_PATH) ?? Buffer.alloc(0), readIf(MANIFEST_PATH) ?? Buffer.alloc(0), readIf(NOTES_PATH) ?? Buffer.alloc(0)])),
    prompt: () => {
      const spec = readSpec();
      const ids = (spec?.beats ?? []).map((b) => b.id).join(", ");
      return {
        skills: [skill("anti-slop-auditor")],
        task:
          `1) \`pnpm render:contact-sheet\` çalıştır. 2) \`${rel(GRID_PATH)}\` görselini AÇIP İNCELE (read_file ile).\n` +
          `3) \`${rel(NOTES_PATH)}\` dosyasına HER beat için (${ids}) AYRI SATIR yaz; satır beat id'sini ve örneklenen kare numaralarından en az birini "f130" biçiminde içersin ` +
          `(kare listesi: ${rel(MANIFEST_PATH)}; tekil kareler out/vision/frames/). Satırda: gördüğün şey, ` +
          `sorun var mı (metin/karakter çakışması, kırpılma, güvenli alan, hareket hissi), karar.\n` +
          `Sorun bulursan kodu düzelt ve aşamayı baştan yap. Notlar grid'den SONRA yazılmış olmalı.`,
      };
    },
    check() {
      if (!fs.existsSync(GRID_PATH)) return fail(`${rel(GRID_PATH)} yok. \`pnpm render:contact-sheet\` çalıştır.`);
      const newestInput = Math.max(...srcFiles().map(mtime), mtime(SPEC_PATH));
      if (mtime(GRID_PATH) < newestInput) return fail("Grid kodun/spec'in gerisinde (stale). contact-sheet'i yeniden üret.");
      const notes = readIf(NOTES_PATH)?.toString("utf-8");
      if (!notes) return fail(`${rel(NOTES_PATH)} yok. Görseli inceleyip yazılı gözlem bırak.`);
      if (mtime(NOTES_PATH) < mtime(GRID_PATH)) return fail("Notlar grid'den önce yazılmış; görseli inceledikten sonra yaz.");
      const manifest = (() => { try { return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8")); } catch { return null; } })();
      if (!manifest) return fail(`${rel(MANIFEST_PATH)} yok/bozuk. \`pnpm render:contact-sheet\` yeniden çalıştır.`);
      if (mtime(MANIFEST_PATH) < mtime(SPEC_PATH)) return fail("Manifest spec'ten eski; contact-sheet'i yeniden üret.");
      const specBeats = readSpec()?.beats ?? [];
      const covered = new Set(manifest.beats.map((b) => b.beat));
      const uncovered = specBeats.filter((b) => !covered.has(b.id)).map((b) => b.id);
      if (uncovered.length) return fail(`Manifest şu beat'leri örneklemiyor: ${uncovered.join(", ")}`);
      const stat = manifest.beats.filter((b) => b.static).map((b) => `${b.beat} (hareket ${b.motion} < ${manifest.minMotion})`);
      if (stat.length) return fail(`Statik beat tespit edildi (kare-farkı): ${stat.join("; ")}\nBeat içinde hareket yok; animasyonu düzeltip grid'i yeniden üret.`);
      const problems = [];
      for (const b of manifest.beats) {
        if (!notes.includes(b.beat)) { problems.push(`beat "${b.beat}" notlarda yok`); continue; }
        const line = notes.split("\n").filter((l) => l.includes(b.beat)).join(" ");
        if (!b.frames.some((f) => new RegExp(`f0*${f}\\b`).test(line)))
          problems.push(`beat "${b.beat}" satırı örneklenen karelerden birine atıf yapmıyor (örn. ${b.frames.map((f) => "f" + f).join(", ")})`);
      }
      if (problems.length) return fail(`Vision notları yetersiz:\n- ${problems.join("\n- ")}`);
      if (notes.trim().length < 200) return fail("Notlar çok kısa (<200 karakter); somut gözlem yaz.");
      return pass();
    },
  },
  {
    id: "render",
    title: "Render & teslimat",
    artifact: () => rel(VIDEO_PATH),
    hash: () => {
      const s = fs.existsSync(VIDEO_PATH) ? fs.statSync(VIDEO_PATH) : null;
      return s ? `${s.size}:${Math.round(s.mtimeMs)}` : "none";
    },
    prompt: () => ({ skills: [], task: "`pnpm render` çalıştır (veya `node scripts/studio.mjs run`)." }),
    check() {
      if (!fs.existsSync(VIDEO_PATH)) return fail(`${rel(VIDEO_PATH)} yok.`);
      const st = fs.statSync(VIDEO_PATH);
      if (st.size < 100 * 1024) return fail(`MP4 şüpheli derecede küçük (${st.size} B).`);
      if (st.mtimeMs < mtime(NOTES_PATH)) return fail("MP4 vision notlarından eski; yeniden render et.");
      return pass();
    },
    exec() {
      console.log(`${DIM}pnpm render çalıştırılıyor...${RESET}`);
      const r = spawnSync("pnpm", ["render"], { cwd: rootDir, stdio: "inherit", shell: process.platform === "win32" });
      return r.status === 0;
    },
  },
];

const pass = () => ({ ok: true });
const fail = (msg) => ({ ok: false, msg });

// ---------- zincir ----------
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
const ICON = { done: `${GREEN}✔ done   ${RESET}`, pending: `${YELLOW}▶ pending${RESET}`, stale: `${RED}⟳ stale  ${RESET}`, blocked: `${DIM}⏸ blocked${RESET}` };

function printStatus(state) {
  console.log(`\n${BOLD}==== STUDIO PIPELINE ====${RESET}\nBrief: ${state.brief}\n`);
  evaluate(state).forEach(({ stage, status }, i) =>
    console.log(`${i + 1}. ${ICON[status]} ${BOLD}${stage.id}${RESET} — ${stage.title}\n   ${DIM}artifact: ${stage.artifact()}${RESET}`));
  console.log();
}
const activeStage = (state) => evaluate(state).find((e) => e.status !== "done");

function checkStage(state, stage) {
  const idx = STAGES.indexOf(stage);
  const ev = evaluate(state);
  for (let i = 0; i < idx; i++)
    if (ev[i].status !== "done") {
      console.log(`${RED}${BOLD}[KAPI KAPALI]${RESET} '${stage.id}' için önce '${STAGES[i].id}' geçmeli (durum: ${ev[i].status}).`);
      return false;
    }
  const res = stage.check();
  if (!res.ok) {
    console.log(`${RED}${BOLD}[${stage.id}: GEÇERSİZ]${RESET}\n${res.msg}\n\n${RED}Düzeltene kadar sonraki aşamaya geçilemez.${RESET}\n`);
    return false;
  }
  state.stages[stage.id] = { chain: chainHashes()[idx], at: new Date().toISOString() };
  // Sonraki aşama kayıtlarını geçersiz kıl (zincir zaten stale gösterir; temizlik için sil)
  STAGES.slice(idx + 1).forEach((s) => delete state.stages[s.id]);
  saveState(state);
  console.log(`${GREEN}${BOLD}[${stage.id}: MÜHÜRLENDİ]${RESET}`);
  return true;
}

// ---------- komutlar ----------
const [, , cmd = "status", ...rest] = process.argv;

if (cmd === "init") {
  const brief = rest.join(" ").trim();
  if (!brief) { console.error('Kullanım: node scripts/studio.mjs init "<brief>"'); process.exit(1); }
  if (fs.existsSync(studioDir)) {
    const archive = path.join(rootDir, ".studio", `archive-${Date.now()}`);
    fs.renameSync(studioDir, archive);
    console.log(`${DIM}Önceki koşu arşivlendi: ${rel(archive)}${RESET}`);
  }
  fs.mkdirSync(promptsDir, { recursive: true });
  saveState({ brief, createdAt: new Date().toISOString(), stages: {} });
  console.log(`${GREEN}${BOLD}Yeni koşu başlatıldı.${RESET}`);
  printStatus(loadState());
  console.log(`Sıradaki: ${BOLD}node scripts/studio.mjs next${RESET}`);
} else if (cmd === "status") {
  printStatus(loadState());
} else if (cmd === "next") {
  const state = loadState();
  const act = activeStage(state);
  if (!act) { console.log(`${GREEN}${BOLD}Tüm aşamalar tamam. Teslimat: ${rel(VIDEO_PATH)}${RESET}`); process.exit(0); }
  const { skills, task } = act.stage.prompt(state);
  const body =
    `# AŞAMA ${STAGES.indexOf(act.stage) + 1}/${STAGES.length}: ${act.stage.id.toUpperCase()} — ${act.stage.title}\n\n` +
    `Durum: ${act.status}. Bu aşamada SADECE aşağıdaki artifact'i üret; sonraki aşamaların işini yapma.\n\n` +
    `## GÖREV\n${task}\n\n## BAĞLAM (yalnızca bu aşamaya ait skill'ler)\n${skills.filter(Boolean).join("\n\n---\n\n") || "(yok)"}\n\n` +
    `## BİTİNCE\n\`node scripts/studio.mjs check\` çalıştır. Geçersizse mesajları uygula, tekrar çalıştır.\n`;
  fs.mkdirSync(promptsDir, { recursive: true });
  const out = path.join(promptsDir, `${act.stage.id}.md`);
  fs.writeFileSync(out, body);
  console.log(body);
  console.log(`${DIM}(prompt kaydedildi: ${rel(out)})${RESET}`);
} else if (cmd === "check") {
  const state = loadState();
  const target = rest[0] ? STAGES.find((s) => s.id === rest[0]) : activeStage(state)?.stage;
  if (rest[0] && !target) { console.error(`Bilinmeyen aşama: ${rest[0]}`); process.exit(1); }
  if (!target) { console.log(`${GREEN}Tüm aşamalar tamam.${RESET}`); process.exit(0); }
  const ok = checkStage(state, target);
  printStatus(state);
  process.exit(ok ? 0 : 1);
} else if (cmd === "run") {
  const state = loadState();
  for (const stage of STAGES) {
    const cur = evaluate(state).find((e) => e.stage === stage);
    if (cur.status === "done") continue;
    if (stage.id === "render" && stage.exec) {
      if (!stage.exec()) { console.log(`${RED}${BOLD}[render: BAŞARISIZ]${RESET}`); process.exit(1); }
    }
    if (!checkStage(state, stage)) { printStatus(state); process.exit(1); }
  }
  printStatus(state);
  console.log(`${GREEN}${BOLD}TESLİMAT TAMAM:${RESET} ${rel(VIDEO_PATH)}`);
} else {
  console.error("Komutlar: init | status | next | check [aşama] | run");
  process.exit(1);
}
