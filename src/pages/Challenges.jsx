import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChallenges } from '../hooks/useChallenges';
import { ArrowLeft, Target, Check, Trophy, Lock } from 'lucide-react';

function ChallengeCard({ challenge, onClaim }) {
  const pct = Math.min(100, (challenge.progress / challenge.goal) * 100);
  const canClaim = challenge.completed && !challenge.claimedAt;
  const claimed = Boolean(challenge.claimedAt);

  return (
    <div className={`glass rounded-2xl p-4 ${claimed ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
          claimed ? 'bg-green-500/15 border border-green-500/25'
          : canClaim ? 'bg-amber-500/15 border border-amber-500/25'
          : 'bg-neutral-800/60 border border-white/5'
        }`}>
          {claimed
            ? <Check size={18} className="text-green-400" />
            : canClaim
              ? <Trophy size={18} className="text-amber-400" />
              : <Target size={18} className="text-neutral-400" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-white">{challenge.title}</p>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              +${challenge.reward}
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">{challenge.description}</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-[11px] mb-1.5">
          <span className="text-neutral-500">Progress</span>
          <span className="font-semibold text-white">
            {challenge.unit === 'dollars'
              ? `$${challenge.progress.toFixed(0)} / $${challenge.goal}`
              : `${challenge.progress} / ${challenge.goal}`}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-neutral-800">
          <div className={`h-full rounded-full transition-all ${
            claimed ? 'bg-green-400' : canClaim ? 'gradient-gold' : 'bg-neutral-600'
          }`}
            style={{ width: `${pct}%` }} />
        </div>
      </div>

      {canClaim && (
        <button onClick={() => onClaim(challenge.id)}
          className="w-full mt-3 gradient-gold text-black font-bold py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity">
          Claim ${challenge.reward}
        </button>
      )}
      {claimed && (
        <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
          <Check size={11} /> Claimed · rewards credited to account
        </p>
      )}
    </div>
  );
}

export default function Challenges() {
  const { user } = useAuth();
  const { challenges, claim } = useChallenges(user?.id);

  const active = challenges.filter(c => !c.claimedAt);
  const claimedList = challenges.filter(c => c.claimedAt);

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-white/8 transition-colors">
          <ArrowLeft size={16} className="text-neutral-400" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white leading-tight">Challenges</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Earn bonus rewards this month</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-4 mb-5 flex items-center gap-3">
        <Trophy size={18} className="text-amber-400 shrink-0" />
        <p className="text-xs text-neutral-400 leading-relaxed">
          Complete monthly challenges for <span className="text-amber-400 font-semibold">bonus rewards</span> on top of your standard cashback.
        </p>
      </div>

      {active.length > 0 && (
        <>
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2 px-1">Active</p>
          <div className="space-y-3 mb-6">
            {active.map(c => <ChallengeCard key={c.id} challenge={c} onClaim={claim} />)}
          </div>
        </>
      )}

      {claimedList.length > 0 && (
        <>
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2 px-1">Completed</p>
          <div className="space-y-3">
            {claimedList.map(c => <ChallengeCard key={c.id} challenge={c} onClaim={claim} />)}
          </div>
        </>
      )}
    </div>
  );
}
