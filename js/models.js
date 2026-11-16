import { models, tasks, getModel } from './catalog.js';
import { escape, icon } from './ui.js';

const form = document.querySelector('#catalog-filters');
const search = document.querySelector('#model-search');
const context = document.querySelector('#model-context');
const sort = document.querySelector('#model-sort');
const results = document.querySelector('#model-results');
const count = document.querySelector('#catalog-count');
const empty = document.querySelector('#catalog-empty');
const dialog = document.querySelector('#model-dialog');
const title = document.querySelector('#model-dialog-title');
const body = document.querySelector('#model-dialog-body');
const source = document.querySelector('#model-source');
const choose = document.querySelector('#model-choose');
const chips = [...form.querySelectorAll('[data-task]')];
const formatTokens = (value) => new Intl.NumberFormat('ru-RU').format(value);
const chooseUrl = (model) => `waitlist.html?model=${encodeURIComponent(model.id)}`;
const modelIllustrations = {
  'Qwen/Qwen2.5-7B-Instruct': '<path d="M6 7h20v14H15l-5 4v-4H6z"/><path d="M10 12h12M10 16h8"/>',
  'Qwen/Qwen2.5-Coder-7B-Instruct': '<rect x="5" y="6" width="22" height="20" rx="3"/><path d="m13 12-4 4 4 4m6-8 4 4-4 4m-2-9-2 10"/>',
  'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B': '<circle cx="16" cy="16" r="3"/><circle cx="7" cy="8" r="2"/><circle cx="25" cy="8" r="2"/><circle cx="7" cy="24" r="2"/><circle cx="25" cy="24" r="2"/><path d="m9 9 5 5m9-5-5 5m-9 9 5-5m9 5-5-5"/>',
  'Qwen/Qwen2.5-VL-7B-Instruct': '<rect x="5" y="6" width="22" height="20" rx="3"/><circle cx="21" cy="12" r="2"/><path d="m7 23 7-8 4 5 2-2 5 5"/>',
  'nomic-ai/nomic-embed-text-v1.5': '<circle cx="14" cy="14" r="7"/><path d="m19 19 7 7M10 12h8m-8 4h5"/><circle cx="24" cy="7" r="2"/>',
  'Qwen/Qwen2.5-Coder-3B-Instruct': '<path d="M7 8h18v16H7zM7 12h18m-13 4-3 2 3 2m4 0h5"/><path d="M10 10h.01M13 10h.01"/>',
};
const modelIllustration = (id) => `<svg class="model-mark__illustration" width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${modelIllustrations[id] || ''}</svg>`;
let selectedTask = 'all';
let opener;

function setTask(task) {
  selectedTask = task;
  chips.forEach((chip) => {
    const active = chip.dataset.task === task;
    chip.classList.toggle('is-active', active);
    chip.setAttribute('aria-pressed', String(active));
  });
}

function card(model) {
  return `<article class="model-card">
    <div class="model-card__top"><div class="model-card__identity"><span class="model-mark" aria-hidden="true">${modelIllustration(model.id)}</span><div><h2 class="model-card__name">${escape(model.name)}</h2><p class="model-card__creator">${escape(model.creator)}</p></div></div><span class="badge badge--muted">План пилота</span></div>
    <p class="model-card__description">${escape(model.description)}</p>
    <div class="model-card__tags">${model.tags.map((tag) => `<span class="badge badge--blue">${escape(tag)}</span>`).join('')}</div>
    <dl class="model-card__specs"><div><dt>Задача</dt><dd>${escape(tasks[model.task])}</dd></div><div><dt>Контекст автора</dt><dd>${formatTokens(model.contextTokens)} токенов</dd></div></dl>
    <div class="model-card__footer"><button class="button button--secondary button--small" type="button" data-model="${escape(model.id)}">Подробнее ${icon('arrow-right', 16)}</button><a class="text-link" href="${chooseUrl(model)}">Выбрать</a></div>
  </article>`;
}

function render() {
  const query = search.value.trim().toLocaleLowerCase('ru');
  const filtered = models.filter((model) => {
    const text = [model.name, model.creator, model.id, model.description, tasks[model.task], ...model.tags].join(' ').toLocaleLowerCase('ru');
    return text.includes(query) && (selectedTask === 'all' || model.task === selectedTask) && model.contextTokens >= Number(context.value);
  });
  if (sort.value === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));
  if (sort.value === 'context') filtered.sort((a, b) => b.contextTokens - a.contextTokens || a.name.localeCompare(b.name));
  results.innerHTML = filtered.map(card).join('');
  count.textContent = `Найдено моделей: ${filtered.length}`;
  empty.hidden = filtered.length !== 0;
}

function resetFilters() {
  form.reset();
  setTask('all');
  render();
}

form.addEventListener('submit', (event) => event.preventDefault());
form.addEventListener('reset', (event) => {
  event.preventDefault();
  search.value = '';
  context.value = '0';
  sort.value = 'catalog';
  setTask('all');
  render();
});
search.addEventListener('input', render);
context.addEventListener('change', render);
sort.addEventListener('change', render);
chips.forEach((chip) => chip.addEventListener('click', () => {
  setTask(chip.dataset.task);
  render();
}));
document.querySelector('#empty-reset').addEventListener('click', () => {
  resetFilters();
  search.focus();
});

results.addEventListener('click', (event) => {
  const button = event.target.closest('[data-model]');
  if (!button) return;
  const model = getModel(button.dataset.model);
  if (!model) return;
  opener = button;
  title.textContent = model.name;
  body.innerHTML = `<p>${escape(model.description)}</p><p><span class="badge badge--blue">План пилота</span> Подключение и параметры зависят от условий развёртывания.</p>
    <div class="model-detail__grid"><dl class="spec-list"><div><dt>Автор</dt><dd>${escape(model.creator)}</dd></div><div><dt>Задача</dt><dd>${escape(tasks[model.task])}</dd></div><div><dt>Контекст по данным автора</dt><dd>${formatTokens(model.contextTokens)} токенов</dd></div><div><dt>Лицензия</dt><dd>${escape(model.license)}</dd></div></dl></div>
    <p class="text-muted">Идентификатор: ${escape(model.id)}. Длинный контекст может требовать отдельной настройки. Подробнее об ограничениях и лицензии читайте в карточке автора.</p>`;
  source.href = model.source;
  choose.href = chooseUrl(model);
  dialog.showModal();
});
document.querySelector('#model-dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  if (opener?.isConnected) opener.focus();
});

const initialTask = new URLSearchParams(location.search).get('task');
if (initialTask && Object.hasOwn(tasks, initialTask)) setTask(initialTask);
render();
