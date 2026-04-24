import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

import { tierConfig, orders } from '../data/mockData';
import { User, Mail, Phone, Star, Utensils, Gift, Cake, Users, ChevronRight, Lock, AlertTriangle, X } from 'lucide-react';

function BirthdayModal({ onClose, onSave }) {
  const [date, setDate] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  function submit(e) {
    e.preventDefault();
    if (!date || !confirmed) return;
    onSave(date);
    onClose();
  }

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md bg-[#0f0f18] border border-white/8 rounded-t-3xl sm:rounded-3xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cake size={16} className="text-pink-400" /> Set Your Birthday
          </h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 px-4 py-3 mb-4 flex items-start gap-2.5">
          <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">This can only be set once</p>
            <p className="text-xs text-neutral-300 leading-relaxed">
              To prevent abuse of the birthday bonus, your birthday cannot be changed after it's set. Double-check the date before saving.
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Date of Birth</label>
            <input required type="date" value={date} onChange={e => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full bg-neutral-900 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-pink-400/50 transition-colors" />
          </div>

          <label className="flex items-start gap-2 cursor-pointer pt-1">
            <input type="checkbox" required checked={confirmed} onChange={e => setConfirmed(e.target.checked)}
              className="mt-0.5 accent-amber-500" />
            <span className="text-xs text-neutral-400 leading-relaxed">
              I confirm this is my correct birthday and understand it <span className="text-white font-semibold">cannot be changed</span> after this.
            </span>
          </label>

          <button type="submit" disabled={!date || !confirmed}
            className="w-full gradient-gold text-black font-bold py-3 rounded-xl text-sm mt-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">
            Save Birthday
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default function Profile() {
  const { user: currentUser, logout } = useAuth();
  const { rewardRate, referralBonus } = useSettings();
  const navigate = useNavigate();
  const tier = tierConfig[currentUser.tier];
  const nextTier ={ Bronze: 'Silver', Silver: 'Gold', Gold: 'Platinum', Platinum: null }[currentUser.tier];
  const [showBirthdayModal, setShowBirthdayModal] = useState(false);
  const [birthday, setBirthday] = useState(() => {
    // Load from localStorage; falls back to mock data birthday
    try {
      const stored = localStorage.getItem(`rr_birthday_${currentUser.id}`);
      return stored || currentUser.birthday || null;
    } catch { return currentUser.birthday || null; }
  });

  function handleSetBirthday(dateStr) {
    try { localStorage.setItem(`rr_birthday_${currentUser.id}`, dateStr); } catch {}
    setBirthday(dateStr);
  }

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
      <div className="pt-4 mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Account</h1>
      </div>

      <div className="glass rounded-2xl p-5 mb-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center text-black font-bold text-xl shrink-0">
          {currentUser.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold text-white">{currentUser.name}</p>
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full inline-block mt-1"
            style={{ color: tier.color, background: tier.bg, border: `1px solid ${tier.color}44` }}>
            {currentUser.tier} Member
          </span>
        </div>
      </div>

      <Link to="/referrals"
        className="w-full glass-gold rounded-2xl p-4 mb-4 flex items-center gap-3 hover:brightness-110 transition-all">
        <div className="w-11 h-11 rounded-xl gradient-gold flex items-center justify-center shrink-0">
          <Users size={18} className="text-black" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold text-white">Refer Friends</p>
          <p className="text-xs text-amber-300/70 mt-0.5">Give ${referralBonus} · Get ${referralBonus}</p>
        </div>
        <ChevronRight size={16} className="text-amber-300/60" />
      </Link>

      <div className="glass rounded-2xl p-4 mb-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Contact Info</p>
        {[
          { icon: Mail,  label: 'Email',  value: currentUser.email },
          { icon: Phone, label: 'Phone',  value: currentUser.phone },
          { icon: User,  label: 'Member Since', value: new Date(currentUser.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3">
            <Icon size={16} className="text-neutral-500 shrink-0" />
            <div>
              <p className="text-xs text-neutral-500">{label}</p>
              <p className="text-sm text-white font-medium">{value}</p>
            </div>
          </div>
        ))}

        {/* Birthday — once-only */}
        <div className="flex items-center gap-3">
          <Cake size={16} className="text-neutral-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-neutral-500">Birthday</p>
            {birthday ? (
              <div className="flex items-center gap-1.5">
                <p className="text-sm text-white font-medium">
                  {new Date(birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </p>
                <Lock size={10} className="text-neutral-600" />
              </div>
            ) : (
              <button onClick={() => setShowBirthdayModal(true)}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors">
                Set birthday + unlock bonus →
              </button>
            )}
          </div>
        </div>
      </div>

      {showBirthdayModal && (
        <BirthdayModal onClose={() => setShowBirthdayModal(false)} onSave={handleSetBirthday} />
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { icon: Gift,     label: 'Rewards Balance', value: `$${currentUser.rewardsBalance.toFixed(2)}`, accent: true },
          { icon: Star,     label: 'Earn Rate',        value: `${rewardRate * 100}%`,                   accent: false },
          { icon: Utensils, label: 'Total Visits',     value: orders.filter(o => o.userId === currentUser.id).length, accent: false },
          { icon: Star,     label: 'Lifetime Spend',   value: `$${currentUser.lifetimeSpend.toFixed(0)}`, accent: false },
        ].map(({ icon: Icon, label, value, accent }) => (
          <div key={label} className={`rounded-2xl p-4 ${accent ? 'glass-gold' : 'glass'}`}>
            <Icon size={16} className={accent ? 'text-amber-400 mb-2' : 'text-neutral-500 mb-2'} strokeWidth={1.8} />
            <p className={`text-xl font-bold ${accent ? 'text-amber-400' : 'text-white'}`}>{value}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {nextTier && (
        <div className="glass rounded-2xl p-4 mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Tier Progress</p>
          <p className="text-sm text-neutral-300 mb-3">
            Spend <span className="text-white font-semibold">${(tierConfig[nextTier].min - currentUser.lifetimeSpend).toFixed(0)}</span> more to unlock{' '}
            <span className="font-semibold" style={{ color: tierConfig[nextTier].color }}>{nextTier}</span>
          </p>
          <div className="h-2 rounded-full bg-neutral-800">
            <div className="h-full rounded-full gradient-gold transition-all"
              style={{ width: `${Math.min((currentUser.lifetimeSpend / tierConfig[nextTier].min) * 100, 100)}%` }} />
          </div>
          <div className="flex justify-between text-xs text-neutral-600 mt-1.5">
            <span>$0</span>
            <span>${tierConfig[nextTier].min}</span>
          </div>
        </div>
      )}

      <button
        onClick={() => { logout(); navigate('/login'); }}
        className="w-full py-3.5 rounded-2xl border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/5 transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
}
