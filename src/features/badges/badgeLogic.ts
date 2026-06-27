import type {
  Badge,
  BadgeId,
  CheckIn,
  DayConfig,
  CampUser,
  TeamId,
} from '@/types';

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
  captain: {
    id: 'captain',
    name: 'Căpitanul',
    emoji: '👑',
    description: 'Primul din echipa ta care a făcut check-in într-o zi.',
  },
  team_spirit: {
    id: 'team_spirit',
    name: 'Spirit de Echipă',
    emoji: '🤝',
    description: 'Toată echipa ta a completat aceeași zi.',
  },
  fire_team: {
    id: 'fire_team',
    name: 'Echipa de Foc',
    emoji: '🏆',
    description: 'Echipa ta are cel mai mare streak total.',
  },
  all_in: {
    id: 'all_in',
    name: 'All-In',
    emoji: '🏅',
    description: 'Ai deblocat toate celelalte badge-uri.',
  },
};

export function computeBadges(
  checkIns: CheckIn[],
  days: DayConfig[],
  user: CampUser,
  allCheckIns: CheckIn[] = [],
  userTeamMap: Record<string, TeamId> = {},
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

  const myTeamUserIds = Object.entries(userTeamMap)
    .filter(([, teamId]) => teamId === user.teamId)
    .map(([uid]) => uid);

  const isCaptain = days.some((day) => {
    const dayCheckIns = allCheckIns
      .filter((c) => c.dayId === day.id && myTeamUserIds.includes(c.userId))
      .sort((a, b) => a.completedAt - b.completedAt);

    return dayCheckIns.length > 0 && dayCheckIns[0].userId === user.uid;
  });

  const hasTeamSpirit = days.some((day) => {
    const usersWhoCompletedDay = new Set(
      allCheckIns
        .filter((c) => c.dayId === day.id && myTeamUserIds.includes(c.userId))
        .map((c) => c.userId),
    );
    return (
      myTeamUserIds.length > 0 &&
      myTeamUserIds.every((uid) => usersWhoCompletedDay.has(uid))
    );
  });

  const checkInsByTeam: Record<string, number> = {};
  allCheckIns.forEach((c) => {
    const team = userTeamMap[c.userId];
    if (team) {
      checkInsByTeam[team] = (checkInsByTeam[team] ?? 0) + 1;
    }
  });

  const myTeamTotal = checkInsByTeam[user.teamId] ?? 0;
  const maxTeamTotal = Math.max(...Object.values(checkInsByTeam), 0);
  const isFireTeam = myTeamTotal > 0 && myTeamTotal === maxTeamTotal;

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
    captain: isCaptain ? Date.now() : null,
    team_spirit: hasTeamSpirit ? Date.now() : null,
    fire_team: isFireTeam ? Date.now() : null,
    all_in: null, // calculat mai jos
  };

  const allOthersUnlocked = (
    Object.entries(unlockMap) as [BadgeId, number | null][]
  )
    .filter(([id]) => id !== 'all_in')
    .every(([, val]) => val !== null);

  unlockMap.all_in = allOthersUnlocked ? Date.now() : null;

  return Object.values(BADGE_DEFINITIONS).map((def) => ({
    ...def,
    unlockedAt: unlockMap[def.id] ?? undefined,
  }));
}
