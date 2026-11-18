const DB_NAME = 'relay-accounts';
const SESSION_KEY = 'relay-account-id';
const ITERATIONS = 310000;

function database() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const users = request.result.createObjectStore('users', { keyPath: 'id' });
      users.createIndex('email', 'email', { unique: true });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readUser(key, byEmail = false) {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const store = db.transaction('users').objectStore('users');
      const request = byEmail ? store.index('email').get(key) : store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}

async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS }, key, 256);
  return Array.from(new Uint8Array(bits));
}

const normalizeEmail = (email) => email.trim().toLowerCase();
const notify = () => window.dispatchEvent(new CustomEvent('relay:account'));
const publicUser = ({ id, name, email }) => ({ id, name, email });

export async function currentUser() {
  const id = sessionStorage.getItem(SESSION_KEY);
  if (!id) return null;
  const user = await readUser(id);
  if (!user) { sessionStorage.removeItem(SESSION_KEY); return null; }
  return publicUser(user);
}

export async function register({ name, email, password }) {
  name = name.trim();
  email = normalizeEmail(email);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) throw new Error('validation');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const user = { id: crypto.randomUUID(), name, email, salt: Array.from(salt), hash: await hashPassword(password, salt), favorites: [] };
  const db = await database();
  try {
    await new Promise((resolve, reject) => {
      const transaction = db.transaction('users', 'readwrite');
      const request = transaction.objectStore('users').add(user);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(request.error || transaction.error || new Error('storage'));
      transaction.onabort = () => reject(request.error || transaction.error || new Error('storage'));
    });
  } catch (error) {
    if (error?.name === 'ConstraintError') throw new Error('duplicate');
    throw error;
  } finally { db.close(); }
  sessionStorage.setItem(SESSION_KEY, user.id);
  notify();
  return publicUser(user);
}

export async function login({ email, password }) {
  const user = await readUser(normalizeEmail(email), true);
  if (!user) throw new Error('credentials');
  const hash = await hashPassword(password, new Uint8Array(user.salt));
  if (hash.length !== user.hash.length || hash.some((byte, index) => byte !== user.hash[index])) throw new Error('credentials');
  sessionStorage.setItem(SESSION_KEY, user.id);
  notify();
  return publicUser(user);
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  notify();
}

export async function getFavorites() {
  const id = sessionStorage.getItem(SESSION_KEY);
  if (!id) return [];
  const user = await readUser(id);
  return user?.favorites || [];
}

export async function toggleFavorite(id) {
  const userId = sessionStorage.getItem(SESSION_KEY);
  if (!userId) throw new Error('unauthorized');
  const db = await database();
  let selected;
  try {
    await new Promise((resolve, reject) => {
      const transaction = db.transaction('users', 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.get(userId);
      request.onsuccess = () => {
        const user = request.result;
        if (!user) { transaction.abort(); return; }
        const favorites = user.favorites || [];
        selected = !favorites.includes(id);
        user.favorites = selected ? [...favorites, id] : favorites.filter((item) => item !== id);
        store.put(user);
      };
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error('unauthorized'));
    });
  } finally { db.close(); }
  notify();
  return selected;
}
