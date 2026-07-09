import type { DayQuestion } from '@/types';

export const DEFAULT_QUESTIONS: DayQuestion[] = [
  {
    dayId: 'day-1',
    question: 'Care este tema taberei?',
    options: [
      'Calea spre cer',
      'Eu Sunt...',
      'Cine a zis Isus că este?',
      'De ce suntem noi aici?',
    ],
    correctOption: 2,
  },
  {
    dayId: 'day-2',
    question: 'În Ioan 6:35, cu ce Se compară Isus pe Sine?',
    options: [
      'Lumina lumii',
      'Pâinea vieții',
      'Calea spre cer',
      'Izvorul apei vii',
    ],
    correctOption: 1,
  },
  {
    dayId: 'day-3',
    question: 'În Ioan 8:12, cine Îl urmează pe Isus nu va umbla în...?',
    options: ['Păcat', 'Frică', 'Întuneric', 'Rătăcire'],
    correctOption: 2,
  },
  {
    dayId: 'day-4',
    question: 'În Ioan 14:6, Isus spune că este Calea, Adevărul și...?',
    options: ['Speranța', 'Iubirea', 'Viața', 'Lumina'],
    correctOption: 2,
  },
];
