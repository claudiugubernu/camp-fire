import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/store/AppContext';
import {
  sendAppreciation,
  getTodayCount,
} from '@/services/appreciationService';
import { Button, Card } from '@/components/ui';

const MAX_PER_DAY = 5;
const MAX_CHARS = 150;

export function AppreciationsPage() {
  const { state, actions } = useApp();
  const [message, setMessage] = useState('');
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state.user) {
      getTodayCount(state.user.uid).then(setTodayCount);
    }
  }, [state.user]);

  const remaining = MAX_PER_DAY - todayCount;

  async function handleSubmit() {
    if (!state.user || !message.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const result = await sendAppreciation(
        state.user.uid,
        state.user.nickname,
        state.user.teamId,
        message,
      );

      if (result.success) {
        setMessage('');
        setTodayCount((c) => c + 1);
        actions.incrementAppreciationCount();
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else if (result.reason === 'LIMIT_REACHED') {
        setError(`Ai atins limita de ${MAX_PER_DAY} aprecieri pe zi.`);
      }
    } catch {
      setError('Eroare de conexiune. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='px-5 py-6 flex flex-col gap-6'>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}>
        <h1 className='text-2xl font-black text-text-primary'>
          Cutia Aprecierilor
        </h1>
        <p className='text-text-secondary text-sm mt-1'>
          Mulțumește cuiva pentru un gest frumos 💛
        </p>
      </motion.div>

      {/* Counter */}
      <Card>
        <div className='flex items-center justify-between'>
          <p className='text-text-secondary text-sm'>Aprecieri trimise azi</p>
          <div className='flex gap-1'>
            {Array.from({ length: MAX_PER_DAY }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < todayCount ? 'bg-fire-500' : 'bg-surface-700'
                }`}
              />
            ))}
          </div>
        </div>
        <p className='text-xs text-text-muted mt-1'>
          {remaining > 0
            ? `Mai poți trimite ${remaining} aprecieri astăzi`
            : 'Ai trimis toate aprecierile de azi. Revino mâine!'}
        </p>
      </Card>

      {/* Form */}
      {remaining > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className='flex flex-col gap-3'>
          <label className='text-xs font-bold uppercase tracking-widest text-text-muted'>
            Mesajul tău
          </label>
          <textarea
            value={message}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS)
                setMessage(e.target.value);
              setError(null);
            }}
            placeholder='ex: "Mulțumesc lui Alex pentru că m-a ajutat când aveam nevoie."'
            rows={4}
            className='w-full bg-surface-800 border border-surface-600 rounded-2xl px-4 py-3 text-text-primary text-base placeholder:text-text-muted focus:outline-none focus:border-fire-500 resize-none transition-colors'
          />
          <div className='flex items-center justify-between'>
            <p className='text-xs text-text-muted'>
              {message.length}/{MAX_CHARS}
            </p>
            {error && <p className='text-red-400 text-xs'>{error}</p>}
          </div>

          {success && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className='bg-green-900/30 border border-green-800/50 rounded-xl p-3'>
              <p className='text-green-300 text-sm text-center'>
                ✓ Aprecierea a fost trimisă!
              </p>
            </motion.div>
          )}

          <Button
            size='lg'
            className='w-full'
            disabled={message.trim().length < 5}
            loading={loading}
            onClick={handleSubmit}>
            💛 Trimite aprecierea
          </Button>
        </motion.div>
      )}

      {/* Info */}
      <Card className='bg-surface-800/50 border-surface-700'>
        <p className='text-xs text-text-muted leading-relaxed'>
          💡 Fii sincer și specific — un mesaj concret înseamnă mult mai mult
          decât unul generic.
        </p>
      </Card>
    </div>
  );
}
