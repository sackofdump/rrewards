import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserStore } from '../hooks/useUserStore';
import { useNotifications } from '../hooks/useNotifications';
import {
  Eye, EyeOff, Mail, Lock, User as UserIcon, Phone,
  AlertCircle, AlertTriangle, Cake, Check, ArrowLeft
} from 'lucide-react';

export default function Register() {
  const { signInAs } = useAuth();
  const { register } = useUserStore();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: details, 2: birthday warning+set, 3: confirm
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [birthday, setBirthday] = useState('');
  const [birthdayConfirmed, setBirthdayConfirmed] = useState(false);
  const [tosAgreed, setTosAgreed] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function nextFromStep1(e) {
    e.preventDefault();
    setError('');
    if (!name.trim())  return setError('Enter your name.');
    if (!email.trim()) return setError('Enter your email.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password !== passwordConfirm) return setError('Passwords don\'t match.');
    setStep(2);
  }

  function handleSkipBirthday() {
    setBirthday('');
    setStep(3);
  }

  function nextFromStep2(e) {
    e.preventDefault();
    setError('');
    if (!birthday) return setError('Enter your date of birth or skip this step.');
    if (!birthdayConfirmed) return setError('Please confirm the date is correct.');
    setStep(3);
  }

  async function submit() {
    setError('');
    if (!tosAgreed) return setError('You must accept the terms to continue.');
    setSubmitting(true);
    try {
      const newUser = register({ name, email, password, phone, birthday });
      signInAs({ ...newUser, role: 'customer' });
      addNotification({
        userId: newUser.id,
        type: 'welcome',
        title: 'Welcome to Restaurant Rewards!',
        body: 'You earn rewards on every visit. Show your QR at checkout to start earning.',
      });
      navigate('/');
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-4 py-10"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.08) 0%, transparent 60%), #080a0f' }}>

      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-6">
          <Link to="/signin" className="w-8 h-8 rounded-full glass flex items-center justify-center text-neutral-400 hover:text-white transition-colors">
            <ArrowLeft size={14} />
          </Link>
          <div className="flex-1">
            <div className="flex gap-1">
              {[1, 2, 3].map(n => (
                <div key={n} className={`h-1 rounded-full flex-1 ${
                  n <= step ? 'bg-amber-500' : 'bg-neutral-800'
                }`} />
              ))}
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Create account</h1>
        <p className="text-sm text-neutral-500 mb-6">Step {step} of 3</p>

        {error && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
            <AlertCircle size={15} className="text-red-400 shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={nextFromStep1} className="space-y-3">
            <div className="relative">
              <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
              <input required value={name} onChange={e => setName(e.target.value)}
                placeholder="Full name"
                className="w-full bg-neutral-900 border border-white/8 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-amber-500/50 transition-colors" />
            </div>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full bg-neutral-900 border border-white/8 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-amber-500/50 transition-colors" />
            </div>
            <div className="relative">
              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="Phone (optional)"
                className="w-full bg-neutral-900 border border-white/8 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-amber-500/50 transition-colors" />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
              <input required type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Password (8+ characters)"
                className="w-full bg-neutral-900 border border-white/8 rounded-xl pl-11 pr-12 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-amber-500/50 transition-colors" />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
              <input required type={showPass ? 'text' : 'password'} value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)}
                placeholder="Confirm password"
                className="w-full bg-neutral-900 border border-white/8 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-amber-500/50 transition-colors" />
            </div>

            <button type="submit"
              className="w-full gradient-gold text-black font-bold py-3.5 rounded-xl text-sm mt-2 hover:opacity-90 transition-opacity">
              Continue
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={nextFromStep2} className="space-y-3">
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 px-4 py-3 flex items-start gap-2.5">
              <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-400 mb-1">Birthday can only be set once</p>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  To prevent abuse of the birthday bonus, your birthday <span className="text-white font-semibold">cannot be changed</span> after this. You can skip for now and set it later.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Date of Birth</label>
              <div className="relative">
                <Cake size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full bg-neutral-900 border border-white/8 rounded-xl pl-11 pr-4 py-3 text-sm text-white outline-none focus:border-amber-500/50 transition-colors" />
              </div>
            </div>

            <label className="flex items-start gap-2 cursor-pointer pt-1">
              <input type="checkbox" checked={birthdayConfirmed}
                onChange={e => setBirthdayConfirmed(e.target.checked)}
                className="mt-0.5 accent-amber-500" />
              <span className="text-xs text-neutral-400 leading-relaxed">
                I confirm this is my correct birthday and understand it cannot be changed.
              </span>
            </label>

            <button type="submit"
              className="w-full gradient-gold text-black font-bold py-3.5 rounded-xl text-sm mt-2 hover:opacity-90 transition-opacity">
              Save Birthday
            </button>
            <button type="button" onClick={handleSkipBirthday}
              className="w-full text-xs text-neutral-500 hover:text-neutral-300 transition-colors py-2">
              Skip for now
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="glass rounded-xl p-4 space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Review</p>
              <Row label="Name"     value={name} />
              <Row label="Email"    value={email} />
              {phone && <Row label="Phone" value={phone} />}
              {birthday ? (
                <Row label="Birthday"
                  value={new Date(birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
              ) : (
                <Row label="Birthday" value={<span className="text-neutral-500">Not set</span>} />
              )}
            </div>

            <label className="flex items-start gap-2 cursor-pointer pt-1">
              <input type="checkbox" checked={tosAgreed}
                onChange={e => setTosAgreed(e.target.checked)}
                className="mt-0.5 accent-amber-500" />
              <span className="text-xs text-neutral-400 leading-relaxed">
                I agree to the <span className="text-amber-400 font-medium">terms of service</span> and <span className="text-amber-400 font-medium">privacy policy</span>.
              </span>
            </label>

            <button onClick={submit} disabled={!tosAgreed || submitting}
              className="w-full gradient-gold text-black font-bold py-3.5 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">
              {submitting ? 'Creating account…' : 'Create Account'}
            </button>

            <button onClick={() => setStep(2)}
              className="w-full text-xs text-neutral-500 hover:text-neutral-300 transition-colors py-1">
              ← Back
            </button>
          </div>
        )}

        <p className="text-center text-xs text-neutral-600 mt-6">
          Already have an account?{' '}
          <Link to="/signin" className="text-amber-400 hover:text-amber-300 transition-colors font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1 text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="text-white font-medium truncate ml-2">{value}</span>
    </div>
  );
}
