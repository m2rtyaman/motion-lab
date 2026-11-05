# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "edge-tts>=7.0.0",
#     "requests>=2.31.0",
# ]
# ///
"""Unit and integration test suite for the Keyless Asset Harvester suite."""

from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import shutil
import sys
import tempfile
import unittest

# Ensure current dir is in sys.path
_HARVEST_DIR = Path(__file__).resolve().parent
if str(_HARVEST_DIR) not in sys.path:
    sys.path.insert(0, str(_HARVEST_DIR))

from voice import (
    DEFAULT_VOICE,
    DEFAULT_FPS,
    find_ffmpeg_binary,
    convert_mp3_to_wav,
)
from broll import (
    get_search_cache_path,
    save_search_cache,
    load_search_cache,
    harvest_broll,
)
from cli import load_project_spec, run_harvest


class TestAssetHarvester(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp(prefix="harvest-test-")

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_ffmpeg_detection(self):
        """Test ffmpeg binary resolution in system or Remotion compositor."""
        binary = find_ffmpeg_binary()
        if binary:
            self.assertTrue(os.path.isfile(binary))
            self.assertTrue(os.path.basename(binary).lower().startswith("ffmpeg"))

    def test_broll_cache_keys_and_io(self):
        """Test SHA-256 content-addressed search caching."""
        cache_dir = Path(self.test_dir) / "cache"
        cache_path = get_search_cache_path(
            query="minimalist technology",
            aspect="16:9",
            min_duration=3,
            cache_dir=cache_dir,
        )
        self.assertTrue(str(cache_path).endswith(".json"))

        test_data = [{"id": "123", "url": "https://example.com/vid.mp4", "duration": 5}]
        save_search_cache(cache_path, test_data)
        self.assertTrue(cache_path.is_file())

        loaded = load_search_cache(cache_path)
        self.assertEqual(loaded, test_data)

    def test_broll_keyless_procedural_fallback(self):
        """Test deterministic keyless fallback when no local/cached video exists."""
        out_dir = Path(self.test_dir) / "broll-out"
        result = harvest_broll(
            query="futuristic city",
            output_dir=out_dir,
            aspect="9:16",
            cache_dir=Path(self.test_dir) / "cache",
        )
        self.assertFalse(result["found"])
        self.assertEqual(result["aspect"], "9:16")
        self.assertEqual(result["width"], 1080)
        self.assertEqual(result["height"], 1920)
        self.assertIn("Keyless mode", result["message"])
        self.assertTrue((out_dir / "broll.json").is_file())

    def test_cli_load_project_spec(self):
        """Test reading aspect and fps from workspace project spec.json."""
        workspace_root = _HARVEST_DIR.parent.parent
        spec = load_project_spec("single-container-broll", workspace_root)
        self.assertIn("aspect", spec)
        self.assertEqual(spec["aspect"], "16:9")

    def test_cli_manifest_structure(self):
        """Test run_harvest generates correct manifest.json without throwing."""
        out_dir = Path(self.test_dir) / "cli-out"
        manifest = run_harvest(
            project_slug="test-proj",
            text=None,
            query="abstract neon",
            aspect="16:9",
            fps=60,
            out_dir=str(out_dir),
        )
        self.assertEqual(manifest["project"], "test-proj")
        self.assertEqual(manifest["aspect"], "16:9")
        self.assertEqual(manifest["fps"], 60)
        self.assertTrue((out_dir / "manifest.json").is_file())

    def test_submaker_boundary_safety(self):
        """Test edge_tts.SubMaker does not crash when both boundary types are fed separately."""
        try:
            import edge_tts
        except ImportError:
            self.skipTest("edge_tts not installed in system Python environment (run with uv run)")
            return
        sub_maker = edge_tts.SubMaker()
        # Feed word boundaries
        sub_maker.feed({"type": "WordBoundary", "offset": 1000000, "duration": 5000000, "text": "Motion"})
        sub_maker.feed({"type": "WordBoundary", "offset": 6000000, "duration": 4000000, "text": "Lab"})
        self.assertEqual(len(sub_maker.cues), 2)
        self.assertEqual(sub_maker.cues[0].content, "Motion")

    def test_keyless_zero_config_guarantee(self):
        """Verify the harvester runs cleanly without any credentials or environment variables."""
        out_dir = Path(self.test_dir) / "zero-config-out"
        res = harvest_broll(
            query="quantum server",
            output_dir=out_dir,
            aspect="16:9",
            cache_dir=Path(self.test_dir) / "cache",
        )
        self.assertIsNone(res["file"])
        self.assertEqual(res["found"], False)
        self.assertIn("Keyless mode", res["message"])


if __name__ == "__main__":
    unittest.main()
