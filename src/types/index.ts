export type TeamId = 'paine' | 'lumina' | 'calea' | 'invierea';

export interface CampUser {
  uid: string;
  nickname: string;
  teamId: TeamId;
  createdAt: number;
  isAdmin: boolean;
}

export interface CheckIn {
  userId: string;
  dayId: string;
  completedAt: number; // unix ms
  earlyBird: boolean; // completed before EARLY_BIRD_HOUR
}

export interface DayConfig {
  id: string; // "day-1" … "day-7"
  dayNumber: number;
  verse: string;
  verseRef: string;
  challenge: string;
  theme: string;
  unlockDate: string; // ISO date "YYYY-MM-DD"
}

export interface StreakInfo {
  current: number;
  longest: number;
  completedDays: string[]; // ["day-1", "day-3", …]
  totalCompleted: number;
}

export type BadgeId =
  | 'explorer'
  | 'fire_keeper'
  | 'early_bird'
  | 'three_in_a_row'
  | 'halfway'
  | 'secret_seeker'
  | 'first_fifteen'
  | 'captain'
  | 'team_spirit'
  | 'fire_team'
  | 'all_in'
  | 'first_appreciation'
  | 'ten_appreciations'
  | 'fifteen_appreciations';

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  emoji: string;
  unlockedAt?: number; // unix ms — undefined means locked
}

export interface Appreciation {
  id: string;
  fromUserId: string;
  fromNickname: string;
  teamId: TeamId;
  message: string;
  createdAt: number;
}

export interface AppState {
  user: CampUser | null;
  checkIns: CheckIn[];
  streak: StreakInfo;
  badges: Badge[];
  days: DayConfig[];
  loading: boolean;
  error: string | null;
  allCheckIns: CheckIn[];
  userTeamMap: Record<string, TeamId>;
  appreciationCount: number;
}
