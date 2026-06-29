import type { CheckIn, DayConfig, StreakInfo } from '@/types';

/**
 * Calculates the current streak, longest streak, and completion metadata.
 * A streak is consecutive days completed without gaps.
 * Days are matched by their `unlockDate` field.
 */
export function calculateStreak(
  checkIns: CheckIn[],
  days: DayConfig[],
): StreakInfo {
  const completedDayIds = new Set(checkIns.map((c) => c.dayId));
  const sorted = [...days].sort((a, b) => a.dayNumber - b.dayNumber);
  const completedDays = sorted
    .filter((d) => completedDayIds.has(d.id))
    .map((d) => d.id);

  let longest = 0;
  let runningStreak = 0;

  for (let i = 0; i < sorted.length; i++) {
    const day = sorted[i];
    if (completedDayIds.has(day.id)) {
      runningStreak++;
      if (runningStreak > longest) longest = runningStreak;
    } else {
      const dayDate = new Date(day.unlockDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dayDate.setHours(0, 0, 0, 0);
      if (dayDate <= today) runningStreak = 0;
    }
  }

  // Current streak — merge înapoi dar ignoră ziua de AZI dacă nu e completată
  let current = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = sorted.length - 1; i >= 0; i--) {
    const day = sorted[i];
    const dayDate = new Date(day.unlockDate);
    dayDate.setHours(0, 0, 0, 0);

    if (dayDate > today) continue; // zile viitoare — ignoră

    if (dayDate.getTime() === today.getTime() && !completedDayIds.has(day.id)) {
      continue; // ziua de azi necompletată — nu rupe streak-ul, o ignorăm
    }

    if (completedDayIds.has(day.id)) {
      current++;
    } else {
      break; // zi trecută necompletată — streak rupt
    }
  }

  return {
    current,
    longest,
    completedDays,
    totalCompleted: completedDays.length,
  };
}

export function isDayCompleted(dayId: string, checkIns: CheckIn[]): boolean {
  return checkIns.some((c) => c.dayId === dayId);
}

export function isDayAvailable(day: DayConfig): boolean {
  const unlockDate = new Date(day.unlockDate);
  const today = new Date();
  unlockDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return unlockDate <= today;
}

export function getTodayDayConfig(days: DayConfig[]): DayConfig | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return (
    days.find((d) => {
      const unlockDate = new Date(d.unlockDate);
      unlockDate.setHours(0, 0, 0, 0);
      return unlockDate.getTime() === today.getTime();
    }) ?? null
  );
}
