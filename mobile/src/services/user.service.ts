import api from "./api";
import type { DailyTask } from "../types/user.types";

export const userService = {
  getProfile: async () => {
    const response = await api.get("/user/profile");
    const { user, badges, personalBests, unlockedAvatars } = response.data;
    return { user: { ...user, unlockedAvatars: unlockedAvatars ?? [1, 2, 3] }, badges, personalBests };
  },

  updateProfile: async (data: { username?: string; avatar_id?: number }) => {
    const response = await api.patch("/user/profile", data);
    return response.data;
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    const response = await api.post("/user/change-password", { oldPassword, newPassword });
    return response.data;
  },

  getDailyTasks: async (): Promise<DailyTask[]> => {
    const response = await api.get("/user/daily-tasks");
    return response.data;
  },

  deleteAccount: async () => {
    const response = await api.delete("/user/account");
    return response.data;
  },

  getStats: async () => {
    const response = await api.get("/user/stats");
    return response.data as {
      totalGames: number;
      totalDuels: number;
      winRate: number;
      streakCount: number;
      maxStreak: number;
      weeklyScore: number;
    };
  },
};