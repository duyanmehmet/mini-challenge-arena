import api from './api';

export interface ArenaStatus {
  phase: 'waiting' | 'active';
  // waiting
  nextAt?: string;
  secondsUntil?: number;
  nextHourTR?: number;
  // active
  arenaId?: string;
  category?: string;
  secondsLeft?: number;
  participants?: number;
  endsAt?: string;
}

export const arenaService = {
  getStatus: async (): Promise<ArenaStatus> => {
    const res = await api.get('/arena/status');
    return res.data;
  },

  join: async () => {
    const res = await api.post('/arena/join');
    return res.data;
  },

  submit: async (params: {
    arenaId: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    durationMs: number;
  }) => {
    const res = await api.post('/arena/submit', params);
    return res.data;
  },

  getLeaderboard: async (arenaId: string) => {
    const res = await api.get(`/arena/leaderboard/${arenaId}`);
    return res.data;
  },

  getMyRank: async (arenaId: string) => {
    const res = await api.get(`/arena/my-rank/${arenaId}`);
    return res.data;
  },
};
