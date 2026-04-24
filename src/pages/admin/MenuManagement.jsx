import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { restaurants, MENU_CATEGORIES } from '../../data/mockData';
import { useMenuStore } from '../../hooks/useMenuStore';
import MenuImportModal from './MenuImportModal';
import {
  ArrowLeft, Plus, Edit2, Trash2, X, Check,
  UtensilsCrossed, Shield, RotateCcw, Sparkles
} from 'lucide-react';

function ItemModal({ item, restaurantId, onSave, onClose }) {
  const isEdit = Boolean(item);
  const [name, setName]           = useState(item?.name ?? '');
  const [price, setPrice]         = useState(item?.price?.toString() ?? '');
  const [category, setCategory]   = useState(item?.category ?? MENU_CATEGORIES[0]);
  const [description, setDescription] = useState(item?.description ?? '');
  const [available, setAvailable] = useState(item?.available ?? true);

  function handleSubmit(e) {
    e.preventDefault();
    const numPrice = parseFloat(price);
    if (!name || isNaN(numPrice)) return;
    onSave({
      ...(item ?? {}),
      restaurantId,
      name: name.trim(),
      price: numPrice,
      category,
      description: description.trim(),
      available,
    });
    onClose();
  }

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg bg-[#0f0f18] border border-white/8 rounded-t-3xl sm:rounded-3xl p-6 pb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">{isEdit ? 'Edit Item' : 'Add Menu Item'}</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Name</label>
            <input required value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Ribeye Steak"
              className="w-full bg-neutral-900 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-amber-500/50 transition-colors" />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Price</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
                <input required type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-neutral-900 border border-white/8 rounded-xl pl-8 pr-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-amber-500/50 transition-colors" />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full bg-neutral-900 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500/50 transition-colors">
                {MENU_CATEGORIES.map(c => (
                  <option key={c} value={c} className="bg-neutral-900">{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Optional — e.g. 12oz aged, house rub" rows={2}
              className="w-full bg-neutral-900 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-amber-500/50 transition-colors resize-none" />
          </div>

          <label className="flex items-center justify-between bg-neutral-900/60 border border-white/8 rounded-xl px-4 py-3 cursor-pointer">
            <div>
              <p className="text-sm text-white font-medium">Available</p>
              <p className="text-xs text-neutral-500">Shown to customers & staff</p>
            </div>
            <button type="button" onClick={() => setAvailable(a => !a)}
              className={`w-11 rounded-full transition-colors relative ${available ? 'bg-green-500' : 'bg-neutral-700'}`}
              style={{ height: 24 }}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${available ? 'left-[calc(100%-22px)]' : 'left-0.5'}`} />
            </button>
          </label>

          <button type="submit"
            className="w-full gradient-gold text-black font-bold py-3.5 rounded-xl text-sm mt-2 hover:opacity-90 transition-opacity">
            {isEdit ? 'Save Changes' : 'Add Item'}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default function MenuManagement() {
  const { items, addItem, updateItem, removeItem, resetMenu } = useMenuStore();
  const [selectedRestaurant, setSelectedRestaurant] = useState(restaurants[0].id);
  const [editingItem, setEditingItem] = useState(null);
  const [showAdd, setShowAdd]         = useState(false);
  const [showImport, setShowImport]   = useState(false);
  const [importedCount, setImportedCount] = useState(null);

  function handleBulkImport(newItems) {
    newItems.forEach(item => addItem(item));
    setImportedCount(newItems.length);
    setTimeout(() => setImportedCount(null), 3000);
  }

  const restaurantItems = items.filter(i => i.restaurantId === selectedRestaurant);
  const groupedByCategory = MENU_CATEGORIES
    .map(cat => ({ category: cat, items: restaurantItems.filter(i => i.category === cat) }))
    .filter(g => g.items.length > 0);

  const totalItems  = restaurantItems.length;
  const unavailable = restaurantItems.filter(i => !i.available).length;

  function handleAdd(data)    { addItem(data); }
  function handleUpdate(data) { updateItem(data.id, data); }
  function handleDelete(id)   {
    if (confirm('Remove this menu item?')) removeItem(id);
  }

  return (
    <div className="px-4 pt-6 pb-10 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin" className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-white/8 transition-colors">
          <ArrowLeft size={16} className="text-neutral-400" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <Shield size={12} className="text-amber-400" />
            <p className="text-xs text-amber-400 uppercase tracking-widest font-bold">Manager</p>
          </div>
          <h1 className="text-xl font-bold text-white leading-tight">Menu Management</h1>
        </div>
      </div>

      {/* Restaurant selector */}
      <div className="glass rounded-2xl p-3 mb-5">
        <p className="text-xs text-neutral-500 mb-2 px-1">Select Restaurant</p>
        <select value={selectedRestaurant} onChange={e => setSelectedRestaurant(Number(e.target.value))}
          className="w-full bg-transparent text-white text-sm font-medium outline-none px-1 py-1">
          {restaurants.map(r => (
            <option key={r.id} value={r.id} className="bg-neutral-900">
              {r.logo} {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-white">{totalItems}</p>
          <p className="text-xs text-neutral-500 mt-0.5">Items</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-green-400">{totalItems - unavailable}</p>
          <p className="text-xs text-neutral-500 mt-0.5">Available</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-neutral-500">{unavailable}</p>
          <p className="text-xs text-neutral-500 mt-0.5">Hidden</p>
        </div>
      </div>

      {/* Import success banner */}
      {importedCount !== null && (
        <div className="glass-gold rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
          <Check size={14} className="text-green-400 shrink-0" />
          <p className="text-sm text-white">
            Imported <span className="font-bold text-amber-400">{importedCount}</span> items from AI extraction
          </p>
        </div>
      )}

      {/* Import / Add buttons */}
      <div className="flex gap-2 mb-5">
        <button onClick={() => setShowImport(true)}
          className="flex-1 glass-gold border border-amber-500/30 text-amber-400 font-bold py-3.5 rounded-xl text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2">
          <Sparkles size={14} /> Import from URL / Photo
        </button>
        <button onClick={() => setShowAdd(true)}
          className="gradient-gold text-black font-bold px-4 rounded-xl text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5">
          <Plus size={15} /> Add
        </button>
      </div>

      {/* Menu items */}
      {groupedByCategory.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-neutral-600">
          <UtensilsCrossed size={40} strokeWidth={1} />
          <p className="text-sm">No menu items yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {groupedByCategory.map(({ category, items }) => (
            <div key={category}>
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2 px-1">{category}</p>
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.id} className={`glass rounded-xl p-4 flex items-center gap-3 ${!item.available ? 'opacity-50' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-bold text-white truncate">{item.name}</p>
                        {!item.available && (
                          <span className="text-[10px] font-bold uppercase text-neutral-500 bg-neutral-800 px-1.5 py-0.5 rounded">Hidden</span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-neutral-500 truncate">{item.description}</p>
                      )}
                    </div>
                    <p className="text-sm font-bold text-amber-400 shrink-0">${item.price.toFixed(2)}</p>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => setEditingItem(item)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleDelete(item.id)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/15 flex items-center justify-center text-neutral-400 hover:text-red-400 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => { if (confirm('Reset menu to demo defaults?')) resetMenu(); }}
        className="w-full mt-8 text-xs text-neutral-600 hover:text-neutral-400 transition-colors flex items-center justify-center gap-1.5 py-2">
        <RotateCcw size={11} /> Reset to demo defaults
      </button>

      {showAdd && (
        <ItemModal
          restaurantId={selectedRestaurant}
          onSave={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}
      {editingItem && (
        <ItemModal
          item={editingItem}
          restaurantId={editingItem.restaurantId}
          onSave={handleUpdate}
          onClose={() => setEditingItem(null)}
        />
      )}
      {showImport && (
        <MenuImportModal
          restaurantId={selectedRestaurant}
          onImport={handleBulkImport}
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  );
}
