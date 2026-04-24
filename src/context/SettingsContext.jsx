import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

const DEFAULTS = {
  rewardRate:     0.03,
  taxRate:        0.08,
  referralBonus:  10,
  birthdayBonus:  10,
  tierRates: {
    Bronze:   0.03,
    Silver:   0.04,
    Gold:     0.05,
    Platinum: 0.06,
  },
};

const STORAGE_KEY = 'rr_settings';

function load() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULTS;
    const parsed = JSON.parse(stored);
    return {
      ...DEFAULTS,
      ...parsed,
      // Merge tierRates so missing tiers fall back to defaults
      tierRates: { ...DEFAULTS.tierRates, ...(parsed.tierRates || {}) },
    };
  } catch { return DEFAULTS; }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(load);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); }
    catch { /* ignore */ }
  }, [settings]);

  function update(patch) {
    setSettings(prev => ({ ...prev, ...patch }));
  }
  function reset() {
    setSettings(DEFAULTS);
  }

  // Look up the effective reward rate for a given tier
  function rateForTier(tier) {
    return settings.tierRates?.[tier] ?? settings.rewardRate;
  }

  return (
    <SettingsContext.Provider value={{ ...settings, update, reset, rateForTier }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
