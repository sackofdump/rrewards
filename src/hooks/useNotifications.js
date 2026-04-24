import { useState, useEffect } from 'react';
import { isLive, keyFor } from '../utils/sessionMode';
import { supabase } from '../lib/supabase';

const BASE_KEY = 'rr_notifications';

const DEFAULT_NOTIFICATIONS = [
  {
    id: 1,
    userId: 'u001',
    type: 'reward',
    title: "You earned $2.63",
    body: 'From your order at Ember & Oak on Apr 21',
    createdAt: '2026-04-21T19:50',
    read: false,
  },
  {
    id: 2,
    userId: 'u001',
    type: 'promo',
    title: 'Double Rewards Weekend',
    body: 'Earn 10% back at Ember & Oak all weekend',
    createdAt: '2026-04-20T10:00',
    read: false,
  },
  {
    id: 3,
    userId: 'u001',
    type: 'tier',
    title: "You've reached Gold status!",
    body: 'Enjoy priority perks and exclusive offers.',
    createdAt: '2026-04-15T14:30',
    read: true,
  },
  {
    id: 4,
    userId: 'u001',
    type: 'reward',
    title: "You earned $1.56",
    body: 'From your order at Sakura Garden on Apr 14',
    createdAt: '2026-04-14T20:22',
    read: true,
  },
  {
    id: 5,
    userId: 'u001',
    type: 'birthday',
    title: 'Your birthday bonus awaits',
    body: 'Your birthday is coming up — $10 will be added to your account.',
    createdAt: '2026-04-28T09:00',
    read: false,
  },
  {
    id: 6,
    userId: 'u002',
    type: 'welcome',
    title: 'Welcome to Restaurant Rewards!',
    body: 'Thanks for joining — you earn 3% back on every visit.',
    createdAt: '2025-01-03T12:00',
    read: true,
  },
];

function rowToNotif(r) {
  return {
    id: r.id,
    userId: r.user_id,
    type: r.type,
    title: r.title,
    body: r.body,
    read: Boolean(r.read),
    createdAt: r.created_at,
  };
}

function loadLocal() {
  try {
    const stored = localStorage.getItem(keyFor(BASE_KEY));
    if (stored) return JSON.parse(stored);
    return isLive() ? [] : DEFAULT_NOTIFICATIONS;
  } catch { return isLive() ? [] : DEFAULT_NOTIFICATIONS; }
}
function saveLocal(items) {
  try { localStorage.setItem(keyFor(BASE_KEY), JSON.stringify(items)); }
  catch { /* ignore */ }
}

let listeners = [];
function notifyLocal() { listeners.forEach(fn => fn()); }

export function useNotifications(userId) {
  const live = isLive();
  const [all, setAll] = useState(() => live ? [] : loadLocal());

  useEffect(() => {
    function onChange() { if (!live) setAll(loadLocal()); }
    listeners.push(onChange);
    return () => { listeners = listeners.filter(l => l !== onChange); };
  }, [live]);

  useEffect(() => {
    if (!live) return;
    let cancelled = false;
    async function fetchAll() {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (!cancelled && data) setAll(data.map(rowToNotif));
    }
    fetchAll();
    const ch = supabase
      .channel('notifications_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' },
        () => fetchAll())
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [live]);

  const forUser = userId ? all.filter(n => n.userId === userId) : all;
  const unreadCount = forUser.filter(n => !n.read).length;

  async function markRead(id) {
    if (live) {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
      setAll(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      return;
    }
    const next = loadLocal().map(n => n.id === id ? { ...n, read: true } : n);
    saveLocal(next);
    notifyLocal();
  }
  async function markAllRead() {
    if (live) {
      const ids = forUser.filter(n => !n.read).map(n => n.id);
      if (ids.length > 0) {
        await supabase.from('notifications').update({ read: true }).in('id', ids);
      }
      setAll(prev => prev.map(n => ids.includes(n.id) ? { ...n, read: true } : n));
      return;
    }
    const targets = new Set(forUser.map(n => n.id));
    const next = loadLocal().map(n => targets.has(n.id) ? { ...n, read: true } : n);
    saveLocal(next);
    notifyLocal();
  }
  async function addNotification(data) {
    if (live) {
      const row = {
        user_id: data.userId,
        type: data.type,
        title: data.title,
        body: data.body ?? null,
        read: false,
      };
      const { data: inserted } = await supabase.from('notifications').insert(row).select().single();
      if (inserted) setAll(prev => [rowToNotif(inserted), ...prev]);
      return inserted ? rowToNotif(inserted) : null;
    }
    const newN = {
      id: Date.now(),
      read: false,
      createdAt: new Date().toISOString(),
      ...data,
    };
    const next = [newN, ...loadLocal()];
    saveLocal(next);
    notifyLocal();
    return newN;
  }
  async function removeNotification(id) {
    if (live) {
      await supabase.from('notifications').delete().eq('id', id);
      setAll(prev => prev.filter(n => n.id !== id));
      return;
    }
    const next = loadLocal().filter(n => n.id !== id);
    saveLocal(next);
    notifyLocal();
  }
  function resetNotifications() {
    if (live) return;
    saveLocal(DEFAULT_NOTIFICATIONS);
    notifyLocal();
  }

  return {
    notifications: forUser.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    allNotifications: all,
    unreadCount,
    markRead, markAllRead,
    addNotification, removeNotification,
    resetNotifications,
  };
}
