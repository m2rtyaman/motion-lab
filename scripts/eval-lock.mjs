/**
 * Regenerates evals/harness.lock.json: SHA-256 of every file the tested model must not edit (scripts/, evals/tasks|solutions|judges.json, src/core,
 * src/primitives, src/remotion, specs/, docs/, RULES.md, package.json, tsconfig.json, .githooks/, and the pinned public example-* / study-* projects).
 *   pnpm eval:lock
 * FOR HARNESS MAINTAINERS ONLY. The lock must also equal the version committed at git HEAD, so a model that re-pins it after editing the harness
 * shows up as TAMPERED (score 0) unless a maintainer reviews and commits the new lock. Never run this as part of an evaluated run.
 */
import { writeLock, LOCK_FILE } from "./lib/eval-integrity.mjs";
import { rel } from "./lib/projects.mjs";
console.warn("\x1b[33m[eval:lock] WARNING: for harness maintainers only. Re-pinning the lock hides harness edits until the next git comparison;\n  a model under evaluation must never run this. Review `git diff` of the protected files, then commit the new lock.\x1b[0m");
const { count, publicProjects } = writeLock();
console.log(`wrote ${rel(LOCK_FILE)}: ${count} protected files hashed, ${publicProjects.length} public projects pinned (${publicProjects.join(", ")}). Commit it; pnpm eval:score marks any later change (or a lock that differs from git HEAD) TAMPERED.`);
