import { useState, useEffect } from 'react';
import { restaurants as baseRestaurants, restaurantDetails as baseDetails } from '../data/mockData';

const STORAGE_KEY = 'rr_custom_restaurants';

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

const nextId = () => 1000 + Math.floor(Math.random() * 900000);

export function useRestaurantStore() {
  const [custom, setCustom] = useState(load);

  useEffect(() => { save(custom); }, [custom]);

  const all = [
    ...baseDetails.map(r => ({ ...r, isBuiltIn: true })),
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
    setCustom(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  }

  function removeRestaurant(id) {
    setCustom(prev => prev.filter(r => r.id !== id));
  }

  function resetCustom() {
    setCustom([]);
  }

  return { all, custom, addRestaurant, updateRestaurant, removeRestaurant, resetCustom };
}
