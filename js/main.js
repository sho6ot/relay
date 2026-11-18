import { escape, icon } from './ui.js';
import { models } from './catalog.js';
import { estimateUsage, formatTokens } from './usage.js';
import { t, getLanguage, setLanguage, translatePage } from './i18n.js';
import { currentUser } from './accounts.js';

const nav = document.querySelector('.site-nav');
const preferences = document.createElement('div');
preferences.className = 'preferences';
preferences.innerHTML = `<label class="preferences__language"><span class="sr-only"></span><select aria-label="Language"><option value="ru">RU</option><option value="en">EN</option></select></label><button class="icon-button preferences__theme" type="button"></button><a class="nav-link preferences__account" href="account.html"></a>`;
nav?.insertBefore(preferences, nav.querySelector('a[href="waitlist.html"]'));
const languageSelect = preferences.querySelector('select');
const themeButton = preferences.querySelector('.preferences__theme');
const accountLink = preferences.querySelector('.preferences__account');
if (document.body.dataset.page === 'account') accountLink.setAttribute('aria-current', 'page');
let storedTheme;
try { storedTheme = localStorage.getItem('relay-theme'); } catch { storedTheme = null; }
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeButton.textContent = theme === 'dark' ? '☀' : '☾';
  const label = theme === 'dark' ? t('Switch to light theme') : t('Switch to dark theme');
  themeButton.setAttribute('aria-label', label);
  themeButton.title = label;
}
applyTheme(storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : systemTheme.matches ? 'dark' : 'light');
themeButton.addEventListener('click', () => {
  storedTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('relay-theme', storedTheme); } catch {}
  applyTheme(storedTheme);
});
systemTheme.addEventListener('change', event => { if (!storedTheme) applyTheme(event.matches ? 'dark' : 'light'); });
languageSelect.value = getLanguage();
languageSelect.addEventListener('change', () => setLanguage(languageSelect.value));
async function updateAccountLink() {
  try { const user = await currentUser(); accountLink.textContent = user?.name || t('Account'); }
  catch { accountLink.textContent = t('Account'); }
}
function updatePreferences() {
  languageSelect.value = getLanguage();
  languageSelect.setAttribute('aria-label', t('Language'));
  preferences.querySelector('.sr-only').textContent = t('Language');
  applyTheme(document.documentElement.dataset.theme);
  updateAccountLink();
}
window.addEventListener('relay:account', updateAccountLink);
window.addEventListener('relay:language', updatePreferences);
updatePreferences();
translatePage();

function decorateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach(node => {
    if (!node.querySelector('svg')) node.innerHTML = icon(node.dataset.icon, node.closest('.brand__mark') ? 28 : 20);
  });
}
decorateIcons();
document.addEventListener('relay:icons', () => decorateIcons());
document.querySelectorAll('[data-year]').forEach(node => { node.textContent = new Date().getFullYear(); });

const menu = document.querySelector('.site-nav');
const menuToggle = document.querySelector('.menu-toggle');
function closeMenu({ focus = false } = {}) {
  menu?.classList.remove('is-open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  menuToggle?.setAttribute('aria-label', t('Open menu'));
  if (focus) menuToggle?.focus();
}
menuToggle?.addEventListener('click', () => {
  const open = menu.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', t(open ? 'Close menu' : 'Open menu'));
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
  if (event.target.closest('.site-nav a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu?.classList.contains('is-open')) closeMenu({ focus: true });
});
matchMedia('(min-width: 721px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

const backToTop = document.createElement('button');
backToTop.type = 'button';
backToTop.className = 'back-to-top';
backToTop.setAttribute('aria-label', t('Back to top'));
backToTop.setAttribute('aria-hidden', 'true');
backToTop.innerHTML = icon('neural-up', 22);
backToTop.tabIndex = -1;
backToTop.inert = true;
document.body.append(backToTop);
let topVisible = false;
function updateTopControl() {
  const visible = scrollY > 420;
  if (visible === topVisible) return;
  topVisible = visible;
  backToTop.classList.toggle('is-visible', visible);
  backToTop.setAttribute('aria-hidden', String(!visible));
  backToTop.tabIndex = visible ? 0 : -1;
  backToTop.inert = !visible;
  if (!visible && document.activeElement === backToTop) document.getElementById('main')?.focus({ preventScroll: true });
}
backToTop.addEventListener('click', () => {
  document.getElementById('main')?.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
});
window.addEventListener('scroll', updateTopControl, { passive: true });
window.addEventListener('pageshow', updateTopControl);
updateTopControl();

let toastTimer;
function toast(message, error = false) {
  const region = document.getElementById('toast-region');
  if (!region) return;
  clearTimeout(toastTimer);
  region.innerHTML = `<div class="toast${error ? ' toast--error' : ''}" role="${error ? 'alert' : 'status'}">${icon(error ? 'warning' : 'check')}<span>${escape(message)}</span><button type="button" class="icon-button" aria-label="${escape(t('Close notification'))}" data-action="dismiss-toast">${icon('close', 16)}</button></div>`;
  toastTimer = setTimeout(() => region.replaceChildren(), error ? 9000 : 5000);
}

let privacyFocus;
document.addEventListener('click', async event => {
  const action = event.target.closest('[data-action]');
  if (action?.dataset.action === 'privacy') {
    const dialog = document.getElementById('privacy-dialog');
    privacyFocus = document.activeElement;
    dialog.showModal();
  }
  if (action?.dataset.action === 'close-dialog') action.closest('dialog')?.close();
  if (action?.dataset.action === 'dismiss-toast') document.getElementById('toast-region')?.replaceChildren();
  const copy = event.target.closest('[data-copy]');
  if (copy) {
    const target = document.getElementById(copy.dataset.copy);
    if (!target) return;
    try { await navigator.clipboard.writeText(target.textContent); toast(t('Request example copied.')); }
    catch {
      const range = document.createRange(); range.selectNodeContents(target);
      const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range);
      toast(t('Copying is unavailable. The text is selected for manual copying.'), true);
    }
  }
});
const privacyDialog = document.getElementById('privacy-dialog');
privacyDialog?.addEventListener('close', () => { if (privacyFocus?.isConnected) privacyFocus.focus(); });
privacyDialog?.addEventListener('click', event => {
  if (event.target !== privacyDialog) return;
  const bounds = privacyDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) privacyDialog.close();
});

const useCases = {
  chat: { label: 'ДИАЛОГИ', title: 'Помощник, который знает вашу задачу', description: 'Ответы на вопросы, объяснение возможностей продукта и работа с текстом. Начните с диалоговой модели и короткого понятного запроса.', prompt: 'Объясни новому пользователю, как создать первый проект. Ответь в трёх коротких шагах.', model: models.find(model => model.task === 'chat') },
  code: { label: 'КОД', title: 'От понятного вопроса к понятному коду', description: 'Разбор функций, объяснение ошибок и подготовка примеров. Модель помогает в работе, но результат по-прежнему требует проверки разработчиком.', prompt: 'Покажи пример debounce-функции на JavaScript и объясни, когда она полезна.', model: models.find(model => model.task === 'code') },
  reasoning: { label: 'РАССУЖДЕНИЯ', title: 'Разобрать задачу, прежде чем отвечать', description: 'Сравнение вариантов и последовательный разбор сложных вопросов. Важные выводы нужно проверять по фактам и требованиям вашего продукта.', prompt: 'Сравни очереди и синхронные HTTP-запросы для обработки изображений. Учитывай задержки и повторную обработку.', model: models.find(model => model.task === 'reasoning') }
};
function activateUseCase(key) {
  const scenario = useCases[key];
  if (!scenario || !document.getElementById('use-case-panel')) return;
  document.querySelectorAll('[data-use-case]').forEach(button => {
    const selected = button.dataset.useCase === key;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  document.getElementById('use-case-panel').setAttribute('aria-labelledby', `tab-${key}`);
  document.getElementById('use-case-label').textContent = t(scenario.label);
  document.getElementById('use-case-title').textContent = t(scenario.title);
  document.getElementById('use-case-description').textContent = t(scenario.description);
  document.getElementById('use-case-prompt').textContent = `«${t(scenario.prompt)}»`;
  document.getElementById('use-case-link').href = `models.html?task=${encodeURIComponent(key)}`;
  const request = { model: scenario.model.id, messages: [{ role: 'user', content: t(scenario.prompt) }] };
  const code = document.getElementById('request-code');
  code.innerHTML = JSON.stringify(request, null, 2).split('\n').map(line => escape(line).replace(/^(\s*)(&quot;[^&]*&quot;)(:)/, '$1<span class="code-key">$2</span>$3')).join('\n');
}
document.querySelectorAll('[data-use-case]').forEach(button => {
  button.addEventListener('click', () => activateUseCase(button.dataset.useCase));
  button.addEventListener('keydown', event => {
    const buttons = [...document.querySelectorAll('[data-use-case]')];
    let index = buttons.indexOf(button);
    if (event.key === 'ArrowRight') index = (index + 1) % buttons.length;
    else if (event.key === 'ArrowLeft') index = (index - 1 + buttons.length) % buttons.length;
    else if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = buttons.length - 1;
    else return;
    event.preventDefault();
    activateUseCase(buttons[index].dataset.useCase);
    buttons[index].focus();
  });
});
activateUseCase('chat');

const featured = document.getElementById('featured-models');
function renderFeatured() {
  if (!featured) return;
  const chosen = ['chat', 'code', 'reasoning'].map(task => models.find(model => model.task === task));
  featured.innerHTML = chosen.map(model => `<article class="model-card"><div class="model-card__top"><span class="model-mark" aria-hidden="true">${escape(model.creator.slice(0, 1))}</span><span class="badge badge--muted">${escape(t('For pilot'))}</span></div><div class="model-card__identity"><div><h3 class="model-card__name">${escape(model.name)}</h3><p class="model-card__creator">${escape(model.creator)}</p></div></div><p class="model-card__description">${escape(t(model.description))}</p><div class="model-card__specs"><span>${formatTokens(model.contextTokens)} ${escape(t('tokens of context'))}</span></div><div class="model-card__footer"><a class="text-link" href="waitlist.html?model=${encodeURIComponent(model.id)}">${escape(t('Select for application'))} ${icon('arrow-right', 17)}</a></div></article>`).join('');
}
renderFeatured();

const calculator = document.getElementById('token-calculator');
function updateCalculator(showErrors = false) {
  if (!calculator) return;
  const errorNode = document.getElementById('calculator-error');
  calculator.querySelectorAll('[aria-invalid]').forEach(node => node.removeAttribute('aria-invalid'));
  try {
    const result = estimateUsage(Object.fromEntries(new FormData(calculator)));
    for (const key of ['total', 'input', 'output']) document.getElementById(`tokens-${key}`).textContent = formatTokens(result[key]);
    document.getElementById('tokens-requests').textContent = `${formatTokens(result.requests)} ${t('requests for the period')}`;
    document.getElementById('calculator-apply').href = `waitlist.html?tokens=${encodeURIComponent(result.total)}`;
    errorNode.hidden = true;
  } catch (error) {
    for (const key of ['total', 'input', 'output']) document.getElementById(`tokens-${key}`).textContent = '–';
    document.getElementById('tokens-requests').textContent = t('Enter valid parameters to calculate.');
    document.getElementById('calculator-apply').href = 'waitlist.html';
    if (showErrors) {
      errorNode.hidden = false;
      errorNode.textContent = Object.values(error.fields || {}).map(message => t(message)).join(' ') || t(error.message);
      for (const key of Object.keys(error.fields || {})) calculator.elements.namedItem(key)?.setAttribute('aria-invalid', 'true');
      calculator.querySelector('[aria-invalid="true"]')?.focus();
    }
  }
}
calculator?.addEventListener('input', () => updateCalculator(false));
calculator?.addEventListener('submit', event => { event.preventDefault(); updateCalculator(true); });
updateCalculator();
window.addEventListener('relay:language', () => {
  menuToggle?.setAttribute('aria-label', t(menu?.classList.contains('is-open') ? 'Close menu' : 'Open menu'));
  backToTop.setAttribute('aria-label', t('Back to top'));
  activateUseCase(document.querySelector('[data-use-case][aria-selected="true"]')?.dataset.useCase || 'chat');
  renderFeatured();
  updateCalculator();
});
