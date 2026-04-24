import { useState } from 'react';
import { Link } from 'react-router-dom';
import { adminCustomers, restaurants, tierConfig } from '../../data/mockData';
import { useMenuStore } from '../../hooks/useMenuStore';
import { useSettings } from '../../context/SettingsContext';
import { useCustomerStats } from '../../hooks/useCustomerStats';
import { exportCustomersCSV, exportOrdersCSV } from '../../utils/generateCSV';
import { useActivityLog } from '../../hooks/useActivityLog';
import { Search, Users, TrendingUp, DollarSign, ChevronRight, Shield, UtensilsCrossed, Download, Flame, Settings as SettingsIcon, BarChart3, FileSpreadsheet, Target, ShieldAlert, UserCog } from 'lucide-react';

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
  const { items: menuItems } = useMenuStore();
  const { rewardRate } = useSettings();
  const { entries } = useActivityLog();
  const { get } = useCustomerStats();
  const staffAnomalies = entries.filter(e => e.actorRole === 'staff' && e.anomaly).length;
  // Merge in live stats overrides so balances reflect staff transactions
  const liveCustomers = adminCustomers.map(c => ({ ...c, ...(get(c.id) || {}) }));

  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      const { generateReport } = await import('../../utils/generateReport');
      generateReport(menuItems, rewardRate);
    } finally {
      setDownloading(false);
    }
  }

  const totalBalance = liveCustomers.reduce((s, c) => s + c.rewardsBalance, 0);
  const totalSpend   = liveCustomers.reduce((s, c) => s + c.lifetimeSpend, 0);
  const activeCount  = liveCustomers.filter(c => c.status === 'active').length;

  const filtered = liveCustomers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 pt-6 pb-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={14} className="text-amber-400" />
            <p className="text-xs text-amber-400 uppercase tracking-widest font-bold">Manager Panel</p>
          </div>
          <h1 className="text-2xl font-bold text-white">Restaurant Rewards</h1>
        </div>
        <Link to="/" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
          ← Customer View
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard icon={Users}      label="Members"        value={liveCustomers.length}      sub={`${activeCount} active`} />
        <StatCard icon={DollarSign} label="Rewards Out"    value={`$${totalBalance.toFixed(2)}`} sub="pending redemption" />
        <StatCard icon={TrendingUp} label="Total Spend"    value={`$${(totalSpend/1000).toFixed(1)}k`} sub="all time" />
        <StatCard icon={DollarSign} label="Reward Rate"    value={`${rewardRate * 100}%`}   sub="standard cashback" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <Link to="/admin/menu"
          className="glass rounded-2xl p-4 flex items-center gap-3 hover:bg-white/5 transition-all">
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
            <UtensilsCrossed size={18} className="text-amber-400" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-bold text-white">Menu Management</p>
            <p className="text-xs text-neutral-500 mt-0.5">Add, edit & import items</p>
          </div>
          <ChevronRight size={16} className="text-neutral-500 shrink-0" />
        </Link>

        <Link to="/admin/promotions"
          className="glass rounded-2xl p-4 flex items-center gap-3 hover:bg-white/5 transition-all">
          <div className="w-11 h-11 rounded-xl bg-rose-500/15 border border-rose-400/25 flex items-center justify-center shrink-0">
            <Flame size={18} className="text-rose-400" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-bold text-white">Promotions</p>
            <p className="text-xs text-neutral-500 mt-0.5">Create & manage promos</p>
          </div>
          <ChevronRight size={16} className="text-neutral-500 shrink-0" />
        </Link>

        <Link to="/admin/challenges"
          className="glass rounded-2xl p-4 flex items-center gap-3 hover:bg-white/5 transition-all">
          <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center shrink-0">
            <Target size={18} className="text-blue-400" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-bold text-white">Challenges</p>
            <p className="text-xs text-neutral-500 mt-0.5">Monthly customer goals</p>
          </div>
          <ChevronRight size={16} className="text-neutral-500 shrink-0" />
        </Link>

        <Link to="/admin/analytics"
          className="glass rounded-2xl p-4 flex items-center gap-3 hover:bg-white/5 transition-all">
          <div className="w-11 h-11 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center shrink-0">
            <BarChart3 size={18} className="text-violet-400" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-bold text-white">Analytics</p>
            <p className="text-xs text-neutral-500 mt-0.5">Charts & trends</p>
          </div>
          <ChevronRight size={16} className="text-neutral-500 shrink-0" />
        </Link>

        <Link to="/admin/activity"
          className={`glass rounded-2xl p-4 flex items-center gap-3 hover:bg-white/5 transition-all ${
            staffAnomalies > 0 ? 'border-red-500/30 bg-red-500/[0.03]' : ''
          }`}>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            staffAnomalies > 0
              ? 'bg-red-500/15 border border-red-500/30'
              : 'bg-green-500/10 border border-green-500/25'
          }`}>
            <ShieldAlert size={18} className={staffAnomalies > 0 ? 'text-red-400' : 'text-green-400'} />
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-white">Activity Log</p>
              {staffAnomalies > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-300">
                  {staffAnomalies}
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              {staffAnomalies > 0 ? 'Anomalies detected' : 'No alerts'}
            </p>
          </div>
          <ChevronRight size={16} className="text-neutral-500 shrink-0" />
        </Link>

        <Link to="/admin/staff"
          className="glass rounded-2xl p-4 flex items-center gap-3 hover:bg-white/5 transition-all">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center shrink-0">
            <UserCog size={18} className="text-cyan-400" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-bold text-white">Staff</p>
            <p className="text-xs text-neutral-500 mt-0.5">Add & manage staff</p>
          </div>
          <ChevronRight size={16} className="text-neutral-500 shrink-0" />
        </Link>

        <Link to="/admin/settings"
          className="glass rounded-2xl p-4 flex items-center gap-3 hover:bg-white/5 transition-all">
          <div className="w-11 h-11 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center shrink-0">
            <SettingsIcon size={18} className="text-neutral-300" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-bold text-white">Settings</p>
            <p className="text-xs text-neutral-500 mt-0.5">Reward & tax rate</p>
          </div>
          <ChevronRight size={16} className="text-neutral-500 shrink-0" />
        </Link>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <button onClick={handleDownload} disabled={downloading}
          className="glass rounded-xl p-3 flex items-center gap-2 hover:bg-white/5 transition-all text-left disabled:opacity-60">
          {downloading
            ? <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin shrink-0" />
            : <Download size={15} className="text-amber-400 shrink-0" />}
          <span className="text-xs font-semibold text-white">{downloading ? 'Generating…' : 'PDF Report'}</span>
        </button>
        <button onClick={exportCustomersCSV}
          className="glass rounded-xl p-3 flex items-center gap-2 hover:bg-white/5 transition-all">
          <FileSpreadsheet size={15} className="text-green-400 shrink-0" />
          <span className="text-xs font-semibold text-white">Export Customers</span>
        </button>
        <button onClick={exportOrdersCSV}
          className="glass rounded-xl p-3 flex items-center gap-2 hover:bg-white/5 transition-all">
          <FileSpreadsheet size={15} className="text-green-400 shrink-0" />
          <span className="text-xs font-semibold text-white">Export Orders</span>
        </button>
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
