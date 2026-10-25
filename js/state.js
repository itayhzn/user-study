const state = {
  config: null,          // config.json
  manifest: null,        // images/manifest.json
  language: 'en',
  userName: '',
  sessionId: '',
  startTime: null,       // ISO string, set when questions begin.
  instructionsAccepted: false,
  randomizationSeed: 0,
  questionOrder: [],     // [{ baseModelName, promptId, seed, prompt, methodLeft, methodRight, methodOpponent, oursMethod }]
  responses: {},         // { questionIndex: { metricId: -1|0|1 } }
  promptStartTimes: {},  // { questionIndex: ISO string }
  currentQuestion: 0,
};

export default state;
