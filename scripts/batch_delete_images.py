#!/usr/bin/env python3
"""
Delete image files and push the deletions in small batches.

Behavior:
- Finds image files under images/ by suffix.
- Deletes each batch from disk, stages those paths with `git add -A -- <paths>`,
  commits the tracked deletions, and pushes before continuing.
- Also deletes matching untracked image files, though those do not create commits.
- Waits between pushes to avoid spamming the remote.

Examples:
  python3 scripts/batch_delete_images.py
  python3 scripts/batch_delete_images.py --batch-size 50
  python3 scripts/batch_delete_images.py --remote origin --branch main
  python3 scripts/batch_delete_images.py --push-delay-seconds 10
  python3 scripts/batch_delete_images.py --dry-run
"""

from __future__ import annotations

import argparse
import subprocess
import sys
import time
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_IMAGES_DIR = REPO_ROOT / "images"
DEFAULT_IMAGE_SUFFIXES = (".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".tif", ".tiff", ".avif")


def run_git(args: list[str], capture_output: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["git", *args],
        cwd=REPO_ROOT,
        text=True,
        check=True,
        capture_output=capture_output,
    )


def git_output(args: list[str]) -> str:
    return run_git(args).stdout


def get_current_branch() -> str:
    return git_output(["branch", "--show-current"]).strip()


def get_staged_paths() -> list[str]:
    return [path for path in git_output(["diff", "--cached", "--name-only"]).splitlines() if path]


def get_deleted_staged_paths() -> list[str]:
    return [
        path
        for path in git_output(["diff", "--cached", "--name-only", "--diff-filter=D"]).splitlines()
        if path
    ]


def to_repo_path(path: Path) -> str:
    return path.resolve().relative_to(REPO_ROOT).as_posix()


def normalize_suffixes(suffixes: list[str]) -> set[str]:
    normalized = set()
    for suffix in suffixes:
        suffix = suffix.lower()
        normalized.add(suffix if suffix.startswith(".") else f".{suffix}")
    return normalized


def resolve_images_dir(images_dir: Path) -> Path:
    if not images_dir.is_absolute():
        images_dir = REPO_ROOT / images_dir
    return images_dir.resolve()


def is_image_path(path: str, suffixes: set[str]) -> bool:
    return Path(path).suffix.lower() in suffixes


def get_existing_image_paths(images_dir: Path, suffixes: set[str]) -> list[str]:
    if not images_dir.is_dir():
        print(f"Images directory does not exist: {images_dir}", file=sys.stderr)
        raise SystemExit(1)

    try:
        images_dir.resolve().relative_to(REPO_ROOT)
    except ValueError as exc:
        print(f"Images directory must be inside the repo: {images_dir}", file=sys.stderr)
        raise SystemExit(1) from exc

    existing_paths = []
    for path in images_dir.rglob("*"):
        if path.is_file() and path.suffix.lower() in suffixes:
            existing_paths.append(to_repo_path(path))
    return sorted(existing_paths)


def get_tracked_paths(images_dir: Path) -> set[str]:
    images_dir_path = to_repo_path(images_dir)
    return set(git_output(["ls-files", "--", images_dir_path]).splitlines())


def get_deletion_paths(images_dir: Path, suffixes: set[str]) -> list[str]:
    existing_paths = set(get_existing_image_paths(images_dir, suffixes))
    tracked_image_paths = {
        path
        for path in get_tracked_paths(images_dir)
        if is_image_path(path, suffixes)
    }
    return sorted(existing_paths | tracked_image_paths)


def chunked(items: list[str], size: int) -> list[list[str]]:
    return [items[i:i + size] for i in range(0, len(items), size)]


def delete_paths(paths: list[str], dry_run: bool) -> None:
    for path in paths:
        full_path = REPO_ROOT / path
        if dry_run:
            print(f"[dry-run] delete {path}")
            continue
        if full_path.exists():
            full_path.unlink()


def stage_paths(paths: list[str], dry_run: bool) -> None:
    if not paths:
        return
    if dry_run:
        print(f"[dry-run] git add -A -- {' '.join(paths)}")
        return
    run_git(["add", "-A", "--", *paths], capture_output=False)


def commit(message: str, dry_run: bool) -> bool:
    if dry_run:
        print(f"[dry-run] git commit -m {message!r}")
        return True

    deleted_paths = get_deleted_staged_paths()
    if not deleted_paths:
        return False

    run_git(["commit", "-m", message], capture_output=False)
    return True


def push(remote: str, branch: str, dry_run: bool) -> None:
    if dry_run:
        print(f"[dry-run] git push {remote} {branch}")
        return

    run_git(["push", remote, branch], capture_output=False)


def maybe_sleep(seconds: float, dry_run: bool) -> None:
    if seconds <= 0:
        return
    if dry_run:
        print(f"[dry-run] sleep {seconds:g}")
        return
    print(f"Waiting {seconds:g}s before the next push...")
    time.sleep(seconds)


def ensure_repo() -> None:
    try:
        run_git(["rev-parse", "--is-inside-work-tree"])
    except subprocess.CalledProcessError as exc:
        print(exc.stderr or exc.stdout or "Not inside a git repository.", file=sys.stderr)
        raise SystemExit(1) from exc


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--batch-size", type=int, default=100, help="Number of image paths per deletion commit.")
    parser.add_argument("--remote", default="origin", help="Git remote to push to.")
    parser.add_argument("--branch", help="Branch to push. Defaults to the current branch.")
    parser.add_argument(
        "--commit-prefix",
        default="Delete images",
        help="Prefix used in generated commit messages.",
    )
    parser.add_argument(
        "--images-dir",
        type=Path,
        default=DEFAULT_IMAGES_DIR,
        help="Directory to scan for images. Defaults to images/.",
    )
    parser.add_argument(
        "--image-suffix",
        action="append",
        dest="image_suffixes",
        help=(
            "Image suffix to delete. May be passed more than once. "
            "Defaults to common raster image suffixes."
        ),
    )
    parser.add_argument(
        "--push-delay-seconds",
        type=float,
        default=8.0,
        help="Seconds to wait between pushes. Use 0 to disable throttling.",
    )
    parser.add_argument("--dry-run", action="store_true", help="Print planned deletes and git commands only.")
    args = parser.parse_args()

    if args.batch_size <= 0:
        print("--batch-size must be greater than 0.", file=sys.stderr)
        return 1
    if args.push_delay_seconds < 0:
        print("--push-delay-seconds must be 0 or greater.", file=sys.stderr)
        return 1

    ensure_repo()
    staged_paths = get_staged_paths()
    if staged_paths:
        print(
            "This script expects an empty index before it starts.\n"
            "Please commit, unstage, or stash the already staged paths first:\n"
            + "\n".join(f"  {path}" for path in staged_paths),
            file=sys.stderr,
        )
        return 1

    branch = args.branch or get_current_branch()
    if not branch:
        print("Could not determine the current branch. Pass --branch explicitly.", file=sys.stderr)
        return 1

    suffixes = normalize_suffixes(args.image_suffixes or list(DEFAULT_IMAGE_SUFFIXES))
    images_dir = resolve_images_dir(args.images_dir)
    image_paths = get_deletion_paths(images_dir, suffixes)
    tracked_paths = get_tracked_paths(images_dir)
    if not image_paths:
        print("No image files found to delete.")
        return 0

    batches = chunked(image_paths, args.batch_size)
    committed_batch_count = 0

    for batch_number, batch in enumerate(batches, start=1):
        print(f"Deleting batch {batch_number}/{len(batches)} ({len(batch)} image path(s))")
        delete_paths(batch, args.dry_run)
        stage_paths([path for path in batch if path in tracked_paths], args.dry_run)
        did_commit = commit(
            f"{args.commit_prefix}: batch {batch_number}/{len(batches)}",
            args.dry_run,
        )
        if did_commit:
            committed_batch_count += 1
            push(args.remote, branch, args.dry_run)
            if batch_number < len(batches):
                maybe_sleep(args.push_delay_seconds, args.dry_run)
        else:
            print("No tracked deletions in this batch; skipping commit and push.")

    print(f"All batches processed. {len(image_paths)} image file(s) deleted, {committed_batch_count} commit(s) made.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
