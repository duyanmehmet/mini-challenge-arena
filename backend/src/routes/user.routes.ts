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
        emailVerified: user.email_verified ?? false,
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
    // Benzersizlik kontrolü
    const existing = await db("users").where("username", username).whereNot("id", req.userId).first();
    if (existing)
      return res.status(409).json({ message: "Bu kullanıcı adı zaten alınmış." });
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
      .select("id","task_type","task_description","current_value","target_value","coin_reward","xp_reward","is_completed")
      .orderBy("is_completed", "asc");

    res.json(tasks);
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});


// ── Arkadaş istatistikleri (friend profile ekranı için) ─────────────
router.get("/friend-stats/:friendId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const fid = req.params.friendId;
    const user = await db("users").where("id", fid)
      .select("id","username","avatar_id","level","xp","weekly_score","current_league","streak_count")
      .first();
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    const totalGames = await db("game_sessions").where("user_id", fid)
      .count("* as cnt").first()
      .then((r: any) => parseInt(r?.cnt ?? "0")).catch(() => 0);

    const wins = await db("duels").where("winner_id", fid)
      .count("* as cnt").first()
      .then((r: any) => parseInt(r?.cnt ?? "0")).catch(() => 0);

    const totalDuels = await db("duels")
      .where((b: any) => b.where("challenger_id", fid).orWhere("opponent_id", fid))
      .count("* as cnt").first()
      .then((r: any) => parseInt(r?.cnt ?? "0")).catch(() => 0);

    res.json({
      username: user.username, avatarId: user.avatar_id,
      level: user.level, xp: user.xp,
      weeklyScore: user.weekly_score ?? 0,
      totalGames, winRate: totalDuels > 0 ? Math.round((wins / totalDuels) * 100) : 0,
      totalScore: user.weekly_score ?? 0,
    });
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

// ── Günlük giriş ödülü ───────────────────────────────────────────────
router.post("/daily-login", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await db("users").where("id", req.userId).select("id","coins","streak_count","last_login_at").first();
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    const now   = new Date();
    const today = now.toISOString().slice(0, 10);
    const lastLogin = user.last_login_at ? new Date(user.last_login_at).toISOString().slice(0, 10) : null;

    if (lastLogin === today) return res.json({ alreadyClaimed: true });

    const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
    const yestStr   = yesterday.toISOString().slice(0, 10);
    const isStreak  = lastLogin === yestStr;
    const newStreak = isStreak ? (user.streak_count ?? 0) + 1 : 1;

    // Ödül: seri uzadıkça artar
    const coinReward = newStreak >= 7 ? 100 : newStreak >= 3 ? 50 : 25;

    await db("users").where("id", req.userId).update({
      last_login_at: now.toISOString(),
      streak_count:  newStreak,
      coins:         db.raw(`coins + ${coinReward}`),
    });

    return res.json({ alreadyClaimed: false, coinReward, newStreak });
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

// ── Kullanıcı istatistikleri ─────────────────────────────────────────
router.get("/stats", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const [user, totalGamesRow, winsRow, totalDuelsRow] = await Promise.all([
      db("users").where("id", userId).select("streak_count","max_streak","weekly_score").first(),
      db("game_results").where("user_id", userId).count("* as cnt").first(),
      db("duels").where("winner_id", userId).count("* as cnt").first().catch(() => ({ cnt: 0 })),
      db("duels")
        .where((b: any) => b.where("challenger_id", userId).orWhere("opponent_id", userId))
        .count("* as cnt").first().catch(() => ({ cnt: 0 })),
    ]);
    const totalGames  = parseInt((totalGamesRow as any)?.cnt ?? "0");
    const totalWins   = parseInt((winsRow as any)?.cnt ?? "0");
    const totalDuels  = parseInt((totalDuelsRow as any)?.cnt ?? "0");
    res.json({
      totalGames,
      totalDuels,
      winRate: totalDuels > 0 ? Math.round((totalWins / totalDuels) * 100) : 0,
      streakCount: user?.streak_count ?? 0,
      maxStreak:   user?.max_streak ?? 0,
      weeklyScore: user?.weekly_score ?? 0,
    });
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
// ── POST /buy-streak-freeze — 100 coin ile bugünkü seriyi dondur ────
router.post("/buy-streak-freeze", authMiddleware, async (req: AuthRequest, res) => {
  const COST = 100;
  const today = new Date().toISOString().slice(0, 10);
  try {
    const user = await db("users")
      .where("id", req.userId)
      .select("coins", "streak_freeze_date", "streak_count")
      .first();
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    if ((user.coins ?? 0) < COST)
      return res.status(400).json({ message: "Yetersiz altın. 100 🪙 gerekli." });
    if (user.streak_freeze_date === today)
      return res.status(400).json({ message: "Bugün için zaten bir dondurman var." });

    await db("users").where("id", req.userId).update({
      coins: db.raw(`coins - ${COST}`),
      streak_freeze_date: today,
    });

    const updated = await db("users").where("id", req.userId).select("coins").first();
    return res.json({ coins: updated.coins, freezeDate: today, streakCount: user.streak_count });
  } catch {
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ── GET /streak-history — seri takvimi için oynanmış günler ─────────
router.get("/streak-history", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await db("users")
      .where("id", req.userId)
      .select("streak_count", "max_streak", "last_played_date", "streak_freeze_date")
      .first();
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    // Son 90 günde oynanmış benzersiz tarihler
    const rows = await db("game_results")
      .where("user_id", req.userId)
      .whereRaw("played_at >= date('now', '-90 days')")
      .select(db.raw("DATE(played_at) as played_date"))
      .groupByRaw("DATE(played_at)")
      .orderBy("played_date", "desc");

    const playedDates: string[] = rows.map((r: any) => r.played_date);

    return res.json({
      streakCount:     user.streak_count ?? 0,
      maxStreak:       user.max_streak ?? 0,
      lastPlayedDate:  user.last_played_date ?? null,
      freezeDate:      user.streak_freeze_date ?? null,
      playedDates,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

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