import state from '../state.js';
import { metricLabel, t } from '../i18n.js';

export function renderInstructions() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  const page = document.createElement('div');
  page.className = 'welcome';

  const card = document.createElement('div');
  card.className = 'welcome__card instructions-card';

  card.innerHTML = `
    <h1 class="welcome__title">${t('beforeBegin')}</h1>
    <p class="welcome__description">
      ${t('instructionsIntro')}
    </p>
    <div class="welcome__instructions instructions-card__body">
      <ol>
        ${state.config.metrics
          .map((m) => `<li><strong>${metricLabel(m)}:</strong> ${t(`${m.id}Instruction`)}</li>`)
          .join('')}
      </ol>
    </div>
    <div class="instructions-card__example">
      <strong>${t('exampleLabel')}</strong>
      ${t('instructionsExample')}
    </div>
    <p class="instructions-card__consent">${t('instructionsTie')}</p>
    <p class="instructions-card__consent">${t('consent')}</p>
    <button type="button" class="btn btn--primary instructions-card__button">
      ${t('startQuestions')}
    </button>
  `;

  const button = card.querySelector('button');
  button.addEventListener('click', () => {
    state.instructionsAccepted = true;
    state.startTime = new Date().toISOString();
    window.location.hash = '#study/0';
  });

  page.appendChild(card);
  app.appendChild(page);
  button.focus();
}
