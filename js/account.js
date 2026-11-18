import { currentUser, register, login, logout, getFavorites } from './accounts.js';
import { getModel } from './catalog.js';
import { t } from './i18n.js';
import { escape } from './ui.js';

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
    if (version === renderVersion) content.textContent = t('Local storage is unavailable.');
    return;
  }
  if (version !== renderVersion) return;
  const notice = `<p>${escape(t('Accounts and favorites are stored only in this browser. Clearing site data removes them.'))}</p><p>${escape(t('This local account does not protect data from other people using this browser. The existing early access application is shared in this browser and is not private to an account.'))}</p><p>${escape(t('Passwords are stored as salted hashes, not copied to the application.'))}</p>`;
  if (user) {
    const items = favorites.map(getModel).filter(Boolean);
    content.innerHTML = `<h1>${escape(t('Account'))}</h1><p>${escape(user.name)} · ${escape(user.email)}</p>${notice}<button class="button button--secondary" type="button" data-logout>${escape(t('Sign out'))}</button><h2>${escape(t('Your favorites'))}</h2>${items.length ? `<ul>${items.map((model) => `<li><a href="models.html">${escape(model.name)}</a></li>`).join('')}</ul>` : `<p>${escape(t('No favorites yet.'))}</p>`}<a class="text-link" href="models.html">${escape(t('Browse models'))}</a>`;
    return;
  }
  const creating = mode === 'register';
  content.innerHTML = `<h1>${escape(t('Local account'))}</h1>${notice}<h2>${escape(t(creating ? 'Create account' : 'Sign in'))}</h2><form class="account-form" novalidate>${creating ? `<label class="field"><span class="field__label">${escape(t('Name'))}</span><input name="name" autocomplete="name" required></label>` : ''}<label class="field"><span class="field__label">${escape(t('Email'))}</span><input name="email" type="email" autocomplete="email" required></label><label class="field"><span class="field__label">${escape(t('Password'))}</span><input name="password" type="password" autocomplete="${creating ? 'new-password' : 'current-password'}" minlength="8" required></label><p role="status" aria-live="polite">${escape(message ? t(message) : '')}</p><button class="button button--primary" type="submit">${escape(t(creating ? 'Register' : 'Sign in'))}</button></form><p>${escape(t(creating ? 'Already have an account?' : 'New here?'))} <button class="text-link" type="button" data-mode>${escape(t(creating ? 'Sign in' : 'Create account'))}</button></p>`;
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
