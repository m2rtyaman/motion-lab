# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "edge-tts>=7.0.0",
# ]
# ///
"""Word Timing Bridge & Converter for motion-lab.

Bridges between:
1. Legacy SRT / VTT subtitle transcripts -> space-separated 'seconds:word' (words.txt)
2. Harvest JSON word maps (words.json / manifest.json) -> 'seconds:word' (words.txt)
3. Direct EdgeTTS voice harvesting with sub-millisecond precision
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import re
import sys
from typing import Any

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass


def parse_timestamp(x: str) -> float:
    """Parse SRT (hh:mm:ss,mmm) or VTT ([hh:]mm:ss.mmm) timestamp into seconds."""
    parts = list(reversed(x.strip().replace(",", ".").split(":")))
    return sum(float(v) * (60**i) for i, v in enumerate(parts))


def parse_srt_or_vtt(content: str) -> list[tuple[float, str]]:
    """Convert SRT/VTT content to estimated word timestamps."""
    blocks = re.split(r"\n\s*\n", content.strip())
    word_timings: list[tuple[float, str]] = []

    for blk in blocks:
        lines = blk.strip().split("\n")
        arrow_idx = next((i for i, line in enumerate(lines[:2]) if "-->" in line), None)
        if arrow_idx is None:
            continue

        raw_a, raw_b = lines[arrow_idx].split("-->")
        start_sec = parse_timestamp(raw_a.split()[0])
        end_sec = parse_timestamp(raw_b.split()[0])

        clean_text = re.sub(r"<[^>]*>", "", " ".join(lines[arrow_idx + 1 :]))
        words = clean_text.split()
        if not words:
            continue

        total_chars = sum(len(w) + 1 for w in words)
        char_cursor = 0
        span = end_sec - start_sec

        for w in words:
            w_sec = start_sec + span * (char_cursor / total_chars)
            word_timings.append((round(w_sec, 2), w))
            char_cursor += len(w) + 1

    return word_timings


def parse_harvest_json(data: Any) -> list[tuple[float, str]]:
    """Extract word timestamps from words.json or manifest.json."""
    raw_words = data.get("words") if isinstance(data, dict) else data
    if not isinstance(raw_words, list):
        return []

    timings: list[tuple[float, str]] = []
    for item in raw_words:
        if not isinstance(item, dict):
            continue
        word = str(item.get("word") or item.get("token") or item.get("text") or "").strip()
        if not word:
            continue
        # Prefer startMs, fall back to startFrame @ 60 FPS or start
        if "startMs" in item:
            sec = item["startMs"] / 1000.0
        elif "startFrame" in item:
            sec = item["startFrame"] / 60.0
        elif "start" in item:
            sec = float(item["start"])
        else:
            sec = 0.0
        timings.append((round(sec, 2), word))

    return timings


def format_words_txt(timings: list[tuple[float, str]]) -> str:
    """Format into standard motion-broll space-separated 'seconds:word' string."""
    return " ".join(f"{sec:.2f}:{word}" for sec, word in timings)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Extract and bridge word timings from SRT, VTT, or harvest words.json."
    )
    parser.add_argument("file", nargs="?", help="Input file path (.srt, .vtt, or words.json)")
    parser.add_argument("--harvest", "-t", help="Raw narration text to harvest via EdgeTTS directly")
    parser.add_argument("--voice", default="en-US-BrianMultilingualNeural", help="EdgeTTS voice ID")
    parser.add_argument("--project", "-p", help="Target project slug (saves into public/harvest/<slug>)")
    parser.add_argument("--format", choices=["txt", "json"], default="txt", help="Output format (default: txt)")
    parser.add_argument("--out", "-o", help="Optional output file path")

    args = parser.parse_args()

    # Direct harvest mode
    if args.harvest:
        scripts_dir = Path(__file__).resolve().parent
        if str(scripts_dir / "harvest") not in sys.path:
            sys.path.insert(0, str(scripts_dir / "harvest"))
        from voice import harvest_voice

        workspace_root = scripts_dir.parent
        slug = args.project or "default"
        out_dir = workspace_root / "public" / "harvest" / slug
        out_dir.mkdir(parents=True, exist_ok=True)

        res = harvest_voice(
            text=args.harvest,
            output_dir=out_dir,
            voice=args.voice,
            fps=60,
        )
        timings = parse_harvest_json(res["words"])
        out_str = format_words_txt(timings) if args.format == "txt" else json.dumps(res["words"], indent=2)

        if args.out:
            Path(args.out).write_text(out_str, encoding="utf-8")
        else:
            print(out_str)
        return

    if not args.file:
        parser.print_help()
        sys.exit(1)

    in_path = Path(args.file)
    if not in_path.is_file():
        sys.stderr.write(f"Error: file not found: {args.file}\n")
        sys.exit(1)

    raw_text = in_path.read_text(encoding="utf-8-sig")

    if in_path.suffix.lower() == ".json":
        data = json.loads(raw_text)
        timings = parse_harvest_json(data)
    else:
        timings = parse_srt_or_vtt(raw_text)

    if not timings:
        sys.stderr.write(f"Warning: no word cues found in {args.file}\n")
        sys.exit(1)

    if args.format == "json":
        json_output = [
            {"index": i, "word": w, "startSeconds": s, "startFrame": round(s * 60)}
            for i, (s, w) in enumerate(timings)
        ]
        out_str = json.dumps(json_output, indent=2)
    else:
        out_str = format_words_txt(timings)

    if args.out:
        Path(args.out).write_text(out_str, encoding="utf-8")
    else:
        print(out_str)


if __name__ == "__main__":
    main()
