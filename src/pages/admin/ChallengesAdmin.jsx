import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useChallenges } from '../../hooks/useChallenges';
import {
  ArrowLeft, Plus, Edit2, Trash2, X, Target,
  Shield, Trophy, RotateCcw
} from 'lucide-react';

const UNIT_OPTIONS = [
  { value: 'restaurants',    label: 'Unique restaurants visited', goalLabel: 'restaurants' },
  { value: 'dollars',        label: 'Dollars spent',              goalLabel: 'dollars ($)' },
  { value: 'weekend_visits', label: 'Weekend visits (Fri/Sat)',   goalLabel: 'visits' },
];

function ChallengeModal({ challenge, onSave, onClose }) {
  const isEdit = Boolean(challenge);
  const [title, setTitle]             = useState(challenge?.title ?? '');
  const [description, setDescription] = useState(challenge?.description ?? '');
  const [reward, setReward]           = useState(challenge?.reward?.toString() ?? '10');
  const [unit, setUnit]               = useState(challenge?.unit ?? 'restaurants');
  const [goal, setGoal]               = useState(challenge?.goal?.toString() ?? '3');

  function submit(e) {
    e.preventDefault();
    const numReward = parseFloat(reward);
    const numGoal = parseFloat(goal);
    if (!title.trim() || isNaN(numReward) || isNaN(numGoal)) return;
    onSave({
      ...(challenge ?? {}),
      title: title.trim(),
      description: description.trim(),
      reward: numReward,
      unit, goal: numGoal,
    });
    onClose();
  }

  const selectedUnit = UNIT_OPTIONS.find(u => u.value === unit);

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg bg-[#0f0f18] border border-white/8 rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-white/5 shrink-0">
          <h2 className="text-lg font-bold text-white">{isEdit ? 'Edit Challenge' : 'New Challenge'}</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Title</label>
            <input required value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Restaurant Explorer"
              className="w-full bg-neutral-900 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-amber-500/50 transition-colors" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Visit 3 different restaurants this month"
              rows={2}
              className="w-full bg-neutral-900 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-amber-500/50 transition-colors resize-none" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Reward</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
              <input required type="number" min="0" step="1" value={reward} onChange={e => setReward(e.target.value)}
                className="w-full bg-neutral-900 border border-white/8 rounded-xl pl-8 pr-4 py-3 text-sm text-white outline-none focus:border-amber-500/50 transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Metric</label>
            <select value={unit} onChange={e => setUnit(e.target.value)}
              className="w-full bg-neutral-900 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500/50 transition-colors">
              {UNIT_OPTIONS.map(u => (
                <option key={u.value} value={u.value} className="bg-neutral-900">{u.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5">
              Goal ({selectedUnit?.goalLabel})
            </label>
            <input required type="number" min="1" step="1" value={goal} onChange={e => setGoal(e.target.value)}
              className="w-full bg-neutral-900 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500/50 transition-colors" />
          </div>

          <p className="text-xs text-neutral-500">
            Customers see progress auto-calculated from their orders each month.
          </p>
        </form>

        <div className="p-5 border-t border-white/5 shrink-0">
          <button onClick={submit}
            className="w-full gradient-gold text-black font-bold py-3.5 rounded-xl text-sm hover:opacity-90 transition-opacity">
            {isEdit ? 'Save Changes' : 'Create Challenge'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function ChallengesAdmin() {
  const { challenges, addChallenge, updateChallenge, removeChallenge, resetChallenges } = useChallenges();
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  function handleSave(data) {
    if (editing) updateChallenge(editing.id, data);
    else         addChallenge(data);
    setEditing(null);
  }
  function handleDelete(id) {
    if (confirm('Delete this challenge?')) removeChallenge(id);
  }

  return (
    <div className="px-4 pt-6 pb-10 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin" className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-white/8 transition-colors">
          <ArrowLeft size={16} className="text-neutral-400" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <Shield size={12} className="text-amber-400" />
            <p className="text-xs text-amber-400 uppercase tracking-widest font-bold">Manager</p>
          </div>
          <h1 className="text-xl font-bold text-white leading-tight">Challenges</h1>
        </div>
      </div>

      <div className="glass rounded-2xl p-4 mb-5 flex items-center gap-3">
        <Trophy size={18} className="text-amber-400 shrink-0" />
        <p className="text-xs text-neutral-400 leading-relaxed">
          Monthly challenges shown on the customer home page. Progress is calculated automatically from each customer's orders.
        </p>
      </div>

      <button onClick={() => setShowAdd(true)}
        className="w-full gradient-gold text-black font-bold py-3.5 rounded-xl text-sm mb-5 hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
        <Plus size={16} /> New Challenge
      </button>

      {challenges.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-neutral-600">
          <Target size={40} strokeWidth={1} />
          <p className="text-sm">No challenges yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {challenges.map(ch => {
            const unit = UNIT_OPTIONS.find(u => u.value === ch.unit);
            return (
              <div key={ch.id} className="glass rounded-2xl p-4">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0">
                    <Target size={16} className="text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-white">{ch.title}</p>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        +${ch.reward}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">{ch.description}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => setEditing(ch)}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => handleDelete(ch.id)}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/15 flex items-center justify-center text-neutral-400 hover:text-red-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-neutral-400 flex items-center justify-between pt-2 border-t border-white/5">
                  <span>Goal: <span className="text-white font-semibold">
                    {ch.unit === 'dollars' ? `$${ch.goal}` : ch.goal} {unit?.goalLabel}
                  </span></span>
                  <span className="text-[10px] uppercase tracking-widest text-neutral-600">
                    Resets monthly
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button onClick={() => { if (confirm('Reset challenges to demo defaults?')) resetChallenges(); }}
        className="w-full mt-8 text-xs text-neutral-600 hover:text-neutral-400 transition-colors flex items-center justify-center gap-1.5 py-2">
        <RotateCcw size={11} /> Reset to demo defaults
      </button>

      {showAdd  && <ChallengeModal onSave={handleSave} onClose={() => setShowAdd(false)} />}
      {editing  && <ChallengeModal challenge={editing} onSave={handleSave} onClose={() => setEditing(null)} />}
    </div>
  );
}
