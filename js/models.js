import { models, tasks, getModel } from './catalog.js';
import { escape, icon } from './ui.js';
import { t, getLanguage } from './i18n.js';
import { currentUser, getFavorites, toggleFavorite } from './accounts.js';

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
const formatTokens = (value) => new Intl.NumberFormat(getLanguage() === 'ru' ? 'ru-RU' : 'en-US').format(value);
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
let user = null;
let favorites = [];
let selectedModel = null;
const comparison = new Set();
const compareBar = document.createElement('div');
compareBar.className = 'compare-bar';
count.parentElement.after(compareBar);
const compareDialog = document.createElement('dialog');
compareDialog.className = 'dialog compare-dialog';
compareDialog.setAttribute('aria-labelledby', 'compare-title');
document.body.append(compareDialog);
let compareOpener;

function renderComparison() {
  const selected = [...comparison].map(getModel).filter(Boolean);
  compareBar.innerHTML = `<p aria-live="polite">${escape(t('Comparison'))}: ${selected.length}/3</p><div>${selected.map(model => `<button class="button button--ghost button--small" type="button" data-remove="${escape(model.id)}" aria-label="${escape(t('Remove from comparison'))}: ${escape(model.name)}">${escape(model.name)} ×</button>`).join('')}</div><button class="button button--secondary button--small" type="button" data-compare-open ${selected.length ? '' : 'disabled'}>${escape(t('Compare models'))}</button> <button class="button button--ghost button--small" type="button" data-compare-clear ${selected.length ? '' : 'disabled'}>${escape(t('Clear comparison'))}</button>`;
  const rows = [
    [t('Creator'), model => model.creator],
    [t('Task'), model => t(tasks[model.task])],
    [t('Author context'), model => `${formatTokens(model.contextTokens)} ${t('Tokens')}`],
    [t('License'), model => model.license],
    [t('Description'), model => t(model.description)],
    [t('Tags'), model => model.tags.map(tag => t(tag)).join(', ')],
    [t('Identifier'), model => model.id],
  ];
  compareDialog.innerHTML = `<div class="dialog__header"><h2 id="compare-title">${escape(t('Compare models'))}</h2><button class="button button--ghost button--small" type="button" data-compare-close>${escape(t('Close'))}</button></div><div class="dialog__body"><p class="compare-hint" id="compare-hint">${escape(t('Scroll horizontally to view all models.'))}</p><div class="compare-scroll" tabindex="0" role="region" aria-labelledby="compare-title" aria-describedby="compare-hint"><table class="compare-table"><thead><tr><th scope="col">${escape(t('Model'))}</th>${selected.map(model => `<th scope="col">${escape(model.name)}<br><button class="text-link" type="button" data-remove="${escape(model.id)}">${escape(t('Remove from comparison'))}</button></th>`).join('')}</tr></thead><tbody>${rows.map(([label, value]) => `<tr><th scope="row">${escape(label)}</th>${selected.map(model => `<td>${escape(value(model))}</td>`).join('')}</tr>`).join('')}<tr><th scope="row">${escape(t('Source'))}</th>${selected.map(model => `<td><a href="${escape(model.source)}" target="_blank" rel="noopener noreferrer">${escape(t('Author page'))}</a></td>`).join('')}</tr></tbody></table></div></div><div class="dialog__footer"><button class="button button--ghost" type="button" data-compare-clear>${escape(t('Clear comparison'))}</button></div>`;
}

async function refreshAccount() {
  const activeFavorite = document.activeElement?.dataset.favorite;
  try { [user, favorites] = await Promise.all([currentUser(), getFavorites()]); }
  catch { user = null; favorites = []; }
  render();
  if (activeFavorite) results.querySelectorAll('[data-favorite]').forEach(button => { if (button.dataset.favorite === activeFavorite) button.focus(); });
}

function setTask(task) {
  selectedTask = task;
  chips.forEach((chip) => {
    const active = chip.dataset.task === task;
    chip.classList.toggle('is-active', active);
    chip.setAttribute('aria-pressed', String(active));
  });
}

function card(model) {
  const favorite = favorites.includes(model.id);
  const comparing = comparison.has(model.id);
  return `<article class="model-card">
    <div class="model-card__top"><div class="model-card__identity"><span class="model-mark" aria-hidden="true">${modelIllustration(model.id)}</span><div><h2 class="model-card__name">${escape(model.name)}</h2><p class="model-card__creator">${escape(model.creator)}</p></div></div><span class="badge badge--muted">${escape(t('Pilot plan'))}</span></div>
    <p class="model-card__description">${escape(t(model.description))}</p>
    <div class="model-card__tags">${model.tags.map((tag) => `<span class="badge badge--blue">${escape(t(tag))}</span>`).join('')}</div>
    <dl class="model-card__specs"><div><dt>${escape(t('Task'))}</dt><dd>${escape(t(tasks[model.task]))}</dd></div><div><dt>${escape(t('Author context'))}</dt><dd>${formatTokens(model.contextTokens)} ${escape(t('Tokens'))}</dd></div></dl>
    <div class="model-card__footer"><button class="button button--secondary button--small" type="button" data-model="${escape(model.id)}">${escape(t('Details'))} ${icon('arrow-right', 16)}</button><a class="text-link" href="${chooseUrl(model)}">${escape(t('Choose'))}</a></div>
    <div class="model-card__footer">${user ? `<button class="favorite-button button button--ghost button--small" type="button" data-favorite="${escape(model.id)}" aria-pressed="${favorite}" aria-label="${escape(t(favorite ? 'Remove from favorites' : 'Add to favorites'))}: ${escape(model.name)}">${escape(t(favorite ? 'Remove from favorites' : 'Add to favorites'))}</button>` : `<a class="favorite-button text-link" href="account.html">${escape(t('Sign in to save favorites'))}</a>`}<button class="button button--ghost button--small" type="button" data-compare="${escape(model.id)}" aria-pressed="${comparing}" ${!comparing && comparison.size >= 3 ? 'disabled' : ''}>${escape(t(comparing ? 'Remove from comparison' : 'Compare'))}</button></div>
  </article>`;
}

function render() {
  const query = search.value.trim().toLocaleLowerCase('ru');
  const filtered = models.filter((model) => {
    const text = [model.name, model.creator, model.id, model.description, t(model.description), tasks[model.task], t(tasks[model.task]), ...model.tags, ...model.tags.map(tag => t(tag))].join(' ').toLocaleLowerCase('ru');
    return text.includes(query) && (selectedTask === 'all' || model.task === selectedTask) && model.contextTokens >= Number(context.value);
  });
  if (sort.value === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));
  if (sort.value === 'context') filtered.sort((a, b) => b.contextTokens - a.contextTokens || a.name.localeCompare(b.name));
  results.innerHTML = filtered.map(card).join('');
  count.textContent = t('Models found: {count}', { count: filtered.length });
  empty.hidden = filtered.length !== 0;
  renderComparison();
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

function renderDetail(model) {
  title.textContent = model.name;
  body.innerHTML = `<p>${escape(t(model.description))}</p><p><span class="badge badge--blue">${escape(t('Pilot plan'))}</span> ${escape(t('Connection and parameters depend on deployment conditions.'))}</p>
    <div class="model-detail__grid"><dl class="spec-list"><div><dt>${escape(t('Creator'))}</dt><dd>${escape(model.creator)}</dd></div><div><dt>${escape(t('Task'))}</dt><dd>${escape(t(tasks[model.task]))}</dd></div><div><dt>${escape(t('Author context'))}</dt><dd>${formatTokens(model.contextTokens)} ${escape(t('Tokens'))}</dd></div><div><dt>${escape(t('License'))}</dt><dd>${escape(model.license)}</dd></div></dl></div>
    <p class="text-muted">${escape(t('Identifier'))}: ${escape(model.id)}. ${escape(t('A long context may require additional configuration. See the author page for limitations and license.'))}</p>`;
  source.href = model.source;
  choose.href = chooseUrl(model);
}

results.addEventListener('click', async (event) => {
  const favorite = event.target.closest('[data-favorite]');
  if (favorite) {
    favorite.disabled = true;
    try { await toggleFavorite(favorite.dataset.favorite); }
    catch { alert(t('Favorites could not be updated.')); favorite.disabled = false; }
    return;
  }
  const compare = event.target.closest('[data-compare]');
  if (compare) {
    const id = compare.dataset.compare;
    if (comparison.has(id)) comparison.delete(id);
    else if (comparison.size < 3) comparison.add(id);
    render();
    results.querySelectorAll('[data-compare]').forEach(button => { if (button.dataset.compare === id) button.focus(); });
    return;
  }
  const button = event.target.closest('[data-model]');
  if (!button) return;
  const model = getModel(button.dataset.model);
  if (!model) return;
  opener = button;
  selectedModel = model;
  renderDetail(model);
  dialog.showModal();
});
function handleComparison(event) {
  const remove = event.target.closest('[data-remove]');
  if (remove) {
    comparison.delete(remove.dataset.remove);
    render();
    if (compareDialog.open) compareDialog.querySelector('[data-compare-close]').focus();
    else compareBar.querySelector('[data-compare-open]')?.focus();
  } else if (event.target.closest('[data-compare-clear]')) {
    comparison.clear();
    if (compareDialog.open) compareDialog.close();
    render();
  } else if (event.target.closest('[data-compare-open]')) {
    compareOpener = event.target.closest('[data-compare-open]');
    compareDialog.showModal();
  } else if (event.target.closest('[data-compare-close]')) {
    compareDialog.close();
  }
}
compareBar.addEventListener('click', handleComparison);
compareDialog.addEventListener('click', (event) => {
  if (event.target === compareDialog) {
    const rect = compareDialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) compareDialog.close();
  } else handleComparison(event);
});
compareDialog.addEventListener('close', () => {
  if (compareOpener?.isConnected) compareOpener.focus();
  else compareBar.querySelector('[data-compare-open]')?.focus();
});
window.addEventListener('relay:account', refreshAccount);
window.addEventListener('relay:language', () => {
  render();
  if (dialog.open && selectedModel) renderDetail(selectedModel);
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
refreshAccount();
