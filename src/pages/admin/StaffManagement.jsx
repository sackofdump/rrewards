import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useStaffStore } from '../../hooks/useStaffStore';
import { useAuth } from '../../context/AuthContext';
import { useActivityLog } from '../../hooks/useActivityLog';
import { restaurants } from '../../data/mockData';
import {
  ArrowLeft, Plus, Edit2, Trash2, X, UserCog,
  Shield, Mail, Eye, EyeOff, RotateCcw, Utensils
} from 'lucide-react';

function StaffModal({ staff, onSave, onClose }) {
  const isEdit = Boolean(staff);
  const [name, setName]       = useState(staff?.name ?? '');
  const [email, setEmail]     = useState(staff?.email ?? '');
  const [restaurantId, setRestaurantId] = useState(staff?.restaurantId ?? restaurants[0].id);
  const [password, setPassword] = useState(staff?.password ?? '');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  function submit(e) {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim()) return setError('Name and email are required.');
    if (!isEdit && password.length < 6) return setError('Password must be at least 6 characters.');
    try {
      onSave({
        ...(staff ?? {}),
        name: name.trim(),
        email: email.trim(),
        restaurantId: Number(restaurantId),
        password,
      });
      onClose();
    } catch (err) {
      setError(err.message);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg bg-[#0f0f18] border border-white/8 rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-white/5 shrink-0">
          <h2 className="text-lg font-bold text-white">{isEdit ? 'Edit Staff Member' : 'Add Staff Member'}</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto p-5 space-y-3">
          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Name</label>
            <input required value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Mike T."
              className="w-full bg-neutral-900 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-amber-500/50 transition-colors" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Email</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="staff@rewards.com"
              className="w-full bg-neutral-900 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-amber-500/50 transition-colors" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Assigned Restaurant</label>
            <select value={restaurantId} onChange={e => setRestaurantId(e.target.value)}
              className="w-full bg-neutral-900 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500/50 transition-colors">
              {restaurants.map(r => (
                <option key={r.id} value={r.id} className="bg-neutral-900">
                  {r.logo} {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5">
              {isEdit ? 'Password (leave unchanged to keep)' : 'Password'}
            </label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={isEdit ? '••••••••' : 'At least 6 characters'}
                required={!isEdit}
                className="w-full bg-neutral-900 border border-white/8 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-neutral-600 outline-none focus:border-amber-500/50 transition-colors" />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500">
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <p className="text-xs text-neutral-500">
            Staff sign in at <span className="font-mono text-amber-400">/signin</span> with these credentials and get access to the scanner & checkout flow.
          </p>
        </form>

        <div className="p-5 border-t border-white/5 shrink-0">
          <button onClick={submit}
            className="w-full gradient-gold text-black font-bold py-3.5 rounded-xl text-sm hover:opacity-90 transition-opacity">
            {isEdit ? 'Save Changes' : 'Create Staff Account'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function StaffManagement() {
  const { user: actor } = useAuth();
  const { staff, addStaff, updateStaff, removeStaff, resetStaff } = useStaffStore();
  const { logAction } = useActivityLog();
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  function handleSave(data) {
    if (editing) {
      updateStaff(editing.id, data);
      logAction({
        actorId: actor?.id ?? 'unknown', actorName: actor?.name ?? 'Manager', actorRole: 'admin',
        action: 'staff.edit', targetId: data.id, targetName: data.name, amount: null, details: {},
      });
    } else {
      const created = addStaff(data);
      logAction({
        actorId: actor?.id ?? 'unknown', actorName: actor?.name ?? 'Manager', actorRole: 'admin',
        action: 'staff.add', targetId: created.id, targetName: created.name, amount: null, details: {},
      });
    }
    setEditing(null);
  }

  function handleDelete(s) {
    if (!confirm(`Remove ${s.name}? They'll lose access to the scanner.`)) return;
    removeStaff(s.id);
    logAction({
      actorId: actor?.id ?? 'unknown', actorName: actor?.name ?? 'Manager', actorRole: 'admin',
      action: 'staff.remove', targetId: s.id, targetName: s.name, amount: null, details: {},
    });
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
          <h1 className="text-xl font-bold text-white leading-tight">Staff Accounts</h1>
        </div>
      </div>

      <div className="glass rounded-2xl p-4 mb-5 flex items-center gap-3">
        <UserCog size={18} className="text-amber-400 shrink-0" />
        <p className="text-xs text-neutral-400 leading-relaxed">
          Add staff members who can run the scanner and apply rewards at the register. Their activity shows up in the Activity Log with anomaly detection.
        </p>
      </div>

      <button onClick={() => setShowAdd(true)}
        className="w-full gradient-gold text-black font-bold py-3.5 rounded-xl text-sm mb-5 hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
        <Plus size={16} /> Add Staff Member
      </button>

      {staff.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-neutral-600">
          <UserCog size={40} strokeWidth={1} />
          <p className="text-sm">No staff accounts yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {staff.map(s => {
            const r = restaurants.find(x => x.id === s.restaurantId);
            return (
              <div key={s.id} className="glass rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
                  {s.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{s.name}</p>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 flex-wrap">
                    <span className="flex items-center gap-1"><Mail size={10} /> {s.email}</span>
                    {r && <span className="flex items-center gap-1"><Utensils size={10} /> {r.name}</span>}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => setEditing(s)}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => handleDelete(s)}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/15 flex items-center justify-center text-neutral-400 hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button onClick={() => { if (confirm('Reset to demo staff accounts?')) resetStaff(); }}
        className="w-full mt-8 text-xs text-neutral-600 hover:text-neutral-400 transition-colors flex items-center justify-center gap-1.5 py-2">
        <RotateCcw size={11} /> Reset to demo staff
      </button>

      {showAdd  && <StaffModal onSave={handleSave} onClose={() => setShowAdd(false)} />}
      {editing  && <StaffModal staff={editing} onSave={handleSave} onClose={() => setEditing(null)} />}
    </div>
  );
}
