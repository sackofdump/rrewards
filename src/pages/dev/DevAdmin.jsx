import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRestaurantStore } from '../../hooks/useRestaurantStore';
import {
  Terminal, LogOut, Plus, Edit2, Trash2, X,
  Lock, RotateCcw, Store, Star
} from 'lucide-react';

const CUISINE_SUGGESTIONS = [
  'American', 'Italian', 'Japanese', 'Mexican', 'Chinese', 'Seafood',
  'BBQ', 'Thai', 'Indian', 'Mediterranean', 'French', 'Vegan',
];

const LOGO_SUGGESTIONS = ['🍽️', '🍕', '🍔', '🌮', '🍣', '🍜', '🥩', '🦞', '🥗', '🍗', '🍝', '🌯', '🥟', '🍛'];

function RestaurantModal({ restaurant, onSave, onClose }) {
  const isEdit = Boolean(restaurant);
  const [name, setName]         = useState(restaurant?.name ?? '');
  const [cuisine, setCuisine]   = useState(restaurant?.cuisine ?? '');
  const [logo, setLogo]         = useState(restaurant?.logo ?? '🍽️');
  const [address, setAddress]   = useState(restaurant?.address ?? '');
  const [phone, setPhone]       = useState(restaurant?.phone ?? '');
  const [hours, setHours]       = useState(restaurant?.hours ?? '');
  const [description, setDescription] = useState(restaurant?.description ?? '');

  function submit(e) {
    e.preventDefault();
    if (!name.trim() || !cuisine.trim()) return;
    onSave({ name: name.trim(), cuisine: cuisine.trim(), logo, address, phone, hours, description });
    onClose();
  }

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg bg-[#0f0f18] border border-white/8 rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-white/5 shrink-0">
          <h2 className="text-lg font-bold text-white">{isEdit ? 'Edit Restaurant' : 'Add Restaurant'}</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Emoji / Logo</label>
            <div className="flex flex-wrap gap-2">
              {LOGO_SUGGESTIONS.map(e => (
                <button type="button" key={e} onClick={() => setLogo(e)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-colors ${
                    logo === e ? 'bg-violet-500/15 border-violet-400' : 'bg-neutral-900 border-white/5 hover:bg-neutral-800'
                  }`}>{e}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Name</label>
            <input required value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. The Golden Fork"
              className="w-full bg-neutral-900 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-violet-400/50 transition-colors" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Cuisine</label>
            <input required value={cuisine} onChange={e => setCuisine(e.target.value)}
              list="cuisine-options"
              placeholder="e.g. Italian"
              className="w-full bg-neutral-900 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-violet-400/50 transition-colors" />
            <datalist id="cuisine-options">
              {CUISINE_SUGGESTIONS.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Address</label>
            <input value={address} onChange={e => setAddress(e.target.value)}
              placeholder="Street, City"
              className="w-full bg-neutral-900 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-violet-400/50 transition-colors" />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Phone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full bg-neutral-900 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-violet-400/50 transition-colors" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Hours</label>
              <input value={hours} onChange={e => setHours(e.target.value)}
                placeholder="Mon-Sun 11am-10pm"
                className="w-full bg-neutral-900 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-violet-400/50 transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="A short tagline for the restaurant…" rows={2}
              className="w-full bg-neutral-900 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-violet-400/50 transition-colors resize-none" />
          </div>
        </form>

        <div className="p-5 border-t border-white/5 shrink-0">
          <button onClick={submit}
            className="w-full bg-violet-500 hover:bg-violet-400 text-white font-bold py-3.5 rounded-xl text-sm transition-colors">
            {isEdit ? 'Save Changes' : 'Create Restaurant'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function DevAdmin() {
  const { user, logout } = useAuth();
  const { all, addRestaurant, updateRestaurant, removeRestaurant, resetAll, overrides } = useRestaurantStore();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  function signOut() {
    logout();
    navigate('/login');
  }

  function handleDelete(r) {
    if (r.isBuiltIn) {
      alert('Built-in demo restaurants can\'t be removed (only edited). Use the reset button below to undo all changes.');
      return;
    }
    if (confirm(`Remove "${r.name}"?`)) removeRestaurant(r.id);
  }

  function handleSave(data) {
    if (editing) updateRestaurant(editing.id, data);
    else         addRestaurant(data);
    setEditing(null);
  }

  return (
    <div className="px-4 pt-6 pb-10 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-400/30 flex items-center justify-center">
            <Terminal size={15} className="text-violet-400" />
          </div>
          <div>
            <p className="text-xs text-violet-400 font-bold uppercase tracking-widest">Dev Admin</p>
            <h1 className="text-xl font-bold text-white leading-tight">Restaurants</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">{user?.name}</span>
          <button onClick={signOut}
            className="w-8 h-8 rounded-full glass flex items-center justify-center text-neutral-500 hover:text-red-400 transition-colors">
            <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* Warning */}
      <div className="rounded-xl bg-violet-500/8 border border-violet-400/20 px-4 py-3 mb-5 flex items-start gap-2.5">
        <Lock size={14} className="text-violet-400 shrink-0 mt-0.5" />
        <p className="text-xs text-neutral-300 leading-relaxed">
          This is the <span className="text-violet-400 font-semibold">dev-only</span> area.
          Changes here affect the restaurant list across the whole app.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-white">{all.length}</p>
          <p className="text-xs text-neutral-500 mt-0.5">Total</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-neutral-400">{all.filter(r => r.isBuiltIn).length}</p>
          <p className="text-xs text-neutral-500 mt-0.5">Built-in</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-violet-400">{all.filter(r => !r.isBuiltIn).length}</p>
          <p className="text-xs text-neutral-500 mt-0.5">Custom</p>
        </div>
      </div>

      {/* Add button */}
      <button onClick={() => setShowAdd(true)}
        className="w-full bg-violet-500 hover:bg-violet-400 text-white font-bold py-3.5 rounded-xl text-sm mb-5 transition-colors flex items-center justify-center gap-2">
        <Plus size={16} /> Add Restaurant
      </button>

      {/* Restaurant list */}
      <div className="space-y-2">
        {all.map(r => (
          <div key={r.id} className={`glass rounded-xl p-4 flex items-center gap-3 ${r.isBuiltIn ? 'opacity-70' : ''}`}>
            <span className="text-2xl shrink-0">{r.logo}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-white truncate">{r.name}</p>
                {r.isBuiltIn
                  ? <span className="text-[10px] font-bold uppercase text-neutral-500 bg-neutral-800 px-1.5 py-0.5 rounded">Built-in</span>
                  : <span className="text-[10px] font-bold uppercase text-violet-400 bg-violet-500/15 border border-violet-400/25 px-1.5 py-0.5 rounded">Custom</span>
                }
              </div>
              <p className="text-xs text-neutral-500 truncate">{r.cuisine}</p>
              {r.address && (
                <p className="text-[10px] text-neutral-600 truncate mt-0.5">{r.address}</p>
              )}
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => setEditing(r)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors">
                <Edit2 size={13} />
              </button>
              {!r.isBuiltIn && (
                <button onClick={() => handleDelete(r)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/15 flex items-center justify-center text-neutral-400 hover:text-red-400 transition-colors">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {(all.some(r => !r.isBuiltIn) || Object.keys(overrides).length > 0) && (
        <button onClick={() => { if (confirm('Undo all dev edits and remove custom restaurants? Built-in demos will revert to their defaults.')) resetAll(); }}
          className="w-full mt-8 text-xs text-neutral-600 hover:text-red-400 transition-colors flex items-center justify-center gap-1.5 py-2">
          <RotateCcw size={11} /> Reset all changes
        </button>
      )}

      {showAdd && (
        <RestaurantModal
          onSave={handleSave}
          onClose={() => setShowAdd(false)}
        />
      )}
      {editing && (
        <RestaurantModal
          restaurant={editing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
