import { useState, useEffect } from 'react';
import { orders as mockOrders } from '../data/mockData';
import { isLive, keyFor } from '../utils/sessionMode';
import { supabase } from '../lib/supabase';

const BASE_KEY = 'rr_orders';

function loadLocal() {
  try {
    const stored = localStorage.getItem(keyFor(BASE_KEY));
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}
function saveLocal(items) {
  try { localStorage.setItem(keyFor(BASE_KEY), JSON.stringify(items)); }
  catch { /* ignore */ }
}

function rowToOrder(r) {
  return {
    id: r.id,
    userId: r.user_id,
    restaurantId: r.restaurant_id,
    items: r.items ?? [],
    subtotal: Number(r.subtotal ?? 0),
    tax: Number(r.tax ?? 0),
    total: Number(r.total ?? 0),
    rewards: Number(r.rewards ?? 0),
    redeemed: Number(r.redeemed ?? 0),
    server: r.server,
    status: r.status,
    date: r.created_at,
  };
}

function genOrderId() {
  const ts = Date.now().toString().slice(-6);
  return `ord-${ts}`;
}

let listeners = [];
function notifyLocal() { listeners.forEach(fn => fn(loadLocal())); }

export function useOrderStore() {
  const live = isLive();
  const [remote, setRemote] = useState([]);
  const [custom, setCustom] = useState(loadLocal);

  // Subscribe to local changes (demo mode + legacy live)
  useEffect(() => {
    function onChange(next) { setCustom(next); }
    listeners.push(onChange);
    return () => { listeners = listeners.filter(l => l !== onChange); };
  }, []);

  // Fetch Supabase orders in live mode
  useEffect(() => {
    if (!live) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (!cancelled && data) setRemote(data.map(rowToOrder));
    })();
    return () => { cancelled = true; };
  }, [live]);

  const all = live
    ? [...remote, ...custom]
    : [...mockOrders, ...custom];

  async function addOrder(data) {
    if (live) {
      const row = {
        user_id: data.userId,
        restaurant_id: data.restaurantId,
        items: data.items ?? [],
        subtotal: data.subtotal ?? 0,
        tax: data.tax ?? 0,
        total: data.total ?? 0,
        rewards: data.rewards ?? 0,
        redeemed: data.redeemed ?? 0,
        server: data.server ?? null,
        status: data.status ?? 'completed',
      };
      const { data: inserted } = await supabase.from('orders').insert(row).select().single();
      if (inserted) {
        const newOrder = rowToOrder(inserted);
        setRemote(prev => [newOrder, ...prev]);
        return newOrder;
      }
      return null;
    }
    // Demo / legacy mode — localStorage
    const next = loadLocal();
    const newOrder = {
      id: genOrderId(),
      date: new Date().toISOString(),
      status: 'completed',
      ...data,
    };
    next.push(newOrder);
    saveLocal(next);
    notifyLocal();
    return newOrder;
  }

  function getByUser(userId) {
    return all.filter(o => o.userId === userId);
  }

  function getByRestaurant(restaurantId) {
    return all.filter(o => o.restaurantId === restaurantId);
  }

  function resetCustom() {
    saveLocal([]);
    notifyLocal();
  }

  return { orders: all, addOrder, getByUser, getByRestaurant, resetCustom };
}
