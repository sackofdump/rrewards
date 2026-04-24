import { useState } from 'react';
import { createPortal } from 'react-dom';
import { restaurantDetails } from '../data/mockData';
import { usePromotionsStore } from '../hooks/usePromotionsStore';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import { MapPin, Phone, Clock, Star, ChevronRight, X, Percent, Heart, Trash2 } from 'lucide-react';

function PromoChip({ promo }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-1">
      <Percent size={10} />
      {Math.round(promo.rewardRate * 100)}% back · ends{' '}
      {new Date(promo.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
    </span>
  );
}

function DetailSheet({ restaurant, onClose }) {
  const { user } = useAuth();
  const { promos } = usePromotionsStore();
  const { getByRestaurant, removeFavorite } = useFavorites(user?.id);
  const favorites = getByRestaurant(restaurant.id);
  const promo = promos.find(p => p.restaurantId === restaurant.id && p.active);
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg bg-[#0f0f18] border border-white/8 rounded-t-3xl overflow-hidden">
        {/* Header */}
        <div className="relative px-6 pt-8 pb-5"
          style={{ background: 'linear-gradient(135deg, #1a1506 0%, #1e1a08 100%)' }}>
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/8 flex items-center justify-center text-neutral-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{restaurant.logo}</span>
            <div>
              <h2 className="text-xl font-bold text-white">{restaurant.name}</h2>
              <p className="text-sm text-amber-300/60">{restaurant.cuisine}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold text-amber-400">{restaurant.rating}</span>
                <span className="text-xs text-neutral-500">({restaurant.reviews} reviews)</span>
              </div>
            </div>
          </div>
          {promo && <div className="mt-4"><PromoChip promo={promo} /></div>}
        </div>

        <div className="px-6 py-5 space-y-4 pb-10 max-h-[60vh] overflow-y-auto">
          <p className="text-sm text-neutral-400 leading-relaxed">{restaurant.description}</p>

          <div className="space-y-3">
            {[
              { icon: MapPin,  text: restaurant.address },
              { icon: Phone,   text: restaurant.phone   },
              { icon: Clock,   text: restaurant.hours   },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <Icon size={15} className="text-neutral-500 shrink-0 mt-0.5" />
                <p className="text-sm text-neutral-300 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          {/* Favorites */}
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-2">
              <Heart size={13} className="text-rose-400" fill="currentColor" />
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                My Favorites ({favorites.length})
              </p>
            </div>
            {favorites.length === 0 ? (
              <div className="glass rounded-xl p-3 text-xs text-neutral-500 text-center">
                No favorites here yet — tap the heart on items in your order history.
              </div>
            ) : (
              <div className="space-y-1.5">
                {favorites.map(f => (
                  <div key={f.id} className="group flex items-center gap-2 glass rounded-xl px-3 py-2">
                    <Heart size={11} className="text-rose-400 shrink-0" fill="currentColor" />
                    <span className="text-sm text-white flex-1 truncate">{f.name}</span>
                    <span className="text-xs text-amber-400 font-semibold shrink-0">${f.price.toFixed(2)}</span>
                    <button onClick={() => removeFavorite(f.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-600 hover:text-red-400 shrink-0 p-1">
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="w-full gradient-gold text-black font-bold py-3.5 rounded-xl text-sm hover:opacity-90 transition-opacity mt-2">
            Get Directions
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function RestaurantCard({ restaurant, onClick }) {
  const { user } = useAuth();
  const { promos } = usePromotionsStore();
  const { getByRestaurant } = useFavorites(user?.id);
  const favorites = getByRestaurant(restaurant.id);
  const promo = promos.find(p => p.restaurantId === restaurant.id && p.active);
  return (
    <button onClick={onClick}
      className="w-full glass rounded-2xl p-4 flex items-center gap-4 text-left hover:brightness-110 transition-all">
      <div className="w-14 h-14 rounded-2xl bg-neutral-800/80 flex items-center justify-center text-3xl shrink-0">
        {restaurant.logo}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white text-base leading-tight">{restaurant.name}</p>
        <p className="text-xs text-neutral-500 mt-0.5">{restaurant.cuisine}</p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <div className="flex items-center gap-1">
            <Star size={11} className="text-amber-400 fill-amber-400" />
            <span className="text-xs font-semibold text-amber-400">{restaurant.rating}</span>
          </div>
          {favorites.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-full px-2 py-0.5">
              <Heart size={9} fill="currentColor" /> {favorites.length}
            </span>
          )}
          {promo && <PromoChip promo={promo} />}
        </div>
      </div>
      <ChevronRight size={18} className="text-neutral-600 shrink-0" />
    </button>
  );
}

export default function Restaurants() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
      <div className="mb-6">
        <p className="text-xs text-neutral-500 uppercase tracking-widest font-medium mb-1">Rewards Group</p>
        <h1 className="text-2xl font-bold text-white tracking-tight">Restaurants</h1>
      </div>

      <div className="glass rounded-2xl p-4 mb-6">
        <p className="text-xs text-neutral-400 leading-relaxed">
          Earn rewards at any location below. Your balance carries across all restaurants in the group.
        </p>
      </div>

      <div className="space-y-3">
        {restaurantDetails.map(r => (
          <RestaurantCard key={r.id} restaurant={r} onClick={() => setSelected(r)} />
        ))}
      </div>

      {selected && <DetailSheet restaurant={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
