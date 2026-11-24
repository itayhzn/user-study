#!/usr/bin/env python3
"""
Build images/manifest.json and images/photos/ for the caption study.

Captions come from the DCH research repository (results/autoresearch/r2):
the main judged panel (60 COCO + 60 AMBER captions that DCH changed). A fixed random
sample of `--per_bench` captions per benchmark is drawn, and each caption is stored in
four versions: dch (ours), and the opponents cut, orig and llm.

Pairs whose two texts are identical are listed in `identical` and are never shown; the
analysis counts them as ties, so the sample stays an unbiased draw from the panel.

Run from the repo root:
  python scripts/build_study.py --r2 /path/to/LLaDA-V/results/autoresearch/r2
"""

import argparse
import json
import os
import random

from PIL import Image, ImageOps

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
OURS = 'dch'
OPPONENTS = ['cut', 'orig', 'llm']


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--r2', default=os.path.expanduser('~/Workspace/LLaDA-V/results/autoresearch/r2'))
    p.add_argument('--per_bench', type=int, default=30)
    p.add_argument('--seed', type=int, default=2026)
    p.add_argument('--max_side', type=int, default=1024)
    a = p.parse_args()

    key = json.load(open(f'{a.r2}/panel_ls_key.json'))['items']
    panel = sorted({k['id'] for k in key.values()})
    rows = {}
    for b in ('chair', 'amber'):
        for line in open(f'{a.r2}/e70_{b}_yn0/heal_shard0.jsonl'):
            r = json.loads(line)
            rows[r['id']] = r
    llm = json.load(open(f'{a.r2}/ar_repair_texts.json'))

    rng = random.Random(a.seed)
    chosen = []
    for prefix in ('coco_', 'amber_'):
        pool = [i for i in panel if i.startswith(prefix)]
        chosen += sorted(rng.sample(pool, a.per_bench))

    photos = os.path.join(ROOT, 'images', 'photos')
    os.makedirs(photos, exist_ok=True)
    items = []
    for i in chosen:
        texts = {
            'orig': rows[i]['orig'],
            'cut': rows[i]['cut_text'],
            'dch': rows[i]['cutheal'],
            'llm': llm[i]['ar'],
        }
        texts = {k: ' '.join(v.split()) for k, v in texts.items()}
        img = ImageOps.exif_transpose(Image.open(f'{a.r2}/panel_ls/img/{i}.jpg')).convert('RGB')
        img.thumbnail((a.max_side, a.max_side))
        img.save(os.path.join(photos, f'{i}.jpg'), quality=85, optimize=True)
        items.append({
            'id': i,
            'bench': 'coco' if i.startswith('coco_') else 'amber',
            'photo': f'photos/{i}.jpg',
            'texts': texts,
            'identical': [o for o in OPPONENTS if texts[o] == texts[OURS]],
        })

    manifest = {'ours': OURS, 'opponents': OPPONENTS, 'seed': a.seed, 'items': items}
    with open(os.path.join(ROOT, 'images', 'manifest.json'), 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=1, ensure_ascii=False)
    for o in OPPONENTS:
        n = sum(o in it['identical'] for it in items)
        print(f'{OURS} vs {o}: {len(items) - n} shown, {n} identical (automatic ties)')


if __name__ == '__main__':
    main()
