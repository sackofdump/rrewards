import { useState, useEffect } from 'react';
import { orders } from '../data/mockData';

const STORAGE_KEY = 'rr_challenges';

function getMonthStart() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

function makeDefaults() {
  return [
    {
      id: 'explore',
      title: 'Restaurant Explorer',
      description: 'Visit 3 different restaurants this month',
      reward: 10,
      goal: 3,
      unit: 'restaurants',
      resetCycle: 'monthly',
      claimedAt: null,
    },
    {
      id: 'bigspender',
      title: 'Big Spender',
      description: 'Spend $200 this month',
      reward: 15,
      goal: 200,
      unit: 'dollars',
      resetCycle: 'monthly',
      claimedAt: null,
    },
    {
      id: 'weekender',
      title: 'Weekend Warrior',
      description: 'Dine on a Friday or Saturday',
      reward: 5,
      goal: 1,
      unit: 'weekend_visits',
      resetCycle: 'monthly',
      claimedAt: null,
    },
  ];
}

function load() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : makeDefaults();
  } catch { return makeDefaults(); }
}

function computeProgress(challenge, userOrders, monthStart) {
  const thisMonth = userOrders.filter(o => o.date >= monthStart);
  switch (challenge.unit) {
    case 'restaurants': {
      const unique = new Set(thisMonth.map(o => o.restaurantId));
      return unique.size;
    }
    case 'dollars': {
      return thisMonth.reduce((s, o) => s + o.total, 0);
    }
    case 'weekend_visits': {
      return thisMonth.filter(o => {
        const day = new Date(o.date).getDay();
        return day === 5 || day === 6;
      }).length;
    }
    default: return 0;
  }
}

export function useChallenges(userId) {
  const [challenges, setChallenges] = useState(load);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(challenges)); }
    catch { /* ignore */ }
  }, [challenges]);

  const userOrders = orders.filter(o => o.userId === userId);
  const monthStart = getMonthStart();

  const enriched = challenges.map(ch => {
    const progress = computeProgress(ch, userOrders, monthStart);
    const completed = progress >= ch.goal;
    return { ...ch, progress: Math.min(progress, ch.goal), completed };
  });

  function claim(id) {
    setChallenges(prev => prev.map(c =>
      c.id === id ? { ...c, claimedAt: new Date().toISOString() } : c
    ));
  }
  function resetChallenges() {
    setChallenges(makeDefaults());
  }

  return { challenges: enriched, claim, resetChallenges };
}
