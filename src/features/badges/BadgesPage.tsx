import { motion } from 'framer-motion';
import { useApp } from '@/store/AppContext';
import { Card } from '@/components/ui';

export function BadgesPage() {
  const { state } = useApp();
  const { badges } = state;

  const unlocked = badges.filter((b) => b.unlockedAt !== undefined);
  const locked = badges.filter((b) => b.unlockedAt === undefined);

  return (
    <div className='px-5 py-6 flex flex-col gap-6'>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}>
        <h1 className='text-2xl font-black text-text-primary'>Insigne</h1>
        <p className='text-text-secondary text-sm mt-1'>
          {unlocked.length}/{badges.length} deblocate
        </p>
      </motion.div>

      {/* Unlocked */}
      {unlocked.length > 0 && (
        <section>
          <p className='text-xs font-bold text-text-muted uppercase tracking-widest mb-3'>
            🏆 Deblocate
          </p>
          <div className='grid grid-cols-2 gap-3'>
            {unlocked.map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: i * 0.07,
                  type: 'spring',
                  stiffness: 200,
                }}>
                <Card className='border-fire-800/40 bg-fire-900/10 text-center'>
                  <div className='text-4xl mb-3'>{badge.emoji}</div>
                  <h3 className='font-bold text-fire-300 text-sm mb-1'>
                    {badge.name}
                  </h3>
                  <p className='text-text-muted text-xs leading-snug'>
                    {badge.description}
                  </p>
                  {badge.unlockedAt && (
                    <p className='text-text-muted text-[10px] mt-2'>
                      {new Date(badge.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <section>
          <p className='text-xs font-bold text-text-muted uppercase tracking-widest mb-3'>
            🔒 Blocate
          </p>
          <div className='grid grid-cols-2 gap-3'>
            {locked.map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}>
                <div className='card p-5 text-center opacity-40 grayscale'>
                  <div className='text-4xl mb-3'>{badge.emoji}</div>
                  <h3 className='font-bold text-text-secondary text-sm mb-1'>
                    {badge.name}
                  </h3>
                  <p className='text-text-muted text-xs leading-snug'>
                    {badge.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {unlocked.length === 0 && (
        <div className='flex flex-col items-center justify-center py-12 text-center gap-3'>
          <span className='text-5xl opacity-50'>🏅</span>
          <p className='text-text-secondary'>
            Completeaza primul check-in pentru a debloca insignele!
          </p>
        </div>
      )}
    </div>
  );
}
