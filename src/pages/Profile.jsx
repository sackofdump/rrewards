import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tierConfig, orders, REWARDS_RATE } from '../data/mockData';
import { User, Mail, Phone, Star, Utensils, Gift } from 'lucide-react';

export default function Profile() {
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const tier = tierConfig[currentUser.tier];
  const nextTier ={ Bronze: 'Silver', Silver: 'Gold', Gold: 'Platinum', Platinum: null }[currentUser.tier];

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
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { icon: Gift,     label: 'Rewards Balance', value: `$${currentUser.rewardsBalance.toFixed(2)}`, accent: true },
          { icon: Star,     label: 'Earn Rate',        value: `${REWARDS_RATE * 100}%`,                   accent: false },
          { icon: Utensils, label: 'Total Visits',     value: orders.length,                              accent: false },
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
