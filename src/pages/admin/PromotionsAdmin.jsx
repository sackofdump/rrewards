import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { restaurants } from '../../data/mockData';
import { usePromotionsStore } from '../../hooks/usePromotionsStore';
import {
  ArrowLeft, Plus, Edit2, Trash2, X, Check,
  Flame, Shield, Percent, CalendarDays, RotateCcw
} from 'lucide-react';

const COLOR_OPTIONS = [
  { id: 'amber',  label: 'Amber',  value: 'from-amber-700 to-amber-500',   preview: 'bg-gradient-to-r from-amber-700 to-amber-500' },
  { id: 'red',    label: 'Red',    value: 'from-red-800 to-red-600',       preview: 'bg-gradient-to-r from-red-800 to-red-600' },
  { id: 'violet', label: 'Violet', value: 'from-violet-800 to-violet-500', preview: 'bg-gradient-to-r from-violet-800 to-violet-500' },
  { id: 'green',  label: 'Green',  value: 'from-emerald-800 to-emerald-500', preview: 'bg-gradient-to-r from-emerald-800 to-emerald-500' },
  { id: 'blue',   label: 'Blue',   value: 'from-blue-800 to-blue-500',     preview: 'bg-gradient-to-r from-blue-800 to-blue-500' },
  { id: 'rose',   label: 'Rose',   value: 'from-rose-800 to-pink-500',     preview: 'bg-gradient-to-r from-rose-800 to-pink-500' },
];

function PromoModal({ promo, onSave, onClose }) {
  const isEdit = Boolean(promo);
  const [restaurantId, setRestaurantId] = useState(promo?.restaurantId ?? restaurants[0].id);
  const [title, setTitle]       = useState(promo?.title ?? '');
  const [description, setDescription] = useState(promo?.description ?? '');
  const [rate, setRate]         = useState(((promo?.rewardRate ?? 0.10) * 100).toString());
  const [start, setStart]       = useState(promo?.startDate ?? new Date().toISOString().split('T')[0]);
  const [end, setEnd]           = useState(promo?.endDate ?? '');
  const [color, setColor]       = useState(promo?.color ?? COLOR_OPTIONS[0].value);
  const [active, setActive]     = useState(promo?.active ?? true);

  function submit(e) {
    e.preventDefault();
    const numRate = parseFloat(rate);
    if (!title.trim() || isNaN(numRate) || !end) return;
    onSave({
      ...(promo ?? {}),
      restaurantId: Number(restaurantId),
      title: title.trim(),
      description: description.trim(),
      rewardRate: numRate / 100,
      startDate: start,
      endDate: end,
      color, active,
    });
    onClose();
  }

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg bg-[#0f0f18] border border-white/8 rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-white/5 shrink-0">
          <h2 className="text-lg font-bold text-white">{isEdit ? 'Edit Promotion' : 'New Promotion'}</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Restaurant</label>
            <select value={restaurantId} onChange={e => setRestaurantId(e.target.value)}
              className="w-full bg-neutral-900 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500/50 transition-colors">
              {restaurants.map(r => (
                <option key={r.id} value={r.id} className="bg-neutral-900">
                  {r.logo} {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Title</label>
            <input required value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Double Rewards Weekend"
              className="w-full bg-neutral-900 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-amber-500/50 transition-colors" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Earn 10% back on your entire bill."
              rows={2}
              className="w-full bg-neutral-900 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-amber-500/50 transition-colors resize-none" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Bonus Reward Rate</label>
            <div className="relative">
              <input required type="number" min="0" max="100" step="0.5"
                value={rate} onChange={e => setRate(e.target.value)}
                className="w-full bg-neutral-900 border border-white/8 rounded-xl px-4 py-3 pr-10 text-sm text-white outline-none focus:border-amber-500/50 transition-colors" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 font-semibold">%</span>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Starts</label>
              <input required type="date" value={start} onChange={e => setStart(e.target.value)}
                className="w-full bg-neutral-900 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500/50 transition-colors" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Ends</label>
              <input required type="date" value={end} onChange={e => setEnd(e.target.value)}
                className="w-full bg-neutral-900 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500/50 transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Banner Color</label>
            <div className="grid grid-cols-3 gap-2">
              {COLOR_OPTIONS.map(opt => (
                <button type="button" key={opt.id} onClick={() => setColor(opt.value)}
                  className={`h-10 rounded-lg ${opt.preview} transition-all ${
                    color === opt.value ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0f0f18]' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={opt.label}
                />
              ))}
            </div>
          </div>

          <label className="flex items-center justify-between bg-neutral-900/60 border border-white/8 rounded-xl px-4 py-3 cursor-pointer">
            <div>
              <p className="text-sm text-white font-medium">Active</p>
              <p className="text-xs text-neutral-500">Shown to customers on home & restaurants page</p>
            </div>
            <button type="button" onClick={() => setActive(a => !a)}
              className={`w-11 rounded-full transition-colors relative ${active ? 'bg-green-500' : 'bg-neutral-700'}`}
              style={{ height: 24 }}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${active ? 'left-[calc(100%-22px)]' : 'left-0.5'}`} />
            </button>
          </label>
        </form>

        <div className="p-5 border-t border-white/5 shrink-0">
          <button onClick={submit}
            className="w-full gradient-gold text-black font-bold py-3.5 rounded-xl text-sm hover:opacity-90 transition-opacity">
            {isEdit ? 'Save Changes' : 'Create Promotion'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function PromoCard({ promo, restaurant, onEdit, onDelete, onToggle }) {
  const now = new Date();
  const start = new Date(promo.startDate);
  const end = new Date(promo.endDate);
  const isOngoing = now >= start && now <= end;
  const isEnded = now > end;
  const isUpcoming = now < start;

  return (
    <div className="relative overflow-hidden rounded-2xl mb-3">
      <div className={`absolute inset-0 bg-gradient-to-r ${promo.color} ${!promo.active ? 'opacity-40' : 'opacity-85'}`} />
      <div className="relative z-10 p-4">
        <div className="flex items-start gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0">
            {restaurant?.logo ?? '🍽️'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-white">{promo.title}</p>
              {!promo.active && (
                <span className="text-[10px] font-bold uppercase text-white/80 bg-black/30 px-1.5 py-0.5 rounded">Paused</span>
              )}
              {promo.active && isEnded && (
                <span className="text-[10px] font-bold uppercase text-red-200 bg-red-900/40 px-1.5 py-0.5 rounded">Ended</span>
              )}
              {promo.active && isUpcoming && (
                <span className="text-[10px] font-bold uppercase text-blue-200 bg-blue-900/40 px-1.5 py-0.5 rounded">Upcoming</span>
              )}
              {promo.active && isOngoing && (
                <span className="text-[10px] font-bold uppercase text-yellow-100 bg-yellow-900/40 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Flame size={8} /> Live
                </span>
              )}
            </div>
            <p className="text-xs text-white/75 mt-0.5">{restaurant?.name}</p>
          </div>
          <div className="flex items-center gap-1 bg-black/30 rounded-full px-2.5 py-1 shrink-0">
            <Percent size={10} className="text-white" />
            <span className="text-xs font-bold text-white">{Math.round(promo.rewardRate * 100)}%</span>
          </div>
        </div>

        {promo.description && (
          <p className="text-xs text-white/80 mb-2">{promo.description}</p>
        )}

        <div className="flex items-center gap-1.5 text-[11px] text-white/70">
          <CalendarDays size={11} />
          <span>
            {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {' – '}
            {end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <div className="flex gap-2 mt-3">
          <button onClick={onToggle}
            className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-black/25 text-white hover:bg-black/40 transition-colors">
            {promo.active ? 'Pause' : 'Activate'}
          </button>
          <button onClick={onEdit}
            className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-black/25 text-white hover:bg-black/40 transition-colors flex items-center gap-1">
            <Edit2 size={10} /> Edit
          </button>
          <button onClick={onDelete}
            className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-black/25 text-red-200 hover:bg-red-900/50 transition-colors flex items-center gap-1 ml-auto">
            <Trash2 size={10} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PromotionsAdmin() {
  const { promos, addPromo, updatePromo, removePromo, resetPromos } = usePromotionsStore();
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const active = promos.filter(p => p.active).length;

  function handleSave(data) {
    if (editing) updatePromo(editing.id, data);
    else         addPromo(data);
    setEditing(null);
  }

  function handleDelete(id) {
    if (confirm('Delete this promotion?')) removePromo(id);
  }

  return (
    <div className="px-4 pt-6 pb-10 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin" className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-white/8 transition-colors">
          <ArrowLeft size={16} className="text-neutral-400" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <Shield size={12} className="text-amber-400" />
            <p className="text-xs text-amber-400 uppercase tracking-widest font-bold">Manager</p>
          </div>
          <h1 className="text-xl font-bold text-white leading-tight">Promotions</h1>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-white">{promos.length}</p>
          <p className="text-xs text-neutral-500 mt-0.5">Total</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-green-400">{active}</p>
          <p className="text-xs text-neutral-500 mt-0.5">Active</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-neutral-500">{promos.length - active}</p>
          <p className="text-xs text-neutral-500 mt-0.5">Paused</p>
        </div>
      </div>

      <button onClick={() => setShowAdd(true)}
        className="w-full gradient-gold text-black font-bold py-3.5 rounded-xl text-sm mb-5 hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
        <Plus size={16} /> New Promotion
      </button>

      {promos.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-neutral-600">
          <Flame size={40} strokeWidth={1} />
          <p className="text-sm">No promotions yet</p>
        </div>
      ) : (
        <div>
          {promos.map(p => (
            <PromoCard
              key={p.id}
              promo={p}
              restaurant={restaurants.find(r => r.id === p.restaurantId)}
              onEdit={() => setEditing(p)}
              onDelete={() => handleDelete(p.id)}
              onToggle={() => updatePromo(p.id, { active: !p.active })}
            />
          ))}
        </div>
      )}

      <button onClick={() => { if (confirm('Reset promotions to demo defaults?')) resetPromos(); }}
        className="w-full mt-6 text-xs text-neutral-600 hover:text-neutral-400 transition-colors flex items-center justify-center gap-1.5 py-2">
        <RotateCcw size={11} /> Reset to demo defaults
      </button>

      {showAdd  && <PromoModal onSave={handleSave} onClose={() => setShowAdd(false)} />}
      {editing  && <PromoModal promo={editing} onSave={handleSave} onClose={() => setEditing(null)} />}
    </div>
  );
}
