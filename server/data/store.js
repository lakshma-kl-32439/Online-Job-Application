const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { hashPassword } = require('../utils/password');

// A tiny JSON-file "database" so the project runs with zero setup.
// Swap this module for MongoDB / PostgreSQL in a production deployment.
const FILE = process.env.DB_FILE || path.join(__dirname, 'db.json');

const blankProfile = () => ({
  phone: '', college: '', location: '', headline: '', bio: '', skills: [],
  links: { linkedin: '', github: '', portfolio: '' },
});

function seed() {
  const now = new Date().toISOString();
  return {
    users: [
      { id: 'u_admin', name: 'Meera Nair', email: 'admin@careertrail.com', role: 'admin', passwordHash: hashPassword('Admin@123'), createdAt: now, ...blankProfile(), headline: 'Placement Officer' },
      { id: 'u_student', name: 'Alex Student', email: 'student@careertrail.com', role: 'user', passwordHash: hashPassword('Student@123'), createdAt: now, ...blankProfile(), headline: 'Frontend developer' },
    ],
  };
}

let cache = null;

function load() {
  if (cache) return cache;
  try {
    cache = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch {
    cache = seed();
    persist();
  }
  return cache;
}

function persist() {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(cache, null, 2));
}

const toPublic = (u) => {
  if (!u) return null;
  const { passwordHash, ...rest } = u;
  return rest;
};

module.exports = {
  toPublic,
  all: () => load().users,
  findById: (id) => load().users.find((u) => u.id === id),
  findByEmail: (email) => load().users.find((u) => u.email.toLowerCase() === String(email).toLowerCase()),
  create(data) {
    const user = { id: `u_${crypto.randomBytes(6).toString('hex')}`, createdAt: new Date().toISOString(), ...blankProfile(), ...data };
    load().users.push(user);
    persist();
    return user;
  },
  update(id, patch) {
    const db = load();
    const i = db.users.findIndex((u) => u.id === id);
    if (i < 0) return null;
    db.users[i] = { ...db.users[i], ...patch };
    persist();
    return db.users[i];
  },
};
