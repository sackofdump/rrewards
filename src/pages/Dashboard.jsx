import { Link } from 'react-router-dom';
import { ChevronRight, Flame, TrendingUp, Star } from 'lucide-react';
import { currentUser, orders, restaurants, promotions, tierConfig, REWARDS_RATE } from '../data/mockData';

function RewardsCard() {
  const tier = tierConfig[currentUser.tier];
  const nextTier = { Bronze: 'Silver', Silver: 'Gold', Gold: 'Platinum', Platinum: null }[currentUser.tier];
  const nextMin = nextTier ? tierConfig[nextTier].min : null;
  const progress = nextMin
    ? Math.min((currentUser.lifetimeSpend / nextMin) * 100, 100)
    : 100;

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 mb-6"
      style={{ background: 'linear-gradient(135deg, #1a1506 0%, #2d2208 60%, #1a1200 100%)', border: '1px solid rgba(212,175,55,0.3)' }}>
      <div className="absolute inset-0 opacity-20"
        style={{ background: 'radial-gradient(ellipse at 80% 20%, #d4af37 0%, transparent 60%)' }} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-amber-300/70 uppercase tracking-widest font-semibold mb-1">Available Rewards</p>
            <p className="text-5xl font-bold text-white tracking-tight">
              ${currentUser.rewardsBalance.toFixed(2)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{ color: tier.color, background: tier.bg, border: `1px solid ${tier.color}55` }}>
              {currentUser.tier}
            </span>
            <span className="text-xs text-amber-300/50">Member since {new Date(currentUser.memberSince).getFullYear()}</span>
          </div>
        </div>

        <p className="text-sm text-amber-300/60 mb-4">
          Welcome back, <span className="text-amber-200 font-medium">{currentUser.name.split(' ')[0]}</span>
        </p>

        {nextTier && (
          <div>
            <div className="flex justify-between text-xs text-amber-300/50 mb-1.5">
              <span>${currentUser.lifetimeSpend.toFixed(0)} lifetime spend</span>
              <span>${nextMin} for {nextTier}</span>
            </div>
            <div className="h-1.5 rounded-full bg-black/40">
              <div className="h-full rounded-full gradient-gold transition-all"
                style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
        {!nextTier && (
          <p className="text-xs text-amber-300/60 flex items-center gap-1">
            <Star size={12} /> You've reached our highest tier
          </p>
        )}
      </div>
    </div>
  );
}

function StatPill({ icon: Icon, label, value }) {
  return (
    <div className="glass rounded-xl p-4 flex-1 flex flex-col gap-1">
      <Icon size={16} className="text-amber-400 mb-0.5" strokeWidth={1.8} />
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  );
}

function RecentOrder({ order }) {
  const restaurant = restaurants.find(r => r.id === order.restaurantId);
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
      <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-xl shrink-0">
        {restaurant.logo}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{restaurant.name}</p>
        <p className="text-xs text-neutral-500">{new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-medium text-white">${order.total.toFixed(2)}</p>
        <p className="text-xs text-amber-400">+${order.rewards.toFixed(2)}</p>
      </div>
    </div>
  );
}

function ActivePromo() {
  const promo = promotions.find(p => p.active);
  if (!promo) return null;
  const restaurant = restaurants.find(r => r.id === promo.restaurantId);
  return (
    <Link to="/promos" className={`block relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r ${promo.color} mb-6`}>
      <div className="absolute inset-0 opacity-30"
        style={{ background: 'radial-gradient(ellipse at 0% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)' }} />
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame size={14} className="text-yellow-200" />
            <span className="text-xs font-bold text-yellow-100 uppercase tracking-widest">Active Promo</span>
          </div>
          <p className="font-bold text-white text-base leading-tight">{promo.title}</p>
          <p className="text-sm text-white/70 mt-0.5">{restaurant.logo} {restaurant.name} &nbsp;·&nbsp; {Math.round(promo.rewardRate * 100)}% back</p>
        </div>
        <ChevronRight size={20} className="text-white/60 shrink-0" />
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const recentOrders = orders.slice(0, 3);

  return (
    <div className="px-4 pt-14 pb-24 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6 pt-4">
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-widest font-medium">Restaurant Group</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">Prestige Dining</h1>
        </div>
        <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center text-black font-bold text-sm">
          {currentUser.name.split(' ').map(n => n[0]).join('')}
        </div>
      </div>

      <RewardsCard />

      <div className="flex gap-3 mb-6">
        <StatPill icon={TrendingUp} label="Lifetime Spend" value={`$${currentUser.lifetimeSpend.toFixed(0)}`} />
        <StatPill icon={Star}       label="Total Earned"   value={`$${currentUser.lifetimeEarned.toFixed(2)}`} />
        <StatPill icon={Flame}      label="Earn Rate"      value={`${REWARDS_RATE * 100}%`} />
      </div>

      <ActivePromo />

      <div className="glass rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-white">Recent Orders</h2>
          <Link to="/history" className="text-xs text-amber-400 font-medium">See all</Link>
        </div>
        {recentOrders.map(o => <RecentOrder key={o.id} order={o} />)}
      </div>
    </div>
  );
}
