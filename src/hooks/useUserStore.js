import { useState, useEffect } from 'react';

const STORAGE_KEY = 'rr_registered_users';

function load() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}
function save(users) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(users)); }
  catch { /* ignore */ }
}

// Simple demo-grade hash (do NOT use in production)
export function hashPassword(pw) {
  let h = 0;
  for (let i = 0; i < pw.length; i++) {
    h = ((h << 5) - h + pw.charCodeAt(i)) | 0;
  }
  return `h${h.toString(16)}_${pw.length}`;
}

function genReferralCode(name) {
  const first = (name.split(' ')[0] || 'user').toUpperCase().slice(0, 6);
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${first}-${rand}`;
}

function genId() {
  return 'ru' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// Module-level subscription so all hook instances stay in sync
let listeners = [];
function notify() { listeners.forEach(fn => fn(load())); }

export function useUserStore() {
  const [users, setUsers] = useState(load);

  useEffect(() => {
    function onChange(next) { setUsers(next); }
    listeners.push(onChange);
    return () => { listeners = listeners.filter(l => l !== onChange); };
  }, []);

  function register({ name, email, password, phone, birthday }) {
    const existing = load();
    const emailLower = email.toLowerCase();
    if (existing.some(u => u.email.toLowerCase() === emailLower)) {
      throw new Error('An account with that email already exists.');
    }
    const user = {
      id: genId(),
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || '',
      passwordHash: hashPassword(password),
      memberSince: new Date().toISOString().split('T')[0],
      birthday: birthday || null,
      birthdaySet: Boolean(birthday),
      referralCode: genReferralCode(name),
      referredBy: null,
      tier: 'Bronze',
      rewardsBalance: 0,
      lifetimeSpend: 0,
      lifetimeEarned: 0,
      orders: 0,
      lastVisit: null,
      status: 'active',
      role: 'customer',
    };
    const next = [...existing, user];
    save(next);
    notify();
    return user;
  }

  function findByEmail(email) {
    return load().find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  function updateUser(id, patch) {
    const next = load().map(u => u.id === id ? { ...u, ...patch } : u);
    save(next);
    notify();
  }

  function setBirthday(id, dateStr) {
    const next = load().map(u => {
      if (u.id !== id) return u;
      if (u.birthdaySet) return u; // already set — cannot change
      return { ...u, birthday: dateStr, birthdaySet: true };
    });
    save(next);
    notify();
  }

  return { users, register, findByEmail, updateUser, setBirthday, hashPassword };
}
