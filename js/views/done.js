import state from '../state.js';
import { t } from '../i18n.js';

function buildRows(endTime) {
  const rows = [];
  const timestep = endTime;

  for (let i = 0; i < state.questionOrder.length; i++) {
    const {
      baseModelName,
      promptId,
      seed,
      methodLeft,
      methodRight,
      methodOpponent,
      oursMethod,
    } = state.questionOrder[i];
    const promptResponses = state.responses[i] || {};
    const startTime = state.promptStartTimes[i] || state.startTime;

    for (const metric of state.config.metrics) {
      const raw = promptResponses[metric.id];
      let oursWon = '';
      if (raw === 0) {
        oursWon = 0;
      } else if (raw === -1) {
        oursWon = methodLeft === oursMethod ? 1 : -1;
      } else if (raw === 1) {
        oursWon = methodRight === oursMethod ? 1 : -1;
      }

      rows.push({
        timestep,
        session_id: state.sessionId,
        user: state.userName,
        start_time: startTime,
        end_time: endTime,
        model: baseModelName,
        prompt_id: promptId,
        seed,
        method_left: methodLeft,
        method_right: methodRight,
        method_opponent: methodOpponent,
        metric: metric.id,
        ours_won: oursWon,
      });
    }
  }

  return rows;
}

function downloadJson(rows) {
  const blob = new Blob([JSON.stringify({ rows }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pairwise-response-${state.sessionId}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function renderDone() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  const page = document.createElement('div');
  page.className = 'done-page';

  const card = document.createElement('div');
  card.className = 'done-card';
  card.innerHTML = `
    <h2 class="done-card__title">${t('thankYou')}</h2>
    <p class="done-card__message">${t('submitting')}</p>
    <div class="spinner"></div>
    <div class="done-card__status"></div>
  `;

  page.appendChild(card);
  app.appendChild(page);

  const endTime = new Date().toISOString();
  const rows = buildRows(endTime);
  const statusEl = card.querySelector('.done-card__status');
  const spinner = card.querySelector('.spinner');
  const message = card.querySelector('.done-card__message');

  const scriptUrl = state.config.googleAppsScriptUrl;

  if (!scriptUrl || scriptUrl === 'YOUR_APPS_SCRIPT_URL_HERE') {
    spinner.remove();
    message.textContent = t('noEndpoint');
    downloadJson(rows);
    statusEl.className = 'done-card__status done-card__status--success';
    statusEl.textContent = t('fileDownloaded');
    return;
  }

  fetch(scriptUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rows }),
  })
    .then(() => {
      spinner.remove();
      message.textContent = t('submitted');
      statusEl.className = 'done-card__status done-card__status--success';
      statusEl.textContent = t('rowsSent', { count: rows.length });
    })
    .catch(() => {
      spinner.remove();
      message.textContent = t('submissionFailed');
      statusEl.className = 'done-card__status done-card__status--error';
      statusEl.textContent = t('sendDownloaded');
      downloadJson(rows);
    });
}
