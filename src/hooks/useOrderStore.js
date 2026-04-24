import { useState, useEffect } from 'react';
import { orders as mockOrders } from '../data/mockData';
import { isLive, keyFor } from '../utils/sessionMode';

const BASE_KEY = 'rr_orders';

function load() {
  try {
    const stored = localStorage.getItem(keyFor(BASE_KEY));
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}
function saveCustom(items) {
  try { localStorage.setItem(keyFor(BASE_KEY), JSON.stringify(items)); }
  catch { /* ignore */ }
}

function genOrderId() {
  const ts = Date.now().toString().slice(-6);
  return `ord-${ts}`;
}

let listeners = [];
function notify() { listeners.forEach(fn => fn(load())); }

export function useOrderStore() {
  const [custom, setCustom] = useState(load);

  useEffect(() => {
    function onChange(next) { setCustom(next); }
    listeners.push(onChange);
    return () => { listeners = listeners.filter(l => l !== onChange); };
  }, []);

  // In live mode: only real orders (no demo seeds). In demo: seeds + custom.
  const all = isLive() ? custom : [...mockOrders, ...custom];

  function addOrder(data) {
    const next = load();
    const newOrder = {
      id: genOrderId(),
      date: new Date().toISOString(),
      status: 'completed',
      ...data,
    };
    next.push(newOrder);
    saveCustom(next);
    notify();
    return newOrder;
  }

  function getByUser(userId) {
    return all.filter(o => o.userId === userId);
  }

  function getByRestaurant(restaurantId) {
    return all.filter(o => o.restaurantId === restaurantId);
  }

  function resetCustom() {
    saveCustom([]);
    notify();
  }

  return { orders: all, addOrder, getByUser, getByRestaurant, resetCustom };
}
