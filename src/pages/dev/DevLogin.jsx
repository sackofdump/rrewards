import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Terminal, Lock, AlertCircle } from 'lucide-react';

export default function DevLogin() {
  const { login, error, loading, setError } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login('dev@rewards.com', password, 'devadmin');
      navigate('/dev-admin');
    } catch { /* error shown via context */ }
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-4 py-12"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(120,80,255,0.08) 0%, transparent 60%), #080a0f' }}>

      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <Terminal size={24} className="text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dev Access</h1>
          <p className="text-sm text-neutral-500 mt-1">Restricted area</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle size={15} className="text-red-400 shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
            <input
              type="password" required autoFocus
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="Password"
              className="w-full bg-neutral-900 border border-white/8 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-violet-400/50 focus:bg-neutral-800/60 transition-all"
            />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-violet-500 hover:bg-violet-400 text-white font-bold py-3.5 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Verifying…' : 'Enter'}
          </button>
        </form>

        <button onClick={() => navigate('/login')}
          className="w-full text-center text-xs text-neutral-600 hover:text-neutral-400 transition-colors mt-6">
          ← Back to regular login
        </button>
      </div>
    </div>
  );
}
