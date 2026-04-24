import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import {
  ArrowLeft, Bell, Gift, Flame, Star, Cake, Sparkles,
  CheckCheck, Trash2, Mail
} from 'lucide-react';

const TYPE_META = {
  reward:   { icon: Star,      color: 'text-amber-400',  bg: 'bg-amber-500/15',  border: 'border-amber-500/25' },
  promo:    { icon: Flame,     color: 'text-rose-400',   bg: 'bg-rose-500/15',   border: 'border-rose-500/25' },
  tier:     { icon: Sparkles,  color: 'text-yellow-300', bg: 'bg-yellow-500/15', border: 'border-yellow-500/25' },
  birthday: { icon: Cake,      color: 'text-pink-400',   bg: 'bg-pink-500/15',   border: 'border-pink-500/25' },
  welcome:  { icon: Gift,      color: 'text-green-400',  bg: 'bg-green-500/15',  border: 'border-green-500/25' },
  message:  { icon: Mail,      color: 'text-blue-400',   bg: 'bg-blue-500/15',   border: 'border-blue-500/25' },
};

function formatWhen(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Notifications() {
  const { user } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead, removeNotification } = useNotifications(user?.id);

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-white/8 transition-colors">
          <ArrowLeft size={16} className="text-neutral-400" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white leading-tight">Notifications</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            className="flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors">
            <CheckCheck size={13} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-neutral-600">
          <Bell size={40} strokeWidth={1} />
          <p className="text-sm">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const meta = TYPE_META[n.type] ?? TYPE_META.welcome;
            const Icon = meta.icon;
            return (
              <div key={n.id}
                onClick={() => !n.read && markRead(n.id)}
                className={`group relative rounded-xl p-4 flex gap-3 transition-all cursor-pointer ${
                  n.read ? 'glass' : 'glass-gold border border-amber-500/20'
                }`}>
                <div className={`w-10 h-10 rounded-xl ${meta.bg} border ${meta.border} flex items-center justify-center shrink-0`}>
                  <Icon size={17} className={meta.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <p className={`text-sm font-bold ${n.read ? 'text-neutral-300' : 'text-white'} flex-1`}>
                      {n.title}
                    </p>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{n.body}</p>
                  <p className="text-[10px] text-neutral-600 mt-1.5">{formatWhen(n.createdAt)}</p>
                </div>
                <button onClick={e => { e.stopPropagation(); removeNotification(n.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-600 hover:text-red-400 self-start">
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
