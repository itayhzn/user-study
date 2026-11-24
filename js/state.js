const state = {
  config: null,          // config.json
  manifest: null,        // images/manifest.json
  language: 'en',
  userName: '',
  sessionId: '',
  startTime: null,       // ISO string, set when questions begin.
  instructionsAccepted: false,
  randomizationSeed: 0,
  rotation: 0,           // which opponent this rater sees for each caption
  questionOrder: [],     // [{ captionId, bench, photo, methodLeft, methodRight, textLeft, textRight, methodOpponent, oursMethod }]
  responses: {},         // { questionIndex: { metricId: -1|0|1 } }
  promptStartTimes: {},  // { questionIndex: ISO string }
  currentQuestion: 0,
};

export default state;
