import { useState, useEffect } from 'react';
import { adminCustomers } from '../data/mockData';
import { isLive, keyFor } from '../utils/sessionMode';
import { supabase } from '../lib/supabase';

const STATS_BASE = 'rr_customer_stats';
const REGISTERED_KEY = 'rr_registered_users';

function loadOverrides() {
  try {
    const stored = localStorage.getItem(keyFor(STATS_BASE));
    return stored ? JSON.parse(stored) : {};
  } catch { return {}; }
}
function saveOverrides(overrides) {
  try { localStorage.setItem(keyFor(STATS_BASE), JSON.stringify(overrides)); }
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

function demoCustomers() {
  return isLive() ? [] : adminCustomers;
}

// Synchronous lookup — demo customers, legacy registered, overrides.
// Supabase-backed customers are hydrated by caller.
export function getCustomerStats(customerId) {
  const registered = loadRegistered().find(u => u.id === customerId);
  if (registered) return registered;

  const demo = demoCustomers().find(c => c.id === customerId);
  if (!demo) return null;

  const override = loadOverrides()[customerId] || {};
  return { ...demo, ...override };
}

let listeners = [];
function notify() { listeners.forEach(fn => fn()); }

export function useCustomerStats() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    function onChange() { setTick(t => t + 1); }
    listeners.push(onChange);
    return () => { listeners = listeners.filter(l => l !== onChange); };
  }, []);

  function get(customerId) {
    return getCustomerStats(customerId);
  }

  function applyDelta(customerId, patch) {
    // Supabase-backed customer: fire-and-forget update via RPC-like logic
    if (isLive()) {
      (async () => {
        const { data: current } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', customerId)
          .maybeSingle();
        if (!current) return fallbackLocalApply(customerId, patch);

        const merged = { ...current };
        for (const [k, v] of Object.entries(patch)) {
          const col = camelToSnake(k);
          if (typeof v === 'number' && typeof current[col] === 'number') {
            merged[col] = Number(current[col]) + v;
          } else if (v === null || v === undefined) {
            /* skip */
          } else {
            merged[col] = v;
          }
        }
        merged.tier = computeTier(merged.lifetime_spend);
        await supabase.from('profiles').update({
          rewards_balance: merged.rewards_balance,
          lifetime_spend:  merged.lifetime_spend,
          lifetime_earned: merged.lifetime_earned,
          orders_count:    merged.orders_count,
          last_visit:      merged.last_visit,
          status:          merged.status,
          tier:            merged.tier,
        }).eq('id', customerId);
        notify();
      })();
      return;
    }
    return fallbackLocalApply(customerId, patch);
  }

  function fallbackLocalApply(customerId, patch) {
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
      next.tier = computeTier(next.lifetimeSpend);
      registered[regIdx] = next;
      saveRegistered(registered);
      notify();
      return next;
    }
    const overrides = loadOverrides();
    const demo = demoCustomers().find(c => c.id === customerId);
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
    // Absolute set (not delta).
    if (isLive()) {
      (async () => {
        const snakePatch = {};
        for (const [k, v] of Object.entries(patch)) {
          snakePatch[camelToSnake(k)] = v;
        }
        if (snakePatch.lifetime_spend != null) {
          snakePatch.tier = computeTier(snakePatch.lifetime_spend);
        }
        await supabase.from('profiles').update(snakePatch).eq('id', customerId);
        notify();
      })();
      return;
    }
    // Legacy local path
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
    const demo = demoCustomers().find(c => c.id === customerId);
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

function camelToSnake(k) {
  const map = {
    rewardsBalance:  'rewards_balance',
    lifetimeSpend:   'lifetime_spend',
    lifetimeEarned:  'lifetime_earned',
    orders:          'orders_count',
    lastVisit:       'last_visit',
    status:          'status',
    tier:            'tier',
    name:            'name',
    email:           'email',
    phone:           'phone',
    birthday:        'birthday',
    birthdaySet:     'birthday_set',
    referralCode:    'referral_code',
    memberSince:     'member_since',
  };
  return map[k] ?? k;
}
