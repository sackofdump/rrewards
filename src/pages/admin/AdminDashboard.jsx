import { useState } from 'react';
import { Link } from 'react-router-dom';
import { adminCustomers, restaurants, tierConfig, REWARDS_RATE } from '../../data/mockData';
import { Search, Users, TrendingUp, DollarSign, ChevronRight, Shield } from 'lucide-react';

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className="text-amber-400" strokeWidth={1.8} />
        <span className="text-xs text-neutral-500 uppercase tracking-widest font-semibold">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-neutral-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function CustomerRow({ customer }) {
  const tier = tierConfig[customer.tier];
  return (
    <Link to={`/admin/customers/${customer.id}`}
      className="flex items-center gap-3 py-3.5 border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors px-4">
      <div className="w-9 h-9 rounded-full gradient-gold flex items-center justify-center text-black font-bold text-xs shrink-0">
        {customer.name.split(' ').map(n => n[0]).join('')}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-white truncate">{customer.name}</p>
          <span className="text-xs px-1.5 py-0.5 rounded-full shrink-0"
            style={{ color: tier.color, background: tier.bg, border: `1px solid ${tier.color}33` }}>
            {customer.tier}
          </span>
        </div>
        <p className="text-xs text-neutral-500 truncate">{customer.email}</p>
      </div>
      <div className="text-right shrink-0 mr-1">
        <p className="text-sm font-semibold text-amber-400">${customer.rewardsBalance.toFixed(2)}</p>
        <p className="text-xs text-neutral-500">{customer.orders} visits</p>
      </div>
      <ChevronRight size={14} className="text-neutral-600 shrink-0" />
    </Link>
  );
}

export default function AdminDashboard() {
  const [search, setSearch] = useState('');

  const totalBalance = adminCustomers.reduce((s, c) => s + c.rewardsBalance, 0);
  const totalSpend   = adminCustomers.reduce((s, c) => s + c.lifetimeSpend, 0);
  const activeCount  = adminCustomers.filter(c => c.status === 'active').length;

  const filtered = adminCustomers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 pt-6 pb-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={14} className="text-amber-400" />
            <p className="text-xs text-amber-400 uppercase tracking-widest font-bold">Admin Panel</p>
          </div>
          <h1 className="text-2xl font-bold text-white">Rewards</h1>
        </div>
        <Link to="/" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
          ← Customer View
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard icon={Users}      label="Members"        value={adminCustomers.length}      sub={`${activeCount} active`} />
        <StatCard icon={DollarSign} label="Rewards Out"    value={`$${totalBalance.toFixed(2)}`} sub="pending redemption" />
        <StatCard icon={TrendingUp} label="Total Spend"    value={`$${(totalSpend/1000).toFixed(1)}k`} sub="all time" />
        <StatCard icon={DollarSign} label="Reward Rate"    value={`${REWARDS_RATE * 100}%`}   sub="standard cashback" />
      </div>

      <div className="mb-3">
        <p className="text-xs uppercase tracking-widest font-bold text-neutral-500 mb-3">Restaurants in Group</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {restaurants.map(r => (
            <div key={r.id} className="glass rounded-xl px-3 py-2 flex items-center gap-2 shrink-0">
              <span>{r.logo}</span>
              <span className="text-xs text-white font-medium whitespace-nowrap">{r.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden mt-6">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-white flex-1">Customers</h2>
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-neutral-800/60 border border-white/8 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-amber-500/40 transition-colors"
              />
            </div>
          </div>
        </div>
        {filtered.map(c => <CustomerRow key={c.id} customer={c} />)}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-neutral-600 py-8">No customers found</p>
        )}
      </div>
    </div>
  );
}
