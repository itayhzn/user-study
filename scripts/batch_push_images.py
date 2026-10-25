#!/usr/bin/env python3
"""
Commit and push repo changes in small batches.

Behavior:
- Handles added, modified, deleted, and untracked files across the repo.
- Stages each batch with `git add -A -- <paths>` so deletions are included.
- Each batch is pushed to the selected remote/branch before continuing.
- Waits between pushes to avoid spamming the remote.

Examples:
  python3 scripts/batch_push_images.py
  python3 scripts/batch_push_images.py --batch-size 50
  python3 scripts/batch_push_images.py --remote origin --branch main
  python3 scripts/batch_push_images.py --push-delay-seconds 10
  python3 scripts/batch_push_images.py --dry-run
"""

from __future__ import annotations

import argparse
import subprocess
import sys
import time
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
IGNORED_SUFFIXES = (
    ".pyc",
    ".zip",
    ".tar",
    ".tgz",
    ".gz",
    ".bz2",
    ".xz",
    ".7z",
    ".rar",
)
IGNORED_PARTS = {"__pycache__"}


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


def get_changed_paths() -> list[str]:
    tracked = git_output(["diff", "--name-only", "HEAD"]).splitlines()
    untracked = git_output(["ls-files", "--others", "--exclude-standard"]).splitlines()
    seen = set()
    ordered = []
    for path in tracked + untracked:
        if path and path not in seen:
            seen.add(path)
            ordered.append(path)
    return ordered


def get_staged_paths() -> list[str]:
    return [path for path in git_output(["diff", "--cached", "--name-only"]).splitlines() if path]


def filter_paths(paths: list[str]) -> list[str]:
    filtered = []
    for path in paths:
        path_obj = Path(path)
        if path_obj.suffix in IGNORED_SUFFIXES or any(part in IGNORED_PARTS for part in path_obj.parts):
            continue
        filtered.append(path)
    return filtered


def chunked(items: list[str], size: int) -> list[list[str]]:
    return [items[i:i + size] for i in range(0, len(items), size)]


def stage_paths(paths: list[str]) -> None:
    if paths:
        run_git(["add", "-A", "--", *paths], capture_output=False)


def commit(paths: list[str], message: str, dry_run: bool) -> None:
    if not paths:
        return

    if dry_run:
        print(f"[dry-run] git add -A -- {' '.join(paths)}")
        print(f"[dry-run] git commit -m {message!r}")
        return

    stage_paths(paths)
    run_git(["commit", "-m", message], capture_output=False)


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
    parser.add_argument("--batch-size", type=int, default=50, help="Number of image-tree paths per commit.")
    parser.add_argument("--remote", default="origin", help="Git remote to push to.")
    parser.add_argument("--branch", help="Branch to push. Defaults to the current branch.")
    parser.add_argument(
        "--commit-prefix",
        default="Batch push",
        help="Prefix used in generated commit messages.",
    )
    parser.add_argument(
        "--push-delay-seconds",
        type=float,
        default=8.0,
        help="Seconds to wait between pushes. Use 0 to disable throttling.",
    )
    parser.add_argument("--dry-run", action="store_true", help="Print planned git commands without running them.")
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

    changed_paths = filter_paths(get_changed_paths())
    if not changed_paths:
        print("No changed or untracked files to commit.")
        return 0

    batches = chunked(sorted(changed_paths), args.batch_size)

    for batch_number, batch in enumerate(batches, start=1):
        print(f"Committing batch {batch_number}/{len(batches)} ({len(batch)} path(s))")
        commit(
            batch,
            f"{args.commit_prefix}: batch {batch_number}/{len(batches)}",
            args.dry_run,
        )
        push(args.remote, branch, args.dry_run)
        if batch_number < len(batches):
            maybe_sleep(args.push_delay_seconds, args.dry_run)

    print("All batches processed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
