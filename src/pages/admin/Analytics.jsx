import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { adminCustomers, orders, restaurants, tierConfig } from '../../data/mockData';
import { useSettings } from '../../context/SettingsContext';
import { ArrowLeft, Shield, TrendingUp, Users, DollarSign, Trophy } from 'lucide-react';

const TIER_COLORS = {
  Bronze: '#cd7f32',
  Silver: '#c0c0c0',
  Gold: '#d4af37',
  Platinum: '#e5e4e2',
};

export default function Analytics() {
  const { rewardRate } = useSettings();

  /* Revenue over time (by week) */
  const revenueByWeek = useMemo(() => {
    const weeks = {};
    orders.forEach(o => {
      const d = new Date(o.date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().slice(0, 10);
      weeks[key] = weeks[key] || { week: key, revenue: 0, rewards: 0, orders: 0 };
      weeks[key].revenue += o.total;
      weeks[key].rewards += o.rewards;
      weeks[key].orders  += 1;
    });
    return Object.values(weeks).sort((a, b) => a.week.localeCompare(b.week)).map(w => ({
      ...w,
      label: new Date(w.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: Math.round(w.revenue),
      rewards: Math.round(w.rewards * 100) / 100,
    }));
  }, []);

  /* Revenue by restaurant */
  const revenueByRestaurant = useMemo(() => {
    return restaurants.map(r => {
      const restaurantOrders = orders.filter(o => o.restaurantId === r.id);
      return {
        name: r.name.length > 14 ? r.name.slice(0, 12) + '…' : r.name,
        revenue: Math.round(restaurantOrders.reduce((s, o) => s + o.total, 0)),
      };
    });
  }, []);

  /* Tier distribution */
  const tierDistribution = useMemo(() => {
    const tiers = { Bronze: 0, Silver: 0, Gold: 0, Platinum: 0 };
    adminCustomers.forEach(c => { tiers[c.tier] = (tiers[c.tier] || 0) + 1; });
    return Object.entries(tiers)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value, color: TIER_COLORS[name] }));
  }, []);

  /* Orders by hour */
  const ordersByHour = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
    orders.forEach(o => {
      const h = new Date(o.date).getHours();
      hours[h].count++;
    });
    return hours.filter(h => h.count > 0).map(h => ({
      label: h.hour === 0 ? '12a' : h.hour < 12 ? `${h.hour}a` : h.hour === 12 ? '12p' : `${h.hour - 12}p`,
      orders: h.count,
    }));
  }, []);

  /* Summary metrics */
  const totalRevenue = adminCustomers.reduce((s, c) => s + c.lifetimeSpend, 0);
  const totalRewards = adminCustomers.reduce((s, c) => s + c.lifetimeEarned, 0);
  const avgOrderValue = orders.length > 0
    ? orders.reduce((s, o) => s + o.total, 0) / orders.length
    : 0;

  return (
    <div className="px-4 pt-6 pb-10 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin" className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-white/8 transition-colors">
          <ArrowLeft size={16} className="text-neutral-400" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <Shield size={12} className="text-amber-400" />
            <p className="text-xs text-amber-400 uppercase tracking-widest font-bold">Admin</p>
          </div>
          <h1 className="text-xl font-bold text-white leading-tight">Analytics</h1>
        </div>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={14} className="text-amber-400" />
            <p className="text-xs text-neutral-500 uppercase tracking-widest font-semibold">Revenue</p>
          </div>
          <p className="text-xl font-bold text-white">${(totalRevenue / 1000).toFixed(1)}k</p>
          <p className="text-xs text-green-400 flex items-center gap-0.5 mt-0.5">
            <TrendingUp size={10} /> all-time
          </p>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-amber-400" />
            <p className="text-xs text-neutral-500 uppercase tracking-widest font-semibold">Members</p>
          </div>
          <p className="text-xl font-bold text-white">{adminCustomers.length}</p>
          <p className="text-xs text-neutral-500 mt-0.5">
            {adminCustomers.filter(c => c.status === 'active').length} active
          </p>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={14} className="text-amber-400" />
            <p className="text-xs text-neutral-500 uppercase tracking-widest font-semibold">Avg Order</p>
          </div>
          <p className="text-xl font-bold text-white">${avgOrderValue.toFixed(0)}</p>
          <p className="text-xs text-neutral-500 mt-0.5">{orders.length} sample orders</p>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={14} className="text-amber-400" />
            <p className="text-xs text-neutral-500 uppercase tracking-widest font-semibold">Rewards</p>
          </div>
          <p className="text-xl font-bold text-white">${totalRewards.toFixed(0)}</p>
          <p className="text-xs text-neutral-500 mt-0.5">
            {(rewardRate * 100).toFixed(1).replace(/\.0$/, '')}% earn rate
          </p>
        </div>
      </div>

      {/* Revenue over time */}
      <div className="glass rounded-2xl p-4 mb-4">
        <h3 className="text-sm font-bold text-white mb-4">Revenue Over Time</h3>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueByWeek} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2028" />
              <XAxis dataKey="label" stroke="#666" fontSize={10} />
              <YAxis stroke="#666" fontSize={10} />
              <Tooltip
                contentStyle={{ background: '#0f0f18', border: '1px solid #333', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#d4af37" strokeWidth={2} dot={{ fill: '#d4af37', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue by restaurant */}
      <div className="glass rounded-2xl p-4 mb-4">
        <h3 className="text-sm font-bold text-white mb-4">Revenue by Location</h3>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueByRestaurant} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2028" />
              <XAxis dataKey="name" stroke="#666" fontSize={10} />
              <YAxis stroke="#666" fontSize={10} />
              <Tooltip
                contentStyle={{ background: '#0f0f18', border: '1px solid #333', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="revenue" fill="#d4af37" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tier distribution */}
      <div className="glass rounded-2xl p-4 mb-4">
        <h3 className="text-sm font-bold text-white mb-4">Member Tiers</h3>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={tierDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%"
                outerRadius={70} innerRadius={35}
                label={({ name, value }) => `${name} (${value})`}
                labelLine={false}
                fontSize={11}
              >
                {tierDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#0f0f18', border: '1px solid #333', borderRadius: 8, fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders by hour */}
      <div className="glass rounded-2xl p-4 mb-4">
        <h3 className="text-sm font-bold text-white mb-4">Peak Hours</h3>
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ordersByHour} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2028" />
              <XAxis dataKey="label" stroke="#666" fontSize={10} />
              <YAxis stroke="#666" fontSize={10} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#0f0f18', border: '1px solid #333', borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="orders" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
