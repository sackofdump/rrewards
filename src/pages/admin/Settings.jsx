import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useActivityLog } from '../../hooks/useActivityLog';
import {
  ArrowLeft, Shield, Percent, Receipt, Check,
  RotateCcw, TrendingUp, Users, Cake, DollarSign
} from 'lucide-react';

function RatePreset({ label, value, current, onSelect }) {
  const active = Math.abs(current - value) < 0.001;
  return (
    <button onClick={() => onSelect(value)}
      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
        active
          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
          : 'bg-neutral-900 text-neutral-400 border border-white/5 hover:border-white/15'
      }`}>
      {label}
    </button>
  );
}

export default function Settings() {
  const { user: actor } = useAuth();
  const { logAction } = useActivityLog();
  const { rewardRate, taxRate, referralBonus, birthdayBonus, update, reset } = useSettings();
  const [rewardInput, setRewardInput] = useState((rewardRate * 100).toString());
  const [taxInput, setTaxInput]       = useState((taxRate * 100).toString());
  const [referralInput, setReferralInput] = useState(String(referralBonus));
  const [birthdayInput, setBirthdayInput] = useState(String(birthdayBonus));
  const [saved, setSaved] = useState(false);

  function handleSave() {
    const r = parseFloat(rewardInput);
    const t = parseFloat(taxInput);
    const ref = parseFloat(referralInput);
    const bd  = parseFloat(birthdayInput);
    const patch = {};
    const changes = [];
    if (!isNaN(r)   && r   >= 0 && r   <= 100 && r / 100 !== rewardRate) { patch.rewardRate    = r / 100; changes.push({ key: 'rewardRate',    oldValue: rewardRate,    newValue: r / 100 }); }
    if (!isNaN(t)   && t   >= 0 && t   <= 100 && t / 100 !== taxRate)    { patch.taxRate       = t / 100; changes.push({ key: 'taxRate',       oldValue: taxRate,       newValue: t / 100 }); }
    if (!isNaN(ref) && ref >= 0 && ref !== referralBonus)                { patch.referralBonus = ref;     changes.push({ key: 'referralBonus', oldValue: referralBonus, newValue: ref }); }
    if (!isNaN(bd)  && bd  >= 0 && bd  !== birthdayBonus)                { patch.birthdayBonus = bd;      changes.push({ key: 'birthdayBonus', oldValue: birthdayBonus, newValue: bd }); }
    update(patch);
    changes.forEach(change => {
      logAction({
        actorId: actor?.id ?? 'unknown',
        actorName: actor?.name ?? 'Manager',
        actorRole: 'admin',
        action: 'settings.update',
        targetId: null,
        targetName: null,
        amount: null,
        details: change,
      });
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    if (!confirm('Reset all settings to defaults?')) return;
    reset();
    setRewardInput('3');
    setTaxInput('8');
    setReferralInput('10');
    setBirthdayInput('10');
  }

  function setRewardPreset(r) {
    setRewardInput(String(r * 100));
    update({ rewardRate: r });
  }

  // Demo projections
  const monthlyRevenue = 50000; // illustrative
  const rewardCostMonthly = monthlyRevenue * (parseFloat(rewardInput) / 100 || 0);

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
          <h1 className="text-xl font-bold text-white leading-tight">Settings</h1>
        </div>
      </div>

      {/* Reward Rate */}
      <div className="glass rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Percent size={15} className="text-amber-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Reward Rate</h2>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed mb-4">
          Percentage of the pre-tax subtotal customers earn as rewards on every purchase. Applies across all restaurants.
        </p>

        {/* Presets */}
        <div className="flex gap-2 mb-4">
          <RatePreset label="1%" value={0.01} current={rewardRate} onSelect={setRewardPreset} />
          <RatePreset label="2%" value={0.02} current={rewardRate} onSelect={setRewardPreset} />
          <RatePreset label="3%" value={0.03} current={rewardRate} onSelect={setRewardPreset} />
          <RatePreset label="5%" value={0.05} current={rewardRate} onSelect={setRewardPreset} />
          <RatePreset label="10%" value={0.10} current={rewardRate} onSelect={setRewardPreset} />
        </div>

        {/* Custom input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Custom Value</label>
          <div className="relative">
            <input
              type="number" step="0.01" min="0" max="100"
              value={rewardInput}
              onChange={e => setRewardInput(e.target.value)}
              className="w-full bg-neutral-900 border border-white/8 rounded-xl px-4 py-3 pr-10 text-sm text-white outline-none focus:border-amber-500/50 transition-colors"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 font-semibold">%</span>
          </div>
        </div>
      </div>

      {/* Tax Rate */}
      <div className="glass rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Receipt size={15} className="text-neutral-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Tax Rate</h2>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed mb-4">
          Applied at checkout on top of the subtotal.
        </p>
        <div className="relative">
          <input
            type="number" step="0.01" min="0" max="100"
            value={taxInput}
            onChange={e => setTaxInput(e.target.value)}
            className="w-full bg-neutral-900 border border-white/8 rounded-xl px-4 py-3 pr-10 text-sm text-white outline-none focus:border-amber-500/50 transition-colors"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 font-semibold">%</span>
        </div>
      </div>

      {/* Referral Bonus */}
      <div className="glass rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Users size={15} className="text-amber-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Referral Bonus</h2>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed mb-4">
          Amount credited to <span className="text-white font-semibold">both</span> the referrer and the new customer when the referral completes their first visit.
        </p>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
          <input
            type="number" min="0" step="1"
            value={referralInput}
            onChange={e => setReferralInput(e.target.value)}
            className="w-full bg-neutral-900 border border-white/8 rounded-xl pl-8 pr-4 py-3 text-sm text-white outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Birthday Bonus */}
      <div className="glass rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Cake size={15} className="text-pink-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Birthday Bonus</h2>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed mb-4">
          Automatically credited to a customer's rewards balance on their birthday each year.
        </p>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
          <input
            type="number" min="0" step="1"
            value={birthdayInput}
            onChange={e => setBirthdayInput(e.target.value)}
            className="w-full bg-neutral-900 border border-white/8 rounded-xl pl-8 pr-4 py-3 text-sm text-white outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Projection */}
      <div className="glass-gold rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={13} className="text-amber-400" />
          <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Cost Projection</p>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">
          At ${monthlyRevenue.toLocaleString()}/mo revenue and{' '}
          <span className="text-white font-semibold">{parseFloat(rewardInput) || 0}%</span> reward rate,
          you'd issue <span className="text-amber-400 font-bold">${rewardCostMonthly.toFixed(0)}/mo</span>{' '}
          in rewards.
        </p>
      </div>

      {/* Save */}
      <button onClick={handleSave}
        className="w-full gradient-gold text-black font-bold py-3.5 rounded-xl text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mb-3">
        {saved ? <><Check size={16} /> Saved!</> : 'Save Settings'}
      </button>

      <button onClick={handleReset}
        className="w-full text-xs text-neutral-600 hover:text-red-400 transition-colors flex items-center justify-center gap-1.5 py-2">
        <RotateCcw size={11} /> Reset to defaults (3% rewards, 8% tax)
      </button>
    </div>
  );
}
