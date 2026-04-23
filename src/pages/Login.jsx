import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login, error, loading, setError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch {
      // error already set in context
    }
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-4 py-12"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.08) 0%, transparent 60%), #080a0f' }}>

      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl gradient-gold flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-900/30">
            <span className="text-2xl font-black text-black">P</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Rewards</h1>
          <p className="text-sm text-neutral-500 mt-1">Sign in to your rewards account</p>
        </div>

        {/* Demo hint */}
        <div className="glass rounded-xl px-4 py-3 mb-6 flex items-start gap-2.5">
          <span className="text-amber-400 shrink-0 mt-0.5">💡</span>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Demo: use <span className="text-white font-medium">joshe@email.com</span> with password{' '}
            <span className="text-white font-medium">password123</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle size={15} className="text-red-400 shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="Email address"
              className="w-full bg-neutral-900 border border-white/8 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-amber-500/50 focus:bg-neutral-800/60 transition-all"
            />
          </div>

          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="Password"
              className="w-full bg-neutral-900 border border-white/8 rounded-xl pl-11 pr-12 py-3.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-amber-500/50 focus:bg-neutral-800/60 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPass(s => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="flex justify-end">
            <button type="button" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-gold text-black font-bold py-3.5 rounded-xl text-sm transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-600 mt-8">
          New to Rewards?{' '}
          <button className="text-amber-400 hover:text-amber-300 transition-colors font-medium">
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}
