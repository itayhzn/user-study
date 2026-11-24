import state from '../state.js';
import { LANGUAGES, setLanguage, t } from '../i18n.js';
import { initializePairwiseSession } from '../randomization.js';

// Average number of questions per rater (identical pairs are never shown).
function estimateQuestions({ opponents, items }) {
  const shown = items.reduce((n, it) => n + opponents.length - it.identical.length, 0);
  return `~${Math.round(shown / opponents.length)}`;
}

export function renderWelcome() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  const page = document.createElement('div');
  page.className = 'welcome';

  const card = document.createElement('div');
  card.className = 'welcome__card';

  const title = t('appTitle');
  const total = state.questionOrder.length || estimateQuestions(state.manifest);
  const languageOptions = Object.entries(LANGUAGES)
    .map(([value, label]) => `
      <label class="language-toggle__option">
        <input
          type="radio"
          name="language"
          value="${value}"
          ${state.language === value ? 'checked' : ''}
        >
        <span>${label}</span>
      </label>
    `)
    .join('');

  card.innerHTML = `
    <h1 class="welcome__title">${title}</h1>
    <p class="welcome__description">
      ${t('welcomeDescription', { total })}
    </p>
    <div class="welcome__instructions">
      <strong>${t('howItWorks')}</strong>
      <ul>
        <li>${t('welcomePointImages')}</li>
        <li>${t('welcomePointSelect')}</li>
        <li>${t('welcomePointFullscreen')}</li>
      </ul>
    </div>
    <form class="welcome__form">
      <fieldset class="language-toggle">
        <legend>${t('languageLabel')}</legend>
        <div class="language-toggle__options">
          ${languageOptions}
        </div>
      </fieldset>
      <input
        type="text"
        class="welcome__input"
        placeholder="${t('namePlaceholder')}"
        autocomplete="name"
        required
      >
      <p class="welcome__error" role="alert"></p>
      <button type="submit" class="btn btn--primary">${t('continue')}</button>
    </form>
  `;

  const form = card.querySelector('form');
  const input = card.querySelector('.welcome__input');
  const error = card.querySelector('.welcome__error');
  const languageInputs = card.querySelectorAll('input[name="language"]');

  languageInputs.forEach((languageInput) => {
    languageInput.addEventListener('change', () => {
      setLanguage(languageInput.value);
      renderWelcome();
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = input.value.trim();
    if (!name) {
      input.classList.add('invalid');
      return;
    }

    error.textContent = '';

    const { seed, rotation, sessionId, questionOrder } = initializePairwiseSession(
      name,
      state.manifest
    );

    if (questionOrder.length === 0) {
      input.classList.add('invalid');
      error.textContent = t('noEligibleQuestions');
      return;
    }

    state.userName = name;
    state.startTime = null;
    state.instructionsAccepted = false;
    state.responses = {};
    state.promptStartTimes = {};
    state.currentQuestion = 0;
    state.randomizationSeed = seed;
    state.rotation = rotation;
    state.sessionId = sessionId;
    state.questionOrder = questionOrder;

    window.location.hash = '#instructions';
  });

  input.addEventListener('input', () => input.classList.remove('invalid'));

  page.appendChild(card);
  app.appendChild(page);
  input.focus();
}
