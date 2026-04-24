import { useState, useEffect } from 'react';

const STORAGE_KEY = 'rr_notifications';

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
    title: 'Welcome to Rewards!',
    body: 'Thanks for joining — you earn 3% back on every visit.',
    createdAt: '2025-01-03T12:00',
    read: true,
  },
];

function load() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_NOTIFICATIONS;
  } catch { return DEFAULT_NOTIFICATIONS; }
}
function save(items) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
  catch { /* ignore */ }
}

export function useNotifications(userId) {
  const [all, setAll] = useState(load);

  useEffect(() => { save(all); }, [all]);

  const forUser = userId ? all.filter(n => n.userId === userId) : all;
  const unreadCount = forUser.filter(n => !n.read).length;

  function markRead(id) {
    setAll(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }
  function markAllRead() {
    setAll(prev => prev.map(n => forUser.some(f => f.id === n.id) ? { ...n, read: true } : n));
  }
  function addNotification(data) {
    const newN = {
      id: Date.now(),
      read: false,
      createdAt: new Date().toISOString(),
      ...data,
    };
    setAll(prev => [newN, ...prev]);
    return newN;
  }
  function removeNotification(id) {
    setAll(prev => prev.filter(n => n.id !== id));
  }
  function resetNotifications() {
    setAll(DEFAULT_NOTIFICATIONS);
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
