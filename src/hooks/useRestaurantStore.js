import { useState, useEffect } from 'react';
import { restaurantDetails as baseDetails } from '../data/mockData';

const CUSTOM_KEY    = 'rr_custom_restaurants';
const OVERRIDES_KEY = 'rr_restaurant_overrides';

function safeLoad(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch { return fallback; }
}
function safeSave(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

const nextId = () => 1000 + Math.floor(Math.random() * 900000);

export function useRestaurantStore() {
  const [custom, setCustom]       = useState(() => safeLoad(CUSTOM_KEY, []));
  const [overrides, setOverrides] = useState(() => safeLoad(OVERRIDES_KEY, {}));

  useEffect(() => { safeSave(CUSTOM_KEY, custom); }, [custom]);
  useEffect(() => { safeSave(OVERRIDES_KEY, overrides); }, [overrides]);

  const all = [
    ...baseDetails.map(r => ({ ...r, ...(overrides[r.id] || {}), isBuiltIn: true })),
    ...custom.map(r => ({ ...r, isBuiltIn: false })),
  ];

  function addRestaurant(data) {
    const newR = {
      id: nextId(),
      name: data.name,
      cuisine: data.cuisine,
      logo: data.logo || '🍽️',
      address: data.address || '',
      phone: data.phone || '',
      hours: data.hours || '',
      description: data.description || '',
      rating: data.rating ?? 4.5,
      reviews: data.reviews ?? 0,
    };
    setCustom(prev => [...prev, newR]);
    return newR;
  }

  function updateRestaurant(id, patch) {
    const isBuiltIn = baseDetails.some(r => r.id === id);
    if (isBuiltIn) {
      setOverrides(prev => ({ ...prev, [id]: { ...(prev[id] || {}), ...patch } }));
    } else {
      setCustom(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
    }
  }

  function removeRestaurant(id) {
    const isBuiltIn = baseDetails.some(r => r.id === id);
    if (isBuiltIn) return false;
    setCustom(prev => prev.filter(r => r.id !== id));
    return true;
  }

  function resetAll() {
    setCustom([]);
    setOverrides({});
  }

  return { all, custom, overrides, addRestaurant, updateRestaurant, removeRestaurant, resetAll };
}
