import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useActivityLog } from '../../hooks/useActivityLog';
import {
  ArrowLeft, Shield, AlertTriangle, AlertOctagon, Activity as ActivityIcon,
  ShieldAlert, User, Filter
} from 'lucide-react';

const ACTION_LABELS = {
  'reward.apply':         'Applied rewards to order',
  'reward.redeem':        'Redeemed rewards',
  'customer.adjust':      'Adjusted customer balance',
  'customer.deactivate':  'Deactivated customer',
  'customer.activate':    'Reactivated customer',
  'customer.message':     'Sent customer message',
  'settings.update':      'Updated setting',
  'menu.add':             'Added menu item',
  'menu.edit':            'Edited menu item',
  'menu.remove':          'Removed menu item',
  'promo.add':            'Created promotion',
  'promo.edit':           'Edited promotion',
  'promo.remove':         'Deleted promotion',
  'challenge.add':        'Added challenge',
  'challenge.edit':       'Edited challenge',
  'challenge.remove':     'Deleted challenge',
};

const ANOMALY_META = {
  warning:  { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/25' },
  critical: { icon: AlertOctagon,  color: 'text-red-400',   bg: 'bg-red-500/15',   border: 'border-red-500/25' },
  info:     { icon: ActivityIcon,  color: 'text-blue-400',  bg: 'bg-blue-500/10',  border: 'border-blue-500/20' },
};

function formatWhen(iso) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function LogRow({ entry }) {
  const label = ACTION_LABELS[entry.action] ?? entry.action;
  const isStaff = entry.actorRole === 'staff';
  const anomaly = entry.anomaly;

  return (
    <div className={`glass rounded-xl p-4 ${anomaly
      ? anomaly.level === 'critical' ? 'border-red-500/30 bg-red-500/[0.03]' : 'border-amber-500/25 bg-amber-500/[0.03]'
      : ''}`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
          isStaff ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-amber-500/10 border border-amber-500/25'
        }`}>
          <User size={14} className={isStaff ? 'text-blue-400' : 'text-amber-400'} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-sm font-semibold text-white">{entry.actorName}</span>
            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
              isStaff
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {entry.actorRole}
            </span>
          </div>
          <p className="text-sm text-neutral-300">{label}
            {entry.targetName && (
              <> · <span className="text-white font-medium">{entry.targetName}</span></>
            )}
            {entry.amount != null && (
              <> · <span className="text-amber-400 font-semibold">${Math.abs(entry.amount).toFixed(2)}</span></>
            )}
          </p>
          <p className="text-[10px] text-neutral-600 mt-1">{formatWhen(entry.createdAt)}</p>

          {anomaly && (() => {
            const meta = ANOMALY_META[anomaly.level];
            const Icon = meta.icon;
            return (
              <div className={`mt-2 flex items-start gap-2 rounded-lg px-3 py-2 ${meta.bg} border ${meta.border}`}>
                <Icon size={12} className={`${meta.color} shrink-0 mt-0.5`} />
                <p className={`text-[11px] font-semibold ${meta.color}`}>{anomaly.reason}</p>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

export default function Activity() {
  const { entries } = useActivityLog();
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'staff' | 'admin'
  const [onlyFlagged, setOnlyFlagged] = useState(false);

  // Admin can see staff + admin activity (they're overseeing staff).
  // Admin actions are also logged here for transparency; dev has their own view.
  const visibleEntries = useMemo(() => {
    return entries
      .filter(e => e.actorRole !== 'devadmin')
      .filter(e => roleFilter === 'all' || e.actorRole === roleFilter)
      .filter(e => !onlyFlagged || e.anomaly);
  }, [entries, roleFilter, onlyFlagged]);

  const flaggedCount = entries.filter(e => e.anomaly && e.actorRole === 'staff').length;

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
          <h1 className="text-xl font-bold text-white leading-tight">Activity &amp; Anomalies</h1>
        </div>
      </div>

      {flaggedCount > 0 && (
        <div className="rounded-xl bg-red-500/8 border border-red-500/25 px-4 py-3 mb-4 flex items-start gap-2.5">
          <ShieldAlert size={15} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-neutral-200 leading-relaxed">
            <span className="text-red-400 font-bold">{flaggedCount} staff anomal{flaggedCount === 1 ? 'y' : 'ies'}</span> detected.
            Review below — large rewards, high reward ratios, and rapid activity are flagged automatically.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-5">
        <div className="glass rounded-xl p-1 flex flex-1">
          {['all', 'staff', 'admin'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                roleFilter === r
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                  : 'text-neutral-500'
              }`}>
              {r}
            </button>
          ))}
        </div>
        <button onClick={() => setOnlyFlagged(f => !f)}
          className={`px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            onlyFlagged
              ? 'bg-red-500/15 text-red-400 border border-red-500/25'
              : 'glass text-neutral-400'
          }`}>
          <Filter size={12} /> Flagged
        </button>
      </div>

      {/* Entries */}
      {visibleEntries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-neutral-600">
          <ActivityIcon size={40} strokeWidth={1} />
          <p className="text-sm">No activity to show</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visibleEntries.map(e => <LogRow key={e.id} entry={e} />)}
        </div>
      )}
    </div>
  );
}
