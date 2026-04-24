import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'rr_activity_log';

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
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_LOG;
  } catch { return DEFAULT_LOG; }
}
function save(items) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
  catch { /* ignore */ }
}

/* ── Anomaly detection ───────────────────────────────────────────── */
function detectAnomaly(entry, recentEntries) {
  const oneHourMs = 60 * 60 * 1000;
  const now = new Date(entry.createdAt);

  if (entry.action === 'reward.apply') {
    const { orderTotal = 0, rewardAmount = 0 } = entry.details || {};
    if (orderTotal > 0) {
      const ratio = rewardAmount / orderTotal;
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
    if (amt > 100) {
      return { level: 'critical', reason: `Large manual balance adjustment: $${amt.toFixed(2)}` };
    }
    if (amt > 25) {
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
