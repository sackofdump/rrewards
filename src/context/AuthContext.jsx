import { createContext, useContext, useState } from 'react';
import { adminCustomers, adminAccount, devAdminAccount } from '../data/mockData';
import { hashPassword } from '../hooks/useUserStore';
import { getAllStaff } from '../hooks/useStaffStore';

const AuthContext = createContext(null);

const CUSTOMER_PASSWORD = 'password123';
const REGISTERED_KEY = 'rr_registered_users';

function loadRegistered() {
  try {
    const stored = localStorage.getItem(REGISTERED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
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

  function login(email, password, role = 'customer') {
    setLoading(true);
    setError('');
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let found = null;

        if (role === 'customer') {
          // Check registered users first (real sign-in)
          const registered = loadRegistered().find(u => u.email.toLowerCase() === email.toLowerCase());
          if (registered) {
            if (registered.passwordHash !== hashPassword(password)) {
              setError('Invalid email or password.');
              setLoading(false); reject(); return;
            }
            if (registered.status === 'inactive') {
              setError('This account has been deactivated. Please contact support.');
              setLoading(false); reject(); return;
            }
            found = { ...registered, role: 'customer' };
          } else {
            // Fall back to demo customers
            found = adminCustomers.find(c => c.email.toLowerCase() === email.toLowerCase());
            if (!found || password !== CUSTOMER_PASSWORD) {
              setError('Invalid email or password.');
              setLoading(false); reject(); return;
            }
            if (found.status === 'inactive') {
              setError('This account has been deactivated. Please contact support.');
              setLoading(false); reject(); return;
            }
            found = { ...found, role: 'customer' };
          }
        } else if (role === 'staff') {
          found = getAllStaff().find(s => s.email.toLowerCase() === email.toLowerCase());
          if (!found || password !== found.password) {
            setError('Invalid staff credentials.');
            setLoading(false); reject(); return;
          }
        } else if (role === 'admin') {
          if (email.toLowerCase() !== adminAccount.email.toLowerCase() || password !== adminAccount.password) {
            setError('Invalid manager credentials.');
            setLoading(false); reject(); return;
          }
          found = { ...adminAccount };
        } else if (role === 'devadmin') {
          if (password !== devAdminAccount.password) {
            setError('Invalid password.');
            setLoading(false); reject(); return;
          }
          found = { ...devAdminAccount };
        }

        setUser(found);
        localStorage.setItem('rr_user', JSON.stringify(found));
        setLoading(false);
        resolve(found);
      }, 700);
    });
  }

  function signInAs(userObj) {
    setUser(userObj);
    localStorage.setItem('rr_user', JSON.stringify(userObj));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('rr_user');
  }

  return (
    <AuthContext.Provider value={{ user, login, signInAs, logout, error, loading, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
