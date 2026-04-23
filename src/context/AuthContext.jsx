import { createContext, useContext, useState } from 'react';
import { adminCustomers, staffAccounts, adminAccount } from '../data/mockData';

const AuthContext = createContext(null);

const CUSTOMER_PASSWORD = 'password123';

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
        } else if (role === 'staff') {
          found = staffAccounts.find(s => s.email.toLowerCase() === email.toLowerCase());
          if (!found || password !== found.password) {
            setError('Invalid staff credentials.');
            setLoading(false); reject(); return;
          }
        } else if (role === 'admin') {
          if (email.toLowerCase() !== adminAccount.email.toLowerCase() || password !== adminAccount.password) {
            setError('Invalid admin credentials.');
            setLoading(false); reject(); return;
          }
          found = { ...adminAccount };
        }

        setUser(found);
        localStorage.setItem('rr_user', JSON.stringify(found));
        setLoading(false);
        resolve(found);
      }, 700);
    });
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('rr_user');
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, error, loading, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
