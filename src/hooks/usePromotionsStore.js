import { useState, useEffect } from 'react';
import { promotions as initialPromotions } from '../data/mockData';
import { isLive, keyFor } from '../utils/sessionMode';

const BASE_KEY = 'rr_promotions';

function load() {
  try {
    const stored = localStorage.getItem(keyFor(BASE_KEY));
    if (stored) return JSON.parse(stored);
    return isLive() ? [] : initialPromotions;
  } catch { return isLive() ? [] : initialPromotions; }
}
function save(items) {
  try { localStorage.setItem(keyFor(BASE_KEY), JSON.stringify(items)); }
  catch { /* ignore */ }
}

const nextId = () => 100 + Math.floor(Math.random() * 900000);

export function usePromotionsStore() {
  const [promos, setPromos] = useState(load);

  useEffect(() => { save(promos); }, [promos]);

  function addPromo(data) {
    const newPromo = {
      id: nextId(),
      active: true,
      color: 'from-amber-700 to-amber-500',
      ...data,
    };
    setPromos(prev => [...prev, newPromo]);
  }
  function updatePromo(id, patch) {
    setPromos(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
  }
  function removePromo(id) {
    setPromos(prev => prev.filter(p => p.id !== id));
  }
  function resetPromos() {
    setPromos(isLive() ? [] : initialPromotions);
  }

  return { promos, addPromo, updatePromo, removePromo, resetPromos };
}
