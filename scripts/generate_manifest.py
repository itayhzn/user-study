#!/usr/bin/env python3
"""
Scan images/ directory and write images/manifest.json.

Expected structure:
  images/prompts.{lang}.txt
  images/{base_model_name}/{guidance_method}/{prompt_id}.png

Prompt files are loaded by the browser based on the selected language. The
generated manifest stores the available prompt IDs for each guidance method
under each base model.

Run from the repo root:
  python scripts/generate_manifest.py
"""

import json
import os
import re
import sys

IMAGES_DIR = os.path.join(os.path.dirname(__file__), '..', 'images')
IMAGE_RE = re.compile(r'^(?P<prompt_id>\d+)\.png$', re.IGNORECASE)
ANCHOR_METHOD = 'toktimer'


def prompt_id_sort_key(item):
    prompt_id = item[0]
    return int(prompt_id), prompt_id


def main():
    images_dir = os.path.abspath(IMAGES_DIR)

    if not os.path.isdir(images_dir):
        print(f"Error: images directory not found at {images_dir}", file=sys.stderr)
        sys.exit(1)

    base_models = []

    for base_model_name in sorted(os.listdir(images_dir)):
        base_model_dir = os.path.join(images_dir, base_model_name)
        if not os.path.isdir(base_model_dir):
            continue
        if base_model_name.startswith('.'):
            continue

        guidance_methods = []
        valid_pair_count = 0
        method_prompt_ids = {}

        for guidance_method_name in sorted(os.listdir(base_model_dir)):
            guidance_method_dir = os.path.join(base_model_dir, guidance_method_name)
            if not os.path.isdir(guidance_method_dir):
                continue

            prompt_ids = set()
            skipped_names = []
            for fname in sorted(os.listdir(guidance_method_dir)):
                match = IMAGE_RE.match(fname)
                if not match:
                    if fname.lower().endswith('.png'):
                        skipped_names.append(fname)
                    continue
                prompt_id = match.group('prompt_id')
                prompt_ids.add(prompt_id)

            if skipped_names:
                print(
                    f"Warning: skipping {len(skipped_names)} PNG(s) with unexpected names in {guidance_method_dir}",
                    file=sys.stderr,
                )

            if not prompt_ids:
                print(f"Warning: skipping {guidance_method_dir} — no PNG images found")
                continue

            guidance_methods.append({
                'name': guidance_method_name,
                'prompt_ids': sorted(prompt_ids, key=lambda prompt_id: (int(prompt_id), prompt_id)),
            })
            method_prompt_ids[guidance_method_name] = prompt_ids

        if len(guidance_methods) < 2:
            print(
                f"Warning: skipping {base_model_name} — fewer than 2 guidance methods found",
                file=sys.stderr,
            )
            continue

        anchor_prompts = method_prompt_ids.get(ANCHOR_METHOD)
        if anchor_prompts:
            for method in guidance_methods:
                method_name = method['name']
                if method_name == ANCHOR_METHOD:
                    continue
                other_prompts = method_prompt_ids[method_name]
                shared_prompt_ids = anchor_prompts & other_prompts
                if shared_prompt_ids:
                    valid_pair_count += 1

        if valid_pair_count == 0:
            print(
                f"Warning: skipping {base_model_name} — {ANCHOR_METHOD} shares no prompt IDs with another method",
                file=sys.stderr,
            )
            continue

        base_models.append({
            'name': base_model_name,
            'guidance_methods': guidance_methods,
        })

    manifest = {
        'base_models': base_models,
    }
    manifest_path = os.path.join(images_dir, 'manifest.json')
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print(f"Written {len(base_models)} base model(s) to {manifest_path}")


if __name__ == '__main__':
    main()
