import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '@/store/AppContext';
import {
  isDayCompleted,
  isDayAvailable,
  getTodayDayConfig,
} from '@/features/streak/streakUtils';
import { Button, Card, DayDot, SectionTitle } from '@/components/ui';
import type { DayConfig } from '@/types';

function getDayStatus(
  day: DayConfig,
  completedDays: string[],
): 'completed' | 'available' | 'locked' | 'today' {
  const isCompleted = completedDays.includes(day.id);
  if (isCompleted) return 'completed';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const unlockDate = new Date(day.unlockDate);
  unlockDate.setHours(0, 0, 0, 0);

  if (unlockDate.getTime() === today.getTime()) return 'today';
  if (unlockDate < today) return 'available';
  return 'locked';
}

export function DashboardPage() {
  const { state } = useApp();
  const navigate = useNavigate();

  const { user, streak, days, checkIns } = state;
  const todayDay = getTodayDayConfig(days);
  const isTodayDone = todayDay ? isDayCompleted(todayDay.id, checkIns) : false;
  const completedDays = streak.completedDays;

  return (
    <div className='px-5 py-6 flex flex-col gap-6 pb-6'>
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}>
        <p className='text-text-secondary text-sm'>Salut,</p>
        <h1 className='text-3xl font-black text-text-primary leading-tight capitalize'>
          {user?.nickname} 👋
        </h1>
      </motion.div>

      {/* Streak hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}>
        <Card
          glow={streak.current > 0}
          className='text-center py-8'>
          <motion.div
            key={streak.current}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className='text-7xl mb-3'>
            {streak.current > 0
              ? '🔥'.repeat(Math.min(streak.current, 7))
              : '💤'}
          </motion.div>
          <div className='text-6xl font-black gradient-fire mb-1'>
            {streak.current}
          </div>
          <p className='text-text-secondary text-sm font-medium'>
            {streak.current === 1
              ? 'day streak'
              : streak.current === 0
                ? 'No streak yet'
                : 'day streak'}
          </p>
          {streak.longest > 0 && (
            <p className='text-text-muted text-xs mt-2'>
              Best: {streak.longest} days 🏆
            </p>
          )}
        </Card>
      </motion.div>

      {/* Today's status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}>
        {todayDay ? (
          <Card
            className={
              isTodayDone ? 'border-fire-800/40' : 'border-fire-600/40'
            }
            glow={!isTodayDone}>
            <div className='flex items-start justify-between mb-3'>
              <div>
                <p className='text-xs text-text-muted font-semibold uppercase tracking-wider mb-0.5'>
                  Ziua {todayDay.dayNumber} · Astazi
                </p>
                <h3 className='text-lg font-bold text-text-primary'>
                  {todayDay.theme}
                </h3>
              </div>
              <span
                className={`text-2xl ${isTodayDone ? '' : 'animate-pulse-fire'}`}>
                {isTodayDone ? '✅' : '🔥'}
              </span>
            </div>

            {isTodayDone ? (
              <div className='bg-fire-900/30 border border-fire-800/30 rounded-xl p-3'>
                <p className='text-fire-300 text-sm font-semibold'>
                  ✓ Astazi ai aprins flacara! Ne vedem maine.
                </p>
              </div>
            ) : (
              <Button
                size='lg'
                className='w-full mt-2'
                onClick={() => navigate('/scan')}>
                📷 Scaneaza QR Code
              </Button>
            )}
          </Card>
        ) : (
          <Card>
            <p className='text-text-secondary text-sm text-center py-2'>
              Nimic de facut astazi! Ah... ba da. Bucura-te! 🌤️
            </p>
          </Card>
        )}
      </motion.div>

      {/* Today's verse (if completed) */}
      {isTodayDone && todayDay && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}>
          <SectionTitle>Cuvantul de astazi</SectionTitle>
          <Card className='bg-fire-900/10 border-fire-800/30'>
            <p className='text-text-primary text-sm leading-relaxed mb-2 italic'>
              "{todayDay.verse}"
            </p>
            <p className='text-fire-400 text-xs font-bold'>
              — {todayDay.verseRef}
            </p>
            <div className='mt-4 pt-4 border-t border-surface-700'>
              <p className='text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5'>
                Provocarea de astazi
              </p>
              <p className='text-text-secondary text-sm leading-relaxed'>
                {todayDay.challenge}
              </p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Day progress timeline */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}>
        <SectionTitle>
          Progres · {streak.totalCompleted}/{days.length} zile
        </SectionTitle>
        <Card>
          {/* Progress bar */}
          <div className='w-full h-2 bg-surface-700 rounded-full mb-5 overflow-hidden'>
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${(streak.totalCompleted / Math.max(days.length, 1)) * 100}%`,
              }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
              className='h-full bg-gradient-to-r from-fire-600 to-fire-400 rounded-full'
            />
          </div>

          <div className='flex items-center justify-between'>
            {days.map((day) => (
              <div
                key={day.id}
                className='flex flex-col items-center gap-1.5'>
                <DayDot
                  dayNumber={day.dayNumber}
                  status={getDayStatus(day, completedDays)}
                />
                <span className='text-[10px] text-text-muted font-medium'>
                  D{day.dayNumber}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Badges preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}>
        <div className='flex items-center justify-between mb-3 px-0'>
          <SectionTitle>Insigne</SectionTitle>
          <button
            onClick={() => navigate('/badges')}
            className='text-fire-400 text-xs font-semibold pr-0'>
            Vezi toate →
          </button>
        </div>
        <div className='flex gap-3 overflow-x-auto pb-2 -mx-1 px-1'>
          {state.badges
            .filter((b) => b.unlockedAt !== undefined)
            .map((badge) => (
              <motion.div
                key={badge.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className='flex-shrink-0 bg-fire-900/20 border border-fire-800/40 rounded-2xl p-3 flex flex-col items-center gap-1 min-w-[72px]'>
                <span className='text-2xl'>{badge.emoji}</span>
                <span className='text-[10px] font-semibold text-fire-300 text-center'>
                  {badge.name}
                </span>
              </motion.div>
            ))}
          {state.badges.filter((b) => b.unlockedAt !== undefined).length ===
            0 && (
            <p className='text-text-muted text-sm py-2 px-1'>
              Finalizeaza primul check-in pentru a debloca o insigna!
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
