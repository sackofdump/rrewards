import { useState, useEffect } from 'react';
import { initialMenuItems } from '../data/mockData';
import { isLive, keyFor } from '../utils/sessionMode';

const BASE_KEY = 'rr_menu_items';

function loadMenu() {
  try {
    const stored = localStorage.getItem(keyFor(BASE_KEY));
    if (stored) return JSON.parse(stored);
    return isLive() ? [] : initialMenuItems;
  } catch {
    return isLive() ? [] : initialMenuItems;
  }
}

function saveMenu(items) {
  try { localStorage.setItem(keyFor(BASE_KEY), JSON.stringify(items)); }
  catch { /* ignore */ }
}

export function useMenuStore() {
  const [items, setItems] = useState(loadMenu);

  useEffect(() => { saveMenu(items); }, [items]);

  function addItem(item) {
    setItems(prev => [...prev, { ...item, id: Date.now() }]);
  }
  function updateItem(id, patch) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));
  }
  function removeItem(id) {
    setItems(prev => prev.filter(i => i.id !== id));
  }
  function resetMenu() {
    setItems(isLive() ? [] : initialMenuItems);
  }

  return { items, addItem, updateItem, removeItem, resetMenu };
}
