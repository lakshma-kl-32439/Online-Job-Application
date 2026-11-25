const pad = (n) => String(n).padStart(2, '0');

/** Local-time YYYY-MM-DD (avoids the UTC shift of toISOString). */
export const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const todayISO = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return toISODate(d);
};

const parse = (value) => {
  if (!value) return null;
  const d = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const formatDate = (value) => {
  const d = parse(value);
  return d ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
};

export const formatShortDate = (value) => {
  const d = parse(value);
  return d ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—';
};

export const formatTime = (value) => {
  const d = parse(value);
  return d ? d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }) : '';
};

export const formatDateTime = (value) => {
  const d = parse(value);
  return d ? `${formatDate(value)}, ${formatTime(value)}` : '—';
};

export const daysFromNow = (value) => {
  const d = parse(value);
  if (!d) return null;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - start) / 86400000);
};

export const relativeDay = (value) => {
  const n = daysFromNow(value);
  if (n === null) return '';
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n === -1) return 'Yesterday';
  if (n > 1) return `In ${n} days`;
  return `${Math.abs(n)} days ago`;
};

export const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'CT';

export const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export const uid = (prefix = 'id') =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const hueFrom = (str = '') => {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) % 360;
  return h;
};

export const cx = (...parts) => parts.filter(Boolean).join(' ');

export const isEmail = (v = '') => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export const pluralize = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
