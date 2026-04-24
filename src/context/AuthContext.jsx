import { createContext, useContext, useState, useEffect } from 'react';
import { adminCustomers, adminAccount, devAdminAccount, staffAccounts as demoStaff } from '../data/mockData';
import { hashPassword } from '../hooks/useUserStore';
import { getAllStaff } from '../hooks/useStaffStore';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

const CUSTOMER_PASSWORD = 'password123';
const REGISTERED_KEY = 'rr_registered_users';

function loadRegistered() {
  try {
    const stored = localStorage.getItem(REGISTERED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function profileToUser(profile) {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    birthday: profile.birthday,
    birthdaySet: profile.birthday_set,
    referralCode: profile.referral_code,
    referredBy: profile.referred_by,
    tier: profile.tier,
    rewardsBalance: Number(profile.rewards_balance ?? 0),
    lifetimeSpend: Number(profile.lifetime_spend ?? 0),
    lifetimeEarned: Number(profile.lifetime_earned ?? 0),
    orders: Number(profile.orders_count ?? 0),
    lastVisit: profile.last_visit,
    status: profile.status,
    memberSince: profile.member_since,
    role: 'customer',
    liveMode: true,
    supabaseBacked: true,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('rr_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  // On mount, if there's a Supabase session, hydrate user from profiles table
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && mounted) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          if (profile) {
            const hydrated = profileToUser(profile);
            setUser(hydrated);
            localStorage.setItem('rr_user', JSON.stringify(hydrated));
          }
        }
      } catch { /* ignore */ }
      if (mounted) setSessionChecked(true);
    })();

    const { data: authSub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('rr_user');
      }
    });
    return () => {
      mounted = false;
      authSub?.subscription?.unsubscribe?.();
    };
  }, []);

  async function login(email, password, role = 'customer', { liveMode = false } = {}) {
    setLoading(true);
    setError('');
    try {
      let found = null;

      if (role === 'customer') {
        if (liveMode) {
          // Real customer login → Supabase auth
          const { data, error: sbErr } = await supabase.auth.signInWithPassword({ email, password });
          if (sbErr) {
            setError('Invalid email or password.');
            setLoading(false);
            throw sbErr;
          }
          const { data: profile, error: pErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();
          if (pErr || !profile) {
            setError('Account profile not found. Please register again.');
            setLoading(false);
            throw pErr ?? new Error('no profile');
          }
          if (profile.status === 'inactive') {
            setError('This account has been deactivated. Please contact support.');
            await supabase.auth.signOut();
            setLoading(false);
            throw new Error('deactivated');
          }
          found = profileToUser(profile);
        } else {
          // Demo-mode customer login → localStorage registered users + demo customers
          const registered = loadRegistered().find(u => u.email.toLowerCase() === email.toLowerCase());
          if (registered) {
            if (registered.passwordHash !== hashPassword(password)) {
              setError('Invalid email or password.');
              setLoading(false); throw new Error('bad pw');
            }
            if (registered.status === 'inactive') {
              setError('This account has been deactivated. Please contact support.');
              setLoading(false); throw new Error('deactivated');
            }
            found = { ...registered, role: 'customer' };
          } else {
            found = adminCustomers.find(c => c.email.toLowerCase() === email.toLowerCase());
            if (!found || password !== CUSTOMER_PASSWORD) {
              setError('Invalid email or password.');
              setLoading(false); throw new Error('no match');
            }
            if (found.status === 'inactive') {
              setError('This account has been deactivated. Please contact support.');
              setLoading(false); throw new Error('deactivated');
            }
            found = { ...found, role: 'customer' };
          }
        }
      } else if (role === 'staff') {
        if (liveMode) {
          // Staff in live mode: query Supabase first, fall back to demo
          try {
            const { data } = await supabase
              .from('staff_accounts')
              .select('*')
              .ilike('email', email.trim())
              .maybeSingle();
            if (data) found = { id: `s_${data.id}`, name: data.name, email: data.email, role: 'staff', restaurantId: data.restaurant_id, password: data.password };
          } catch { /* ignore */ }
        }
        // Fall back to localStorage/demo staff (covers both modes)
        if (!found) {
          found = getAllStaff().find(s => s.email.toLowerCase() === email.toLowerCase())
               ?? demoStaff.find(s => s.email.toLowerCase() === email.toLowerCase());
        }
        if (!found || password !== found.password) {
          setError('Invalid staff credentials.');
          setLoading(false); throw new Error('bad staff');
        }
      } else if (role === 'admin') {
        if (email.toLowerCase() !== adminAccount.email.toLowerCase() || password !== adminAccount.password) {
          setError('Invalid manager credentials.');
          setLoading(false); throw new Error('bad admin');
        }
        found = { ...adminAccount };
      } else if (role === 'devadmin') {
        if (password !== devAdminAccount.password) {
          setError('Invalid password.');
          setLoading(false); throw new Error('bad dev');
        }
        found = { ...devAdminAccount };
      }

      const marked = { ...found, liveMode };
      setUser(marked);
      localStorage.setItem('rr_user', JSON.stringify(marked));
      setLoading(false);
      return marked;
    } catch (e) {
      setLoading(false);
      throw e;
    }
  }

  function signInAs(userObj, { liveMode = false } = {}) {
    const marked = { ...userObj, liveMode };
    setUser(marked);
    localStorage.setItem('rr_user', JSON.stringify(marked));
  }

  async function logout() {
    try { await supabase.auth.signOut(); } catch { /* ignore */ }
    setUser(null);
    localStorage.removeItem('rr_user');
  }

  return (
    <AuthContext.Provider value={{ user, login, signInAs, logout, error, loading, setError, sessionChecked }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
