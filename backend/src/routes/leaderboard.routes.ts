import { Router } from "express";
import db from "../database";
import { authMiddleware, type AuthRequest } from "../middleware/auth.middleware";

const router = Router();

router.get("/global", async (req, res) => {
  const period = (req.query.period as string) ?? "weekly";
  const limit = Math.min(parseInt(req.query.limit as string ?? "100"), 100);
  try {
    let rows: any[];
    if (period === "weekly") {
      rows = await db("users")
        .select("id","username","avatar_id as avatarId","weekly_score as score","current_league as league")
        .orderBy("weekly_score", "desc").limit(limit);
    } else if (period === "daily") {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      rows = await db("game_results")
        .join("users", "users.id", "game_results.user_id")
        .select("users.id","users.username","users.avatar_id as avatarId","users.current_league as league")
        .sum("game_results.score as score")
        .where("game_results.played_at", ">=", since)
        .groupBy("users.id","users.username","users.avatar_id","users.current_league")
        .orderBy("score", "desc")
        .limit(limit);
    } else {
      // alltime — en yüksek kişisel rekorlar
      rows = await db("personal_bests")
        .join("users", "users.id", "personal_bests.user_id")
        .select("users.id","users.username","users.avatar_id as avatarId",
          "personal_bests.score","users.current_league as league")
        .orderBy("personal_bests.score", "desc").limit(limit);
    }
    res.json(rows.map((r: any, i: number) => ({ ...r, rank: i + 1 })));
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

router.get("/friends", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const uid = req.userId!;
    const friendships = await db("friendships")
      .where((b: any) => b.where("requester_id", uid).orWhere("receiver_id", uid))
      .where("status", "accepted");
    const friendIds = friendships.map((r: any) =>
      r.requester_id === uid ? r.receiver_id : r.requester_id);

    const users = await db("users")
      .whereIn("id", [...friendIds, req.userId!])
      .select("id","username","avatar_id as avatarId","weekly_score as score","current_league as league")
      .orderBy("weekly_score", "desc");
    res.json(users.map((u: any, i: number) => ({ ...u, rank: i + 1, isMe: u.id === req.userId })));
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

export default router;