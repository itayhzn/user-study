#!/usr/bin/env python3
"""
Analyze the caption study.

Input: CSV exports of the Google Sheet and/or the JSON files that participants downloaded.
  python scripts/analyze_study.py responses.csv caption-response-*.json

For every opponent and metric, over the pairs that were shown:
  win / tie / loss   share of judgments in which DCH won / tied / lost
  score              mean of ours_won (+1 win, 0 tie, -1 loss), with two 95% intervals:
                     captions resampled, and captions and raters resampled independently
  score_all          the same with identical pairs counted as ties (the unbiased estimate
                     over the sampled captions)
Agreement: share of equal answers and Krippendorff's alpha (nominal) on pairs judged by at
least two raters. Answers left blank (Save & Exit) are ignored; if a rater answered the same
caption and metric twice, the last answer counts.
"""

import csv
import json
import os
import sys
from collections import Counter, defaultdict
from itertools import combinations

import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
B = 5000


def load(paths):
    rows = []
    for p in paths:
        with open(p, encoding='utf-8-sig') as f:
            rows += json.load(f)['rows'] if p.endswith('.json') else list(csv.DictReader(f))
    rows.sort(key=lambda r: r['end_time'])
    out = {}
    for r in rows:
        if str(r['ours_won']).strip() == '':
            continue
        out[r['user'].strip().lower(), r['caption_id'], r['method_opponent'], r['metric']] = int(float(r['ours_won']))
    return out


def alpha_nominal(units):
    units = [u for u in units if len(u) >= 2]
    if not units:
        return None, None, 0
    coincidence = Counter()
    for u in units:
        for a, b in combinations(u, 2):
            coincidence[a, b] += 1 / (len(u) - 1)
            coincidence[b, a] += 1 / (len(u) - 1)
    n_c = Counter()
    for (a, _), v in coincidence.items():
        n_c[a] += v
    n = sum(n_c.values())
    observed = sum(v for (a, b), v in coincidence.items() if a != b) / n
    expected = sum(n_c[a] * n_c[b] for a in n_c for b in n_c if a != b) / (n * (n - 1))
    pairs = [a == b for u in units for a, b in combinations(u, 2)]
    return (1 - observed / expected) if expected else 1.0, float(np.mean(pairs)), len(units)


def interval(values):
    lo, hi = np.percentile(values, [2.5, 97.5])
    return f'[{lo:+.2f}, {hi:+.2f}]'


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    data = load(sys.argv[1:])
    manifest = json.load(open(os.path.join(ROOT, 'images', 'manifest.json'), encoding='utf-8'))
    known = {it['id'] for it in manifest['items']}
    assert all(k[1] in known for k in data), 'responses contain captions that are not in the manifest'
    raters = sorted({k[0] for k in data})
    metrics = sorted({k[3] for k in data}, key=['fluency', 'accuracy', 'details'].index)
    print(f'{len(raters)} raters, {len(data)} answers')
    rng = np.random.default_rng(0)

    for opp in manifest['opponents']:
        n_same = sum(opp in it['identical'] for it in manifest['items'])
        n_all = len(manifest['items'])
        print(f'\nDCH vs {opp}  ({n_all - n_same} of {n_all} captions differ)')
        for metric in metrics:
            J = [(u, c, v) for (u, c, o, m), v in data.items() if o == opp and m == metric]
            if not J:
                continue
            v = np.array([x[2] for x in J])
            caps = sorted({x[1] for x in J})
            cap_i = np.array([caps.index(x[1]) for x in J])
            rat_i = np.array([raters.index(x[0]) for x in J])
            one, two = [], []
            for _ in range(B):
                wc = np.bincount(rng.integers(len(caps), size=len(caps)), minlength=len(caps))[cap_i]
                one.append((wc * v).sum() / max(wc.sum(), 1))
                w = wc * np.bincount(rng.integers(len(raters), size=len(raters)), minlength=len(raters))[rat_i]
                if w.sum():
                    two.append((w * v).sum() / w.sum())
            by_unit = defaultdict(list)
            for _, c, x in J:
                by_unit[c].append(x)
            al, agree, n_multi = alpha_nominal(list(by_unit.values()))
            differ = (n_all - n_same) / n_all
            rel = f'agreement {agree:.0%}, alpha {al:+.2f} on {n_multi} pairs' if n_multi else 'no pair with two raters'
            print(f'  {metric:9s} n={len(v):4d}  win {np.mean(v == 1):4.0%}  tie {np.mean(v == 0):4.0%}  '
                  f'loss {np.mean(v == -1):4.0%}  score {v.mean():+.2f} {interval(one)} '
                  f'(captions x raters {interval(two)})  score_all {v.mean() * differ:+.2f}  | {rel}')


if __name__ == '__main__':
    main()
