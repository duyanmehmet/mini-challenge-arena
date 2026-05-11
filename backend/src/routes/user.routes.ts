import { Router } from "express";
import bcrypt from "bcrypt";
import db from "../database";
import { authMiddleware, type AuthRequest } from "../middleware/auth.middleware";
import { v4 as uuidv4 } from "uuid";

const router = Router();

router.get("/profile", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await db("users").where("id", req.userId).first();
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    const badges = await db("user_badges").where("user_id", req.userId).pluck("badge_id");
    const pbs = await db("personal_bests").where("user_id", req.userId).select("mode","score","achieved_at");
    const avatars = await db("user_avatars").where("user_id", req.userId).pluck("avatar_id");

    res.json({
      user: {
        id: user.id, username: user.username, email: user.email,
        avatarId: user.avatar_id, coins: user.coins, xp: user.xp, level: user.level,
        currentLeague: user.current_league, weeklyScore: user.weekly_score, isPremium: user.is_premium,
        streakCount: user.streak_count ?? 0, maxStreak: user.max_streak ?? 0,
      },
      badges,
      personalBests: pbs.map((p: any) => ({ mode: p.mode, score: p.score, achievedAt: p.achieved_at })),
      unlockedAvatars: [...new Set([1, 2, 3, ...avatars])],
    });
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

router.patch("/profile", authMiddleware, async (req: AuthRequest, res) => {
  const { username, avatar_id } = req.body;
  const updates: Record<string, any> = {};
  if (username) {
    if (username.length < 3 || username.length > 20)
      return res.status(400).json({ message: "Kullanıcı adı 3-20 karakter olmalı." });
    updates.username = username;
  }
  if (avatar_id !== undefined) updates.avatar_id = avatar_id;
  if (!Object.keys(updates).length) return res.status(400).json({ message: "Güncellenecek alan yok." });

  try {
    await db("users").where("id", req.userId).update(updates);
    res.json({ message: "Profil güncellendi." });
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

router.post("/change-password", authMiddleware, async (req: AuthRequest, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword || newPassword.length < 6)
    return res.status(400).json({ message: "Şifreler geçersiz." });
  try {
    const user = await db("users").where("id", req.userId).first();
    const valid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!valid) return res.status(400).json({ message: "Mevcut şifre yanlış." });
    const hash = await bcrypt.hash(newPassword, 12);
    await db("users").where("id", req.userId).update({ password_hash: hash });
    res.json({ message: "Şifre güncellendi." });
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

router.get("/daily-tasks", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { DailyTaskService } = await import("../services/DailyTaskService");
    await DailyTaskService.ensureTasksForToday(req.userId!);

    const tasks = await db("daily_tasks")
      .where({ user_id: req.userId, date: new Date().toISOString().slice(0, 10) })
      .select("task_type","task_description","current_value","target_value","coin_reward","xp_reward","is_completed");

    res.json(tasks.map((r: any) => ({
      taskType: r.task_type, description: r.task_description,
      currentValue: r.current_value, targetValue: r.target_value,
      coinReward: r.coin_reward, xpReward: r.xp_reward, isCompleted: r.is_completed,
    })));
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});


router.post("/push-token", authMiddleware, async (req: AuthRequest, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: "Token gerekli." });
  try {
    await db("users").where("id", req.userId).update({ push_token: token });
    res.json({ message: "Push token kaydedildi." });
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

// Hesap silme (KVKK)
router.delete("/account", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    // Cascade ON DELETE ile ilgili tablolar otomatik silinir
    await db("users").where("id", userId).delete();
    res.json({ message: "Hesabınız başarıyla silindi." });
  } catch {
    res.status(500).json({ message: "Sunucu hatası." });
  }
});
export default router;