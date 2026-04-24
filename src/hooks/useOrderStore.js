import { useState, useEffect } from 'react';
import { orders as mockOrders } from '../data/mockData';

const STORAGE_KEY = 'rr_orders';

function loadCustom() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}
function saveCustom(items) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
  catch { /* ignore */ }
}

function genOrderId() {
  const ts = Date.now().toString().slice(-6);
  return `ord-${ts}`;
}

let listeners = [];
function notify() { listeners.forEach(fn => fn(loadCustom())); }

export function useOrderStore() {
  const [custom, setCustom] = useState(loadCustom);

  useEffect(() => {
    function onChange(next) { setCustom(next); }
    listeners.push(onChange);
    return () => { listeners = listeners.filter(l => l !== onChange); };
  }, []);

  const all = [...mockOrders, ...custom];

  function addOrder(data) {
    const next = loadCustom();
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
