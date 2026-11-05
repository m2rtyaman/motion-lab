# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "edge-tts>=7.0.0",
# ]
# ///
"""Voice Harvester for motion-lab.

Synthesizes speech using EdgeTTS with fine-grained WordBoundary events,
and generates frame-accurate 60 FPS millisecond word timing maps (words.json).
Converts to uncompressed broadcast-grade audio.wav when ffmpeg is detected.
"""

from __future__ import annotations

import argparse
import asyncio
import inspect
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
from typing import Any
import wave

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

try:
    import edge_tts
except ImportError:
    edge_tts = None


DEFAULT_VOICE = "en-US-ChristopherNeural"
DEFAULT_FPS = 60


def find_ffmpeg_binary() -> str | None:
    """Find system ffmpeg or Remotion compositor bundled ffmpeg."""
    system_ffmpeg = shutil.which("ffmpeg")
    if system_ffmpeg:
        return system_ffmpeg

    # Check known workspace Remotion binary locations
    current_dir = Path(__file__).resolve().parent
    workspace_root = current_dir.parent.parent

    candidates = [
        workspace_root / "node_modules" / "@remotion" / "compositor-win32-x64-msvc" / "ffmpeg.exe",
        workspace_root / "node_modules" / "@remotion" / "compositor-linux-x64-gnu" / "ffmpeg",
        workspace_root / "node_modules" / "@remotion" / "compositor-darwin-x64" / "ffmpeg",
        workspace_root / "node_modules" / "@remotion" / "compositor-darwin-arm64" / "ffmpeg",
    ]
    for candidate in candidates:
        if candidate.is_file():
            return str(candidate)

    return None


def convert_mp3_to_wav(mp3_path: Path | str, wav_path: Path | str, ffmpeg_bin: str | None = None) -> bool:
    """Convert MP3 to 48kHz 16-bit PCM WAV using ffmpeg."""
    ffmpeg = ffmpeg_bin or find_ffmpeg_binary()
    if not ffmpeg:
        return False

    cmd = [
        ffmpeg,
        "-y",
        "-v", "error",
        "-i", str(mp3_path),
        "-acodec", "pcm_s16le",
        "-ar", "48000",
        "-ac", "2",
        str(wav_path),
    ]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return res.returncode == 0 and os.path.exists(wav_path) and os.path.getsize(wav_path) > 0
    except Exception as exc:
        sys.stderr.write(f"[WARN] ffmpeg conversion failed: {exc}\n")
        return False


async def _synthesize_edge_tts_async(
    text: str,
    voice: str = DEFAULT_VOICE,
    rate: str = "+0%",
    volume: str = "+0%",
    pitch: str = "+0Hz",
) -> tuple[bytes, list[dict[str, Any]]]:
    """Stream speech audio bytes and WordBoundary cues from EdgeTTS."""
    if edge_tts is None:
        raise ImportError("edge-tts is required for voice harvesting. Run with 'uv run ...' or install edge-tts.")

    kwargs: dict[str, Any] = {
        "rate": rate,
        "volume": volume,
        "pitch": pitch,
    }
    sig = inspect.signature(edge_tts.Communicate)
    if "boundary" in sig.parameters:
        kwargs["boundary"] = "WordBoundary"

    communicate = edge_tts.Communicate(text, voice, **kwargs)
    sub_maker = edge_tts.SubMaker()
    audio_chunks: list[bytes] = []
    word_chunks: list[dict[str, Any]] = []
    sentence_chunks: list[dict[str, Any]] = []

    async for chunk in communicate.stream():
        chunk_type = chunk.get("type")
        if chunk_type == "audio":
            audio_chunks.append(chunk["data"])
        elif chunk_type == "WordBoundary":
            word_chunks.append(chunk)
        elif chunk_type == "SentenceBoundary":
            sentence_chunks.append(chunk)

    # SubMaker raises ValueError if given mixed chunk types. Prioritize WordBoundary.
    target_chunks = word_chunks if word_chunks else sentence_chunks
    for c in target_chunks:
        try:
            sub_maker.feed(c)
        except Exception as exc:
            sys.stderr.write(f"[DEBUG] SubMaker.feed ignored chunk error: {exc}\n")

    audio_bytes = b"".join(audio_chunks)
    cues_data: list[dict[str, Any]] = []

    for cue in sub_maker.cues:
        raw_text = cue.content.strip()
        if not raw_text:
            continue
        start_sec = cue.start.total_seconds()
        end_sec = cue.end.total_seconds()
        cues_data.append({
            "text": raw_text,
            "start": start_sec,
            "end": end_sec,
        })

    return audio_bytes, cues_data


def harvest_voice(
    text: str,
    output_dir: Path | str,
    voice: str = DEFAULT_VOICE,
    rate: str = "+0%",
    fps: int = DEFAULT_FPS,
) -> dict[str, Any]:
    """Generate audio.wav, audio.mp3, and words.json with 60 FPS frame accuracy.

    Returns the manifest dictionary containing audio and timing data.
    """
    clean_text = text.strip()
    if not clean_text:
        raise ValueError("Script text cannot be empty.")

    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    mp3_file = out_path / "audio.mp3"
    wav_file = out_path / "audio.wav"
    words_file = out_path / "words.json"

    # 1. Synthesize audio via EdgeTTS
    audio_bytes, raw_cues = asyncio.run(_synthesize_edge_tts_async(
        text=clean_text,
        voice=voice,
        rate=rate,
    ))

    if not audio_bytes:
        raise RuntimeError("EdgeTTS returned empty audio.")

    # Write MP3 atomically
    temp_mp3 = tempfile.NamedTemporaryFile(
        mode="wb",
        prefix=".edge-tts-",
        suffix=".mp3",
        dir=out_path,
        delete=False,
    )
    try:
        temp_mp3.write(audio_bytes)
        temp_mp3.flush()
        temp_mp3.close()
        os.replace(temp_mp3.name, mp3_file)
    finally:
        if os.path.exists(temp_mp3.name):
            try:
                os.remove(temp_mp3.name)
            except OSError:
                pass

    # 2. Convert to broadcast WAV if ffmpeg is available
    wav_created = convert_mp3_to_wav(mp3_file, wav_file)
    primary_audio_file = "audio.wav" if wav_created else "audio.mp3"

    # 3. Calculate frame-accurate timing map
    words_map: list[dict[str, Any]] = []
    max_end_sec = 0.0

    for idx, cue in enumerate(raw_cues):
        word_text = cue["text"]
        start_sec = max(0.0, float(cue["start"]))
        end_sec = max(start_sec, float(cue["end"]))
        max_end_sec = max(max_end_sec, end_sec)

        start_ms = int(round(start_sec * 1000))
        end_ms = int(round(end_sec * 1000))
        duration_ms = max(0, end_ms - start_ms)

        start_frame = int(round(start_sec * fps))
        end_frame = int(round(end_sec * fps))
        duration_frames = max(1, end_frame - start_frame)

        # Clean punctuation for semantic comparison while preserving raw display text
        clean_token = re.sub(r"^[^\w]+|[^\w]+$", "", word_text)

        words_map.append({
            "index": idx,
            "word": word_text,
            "token": clean_token or word_text,
            "startTime": round(start_sec, 4),
            "endTime": round(end_sec, 4),
            "startMs": start_ms,
            "endMs": end_ms,
            "durationMs": duration_ms,
            "startFrame": start_frame,
            "endFrame": end_frame,
            "durationFrames": duration_frames,
        })

    # Fallback if no cues were emitted by server (heuristic split across audio duration)
    if not words_map:
        estimated_duration = 3.0
        if wav_file.is_file() and os.path.getsize(wav_file) > 0:
            try:
                with wave.open(str(wav_file), "rb") as wf:
                    frames_count = wf.getnframes()
                    rate_val = wf.getframerate()
                    if rate_val > 0:
                        estimated_duration = max(0.5, round(frames_count / float(rate_val), 3))
            except Exception:
                pass

        tokens = clean_text.split()
        word_step = estimated_duration / max(1, len(tokens))
        for idx, token in enumerate(tokens):
            start_sec = idx * word_step
            end_sec = (idx + 1) * word_step
            words_map.append({
                "index": idx,
                "word": token,
                "token": re.sub(r"^[^\w]+|[^\w]+$", "", token) or token,
                "startTime": round(start_sec, 4),
                "endTime": round(end_sec, 4),
                "startMs": int(round(start_sec * 1000)),
                "endMs": int(round(end_sec * 1000)),
                "durationMs": int(round(word_step * 1000)),
                "startFrame": int(round(start_sec * fps)),
                "endFrame": int(round(end_sec * fps)),
                "durationFrames": max(1, int(round(word_step * fps))),
            })
        max_end_sec = estimated_duration

    total_duration_sec = round(max_end_sec, 3)
    total_duration_frames = int(round(total_duration_sec * fps))

    payload = {
        "text": clean_text,
        "voice": voice,
        "rate": rate,
        "fps": fps,
        "audioFile": primary_audio_file,
        "wavAvailable": wav_created,
        "durationSeconds": total_duration_sec,
        "durationFrames": total_duration_frames,
        "words": words_map,
    }

    # Write words.json
    with open(words_file, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    return payload


def main() -> None:
    parser = argparse.ArgumentParser(description="Harvest EdgeTTS speech with 60 FPS millisecond word timings.")
    parser.add_argument("--text", required=True, help="Speech text or script")
    parser.add_argument("--out-dir", required=True, help="Output directory path")
    parser.add_argument("--voice", default=DEFAULT_VOICE, help=f"EdgeTTS voice ID (default: {DEFAULT_VOICE})")
    parser.add_argument("--rate", default="+0%", help="Voice speed percentage, e.g. +10%% or -5%%")
    parser.add_argument("--fps", type=int, default=DEFAULT_FPS, help="Target video frames per second (default: 60)")

    args = parser.parse_args()
    result = harvest_voice(
        text=args.text,
        output_dir=args.out_dir,
        voice=args.voice,
        rate=args.rate,
        fps=args.fps,
    )
    print(f"[HARVEST: VOICE] Done. {len(result['words'])} words, duration: {result['durationSeconds']}s ({result['durationFrames']} frames @ {args.fps} FPS)")
    print(f"[HARVEST: VOICE] Audio file: {result['audioFile']}, Words map: words.json")


if __name__ == "__main__":
    main()
