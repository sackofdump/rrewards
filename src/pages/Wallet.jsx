import { useState } from 'react';
import QRCode from 'react-qr-code';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard, Plus, Trash2, Wifi, ChevronRight,
  ShieldCheck, QrCode, X, Check
} from 'lucide-react';

const CARD_TYPES = {
  visa:       { label: 'Visa',       color: '#1a1f71', text: '#fff',     pattern: /^4/ },
  mastercard: { label: 'Mastercard', color: '#252525', text: '#fff',     pattern: /^5[1-5]/ },
  amex:       { label: 'Amex',       color: '#2e77bc', text: '#fff',     pattern: /^3[47]/ },
  discover:   { label: 'Discover',   color: '#e65c00', text: '#fff',     pattern: /^6/ },
  unknown:    { label: 'Card',       color: '#1e1e2e', text: '#fff',     pattern: null },
};

function detectType(num) {
  return Object.values(CARD_TYPES).find(t => t.pattern?.test(num)) ?? CARD_TYPES.unknown;
}

const INITIAL_CARDS = [
  { id: 'c1', last4: '4242', type: 'visa',       expiry: '08/27', name: 'Josh' },
  { id: 'c2', last4: '5555', type: 'mastercard', expiry: '03/26', name: 'Josh' },
];

function LinkedCard({ card, onRemove }) {
  const type = CARD_TYPES[card.type] ?? CARD_TYPES.unknown;
  return (
    <div className="relative flex items-center gap-4 glass rounded-2xl p-4 group">
      <div className="w-12 h-8 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-black tracking-wider"
        style={{ background: type.color, color: type.text }}>
        {type.label.toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">•••• •••• •••• {card.last4}</p>
        <p className="text-xs text-neutral-500">Expires {card.expiry} &nbsp;·&nbsp; {card.name}</p>
      </div>
      <button
        onClick={() => onRemove(card.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-600 hover:text-red-400 p-1"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

function AddCardModal({ onClose, onAdd }) {
  const [num, setNum]     = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv]     = useState('');
  const [name, setName]   = useState('');
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
    const raw = num.replace(/\s/g, '');
    const type = Object.entries(CARD_TYPES).find(([, t]) => t.pattern?.test(raw))?.[0] ?? 'unknown';
    onAdd({ id: `c${Date.now()}`, last4: raw.slice(-4), type, expiry, name });
    setSuccess(true);
    setTimeout(onClose, 1000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
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
            <input
              required value={num}
              onChange={e => setNum(formatNum(e.target.value))}
              placeholder="Card number"
              inputMode="numeric"
              className="w-full bg-neutral-900 border border-white/8 rounded-xl px-4 py-3.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-amber-500/50 transition-colors tracking-widest"
            />
            <div className="flex gap-3">
              <input
                required value={expiry}
                onChange={e => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                inputMode="numeric"
                className="flex-1 bg-neutral-900 border border-white/8 rounded-xl px-4 py-3.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-amber-500/50 transition-colors"
              />
              <input
                required value={cvv}
                onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="CVV"
                inputMode="numeric"
                type="password"
                className="flex-1 bg-neutral-900 border border-white/8 rounded-xl px-4 py-3.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>
            <input
              required value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Name on card"
              className="w-full bg-neutral-900 border border-white/8 rounded-xl px-4 py-3.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-amber-500/50 transition-colors"
            />
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
    </div>
  );
}

function QRSheet({ user, onClose }) {
  const qrValue = `rewards:${user.id}`;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg bg-[#0f0f18] border border-white/8 rounded-t-3xl p-6 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Rewards QR Code</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-neutral-400 mb-6 text-center">
          Show this to the cashier to earn or redeem rewards.
        </p>
        <div className="flex justify-center mb-6">
          <div className="p-5 bg-white rounded-2xl shadow-xl shadow-black/40">
            <QRCode value={qrValue} size={200} fgColor="#080a0f" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs text-neutral-500 font-mono tracking-widest">{user.id.toUpperCase()}</p>
          <p className="text-xs text-neutral-600 mt-1">{user.name} &nbsp;·&nbsp; {user.tier} Member</p>
        </div>
      </div>
    </div>
  );
}

export default function Wallet() {
  const { user } = useAuth();
  const [cards, setCards]         = useState(INITIAL_CARDS);
  const [showAdd, setShowAdd]     = useState(false);
  const [showQR, setShowQR]       = useState(false);

  function removeCard(id) {
    setCards(cs => cs.filter(c => c.id !== id));
  }
  function addCard(card) {
    setCards(cs => [...cs, card]);
  }

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Wallet</h1>
      </div>

      {/* QR Code button */}
      <button
        onClick={() => setShowQR(true)}
        className="w-full glass-gold rounded-2xl p-5 mb-6 flex items-center gap-4 hover:brightness-110 transition-all text-left"
      >
        <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center shrink-0">
          <QrCode size={22} className="text-black" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-white">Rewards QR Code</p>
          <p className="text-xs text-neutral-400 mt-0.5">Show at checkout to earn & redeem</p>
        </div>
        <ChevronRight size={18} className="text-neutral-500 shrink-0" />
      </button>

      {/* Rewards balance */}
      <div className="glass rounded-2xl p-4 mb-6 flex justify-between items-center">
        <div>
          <p className="text-xs text-neutral-500 mb-0.5">Available Rewards</p>
          <p className="text-2xl font-bold text-amber-400">${user.rewardsBalance.toFixed(2)}</p>
        </div>
        <button className="text-xs font-bold text-black px-4 py-2 rounded-xl gradient-gold hover:opacity-90 transition-opacity">
          Redeem
        </button>
      </div>

      {/* Payment methods */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">Payment Methods</p>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
        >
          <Plus size={14} /> Add Card
        </button>
      </div>

      <div className="space-y-3">
        {cards.map(card => (
          <LinkedCard key={card.id} card={card} onRemove={removeCard} />
        ))}
        {cards.length === 0 && (
          <button onClick={() => setShowAdd(true)}
            className="w-full glass rounded-2xl p-5 flex flex-col items-center gap-2 text-neutral-600 hover:text-neutral-400 transition-colors border-dashed">
            <CreditCard size={28} strokeWidth={1.2} />
            <p className="text-sm">No cards linked yet</p>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mt-5 text-xs text-neutral-600">
        <ShieldCheck size={13} className="text-green-500/60 shrink-0" />
        Cards are used to auto-apply rewards at checkout. Payments are processed securely.
      </div>

      {showAdd && <AddCardModal onClose={() => setShowAdd(false)} onAdd={addCard} />}
      {showQR  && <QRSheet user={user} onClose={() => setShowQR(false)} />}
    </div>
  );
}
