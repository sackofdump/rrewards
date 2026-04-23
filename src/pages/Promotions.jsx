import { promotions, restaurants } from '../data/mockData';
import { Flame, CalendarDays, Percent } from 'lucide-react';

function PromoCard({ promo }) {
  const restaurant = restaurants.find(r => r.id === promo.restaurantId);
  const start = new Date(promo.startDate);
  const end = new Date(promo.endDate);
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  const progress = Math.min(100, Math.max(0,
    ((now - start) / (end - start)) * 100
  ));

  return (
    <div className="relative overflow-hidden rounded-2xl mb-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${promo.color} opacity-90`} />
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 10% 80%, rgba(0,0,0,0.3) 0%, transparent 70%)' }} />

      <div className="relative z-10 p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
              {restaurant.logo}
            </div>
            <div>
              <p className="text-xs text-white/60 font-medium">{restaurant.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Flame size={12} className="text-yellow-200" />
                <span className="text-xs font-bold text-yellow-100 uppercase tracking-widest">Active</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
            <Percent size={12} className="text-white" />
            <span className="text-sm font-bold text-white">{Math.round(promo.rewardRate * 100)}% back</span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-1">{promo.title}</h3>
        <p className="text-sm text-white/70 mb-4">{promo.description}</p>

        <div className="flex items-center gap-1.5 text-xs text-white/60 mb-3">
          <CalendarDays size={12} />
          <span>
            {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {' – '}
            {end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="ml-auto font-semibold text-white/80">
            {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
          </span>
        </div>

        <div className="h-1.5 rounded-full bg-black/30">
          <div className="h-full rounded-full bg-white/60 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

export default function Promotions() {
  const active = promotions.filter(p => p.active);
  const upcoming = promotions.filter(p => !p.active);

  return (
    <div className="px-4 pt-14 pb-24 max-w-md mx-auto">
      <div className="pt-4 mb-6">
        <p className="text-xs text-neutral-500 uppercase tracking-widest font-medium mb-1">All Locations</p>
        <h1 className="text-2xl font-bold text-white tracking-tight">Promotions</h1>
      </div>

      <div className="glass rounded-2xl p-4 mb-6">
        <p className="text-xs text-neutral-400 leading-relaxed">
          Special promotions earn you <span className="text-amber-400 font-semibold">bonus rewards</span> on top of your standard 3% at participating restaurants during the promotional period.
        </p>
      </div>

      {active.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Live Now</p>
          </div>
          {active.map(p => <PromoCard key={p.id} promo={p} />)}
        </>
      )}

      {upcoming.length > 0 && (
        <>
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-3 mt-4">Coming Soon</p>
          {upcoming.map(p => <PromoCard key={p.id} promo={p} />)}
        </>
      )}

      {active.length === 0 && upcoming.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-neutral-600">
          <Percent size={40} strokeWidth={1} />
          <p className="text-sm">No promotions right now</p>
        </div>
      )}
    </div>
  );
}
