import { useState, lazy, Suspense } from 'react';
import { adminCustomers, restaurants, REWARDS_RATE, tierConfig } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
const QrCameraScanner = lazy(() => import('../../components/QrCameraScanner'));
import { CheckCircle, XCircle, Star, LogOut, ScanLine } from 'lucide-react';

function parseQr(raw) {
  // expects "rewards:u001"
  if (raw.startsWith('rewards:')) return raw.replace('rewards:', '').trim();
  // fallback: try plain id
  return raw.trim();
}

function CustomerResult({ customer, onReset }) {
  const [amount, setAmount] = useState('');
  const [applied, setApplied] = useState(false);
  const tier = tierConfig[customer.tier];
  const earned = amount ? (parseFloat(amount) * REWARDS_RATE).toFixed(2) : null;

  if (applied) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/25 flex items-center justify-center">
          <CheckCircle size={32} className="text-green-400" />
        </div>
        <div>
          <p className="text-lg font-bold text-white">Rewards Applied!</p>
          <p className="text-sm text-neutral-400 mt-1">
            +${earned} added to <span className="text-white">{customer.name}</span>'s account
          </p>
        </div>
        <button onClick={onReset}
          className="mt-4 gradient-gold text-black font-bold px-8 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity">
          Scan Next Customer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Customer card */}
      <div className="glass rounded-2xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full gradient-gold flex items-center justify-center text-black font-bold shrink-0">
          {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white">{customer.name}</p>
          <p className="text-xs text-neutral-500">{customer.email}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-neutral-500 mb-0.5">Balance</p>
          <p className="text-xl font-bold text-amber-400">${customer.rewardsBalance.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex gap-3">
        {[
          { label: 'Tier',     value: customer.tier,             color: tier.color },
          { label: 'Earn',     value: `${REWARDS_RATE * 100}%`,  color: null },
          { label: 'Visits',   value: customer.orders,           color: null },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass rounded-xl p-3 flex-1 text-center">
            <p className="text-xs text-neutral-500 mb-0.5">{label}</p>
            <p className="text-sm font-bold" style={color ? { color } : { color: '#fff' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Order total entry */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Order Total</p>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-semibold">$</span>
          <input
            type="number" value={amount} onChange={e => setAmount(e.target.value)}
            placeholder="0.00" min="0" step="0.01"
            className="w-full bg-neutral-900 border border-white/8 rounded-xl pl-8 pr-4 py-3.5 text-white text-lg font-semibold outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>
        {earned && (
          <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
            <Star size={11} /> Customer earns <strong className="ml-0.5">+${earned}</strong> in rewards
          </p>
        )}
      </div>

      <button onClick={() => setApplied(true)} disabled={!amount}
        className="w-full gradient-gold text-black font-bold py-4 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed">
        Apply Rewards
      </button>
      <button onClick={onReset} className="w-full text-xs text-neutral-600 py-2 hover:text-neutral-400 transition-colors">
        Cancel / Scan again
      </button>
    </div>
  );
}

export default function StaffScanner() {
  const { user, logout } = useAuth();
  const [customer, setCustomer]   = useState(null);
  const [notFound, setNotFound]   = useState(false);
  const [restaurant, setRestaurant] = useState(restaurants[0].id);
  const [scanning, setScanning]   = useState(false);

  function handleScan(raw) {
    setScanning(false);
    const uid = parseQr(raw);
    const found = adminCustomers.find(c => c.id === uid);
    if (found) { setCustomer(found); setNotFound(false); }
    else        { setNotFound(true); }
  }

  function reset() {
    setCustomer(null);
    setNotFound(false);
    setScanning(false);
  }

  return (
    <div className="min-h-svh bg-[#080a0f] px-4 pt-6 pb-10 max-w-lg mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-amber-400 font-bold uppercase tracking-widest">Staff View</p>
          <h1 className="text-lg font-bold text-white leading-tight">Scan Customer</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500">{user?.name}</span>
          <button onClick={logout}
            className="w-8 h-8 rounded-full glass flex items-center justify-center text-neutral-500 hover:text-red-400 transition-colors">
            <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* Restaurant selector */}
      <div className="glass rounded-2xl px-4 py-3 mb-6">
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

      {customer ? (
        <CustomerResult customer={customer} onReset={reset} />
      ) : (
        <>
          {/* Camera scanner */}
          {scanning ? (
            <div className="mb-4">
              <Suspense fallback={<div className="aspect-square rounded-2xl bg-neutral-900 flex items-center justify-center text-neutral-600 text-sm">Loading camera…</div>}>
                <QrCameraScanner onScan={handleScan} />
              </Suspense>
              <button onClick={() => setScanning(false)}
                className="w-full mt-3 text-xs text-neutral-600 hover:text-neutral-400 transition-colors py-2">
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => { setScanning(true); setNotFound(false); }}
              className="w-full glass-gold rounded-2xl p-6 flex flex-col items-center gap-3 mb-6 hover:brightness-110 transition-all">
              <div className="w-14 h-14 rounded-2xl gradient-gold flex items-center justify-center">
                <ScanLine size={28} className="text-black" />
              </div>
              <div className="text-center">
                <p className="font-bold text-white">Scan QR Code</p>
                <p className="text-xs text-neutral-400 mt-0.5">Tap to open camera</p>
              </div>
            </button>
          )}

          {notFound && (
            <div className="flex items-center gap-2 mb-4 text-xs text-red-400 glass rounded-xl px-4 py-3">
              <XCircle size={14} className="shrink-0" />
              QR code not recognized. Ask the customer to open their Wallet tab and try again.
            </div>
          )}

          {/* Demo shortcuts */}
          <div className="glass rounded-2xl p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-3">Demo — tap to simulate scan</p>
            <div className="space-y-2">
              {adminCustomers.filter(c => c.status === 'active').map(c => (
                <button key={c.id} onClick={() => handleScan(`rewards:${c.id}`)}
                  className="w-full flex items-center gap-3 text-left hover:bg-white/3 rounded-xl px-2 py-2 transition-colors">
                  <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center text-black text-xs font-bold shrink-0">
                    {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{c.name}</p>
                    <p className="text-xs text-neutral-500 font-mono">{c.id}</p>
                  </div>
                  <p className="text-xs text-amber-400 shrink-0">${c.rewardsBalance.toFixed(2)}</p>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
