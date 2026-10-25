const OUR_METHOD = 'toktimer';

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

export function initializePairwiseSession(userName, manifest, questionsPerSession, baseModelNames = null) {
  const seed = hashString(userName.toLowerCase().trim());
  const rng = mulberry32(seed);
  const prompts = Array.isArray(manifest.prompts) ? manifest.prompts : [];
  const allowedBaseModels = new Set(
    Array.isArray(baseModelNames) ? baseModelNames.map((name) => String(name)) : []
  );
  const eligibleBaseModels = buildEligibleBaseModels(
    manifest.base_models || [],
    allowedBaseModels
  );
  const questionCount = Math.max(0, Number(questionsPerSession) || 0);
  const questionOrder = [];

  for (let i = 0; i < questionCount; i++) {
    if (eligibleBaseModels.length === 0) break;

    const baseModel = eligibleBaseModels[Math.floor(rng() * eligibleBaseModels.length)];
    const pair = baseModel.validPairs[Math.floor(rng() * baseModel.validPairs.length)];
    const promptId = pair.promptIds[Math.floor(rng() * pair.promptIds.length)];
    const prompt = prompts[Number.parseInt(promptId, 10)] ?? '';
    const swap = rng() < 0.5;

    questionOrder.push({
      baseModelName: baseModel.name,
      promptId,
      seed: '',
      prompt,
      methodLeft: swap ? pair.opponent : pair.ours,
      methodRight: swap ? pair.ours : pair.opponent,
      methodOpponent: pair.opponent,
      oursMethod: pair.ours,
    });
  }

  const sessionId = generateSessionId(rng);

  return { seed, sessionId, questionOrder };
}

function buildEligibleBaseModels(baseModels, allowedBaseModels) {
  return baseModels
    .filter((baseModel) =>
      allowedBaseModels.size === 0 || allowedBaseModels.has(baseModel.name)
    )
    .map((baseModel) => {
      const methods = Array.isArray(baseModel.guidance_methods)
        ? baseModel.guidance_methods
        : [];

      const promptIdsByMethod = new Map(
        methods.map((method) => [
          method.name,
          normalizePromptIds(method),
        ])
      );

      const oursPromptIds = promptIdsByMethod.get(OUR_METHOD);
      if (!oursPromptIds || oursPromptIds.size === 0) return null;

      const validPairs = [];
      for (const method of methods) {
        const opponent = method.name;
        if (opponent === OUR_METHOD) continue;

        const opponentPromptIds = promptIdsByMethod.get(opponent);
        const promptIds = getSharedPromptIds(oursPromptIds, opponentPromptIds);

        if (promptIds.length > 0) {
          validPairs.push({
            ours: OUR_METHOD,
            opponent,
            promptIds,
          });
        }
      }

      if (validPairs.length === 0) return null;
      return {
        name: baseModel.name,
        validPairs,
      };
    })
    .filter(Boolean);
}

function getSharedPromptIds(leftPromptIds, rightPromptIds) {
  if (!leftPromptIds || !rightPromptIds) return [];
  return [...leftPromptIds]
    .filter((promptId) => rightPromptIds.has(promptId))
    .sort(comparePromptIds);
}

function normalizePromptIds(method) {
  if (Array.isArray(method.prompt_ids)) {
    return new Set(method.prompt_ids.map((promptId) => String(promptId)));
  }

  const normalized = new Set();
  const promptSeeds = method.prompt_seeds;
  if (!promptSeeds || typeof promptSeeds !== 'object') return normalized;

  for (const [promptId, seeds] of Object.entries(promptSeeds)) {
    if (!Array.isArray(seeds)) continue;
    if (seeds.length > 0) normalized.add(String(promptId));
  }
  return normalized;
}

function comparePromptIds(a, b) {
  return Number.parseInt(a, 10) - Number.parseInt(b, 10) || a.localeCompare(b);
}
