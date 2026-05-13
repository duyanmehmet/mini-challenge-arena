import { Router } from "express";
import db from "../database";
import { authMiddleware, type AuthRequest } from "../middleware/auth.middleware";
import { redis } from "../redis";
import { v4 as uuidv4 } from "uuid";

const router = Router();
const VALID_MODES = [
  // Kültür
  "history","geography","science","general","art","cinema","sports","turkey",
  // Özel
  "kids","license","medical","economy",
  // Eski (geriye dönük uyumluluk)
  "reflex","memory","football","word","attention","escape","math","english",
];

router.post("/result", authMiddleware, async (req: AuthRequest, res) => {
  const { mode, score, duration_seconds, combo_max } = req.body;
  if (!VALID_MODES.includes(mode) || typeof score !== "number")
    return res.status(400).json({ message: "Geçersiz veri." });

  // Anti-cheat — quiz modlarında skor sınırını yükselt
  const maxScore = ["history","geography","science","general","art","cinema","sports","turkey","kids","license","medical","economy"].includes(mode)
    ? 50000 : 10000;
  if (score > maxScore) return res.status(400).json({ message: "Şüpheli skor." });
  if (duration_seconds < 5 && score > 500) return res.status(400).json({ message: "Geçersiz süre." });

  const userId = req.userId!;

  try {
    // Duplicate koruma: son 10 saniyede aynı skor gelmiş mi?
    const recent = await db("game_results")
      .where({ user_id: userId, mode, score })
      .where("played_at", ">=", db.raw("datetime('now', '-10 seconds')"))
      .first();
    if (recent) return res.status(429).json({ message: "Çok hızlı gönderim." });

    // Kişisel rekor
    const pb = await db("personal_bests").where({ user_id: userId, mode }).first();
    const isPersonalBest = !pb || score > pb.score;

    if (isPersonalBest) {
      await db("personal_bests")
        .insert({ id: uuidv4(), user_id: userId, mode, score })
        .onConflict(["user_id", "mode"]).merge(["score", "achieved_at"]);
    }

    await db("game_results").insert({
      id: uuidv4(), user_id: userId, mode, score,
      duration_seconds: duration_seconds ?? 0,
      combo_max: combo_max ?? 1,
      is_personal_best: isPersonalBest,
    });

    // Streak
    const user = await db("users").where("id", userId).first();
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    let newStreak = 1;
    if (user.last_played_date === today) newStreak = user.streak_count || 1;
    else if (user.last_played_date === yesterday) newStreak = (user.streak_count || 0) + 1;

    const xpGained = 10 + (isPersonalBest ? 25 : 0);
    const coinsGained = Math.floor(score / 100) + 5;
    const newXP = (user.xp || 0) + xpGained;
    const newLevel = Math.min(Math.floor(newXP / 500) + 1, 50);

    const currentMaxStreak = user.max_streak ?? 0;
    await db("users").where("id", userId).update({
      xp: newXP, level: newLevel,
      coins: db.raw("coins + ?", [coinsGained]),
      weekly_score: db.raw("weekly_score + ?", [score]),
      streak_count: newStreak,
      last_played_date: today,
      max_streak: Math.max(currentMaxStreak, newStreak),
    });

    // Redis haftalık liderlik
    const weekKey = `leaderboard:weekly:${getWeekKey()}`;
    await redis.zIncrBy(weekKey, score, userId).catch(() => {});
    await redis.expire(weekKey, 60 * 60 * 24 * 8).catch(() => {});

    // Günlük görevler
    const { DailyTaskService } = await import("../services/DailyTaskService");
    await DailyTaskService.updateTaskProgress(userId, "play_count", 1);
    await DailyTaskService.updateTaskProgress(userId, "score_any", score);
    // Kategori bazlı görevler
    const catTask = `score_${mode}`;
    await DailyTaskService.updateTaskProgress(userId, catTask, score).catch(() => {});

    // Rozetler
    const { BadgeService } = await import("../services/BadgeService");
    const badgesUnlocked = await BadgeService.checkAndUnlockBadges(userId, { mode, score });

    // Seri bildirimi (3, 7, 30 gün)
    import("../services/streak.service").then(({ streakService }) =>
      streakService.checkAndNotify(userId, newStreak).catch(() => {})
    );

    res.json({ isPersonalBest, xpGained, coinsGained, badgesUnlocked, newLevel, streakCount: newStreak });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

router.get("/personal-bests", authMiddleware, async (req: AuthRequest, res) => {
  const rows = await db("personal_bests").where("user_id", req.userId).select("mode", "score");
  const result: Record<string, number> = {};
  rows.forEach((r: any) => { result[r.mode] = r.score; });
  res.json(result);
});

function getWeekKey() {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  return monday.toISOString().slice(0, 10);
}

export default router;