import { useState, useEffect } from 'react';
import { staffAccounts as defaultStaff } from '../data/mockData';

const STORAGE_KEY = 'rr_staff_accounts';

function load() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultStaff;
  } catch { return defaultStaff; }
}
function save(items) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
  catch { /* ignore */ }
}

function genId() {
  return 's' + Date.now().toString(36).slice(-5) + Math.random().toString(36).slice(2, 4);
}

let listeners = [];
function notify() { listeners.forEach(fn => fn(load())); }

export function useStaffStore() {
  const [staff, setStaff] = useState(load);

  useEffect(() => {
    function onChange(next) { setStaff(next); }
    listeners.push(onChange);
    return () => { listeners = listeners.filter(l => l !== onChange); };
  }, []);

  function addStaff({ name, email, restaurantId, password }) {
    const existing = load();
    if (existing.some(s => s.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Staff with this email already exists.');
    }
    const newStaff = {
      id: genId(),
      name: name.trim(),
      email: email.trim(),
      role: 'staff',
      restaurantId,
      password,
    };
    const next = [...existing, newStaff];
    save(next);
    notify();
    return newStaff;
  }

  function updateStaff(id, patch) {
    const next = load().map(s => s.id === id ? { ...s, ...patch } : s);
    save(next);
    notify();
  }

  function removeStaff(id) {
    save(load().filter(s => s.id !== id));
    notify();
  }

  function resetStaff() {
    save(defaultStaff);
    notify();
  }

  return { staff, addStaff, updateStaff, removeStaff, resetStaff };
}

// Exposed for AuthContext to check registered staff
export function getAllStaff() {
  return load();
}
