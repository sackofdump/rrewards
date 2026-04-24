import { useState, useEffect } from 'react';
import { adminCustomers } from '../data/mockData';

const STORAGE_KEY = 'rr_customer_stats';
const REGISTERED_KEY = 'rr_registered_users';

function loadOverrides() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch { return {}; }
}
function saveOverrides(overrides) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides)); }
  catch { /* ignore */ }
}
function loadRegistered() {
  try {
    const stored = localStorage.getItem(REGISTERED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}
function saveRegistered(items) {
  try { localStorage.setItem(REGISTERED_KEY, JSON.stringify(items)); }
  catch { /* ignore */ }
}

let listeners = [];
function notify() { listeners.forEach(fn => fn()); }

/* Get current (live) stats for any customer id: registered user first,
   then demo customer, with localStorage overrides applied on top. */
export function getCustomerStats(customerId) {
  const registered = loadRegistered().find(u => u.id === customerId);
  if (registered) return registered;

  const demo = adminCustomers.find(c => c.id === customerId);
  if (!demo) return null;

  const override = loadOverrides()[customerId] || {};
  return { ...demo, ...override };
}

export function useCustomerStats() {
  const [tick, setTick] = useState(0); // re-render trigger

  useEffect(() => {
    function onChange() { setTick(t => t + 1); }
    listeners.push(onChange);
    return () => { listeners = listeners.filter(l => l !== onChange); };
  }, []);

  function get(customerId) {
    return getCustomerStats(customerId);
  }

  function applyDelta(customerId, patch) {
    const registered = loadRegistered();
    const regIdx = registered.findIndex(u => u.id === customerId);
    if (regIdx !== -1) {
      const current = registered[regIdx];
      const next = { ...current };
      for (const [k, v] of Object.entries(patch)) {
        if (typeof v === 'number' && typeof current[k] === 'number') {
          next[k] = current[k] + v;
        } else {
          next[k] = v;
        }
      }
      // Tier recalc based on lifetimeSpend
      next.tier = computeTier(next.lifetimeSpend);
      registered[regIdx] = next;
      saveRegistered(registered);
      notify();
      return next;
    }

    // Demo customer — store as override
    const overrides = loadOverrides();
    const demo = adminCustomers.find(c => c.id === customerId);
    if (!demo) return null;
    const current = { ...demo, ...(overrides[customerId] || {}) };
    const next = { ...current };
    for (const [k, v] of Object.entries(patch)) {
      if (typeof v === 'number' && typeof current[k] === 'number') {
        next[k] = current[k] + v;
      } else {
        next[k] = v;
      }
    }
    next.tier = computeTier(next.lifetimeSpend);
    overrides[customerId] = next;
    saveOverrides(overrides);
    notify();
    return next;
  }

  function setStat(customerId, patch) {
    // Absolute set, not delta
    const registered = loadRegistered();
    const regIdx = registered.findIndex(u => u.id === customerId);
    if (regIdx !== -1) {
      const next = { ...registered[regIdx], ...patch };
      next.tier = computeTier(next.lifetimeSpend);
      registered[regIdx] = next;
      saveRegistered(registered);
      notify();
      return next;
    }
    const overrides = loadOverrides();
    overrides[customerId] = { ...(overrides[customerId] || {}), ...patch };
    // Recalc tier if lifetimeSpend in patch
    const demo = adminCustomers.find(c => c.id === customerId);
    if (demo) {
      const combined = { ...demo, ...overrides[customerId] };
      overrides[customerId].tier = computeTier(combined.lifetimeSpend);
    }
    saveOverrides(overrides);
    notify();
  }

  function recordOrder(customerId, { total, earned, redeemed = 0 }) {
    return applyDelta(customerId, {
      rewardsBalance: earned - redeemed,
      lifetimeSpend: total,
      lifetimeEarned: earned,
      orders: 1,
      lastVisit: new Date().toISOString().split('T')[0],
    });
  }

  function resetStats() {
    saveOverrides({});
    notify();
  }

  return { get, applyDelta, setStat, recordOrder, resetStats, _tick: tick };
}

function computeTier(lifetimeSpend = 0) {
  if (lifetimeSpend >= 1500) return 'Platinum';
  if (lifetimeSpend >= 600)  return 'Gold';
  if (lifetimeSpend >= 200)  return 'Silver';
  return 'Bronze';
}
