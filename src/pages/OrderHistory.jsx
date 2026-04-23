import { orders, restaurants } from '../data/mockData';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const restaurant = restaurants.find(r => r.id === order.restaurantId);

  return (
    <div className="glass rounded-2xl overflow-hidden mb-3">
      <button
        className="w-full flex items-center gap-3 p-4 text-left"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="w-11 h-11 rounded-xl bg-neutral-800 flex items-center justify-center text-2xl shrink-0">
          {restaurant.logo}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm">{restaurant.name}</p>
          <p className="text-xs text-neutral-500">
            {new Date(order.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="text-right shrink-0 mr-1">
          <p className="text-sm font-semibold text-white">${order.total.toFixed(2)}</p>
          <p className="text-xs text-amber-400 font-medium">+${order.rewards.toFixed(2)} pts</p>
        </div>
        {expanded
          ? <ChevronUp size={16} className="text-neutral-500 shrink-0" />
          : <ChevronDown size={16} className="text-neutral-500 shrink-0" />
        }
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3">
          <p className="text-xs text-neutral-500 uppercase tracking-widest font-semibold mb-2">Items</p>
          <ul className="space-y-1.5">
            {order.items.map((item, i) => (
              <li key={i} className="text-sm text-neutral-300 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-amber-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-3 border-t border-white/5 flex justify-between text-xs text-neutral-500">
            <span>Order #{order.id}</span>
            <span className="capitalize px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
              {order.status}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderHistory() {
  const sortedOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));
  const totalRewards = orders.reduce((s, o) => s + o.rewards, 0);

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
      <div className="pt-4 mb-6">
        <p className="text-xs text-neutral-500 uppercase tracking-widest font-medium mb-1">All Restaurants</p>
        <h1 className="text-2xl font-bold text-white tracking-tight">Order History</h1>
      </div>

      <div className="glass-gold rounded-2xl p-4 mb-6 flex justify-between items-center">
        <div>
          <p className="text-xs text-amber-300/60 mb-0.5">Total rewards earned</p>
          <p className="text-2xl font-bold text-amber-400">${totalRewards.toFixed(2)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-500 mb-0.5">Visits</p>
          <p className="text-2xl font-bold text-white">{orders.length}</p>
        </div>
      </div>

      {sortedOrders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-neutral-600">
          <Package size={40} strokeWidth={1} />
          <p className="text-sm">No orders yet</p>
        </div>
      ) : (
        sortedOrders.map(order => <OrderCard key={order.id} order={order} />)
      )}
    </div>
  );
}
