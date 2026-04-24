import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useReferrals } from '../hooks/useReferrals';
import {
  ArrowLeft, Copy, Check, Share2, Gift, Users, Clock,
  CheckCircle, Mail, MessageCircle
} from 'lucide-react';

export default function Referrals() {
  const { user } = useAuth();
  const { referrals, completedCount, totalEarned, referralBonus } = useReferrals(user?.id);
  const [copied, setCopied] = useState(false);

  const code = user?.referralCode ?? 'REWARDS-DEMO';
  const shareLink = `${window.location.origin}/?ref=${code}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me at Rewards',
          text: `Use my code ${code} to get $${referralBonus} when you join Rewards`,
          url: shareLink,
        });
      } catch { /* user cancelled */ }
    } else {
      handleCopy();
    }
  }

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/profile" className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-white/8 transition-colors">
          <ArrowLeft size={16} className="text-neutral-400" />
        </Link>
        <h1 className="text-xl font-bold text-white">Refer Friends</h1>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl mb-5 p-6"
        style={{ background: 'linear-gradient(135deg, #1a1506 0%, #2d2208 60%, #1a1200 100%)', border: '1px solid rgba(212,175,55,0.3)' }}>
        <div className="absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(ellipse at 100% 0%, #d4af37 0%, transparent 60%)' }} />
        <div className="relative z-10 text-center">
          <div className="w-14 h-14 rounded-full gradient-gold flex items-center justify-center mx-auto mb-3">
            <Gift size={24} className="text-black" />
          </div>
          <p className="text-2xl font-bold text-white">Give ${referralBonus}, Get ${referralBonus}</p>
          <p className="text-sm text-amber-300/70 mt-1 max-w-xs mx-auto">
            Share your code. When a friend joins and visits any location, you both get <span className="text-amber-300 font-semibold">${referralBonus}</span> in rewards.
          </p>
        </div>
      </div>

      {/* Code */}
      <div className="glass-gold rounded-2xl p-4 mb-4 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-300/70 mb-2">Your Code</p>
        <p className="text-2xl font-mono font-bold text-amber-400 tracking-widest">{code}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-5">
        <button onClick={handleCopy}
          className="flex-1 glass rounded-xl p-3 flex items-center justify-center gap-2 text-sm font-semibold text-white hover:bg-white/5 transition-colors">
          {copied ? <><Check size={15} className="text-green-400" /> Copied!</> : <><Copy size={15} /> Copy Link</>}
        </button>
        <button onClick={handleShare}
          className="flex-1 gradient-gold rounded-xl p-3 flex items-center justify-center gap-2 text-sm font-bold text-black hover:opacity-90 transition-opacity">
          <Share2 size={15} /> Share
        </button>
      </div>

      {/* Quick share */}
      <div className="glass rounded-xl p-3 mb-5 flex items-center justify-around">
        <a href={`mailto:?subject=Join%20Rewards&body=Use%20my%20code%20${code}%20-%20${shareLink}`}
          className="flex flex-col items-center gap-1 text-neutral-400 hover:text-amber-400 transition-colors px-3 py-2">
          <Mail size={18} />
          <span className="text-[10px]">Email</span>
        </a>
        <a href={`sms:?body=Use my code ${code} to join Rewards: ${shareLink}`}
          className="flex flex-col items-center gap-1 text-neutral-400 hover:text-amber-400 transition-colors px-3 py-2">
          <MessageCircle size={18} />
          <span className="text-[10px]">SMS</span>
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="glass rounded-xl p-4 text-center">
          <Users size={16} className="text-amber-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-white">{completedCount}</p>
          <p className="text-xs text-neutral-500">Friends Joined</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <Gift size={16} className="text-amber-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-amber-400">${totalEarned.toFixed(2)}</p>
          <p className="text-xs text-neutral-500">You've Earned</p>
        </div>
      </div>

      {/* List */}
      <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2 px-1">Your Referrals</p>
      {referrals.length === 0 ? (
        <div className="glass rounded-2xl py-8 flex flex-col items-center gap-2 text-neutral-500 text-sm">
          <Users size={26} strokeWidth={1} />
          <p>No referrals yet — share your code to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {referrals.map((r, i) => (
            <div key={i} className="glass rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 font-bold text-sm shrink-0">
                {r.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{r.name}</p>
                <p className="text-[11px] text-neutral-500">
                  Joined {new Date(r.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              {r.status === 'completed' ? (
                <div className="flex items-center gap-1 text-xs font-bold text-green-400">
                  <CheckCircle size={12} /> +${r.earned}
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-neutral-500">
                  <Clock size={12} /> Pending
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
