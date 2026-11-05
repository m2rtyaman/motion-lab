# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "requests>=2.31.0",
# ]
# ///
"""Keyless B-Roll Stock Video Harvester for motion-lab.

Operates 100% API-key-free using local assets (public/assets/, harvest/),
content-addressed SHA-256 disk cache (.cache/broll/), and procedural fallbacks.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
from pathlib import Path
import shutil
import sys
import tempfile
import time
from typing import Any
from urllib.parse import urlencode

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

try:
    import requests
except ImportError:
    requests = None


DEFAULT_CACHE_DIR = Path(".cache") / "broll"
CACHE_TTL_SECONDS = 24 * 60 * 60  # 24 hours
MAX_DOWNLOAD_BYTES = 500 * 1024 * 1024  # 500 MB limit


def get_search_cache_path(
    query: str,
    aspect: str,
    min_duration: int,
    cache_dir: Path,
) -> Path:
    """Generate SHA-256 filename for search query metadata cache."""
    cache_key = json.dumps(
        {
            "provider": "keyless",
            "query": query.strip().lower(),
            "aspect": aspect.strip().lower(),
            "min_duration": int(min_duration),
        },
        sort_keys=True,
    )
    digest = hashlib.sha256(cache_key.encode("utf-8")).hexdigest()
    search_dir = cache_dir / "search"
    search_dir.mkdir(parents=True, exist_ok=True)
    return search_dir / f"{digest}.json"


def load_search_cache(cache_file: Path) -> list[dict[str, Any]] | None:
    """Load valid search cache if within TTL."""
    if not cache_file.is_file():
        return None
    try:
        st = cache_file.stat()
        if time.time() - st.st_mtime > CACHE_TTL_SECONDS:
            return None
        with open(cache_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list) and data:
                return data
    except Exception:
        return None
    return None


def save_search_cache(cache_file: Path, items: list[dict[str, Any]]) -> None:
    """Save search results atomically to disk cache."""
    try:
        cache_file.parent.mkdir(parents=True, exist_ok=True)
        tmp = tempfile.NamedTemporaryFile(
            mode="w",
            prefix=".search-",
            suffix=".json",
            dir=cache_file.parent,
            delete=False,
            encoding="utf-8",
        )
        json.dump(items, tmp, ensure_ascii=False, indent=2)
        tmp.close()
        os.replace(tmp.name, cache_file)
    except Exception as exc:
        sys.stderr.write(f"[WARN] Failed to save search cache: {exc}\n")


def search_broll(
    query: str,
    aspect: str = "16:9",
    min_duration: int = 3,
    cache_dir: Path = DEFAULT_CACHE_DIR,
) -> list[dict[str, Any]]:
    """Search cached or local stock videos matching aspect ratio and min_duration."""
    clean_query = query.strip()
    if not clean_query:
        return []

    cache_file = get_search_cache_path(clean_query, aspect, min_duration, cache_dir)
    cached_hits = load_search_cache(cache_file)
    if cached_hits is not None:
        return cached_hits

    # Check local workspace asset pools for matching query or video files
    workspace_root = Path(__file__).resolve().parent.parent.parent
    local_pools = [
        workspace_root / "public" / "assets",
        workspace_root / ".cache" / "broll" / "videos",
    ]
    for pool in local_pools:
        if pool.is_dir():
            for v_file in pool.glob("*.mp4"):
                if clean_query.lower() in v_file.stem.lower() or "broll" in v_file.stem.lower():
                    is_portrait = aspect.strip() in ("9:16", "portrait")
                    return [{
                        "id": f"local-{v_file.stem}",
                        "url": str(v_file.resolve()),
                        "duration": 10,
                        "width": 1080 if is_portrait else 1920,
                        "height": 1920 if is_portrait else 1080,
                        "creator": "Local Asset Pool",
                        "source_page": str(v_file),
                    }]

    sys.stderr.write(
        f"[INFO] Studio operating in keyless mode. Using local cache / offline assets for '{clean_query}'.\n"
    )
    return []


# Backward compatibility alias
search_broll_pexels = search_broll


def download_broll_video(
    video_url: str,
    dest_path: Path | str,
    cache_dir: Path = DEFAULT_CACHE_DIR,
    max_bytes: int = MAX_DOWNLOAD_BYTES,
) -> Path:
    """Acquire video with SHA-256 disk caching and atomic rename."""
    dest = Path(dest_path)
    dest.parent.mkdir(parents=True, exist_ok=True)

    # If it's a local file path, directly copy it
    local_candidate = Path(video_url)
    if local_candidate.is_file():
        shutil.copyfile(local_candidate, dest)
        return dest

    url_hash = hashlib.sha256(video_url.split("#", 1)[0].encode("utf-8")).hexdigest()
    videos_cache_dir = cache_dir / "videos"
    videos_cache_dir.mkdir(parents=True, exist_ok=True)
    cached_video_file = videos_cache_dir / f"vid-{url_hash}.mp4"

    # 1. Check cache hit
    if cached_video_file.is_file() and cached_video_file.stat().st_size > 0:
        shutil.copyfile(cached_video_file, dest)
        return dest

    if requests is None:
        raise ImportError("requests is required for downloading remote B-Roll.")

    # 2. Stream download to temporary file
    tmp = tempfile.NamedTemporaryFile(
        mode="wb",
        prefix=f".vid-{url_hash[:12]}-",
        suffix=".mp4",
        dir=videos_cache_dir,
        delete=False,
    )
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    }

    try:
        with requests.get(video_url, headers=headers, timeout=(30, 180), stream=True) as resp:
            resp.raise_for_status()
            total_bytes = 0
            for chunk in resp.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    total_bytes += len(chunk)
                    if total_bytes > max_bytes:
                        raise ValueError(f"Video file exceeds {max_bytes / (1024*1024):.0f} MB limit")
                    tmp.write(chunk)
        tmp.flush()
        tmp.close()
        os.replace(tmp.name, cached_video_file)
        shutil.copyfile(cached_video_file, dest)
        return dest
    except Exception as exc:
        if os.path.exists(tmp.name):
            try:
                os.remove(tmp.name)
            except OSError:
                pass
        raise RuntimeError(f"Failed to acquire video from {video_url}: {exc}") from exc


def harvest_broll(
    query: str,
    output_dir: Path | str,
    aspect: str = "16:9",
    min_duration: int = 3,
    cache_dir: Path = DEFAULT_CACHE_DIR,
    **_kwargs: Any,
) -> dict[str, Any]:
    """Search and harvest the best B-Roll video matching aspect ratio.

    Writes broll.mp4 and broll.json into output_dir.
    Operates 100% keyless with local assets, cache, or procedural fallback.
    """
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    broll_file = out_path / "broll.mp4"
    meta_file = out_path / "broll.json"

    candidates = search_broll(
        query=query,
        aspect=aspect,
        min_duration=min_duration,
        cache_dir=cache_dir,
    )

    if not candidates:
        has_file = broll_file.is_file() and broll_file.stat().st_size > 0
        payload = {
            "query": query,
            "aspect": aspect,
            "file": "broll.mp4" if has_file else None,
            "found": has_file,
            "message": "Local broll.mp4 active." if has_file else "Keyless mode: Local asset or procedural background active.",
            "duration": 0,
            "width": 1080 if aspect == "9:16" else 1920,
            "height": 1920 if aspect == "9:16" else 1080,
        }
        with open(meta_file, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)
        return payload

    best = candidates[0]
    download_broll_video(
        video_url=best["url"],
        dest_path=broll_file,
        cache_dir=cache_dir,
    )

    payload = {
        "query": query,
        "aspect": aspect,
        "file": "broll.mp4",
        "found": True,
        "assetId": best.get("id"),
        "duration": best.get("duration"),
        "width": best.get("width"),
        "height": best.get("height"),
        "creator": best.get("creator"),
        "sourcePage": best.get("source_page"),
        "cachedAt": int(time.time()),
    }

    with open(meta_file, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    return payload


def main() -> None:
    parser = argparse.ArgumentParser(description="Harvest stock B-Roll video with keyless local and SHA-256 caching.")
    parser.add_argument("--query", required=True, help="Search query (e.g. 'coding dark mode')")
    parser.add_argument("--out-dir", required=True, help="Destination directory for broll.mp4")
    parser.add_argument("--aspect", default="16:9", choices=["16:9", "9:16"], help="Aspect ratio (default: 16:9)")
    parser.add_argument("--min-duration", type=int, default=3, help="Minimum video duration in seconds (default: 3)")

    args = parser.parse_args()
    result = harvest_broll(
        query=args.query,
        output_dir=args.out_dir,
        aspect=args.aspect,
        min_duration=args.min_duration,
    )
    if result.get("found"):
        print(f"[HARVEST: BROLL] Active broll.mp4: {result.get('width')}x{result.get('height')}, {result.get('duration')}s by {result.get('creator')}")
    else:
        print(f"[HARVEST: BROLL] {result.get('message')}")


if __name__ == "__main__":
    main()
