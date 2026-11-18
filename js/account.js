import { currentUser, register, login, logout, getFavorites } from './accounts.js';
import { getModel, tasks } from './catalog.js';
import { t } from './i18n.js';
import { escape, icon } from './ui.js';

const content = document.querySelector('#account-content');
let mode = 'login';
let message = '';
let renderVersion = 0;

async function render() {
  const version = ++renderVersion;
  let user;
  let favorites;
  try {
    user = await currentUser();
    favorites = user ? await getFavorites() : [];
  } catch {
    if (version === renderVersion) content.innerHTML = `<div class="account-panel" role="status">${copy('Local storage is unavailable.')}</div>`;
    return;
  }
  if (version !== renderVersion) return;
  content.innerHTML = user ? renderProfile(user, favorites) : renderAuth(mode === 'register');
}

const copy = key => escape(t(key));

function renderPrivacy() {
  return `<details class="account-privacy">
    <summary>${icon('shield', 16)} ${copy('About data storage')}</summary>
    <div>
      <p>${copy('Accounts and favorites are stored only in this browser. Clearing site data removes them.')}</p>
      <p>${copy('This local account does not protect data from other people using this browser. The existing early access application is shared in this browser and is not private to an account.')}</p>
      <p>${copy('Passwords are stored as salted hashes, not copied to the application.')}</p>
    </div>
  </details>`;
}

function renderAuth(creating) {
  return `<div class="row g-4 align-items-stretch">
    <div class="col-12 col-lg-6">
      <div class="account-panel account-panel--auth">
        <p class="eyebrow">${copy('Local account')}</p>
        <h1>${copy(creating ? 'Create account' : 'Sign in')}</h1>
        <form class="account-form" novalidate>
          ${creating ? `<label class="field"><span class="field__label">${copy('Name')}</span><input name="name" autocomplete="name" required></label>` : ''}
          <label class="field"><span class="field__label">${copy('Email')}</span><input name="email" type="email" autocomplete="email" required></label>
          <label class="field"><span class="field__label">${copy('Password')}</span><input name="password" type="password" autocomplete="${creating ? 'new-password' : 'current-password'}" minlength="8" required></label>
          <p class="account-error" role="status" aria-live="polite">${message ? copy(message) : ''}</p>
          <button class="button button--primary" type="submit">${copy(creating ? 'Register' : 'Sign in')} ${icon('arrow-right', 15)}</button>
        </form>
        <p class="account-switch">${copy(creating ? 'Already have an account?' : 'New here?')} <button class="text-link" type="button" data-mode>${copy(creating ? 'Sign in' : 'Create account')}</button></p>
      </div>
    </div>
    <div class="col-12 col-lg-6">
      <aside class="account-panel account-story">
        <div class="account-story__route" aria-hidden="true">
          <span>${icon('layers', 22)}</span><i></i><span>${icon('relay', 28)}</span><i></i><span>${icon('check', 22)}</span>
        </div>
        <h2>${copy('Keep the right models close.')}</h2>
        <p>${copy('Save models from the catalog and get back to them here.')}</p>
        ${renderPrivacy()}
      </aside>
    </div>
  </div>`;
}

function renderProfile(user, favorites) {
  const items = favorites.map(getModel).filter(Boolean);
  return `<h1 class="account-title">${copy('Account')}</h1>
    <div class="row g-4 align-items-start">
      <div class="col-12 col-lg-4">
        <section class="account-panel account-profile">
          <div class="account-profile__avatar" aria-hidden="true">${escape(Array.from(user.name)[0].toUpperCase())}</div>
          <h2>${escape(user.name)}</h2>
          <p>${escape(user.email)}</p>
          <button class="button button--secondary button--small" type="button" data-logout>${copy('Sign out')}</button>
          ${renderPrivacy()}
        </section>
      </div>
      <div class="col-12 col-lg-8">
        <section class="account-panel">
          <div class="account-favorites__header">
            <h2>${copy('Your favorites')} <span class="badge badge--muted">${items.length}</span></h2>
            ${items.length ? browseLink() : ''}
          </div>
          ${items.length ? `<ul class="account-models row g-3">${items.map(model => `<li class="col-12 col-md-6"><article class="account-model">
            <span class="badge badge--muted">${copy(tasks[model.task])}</span>
            <h3>${escape(model.name)}</h3>
            <p>${escape(model.creator)}</p>
          </article></li>`).join('')}</ul>` : `<div class="account-empty">
            <span class="account-empty__icon">${icon('layers', 22)}</span>
            <h3>${copy('No favorites yet.')}</h3>
            <p>${copy('Add a model to favorites in the catalog to see it here.')}</p>
            ${browseLink()}
          </div>`}
        </section>
      </div>
    </div>`;
}

function browseLink() {
  return `<a class="button button--secondary button--small" href="models.html">${copy('Browse models')} ${icon('arrow-right', 14)}</a>`;
}

content.addEventListener('click', (event) => {
  if (event.target.closest('[data-mode]')) { mode = mode === 'login' ? 'register' : 'login'; message = ''; render(); }
  if (event.target.closest('[data-logout]')) { mode = 'login'; message = ''; logout(); }
});
content.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  const data = new FormData(form);
  const submit = form.querySelector('[type="submit"]');
  submit.disabled = true;
  try {
    if (mode === 'register') await register({ name: data.get('name'), email: data.get('email'), password: data.get('password') });
    else await login({ email: data.get('email'), password: data.get('password') });
    message = '';
  } catch (error) {
    message = ({ validation: 'Enter a name, a valid email and a password of at least 8 characters.', duplicate: 'An account with this email already exists.', credentials: 'Incorrect email or password.' })[error?.message] || 'Local storage is unavailable.';
    const status = form.querySelector('[role="status"]');
    status.textContent = t(message);
    submit.disabled = false;
  }
});
window.addEventListener('relay:account', render);
window.addEventListener('relay:language', render);
render();
