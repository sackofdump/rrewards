import { useState, useEffect, useCallback } from 'react';
import { isLive, keyFor } from '../utils/sessionMode';

const BASE_KEY = 'rr_activity_log';

const DEFAULT_LOG = [
  {
    id: 1, actorId: 's001', actorName: 'Mike T.', actorRole: 'staff',
    action: 'reward.apply', targetId: 'u001', targetName: 'Josh',
    details: { orderTotal: 87.50, rewardAmount: 2.63, restaurantId: 1 },
    amount: 2.63,
    createdAt: '2026-04-21T19:42',
    anomaly: null,
  },
  {
    id: 2, actorId: 's002', actorName: 'Sara K.', actorRole: 'staff',
    action: 'reward.apply', targetId: 'u001', targetName: 'Josh',
    details: { orderTotal: 52.00, rewardAmount: 1.56, restaurantId: 2 },
    amount: 1.56,
    createdAt: '2026-04-14T20:15',
    anomaly: null,
  },
];

function load() {
  try {
    const stored = localStorage.getItem(keyFor(BASE_KEY));
    if (stored) return JSON.parse(stored);
    return isLive() ? [] : DEFAULT_LOG;
  } catch { return isLive() ? [] : DEFAULT_LOG; }
}
function save(items) {
  try { localStorage.setItem(keyFor(BASE_KEY), JSON.stringify(items)); }
  catch { /* ignore */ }
}

// Dev admin needs visibility into BOTH environments.
function loadBothEnvs() {
  const demo = (() => {
    try {
      const stored = localStorage.getItem(BASE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_LOG;
    } catch { return DEFAULT_LOG; }
  })();
  const live = (() => {
    try {
      const stored = localStorage.getItem(`${BASE_KEY}_live`);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  })();
  // Tag entries with the environment they came from
  const tagged = [
    ...demo.map(e => ({ ...e, env: 'demo' })),
    ...live.map(e => ({ ...e, env: 'live' })),
  ];
  return tagged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/* ── Anomaly detection ───────────────────────────────────────────── */
function detectAnomaly(entry, recentEntries) {
  const oneHourMs = 60 * 60 * 1000;
  const now = new Date(entry.createdAt);

  if (entry.action === 'reward.apply') {
    // Rewards are earned on the pre-tax subtotal — compare to that, not
    // the final total (which can be artificially low if the customer
    // redeemed their balance against this purchase).
    const { subtotal = 0, orderTotal = 0, rewardAmount = 0 } = entry.details || {};
    const basis = subtotal > 0 ? subtotal : orderTotal;
    if (basis > 0) {
      const ratio = rewardAmount / basis;
      if (ratio > 0.15) {
        return {
          level: 'critical',
          reason: `Reward ratio ${(ratio * 100).toFixed(1)}% — way above the standard 3%`,
        };
      }
      if (ratio > 0.08) {
        return {
          level: 'warning',
          reason: `Reward ratio ${(ratio * 100).toFixed(1)}% — above the standard 3%`,
        };
      }
    }
    if (rewardAmount > 50) {
      return { level: 'warning', reason: `Large single-transaction reward: $${rewardAmount.toFixed(2)}` };
    }
    // Velocity: too many rewards in a short window by same staff
    const recentByActor = recentEntries.filter(e =>
      e.actorId === entry.actorId &&
      e.action === 'reward.apply' &&
      (now - new Date(e.createdAt)) < oneHourMs
    );
    if (recentByActor.length >= 10) {
      return {
        level: 'warning',
        reason: `${recentByActor.length + 1} rewards issued in the last hour by ${entry.actorName}`,
      };
    }
  }

  if (entry.action === 'customer.adjust') {
    const amt = Math.abs(entry.amount ?? 0);
    // Tighter thresholds — any meaningful manual grant is worth surfacing
    if (amt >= 100) {
      return { level: 'critical', reason: `Large manual balance adjustment: $${amt.toFixed(2)}` };
    }
    if (amt >= 50) {
      return { level: 'warning', reason: `Sizeable manual adjustment: $${amt.toFixed(2)}` };
    }
    if (amt >= 20) {
      return { level: 'warning', reason: `Manual adjustment: $${amt.toFixed(2)}` };
    }
    const recentAdjusts = recentEntries.filter(e =>
      e.actorId === entry.actorId &&
      e.action === 'customer.adjust' &&
      (now - new Date(e.createdAt)) < oneHourMs
    );
    if (recentAdjusts.length >= 5) {
      return {
        level: 'critical',
        reason: `Rapid manual adjustments — ${recentAdjusts.length + 1} in the last hour`,
      };
    }
  }

  if (entry.action === 'settings.update') {
    const { key, oldValue, newValue } = entry.details || {};
    if (key === 'rewardRate') {
      const change = Math.abs((newValue ?? 0) - (oldValue ?? 0));
      if (change > 0.05) {
        return {
          level: 'critical',
          reason: `Reward rate changed by ${(change * 100).toFixed(1)} points (${(oldValue * 100).toFixed(1)}% → ${(newValue * 100).toFixed(1)}%)`,
        };
      }
    }
  }

  if (entry.action === 'customer.deactivate') {
    const recentDeactivations = recentEntries.filter(e =>
      e.actorId === entry.actorId &&
      e.action === 'customer.deactivate' &&
      (now - new Date(e.createdAt)) < oneHourMs
    );
    if (recentDeactivations.length >= 3) {
      return {
        level: 'warning',
        reason: `${recentDeactivations.length + 1} customer deactivations in the last hour`,
      };
    }
  }

  return null;
}

/* ── Module-level subscription (so all hook consumers stay in sync) ─ */
let listeners = [];
function notify() { listeners.forEach(fn => fn()); }

export function useActivityLog() {
  const [entries, setEntries] = useState(load);

  useEffect(() => {
    function onChange() { setEntries(load()); }
    listeners.push(onChange);
    return () => { listeners = listeners.filter(l => l !== onChange); };
  }, []);

  const logAction = useCallback((data) => {
    const next = load();
    const baseEntry = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString(),
      ...data,
    };
    const anomaly = detectAnomaly(baseEntry, next);
    const entry = { ...baseEntry, anomaly };
    const updated = [entry, ...next].slice(0, 500); // keep last 500
    save(updated);
    notify();
  }, []);

  const clearLog = useCallback(() => {
    save([]);
    notify();
  }, []);

  const resetLog = useCallback(() => {
    save(DEFAULT_LOG);
    notify();
  }, []);

  return { entries, logAction, clearLog, resetLog };
}

/* Hook for dev — returns entries from BOTH demo and live environments,
   tagged with { env: 'demo' | 'live' }. */
export function useAllActivityLogs() {
  const [entries, setEntries] = useState(loadBothEnvs);

  useEffect(() => {
    function onChange() { setEntries(loadBothEnvs()); }
    listeners.push(onChange);
    return () => { listeners = listeners.filter(l => l !== onChange); };
  }, []);

  function clearBoth() {
    try {
      localStorage.removeItem(BASE_KEY);
      localStorage.removeItem(`${BASE_KEY}_live`);
    } catch { /* ignore */ }
    notify();
  }

  return { entries, clearBoth };
}
