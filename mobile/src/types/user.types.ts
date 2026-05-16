import type { LeagueId } from '../constants/leagues';

export interface User {
  id: string;
  username: string;
  email: string;
  avatarId: number;
  coins: number;
  xp: number;
  level: number;
  currentLeague: LeagueId;
  weeklyScore: number;
  isPremium: boolean;
  streakCount: number;
  maxStreak: number;
  unlockedAvatars: number[];
  emailVerified: boolean;
}


export interface Badge {
  id: string;
  unlockedAt: string;
}

export interface PersonalBest {
  mode: string;
  score: number;
  achievedAt: string;
}

export interface Friend {
  userId: string;
  username: string;
  avatarId: number;
  weeklyScore: number;
  league: LeagueId;
}

export interface DailyTask {
  taskType: string;
  description: string;
  currentValue: number;
  targetValue: number;
  coinReward: number;
  xpReward: number;
  isCompleted: boolean;
}
