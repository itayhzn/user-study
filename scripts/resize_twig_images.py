#!/usr/bin/env python3
"""
Resize twig images to a square size.

Targets only:
  images/flux2/twig/*.png
  images/zimage/twig/*.png

Examples:
  python3 scripts/resize_twig_images.py
  python3 scripts/resize_twig_images.py --size 256
  python3 scripts/resize_twig_images.py --dry-run
"""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


REPO_ROOT = Path(__file__).resolve().parent.parent
TARGET_DIRS = (
    REPO_ROOT / "images" / "flux2" / "twig",
    REPO_ROOT / "images" / "zimage" / "twig",
)


def iter_images() -> list[Path]:
    paths: list[Path] = []
    for target_dir in TARGET_DIRS:
        if not target_dir.is_dir():
            print(f"Warning: missing directory {target_dir.relative_to(REPO_ROOT)}")
            continue
        paths.extend(sorted(target_dir.glob("*.png")))
    return paths


def resize_image(path: Path, target_size: tuple[int, int], dry_run: bool) -> str:
    with Image.open(path) as image:
        if image.size == target_size:
            return "skipped"

        if dry_run:
            print(f"[dry-run] resize {path.relative_to(REPO_ROOT)}: {image.size} -> {target_size}")
            return "resized"

        resized = image.resize(target_size, Image.Resampling.LANCZOS)
        resized.save(path)
        return "resized"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--size", type=int, default=512, help="Square output size in pixels.")
    parser.add_argument("--dry-run", action="store_true", help="Print planned changes without writing files.")
    args = parser.parse_args()

    if args.size <= 0:
        print("--size must be greater than 0.")
        return 1

    target_size = (args.size, args.size)

    paths = iter_images()
    if not paths:
        print("No target PNG files found.")
        return 0

    resized_count = 0
    skipped_count = 0
    for path in paths:
        result = resize_image(path, target_size, args.dry_run)
        if result == "resized":
            resized_count += 1
        else:
            skipped_count += 1

    action = "Would resize" if args.dry_run else "Resized"
    print(f"{action} {resized_count} file(s); skipped {skipped_count} already at {args.size}x{args.size}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
