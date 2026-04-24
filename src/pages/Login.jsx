import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Utensils, Shield, ChevronRight, Terminal } from 'lucide-react';

const DEMO_LOGINS = [
  {
    role: 'customer',
    label: 'Customer',
    name: 'Josh',
    description: 'View rewards, wallet & order history',
    icon: User,
    email: 'joshe@email.com',
    password: 'password123',
    redirect: '/',
  },
  {
    role: 'staff',
    label: 'Staff',
    name: 'Mike T.',
    description: 'Scan QR codes & apply rewards',
    icon: Utensils,
    email: 'staff@rewards.com',
    password: 'staff123',
    redirect: '/staff',
  },
  {
    role: 'admin',
    label: 'Manager',
    name: 'Manager',
    description: 'Run the restaurant group',
    icon: Shield,
    email: 'admin@rewards.com',
    password: 'admin123',
    redirect: '/admin',
  },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loadingRole, setLoadingRole] = useState(null);

  async function handleLogin(entry) {
    setLoadingRole(entry.role);
    try {
      await login(entry.email, entry.password, entry.role);
      navigate(entry.redirect);
    } catch {
      setLoadingRole(null);
    }
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-4 py-12"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.08) 0%, transparent 60%), #080a0f' }}>

      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl gradient-gold flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-900/30">
            <span className="text-2xl font-black text-black">R</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Restaurant Rewards</h1>
          <p className="text-sm text-neutral-500 mt-1">Select an account to continue</p>
          <p className="inline-block mt-3 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-[10px] font-bold text-amber-400 uppercase tracking-widest">
            For Demo Purposes Only
          </p>
        </div>

        <div className="space-y-3">
          {DEMO_LOGINS.map((entry) => {
            const Icon = entry.icon;
            const isLoading = loadingRole === entry.role;
            return (
              <button
                key={entry.role}
                onClick={() => handleLogin(entry)}
                disabled={loadingRole !== null}
                className="w-full glass rounded-2xl p-4 flex items-center gap-4 text-left hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="w-11 h-11 rounded-xl gradient-gold flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">{entry.label}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{entry.description}</p>
                </div>
                {isLoading
                  ? <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin shrink-0" />
                  : <ChevronRight size={16} className="text-neutral-600 shrink-0" />
                }
              </button>
            );
          })}
        </div>

        <div className="mt-8 text-center space-y-3">
          <div className="pt-2 border-t border-white/5">
            <p className="text-xs text-neutral-500 mb-2 pt-3">Want to test with real sign-up?</p>
            <Link to="/signin"
              className="inline-block text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors">
              Use real sign-in / register →
            </Link>
          </div>
          <Link to="/dev-login"
            className="inline-flex items-center gap-1.5 text-[11px] text-neutral-700 hover:text-violet-400 transition-colors">
            <Terminal size={10} /> Dev access
          </Link>
        </div>
      </div>
    </div>
  );
}
