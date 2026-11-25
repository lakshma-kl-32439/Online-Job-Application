const jwt = require('jsonwebtoken');
const store = require('../data/store');
const { hashPassword, verifyPassword } = require('../utils/password');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PROFILE_FIELDS = ['name', 'phone', 'college', 'location', 'headline', 'bio', 'skills', 'links'];

const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const respondWithToken = (res, status, user) => res.status(status).json({ token: signToken(user), user: store.toPublic(user) });

function register(req, res) {
  const { name = '', email = '', password = '', role = 'user', adminCode = '' } = req.body || {};
  const cleanEmail = String(email).trim().toLowerCase();
  if (String(name).trim().length < 2) return res.status(400).json({ message: 'Enter your full name.' });
  if (!EMAIL_RE.test(cleanEmail)) return res.status(400).json({ message: 'Enter a valid email address.' });
  if (String(password).length < 6) return res.status(400).json({ message: 'Use at least 6 characters for your password.' });
  if (!['user', 'admin'].includes(role)) return res.status(400).json({ message: 'Unknown account type.' });
  if (role === 'admin' && adminCode !== (process.env.ADMIN_INVITE_CODE || 'CT-ADMIN-2026')) {
    return res.status(403).json({ message: 'That admin invite code is not valid.' });
  }
  if (store.findByEmail(cleanEmail)) {
    return res.status(409).json({ message: 'An account with this email already exists. Log in instead.' });
  }
  const user = store.create({ name: String(name).trim(), email: cleanEmail, role, passwordHash: hashPassword(String(password)) });
  return respondWithToken(res, 201, user);
}

function login(req, res) {
  const { email = '', password = '' } = req.body || {};
  const user = store.findByEmail(String(email).trim());
  // Same message for unknown email and wrong password: do not reveal which accounts exist.
  if (!user || !verifyPassword(String(password), user.passwordHash)) {
    return res.status(401).json({ message: 'Incorrect email or password.' });
  }
  return respondWithToken(res, 200, user);
}

const me = (req, res) => res.json({ user: store.toPublic(req.user) });

function updateProfile(req, res) {
  const patch = {};
  PROFILE_FIELDS.forEach((k) => { if (req.body && req.body[k] !== undefined) patch[k] = req.body[k]; });
  if (patch.name !== undefined && String(patch.name).trim().length < 2) {
    return res.status(400).json({ message: 'Enter your full name.' });
  }
  const user = store.update(req.user.id, patch);
  return res.json({ user: store.toPublic(user) });
}

function changePassword(req, res) {
  const { currentPassword = '', newPassword = '' } = req.body || {};
  if (!verifyPassword(String(currentPassword), req.user.passwordHash)) {
    return res.status(400).json({ message: 'Your current password is incorrect.' });
  }
  if (String(newPassword).length < 6) return res.status(400).json({ message: 'Use at least 6 characters for the new password.' });
  store.update(req.user.id, { passwordHash: hashPassword(String(newPassword)) });
  return res.json({ message: 'Password updated.' });
}

module.exports = { register, login, me, updateProfile, changePassword };
