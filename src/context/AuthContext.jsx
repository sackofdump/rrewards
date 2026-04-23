import { createContext, useContext, useState, useEffect } from 'react';
import { adminCustomers } from '../data/mockData';

const AuthContext = createContext(null);

const MOCK_PASSWORD = 'password123';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('rr_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function login(email, password) {
    setLoading(true);
    setError('');
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const customer = adminCustomers.find(
          c => c.email.toLowerCase() === email.toLowerCase()
        );
        if (!customer || password !== MOCK_PASSWORD) {
          setError('Invalid email or password.');
          setLoading(false);
          reject();
          return;
        }
        if (customer.status === 'inactive') {
          setError('This account has been deactivated. Please contact support.');
          setLoading(false);
          reject();
          return;
        }
        setUser(customer);
        localStorage.setItem('rr_user', JSON.stringify(customer));
        setLoading(false);
        resolve(customer);
      }, 800);
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
