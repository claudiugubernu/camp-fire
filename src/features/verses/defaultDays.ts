import type { DayConfig } from '@/types';

const CAMP_START = import.meta.env.VITE_CAMP_START_DATE ?? '2026-07-10';

function addDays(base: string, n: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

export const DEFAULT_DAYS: DayConfig[] = [
  {
    id: 'day-1',
    dayNumber: 1,
    theme: 'Scânteia — Cine a zis Isus că este?',
    verse:
      'La început era Cuvântul, și Cuvântul era cu Dumnezeu, și Cuvântul era Dumnezeu.',
    verseRef: 'Ioan 1:1',
    challenge:
      'Prezintă-te cuiva pe care nu îl cunoști încă. Întreabă-l un lucru despre viața lui.',
    unlockDate: addDays(CAMP_START, 0),
  },
  {
    id: 'day-2',
    dayNumber: 2,
    theme: 'Flacăra — Eu sunt Pâinea Vieții',
    verse:
      'Eu sunt Pâinea Vieții. Cine vine la Mine nu va flămânzi niciodată și cine crede în Mine nu va înseta niciodată.',
    verseRef: 'Ioan 6:35',
    challenge:
      'Fă un gest de bunătate pentru cineva din echipa ta astăzi. Orice lucru mic contează.',
    unlockDate: addDays(CAMP_START, 1),
  },
  {
    id: 'day-3',
    dayNumber: 3,
    theme: 'Jarul — Eu sunt Lumina Lumii',
    verse:
      'Eu sunt Lumina lumii. Cine Mă urmează pe Mine nu va umbla în întuneric, ci va avea lumina vieții.',
    verseRef: 'Ioan 8:12',
    challenge:
      'Fă un lucru astăzi care să aducă lumină în viața cuiva — un cuvânt de încurajare, un zâmbet, un ajutor neașteptat.',
    unlockDate: addDays(CAMP_START, 2),
  },
  {
    id: 'day-4',
    dayNumber: 4,
    theme: 'Focul veșnic — Eu sunt Calea, Adevărul și Viața',
    verse:
      'Eu sunt Calea, Adevărul și Viața. Nimeni nu vine la Tatăl decât prin Mine.',
    verseRef: 'Ioan 14:6',
    challenge:
      'Scrie o scrisoare către tine din viitor despre ce ți-a schimbat această tabără. O vei deschide peste un an.',
    unlockDate: addDays(CAMP_START, 3),
  },
];
