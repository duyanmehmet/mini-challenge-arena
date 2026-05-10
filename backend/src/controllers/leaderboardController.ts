import { Request, Response } from "express";
import { User } from "../models/User";

export const getGlobalLeaderboard = async (req: Request, res: Response) => {
  try {
    const leaderboard = await User.query()
      .select("id", "username", "avatar_id", "weekly_score", "current_league")
      .orderBy("weekly_score", "desc")
      .limit(100);

    const formatted = leaderboard.map((user, index) => ({
      rank: index + 1,
      ...user,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ message: "Liderlik tablosu alınamadı." });
  }
};
