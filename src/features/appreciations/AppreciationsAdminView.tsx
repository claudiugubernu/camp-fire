import { useState, useEffect } from 'react';
import { getAllAppreciations } from '@/services/appreciationService';
import { Card } from '@/components/ui';
import type { Appreciation } from '@/types';

export function AppreciationsAdminView() {
  const [appreciations, setAppreciations] = useState<Appreciation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllAppreciations()
      .then((data) => {
        setAppreciations(data.sort((a, b) => b.createdAt - a.createdAt));
      })
      .finally(() => setLoading(false));
  }, []);

  // Grupează pe nickname
  const byUser = appreciations.reduce<Record<string, Appreciation[]>>(
    (acc, a) => {
      const key = a.fromNickname;
      if (!acc[key]) acc[key] = [];
      acc[key].push(a);
      return acc;
    },
    {},
  );

  // Statistici pe echipă
  const byTeam = appreciations.reduce<Record<string, number>>((acc, a) => {
    acc[a.teamId] = (acc[a.teamId] ?? 0) + 1;
    return acc;
  }, {});

  const sortedTeams = Object.entries(byTeam).sort(([, a], [, b]) => b - a);

  if (loading) {
    return (
      <p className='text-text-muted text-sm text-center py-6'>Se încarcă...</p>
    );
  }

  return (
    <div className='flex flex-col gap-5'>
      {/* Team leaderboard */}
      <Card>
        <p className='text-xs font-bold text-text-muted uppercase tracking-widest mb-3'>
          Clasament echipe
        </p>
        {sortedTeams.map(([teamId, count], i) => (
          <div
            key={teamId}
            className='flex items-center justify-between py-2 border-b border-surface-700 last:border-0'>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-bold text-text-muted'>
                {i + 1}.
              </span>
              <span className='font-semibold capitalize'>{teamId}</span>
              {i === 0 && <span>🏆</span>}
            </div>
            <span className='text-fire-400 font-bold'>{count} aprecieri</span>
          </div>
        ))}
        {sortedTeams.length === 0 && (
          <p className='text-text-muted text-sm'>Nicio apreciere încă.</p>
        )}
      </Card>

      {/* Per user */}
      <p className='text-xs font-bold text-text-muted uppercase tracking-widest'>
        Pe participanți · {appreciations.length} total
      </p>
      {Object.entries(byUser)
        .sort(([, a], [, b]) => b.length - a.length)
        .map(([nickname, msgs]) => (
          <Card key={nickname}>
            <div className='flex items-center justify-between mb-3'>
              <p className='font-bold text-text-primary'>{nickname}</p>
              <span className='text-fire-400 font-bold text-sm'>
                {msgs.length} aprecieri
              </span>
            </div>
            <div className='flex flex-col gap-2'>
              {msgs.map((a) => (
                <div
                  key={a.id}
                  className='bg-surface-700 rounded-xl p-3'>
                  <p className='text-text-primary text-sm'>{a.message}</p>
                  <p className='text-text-muted text-xs mt-1'>
                    {new Date(a.createdAt).toLocaleDateString('ro-RO', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        ))}

      {appreciations.length === 0 && (
        <p className='text-text-muted text-sm text-center py-6'>
          Nicio apreciere trimisă încă.
        </p>
      )}
    </div>
  );
}
