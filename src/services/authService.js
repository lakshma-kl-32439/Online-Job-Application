import { ADMIN_INVITE_CODE, API_URL, ROLES } from '../utils/constants';
import { hashPassword, randomSalt } from '../utils/password';
import { isEmail, uid } from '../utils/format';
import { KEYS, clearAll, load, remove, save } from './storage';
import { buildSeed } from './seed';

export const isApiMode = Boolean(API_URL);

const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

export const toPublicUser = (u) => {
  if (!u) return null;
  // eslint-disable-next-line no-unused-vars
  const { passwordHash, salt, ...rest } = u;
  return rest;
};

const fail = (message) => {
  throw new Error(message);
};

/* ------------------------------------------------------------------ */
/* Seeding                                                             */
/* ------------------------------------------------------------------ */
export async function ensureSeeded() {
  const needsUsers = !Array.isArray(load(KEYS.users));
  const needsJobs = !Array.isArray(load(KEYS.jobs));
  const needsApps = !Array.isArray(load(KEYS.applications));
  if (!needsUsers && !needsJobs && !needsApps) return;
  const seed = await buildSeed();
  if (needsUsers) save(KEYS.users, isApiMode ? [] : seed.users);
  if (needsJobs) save(KEYS.jobs, seed.jobs);
  if (needsApps) save(KEYS.applications, isApiMode ? [] : seed.applications);
}

export async function resetDemoData() {
  clearAll();
  await ensureSeeded();
}

/* ------------------------------------------------------------------ */
/* Local directory helpers (users for the Admin module)                */
/* ------------------------------------------------------------------ */
const readUsers = () => load(KEYS.users, []);
const writeUsers = (users) => save(KEYS.users, users);

export const listUsers = () => readUsers().map(toPublicUser);

export function setUserRole(userId, role) {
  const users = readUsers();
  if (!users.some((u) => u.id === userId)) fail('User not found.');
  writeUsers(users.map((u) => (u.id === userId ? { ...u, role } : u)));
}

export function deleteUser(userId) {
  writeUsers(readUsers().filter((u) => u.id !== userId));
}

/** API mode: keep a password-less copy so the Admin module can list people who signed in on this browser. */
function upsertDirectory(user) {
  const users = readUsers();
  const i = users.findIndex((u) => u.id === user.id || u.email === user.email);
  const entry = { ...(i >= 0 ? users[i] : {}), ...user };
  if (i >= 0) users[i] = entry;
  else users.push(entry);
  writeUsers(users);
}

/* ------------------------------------------------------------------ */
/* HTTP (optional Express + JWT backend)                               */
/* ------------------------------------------------------------------ */
async function request(path, { method = 'GET', body, token } = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Check that the backend is running.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'Request failed.');
    err.status = res.status;
    throw err;
  }
  return data;
}

/* ------------------------------------------------------------------ */
/* Session                                                             */
/* ------------------------------------------------------------------ */
const startSession = (payload) => save(KEYS.session, { ...payload, expiresAt: Date.now() + SESSION_MS });

export async function restoreSession() {
  const session = load(KEYS.session);
  if (!session || !session.expiresAt || session.expiresAt < Date.now()) {
    remove(KEYS.session);
    return { user: null, token: null };
  }
  if (isApiMode) {
    if (!session.token) return { user: null, token: null };
    try {
      const { user } = await request('/api/auth/me', { token: session.token });
      upsertDirectory(user);
      return { user, token: session.token };
    } catch (err) {
      if (err.status === 401 || err.status === 403) remove(KEYS.session);
      return { user: null, token: null };
    }
  }
  const user = readUsers().find((u) => u.id === session.userId);
  if (!user) {
    remove(KEYS.session);
    return { user: null, token: null };
  }
  return { user: toPublicUser(user), token: null };
}

export function logout() {
  remove(KEYS.session);
}

/* ------------------------------------------------------------------ */
/* Login & sign up                                                     */
/* ------------------------------------------------------------------ */
export async function login(email, password) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!isEmail(cleanEmail)) fail('Enter a valid email address.');
  if (!password) fail('Enter your password.');

  if (isApiMode) {
    const { token, user } = await request('/api/auth/login', { method: 'POST', body: { email: cleanEmail, password } });
    startSession({ token });
    upsertDirectory(user);
    return { user, token };
  }

  const found = readUsers().find((u) => u.email.toLowerCase() === cleanEmail);
  const hash = found ? await hashPassword(password, found.salt) : null;
  if (!found || hash !== found.passwordHash) fail('Incorrect email or password.');
  startSession({ userId: found.id });
  return { user: toPublicUser(found), token: null };
}

export async function signup({ name, email, password, role = ROLES.USER, adminCode = '' }) {
  const cleanName = String(name || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (cleanName.length < 2) fail('Enter your full name.');
  if (!isEmail(cleanEmail)) fail('Enter a valid email address.');
  if (String(password || '').length < 6) fail('Use at least 6 characters for your password.');
  if (role === ROLES.ADMIN && adminCode.trim() !== ADMIN_INVITE_CODE) fail('That admin invite code is not valid.');

  if (isApiMode) {
    const { token, user } = await request('/api/auth/register', {
      method: 'POST',
      body: { name: cleanName, email: cleanEmail, password, role, adminCode: adminCode.trim() },
    });
    startSession({ token });
    upsertDirectory(user);
    return { user, token };
  }

  const users = readUsers();
  if (users.some((u) => u.email.toLowerCase() === cleanEmail)) fail('An account with this email already exists. Log in instead.');
  const salt = randomSalt();
  const user = {
    id: uid('u'), name: cleanName, email: cleanEmail, role, salt,
    passwordHash: await hashPassword(password, salt),
    phone: '', college: '', location: '', headline: '', bio: '', skills: [], links: { linkedin: '', github: '', portfolio: '' },
    createdAt: new Date().toISOString(),
  };
  writeUsers([...users, user]);
  startSession({ userId: user.id });
  return { user: toPublicUser(user), token: null };
}

/* ------------------------------------------------------------------ */
/* Profile                                                             */
/* ------------------------------------------------------------------ */
export async function updateProfile(userId, patch, token) {
  const clean = { ...patch };
  delete clean.id; delete clean.email; delete clean.role; delete clean.passwordHash; delete clean.salt;
  if (clean.name !== undefined && String(clean.name).trim().length < 2) fail('Enter your full name.');

  if (isApiMode) {
    const { user } = await request('/api/auth/profile', { method: 'PUT', token, body: clean });
    upsertDirectory(user);
    return user;
  }
  const users = readUsers();
  const i = users.findIndex((u) => u.id === userId);
  if (i < 0) fail('Account not found.');
  users[i] = { ...users[i], ...clean };
  writeUsers(users);
  return toPublicUser(users[i]);
}

export async function changePassword(userId, currentPassword, nextPassword, token) {
  if (String(nextPassword || '').length < 6) fail('Use at least 6 characters for the new password.');
  if (isApiMode) {
    await request('/api/auth/password', { method: 'PUT', token, body: { currentPassword, newPassword: nextPassword } });
    return;
  }
  const users = readUsers();
  const i = users.findIndex((u) => u.id === userId);
  if (i < 0) fail('Account not found.');
  const ok = (await hashPassword(currentPassword, users[i].salt)) === users[i].passwordHash;
  if (!ok) fail('Your current password is incorrect.');
  const salt = randomSalt();
  users[i] = { ...users[i], salt, passwordHash: await hashPassword(nextPassword, salt) };
  writeUsers(users);
}
