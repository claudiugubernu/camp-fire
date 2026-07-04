import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/store/AppContext';
import { submitAnswer } from '@/services/questionService';
import type { DayQuestion, QuestionAnswer } from '@/types';
import { Button } from '@/components/ui';

interface Props {
  question: DayQuestion;
  existingAnswer: QuestionAnswer | null;
  onAnswered: (answer: QuestionAnswer) => void;
}

const LABELS = ['A', 'B', 'C', 'D'];

export function QuestionCard({ question, existingAnswer, onAnswered }: Props) {
  const { state } = useApp();
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(
    existingAnswer ? (existingAnswer.correct ? 'correct' : 'wrong') : null,
  );
  const [loading, setLoading] = useState(false);

  const answered = existingAnswer !== null || result !== null;

  async function handleSubmit() {
    if (selected === null || !state.user) return;
    setLoading(true);
    try {
      const res = await submitAnswer(
        state.user.uid,
        state.user.teamId,
        question.dayId,
        selected,
        question.correctOption,
      );

      const answer: QuestionAnswer = {
        userId: state.user.uid,
        teamId: state.user.teamId,
        dayId: question.dayId,
        selectedOption: selected,
        correct: res.correct,
        answeredAt: Date.now(),
      };

      setResult(res.correct ? 'correct' : 'wrong');
      onAnswered(answer);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='flex flex-col gap-3'>
      <p className='text-text-primary font-semibold text-sm leading-relaxed'>
        {question.question}
      </p>

      <div className='flex flex-col gap-2'>
        {question.options.map((option, i) => {
          let style = 'border-surface-600 bg-surface-800 text-text-primary';

          if (answered) {
            if (i === question.correctOption) {
              style = 'border-green-500 bg-green-900/20 text-green-300';
            } else if (
              i === (existingAnswer?.selectedOption ?? selected) &&
              i !== question.correctOption
            ) {
              style = 'border-red-500 bg-red-900/20 text-red-300';
            } else {
              style =
                'border-surface-700 bg-surface-800/50 text-text-muted opacity-50';
            }
          } else if (selected === i) {
            style = 'border-fire-500 bg-fire-900/20 text-fire-300';
          }

          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => setSelected(i)}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${style}`}>
              <span className='font-bold text-sm w-5 shrink-0'>
                {LABELS[i]}
              </span>
              <span className='text-sm'>{option}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-3 text-center ${
              result === 'correct'
                ? 'bg-green-900/30 border border-green-800/50'
                : 'bg-red-900/30 border border-red-800/50'
            }`}>
            <p
              className={`text-sm font-semibold ${result === 'correct' ? 'text-green-300' : 'text-red-300'}`}>
              {result === 'correct'
                ? '✓ Corect! Puncte pentru echipa ta! 🎉'
                : '✗ Greșit. Mai mult succes mâine!'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {!answered && (
        <Button
          size='md'
          className='w-full'
          disabled={selected === null}
          loading={loading}
          onClick={handleSubmit}>
          Confirmă răspunsul
        </Button>
      )}
    </div>
  );
}
