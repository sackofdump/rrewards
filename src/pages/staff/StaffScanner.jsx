import { useState, useEffect, useRef } from 'react';
import { adminCustomers, restaurants, REWARDS_RATE, tierConfig } from '../../data/mockData';
import { QrCode, CheckCircle, XCircle, ArrowLeft, Utensils, Star } from 'lucide-react';

function CustomerResult({ customer, onApply, onReset }) {
  const [amount, setAmount]   = useState('');
  const [applied, setApplied] = useState(false);
  const tier = tierConfig[customer.tier];
  const earned = amount ? (parseFloat(amount) * REWARDS_RATE).toFixed(2) : null;

  function handleApply() {
    if (!amount || isNaN(parseFloat(amount))) return;
    setApplied(true);
  }

  if (applied) {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/25 flex items-center justify-center">
          <CheckCircle size={32} className="text-green-400" />
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-white">Rewards Applied!</p>
          <p className="text-sm text-neutral-400 mt-1">
            +${earned} added to {customer.name}'s account
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
          <p className="text-lg font-bold text-amber-400">${customer.rewardsBalance.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="glass rounded-xl p-3 flex-1 text-center">
          <p className="text-xs text-neutral-500 mb-0.5">Tier</p>
          <p className="text-sm font-bold" style={{ color: tier.color }}>{customer.tier}</p>
        </div>
        <div className="glass rounded-xl p-3 flex-1 text-center">
          <p className="text-xs text-neutral-500 mb-0.5">Earn Rate</p>
          <p className="text-sm font-bold text-white">{REWARDS_RATE * 100}%</p>
        </div>
        <div className="glass rounded-xl p-3 flex-1 text-center">
          <p className="text-xs text-neutral-500 mb-0.5">Visits</p>
          <p className="text-sm font-bold text-white">{customer.orders}</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Order Total</p>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-semibold">$</span>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full bg-neutral-900 border border-white/8 rounded-xl pl-8 pr-4 py-3.5 text-white text-lg font-semibold outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>
        {earned && (
          <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
            <Star size={11} /> Customer earns <strong>+${earned}</strong> in rewards
          </p>
        )}
      </div>

      <button
        onClick={handleApply}
        disabled={!amount}
        className="w-full gradient-gold text-black font-bold py-4 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Apply Rewards
      </button>
      <button onClick={onReset} className="w-full text-xs text-neutral-600 py-2 hover:text-neutral-400 transition-colors">
        Cancel / Scan again
      </button>
    </div>
  );
}

export default function StaffScanner() {
  const [scanned, setScanned]   = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [manualId, setManualId] = useState('');
  const [restaurant, setRestaurant] = useState(restaurants[0].id);

  function lookupCustomer(uid) {
    const found = adminCustomers.find(c => c.id === uid.toLowerCase());
    if (found) { setScanned(found); setNotFound(false); }
    else        { setNotFound(true); }
  }

  function handleManual(e) {
    e.preventDefault();
    lookupCustomer(manualId.trim());
  }

  function reset() {
    setScanned(null);
    setNotFound(false);
    setManualId('');
  }

  return (
    <div className="min-h-svh bg-[#080a0f] px-4 pt-6 pb-10 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-full glass flex items-center justify-center">
          <Utensils size={15} className="text-amber-400" />
        </div>
        <div>
          <p className="text-xs text-amber-400 font-bold uppercase tracking-widest">Staff View</p>
          <h1 className="text-lg font-bold text-white leading-tight">Scan Customer</h1>
        </div>
      </div>

      <div className="glass rounded-2xl p-3 mb-6">
        <p className="text-xs text-neutral-500 mb-2 px-1">Location</p>
        <select
          value={restaurant}
          onChange={e => setRestaurant(Number(e.target.value))}
          className="w-full bg-transparent text-white text-sm font-medium outline-none px-1 py-1"
        >
          {restaurants.map(r => (
            <option key={r.id} value={r.id} className="bg-neutral-900">
              {r.logo} {r.name}
            </option>
          ))}
        </select>
      </div>

      {!scanned ? (
        <>
          {/* QR scanner placeholder */}
          <div className="glass rounded-2xl overflow-hidden mb-6">
            <div className="aspect-square flex flex-col items-center justify-center gap-4 bg-neutral-900/40 relative">
              <div className="absolute inset-6 border-2 border-amber-400/30 rounded-2xl" />
              <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-amber-400 rounded-tl-xl" />
              <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-amber-400 rounded-tr-xl" />
              <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-amber-400 rounded-bl-xl" />
              <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-amber-400 rounded-br-xl" />
              <QrCode size={48} className="text-neutral-600" strokeWidth={1} />
              <p className="text-sm text-neutral-500 text-center px-8">
                Camera scanner coming soon — use manual lookup below
              </p>
            </div>
          </div>

          <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Manual Lookup</p>
          <form onSubmit={handleManual} className="flex gap-2">
            <input
              value={manualId}
              onChange={e => setManualId(e.target.value)}
              placeholder="Customer ID (e.g. u001)"
              className="flex-1 bg-neutral-900 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-amber-500/50 transition-colors"
            />
            <button type="submit"
              className="gradient-gold text-black font-bold px-5 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity">
              Find
            </button>
          </form>

          {notFound && (
            <div className="flex items-center gap-2 mt-3 text-xs text-red-400">
              <XCircle size={14} /> Customer not found. Check the ID and try again.
            </div>
          )}

          <div className="mt-6 glass rounded-2xl p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-3">Test Customers</p>
            <div className="space-y-2">
              {adminCustomers.filter(c => c.status === 'active').slice(0, 3).map(c => (
                <button key={c.id} onClick={() => lookupCustomer(c.id)}
                  className="w-full flex items-center gap-3 text-left hover:bg-white/3 rounded-xl px-2 py-2 transition-colors">
                  <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center text-black text-xs font-bold shrink-0">
                    {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{c.name}</p>
                    <p className="text-xs text-neutral-500">{c.id}</p>
                  </div>
                  <p className="text-xs text-amber-400 shrink-0">${c.rewardsBalance.toFixed(2)}</p>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <CustomerResult customer={scanned} onReset={reset} />
      )}
    </div>
  );
}
