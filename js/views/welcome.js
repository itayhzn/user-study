import state from '../state.js';
import { LANGUAGES, setLanguage, t } from '../i18n.js';
import { initializePairwiseSession } from '../randomization.js';

async function loadPrompts(language) {
  const base = state.config.images_base_path;
  const languageAliases = {
    en: ['en', 'eng', ''],
    he: ['he', 'heb', ''],
  };
  const candidates = languageAliases[language] || [language];

  let res = null;
  for (const candidate of candidates) {
    const filename = candidate ? `prompts.${candidate}.txt` : 'prompts.txt';
    res = await fetch(`${base}/${filename}`, { cache: 'no-store' });
    if (res.ok) break;
  }

  if (!res || !res.ok) throw new Error(`Could not load prompts for ${language}`);
  const text = await res.text();
  return text.split(/\r?\n/);
}

export function renderWelcome() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  const page = document.createElement('div');
  page.className = 'welcome';

  const card = document.createElement('div');
  card.className = 'welcome__card';

  const title = t('appTitle');
  const total = state.questionOrder.length || state.config.questions_per_session;
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

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = input.value.trim();
    if (!name) {
      input.classList.add('invalid');
      return;
    }

    error.textContent = '';
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    let prompts;
    try {
      prompts = await loadPrompts(state.language);
    } catch (err) {
      error.textContent = t('promptsLoadError');
      submitButton.disabled = false;
      return;
    }

    const { seed, sessionId, questionOrder } = initializePairwiseSession(
      name,
      { ...state.manifest, prompts },
      state.config.questions_per_session,
      state.config.base_model_names
    );

    if (questionOrder.length === 0) {
      input.classList.add('invalid');
      error.textContent = t('noEligibleQuestions');
      submitButton.disabled = false;
      return;
    }

    state.userName = name;
    state.startTime = null;
    state.instructionsAccepted = false;
    state.responses = {};
    state.promptStartTimes = {};
    state.currentQuestion = 0;
    state.randomizationSeed = seed;
    state.sessionId = sessionId;
    state.questionOrder = questionOrder;

    window.location.hash = '#instructions';
  });

  input.addEventListener('input', () => input.classList.remove('invalid'));

  page.appendChild(card);
  app.appendChild(page);
  input.focus();
}
