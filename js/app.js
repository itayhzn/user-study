import state from './state.js';
import { setLanguage, t } from './i18n.js';
import { renderWelcome } from './views/welcome.js';
import { renderInstructions } from './views/instructions.js';
import { renderStudy } from './views/study.js';
import { renderDone } from './views/done.js';

function route() {
  setLanguage(state.language);
  const hash = window.location.hash || '#welcome';

  if (hash === '#welcome' || hash === '#' || hash === '') {
    renderWelcome();
  } else if (hash === '#instructions') {
    if (!state.userName || state.questionOrder.length === 0) {
      window.location.hash = '#welcome';
      return;
    }
    renderInstructions();
  } else if (hash.startsWith('#study/')) {
    if (!state.userName) {
      window.location.hash = '#welcome';
      return;
    }
    if (!state.instructionsAccepted) {
      window.location.hash = '#instructions';
      return;
    }
    const index = parseInt(hash.split('/')[1], 10);
    const total = state.questionOrder.length;
    if (isNaN(index) || index < 0 || index >= total) {
      window.location.hash = '#study/0';
      return;
    }
    renderStudy(index);
  } else if (hash === '#done') {
    if (!state.userName) {
      window.location.hash = '#welcome';
      return;
    }
    renderDone();
  } else {
    window.location.hash = '#welcome';
  }
}

async function init() {
  setLanguage(state.language);

  // Load config
  try {
    const res = await fetch('config.json', { cache: 'no-store' });
    state.config = await res.json();
  } catch (e) {
    document.getElementById('app').innerHTML = `
      <div class="welcome">
        <div class="welcome__card">
          <h1 class="welcome__title">${t('configErrorTitle')}</h1>
          <p class="welcome__description">${t('configErrorBody')} <code>config.json</code>.</p>
        </div>
      </div>
    `;
    return;
  }

  // Load manifest
  try {
    const res = await fetch(`${state.config.images_base_path}/manifest.json`, { cache: 'no-store' });
    state.manifest = await res.json();
  } catch (e) {
    document.getElementById('app').innerHTML = `
      <div class="welcome">
        <div class="welcome__card">
          <h1 class="welcome__title">${t('manifestErrorTitle')}</h1>
          <p class="welcome__description">
            ${t('manifestErrorBody')} <code>images/manifest.json</code>.
            ${t('manifestErrorHint')} <code>python scripts/build_study.py</code>
            ${t('manifestErrorSuffix')}
          </p>
        </div>
      </div>
    `;
    return;
  }

  // Portrait overlay
  const overlay = document.getElementById('portrait-overlay');
  if (overlay) {
    function updateOrientation() {
      overlay.querySelector('.portrait-overlay__text').textContent = t('rotatePrompt');
      const isPortrait = window.matchMedia('(orientation: portrait)').matches;
      overlay.classList.toggle('portrait-overlay--visible', isPortrait);
    }
    updateOrientation();
    window.addEventListener('orientationchange', updateOrientation);
    window.addEventListener('resize', updateOrientation);
  }

  window.addEventListener('hashchange', route);
  route();
}

init();
