import { useState } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'react-qr-code';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard, Plus, Trash2, ChevronRight,
  ShieldCheck, QrCode, X, Check, ArrowLeft
} from 'lucide-react';

const CARD_TYPES = {
  visa:       { label: 'Visa',       color: '#1a1f71', pattern: /^4/ },
  mastercard: { label: 'Mastercard', color: '#252525', pattern: /^5[1-5]/ },
  amex:       { label: 'Amex',       color: '#2e77bc', pattern: /^3[47]/ },
  discover:   { label: 'Discover',   color: '#e65c00', pattern: /^6/ },
  unknown:    { label: 'Card',       color: '#1e1e2e', pattern: null },
};

const INITIAL_CARDS = [
  { id: 'c1', last4: '4242', type: 'visa',       expiry: '08/27', name: 'Josh' },
  { id: 'c2', last4: '5555', type: 'mastercard', expiry: '03/26', name: 'Josh' },
];

function LinkedCard({ card, onRemove }) {
  const type = CARD_TYPES[card.type] ?? CARD_TYPES.unknown;
  return (
    <div className="relative flex items-center gap-4 glass rounded-2xl p-4 group">
      <div className="w-12 h-8 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-black tracking-wider text-white"
        style={{ background: type.color }}>
        {type.label.toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">•••• •••• •••• {card.last4}</p>
        <p className="text-xs text-neutral-500">Expires {card.expiry} &nbsp;·&nbsp; {card.name}</p>
      </div>
      <button onClick={() => onRemove(card.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-600 hover:text-red-400 p-1">
        <Trash2 size={15} />
      </button>
    </div>
  );
}

function AddCardModal({ onClose, onAdd }) {
  const [num, setNum]       = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv]       = useState('');
  const [name, setName]     = useState('');
  const [success, setSuccess] = useState(false);

  function formatNum(v) {
    return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  }
  function formatExpiry(v) {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
  }
  function handleSubmit(e) {
    e.preventDefault();
    const raw  = num.replace(/\s/g, '');
    const type = Object.entries(CARD_TYPES).find(([, t]) => t.pattern?.test(raw))?.[0] ?? 'unknown';
    onAdd({ id: `c${Date.now()}`, last4: raw.slice(-4), type, expiry, name });
    setSuccess(true);
    setTimeout(onClose, 1000);
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-[#0f0f18] border border-white/8 rounded-t-3xl p-6 pb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Add Payment Method</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        {success ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
              <Check size={28} className="text-green-400" />
            </div>
            <p className="text-white font-semibold">Card added!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input required value={num} onChange={e => setNum(formatNum(e.target.value))}
              placeholder="Card number" inputMode="numeric"
              className="w-full bg-neutral-900 border border-white/8 rounded-xl px-4 py-3.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-amber-500/50 transition-colors tracking-widest" />
            <div className="flex gap-3">
              <input required value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY" inputMode="numeric"
                className="flex-1 bg-neutral-900 border border-white/8 rounded-xl px-4 py-3.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-amber-500/50 transition-colors" />
              <input required value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="CVV" inputMode="numeric" type="password"
                className="flex-1 bg-neutral-900 border border-white/8 rounded-xl px-4 py-3.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-amber-500/50 transition-colors" />
            </div>
            <input required value={name} onChange={e => setName(e.target.value)}
              placeholder="Name on card"
              className="w-full bg-neutral-900 border border-white/8 rounded-xl px-4 py-3.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-amber-500/50 transition-colors" />
            <div className="flex items-center gap-2 text-xs text-neutral-500 pt-1">
              <ShieldCheck size={13} className="text-green-400 shrink-0" />
              Your card info is encrypted and never stored on our servers.
            </div>
            <button type="submit"
              className="w-full gradient-gold text-black font-bold py-3.5 rounded-xl text-sm mt-2 hover:opacity-90 transition-opacity">
              Add Card
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}

function QRView({ user, onBack }) {
  const qrValue = `rewards:${user.id}`;
  return (
    <div className="flex flex-col min-h-full px-4 pt-6 pb-8 max-w-lg mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors mb-8">
        <ArrowLeft size={18} /> Back to Wallet
      </button>

      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-widest font-semibold text-center mb-1">Rewards QR Code</p>
          <h1 className="text-2xl font-bold text-white text-center">Show to Cashier</h1>
        </div>

        <div className="p-6 bg-white rounded-3xl shadow-2xl shadow-black/50">
          <QRCode value={qrValue} size={220} fgColor="#080a0f" bgColor="#ffffff" />
        </div>

        <div className="text-center glass rounded-2xl px-6 py-4 w-full">
          <p className="text-xs text-neutral-500 mb-1">Member ID</p>
          <p className="text-base font-mono font-bold text-white tracking-widest">{user.id.toUpperCase()}</p>
          <p className="text-xs text-neutral-500 mt-1">{user.name} &nbsp;·&nbsp; {user.tier} Member</p>
        </div>

        <p className="text-xs text-neutral-600 text-center px-8">
          The cashier will scan this code to apply rewards to your order.
        </p>
      </div>
    </div>
  );
}

export default function Wallet() {
  const { user } = useAuth();
  const [cards, setCards]   = useState(INITIAL_CARDS);
  const [showAdd, setShowAdd] = useState(false);
  const [showQR, setShowQR]   = useState(false);

  if (showQR) return <QRView user={user} onBack={() => setShowQR(false)} />;

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-white tracking-tight mb-6">Wallet</h1>

      <button onClick={() => setShowQR(true)}
        className="w-full glass-gold rounded-2xl p-5 mb-6 flex items-center gap-4 hover:brightness-110 transition-all text-left">
        <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center shrink-0">
          <QrCode size={22} className="text-black" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-white">Rewards QR Code</p>
          <p className="text-xs text-neutral-400 mt-0.5">Show at checkout to earn & redeem</p>
        </div>
        <ChevronRight size={18} className="text-neutral-500 shrink-0" />
      </button>

      <div className="glass rounded-2xl p-4 mb-6 flex justify-between items-center">
        <div>
          <p className="text-xs text-neutral-500 mb-0.5">Available Rewards</p>
          <p className="text-2xl font-bold text-amber-400">${user.rewardsBalance.toFixed(2)}</p>
        </div>
        <button className="text-xs font-bold text-black px-4 py-2 rounded-xl gradient-gold hover:opacity-90 transition-opacity">
          Redeem
        </button>
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">Payment Methods</p>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors">
          <Plus size={14} /> Add Card
        </button>
      </div>

      <div className="space-y-3">
        {cards.map(card => (
          <LinkedCard key={card.id} card={card} onRemove={id => setCards(cs => cs.filter(c => c.id !== id))} />
        ))}
        {cards.length === 0 && (
          <button onClick={() => setShowAdd(true)}
            className="w-full glass rounded-2xl p-5 flex flex-col items-center gap-2 text-neutral-600 hover:text-neutral-400 transition-colors">
            <CreditCard size={28} strokeWidth={1.2} />
            <p className="text-sm">No cards linked yet</p>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mt-5 text-xs text-neutral-600">
        <ShieldCheck size={13} className="text-green-500/60 shrink-0" />
        Cards are used to auto-apply rewards at checkout. Payments are processed securely.
      </div>

      {showAdd && <AddCardModal onClose={() => setShowAdd(false)} onAdd={card => setCards(cs => [...cs, card])} />}
    </div>
  );
}
