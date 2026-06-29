import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/store/AppContext';
import type { TeamId } from '@/types';
import { Button } from '@/components/ui';
import { checkNicknameTaken } from '@/services/authService';

const TEAMS: { id: TeamId; name: string; emoji: string; color: string }[] = [
  {
    id: 'paine',
    name: 'Pâinea Vieții',
    emoji: '🍞',
    color: 'border-red-500 bg-red-900/20',
  },
  {
    id: 'lumina',
    name: 'Lumina Lumii',
    emoji: '☀️',
    color: 'border-blue-500 bg-blue-900/20',
  },
  {
    id: 'calea',
    name: 'Calea',
    emoji: '🛤️',
    color: 'border-yellow-500 bg-yellow-900/20',
  },
  {
    id: 'invierea',
    name: 'Învierea',
    emoji: '✝️',
    color: 'border-green-500 bg-green-900/20',
  },
];

export function OnboardingPage() {
  const { actions } = useApp();
  const [step, setStep] = useState<1 | 2>(1);
  const [nickname, setNickname] = useState('');
  const [teamId, setTeamId] = useState<TeamId | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingNickname, setCheckingNickname] = useState(false);

  const handleContinue = async () => {
    setCheckingNickname(true);
    setError(null);

    if (!/^[a-zA-Z0-9]+$/.test(nickname.trim())) {
      setError('Nickname-ul poate conține doar litere și cifre.');
      return;
    }

    try {
      const taken = await checkNicknameTaken(nickname.trim());

      if (taken) {
        setError(`"${nickname.trim()}" e deja luat. Alege alt nume.`);
      } else {
        setStep(2);
      }
    } catch {
      setError('Eroare de conexiune. Încearcă din nou.');
    } finally {
      setCheckingNickname(false);
    }
  };

  async function handleSubmit() {
    if (!nickname.trim() || !teamId) return;
    setLoading(true);
    setError(null);
    try {
      await actions.onboard(nickname.trim(), teamId);
    } catch {
      setError('Something went wrong. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='min-h-screen bg-surface-950 flex flex-col items-center justify-center px-6 py-12 safe-top safe-bottom'>
      {/* Logo */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className='text-7xl mb-6 animate-flicker'>
        🔥
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className='text-4xl font-black gradient-fire mb-1'>
        Camp Fire
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className='text-text-secondary text-sm mb-10 text-center'>
        Mentine flacara aprinsa
      </motion.p>

      {/* Step 1 — Nickname */}
      {step === 1 && (
        <motion.div
          key='step1'
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className='w-full max-w-sm flex flex-col gap-5'>
          <div>
            <label className='text-xs font-bold uppercase tracking-widest text-text-muted mb-2 block'>
              Nume (nickname):
            </label>
            <input
              type='text'
              placeholder='e.g. Alex'
              value={nickname}
              maxLength={20}
              onChange={(e) => {
                setNickname(e.target.value);
                setError(null);
              }}
              disabled={checkingNickname}
              className='w-full bg-surface-800 border border-surface-600 rounded-2xl px-4 py-4 text-text-primary text-lg font-semibold placeholder:text-text-muted focus:outline-none focus:border-fire-500 transition-colors'
            />
            <p className='text-xs text-text-muted mt-1.5 text-right'>
              {nickname.length}/20
            </p>

            {error && <p className='text-red-400 text-sm'>{error}</p>}
          </div>

          <Button
            size='lg'
            className='w-full'
            disabled={nickname.trim().length < 2}
            loading={checkingNickname}
            onClick={handleContinue}>
            Alege echipa →
          </Button>
        </motion.div>
      )}

      {/* Step 2 — Team selection */}
      {step === 2 && (
        <motion.div
          key='step2'
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className='w-full max-w-sm flex flex-col gap-5'>
          <div>
            <label className='text-xs font-bold uppercase tracking-widest text-text-muted mb-3 block'>
              Alege echipa
            </label>
            <div className='grid grid-cols-2 gap-3'>
              {TEAMS.map((team) => (
                <motion.button
                  key={team.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTeamId(team.id)}
                  className={`rounded-2xl p-4 border-2 flex flex-col items-center gap-2 transition-all ${
                    teamId === team.id
                      ? team.color
                      : 'border-surface-700 bg-surface-800'
                  }`}>
                  <span className='text-3xl'>{team.emoji}</span>
                  <span className='font-bold text-sm'>{team.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {error && <p className='text-red-400 text-sm text-center'>{error}</p>}

          <div className='flex gap-3'>
            <Button
              variant='secondary'
              size='lg'
              onClick={() => setStep(1)}>
              ← Inapoi
            </Button>
            <Button
              size='lg'
              className='flex-1'
              disabled={!teamId}
              loading={loading}
              onClick={handleSubmit}>
              Aprinde focul 🔥
            </Button>
          </div>
        </motion.div>
      )}

      <div className='mt-8'>
        <button
          onClick={() => {
            const secret = prompt('Admin secret:');
            if (secret === import.meta.env.VITE_ADMIN_SECRET) {
              localStorage.setItem('campfire_admin_bypass', 'true');
              window.location.href = '/admin';
            }
          }}
          className='text-xs text-text-muted opacity-50 hover:opacity-60 transition-opacity'>
          Admin
        </button>
      </div>
    </div>
  );
}
