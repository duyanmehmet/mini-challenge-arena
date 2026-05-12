import api from "./api";

export interface GameResultResponse {
  isPersonalBest: boolean;
  xpGained: number;
  coinsGained: number;
  badgesUnlocked: string[];
  newLevel: number | null;
  streakCount: number;
}

export const gameService = {
  submitResult: async (data: {
    mode: string;
    score: number;
    duration_seconds: number;
    combo_max: number;
  }): Promise<GameResultResponse> => {
    const response = await api.post<GameResultResponse>("/game/result", data);
    return response.data;
  },

  getPersonalBests: async (): Promise<Record<string, number>> => {
    const response = await api.get("/game/personal-bests");
    return response.data;
  },
};
