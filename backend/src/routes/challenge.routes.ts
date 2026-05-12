import { Router } from "express";
import db from "../database";
import { authMiddleware, type AuthRequest } from "../middleware/auth.middleware";
import { v4 as uuidv4 } from "uuid";

const router = Router();
const MODES = ["reflex","memory","football","word","attention","escape","math","chain"];

// Bugünkü challenge'ı al (yoksa oluştur)
router.get("/today", async (_req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  try {
    let challenge = await db("daily_challenges").where("date", today).first();
    if (!challenge) {
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
      const mode = MODES[dayOfYear % MODES.length];
      challenge = { date: today, mode, seed: dayOfYear * 137 + 42, target_score: 500 + dayOfYear * 10, special_rule: null };
      await db("daily_challenges").insert(challenge).onConflict("date").ignore();
    }
    res.json(challenge);
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

// Skor gönder
router.post("/submit", authMiddleware, async (req: AuthRequest, res) => {
  const { score } = req.body;
  const today = new Date().toISOString().slice(0, 10);
  if (!score || score < 0) return res.status(400).json({ message: "Geçersiz skor." });
  try {
    await db("daily_challenge_scores")
      .insert({ id: uuidv4(), date: today, user_id: req.userId, score })
      .onConflict(["date", "user_id"]).merge(["score"]);

    // XP ödülü
    const challenge = await db("daily_challenges").where("date", today).first();
    const xpBonus = score >= (challenge?.target_score ?? 500) ? 100 : 25;
    await db("users").where("id", req.userId).update({ xp: db.raw("xp + ?", [xpBonus]) });

    // Sıralama
    const rank = await db("daily_challenge_scores")
      .where("date", today).where("score", ">", score).count("* as cnt").first();

    res.json({ success: true, xpBonus, rank: parseInt((rank as any)?.cnt ?? "0") + 1 });
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

// Liderlik
router.get("/leaderboard", async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const rows = await db("daily_challenge_scores")
      .where("date", today)
      .join("users", "users.id", "daily_challenge_scores.user_id")
      .select("users.username", "users.avatar_id as avatarId", "users.current_league as league",
        "daily_challenge_scores.score")
      .orderBy("daily_challenge_scores.score", "desc")
      .limit(50);
    res.json(rows.map((r: any, i: number) => ({ ...r, rank: i + 1 })));
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

export default router;