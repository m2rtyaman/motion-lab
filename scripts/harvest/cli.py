# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "edge-tts>=7.0.0",
#     "requests>=2.31.0",
# ]
# ///
"""Unified Asset Harvester CLI for motion-lab.

Harvests voice narration with 60 FPS millisecond word timing maps and
optimal B-Roll stock footage into public/harvest/<slug> and src/projects/<slug>/harvest.
Operates 100% API-key-free.
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import shutil
import sys
import time
from typing import Any

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

_HARVEST_DIR = Path(__file__).resolve().parent
if str(_HARVEST_DIR) not in sys.path:
    sys.path.insert(0, str(_HARVEST_DIR))

from voice import harvest_voice, DEFAULT_VOICE, DEFAULT_FPS
from broll import harvest_broll


def load_project_spec(project_slug: str, workspace_root: Path) -> dict[str, Any]:
    """Attempt to read project spec.json to infer aspect ratio and fps."""
    spec_path = workspace_root / "src" / "projects" / project_slug / "spec.json"
    if spec_path.is_file():
        try:
            with open(spec_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}


def run_harvest(
    project_slug: str | None,
    text: str | None = None,
    voice: str = DEFAULT_VOICE,
    rate: str = "+0%",
    query: str | None = None,
    aspect: str | None = None,
    fps: int = DEFAULT_FPS,
    out_dir: str | None = None,
    **_kwargs: Any,
) -> dict[str, Any]:
    workspace_root = Path(__file__).resolve().parent.parent.parent

    # Determine project output directory
    slug = project_slug or "default"
    spec = load_project_spec(slug, workspace_root) if project_slug else {}

    # Infer aspect ratio if not explicitly passed
    resolved_aspect = aspect or spec.get("aspect") or "16:9"
    resolved_fps = fps or spec.get("fps") or DEFAULT_FPS

    # Primary public directory for Remotion staticFile()
    if out_dir:
        primary_dir = Path(out_dir)
    else:
        primary_dir = workspace_root / "public" / "harvest" / slug

    primary_dir.mkdir(parents=True, exist_ok=True)

    # Secondary directory inside src/projects/<slug>/harvest for TypeScript imports
    project_harvest_dir = None
    if project_slug and (workspace_root / "src" / "projects" / project_slug).is_dir():
        project_harvest_dir = workspace_root / "src" / "projects" / project_slug / "harvest"
        project_harvest_dir.mkdir(parents=True, exist_ok=True)

    manifest: dict[str, Any] = {
        "project": slug,
        "aspect": resolved_aspect,
        "fps": resolved_fps,
        "timestamp": int(time.time()),
        "audio": None,
        "broll": None,
        "words": [],
    }

    # 1. Harvest Voice (Keyless EdgeTTS)
    if text and text.strip():
        voice_result = harvest_voice(
            text=text.strip(),
            output_dir=primary_dir,
            voice=voice,
            rate=rate,
            fps=resolved_fps,
        )
        manifest["audio"] = {
            "file": voice_result["audioFile"],
            "wavAvailable": voice_result.get("wavAvailable", False),
            "voice": voice,
            "rate": rate,
            "durationSeconds": voice_result["durationSeconds"],
            "durationFrames": voice_result["durationFrames"],
        }
        manifest["words"] = voice_result["words"]

    # 2. Harvest B-Roll (Keyless local/cache/procedural)
    if query and query.strip():
        broll_result = harvest_broll(
            query=query.strip(),
            output_dir=primary_dir,
            aspect=resolved_aspect,
            min_duration=3,
            cache_dir=workspace_root / ".cache" / "broll",
        )
        manifest["broll"] = broll_result

    # 3. Write manifest.json
    manifest_path = primary_dir / "manifest.json"
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    # Mirror to src/projects/<slug>/harvest/ if project exists
    if project_harvest_dir and project_harvest_dir != primary_dir:
        for fname in ["manifest.json", "words.json", "broll.json"]:
            src_f = primary_dir / fname
            if src_f.is_file():
                shutil.copyfile(src_f, project_harvest_dir / fname)

    return manifest


def main() -> None:
    parser = argparse.ArgumentParser(description="Harvest assets (voice narration & B-Roll video) 100% keyless for motion-lab.")
    parser.add_argument("--project", "-p", help="Target project slug (e.g. single-container-broll)")
    parser.add_argument("--text", "-t", help="Narration script text")
    parser.add_argument("--script-file", help="Path to text file containing narration script")
    parser.add_argument("--voice", default=DEFAULT_VOICE, help=f"EdgeTTS voice ID (default: {DEFAULT_VOICE})")
    parser.add_argument("--rate", default="+0%", help="Speech rate (e.g. +5%% or -10%%)")
    parser.add_argument("--query", "-q", help="Stock B-roll search query (e.g. 'high tech server room')")
    parser.add_argument("--aspect", choices=["16:9", "9:16"], help="Aspect ratio (16:9 or 9:16)")
    parser.add_argument("--fps", type=int, default=DEFAULT_FPS, help="Target FPS (default: 60)")
    parser.add_argument("--out-dir", help="Custom output directory")

    args = parser.parse_args()

    script_text = args.text
    if not script_text and args.script_file:
        p = Path(args.script_file)
        if p.is_file():
            script_text = p.read_text(encoding="utf-8")

    if not script_text and not args.query:
        parser.print_help()
        sys.exit(1)

    res = run_harvest(
        project_slug=args.project,
        text=script_text,
        voice=args.voice,
        rate=args.rate,
        query=args.query,
        aspect=args.aspect,
        fps=args.fps,
        out_dir=args.out_dir,
    )

    print("\n====================================================")
    print("            ASSET HARVEST COMPLETE                  ")
    print("====================================================")
    print(f"Project:     {res['project']}")
    print(f"Aspect:      {res['aspect']}")
    print(f"Target FPS:  {res['fps']}")
    if res.get("audio"):
        audio = res["audio"]
        print(f"Audio File:  {audio['file']} ({audio['durationSeconds']}s / {audio['durationFrames']} frames @ {res['fps']} FPS)")
        print(f"Words Count: {len(res['words'])} words mapped")
    if res.get("broll"):
        broll = res["broll"]
        status = "FOUND" if broll.get("found") else "KEYLESS / PROCEDURAL / LOCAL"
        print(f"B-Roll:      {status} (Query: '{broll.get('query')}')")
    print("====================================================\n")


if __name__ == "__main__":
    main()
