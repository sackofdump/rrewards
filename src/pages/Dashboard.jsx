import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Flame, TrendingUp, Star, Bell, Target, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { usePromotionsStore } from '../hooks/usePromotionsStore';
import { useNotifications } from '../hooks/useNotifications';
import { useChallenges } from '../hooks/useChallenges';
import { useOrderStore } from '../hooks/useOrderStore';
import { useCustomerStats } from '../hooks/useCustomerStats';
import { restaurants, tierConfig } from '../data/mockData';

/* Per-tier visual treatment for the main rewards card */
const TIER_THEME = {
  Bronze: {
    bgGradient: 'linear-gradient(135deg, #1a0f05 0%, #2a1808 60%, #1a0d00 100%)',
    borderColor: 'rgba(205,127,50,0.32)',
    radial: '#cd7f32',
    progressGradient: 'linear-gradient(135deg, #a66025 0%, #cd7f32 50%, #8a4e1e 100%)',
    textAccent: '#d69d5e',
    textSoft:   '#cd7f3299',
    textMute:   '#cd7f3266',
  },
  Silver: {
    bgGradient: 'linear-gradient(135deg, #0f1216 0%, #1a1f26 60%, #0d1013 100%)',
    borderColor: 'rgba(192,192,192,0.30)',
    radial: '#c0c0c0',
    progressGradient: 'linear-gradient(135deg, #9aa0a6 0%, #d8d8d8 50%, #8a8e93 100%)',
    textAccent: '#d8d8d8',
    textSoft:   '#c0c0c099',
    textMute:   '#c0c0c066',
  },
  Gold: {
    bgGradient: 'linear-gradient(135deg, #1a1506 0%, #2d2208 60%, #1a1200 100%)',
    borderColor: 'rgba(212,175,55,0.3)',
    radial: '#d4af37',
    progressGradient: 'linear-gradient(135deg, #c9a227 0%, #f0c040 50%, #b8860b 100%)',
    textAccent: '#f0c040',
    textSoft:   '#d4af3799',
    textMute:   '#d4af3766',
  },
  Platinum: {
    bgGradient: 'linear-gradient(135deg, #0d1218 0%, #1a2230 60%, #0b1016 100%)',
    borderColor: 'rgba(229,228,226,0.32)',
    radial: '#e5e4e2',
    progressGradient: 'linear-gradient(135deg, #b8c1cf 0%, #e5e4e2 50%, #9aa4b3 100%)',
    textAccent: '#e5e4e2',
    textSoft:   '#e5e4e299',
    textMute:   '#e5e4e266',
  },
};

// Always derive tier from lifetime spend — avoids any stale DB value.
function computeTierFromSpend(spend = 0) {
  if (spend >= 1500) return 'Platinum';
  if (spend >= 600)  return 'Gold';
  if (spend >= 200)  return 'Silver';
  return 'Bronze';
}

function RewardsCard({ currentUser }) {
  const lifetimeSpend = Number(currentUser.lifetimeSpend ?? 0);
  const tierKey = computeTierFromSpend(lifetimeSpend);
  const tier = tierConfig[tierKey];
  const theme = TIER_THEME[tierKey] ?? TIER_THEME.Bronze;
  const nextTier = { Bronze: 'Silver', Silver: 'Gold', Gold: 'Platinum', Platinum: null }[tierKey];
  const nextMin = nextTier ? tierConfig[nextTier].min : null;
  const progress = nextMin
    ? Math.min((lifetimeSpend / nextMin) * 100, 100)
    : 100;

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 mb-6"
      style={{ background: theme.bgGradient, border: `1px solid ${theme.borderColor}` }}>
      <div className="absolute inset-0 opacity-20"
        style={{ background: `radial-gradient(ellipse at 80% 20%, ${theme.radial} 0%, transparent 60%)` }} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: theme.textSoft }}>
              Available Rewards
            </p>
            <p className="text-5xl font-bold text-white tracking-tight">
              ${Number(currentUser.rewardsBalance ?? 0).toFixed(2)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{ color: tier.color, background: tier.bg, border: `1px solid ${tier.color}55` }}>
              {tierKey}
            </span>
            <span className="text-xs" style={{ color: theme.textMute }}>
              Member since {new Date(currentUser.memberSince).getFullYear()}
            </span>
          </div>
        </div>

        <p className="text-sm mb-4" style={{ color: theme.textSoft }}>
          Welcome back, <span className="font-medium" style={{ color: theme.textAccent }}>{currentUser.name.split(' ')[0]}</span>
        </p>

        {nextTier && (
          <div>
            <div className="flex justify-between text-xs mb-1.5" style={{ color: theme.textMute }}>
              <span>${Number(currentUser.lifetimeSpend ?? 0).toFixed(0)} lifetime spend</span>
              <span>${nextMin} for {nextTier}</span>
            </div>
            <div className="h-1.5 rounded-full bg-black/40">
              <div className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, background: theme.progressGradient }} />
            </div>
          </div>
        )}
        {!nextTier && (
          <p className="text-xs flex items-center gap-1" style={{ color: theme.textSoft }}>
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
  const { promos } = usePromotionsStore();
  const promo = promos.find(p => p.active);
  if (!promo) return null;
  const restaurant = restaurants.find(r => r.id === promo.restaurantId);
  return (
    <Link to="/restaurants" className={`block relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r ${promo.color} mb-6`}>
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
  const { user: authUser, refreshUser } = useAuth();
  const { rewardRate: defaultRate, rateForTier } = useSettings();

  // Pull latest profile on mount in case balance changed while away
  useEffect(() => { refreshUser?.(); }, []);
  const { get } = useCustomerStats();
  const { getByUser } = useOrderStore();
  // Merge live stats (rewardsBalance, lifetime...) into the user object
  const liveStats = authUser ? get(authUser.id) : null;
  const currentUser = liveStats ? { ...authUser, ...liveStats } : authUser;
  const rewardRate = currentUser ? rateForTier(currentUser.tier) : defaultRate;
  const { unreadCount } = useNotifications(currentUser?.id);
  const { challenges } = useChallenges(currentUser?.id);
  const recentOrders = getByUser(currentUser?.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);
  const claimableChallenges = challenges.filter(c => c.completed && !c.claimedAt).length;
  const activeChallenge = challenges.find(c => !c.claimedAt);

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6 pt-4">
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-widest font-medium">Restaurant Group</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">Restaurant Rewards</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/notifications"
            className="relative w-10 h-10 rounded-full glass flex items-center justify-center text-neutral-300 hover:text-white transition-colors">
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full gradient-gold flex items-center justify-center text-[10px] font-bold text-black px-1">
                {unreadCount}
              </span>
            )}
          </Link>
          <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center text-black font-bold text-sm">
            {currentUser.name.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
      </div>

      <RewardsCard currentUser={currentUser} />

      <div className="flex gap-3 mb-6">
        <StatPill icon={TrendingUp} label="Lifetime Spend" value={`$${currentUser.lifetimeSpend.toFixed(0)}`} />
        <StatPill icon={Star}       label="Total Earned"   value={`$${currentUser.lifetimeEarned.toFixed(2)}`} />
        <StatPill icon={Flame}      label="Earn Rate"      value={`${(rewardRate * 100).toFixed(1).replace(/\.0$/, '')}%`} />
      </div>

      <ActivePromo />

      {/* Challenges widget */}
      <Link to="/challenges"
        className="block glass rounded-2xl p-4 mb-4 hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            claimableChallenges > 0
              ? 'bg-amber-500/15 border border-amber-500/30'
              : 'bg-neutral-800/60 border border-white/5'
          }`}>
            {claimableChallenges > 0
              ? <Trophy size={17} className="text-amber-400" />
              : <Target size={17} className="text-neutral-400" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-white">Challenges</p>
              {claimableChallenges > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                  {claimableChallenges} ready
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-0.5 truncate">
              {activeChallenge ? activeChallenge.description : 'All done for this month'}
            </p>
          </div>
          <ChevronRight size={16} className="text-neutral-500 shrink-0" />
        </div>
      </Link>

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
