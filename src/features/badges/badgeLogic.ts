import type { Badge, BadgeId, CheckIn, DayConfig, CampUser } from '@/types';

export const BADGE_DEFINITIONS: Record<BadgeId, Omit<Badge, 'unlockedAt'>> = {
  explorer: {
    id: 'explorer',
    name: 'Explorer',
    emoji: '🧭',
    description: 'Primul tău check-in. Aventura începe!',
  },
  fire_keeper: {
    id: 'fire_keeper',
    name: 'Paznicul Flăcării',
    emoji: '🔥',
    description:
      'Ai completat toate cele 7 zile. Flacăra nu s-a stins niciodată.',
  },
  early_bird: {
    id: 'early_bird',
    name: 'Dimineața Devreme',
    emoji: '🌅',
    description: 'Ai făcut check-in înainte de ora 9 dimineața.',
  },
  first_fifteen: {
    id: 'first_fifteen',
    name: 'Primii 15',
    emoji: '⚡',
    description: 'Unul dintre primii 15 participanți care au aprins flacăra.',
  },
  three_in_a_row: {
    id: 'three_in_a_row',
    name: 'Pe Foc',
    emoji: '🔥',
    description: 'Ai completat 3 zile consecutive.',
  },
  halfway: {
    id: 'halfway',
    name: 'La Jumătate',
    emoji: '🏕️',
    description: 'Ai completat 4 din 7 zile.',
  },
  secret_seeker: {
    id: 'secret_seeker',
    name: 'Căutătorul Secret',
    emoji: '🕵️',
    description: '???',
  },
};

export function computeBadges(
  checkIns: CheckIn[],
  days: DayConfig[],
  user: CampUser,
  allCheckIns: CheckIn[] = [],
): Badge[] {
  const totalDays = days.length;
  const completed = checkIns.length;
  const hasEarlyBird = checkIns.some((c) => c.earlyBird);

  // consecutive streak check
  const sortedDays = [...days].sort((a, b) => a.dayNumber - b.dayNumber);
  let maxConsecutive = 0;
  let run = 0;
  const completedIds = new Set(checkIns.map((c) => c.dayId));
  for (const day of sortedDays) {
    if (completedIds.has(day.id)) {
      run++;
      maxConsecutive = Math.max(maxConsecutive, run);
    } else {
      run = 0;
    }
  }

  // Secret badge: user nickname contains "fire" (case-insensitive)
  const secretUnlocked = user.nickname.toLowerCase().includes('fire');

  const userFirstCheckIn =
    checkIns.length > 0
      ? Math.min(...checkIns.map((c) => c.completedAt))
      : null;

  const earlierUsers = userFirstCheckIn
    ? new Set(
        allCheckIns
          .filter(
            (c) => c.completedAt < userFirstCheckIn && c.userId !== user.uid,
          )
          .map((c) => c.userId),
      ).size
    : null;

  const isFirstFifteen = earlierUsers !== null && earlierUsers < 15;

  const unlockMap: Record<BadgeId, number | null> = {
    explorer:
      completed >= 1
        ? checkIns.reduce((a, b) => Math.min(a, b.completedAt), Infinity)
        : null,
    fire_keeper: completed >= totalDays ? Date.now() : null,
    early_bird: hasEarlyBird
      ? (checkIns.find((c) => c.earlyBird)?.completedAt ?? null)
      : null,
    first_fifteen: isFirstFifteen && userFirstCheckIn ? userFirstCheckIn : null,
    three_in_a_row: maxConsecutive >= 3 ? Date.now() : null,
    halfway: completed >= 4 ? Date.now() : null,
    secret_seeker: secretUnlocked ? Date.now() : null,
  };

  return Object.values(BADGE_DEFINITIONS).map((def) => ({
    ...def,
    unlockedAt: unlockMap[def.id] ?? undefined,
  }));
}
