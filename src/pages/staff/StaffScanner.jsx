import { useState, lazy, Suspense } from 'react';
import { adminCustomers, restaurants, REWARDS_RATE, tierConfig } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import {
  ScanLine, XCircle, LogOut, ChevronRight,
  CheckCircle, ArrowLeft, Star, Gift, Receipt
} from 'lucide-react';

const QrCameraScanner = lazy(() => import('../../components/QrCameraScanner'));

const TAX_RATE = 0.08;

function parseQr(raw) {
  if (raw.startsWith('rewards:')) return raw.replace('rewards:', '').trim();
  return raw.trim();
}

/* ── STEP 1: Scan / select customer ─────────────────────────────── */
function ScanStep({ onCustomerFound, notFound, setNotFound }) {
  const [scanning, setScanning] = useState(false);

  function handleScan(raw) {
    setScanning(false);
    const uid = parseQr(raw);
    const found = adminCustomers.find(c => c.id === uid);
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

      <div className="glass rounded-2xl p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-3">
          Demo — tap to simulate scan
        </p>
        <div className="space-y-1">
          {adminCustomers.filter(c => c.status === 'active').map(c => (
            <button key={c.id} onClick={() => handleScan(`rewards:${c.id}`)}
              className="w-full flex items-center gap-3 text-left hover:bg-white/4 rounded-xl px-3 py-2.5 transition-colors group">
              <div className="w-9 h-9 rounded-full gradient-gold flex items-center justify-center text-black text-xs font-bold shrink-0">
                {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-semibold truncate">{c.name}</p>
                <p className="text-xs text-neutral-500">{c.tier} · ${c.rewardsBalance.toFixed(2)} balance</p>
              </div>
              <ChevronRight size={14} className="text-neutral-600 group-hover:text-neutral-400 transition-colors shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

/* ── STEP 2: Checkout ────────────────────────────────────────────── */
function CheckoutStep({ customer, restaurantId, onComplete, onBack }) {
  const [subtotal, setSubtotal]   = useState('');
  const [redeemOn, setRedeemOn]   = useState(false);
  const tier = tierConfig[customer.tier];
  const restaurant = restaurants.find(r => r.id === restaurantId);

  const sub    = parseFloat(subtotal) || 0;
  const tax    = sub * TAX_RATE;
  const earned = sub * REWARDS_RATE;
  const redeemAmt = redeemOn ? Math.min(customer.rewardsBalance, sub + tax) : 0;
  const total  = sub + tax - redeemAmt;

  function handleComplete() {
    if (!sub) return;
    onComplete({ subtotal: sub, tax, earned, redeemAmt, total });
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

      {/* Charge amount */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Subtotal</p>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-lg font-semibold">$</span>
          <input
            type="number" value={subtotal}
            onChange={e => setSubtotal(e.target.value)}
            placeholder="0.00" min="0" step="0.01"
            autoFocus
            className="w-full bg-neutral-900 border border-white/8 rounded-xl pl-9 pr-4 py-4 text-white text-2xl font-bold outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Breakdown */}
      {sub > 0 && (
        <div className="glass rounded-2xl p-4 space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-400">Subtotal</span>
            <span className="text-white font-medium">${sub.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-400">Tax (8%)</span>
            <span className="text-white font-medium">${tax.toFixed(2)}</span>
          </div>

          {/* Redeem toggle */}
          {customer.rewardsBalance > 0 && (
            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              <div className="flex items-center gap-2">
                <Gift size={13} className="text-amber-400" />
                <span className="text-sm text-amber-300">
                  Redeem ${Math.min(customer.rewardsBalance, sub + tax).toFixed(2)} rewards
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
          { label: 'Tax (8%)',       value: `$${tx.tax.toFixed(2)}` },
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
  const [customer, setCustomer]   = useState(null);
  const [notFound, setNotFound]   = useState(false);
  const [restaurant, setRestaurant] = useState(restaurants[0].id);
  const [tx, setTx]               = useState(null);

  function handleCustomerFound(c) {
    setCustomer(c);
    setStep('checkout');
  }

  function handleComplete(txData) {
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
