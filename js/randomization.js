// Mulberry32 seeded PRNG
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Hash a string to a 32-bit integer
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return hash >>> 0;
}

// Generate a session ID from the PRNG (avoids crypto.randomUUID() HTTP incompatibility)
function generateSessionId(rng) {
  const ts = Date.now().toString(36);
  const r1 = Math.floor(rng() * 0xffffff).toString(16).padStart(6, '0');
  const r2 = Math.floor(rng() * 0xffffff).toString(16).padStart(6, '0');
  return `${ts}-${r1}-${r2}`;
}

function shuffle(list, rng) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

// Rotation of this rater: ?r=K in the link (K = 1, 2, 3, ...) if given, else from the name.
export function rotationFor(userName, numOpponents) {
  const fromLink = Number.parseInt(new URLSearchParams(window.location.search).get('r'), 10);
  if (Number.isInteger(fromLink) && fromLink >= 1) return (fromLink - 1) % numOpponents;
  return hashString(userName.toLowerCase().trim()) % numOpponents;
}

/**
 * Latin-square session: every caption appears once per rater, against one opponent, and
 * raters of consecutive rotations see the same caption against different opponents.
 * Three rotations cover every (caption, opponent) pair once. Pairs whose texts are
 * identical are skipped (the analysis counts them as ties). Question order and A/B sides
 * are random per rater.
 */
export function initializePairwiseSession(userName, manifest) {
  const seed = hashString(userName.toLowerCase().trim());
  const rng = mulberry32(seed);
  const { ours, opponents, items } = manifest;
  const rotation = rotationFor(userName, opponents.length);

  const questionOrder = [];
  items.forEach((item, index) => {
    const opponent = opponents[(index + rotation) % opponents.length];
    if (item.identical.includes(opponent)) return;
    const swap = rng() < 0.5;
    questionOrder.push({
      captionId: item.id,
      bench: item.bench,
      photo: item.photo,
      methodLeft: swap ? opponent : ours,
      methodRight: swap ? ours : opponent,
      textLeft: item.texts[swap ? opponent : ours],
      textRight: item.texts[swap ? ours : opponent],
      methodOpponent: opponent,
      oursMethod: ours,
    });
  });
  shuffle(questionOrder, rng);

  return { seed, rotation, sessionId: generateSessionId(rng), questionOrder };
}
