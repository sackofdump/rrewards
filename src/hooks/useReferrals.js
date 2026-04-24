import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';

const STORAGE_KEY = 'rr_referrals';

const DEFAULT_REFERRALS = {
  u001: [
    { name: 'Morgan C.', joinedAt: '2025-01-03', firstVisitAt: '2025-01-05', earned: 10, status: 'completed' },
    { name: 'Sam P.',    joinedAt: '2025-11-20', firstVisitAt: null,         earned: 0,  status: 'pending' },
    { name: 'Riley G.',  joinedAt: '2026-02-14', firstVisitAt: '2026-02-18', earned: 10, status: 'completed' },
  ],
};

function load() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_REFERRALS;
  } catch { return DEFAULT_REFERRALS; }
}
function save(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
  catch { /* ignore */ }
}

export function useReferrals(userId) {
  const { referralBonus } = useSettings();
  const [all, setAll] = useState(load);

  useEffect(() => { save(all); }, [all]);

  const myReferrals = all[userId] ?? [];
  const completedCount = myReferrals.filter(r => r.status === 'completed').length;
  const totalEarned = myReferrals.reduce((s, r) => s + r.earned, 0);

  function addReferral(name) {
    setAll(prev => {
      const existing = prev[userId] ?? [];
      return {
        ...prev,
        [userId]: [...existing, {
          name,
          joinedAt: new Date().toISOString().split('T')[0],
          firstVisitAt: null,
          earned: 0,
          status: 'pending',
        }],
      };
    });
  }

  return { referrals: myReferrals, completedCount, totalEarned, referralBonus, addReferral };
}
