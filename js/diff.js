// Word-level difference between two texts (longest common subsequence).
// Returns, for each text, a list of { text, changed } runs; a run with empty text and
// changed=true marks a place where the other text has words that this one does not.
export function diffWords(a, b) {
  const x = a.split(/\s+/).filter(Boolean);
  const y = b.split(/\s+/).filter(Boolean);
  const n = x.length;
  const m = y.length;
  const lcs = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = x[i] === y[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const left = [];
  const right = [];
  let i = 0;
  let j = 0;
  while (i < n || j < m) {
    const same = [];
    while (i < n && j < m && x[i] === y[j]) {
      same.push(x[i]);
      i++;
      j++;
    }
    if (same.length) {
      left.push({ text: same.join(' '), changed: false });
      right.push({ text: same.join(' '), changed: false });
    }
    const onlyX = [];
    const onlyY = [];
    while ((i < n || j < m) && !(i < n && j < m && x[i] === y[j])) {
      if (j >= m || (i < n && lcs[i + 1][j] >= lcs[i][j + 1])) onlyX.push(x[i++]);
      else onlyY.push(y[j++]);
    }
    if (onlyX.length || onlyY.length) {
      left.push({ text: onlyX.join(' '), changed: true });
      right.push({ text: onlyY.join(' '), changed: true });
    }
  }
  return { left, right };
}

export function renderRuns(runs, highlight) {
  const p = document.createElement('p');
  p.className = 'study__text';
  p.lang = 'en';
  p.dir = 'ltr';
  for (const run of runs) {
    if (highlight && run.changed) {
      const mark = document.createElement('mark');
      mark.className = run.text ? 'study__diff' : 'study__diff study__diff--gap';
      mark.textContent = run.text;
      p.append(mark, ' ');
    } else if (run.text) {
      p.append(run.text, ' ');
    }
  }
  return p;
}
