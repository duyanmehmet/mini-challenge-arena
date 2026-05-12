import api from "./api";

export const leaderboardService = {
  getGlobal: async (period: "daily" | "weekly" | "alltime" = "weekly", mode: string = "all") => {
    const res = await api.get("/leaderboard/global", { params: { period, mode, limit: 100 } });
    return res.data;
  },

  getFriends: async () => {
    const res = await api.get("/leaderboard/friends");
    return res.data;
  },
};