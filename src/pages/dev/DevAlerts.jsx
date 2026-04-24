import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAllActivityLogs } from '../../hooks/useActivityLog';
import {
  Terminal, LogOut, AlertOctagon, AlertTriangle, ShieldAlert,
  User, Check, Sparkles, CheckCheck
} from 'lucide-react';

const ACTION_LABELS = {
  'customer.adjust':     'Adjusted customer balance',
  'customer.deactivate': 'Deactivated customer',
  'customer.activate':   'Reactivated customer',
  'customer.message':    'Sent customer message',
  'settings.update':     'Updated setting',
  'reward.apply':        'Applied rewards to order',
  'promo.add':           'Created promotion',
  'promo.remove':        'Deleted promotion',
  'menu.add':            'Added menu item',
  'menu.remove':         'Removed menu item',
  'staff.add':           'Added staff member',
  'staff.remove':        'Removed staff member',
  'staff.edit':          'Edited staff member',
};

function formatWhen(iso) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function AlertCard({ entry, onMarkRead }) {
  const critical = entry.anomaly?.level === 'critical';
  const label = ACTION_LABELS[entry.action] ?? entry.action;
  const isRead = Boolean(entry.readByDev);
  return (
    <div className={`rounded-xl p-4 border transition-opacity ${isRead ? 'opacity-50' : ''} ${
      critical ? 'bg-red-500/8 border-red-500/30' : 'bg-amber-500/8 border-amber-500/25'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
          critical ? 'bg-red-500/15 border border-red-500/30' : 'bg-amber-500/15 border border-amber-500/25'
        }`}>
          {critical
            ? <AlertOctagon size={15} className="text-red-400" />
            : <AlertTriangle size={15} className="text-amber-400" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
              critical ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
            }`}>
              {entry.anomaly.level}
            </span>
            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
              entry.actorRole === 'admin'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
            }`}>
              {entry.actorRole === 'admin' ? 'manager' : entry.actorRole}
            </span>
            {entry.env && (
              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                entry.env === 'live'
                  ? 'bg-green-500/15 text-green-400 border border-green-500/25'
                  : 'bg-neutral-700/50 text-neutral-400 border border-neutral-600'
              }`}>
                {entry.env}
              </span>
            )}
            {isRead && (
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-neutral-700/50 text-neutral-400 flex items-center gap-0.5">
                <Check size={9} /> Reviewed
              </span>
            )}
            <span className="text-xs text-neutral-400">{entry.actorName}</span>
          </div>
          <p className="text-sm text-white font-semibold">{entry.anomaly.reason}</p>
          <p className="text-xs text-neutral-500 mt-1">
            {label}
            {entry.targetName && <> · {entry.targetName}</>}
            {entry.amount != null && <> · ${Math.abs(entry.amount).toFixed(2)}</>}
          </p>
          <p className="text-[10px] text-neutral-600 mt-1.5">{formatWhen(entry.createdAt)}</p>
        </div>
        {!isRead && onMarkRead && (
          <button onClick={() => onMarkRead(entry.id)}
            className="shrink-0 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-neutral-300 hover:text-white transition-colors flex items-center gap-1">
            <Check size={11} /> Mark read
          </button>
        )}
      </div>
    </div>
  );
}

function QuietRow({ entry }) {
  const label = ACTION_LABELS[entry.action] ?? entry.action;
  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0 text-xs">
      <User size={12} className="text-neutral-500 shrink-0" />
      <span className="text-neutral-400 shrink-0">{entry.actorName}</span>
      <span className="text-neutral-600">·</span>
      <span className="text-neutral-400 flex-1 truncate">{label}</span>
      <span className="text-neutral-600 shrink-0">{formatWhen(entry.createdAt)}</span>
    </div>
  );
}

export default function DevAlerts() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { entries, markRead, markAllRead } = useAllActivityLogs();
  const [showReviewed, setShowReviewed] = useState(false);

  const adminAlertsAll = useMemo(() =>
    entries.filter(e => e.actorRole === 'admin' && e.anomaly),
    [entries]
  );
  const staffAlertsAll = useMemo(() =>
    entries.filter(e => e.actorRole === 'staff' && e.anomaly),
    [entries]
  );
  const adminAlerts = showReviewed ? adminAlertsAll : adminAlertsAll.filter(a => !a.readByDev);
  const staffAlerts = showReviewed ? staffAlertsAll : staffAlertsAll.filter(a => !a.readByDev);

  const unreadAdmin = adminAlertsAll.filter(a => !a.readByDev).length;
  const unreadStaff = staffAlertsAll.filter(a => !a.readByDev).length;
  const unreadTotal = unreadAdmin + unreadStaff;

  const recentAdminActions = useMemo(() =>
    entries.filter(e => e.actorRole === 'admin').slice(0, 20),
    [entries]
  );

  function signOut() {
    logout();
    navigate('/login');
  }

  return (
    <div className="px-4 pt-6 pb-10 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-400/30 flex items-center justify-center">
            <Terminal size={15} className="text-violet-400" />
          </div>
          <div>
            <p className="text-xs text-violet-400 font-bold uppercase tracking-widest">Dev</p>
            <h1 className="text-xl font-bold text-white leading-tight">Security Alerts</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">{user?.name}</span>
          <button onClick={signOut}
            className="w-8 h-8 rounded-full glass flex items-center justify-center text-neutral-500 hover:text-red-400 transition-colors">
            <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* Banner */}
      <div className="rounded-xl bg-violet-500/8 border border-violet-400/20 px-4 py-3 mb-5 flex items-start gap-2.5">
        <ShieldAlert size={14} className="text-violet-400 shrink-0 mt-0.5" />
        <p className="text-xs text-neutral-300 leading-relaxed">
          Alerts can be <span className="text-white font-semibold">marked as reviewed</span> but not deleted — every flag stays in the audit trail permanently.
        </p>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-red-400">
            {adminAlertsAll.filter(a => a.anomaly.level === 'critical' && !a.readByDev).length}
          </p>
          <p className="text-xs text-neutral-500 mt-0.5">Critical · New</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-amber-400">
            {(adminAlertsAll.filter(a => a.anomaly.level === 'warning' && !a.readByDev).length +
              staffAlertsAll.filter(a => a.anomaly.level === 'warning' && !a.readByDev).length)}
          </p>
          <p className="text-xs text-neutral-500 mt-0.5">Warnings · New</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-white">{entries.length}</p>
          <p className="text-xs text-neutral-500 mt-0.5">Total Events</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 mb-5">
        <button onClick={() => setShowReviewed(s => !s)}
          className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
            showReviewed
              ? 'bg-violet-500/15 text-violet-400 border border-violet-400/30'
              : 'glass text-neutral-400 hover:text-white'
          }`}>
          {showReviewed ? 'Showing all alerts' : `Hiding reviewed (${(adminAlertsAll.length + staffAlertsAll.length) - unreadTotal})`}
        </button>
        {unreadTotal > 0 && (
          <button onClick={markAllRead}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/25 hover:brightness-110 transition-all flex items-center gap-1.5">
            <CheckCheck size={12} /> Mark all read
          </button>
        )}
      </div>

      {/* Admin-only alerts */}
      <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-2 px-1">
        Manager-Level Alerts ({adminAlerts.length}
        {!showReviewed && unreadAdmin > 0 && <> · {unreadAdmin} new</>})
      </p>
      {adminAlerts.length === 0 ? (
        <div className="glass rounded-xl px-4 py-6 text-center mb-5">
          <Sparkles size={20} className="text-green-400 mx-auto mb-2" />
          <p className="text-xs text-neutral-400">
            {adminAlertsAll.length === 0 ? 'No manager anomalies detected.' : 'All reviewed.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2 mb-5">
          {adminAlerts.map(e => <AlertCard key={e.id} entry={e} onMarkRead={markRead} />)}
        </div>
      )}

      {/* Staff alerts */}
      <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2 px-1">
        Staff Alerts ({staffAlerts.length}
        {!showReviewed && unreadStaff > 0 && <> · {unreadStaff} new</>})
      </p>
      {staffAlerts.length === 0 ? (
        <div className="glass rounded-xl px-4 py-4 text-center mb-5">
          <p className="text-xs text-neutral-500">
            {staffAlertsAll.length === 0 ? 'No staff anomalies detected.' : 'All reviewed.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2 mb-5">
          {staffAlerts.map(e => <AlertCard key={e.id} entry={e} onMarkRead={markRead} />)}
        </div>
      )}

      {/* Recent admin actions log */}
      <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2 px-1">
        Recent Manager Activity
      </p>
      <div className="glass rounded-xl p-3">
        {recentAdminActions.length === 0
          ? <p className="text-xs text-neutral-500 text-center py-4">No manager activity yet</p>
          : recentAdminActions.map(e => <QuietRow key={e.id} entry={e} />)
        }
      </div>
    </div>
  );
}
