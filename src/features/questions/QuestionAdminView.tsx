import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchQuestions,
  saveQuestion,
  getAllAnswers,
  seedDefaultQuestions,
} from '@/services/questionService';
import { Card, Button } from '@/components/ui';
import type { DayQuestion, QuestionAnswer } from '@/types';
import { useApp } from '@/store/AppContext';

const LABELS = ['A', 'B', 'C', 'D'];

export function QuestionsAdminView() {
  const { state } = useApp();
  const [questions, setQuestions] = useState<DayQuestion[]>([]);
  const [allAnswers, setAllAnswers] = useState<QuestionAnswer[]>([]);
  const [editingQ, setEditingQ] = useState<DayQuestion | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    Promise.all([fetchQuestions(), getAllAnswers()])
      .then(([qs, ans]) => {
        setQuestions(qs.sort((a, b) => a.dayId.localeCompare(b.dayId)));
        setAllAnswers(ans);
      })
      .finally(() => setLoading(false));
  }, []);

  // Puncte per echipă — 1 punct per răspuns corect
  const pointsByTeam = allAnswers
    .filter((a) => a.correct)
    .reduce<Record<string, number>>((acc, a) => {
      acc[a.teamId] = (acc[a.teamId] ?? 0) + 1;
      return acc;
    }, {});

  const sortedTeams = Object.entries(pointsByTeam).sort(
    ([, a], [, b]) => b - a,
  );

  async function handleSave() {
    if (!editingQ) return;
    setSaving(true);
    try {
      await saveQuestion(editingQ);
      setQuestions((prev) =>
        prev.map((q) => (q.dayId === editingQ.dayId ? editingQ : q)),
      );
      setEditingQ(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleSeedQuestions() {
    setSeeding(true);
    try {
      await seedDefaultQuestions();
      const qs = await fetchQuestions();
      setQuestions(qs.sort((a, b) => a.dayId.localeCompare(b.dayId)));
    } finally {
      setSeeding(false);
    }
  }

  if (loading) {
    return (
      <p className='text-text-muted text-sm text-center py-6'>Se încarcă...</p>
    );
  }

  return (
    <div className='flex flex-col gap-5'>
      {/* Clasament puncte */}
      <Card>
        <p className='text-xs font-bold text-text-muted uppercase tracking-widest mb-3'>
          Punctaj echipe
        </p>
        {sortedTeams.length === 0 ? (
          <p className='text-text-muted text-sm'>Niciun răspuns corect încă.</p>
        ) : (
          sortedTeams.map(([teamId, points], i) => (
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
              <span className='text-fire-400 font-bold'>{points} puncte</span>
            </div>
          ))
        )}
      </Card>

      {/* Lista întrebări */}
      <div className='flex items-center justify-between'>
        <p className='text-xs font-bold text-text-muted uppercase tracking-widest'>
          Întrebări · {questions.length} zile
        </p>
        <Button
          variant='secondary'
          size='sm'
          loading={seeding}
          onClick={handleSeedQuestions}>
          Seed defaults
        </Button>
      </div>

      {state.days.map((day) => {
        const q = questions.find((q) => q.dayId === day.id);
        const dayAnswers = allAnswers.filter((a) => a.dayId === day.id);
        const correctCount = dayAnswers.filter((a) => a.correct).length;

        return (
          <Card key={day.id}>
            <div className='flex items-start justify-between'>
              <div>
                <p className='text-xs text-fire-400 font-bold uppercase tracking-wider'>
                  Ziua {day.dayNumber}
                </p>
                {q ? (
                  <p className='text-text-primary text-sm font-semibold mt-0.5'>
                    {q.question}
                  </p>
                ) : (
                  <p className='text-text-muted text-sm italic'>
                    Fără întrebare
                  </p>
                )}
                {q && (
                  <p className='text-text-muted text-xs mt-1'>
                    {correctCount}/{dayAnswers.length} răspunsuri corecte
                  </p>
                )}
              </div>
              <Button
                variant='ghost'
                size='sm'
                onClick={() =>
                  setEditingQ(
                    q ?? {
                      dayId: day.id,
                      question: '',
                      options: ['', '', '', ''],
                      correctOption: 0,
                    },
                  )
                }>
                {q ? 'Edit' : '+ Add'}
              </Button>
            </div>
          </Card>
        );
      })}

      {/* Edit modal */}
      <AnimatePresence>
        {editingQ && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-surface-950/90 z-50 flex items-end'
            onClick={(e) => e.target === e.currentTarget && setEditingQ(null)}>
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className='w-full bg-surface-900 rounded-t-3xl p-6 flex flex-col gap-4 safe-bottom max-h-[90vh] overflow-y-auto'>
              <div className='flex items-center justify-between'>
                <h3 className='font-bold text-lg'>Editează întrebarea</h3>
                <button
                  onClick={() => setEditingQ(null)}
                  className='text-text-muted text-2xl'>
                  ×
                </button>
              </div>

              <div>
                <label className='text-xs font-bold text-text-muted uppercase tracking-wider mb-1 block'>
                  Întrebarea
                </label>
                <textarea
                  value={editingQ.question}
                  onChange={(e) =>
                    setEditingQ({ ...editingQ, question: e.target.value })
                  }
                  rows={3}
                  className='w-full bg-surface-800 border border-surface-600 rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-fire-500 resize-none'
                />
              </div>

              {editingQ.options.map((opt, i) => (
                <div key={i}>
                  <label className='text-xs font-bold text-text-muted uppercase tracking-wider mb-1 block flex items-center gap-2'>
                    <span>Opțiunea {LABELS[i]}</span>
                    {editingQ.correctOption === i && (
                      <span className='text-green-400'>✓ Corect</span>
                    )}
                  </label>
                  <div className='flex gap-2'>
                    <input
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...editingQ.options] as [
                          string,
                          string,
                          string,
                          string,
                        ];
                        newOptions[i] = e.target.value;
                        setEditingQ({ ...editingQ, options: newOptions });
                      }}
                      className='flex-1 bg-surface-800 border border-surface-600 rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-fire-500'
                    />
                    <button
                      onClick={() =>
                        setEditingQ({
                          ...editingQ,
                          correctOption: i as 0 | 1 | 2 | 3,
                        })
                      }
                      className={`px-3 rounded-xl border-2 text-xs font-bold transition-all ${
                        editingQ.correctOption === i
                          ? 'border-green-500 bg-green-900/20 text-green-400'
                          : 'border-surface-600 text-text-muted'
                      }`}>
                      ✓
                    </button>
                  </div>
                </div>
              ))}

              <Button
                loading={saving}
                onClick={handleSave}
                size='lg'
                className='w-full'>
                Salvează întrebarea
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
