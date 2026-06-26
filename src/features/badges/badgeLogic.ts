import type { Badge, BadgeId, CheckIn, DayConfig, CampUser } from "@/types";

export const BADGE_DEFINITIONS: Record<BadgeId, Omit<Badge, "unlockedAt">> = {
  explorer: {
    id: "explorer",
    name: "Explorer",
    emoji: "🧭",
    description: "Complete your very first check-in.",
  },
  fire_keeper: {
    id: "fire_keeper",
    name: "Fire Keeper",
    emoji: "🔥",
    description: "Complete all 7 days of camp. The flame never died.",
  },
  early_bird: {
    id: "early_bird",
    name: "Early Bird",
    emoji: "🌅",
    description: "Check in before 9 AM on any day.",
  },
  three_in_a_row: {
    id: "three_in_a_row",
    name: "On Fire",
    emoji: "⚡",
    description: "Complete 3 days in a row.",
  },
  halfway: {
    id: "halfway",
    name: "Halfway There",
    emoji: "🏕️",
    description: "Complete 4 out of 7 days.",
  },
  secret_seeker: {
    id: "secret_seeker",
    name: "Secret Seeker",
    emoji: "🕵️",
    description: "???",
  },
};

export function computeBadges(
  checkIns: CheckIn[],
  days: DayConfig[],
  user: CampUser
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
  const secretUnlocked = user.nickname.toLowerCase().includes("fire");

  const unlockMap: Record<BadgeId, number | null> = {
    explorer: completed >= 1 ? checkIns.reduce((a, b) => Math.min(a, b.completedAt), Infinity) : null,
    fire_keeper: completed >= totalDays ? Date.now() : null,
    early_bird: hasEarlyBird ? (checkIns.find((c) => c.earlyBird)?.completedAt ?? null) : null,
    three_in_a_row: maxConsecutive >= 3 ? Date.now() : null,
    halfway: completed >= 4 ? Date.now() : null,
    secret_seeker: secretUnlocked ? Date.now() : null,
  };

  return Object.values(BADGE_DEFINITIONS).map((def) => ({
    ...def,
    unlockedAt: unlockMap[def.id] ?? undefined,
  }));
}
