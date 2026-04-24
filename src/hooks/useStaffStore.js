import { useState, useEffect } from 'react';
import { staffAccounts as defaultStaff } from '../data/mockData';
import { isLive, keyFor } from '../utils/sessionMode';
import { supabase } from '../lib/supabase';

const BASE_KEY = 'rr_staff_accounts';

function rowToStaff(r) {
  return {
    id: `s_${r.id}`,
    _dbId: r.id,
    name: r.name,
    email: r.email,
    role: 'staff',
    restaurantId: r.restaurant_id,
    password: r.password,
  };
}

function loadLocal() {
  try {
    const stored = localStorage.getItem(keyFor(BASE_KEY));
    if (stored) return JSON.parse(stored);
    return isLive() ? [] : defaultStaff;
  } catch { return isLive() ? [] : defaultStaff; }
}
function saveLocal(items) {
  try { localStorage.setItem(keyFor(BASE_KEY), JSON.stringify(items)); }
  catch { /* ignore */ }
}

function genId() {
  return 's' + Date.now().toString(36).slice(-5) + Math.random().toString(36).slice(2, 4);
}

let listeners = [];
function notifyLocal() { listeners.forEach(fn => fn(loadLocal())); }

export function useStaffStore() {
  const live = isLive();
  const [staff, setStaff] = useState(() => live ? [] : loadLocal());

  useEffect(() => {
    function onChange(next) { if (!live) setStaff(next); }
    listeners.push(onChange);
    return () => { listeners = listeners.filter(l => l !== onChange); };
  }, [live]);

  useEffect(() => {
    if (!live) return;
    let cancelled = false;
    async function fetchAll() {
      const { data } = await supabase.from('staff_accounts').select('*').order('created_at', { ascending: true });
      if (!cancelled && data) setStaff(data.map(rowToStaff));
    }
    fetchAll();
    const ch = supabase
      .channel('staff_accounts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_accounts' }, () => fetchAll())
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [live]);

  async function addStaff({ name, email, restaurantId, password }) {
    if (live) {
      const { data: existing } = await supabase
        .from('staff_accounts').select('id').ilike('email', email.trim()).maybeSingle();
      if (existing) throw new Error('Staff with this email already exists.');
      const { data: inserted } = await supabase.from('staff_accounts').insert({
        name: name.trim(),
        email: email.trim(),
        restaurant_id: restaurantId,
        password,
      }).select().single();
      if (!inserted) throw new Error('Failed to create staff account.');
      const newStaff = rowToStaff(inserted);
      setStaff(prev => [...prev, newStaff]);
      return newStaff;
    }
    const existing = loadLocal();
    if (existing.some(s => s.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Staff with this email already exists.');
    }
    const newStaff = {
      id: genId(),
      name: name.trim(),
      email: email.trim(),
      role: 'staff',
      restaurantId,
      password,
    };
    const next = [...existing, newStaff];
    saveLocal(next);
    notifyLocal();
    return newStaff;
  }

  async function updateStaff(id, patch) {
    if (live) {
      // id is 's_<number>'
      const dbId = typeof id === 'string' && id.startsWith('s_') ? Number(id.slice(2)) : id;
      const row = {};
      if (patch.name != null)          row.name = patch.name;
      if (patch.email != null)         row.email = patch.email;
      if (patch.restaurantId != null)  row.restaurant_id = patch.restaurantId;
      if (patch.password)              row.password = patch.password;
      await supabase.from('staff_accounts').update(row).eq('id', dbId);
      setStaff(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
      return;
    }
    const next = loadLocal().map(s => s.id === id ? { ...s, ...patch } : s);
    saveLocal(next);
    notifyLocal();
  }

  async function removeStaff(id) {
    if (live) {
      const dbId = typeof id === 'string' && id.startsWith('s_') ? Number(id.slice(2)) : id;
      await supabase.from('staff_accounts').delete().eq('id', dbId);
      setStaff(prev => prev.filter(s => s.id !== id));
      return;
    }
    saveLocal(loadLocal().filter(s => s.id !== id));
    notifyLocal();
  }

  function resetStaff() {
    if (live) return; // no-op in live mode
    saveLocal(isLive() ? [] : defaultStaff);
    notifyLocal();
  }

  return { staff, addStaff, updateStaff, removeStaff, resetStaff };
}

// For AuthContext to check stored staff synchronously (demo mode only)
export function getAllStaff() {
  return loadLocal();
}
