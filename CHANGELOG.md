# Changelog

All notable changes to Motion Lab are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Because Motion Lab is still pre-1.0, minor releases may contain breaking changes.
See [Versioning](#versioning) for the compatibility policy.

---

## [0.8.0] — 2026-11-05 — Pre-release

The first tagged release of Motion Lab. It consolidates the deterministic
motion engine, the 23-template library, the 20 studio skills, and the
multi-layer quality gate into a single, reproducible baseline.

> **Pre-release notice:** `0.8.0` is not a final, stable release. The motion
> contract schemas, CLI flags, primitive APIs, and rendered output may change
> before `1.0.0`. Pin an exact commit if you depend on byte-identical renders.

### Added

- `CHANGELOG.md` with release history.
- `NOTICE` documenting the project copyright, the third-party components, and
  the license boundary between original and upstream code.
- `src/templates/LICENSES/Apache-2.0.txt` so Apache-2.0 template notices travel
  with the redistributed files.
- Version metadata in `package.json` (`0.8.0`) and an explicit `engines.node`
  requirement.

### Changed

- **Branding:** every `Opus` reference is now `Motion Lab`; version suffixes such
  as `5.5` were removed from names, documentation, and banners.
- **Identifiers:** `OPUS_LIBRARY_ECOSYSTEM` → `MOTION_LAB_LIBRARY_ECOSYSTEM`,
  `opusStageGrain` → `motionLabStageGrain`, `opus-paper-fibers` →
  `motionlab-paper-fibers`.
- **Paths:** `references/OPUS_5.5_STYLE_GUIDE.md` →
  `references/MOTION_LAB_STYLE_GUIDE.md`; the `opus-aoe2` example set →
  `motionlab-aoe2`, including `01-motionlab-drop.html`.
- **Version labels:** engine, linter, and craft-gate banners now report `v0.8`
  instead of `v4.0`/`v5.0`/`v5.5`/`v6.2`.
- **License:** relicensed from MIT to **GPL-3.0-only**. Releases before `0.8.0`
  remain available under MIT.
- **README:** rewritten for precision — no marketing claims, no fabricated
  metrics, no decorative emoji; every capability maps to a command or a file.

### Removed

- Dead meta-slogan lint rules that referenced the previous brand name. They were
  replaced with equivalent, brand-agnostic guards for debug watermarks
  (`MOTION LAB // 60 FPS`) and versioned suite slogans.

### Fixed

- Awkward artifacts left by the rename (`an Motion Lab`, `Motion Lab Max`,
  `Motion Lab 5.5`) and the style-guide title.

---

## Versioning

Motion Lab follows Semantic Versioning:

| Range | Meaning |
| --- | --- |
| `0.8.x` | Pre-release patch: fixes only; render output is expected to be stable within the line. |
| `0.x.0` | Pre-release minor: may include breaking changes to schemas, APIs, or CLI flags. |
| `1.0.0` | First stable release; the motion contract and public APIs are frozen for the major line. |

Git tags use the `v` prefix (`v0.8.0`). GitHub Releases for `0.x` versions are
published as **pre-releases** until `1.0.0`.

---

[0.8.0]: https://github.com/m2rtyaman/motion-lab/releases/tag/v0.8.0
