import state from '../state.js';
import { metricLabel, t } from '../i18n.js';
import { diffWords, renderRuns } from '../diff.js';
import { renderProgressBar } from '../components/progress-bar.js';
import { openLightbox } from '../components/lightbox.js';

export function renderStudy(questionIdx) {
  const app = document.getElementById('app');
  app.innerHTML = '';

  state.currentQuestion = questionIdx;

  const total = state.questionOrder.length;
  const { photo, textLeft, textRight } = state.questionOrder[questionIdx];
  const metrics = state.config.metrics;
  const src = `${state.config.images_base_path}/${photo}`;

  if (!state.promptStartTimes[questionIdx]) {
    state.promptStartTimes[questionIdx] = new Date().toISOString();
  }

  if (!state.responses[questionIdx]) {
    state.responses[questionIdx] = {};
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'study';

  wrapper.appendChild(renderProgressBar(
    t('appTitle'),
    questionIdx,
    total,
    state.config.study.show_save_exit,
    () => { window.location.hash = '#done'; }
  ));

  const promptDiv = document.createElement('div');
  promptDiv.className = 'study__prompt';
  promptDiv.innerHTML = `
    <span class="study__prompt-label">${t('prompt')}</span>
    <span class="study__prompt-text">${t('hint')}</span>
  `;
  wrapper.appendChild(promptDiv);

  const content = document.createElement('div');
  content.className = 'study__content';

  const runs = diffWords(textLeft, textRight);
  const highlight = state.config.study.highlight_differences;
  content.appendChild(buildTextPanel('A', runs.left, highlight, src));

  // Center: photo + metric buttons + next
  const metricsPanel = document.createElement('div');
  metricsPanel.className = 'metrics-panel';
  metricsPanel.appendChild(buildPhoto(src));

  const allAnswered = () =>
    metrics.every(m => state.responses[questionIdx][m.id] !== undefined);

  for (const metric of metrics) {
    const currentVal = state.responses[questionIdx][metric.id] ?? null;
    metricsPanel.appendChild(
      createMetricButtons(metric, currentVal, (metricId, value) => {
        state.responses[questionIdx][metricId] = value;
        nextBtn.disabled = !allAnswered();
      })
    );
  }

  const isLast = questionIdx === total - 1;
  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn btn--primary study__next-btn';
  nextBtn.textContent = isLast ? t('finish') : t('next');
  nextBtn.disabled = !allAnswered();
  nextBtn.addEventListener('click', () => {
    window.location.hash = isLast ? '#done' : `#study/${questionIdx + 1}`;
  });
  metricsPanel.appendChild(nextBtn);

  content.appendChild(metricsPanel);
  content.appendChild(buildTextPanel('B', runs.right, highlight, src));

  wrapper.appendChild(content);
  app.appendChild(wrapper);
  content.querySelectorAll('.study__text-wrap').forEach(scrollToFirstDifference);
}

// On small screens the first difference may be below the fold of its panel.
function scrollToFirstDifference(panel) {
  const mark = panel.querySelector('.study__diff');
  if (!mark) return;
  const offset = mark.getBoundingClientRect().top - panel.getBoundingClientRect().top;
  panel.scrollTop = Math.max(0, offset - panel.clientHeight / 2);
}

function createMetricButtons(metric, initialValue, onChange) {
  const group = document.createElement('div');
  group.className = 'metric-btn-group';

  const heading = document.createElement('div');
  heading.className = 'metric-btn-group__label';
  heading.textContent = metricLabel(metric);
  const question = document.createElement('span');
  question.className = 'metric-btn-group__question';
  question.textContent = t(`${metric.id}Question`);
  heading.append(question);

  const buttons = document.createElement('div');
  buttons.className = 'metric-btn-group__buttons';

  const options = [
    { value: -1, text: t('aWins'), cls: 'metric-btn--a' },
    { value:  0, text: t('tie'),   cls: 'metric-btn--tie' },
    { value:  1, text: t('bWins'), cls: 'metric-btn--b' },
  ];

  for (const opt of options) {
    const btn = document.createElement('button');
    btn.className = `metric-btn ${opt.cls}`;
    btn.textContent = opt.text;
    if (initialValue === opt.value) btn.classList.add('metric-btn--selected');

    btn.addEventListener('click', () => {
      buttons.querySelectorAll('.metric-btn').forEach(b => b.classList.remove('metric-btn--selected'));
      btn.classList.add('metric-btn--selected');
      onChange(metric.id, opt.value);
    });

    buttons.appendChild(btn);
  }

  group.appendChild(heading);
  group.appendChild(buttons);
  return group;
}

function buildPhoto(src) {
  const imgWrap = document.createElement('div');
  imgWrap.className = 'study__image-wrap study__photo';

  const skeleton = document.createElement('div');
  skeleton.className = 'study__image-skeleton';
  imgWrap.appendChild(skeleton);

  const img = document.createElement('img');
  img.className = 'study__image';
  img.alt = t('image');

  img.addEventListener('load', () => {
    skeleton.remove();
    img.classList.add('study__image--loaded');
  });

  img.addEventListener('error', () => {
    skeleton.remove();
    imgWrap.dataset.error = t('imageNotFound');
    imgWrap.classList.add('study__image-wrap--error');
  });

  img.src = src;
  imgWrap.appendChild(img);

  imgWrap.addEventListener('click', () => {
    if (img.complete && img.naturalWidth > 0) openLightbox(src);
  });
  return imgWrap;
}

function buildTextPanel(label, runs, highlight, src) {
  const side = document.createElement('div');
  side.className = 'study__side';

  const badge = document.createElement('div');
  badge.className = 'study__image-badge';
  badge.textContent = `${t('text')} ${label}`;

  const wrap = document.createElement('div');
  wrap.className = 'study__text-wrap';
  wrap.appendChild(renderRuns(runs, highlight));
  wrap.addEventListener('click', () => {
    openLightbox(src, badge.textContent, renderRuns(runs, highlight));
  });

  side.appendChild(badge);
  side.appendChild(wrap);
  return side;
}
