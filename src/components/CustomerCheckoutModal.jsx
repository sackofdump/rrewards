import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useIncomingCheckout } from '../hooks/useCheckoutHandoff';
import SignaturePad from './SignaturePad';
import { restaurants } from '../data/mockData';
import { Utensils, Gift, Check, X, Sparkles, Star } from 'lucide-react';

export default function CustomerCheckoutModal() {
  const { user } = useAuth();
  const { taxRate } = useSettings();
  const { pending, approve, decline } = useIncomingCheckout(user?.id);

  const [tipMode, setTipMode] = useState('pct');   // 'pct' | 'custom' | 'none'
  const [tipPct, setTipPct]   = useState(0.18);
  const [tipCustom, setTipCustom] = useState('');
  const [redeemOn, setRedeemOn]   = useState(false);
  const [signature, setSignature] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Reset local state when a new pending transaction arrives
  useEffect(() => {
    setTipMode('pct');
    setTipPct(0.18);
    setTipCustom('');
    setRedeemOn(false);
    setSignature(null);
    setSubmitting(false);
    setConfirmed(false);
  }, [pending?.id]);

  // Hide the confirmation briefly then close
  useEffect(() => {
    if (!confirmed) return;
    const t = setTimeout(() => setConfirmed(false), 2500);
    return () => clearTimeout(t);
  }, [confirmed]);

  if (!pending && !confirmed) return null;

  // Only block customer UI for their own pending transaction
  if (!pending) {
    // Already approved, show success briefly
    return createPortal(
      <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-md">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/15 border-2 border-green-500/30 flex items-center justify-center">
            <Check size={32} className="text-green-400" strokeWidth={3} />
          </div>
          <p className="text-lg font-bold text-white">Payment Approved</p>
          <p className="text-sm text-neutral-400">Thanks! Your receipt is on the way.</p>
        </div>
      </div>,
      document.body
    );
  }

  const restaurant = restaurants.find(r => r.id === pending.restaurantId);
  const sub = pending.subtotal;
  const tax = pending.tax;
  const tip = (() => {
    if (tipMode === 'none') return 0;
    if (tipMode === 'custom') return parseFloat(tipCustom) || 0;
    return sub * tipPct;
  })();
  const redeemAmt = redeemOn
    ? Math.min(Number(user?.rewardsBalance ?? 0), sub + tax + tip)
    : 0;
  const total = Math.max(0, sub + tax + tip - redeemAmt);
  const earned = pending.earned; // staff-computed on subtotal
  const canApprove = Boolean(signature) && !submitting;

  async function handleApprove() {
    if (!canApprove) return;
    setSubmitting(true);
    await approve({ tip, redeemOn, redeemAmt, total, earned, signature });
    setConfirmed(true);
  }

  return createPortal(
    <div className="fixed inset-0 z-[250] bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="min-h-full flex items-end sm:items-center justify-center px-4 py-6">
        <div className="w-full max-w-md bg-[#0f0f18] border border-amber-500/25 rounded-3xl overflow-hidden">
          {/* Header */}
          <div className="relative px-5 pt-6 pb-5"
            style={{ background: 'linear-gradient(135deg, #1a1506 0%, #1e1a08 100%)' }}>
            <div className="absolute inset-0 opacity-20"
              style={{ background: 'radial-gradient(ellipse at 100% 0%, #d4af37 0%, transparent 60%)' }} />
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/25 rounded-full px-2.5 py-1 uppercase tracking-widest mb-3">
                <Sparkles size={10} /> Checkout Request
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">{restaurant?.logo ?? '🍽️'}</span>
                <h2 className="text-lg font-bold text-white">{restaurant?.name ?? 'Restaurant'}</h2>
              </div>
              {pending.staffName && (
                <p className="text-xs text-amber-300/70 mt-1">Server: {pending.staffName}</p>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="px-5 pt-4 pb-3 border-b border-white/5">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Your Order</p>
            <ul className="space-y-1">
              {pending.items.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-neutral-300">
                  <span className="w-5 h-5 rounded bg-neutral-800 text-[10px] text-neutral-400 flex items-center justify-center font-bold shrink-0">
                    {item.qty}
                  </span>
                  <span className="flex-1 truncate">{item.name}</span>
                  <span className="text-neutral-500 text-xs">
                    ${(item.price * item.qty).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Breakdown */}
          <div className="px-5 py-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-400">Subtotal</span>
              <span className="text-white font-medium">${sub.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Tax</span>
              <span className="text-white font-medium">${tax.toFixed(2)}</span>
            </div>

            {/* Tip */}
            <div className="pt-3 border-t border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Add Tip</span>
                {tip > 0 && <span className="text-sm text-white font-semibold">${tip.toFixed(2)}</span>}
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

            {/* Redeem */}
            {Number(user?.rewardsBalance ?? 0) > 0 && (
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <Gift size={13} className="text-amber-400" />
                  <span className="text-sm text-amber-300">
                    Redeem ${Math.min(Number(user?.rewardsBalance ?? 0), sub + tax + tip).toFixed(2)} rewards
                  </span>
                </div>
                <button onClick={() => setRedeemOn(r => !r)}
                  className={`w-10 rounded-full transition-colors relative ${redeemOn ? 'bg-amber-500' : 'bg-neutral-700'}`}
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

            {/* Total */}
            <div className="flex justify-between text-base font-bold border-t border-white/8 pt-2.5">
              <span className="text-white">Total</span>
              <span className="text-white">${total.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-400">
              <Star size={11} />
              <span>You'll earn <strong>+${earned.toFixed(2)}</strong> in rewards</span>
            </div>
          </div>

          {/* Signature */}
          <div className="px-5 pt-4 pb-5 border-t border-white/5">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Signature</p>
            <SignaturePad onChange={setSignature} label="Sign to approve" />
          </div>

          {/* Actions */}
          <div className="p-5 border-t border-white/5 space-y-2">
            <button
              onClick={handleApprove}
              disabled={!canApprove}
              className="w-full gradient-gold text-black font-bold py-4 rounded-xl text-base hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting
                ? <>Processing…</>
                : <><Check size={16} strokeWidth={3} /> Approve & Pay ${total.toFixed(2)}</>
              }
            </button>
            <button onClick={decline}
              className="w-full text-xs text-neutral-500 hover:text-red-400 transition-colors py-2 flex items-center justify-center gap-1">
              <X size={12} /> Cancel checkout
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
