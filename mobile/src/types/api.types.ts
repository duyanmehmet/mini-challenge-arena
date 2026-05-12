export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}

export interface AuthResponse {
  user: import('./user.types').User;
  token: string;
}

export interface GameResultResponse {
  isPersonalBest: boolean;
  xpGained: number;
  coinsGained: number;
  badgesUnlocked: string[];
  newLevel: number | null;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatarId: number;
  score: number;
  league: string;
}
