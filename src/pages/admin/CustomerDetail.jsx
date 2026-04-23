import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminCustomers, restaurants, tierConfig, REWARDS_RATE } from '../../data/mockData';
import { ArrowLeft, Mail, Phone, Calendar, Plus, Minus, Check, Edit2, Ban, RefreshCw } from 'lucide-react';

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
      <span className="text-xs text-neutral-500">{label}</span>
      <span className="text-sm text-white font-medium">{value}</span>
    </div>
  );
}

function ActionButton({ icon: Icon, label, variant = 'default', onClick }) {
  const styles = {
    default: 'border-white/8 text-neutral-300 hover:bg-white/5',
    danger:  'border-red-500/25 text-red-400 hover:bg-red-500/8',
    success: 'border-green-500/25 text-green-400 hover:bg-green-500/8',
    gold:    'border-amber-500/30 text-amber-400 hover:bg-amber-500/8',
  };
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${styles[variant]}`}>
      <Icon size={14} />
      {label}
    </button>
  );
}

export default function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(adminCustomers.find(c => c.id === id));
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustNote, setAdjustNote] = useState('');
  const [adjustSuccess, setAdjustSuccess] = useState(false);

  if (!customer) return (
    <div className="flex flex-col items-center gap-4 pt-20 text-neutral-500">
      <p>Customer not found</p>
      <Link to="/admin" className="text-amber-400 text-sm">← Back to Admin</Link>
    </div>
  );

  const tier = tierConfig[customer.tier];

  function handleAdjust(dir) {
    const amt = parseFloat(adjustAmount);
    if (!amt || isNaN(amt)) return;
    setCustomer(c => ({
      ...c,
      rewardsBalance: Math.max(0, c.rewardsBalance + (dir === 'add' ? amt : -amt))
    }));
    setAdjustAmount('');
    setAdjustNote('');
    setAdjustSuccess(true);
    setTimeout(() => setAdjustSuccess(false), 2000);
  }

  function toggleStatus() {
    setCustomer(c => ({ ...c, status: c.status === 'active' ? 'inactive' : 'active' }));
  }

  return (
    <div className="px-4 pt-6 pb-10 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin" className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-white/8 transition-colors">
          <ArrowLeft size={16} className="text-neutral-400" />
        </Link>
        <h1 className="text-lg font-bold text-white">Customer Detail</h1>
      </div>

      <div className="glass rounded-2xl p-5 mb-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center text-black font-bold text-xl shrink-0">
          {customer.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold text-white">{customer.name}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ color: tier.color, background: tier.bg, border: `1px solid ${tier.color}44` }}>
              {customer.tier}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              customer.status === 'active'
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-neutral-700/40 text-neutral-400 border border-neutral-700'
            }`}>
              {customer.status}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-neutral-500">Balance</p>
          <p className="text-2xl font-bold text-amber-400">${customer.rewardsBalance.toFixed(2)}</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-4 mb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Contact</p>
        <div className="space-y-2.5">
          {[
            { icon: Mail, value: customer.email },
            { icon: Phone, value: customer.phone },
            { icon: Calendar, value: `Member since ${new Date(customer.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` },
          ].map(({ icon: Icon, value }) => (
            <div key={value} className="flex items-center gap-2.5">
              <Icon size={14} className="text-neutral-500 shrink-0" />
              <span className="text-sm text-neutral-300">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-4 mb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Stats</p>
        <InfoRow label="Total Visits"    value={customer.orders} />
        <InfoRow label="Last Visit"      value={new Date(customer.lastVisit).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
        <InfoRow label="Lifetime Spend"  value={`$${customer.lifetimeSpend.toFixed(2)}`} />
        <InfoRow label="Lifetime Earned" value={`$${customer.lifetimeEarned.toFixed(2)}`} />
        <InfoRow label="Earn Rate"       value={`${REWARDS_RATE * 100}%`} />
      </div>

      <div className="glass rounded-2xl p-4 mb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-3">Adjust Rewards</p>
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            value={adjustAmount}
            onChange={e => setAdjustAmount(e.target.value)}
            placeholder="Amount ($)"
            className="flex-1 bg-neutral-800/60 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-amber-500/40 transition-colors"
          />
          <button onClick={() => handleAdjust('add')}
            className="px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/25 text-green-400 hover:bg-green-500/20 transition-colors">
            <Plus size={16} />
          </button>
          <button onClick={() => handleAdjust('sub')}
            className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 transition-colors">
            <Minus size={16} />
          </button>
        </div>
        <input
          value={adjustNote}
          onChange={e => setAdjustNote(e.target.value)}
          placeholder="Internal note (optional)"
          className="w-full bg-neutral-800/60 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-amber-500/40 transition-colors"
        />
        {adjustSuccess && (
          <div className="flex items-center gap-2 mt-2 text-xs text-green-400">
            <Check size={12} /> Rewards balance updated
          </div>
        )}
      </div>

      <div className="glass rounded-2xl p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-3">Actions</p>
        <div className="flex flex-wrap gap-2">
          <ActionButton icon={Edit2}     label="Edit Profile"    variant="default" />
          <ActionButton icon={RefreshCw} label="Resend Welcome"  variant="default" />
          <ActionButton
            icon={customer.status === 'active' ? Ban : Check}
            label={customer.status === 'active' ? 'Deactivate' : 'Reactivate'}
            variant={customer.status === 'active' ? 'danger' : 'success'}
            onClick={toggleStatus}
          />
        </div>
      </div>
    </div>
  );
}
