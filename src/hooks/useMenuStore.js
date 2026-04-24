import { useState, useEffect } from 'react';
import { initialMenuItems } from '../data/mockData';
import { isLive, keyFor } from '../utils/sessionMode';
import { supabase } from '../lib/supabase';

const BASE_KEY = 'rr_menu_items';

function rowToItem(r) {
  return {
    id: r.id,
    restaurantId: r.restaurant_id,
    name: r.name,
    price: Number(r.price ?? 0),
    category: r.category,
    description: r.description,
    available: Boolean(r.available),
  };
}

function loadLocal() {
  try {
    const stored = localStorage.getItem(keyFor(BASE_KEY));
    if (stored) return JSON.parse(stored);
    return isLive() ? [] : initialMenuItems;
  } catch {
    return isLive() ? [] : initialMenuItems;
  }
}
function saveLocal(items) {
  try { localStorage.setItem(keyFor(BASE_KEY), JSON.stringify(items)); }
  catch { /* ignore */ }
}

let listeners = [];
function notifyLocal() { listeners.forEach(fn => fn(loadLocal())); }

export function useMenuStore() {
  const live = isLive();
  const [items, setItems] = useState(() => live ? [] : loadLocal());

  // Demo-mode subscription
  useEffect(() => {
    function onChange(next) { if (!live) setItems(next); }
    listeners.push(onChange);
    return () => { listeners = listeners.filter(l => l !== onChange); };
  }, [live]);

  // Live-mode: fetch + realtime subscribe
  useEffect(() => {
    if (!live) return;
    let cancelled = false;
    async function fetchAll() {
      const { data } = await supabase
        .from('menu_items')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });
      if (!cancelled && data) setItems(data.map(rowToItem));
    }
    fetchAll();
    const ch = supabase
      .channel('menu_items_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' },
        () => fetchAll())
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [live]);

  async function addItem(item) {
    if (live) {
      const row = {
        restaurant_id: item.restaurantId,
        name: item.name,
        price: item.price,
        category: item.category,
        description: item.description ?? null,
        available: item.available ?? true,
      };
      const { data: inserted } = await supabase.from('menu_items').insert(row).select().single();
      if (inserted) setItems(prev => [...prev, rowToItem(inserted)]);
      return inserted ? rowToItem(inserted) : null;
    }
    const next = [...loadLocal(), { ...item, id: Date.now() }];
    saveLocal(next);
    notifyLocal();
    return next[next.length - 1];
  }

  async function updateItem(id, patch) {
    if (live) {
      const row = {};
      if (patch.restaurantId != null) row.restaurant_id = patch.restaurantId;
      if (patch.name != null)         row.name = patch.name;
      if (patch.price != null)        row.price = patch.price;
      if (patch.category != null)     row.category = patch.category;
      if (patch.description !== undefined) row.description = patch.description || null;
      if (patch.available != null)    row.available = patch.available;
      await supabase.from('menu_items').update(row).eq('id', id);
      setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));
      return;
    }
    const next = loadLocal().map(i => i.id === id ? { ...i, ...patch } : i);
    saveLocal(next);
    notifyLocal();
  }

  async function removeItem(id) {
    if (live) {
      await supabase.from('menu_items').delete().eq('id', id);
      setItems(prev => prev.filter(i => i.id !== id));
      return;
    }
    const next = loadLocal().filter(i => i.id !== id);
    saveLocal(next);
    notifyLocal();
  }

  function resetMenu() {
    if (live) return; // no-op in live mode — use delete instead
    const defaults = initialMenuItems;
    saveLocal(defaults);
    notifyLocal();
    setItems(defaults);
  }

  return { items, addItem, updateItem, removeItem, resetMenu };
}
