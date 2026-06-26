import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import { useApp } from '@/store/AppContext';
import { isDayAvailable } from '@/features/streak/streakUtils';
import { Button, Card } from '@/components/ui';
import type { DayConfig } from '@/types';

type CheckInState =
  | 'loading'
  | 'success'
  | 'already_done'
  | 'not_yet'
  | 'invalid';

export function CheckInResultPage() {
  const { dayId } = useParams<{ dayId: string }>();
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const [checkInState, setCheckInState] = useState<CheckInState>('loading');
  const [day, setDay] = useState<DayConfig | null>(null);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const hasRun = useRef(false);

  useEffect(() => {
    const handler = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    if (hasRun.current) return;
    if (!dayId || state.loading) return;

    hasRun.current = true;

    const foundDay = state.days.find((d) => d.id === dayId);

    if (!foundDay) {
      setCheckInState('invalid');
      return;
    }

    setDay(foundDay);

    if (!isDayAvailable(foundDay)) {
      setCheckInState('not_yet');
      return;
    }

    // Perform check-in
    actions.checkIn(dayId).then(({ success, alreadyDone }) => {
      if (alreadyDone) {
        setCheckInState('already_done');
      } else if (success) {
        setCheckInState('success');
      }
    });
  }, [dayId, state.days, state.loading, actions]);

  return (
    <div className='flex flex-col min-h-full px-5 py-6 items-center justify-center'>
      <AnimatePresence mode='wait'>
        {checkInState === 'loading' && (
          <motion.div
            key='loading'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='flex flex-col items-center gap-4'>
            <div className='w-16 h-16 border-4 border-surface-700 border-t-fire-400 rounded-full animate-spin' />
            <p className='text-text-secondary'>Lighting the flame…</p>
          </motion.div>
        )}

        {checkInState === 'success' && day && (
          <motion.div
            key='success'
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className='w-full max-w-sm flex flex-col gap-5 text-center'>
            <ReactConfetti
              width={windowSize.width}
              height={windowSize.height}
              recycle={false}
              numberOfPieces={250}
              colors={['#f97316', '#ef4444', '#fbbf24', '#fb923c', '#fff']}
            />

            {/* Fire animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.5, 1] }}
              transition={{ duration: 0.6 }}
              className='text-8xl glow-fire animate-flicker'>
              🔥
            </motion.div>

            <div>
              <h1 className='text-3xl font-black gradient-fire'>
                Streak alive!
              </h1>
              <p className='text-text-secondary mt-1'>
                Day {day.dayNumber} · {day.theme}
              </p>
            </div>

            {/* Streak update */}
            <Card glow>
              <div className='flex items-center justify-center gap-3'>
                <span className='text-4xl font-black gradient-fire'>
                  {state.streak.current}
                </span>
                <span className='text-3xl animate-flicker'>🔥</span>
              </div>
              <p className='text-text-secondary text-sm mt-1'>Current streak</p>
            </Card>

            {/* Verse */}
            <Card className='bg-fire-900/10 border-fire-800/30 text-left'>
              <p className='text-xs font-bold text-fire-400 uppercase tracking-widest mb-2'>
                Today's Verse
              </p>
              <p className='text-text-primary text-sm leading-relaxed italic mb-2'>
                "{day.verse}"
              </p>
              <p className='text-fire-400 text-xs font-bold'>
                — {day.verseRef}
              </p>
            </Card>

            {/* Challenge */}
            <Card className='text-left'>
              <p className='text-xs font-bold text-text-muted uppercase tracking-widest mb-2'>
                Today's Challenge
              </p>
              <p className='text-text-primary text-sm leading-relaxed'>
                {day.challenge}
              </p>
            </Card>

            <Button
              size='lg'
              className='w-full'
              onClick={() => navigate('/')}>
              Back to home
            </Button>
          </motion.div>
        )}

        {checkInState === 'already_done' && day && (
          <motion.div
            key='already_done'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='w-full max-w-sm flex flex-col items-center gap-5 text-center'>
            <span className='text-7xl'>✅</span>
            <div>
              <h1 className='text-2xl font-black text-text-primary'>
                Already done!
              </h1>
              <p className='text-text-secondary mt-1'>
                You already checked in for Day {day.dayNumber} today.
              </p>
            </div>

            {/* Show verse anyway */}
            <Card className='bg-fire-900/10 border-fire-800/30 text-left w-full'>
              <p className='text-xs font-bold text-fire-400 uppercase tracking-widest mb-2'>
                Today's Verse
              </p>
              <p className='text-text-primary text-sm leading-relaxed italic mb-2'>
                "{day.verse}"
              </p>
              <p className='text-fire-400 text-xs font-bold'>
                — {day.verseRef}
              </p>
            </Card>

            <Button
              size='lg'
              className='w-full'
              onClick={() => navigate('/')}>
              Go home
            </Button>
          </motion.div>
        )}

        {checkInState === 'not_yet' && day && (
          <motion.div
            key='not_yet'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='flex flex-col items-center gap-5 text-center max-w-sm'>
            <span className='text-7xl'>⏳</span>
            <div>
              <h1 className='text-2xl font-black text-text-primary'>
                Not yet!
              </h1>
              <p className='text-text-secondary mt-1'>
                Day {day.dayNumber} unlocks on{' '}
                <span className='text-fire-400 font-semibold'>
                  {new Date(day.unlockDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                .
              </p>
            </div>
            <Button
              size='lg'
              onClick={() => navigate('/')}>
              Back home
            </Button>
          </motion.div>
        )}

        {checkInState === 'invalid' && (
          <motion.div
            key='invalid'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='flex flex-col items-center gap-5 text-center max-w-sm'>
            <span className='text-7xl'>❓</span>
            <div>
              <h1 className='text-2xl font-black text-text-primary'>
                Invalid code
              </h1>
              <p className='text-text-secondary mt-1'>
                This doesn't match any camp day. Make sure you're scanning the
                right QR code.
              </p>
            </div>
            <Button
              size='lg'
              onClick={() => navigate('/scan')}>
              Scan again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
