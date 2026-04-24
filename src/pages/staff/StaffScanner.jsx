import { useState, lazy, Suspense } from 'react';
import { adminCustomers, restaurants, tierConfig, MENU_CATEGORIES } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useMenuStore } from '../../hooks/useMenuStore';
import { useActivityLog } from '../../hooks/useActivityLog';
import { useOrderStore } from '../../hooks/useOrderStore';
import { useCustomerStats, getCustomerStats } from '../../hooks/useCustomerStats';
import { useNotifications } from '../../hooks/useNotifications';
import { isLive } from '../../utils/sessionMode';
import {
  ScanLine, XCircle, LogOut, ChevronRight,
  CheckCircle, ArrowLeft, Star, Gift, Receipt,
  Plus, Minus, Trash2, Keyboard, UtensilsCrossed
} from 'lucide-react';

const QrCameraScanner = lazy(() => import('../../components/QrCameraScanner'));


function parseQr(raw) {
  if (raw.startsWith('rewards:')) return raw.replace('rewards:', '').trim();
  return raw.trim();
}

/* ── STEP 1: Scan / select customer ─────────────────────────────── */
function ScanStep({ onCustomerFound, notFound, setNotFound }) {
  const [scanning, setScanning] = useState(false);
  const live = isLive();

  // Build the shortcut list:
  //  - live: only registered users (no demo customers)
  //  - demo: demo customers
  const shortcutList = (() => {
    if (live) {
      try {
        const raw = localStorage.getItem('rr_registered_users');
        const registered = raw ? JSON.parse(raw) : [];
        return registered.filter(c => c.status === 'active');
      } catch { return []; }
    }
    return adminCustomers.filter(c => c.status === 'active').slice(0, 4);
  })();

  function handleScan(raw) {
    setScanning(false);
    const uid = parseQr(raw);
    // Look up via the stats helper — covers both registered and demo customers
    const found = getCustomerStats(uid);
    if (found) { setNotFound(false); onCustomerFound(found); }
    else        { setNotFound(true); }
  }

  return (
    <>
      {scanning ? (
        <div className="mb-4">
          <Suspense fallback={
            <div className="aspect-square rounded-2xl bg-neutral-900 flex items-center justify-center text-neutral-600 text-sm">
              Loading camera…
            </div>
          }>
            <QrCameraScanner onScan={handleScan} />
          </Suspense>
          <button onClick={() => setScanning(false)}
            className="w-full mt-3 text-xs text-neutral-500 hover:text-neutral-300 transition-colors py-2">
            Cancel
          </button>
        </div>
      ) : (
        <button onClick={() => { setScanning(true); setNotFound(false); }}
          className="w-full glass-gold rounded-2xl p-6 flex flex-col items-center gap-3 mb-5 hover:brightness-110 transition-all">
          <div className="w-14 h-14 rounded-2xl gradient-gold flex items-center justify-center">
            <ScanLine size={28} className="text-black" />
          </div>
          <div className="text-center">
            <p className="font-bold text-white">Scan Customer QR</p>
            <p className="text-xs text-neutral-400 mt-0.5">Tap to open camera</p>
          </div>
        </button>
      )}

      {notFound && (
        <div className="flex items-center gap-2 mb-4 text-xs text-red-400 glass rounded-xl px-4 py-3">
          <XCircle size={14} className="shrink-0" />
          QR code not recognized. Ask the customer to open their Wallet tab.
        </div>
      )}

      {shortcutList.length > 0 && (
        <div className="glass rounded-2xl p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-3">
            {live ? 'Registered Customers' : 'Demo — tap to simulate scan'}
          </p>
          <div className="space-y-1">
            {shortcutList.map(c => (
              <button key={c.id} onClick={() => handleScan(`rewards:${c.id}`)}
                className="w-full flex items-center gap-3 text-left hover:bg-white/4 rounded-xl px-3 py-2.5 transition-colors group">
                <div className="w-9 h-9 rounded-full gradient-gold flex items-center justify-center text-black text-xs font-bold shrink-0">
                  {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-semibold truncate">{c.name}</p>
                  <p className="text-xs text-neutral-500">{c.tier} · ${(c.rewardsBalance ?? 0).toFixed(2)} balance</p>
                </div>
                <ChevronRight size={14} className="text-neutral-600 group-hover:text-neutral-400 transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
      {live && shortcutList.length === 0 && (
        <div className="glass rounded-2xl py-8 text-center text-xs text-neutral-500 leading-relaxed px-6">
          No registered customers yet.<br />
          They'll appear here after they sign up at <span className="text-amber-400 font-mono">/register</span>
          &nbsp;or scan a QR.
        </div>
      )}
    </>
  );
}

/* ── STEP 2: Checkout ────────────────────────────────────────────── */
function CheckoutStep({ customer, restaurantId, onComplete, onBack }) {
  const { items: allMenuItems } = useMenuStore();
  const { rewardRate, taxRate } = useSettings();
  const [cart, setCart]             = useState([]); // [{ id, name, price, qty }]
  const [manualAmount, setManualAmount] = useState('');
  const [mode, setMode]             = useState('menu'); // 'menu' | 'manual'
  const [activeCategory, setActiveCategory] = useState('All');
  const [redeemOn, setRedeemOn]     = useState(false);
  const [tipMode, setTipMode]       = useState('pct'); // 'pct' | 'custom' | 'none'
  const [tipPct, setTipPct]         = useState(0.18);
  const [tipCustom, setTipCustom]   = useState('');

  const tier = tierConfig[customer.tier];
  const restaurant = restaurants.find(r => r.id === restaurantId);

  const menuItems = allMenuItems.filter(i => i.restaurantId === restaurantId && i.available);
  const categoriesInMenu = MENU_CATEGORIES.filter(c => menuItems.some(i => i.category === c));
  const filteredMenu = activeCategory === 'All'
    ? menuItems
    : menuItems.filter(i => i.category === activeCategory);

  const cartSubtotal = cart.reduce((s, it) => s + it.price * it.qty, 0);
  const sub = mode === 'menu' ? cartSubtotal : (parseFloat(manualAmount) || 0);
  const tax = sub * taxRate;
  const earned = sub * rewardRate; // rewards earned on pre-tax subtotal only (not tip)
  const tip = (() => {
    if (tipMode === 'none') return 0;
    if (tipMode === 'custom') return parseFloat(tipCustom) || 0;
    return sub * tipPct;
  })();
  const redeemAmt = redeemOn ? Math.min(customer.rewardsBalance, sub + tax + tip) : 0;
  const total = Math.max(0, sub + tax + tip - redeemAmt);

  function addToCart(item) {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  }
  function changeQty(id, delta) {
    setCart(prev => prev
      .map(c => c.id === id ? { ...c, qty: c.qty + delta } : c)
      .filter(c => c.qty > 0)
    );
  }
  function removeFromCart(id) {
    setCart(prev => prev.filter(c => c.id !== id));
  }

  function handleComplete() {
    if (!sub) return;
    onComplete({
      subtotal: sub,
      tax, tip, earned, redeemAmt, total,
      items: mode === 'menu' ? cart : null,
    });
  }

  return (
    <div className="space-y-4">
      {/* Customer info */}
      <div className="glass rounded-2xl p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full gradient-gold flex items-center justify-center text-black font-bold text-sm shrink-0">
          {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm">{customer.name}</p>
          <p className="text-xs mt-0.5" style={{ color: tier.color }}>{customer.tier} Member</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-neutral-500">Balance</p>
          <p className="text-base font-bold text-amber-400">${customer.rewardsBalance.toFixed(2)}</p>
        </div>
      </div>

      {/* Restaurant */}
      <div className="flex items-center gap-2 text-xs text-neutral-500 px-1">
        <Receipt size={13} />
        <span>{restaurant?.name ?? 'Unknown location'}</span>
      </div>

      {/* Mode toggle */}
      <div className="glass rounded-xl p-1 flex">
        <button onClick={() => setMode('menu')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            mode === 'menu' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' : 'text-neutral-500'
          }`}>
          <UtensilsCrossed size={13} /> Menu Items
        </button>
        <button onClick={() => setMode('manual')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            mode === 'manual' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' : 'text-neutral-500'
          }`}>
          <Keyboard size={13} /> Manual Entry
        </button>
      </div>

      {mode === 'manual' ? (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Subtotal</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-lg font-semibold">$</span>
            <input
              type="number" value={manualAmount}
              onChange={e => setManualAmount(e.target.value)}
              placeholder="0.00" min="0" step="0.01"
              autoFocus
              className="w-full bg-neutral-900 border border-white/8 rounded-xl pl-9 pr-4 py-4 text-white text-2xl font-bold outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>
        </div>
      ) : (
        <>
          {/* Cart */}
          {cart.length > 0 && (
            <div className="glass rounded-2xl p-3 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 px-1">Order ({cart.reduce((s, c) => s + c.qty, 0)} items)</p>
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-2 bg-neutral-900/60 rounded-xl px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{item.name}</p>
                    <p className="text-xs text-neutral-500">${item.price.toFixed(2)} ea</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => changeQty(item.id, -1)}
                      className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white">
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-bold text-white w-6 text-center">{item.qty}</span>
                    <button onClick={() => changeQty(item.id, 1)}
                      className="w-7 h-7 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/25 flex items-center justify-center text-amber-400">
                      <Plus size={12} />
                    </button>
                  </div>
                  <p className="text-sm font-bold text-amber-400 shrink-0 w-16 text-right">
                    ${(item.price * item.qty).toFixed(2)}
                  </p>
                  <button onClick={() => removeFromCart(item.id)}
                    className="w-7 h-7 rounded-lg hover:bg-red-500/15 flex items-center justify-center text-neutral-500 hover:text-red-400 shrink-0 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Menu */}
          {menuItems.length === 0 ? (
            <div className="glass rounded-2xl py-10 flex flex-col items-center gap-2 text-neutral-500 text-sm">
              <UtensilsCrossed size={28} strokeWidth={1} />
              <p>No menu items for this restaurant yet.</p>
              <p className="text-xs text-neutral-600">Add items in Admin → Menu Management</p>
            </div>
          ) : (
            <>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
                {['All', ...categoriesInMenu].map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                      activeCategory === cat
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'bg-neutral-900 text-neutral-400 border border-white/5'
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {filteredMenu.map(item => (
                  <button key={item.id} onClick={() => addToCart(item)}
                    className="glass rounded-xl p-3 text-left hover:brightness-110 active:scale-95 transition-all">
                    <p className="text-sm font-bold text-white leading-tight mb-0.5">{item.name}</p>
                    {item.description && (
                      <p className="text-[10px] text-neutral-500 line-clamp-1">{item.description}</p>
                    )}
                    <p className="text-sm font-bold text-amber-400 mt-1.5">${item.price.toFixed(2)}</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Breakdown */}
      {sub > 0 && (
        <div className="glass rounded-2xl p-4 space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-400">Subtotal</span>
            <span className="text-white font-medium">${sub.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-400">Tax ({(taxRate * 100).toFixed(1).replace(/\.0$/, '')}%)</span>
            <span className="text-white font-medium">${tax.toFixed(2)}</span>
          </div>

          {/* Tip */}
          <div className="pt-2 border-t border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Add Tip</span>
              {tip > 0 && (
                <span className="text-sm text-white font-medium">${tip.toFixed(2)}</span>
              )}
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { label: '10%', value: 0.10 },
                { label: '15%', value: 0.15 },
                { label: '18%', value: 0.18 },
                { label: '20%', value: 0.20 },
              ].map(({ label, value }) => {
                const active = tipMode === 'pct' && Math.abs(tipPct - value) < 0.001;
                return (
                  <button key={value} type="button"
                    onClick={() => { setTipMode('pct'); setTipPct(value); }}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      active
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'bg-neutral-900 text-neutral-400 border border-white/5 hover:border-white/15'
                    }`}>
                    {label}
                    <span className="block text-[10px] font-normal opacity-70">
                      ${(sub * value).toFixed(2)}
                    </span>
                  </button>
                );
              })}
              <button type="button"
                onClick={() => setTipMode(tipMode === 'custom' ? 'none' : 'custom')}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  tipMode === 'custom'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-neutral-900 text-neutral-400 border border-white/5 hover:border-white/15'
                }`}>
                Custom
              </button>
            </div>
            {tipMode === 'custom' && (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">$</span>
                <input type="number" min="0" step="0.01"
                  value={tipCustom}
                  onChange={e => setTipCustom(e.target.value)}
                  placeholder="0.00" autoFocus
                  className="w-full bg-neutral-900 border border-white/8 rounded-lg pl-7 pr-3 py-2 text-sm text-white outline-none focus:border-amber-500/50" />
              </div>
            )}
            {tipMode !== 'none' && (
              <button type="button"
                onClick={() => { setTipMode('none'); setTipCustom(''); }}
                className="text-[11px] text-neutral-600 hover:text-neutral-400 transition-colors">
                No tip
              </button>
            )}
          </div>

          {/* Redeem toggle */}
          {customer.rewardsBalance > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div className="flex items-center gap-2">
                <Gift size={13} className="text-amber-400" />
                <span className="text-sm text-amber-300">
                  Redeem ${Math.min(customer.rewardsBalance, sub + tax + tip).toFixed(2)} rewards
                </span>
              </div>
              <button onClick={() => setRedeemOn(r => !r)}
                className={`w-10 h-5.5 rounded-full transition-colors relative ${redeemOn ? 'bg-amber-500' : 'bg-neutral-700'}`}
                style={{ height: 22 }}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${redeemOn ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          )}

          {redeemOn && (
            <div className="flex justify-between text-sm">
              <span className="text-amber-400">Rewards applied</span>
              <span className="text-amber-400 font-medium">−${redeemAmt.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-base font-bold border-t border-white/8 pt-2.5">
            <span className="text-white">Total</span>
            <span className="text-white">${total.toFixed(2)}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-amber-400 pt-1">
            <Star size={11} />
            <span>Customer earns <strong>+${earned.toFixed(2)}</strong> rewards on this order</span>
          </div>
        </div>
      )}

      <button onClick={handleComplete} disabled={!sub}
        className="w-full gradient-gold text-black font-bold py-4 rounded-xl text-base hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed">
        Complete Transaction
      </button>
      <button onClick={onBack}
        className="w-full text-xs text-neutral-600 hover:text-neutral-400 transition-colors py-2">
        ← Back
      </button>
    </div>
  );
}

/* ── STEP 3: Receipt ─────────────────────────────────────────────── */
function ReceiptStep({ customer, tx, onNext }) {
  return (
    <div className="flex flex-col items-center text-center gap-5 py-6">
      <div className="w-20 h-20 rounded-full bg-green-500/15 border-2 border-green-500/30 flex items-center justify-center">
        <CheckCircle size={40} className="text-green-400" />
      </div>

      <div>
        <p className="text-xl font-bold text-white">Transaction Complete</p>
        <p className="text-sm text-neutral-400 mt-1">
          Payment processed for <span className="text-white">{customer.name}</span>
        </p>
      </div>

      <div className="glass rounded-2xl p-5 w-full text-left space-y-2.5">
        {[
          { label: 'Subtotal',       value: `$${tx.subtotal.toFixed(2)}` },
          { label: 'Tax',            value: `$${tx.tax.toFixed(2)}` },
          (tx.tip ?? 0) > 0 && { label: 'Tip', value: `$${tx.tip.toFixed(2)}` },
          tx.redeemAmt > 0 && { label: 'Rewards Redeemed', value: `−$${tx.redeemAmt.toFixed(2)}`, accent: 'amber' },
          { label: 'Total Charged',  value: `$${tx.total.toFixed(2)}`, bold: true },
        ].filter(Boolean).map(({ label, value, accent, bold }) => (
          <div key={label} className="flex justify-between items-center">
            <span className={`text-sm ${bold ? 'font-bold text-white' : 'text-neutral-400'}`}>{label}</span>
            <span className={`text-sm font-semibold ${accent === 'amber' ? 'text-amber-400' : bold ? 'text-white' : 'text-white'}`}>{value}</span>
          </div>
        ))}
        <div className="border-t border-white/8 pt-3 flex items-center gap-2">
          <Star size={13} className="text-amber-400" />
          <span className="text-sm text-amber-400 font-semibold">
            +${tx.earned.toFixed(2)} rewards added to account
          </span>
        </div>
      </div>

      <button onClick={onNext}
        className="w-full gradient-gold text-black font-bold py-4 rounded-xl text-sm hover:opacity-90 transition-opacity">
        Next Customer
      </button>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────── */
export default function StaffScanner() {
  const { user, logout } = useAuth();
  const [step, setStep]           = useState('scan');   // 'scan' | 'checkout' | 'receipt'
  const { logAction } = useActivityLog();
  const { addOrder } = useOrderStore();
  const { recordOrder, get: getCustomer } = useCustomerStats();
  const { addNotification } = useNotifications();
  const [customer, setCustomer]   = useState(null);
  const [notFound, setNotFound]   = useState(false);
  const [restaurant, setRestaurant] = useState(restaurants[0].id);
  const [tx, setTx]               = useState(null);

  function handleCustomerFound(c) {
    // Refresh to latest stats in case they've been updated elsewhere
    const fresh = getCustomer(c.id) ?? c;
    setCustomer(fresh);
    setStep('checkout');
  }

  function handleComplete(txData) {
    const restaurantName = restaurants.find(r => r.id === restaurant)?.name ?? 'Unknown';

    // 1. Persist order to the store (shows up in customer history + admin)
    addOrder({
      userId: customer.id,
      restaurantId: restaurant,
      items: txData.items ?? [],
      subtotal: txData.subtotal,
      tax: txData.tax,
      tip: txData.tip ?? 0,
      total: txData.total,
      rewards: txData.earned,
      server: user?.name ?? 'Staff',
    });

    // 2. Update customer stats (balance, lifetime, visit count, tier)
    recordOrder(customer.id, {
      total: txData.total,
      earned: txData.earned,
      redeemed: txData.redeemAmt,
    });

    // 3. Notify the customer
    addNotification({
      userId: customer.id,
      type: 'reward',
      title: `You earned $${txData.earned.toFixed(2)}`,
      body: `From your ${restaurantName} order`,
    });

    // 4. Log the action (anomaly detection)
    logAction({
      actorId: user?.id ?? 'unknown',
      actorName: user?.name ?? 'Unknown Staff',
      actorRole: 'staff',
      action: 'reward.apply',
      targetId: customer.id,
      targetName: customer.name,
      amount: txData.earned,
      details: {
        orderTotal: txData.total,
        subtotal: txData.subtotal,
        rewardAmount: txData.earned,
        redeemed: txData.redeemAmt,
        restaurantId: restaurant,
      },
    });

    setTx(txData);
    setStep('receipt');
  }

  function reset() {
    setStep('scan');
    setCustomer(null);
    setNotFound(false);
    setTx(null);
  }

  return (
    <div className="px-4 pt-6 pb-10 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          {step !== 'scan' && (
            <button onClick={() => setStep(step === 'receipt' ? 'checkout' : 'scan')}
              className="w-8 h-8 rounded-full glass flex items-center justify-center text-neutral-400 hover:text-white transition-colors">
              <ArrowLeft size={15} />
            </button>
          )}
          <div>
            <p className="text-xs text-amber-400 font-bold uppercase tracking-widest">Staff</p>
            <h1 className="text-lg font-bold text-white leading-tight">
              {step === 'scan' ? 'Scan Customer' : step === 'checkout' ? 'Checkout' : 'Receipt'}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500">{user?.name}</span>
          <button onClick={logout}
            className="w-8 h-8 rounded-full glass flex items-center justify-center text-neutral-500 hover:text-red-400 transition-colors">
            <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* Restaurant selector (scan step only) */}
      {step === 'scan' && (
        <div className="glass rounded-2xl px-4 py-3 mb-5">
          <p className="text-xs text-neutral-500 mb-1">Location</p>
          <select value={restaurant} onChange={e => setRestaurant(Number(e.target.value))}
            className="w-full bg-transparent text-white text-sm font-medium outline-none">
            {restaurants.map(r => (
              <option key={r.id} value={r.id} className="bg-neutral-900">
                {r.logo} {r.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {step === 'scan' && (
        <ScanStep
          onCustomerFound={handleCustomerFound}
          notFound={notFound}
          setNotFound={setNotFound}
        />
      )}
      {step === 'checkout' && customer && (
        <CheckoutStep
          customer={customer}
          restaurantId={restaurant}
          onComplete={handleComplete}
          onBack={reset}
        />
      )}
      {step === 'receipt' && customer && tx && (
        <ReceiptStep customer={customer} tx={tx} onNext={reset} />
      )}
    </div>
  );
}
