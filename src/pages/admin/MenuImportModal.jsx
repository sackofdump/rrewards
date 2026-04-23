import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { restaurantDetails, MENU_CATEGORIES } from '../../data/mockData';
import {
  X, Link2, Image as ImageIcon, Sparkles, Check, ChevronRight,
  Globe, Upload, Loader2, AlertCircle
} from 'lucide-react';

/* Mock AI extraction output by cuisine. In production this would be an
   API call to an LLM (GPT-4 Vision / Claude Vision) given the URL or image. */
const MOCK_MENU_BY_CUISINE = {
  'American Steakhouse': [
    { name: 'Bone-In Ribeye',       price: 72.00, category: 'Entrees',    description: '20oz, dry-aged 28 days' },
    { name: 'NY Strip',             price: 48.00, category: 'Entrees',    description: '14oz, chargrilled' },
    { name: 'Surf & Turf',          price: 89.00, category: 'Entrees',    description: 'Filet & 6oz lobster tail' },
    { name: 'Caesar Salad',         price: 14.00, category: 'Appetizers', description: 'House anchovy dressing' },
    { name: 'Oysters Rockefeller',  price: 22.00, category: 'Appetizers', description: 'Half-dozen, spinach, pernod' },
    { name: 'Creamed Spinach',      price: 11.00, category: 'Sides',      description: 'Classic preparation' },
    { name: 'Mac & Cheese',         price: 13.00, category: 'Sides',      description: 'Three-cheese, panko crust' },
    { name: 'Chocolate Lava Cake',  price: 13.00, category: 'Desserts',   description: 'Vanilla ice cream' },
    { name: 'Old Fashioned',        price: 16.00, category: 'Drinks',     description: 'Bourbon, house bitters' },
  ],
  'Japanese Fusion': [
    { name: 'Omakase (9 pc)',       price: 62.00, category: 'Entrees',    description: "Chef's selection nigiri" },
    { name: 'Spicy Tuna Roll',      price: 14.00, category: 'Entrees',    description: 'Sriracha aioli, scallion' },
    { name: 'Tonkotsu Ramen',       price: 18.00, category: 'Entrees',    description: 'Pork broth, chashu, egg' },
    { name: 'Gyoza (6)',            price: 10.00, category: 'Appetizers', description: 'Pan-seared pork dumplings' },
    { name: 'Seaweed Salad',        price: 8.00,  category: 'Appetizers', description: 'Wakame, sesame' },
    { name: 'Agedashi Tofu',        price: 9.00,  category: 'Sides',      description: 'Dashi broth, bonito' },
    { name: 'Mochi Ice Cream',      price: 8.00,  category: 'Desserts',   description: 'Three flavors' },
    { name: 'Matcha Latte',         price: 6.00,  category: 'Drinks',     description: 'Ceremonial grade' },
    { name: 'Sake Flight',          price: 24.00, category: 'Drinks',     description: 'Three 2oz pours' },
  ],
  'Italian': [
    { name: 'Cacio e Pepe',         price: 21.00, category: 'Entrees',    description: 'Tonnarelli, pecorino, black pepper' },
    { name: 'Osso Buco',            price: 38.00, category: 'Entrees',    description: 'Braised veal shank, risotto milanese' },
    { name: 'Lasagna della Nonna',  price: 24.00, category: 'Entrees',    description: 'Beef ragu, béchamel' },
    { name: 'Burrata',              price: 16.00, category: 'Appetizers', description: 'Prosciutto, grilled bread' },
    { name: 'Calamari Fritti',      price: 15.00, category: 'Appetizers', description: 'Lemon aioli' },
    { name: 'Arancini (4)',         price: 13.00, category: 'Sides',      description: 'Saffron risotto balls' },
    { name: 'Cannoli (2)',          price: 11.00, category: 'Desserts',   description: 'Ricotta, pistachio' },
    { name: 'Affogato',             price: 9.00,  category: 'Desserts',   description: 'Espresso over gelato' },
    { name: 'Aperol Spritz',        price: 14.00, category: 'Drinks',     description: 'Prosecco, aperol, soda' },
  ],
  'Seafood': [
    { name: 'Grilled Swordfish',    price: 38.00, category: 'Entrees',    description: 'Lemon caper butter' },
    { name: 'Maine Lobster Roll',   price: 32.00, category: 'Entrees',    description: 'Warm butter or cold mayo' },
    { name: 'Cioppino',             price: 42.00, category: 'Entrees',    description: 'Mixed seafood in tomato broth' },
    { name: 'Oysters on the Half',  price: 24.00, category: 'Appetizers', description: 'Half-dozen, mignonette' },
    { name: 'Tuna Tartare',         price: 19.00, category: 'Appetizers', description: 'Avocado, soy lime' },
    { name: 'Clam Chowder',         price: 11.00, category: 'Appetizers', description: 'New England style' },
    { name: 'Garlic Mashed',        price: 9.00,  category: 'Sides',      description: 'Yukon gold' },
    { name: 'Chocolate Mousse',     price: 10.00, category: 'Desserts',   description: 'Sea salt flakes' },
    { name: 'Whiskey Sour',         price: 15.00, category: 'Drinks',     description: 'Rye, lemon, egg white' },
  ],
};

const EXTRACTION_STAGES = [
  { label: 'Fetching page…',          duration: 800 },
  { label: 'Analyzing with AI…',      duration: 1100 },
  { label: 'Extracting menu items…',  duration: 900 },
  { label: 'Categorizing…',           duration: 600 },
];

function isValidUrl(s) {
  try { new URL(s.startsWith('http') ? s : `https://${s}`); return true; }
  catch { return false; }
}

export default function MenuImportModal({ restaurantId, onImport, onClose }) {
  const restaurant = restaurantDetails.find(r => r.id === restaurantId);
  const [step, setStep]       = useState('input');   // 'input' | 'extracting' | 'review'
  const [mode, setMode]       = useState('url');     // 'url' | 'photo'
  const [url, setUrl]         = useState('');
  const [fileName, setFileName] = useState('');
  const [filePreview, setFilePreview] = useState(null);
  const [stageLabel, setStageLabel]   = useState('');
  const [extracted, setExtracted]     = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [error, setError]     = useState('');
  const fileInputRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setFilePreview(reader.result);
    reader.readAsDataURL(file);
  }

  async function extract() {
    if (mode === 'url' && !url.trim()) {
      setError('Enter a URL first.'); return;
    }
    if (mode === 'url' && !isValidUrl(url.trim())) {
      setError('That doesn\'t look like a valid URL.'); return;
    }
    if (mode === 'photo' && !fileName) {
      setError('Upload a photo first.'); return;
    }

    setError('');
    setStep('extracting');

    for (const stage of EXTRACTION_STAGES) {
      setStageLabel(stage.label);
      await new Promise(r => setTimeout(r, stage.duration));
    }

    const mockItems = (MOCK_MENU_BY_CUISINE[restaurant?.cuisine] ?? [])
      .map((item, idx) => ({ ...item, tempId: `ext-${idx}` }));

    setExtracted(mockItems);
    setSelectedIds(new Set(mockItems.map(i => i.tempId)));
    setStep('review');
  }

  function toggleSelected(tempId) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(tempId) ? next.delete(tempId) : next.add(tempId);
      return next;
    });
  }

  function handleImport() {
    const itemsToImport = extracted
      .filter(it => selectedIds.has(it.tempId))
      .map(({ tempId, ...rest }) => ({ ...rest, restaurantId, available: true }));
    onImport(itemsToImport);
    onClose();
  }

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && step !== 'extracting' && onClose()}>
      <div className="w-full max-w-lg bg-[#0f0f18] border border-white/8 rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            <h2 className="text-base font-bold text-white">Import Menu</h2>
          </div>
          {step !== 'extracting' && (
            <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
              <X size={18} />
            </button>
          )}
        </div>

        <div className="overflow-y-auto flex-1">
          {step === 'input' && (
            <div className="p-5 space-y-4">
              <div className="glass rounded-xl px-4 py-3 text-xs text-neutral-400 leading-relaxed">
                <span className="text-amber-400 font-semibold">AI-powered import</span> for{' '}
                <span className="text-white font-medium">{restaurant?.name}</span>. Paste a link or upload a photo — we'll extract items, prices, and categories for you to review.
              </div>

              <div className="glass rounded-xl p-1 flex">
                <button onClick={() => setMode('url')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    mode === 'url' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' : 'text-neutral-500'
                  }`}>
                  <Globe size={13} /> From URL
                </button>
                <button onClick={() => setMode('photo')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    mode === 'photo' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' : 'text-neutral-500'
                  }`}>
                  <ImageIcon size={13} /> From Photo
                </button>
              </div>

              {mode === 'url' ? (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
                    Restaurant Menu URL
                  </label>
                  <div className="relative">
                    <Link2 size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                    <input value={url} onChange={e => { setUrl(e.target.value); setError(''); }}
                      placeholder="https://restaurant.com/menu"
                      className="w-full bg-neutral-900 border border-white/8 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-amber-500/50 transition-colors" />
                  </div>
                  <p className="text-xs text-neutral-600 mt-2">
                    Examples: the restaurant's website, Toast online menu, PDF link
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
                    Menu Photo or PDF
                  </label>
                  <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
                  {filePreview ? (
                    <div className="glass rounded-xl p-3 flex items-center gap-3">
                      <img src={filePreview} alt="Preview" className="w-14 h-14 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{fileName}</p>
                        <button onClick={() => fileInputRef.current?.click()}
                          className="text-xs text-amber-400 mt-0.5">Change</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-white/10 hover:border-amber-500/40 rounded-xl p-8 flex flex-col items-center gap-2 transition-colors">
                      <Upload size={24} className="text-neutral-500" strokeWidth={1.5} />
                      <p className="text-sm text-neutral-400">Tap to upload menu image</p>
                      <p className="text-xs text-neutral-600">JPG, PNG, or PDF</p>
                    </button>
                  )}
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                  <AlertCircle size={13} className="shrink-0" />
                  {error}
                </div>
              )}

              <button onClick={extract}
                className="w-full gradient-gold text-black font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                <Sparkles size={15} /> Extract Menu
              </button>
            </div>
          )}

          {step === 'extracting' && (
            <div className="p-8 flex flex-col items-center gap-5 py-16">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center">
                  <Sparkles size={28} className="text-black" />
                </div>
                <Loader2 size={76} className="absolute -top-1.5 -left-1.5 text-amber-400/50 animate-spin" strokeWidth={1.2} />
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-white">{stageLabel}</p>
                <p className="text-xs text-neutral-500 mt-1">This usually takes a few seconds</p>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="p-5 space-y-3">
              <div className="glass rounded-xl px-4 py-3 flex items-center gap-2">
                <Check size={14} className="text-green-400 shrink-0" />
                <p className="text-xs text-neutral-300">
                  Found <span className="text-white font-semibold">{extracted.length}</span> items · review and select which to import
                </p>
              </div>

              <div className="space-y-2">
                {extracted.map(item => {
                  const selected = selectedIds.has(item.tempId);
                  return (
                    <button key={item.tempId} onClick={() => toggleSelected(item.tempId)}
                      className={`w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all ${
                        selected
                          ? 'bg-amber-500/8 border border-amber-500/25'
                          : 'bg-neutral-900 border border-white/5 opacity-60'
                      }`}>
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all ${
                        selected ? 'bg-amber-500 border border-amber-500' : 'bg-neutral-800 border border-neutral-700'
                      }`}>
                        {selected && <Check size={12} className="text-black" strokeWidth={3} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-bold text-white truncate">{item.name}</p>
                          <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-800 px-1.5 py-0.5 rounded shrink-0">
                            {item.category}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-xs text-neutral-500 truncate">{item.description}</p>
                        )}
                      </div>
                      <p className="text-sm font-bold text-amber-400 shrink-0">${item.price.toFixed(2)}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {step === 'review' && (
          <div className="p-5 border-t border-white/5 shrink-0">
            <button onClick={handleImport} disabled={selectedIds.size === 0}
              className="w-full gradient-gold text-black font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-30">
              Import {selectedIds.size} {selectedIds.size === 1 ? 'Item' : 'Items'} <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
