import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminCustomers, restaurants, tierConfig } from '../../data/mockData';
import { useSettings } from '../../context/SettingsContext';
import { useOrderStore } from '../../hooks/useOrderStore';
import { useCustomerStats } from '../../hooks/useCustomerStats';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { useActivityLog } from '../../hooks/useActivityLog';
import {
  ArrowLeft, Mail, Phone, Calendar, Plus, Minus, Check, Edit2, Ban, RefreshCw,
  ChevronDown, ChevronUp, Receipt, Clock, Star, User as UserIcon, Send, X, MessageSquare
} from 'lucide-react';

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
  };
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${styles[variant]}`}>
      <Icon size={14} />
      {label}
    </button>
  );
}

function formatDateTime(iso) {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return { date, time };
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const restaurant = restaurants.find(r => r.id === order.restaurantId);
  const { date, time } = formatDateTime(order.date);

  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/2 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-neutral-800/80 flex items-center justify-center text-xl shrink-0">
          {restaurant?.logo ?? '🍽️'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{restaurant?.name ?? 'Unknown'}</p>
          <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-0.5">
            <span>{date}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Clock size={9} /> {time}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-white">${order.total.toFixed(2)}</p>
          <p className="text-[11px] text-amber-400 font-medium">+${order.rewards.toFixed(2)}</p>
        </div>
        {expanded
          ? <ChevronUp size={14} className="text-neutral-600 shrink-0" />
          : <ChevronDown size={14} className="text-neutral-600 shrink-0" />
        }
      </button>

      {expanded && (
        <div className="px-3 pb-3 border-t border-white/5 pt-3 space-y-3 text-xs">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Items ({order.items.reduce((s, i) => s + i.qty, 0)})</p>
            <div className="space-y-1.5">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-neutral-800 text-[10px] text-neutral-400 flex items-center justify-center font-bold shrink-0">
                    {item.qty}
                  </span>
                  <span className="text-neutral-300 flex-1 truncate">{item.name}</span>
                  <span className="text-neutral-500">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 space-y-1">
            <div className="flex justify-between text-neutral-500"><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-neutral-500"><span>Tax</span><span>${order.tax.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-white pt-1 border-t border-white/5"><span>Total</span><span>${order.total.toFixed(2)}</span></div>
            <div className="flex justify-between text-amber-400 font-semibold">
              <span className="flex items-center gap-1"><Star size={10} /> Rewards earned</span>
              <span>+${order.rewards.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-neutral-600">
            <span>Order #{order.id}</span>
            {order.server && (
              <span className="flex items-center gap-1"><UserIcon size={10} /> {order.server}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MessageModal({ customer, onClose, onSend }) {
  const [title, setTitle] = useState('');
  const [body, setBody]   = useState('');

  function submit(e) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    onSend({ title: title.trim(), body: body.trim() });
    onClose();
  }

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg bg-[#0f0f18] border border-white/8 rounded-t-3xl sm:rounded-3xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-amber-400" />
            <h2 className="text-base font-bold text-white">Message {customer.name}</h2>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input required value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Subject (e.g. Exclusive offer for you)"
            className="w-full bg-neutral-900 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-amber-500/50 transition-colors" />
          <textarea required value={body} onChange={e => setBody(e.target.value)}
            placeholder="Message…" rows={4}
            className="w-full bg-neutral-900 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-amber-500/50 transition-colors resize-none" />
          <p className="text-xs text-neutral-500">Sends in-app notification + email. Customer sees this in their Notifications tab.</p>
          <button type="submit"
            className="w-full gradient-gold text-black font-bold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            <Send size={15} /> Send Message
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default function CustomerDetail() {
  const { id } = useParams();
  const { user: actor } = useAuth();
  const { rewardRate } = useSettings();
  const { addNotification } = useNotifications();
  const { logAction } = useActivityLog();
  const { get: getCustomer, applyDelta, setStat } = useCustomerStats();
  const { getByUser } = useOrderStore();
  // Live customer (merges overrides + registered users)
  const customer = getCustomer(id) ?? adminCustomers.find(c => c.id === id);
  const customerOrders = getByUser(id).sort((a, b) => new Date(b.date) - new Date(a.date));
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustNote, setAdjustNote]     = useState('');
  const [adjustSuccess, setAdjustSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'info'
  const [showMessage, setShowMessage]     = useState(false);
  const [messageSent, setMessageSent]     = useState(false);

  function handleSendMessage({ title, body }) {
    addNotification({ userId: customer.id, type: 'message', title, body });
    logAction({
      actorId: actor?.id ?? 'unknown',
      actorName: actor?.name ?? 'Manager',
      actorRole: 'admin',
      action: 'customer.message',
      targetId: customer.id,
      targetName: customer.name,
      amount: null,
      details: { title },
    });
    setMessageSent(true);
    setTimeout(() => setMessageSent(false), 2500);
  }

  if (!customer) return (
    <div className="flex flex-col items-center gap-4 pt-20 text-neutral-500">
      <p>Customer not found</p>
      <Link to="/admin" className="text-amber-400 text-sm">← Back to Admin</Link>
    </div>
  );

  const tier = tierConfig[customer.tier];

  const favRestaurant = (() => {
    const counts = {};
    customerOrders.forEach(o => { counts[o.restaurantId] = (counts[o.restaurantId] || 0) + 1; });
    const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
    return topId ? restaurants.find(r => r.id === Number(topId)) : null;
  })();
  const avgOrder = customerOrders.length > 0
    ? customerOrders.reduce((s, o) => s + o.total, 0) / customerOrders.length
    : 0;

  function handleAdjust(dir) {
    const amt = parseFloat(adjustAmount);
    if (!amt || isNaN(amt)) return;
    const delta = dir === 'add' ? amt : -amt;
    const previousBalance = customer.rewardsBalance;
    const nextBalance = Math.max(0, previousBalance + delta);
    // Use absolute set so we can clamp at 0
    setStat(customer.id, { rewardsBalance: nextBalance });
    logAction({
      actorId: actor?.id ?? 'unknown',
      actorName: actor?.name ?? 'Manager',
      actorRole: 'admin',
      action: 'customer.adjust',
      targetId: customer.id,
      targetName: customer.name,
      amount: delta,
      details: { direction: dir, note: adjustNote || null, previousBalance },
    });
    setAdjustAmount(''); setAdjustNote('');
    setAdjustSuccess(true);
    setTimeout(() => setAdjustSuccess(false), 2000);
  }
  function toggleStatus() {
    const nextStatus = customer.status === 'active' ? 'inactive' : 'active';
    setStat(customer.id, { status: nextStatus });
    logAction({
      actorId: actor?.id ?? 'unknown',
      actorName: actor?.name ?? 'Manager',
      actorRole: 'admin',
      action: nextStatus === 'inactive' ? 'customer.deactivate' : 'customer.activate',
      targetId: customer.id,
      targetName: customer.name,
      amount: null,
      details: { newStatus: nextStatus },
    });
  }

  return (
    <div className="px-4 pt-6 pb-10 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin" className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-white/8 transition-colors">
          <ArrowLeft size={16} className="text-neutral-400" />
        </Link>
        <h1 className="text-lg font-bold text-white">Customer Detail</h1>
      </div>

      {/* Header */}
      <div className="glass rounded-2xl p-5 mb-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center text-black font-bold text-xl shrink-0">
          {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
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

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-xs text-neutral-500 mb-0.5">Lifetime</p>
          <p className="text-sm font-bold text-white">${customer.lifetimeSpend.toFixed(0)}</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-xs text-neutral-500 mb-0.5">Avg Order</p>
          <p className="text-sm font-bold text-white">${avgOrder.toFixed(0)}</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-xs text-neutral-500 mb-0.5">Visits</p>
          <p className="text-sm font-bold text-white">{customer.orders}</p>
        </div>
      </div>

      {favRestaurant && (
        <div className="glass rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2 text-xs text-neutral-400">
          <span className="text-lg">{favRestaurant.logo}</span>
          <span>Most visited: <span className="text-white font-semibold">{favRestaurant.name}</span></span>
        </div>
      )}

      {/* Tabs */}
      <div className="glass rounded-xl p-1 flex mb-4">
        <button onClick={() => setActiveTab('orders')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'orders' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' : 'text-neutral-500'
          }`}>
          <Receipt size={13} /> Order History ({customerOrders.length})
        </button>
        <button onClick={() => setActiveTab('info')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'info' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' : 'text-neutral-500'
          }`}>
          <UserIcon size={13} /> Info & Admin
        </button>
      </div>

      {activeTab === 'orders' && (
        <>
          {customerOrders.length === 0 ? (
            <div className="glass rounded-2xl py-10 flex flex-col items-center gap-2 text-neutral-500 text-sm">
              <Receipt size={28} strokeWidth={1} />
              <p>No detailed orders on file yet</p>
              <p className="text-xs text-neutral-600">Customer has {customer.orders} total visits recorded</p>
            </div>
          ) : (
            <div className="space-y-2">
              {customerOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'info' && (
        <>
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
            <InfoRow label="Last Visit"      value={new Date(customer.lastVisit).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
            <InfoRow label="Lifetime Spend"  value={`$${customer.lifetimeSpend.toFixed(2)}`} />
            <InfoRow label="Lifetime Earned" value={`$${customer.lifetimeEarned.toFixed(2)}`} />
            <InfoRow label="Earn Rate"       value={`${(rewardRate * 100).toFixed(1).replace(/\.0$/, '')}%`} />
          </div>

          <div className="glass rounded-2xl p-4 mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-3">Adjust Rewards</p>
            <div className="flex gap-2 mb-2">
              <input
                type="number" value={adjustAmount}
                onChange={e => setAdjustAmount(e.target.value)}
                placeholder="Amount ($)"
                className="flex-1 bg-neutral-800/60 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-amber-500/40 transition-colors" />
              <button onClick={() => handleAdjust('add')}
                className="px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/25 text-green-400 hover:bg-green-500/20 transition-colors">
                <Plus size={16} />
              </button>
              <button onClick={() => handleAdjust('sub')}
                className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 transition-colors">
                <Minus size={16} />
              </button>
            </div>
            <input value={adjustNote} onChange={e => setAdjustNote(e.target.value)}
              placeholder="Internal note (optional)"
              className="w-full bg-neutral-800/60 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-amber-500/40 transition-colors" />
            {adjustSuccess && (
              <div className="flex items-center gap-2 mt-2 text-xs text-green-400">
                <Check size={12} /> Rewards balance updated
              </div>
            )}
          </div>

          <div className="glass rounded-2xl p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-3">Actions</p>
            <div className="flex flex-wrap gap-2">
              <ActionButton icon={MessageSquare} label={messageSent ? 'Sent!' : 'Send Message'} onClick={() => setShowMessage(true)} />
              <ActionButton icon={Edit2}     label="Edit Profile"    />
              <ActionButton icon={RefreshCw} label="Resend Welcome"  />
              <ActionButton
                icon={customer.status === 'active' ? Ban : Check}
                label={customer.status === 'active' ? 'Deactivate' : 'Reactivate'}
                variant={customer.status === 'active' ? 'danger' : 'success'}
                onClick={toggleStatus}
              />
            </div>
          </div>
        </>
      )}

      {showMessage && (
        <MessageModal customer={customer}
          onSend={handleSendMessage}
          onClose={() => setShowMessage(false)} />
      )}
    </div>
  );
}
