import type { CheckIn, DayConfig, StreakInfo } from "@/types";

/**
 * Calculates the current streak, longest streak, and completion metadata.
 * A streak is consecutive days completed without gaps.
 * Days are matched by their `unlockDate` field.
 */
export function calculateStreak(
  checkIns: CheckIn[],
  days: DayConfig[]
): StreakInfo {
  const completedDayIds = new Set(checkIns.map((c) => c.dayId));

  // Sort days by dayNumber ascending
  const sorted = [...days].sort((a, b) => a.dayNumber - b.dayNumber);

  const completedDays = sorted
    .filter((d) => completedDayIds.has(d.id))
    .map((d) => d.id);

  // Build streak counting consecutive completions from the most recent completed day
  let current = 0;
  let longest = 0;
  let runningStreak = 0;

  for (let i = 0; i < sorted.length; i++) {
    const day = sorted[i];
    if (completedDayIds.has(day.id)) {
      runningStreak++;
      if (runningStreak > longest) longest = runningStreak;
    } else {
      // Only break current streak if the day was supposed to be done already
      const dayDate = new Date(day.unlockDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dayDate.setHours(0, 0, 0, 0);

      if (dayDate <= today) {
        runningStreak = 0;
      }
    }
  }

  // Current streak = consecutive streak ending at the last completed day
  current = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const day = sorted[i];
    const dayDate = new Date(day.unlockDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dayDate.setHours(0, 0, 0, 0);

    if (dayDate > today) continue; // future days don't break streak
    if (completedDayIds.has(day.id)) {
      current++;
    } else {
      break; // gap found
    }
  }

  return {
    current,
    longest,
    completedDays,
    totalCompleted: completedDays.length,
  };
}

export function isDayCompleted(
  dayId: string,
  checkIns: CheckIn[]
): boolean {
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
