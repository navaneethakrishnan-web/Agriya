import { useEffect, useState } from 'react';
import { Award, Star, TrendingUp } from 'lucide-react';
import { Card, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { getLeaderboard, REDEEMABLES, BADGES, badgesEarned } from '@/services/rewards';
import { initials } from '@/lib/utils';

interface LeaderRow {
  uid: string;
  name: string;
  rewardPoints: number;
  village?: string;
}

export default function Rewards() {
  const { profile } = useAuth();
  const [leaders, setLeaders] = useState<LeaderRow[]>([]);
  const points = profile?.rewardPoints ?? 10;
  const earned = badgesEarned(points);

  useEffect(() => {
    getLeaderboard(10).then(setLeaders).catch(() => setLeaders([]));
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <h1 className="font-display text-2xl font-semibold text-canopy-950 dark:text-cream-50">My Rewards</h1>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Card className="md:col-span-1 text-center">
          <Award size={28} className="mx-auto text-gold-500" />
          <p className="mt-2 text-4xl font-semibold text-gold-600 dark:text-gold-300">{points}</p>
          <p className="text-sm text-canopy-700/70 dark:text-cream-200/60">points available</p>
        </Card>

        <Card className="md:col-span-2">
          <h3 className="mb-3 font-display text-lg font-semibold text-canopy-950 dark:text-cream-50">Badges</h3>
          <div className="flex flex-wrap gap-3">
            {BADGES.map((b) => {
              const has = earned.some((e) => e.id === b.id);
              return (
                <div
                  key={b.id}
                  className={`flex flex-col items-center gap-1 rounded-2xl px-4 py-3 text-center ${has ? 'bg-canopy-100 dark:bg-canopy-800' : 'opacity-40 grayscale'}`}
                >
                  <span className="text-2xl">{b.icon}</span>
                  <span className="text-xs font-medium text-canopy-800 dark:text-cream-100">{b.name}</span>
                  <span className="text-[10px] text-canopy-500">{b.threshold}+ pts</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-canopy-950 dark:text-cream-50">
          <TrendingUp size={18} /> Leaderboard
        </h3>
        <div className="space-y-2">
          {leaders.length ? (
            leaders.map((l, i) => (
              <div key={l.uid} className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-canopy-100/50 dark:hover:bg-canopy-800/40">
                <div className="flex items-center gap-3">
                  <span className="w-5 text-sm font-semibold text-canopy-500">{i + 1}</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-canopy-100 dark:bg-canopy-800 text-xs font-semibold text-canopy-700 dark:text-canopy-200">
                    {initials(l.name)}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-canopy-900 dark:text-cream-100">{l.name}</p>
                    {l.village && <p className="text-xs text-canopy-500">{l.village}</p>}
                  </div>
                </div>
                <Badge tone="gold">{l.rewardPoints} pts</Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-canopy-500">Leaderboard will populate as farmers earn points.</p>
          )}
        </div>
      </Card>

      <div>
        <h3 className="mb-3 font-display text-lg font-semibold text-canopy-950 dark:text-cream-50">Redeem Points</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REDEEMABLES.map((item) => (
            <Card key={item.id}>
              <Badge tone="olive">{item.category}</Badge>
              <h4 className="mt-2 font-display text-base font-semibold text-canopy-950 dark:text-cream-50">{item.name}</h4>
              <p className="text-xs text-canopy-600 dark:text-canopy-400">{item.partner}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="flex items-center gap-1 text-sm font-semibold text-gold-600 dark:text-gold-300">
                  <Star size={14} /> {item.pointsCost}
                </span>
                <Button size="sm" variant={points >= item.pointsCost ? 'gold' : 'ghost'} disabled={points < item.pointsCost}>
                  Redeem
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
