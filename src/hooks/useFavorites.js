import { useState, useEffect } from 'react';

const STORAGE_KEY = 'rr_favorites';

function load() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}
function save(items) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
  catch { /* ignore */ }
}

let listeners = [];
function notify() { listeners.forEach(fn => fn(load())); }

export function useFavorites(userId) {
  const [all, setAll] = useState(load);

  useEffect(() => {
    function onChange(next) { setAll(next); }
    listeners.push(onChange);
    return () => { listeners = listeners.filter(l => l !== onChange); };
  }, []);

  const userFavorites = userId ? all.filter(f => f.userId === userId) : all;

  function hasFavorite(restaurantId, itemName) {
    return userFavorites.some(f =>
      f.restaurantId === restaurantId && f.name.toLowerCase() === itemName.toLowerCase()
    );
  }

  function addFavorite({ restaurantId, name, price }) {
    const next = load();
    if (next.some(f =>
      f.userId === userId &&
      f.restaurantId === restaurantId &&
      f.name.toLowerCase() === name.toLowerCase()
    )) return false;
    next.push({
      id: `fav-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId, restaurantId, name, price,
      addedAt: new Date().toISOString(),
    });
    save(next);
    notify();
    return true;
  }

  function addMany(items) {
    let added = 0;
    items.forEach(it => { if (addFavorite(it)) added++; });
    return added;
  }

  function removeFavorite(id) {
    save(load().filter(f => f.id !== id));
    notify();
  }

  function toggleFavorite(item) {
    const existing = userFavorites.find(f =>
      f.restaurantId === item.restaurantId && f.name.toLowerCase() === item.name.toLowerCase()
    );
    if (existing) { removeFavorite(existing.id); return false; }
    addFavorite(item);
    return true;
  }

  function getByRestaurant(restaurantId) {
    return userFavorites.filter(f => f.restaurantId === restaurantId);
  }

  return { favorites: userFavorites, hasFavorite, addFavorite, addMany, removeFavorite, toggleFavorite, getByRestaurant };
}
