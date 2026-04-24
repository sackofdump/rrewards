import { useState, useEffect, useCallback } from 'react';
import { isLive, keyFor } from '../utils/sessionMode';
import { supabase } from '../lib/supabase';

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

function rowToEntry(r) {
  return {
    id: r.id,
    actorId: r.actor_id,
    actorName: r.actor_name,
    actorRole: r.actor_role,
    action: r.action,
    targetId: r.target_id,
    targetName: r.target_name,
    amount: r.amount != null ? Number(r.amount) : null,
    details: r.details ?? {},
    anomaly: r.anomaly,
    read: Boolean(r.read),
    createdAt: r.created_at,
  };
}

function loadLocal() {
  try {
    const stored = localStorage.getItem(keyFor(BASE_KEY));
    if (stored) return JSON.parse(stored);
    return isLive() ? [] : DEFAULT_LOG;
  } catch { return isLive() ? [] : DEFAULT_LOG; }
}
function saveLocal(items) {
  try { localStorage.setItem(keyFor(BASE_KEY), JSON.stringify(items)); }
  catch { /* ignore */ }
}

/* Detect anomaly heuristics */
function detectAnomaly(entry, recentEntries) {
  const oneHourMs = 60 * 60 * 1000;
  const now = new Date(entry.createdAt);

  if (entry.action === 'reward.apply') {
    const { subtotal = 0, orderTotal = 0, rewardAmount = 0 } = entry.details || {};
    const basis = subtotal > 0 ? subtotal : orderTotal;
    if (basis > 0) {
      const ratio = rewardAmount / basis;
      if (ratio > 0.15) return { level: 'critical', reason: `Reward ratio ${(ratio * 100).toFixed(1)}% — way above the standard 3%` };
      if (ratio > 0.08) return { level: 'warning',  reason: `Reward ratio ${(ratio * 100).toFixed(1)}% — above the standard 3%` };
    }
    if (rewardAmount > 50) return { level: 'warning', reason: `Large single-transaction reward: $${rewardAmount.toFixed(2)}` };

    const recentByActor = recentEntries.filter(e =>
      e.actorId === entry.actorId &&
      e.action === 'reward.apply' &&
      (now - new Date(e.createdAt)) < oneHourMs
    );
    if (recentByActor.length >= 10) {
      return { level: 'warning', reason: `${recentByActor.length + 1} rewards issued in the last hour by ${entry.actorName}` };
    }
  }

  if (entry.action === 'customer.adjust') {
    const amt = Math.abs(entry.amount ?? 0);
    if (amt >= 100) return { level: 'critical', reason: `Large manual balance adjustment: $${amt.toFixed(2)}` };
    if (amt >= 50)  return { level: 'warning',  reason: `Sizeable manual adjustment: $${amt.toFixed(2)}` };
    if (amt >= 20)  return { level: 'warning',  reason: `Manual adjustment: $${amt.toFixed(2)}` };
    const recentAdjusts = recentEntries.filter(e =>
      e.actorId === entry.actorId &&
      e.action === 'customer.adjust' &&
      (now - new Date(e.createdAt)) < oneHourMs
    );
    if (recentAdjusts.length >= 5) {
      return { level: 'critical', reason: `Rapid manual adjustments — ${recentAdjusts.length + 1} in the last hour` };
    }
  }

  if (entry.action === 'settings.update') {
    const { key, oldValue, newValue } = entry.details || {};
    if (key === 'rewardRate') {
      const change = Math.abs((newValue ?? 0) - (oldValue ?? 0));
      if (change > 0.05) return {
        level: 'critical',
        reason: `Reward rate changed by ${(change * 100).toFixed(1)} points (${(oldValue * 100).toFixed(1)}% → ${(newValue * 100).toFixed(1)}%)`,
      };
    }
  }

  if (entry.action === 'customer.deactivate') {
    const recentDeactivations = recentEntries.filter(e =>
      e.actorId === entry.actorId &&
      e.action === 'customer.deactivate' &&
      (now - new Date(e.createdAt)) < oneHourMs
    );
    if (recentDeactivations.length >= 3) {
      return { level: 'warning', reason: `${recentDeactivations.length + 1} customer deactivations in the last hour` };
    }
  }

  return null;
}

let listeners = [];
function notifyLocal() { listeners.forEach(fn => fn()); }

/* ── Manager / staff view (useActivityLog) ──────────────────── */
export function useActivityLog() {
  const live = isLive();
  const [entries, setEntries] = useState(() => live ? [] : loadLocal());

  useEffect(() => {
    function onChange() { if (!live) setEntries(loadLocal()); }
    listeners.push(onChange);
    return () => { listeners = listeners.filter(l => l !== onChange); };
  }, [live]);

  useEffect(() => {
    if (!live) return;
    let cancelled = false;
    async function fetchLog() {
      const { data } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      if (!cancelled && data) setEntries(data.map(rowToEntry));
    }
    fetchLog();
    const ch = supabase
      .channel('activity_log_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_log' },
        () => fetchLog())
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [live]);

  const logAction = useCallback(async (data) => {
    const base = {
      createdAt: new Date().toISOString(),
      read: false,
      ...data,
    };
    // Fetch recent to detect anomalies
    const recent = live
      ? (await supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(50)).data?.map(rowToEntry) ?? []
      : loadLocal();
    const anomaly = detectAnomaly(base, recent);
    const entry = { ...base, anomaly };

    if (live) {
      const row = {
        actor_id: entry.actorId ?? null,
        actor_name: entry.actorName ?? null,
        actor_role: entry.actorRole ?? null,
        action: entry.action,
        target_id: entry.targetId ?? null,
        target_name: entry.targetName ?? null,
        amount: entry.amount ?? null,
        details: entry.details ?? {},
        anomaly: entry.anomaly,
        read: false,
      };
      await supabase.from('activity_log').insert(row);
    } else {
      entry.id = Date.now() + Math.floor(Math.random() * 1000);
      const updated = [entry, ...loadLocal()].slice(0, 500);
      saveLocal(updated);
      notifyLocal();
    }
  }, [live]);

  const markRead = useCallback(async (id) => {
    if (live) {
      await supabase.from('activity_log').update({ read: true }).eq('id', id);
      setEntries(prev => prev.map(e => e.id === id ? { ...e, read: true } : e));
      return;
    }
    const next = loadLocal().map(e => e.id === id ? { ...e, read: true } : e);
    saveLocal(next);
    notifyLocal();
  }, [live]);

  const markAllRead = useCallback(async () => {
    if (live) {
      await supabase.from('activity_log').update({ read: true }).eq('read', false);
      setEntries(prev => prev.map(e => e.anomaly ? { ...e, read: true } : e));
      return;
    }
    const next = loadLocal().map(e => e.anomaly ? { ...e, read: true } : e);
    saveLocal(next);
    notifyLocal();
  }, [live]);

  return { entries, logAction, markRead, markAllRead };
}

/* ── Dev view — reads from BOTH demo localStorage and Supabase live ─ */
export function useAllActivityLogs() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      // Demo log from localStorage
      const demoLog = (() => {
        try {
          const stored = localStorage.getItem(BASE_KEY);
          return stored ? JSON.parse(stored) : DEFAULT_LOG;
        } catch { return DEFAULT_LOG; }
      })().map(e => ({ ...e, env: 'demo' }));

      // Legacy live from localStorage
      const legacyLive = (() => {
        try {
          const stored = localStorage.getItem(`${BASE_KEY}_live`);
          return stored ? JSON.parse(stored) : [];
        } catch { return []; }
      })().map(e => ({ ...e, env: 'live' }));

      // Supabase live
      let supabaseLive = [];
      try {
        const { data } = await supabase
          .from('activity_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(500);
        if (data) supabaseLive = data.map(r => ({ ...rowToEntry(r), env: 'live' }));
      } catch { /* ignore */ }

      const merged = [...demoLog, ...legacyLive, ...supabaseLive]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      if (!cancelled) setEntries(merged);
    }

    fetchAll();
    function onChange() { fetchAll(); }
    listeners.push(onChange);

    const ch = supabase
      .channel('dev_activity_log')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_log' },
        () => fetchAll())
      .subscribe();

    return () => {
      cancelled = true;
      listeners = listeners.filter(l => l !== onChange);
      supabase.removeChannel(ch);
    };
  }, []);

  async function markRead(id) {
    // Try Supabase first (numeric ID)
    if (typeof id === 'number' || !isNaN(Number(id))) {
      try {
        await supabase.from('activity_log').update({ read: true }).eq('id', id);
      } catch { /* ignore */ }
    }
    // Also update both localStorage keys
    ['', '_live'].forEach(suffix => {
      const key = `${BASE_KEY}${suffix}`;
      try {
        const stored = localStorage.getItem(key);
        if (!stored) return;
        const list = JSON.parse(stored);
        const next = list.map(e => e.id === id ? { ...e, read: true } : e);
        localStorage.setItem(key, JSON.stringify(next));
      } catch { /* ignore */ }
    });
    notifyLocal();
    setEntries(prev => prev.map(e => e.id === id ? { ...e, read: true } : e));
  }

  async function markAllRead() {
    try {
      await supabase.from('activity_log').update({ read: true }).eq('read', false);
    } catch { /* ignore */ }
    ['', '_live'].forEach(suffix => {
      const key = `${BASE_KEY}${suffix}`;
      try {
        const stored = localStorage.getItem(key);
        if (!stored) return;
        const list = JSON.parse(stored);
        const next = list.map(e => e.anomaly ? { ...e, read: true } : e);
        localStorage.setItem(key, JSON.stringify(next));
      } catch { /* ignore */ }
    });
    notifyLocal();
    setEntries(prev => prev.map(e => e.anomaly ? { ...e, read: true } : e));
  }

  return { entries, markRead, markAllRead };
}
