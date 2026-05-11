import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import db from "../database";
import { authLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

function signToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: (process.env.JWT_EXPIRES_IN ?? "30d") as any });
}

function mapUser(u: any) {
  return {
    id: u.id, username: u.username, email: u.email,
    avatarId: u.avatar_id, coins: u.coins, xp: u.xp, level: u.level,
    currentLeague: u.current_league, weeklyScore: u.weekly_score, isPremium: u.is_premium,
    streakCount: u.streak_count ?? 0,
  };
}

// ── Kayıt ──
router.post("/register", authLimiter, async (req, res) => {
  const { username, email, password, avatarId = 1 } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: "Tüm alanlar zorunlu." });
  if (username.length < 3 || username.length > 20)
    return res.status(400).json({ message: "Kullanıcı adı 3-20 karakter olmalı." });

  try {
    const exists = await db("users").where("email", email.toLowerCase()).orWhere("username", username).first();
    if (exists) return res.status(409).json({ message: "E-posta veya kullanıcı adı zaten kullanılıyor." });

    const hash = await bcrypt.hash(password, 12);
    const userId = uuidv4();
    await db("users").insert({ id: userId, username, email: email.toLowerCase(), password_hash: hash, avatar_id: avatarId });

    const user = await db("users").where("id", userId).first();

    const { DailyTaskService } = await import("../services/DailyTaskService");
    await DailyTaskService.ensureTasksForToday(userId);

    // Hoş geldin e-postası (sessiz hata)
    import("../services/email.service").then(({ emailService }) =>
      emailService.sendWelcome(email, username).catch(() => {})
    );

    res.status(201).json({ user: mapUser(user), token: signToken(userId) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ── Giriş ──
router.post("/login", authLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "E-posta ve şifre gerekli." });

  try {
    const user = await db("users").where("email", email.toLowerCase()).first();
    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return res.status(401).json({ message: "E-posta veya şifre hatalı." });

    // Streak güncelle
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    let streak = user.streak_count ?? 1;
    if (user.last_played_date !== today) {
      streak = user.last_played_date === yesterday ? streak + 1 : 1;
    }
    const coinsBonus = user.last_played_date !== today ? Math.min(streak, 7) * 10 : 0;

    await db("users").where("id", user.id).update({
      streak_count: streak, last_played_date: today,
      last_login_at: db.fn.now(),
      coins: db.raw("coins + ?", [coinsBonus]),
    });

    const { DailyTaskService } = await import("../services/DailyTaskService");
    await DailyTaskService.ensureTasksForToday(user.id);

    const updated = await db("users").where("id", user.id).first();
    res.json({ user: mapUser(updated), token: signToken(user.id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ── Şifre sıfırlama ──
router.post("/forgot-password", authLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "E-posta gerekli." });

  try {
    const user = await db("users").where("email", email.toLowerCase()).first();
    if (user) {
      const resetToken = uuidv4();
      // Token'ı kaydet (gerçek uygulamada ayrı tablo veya Redis)
      await db("users").where("id", user.id).update({ reset_token: resetToken });
      const { emailService } = await import("../services/email.service");
      await emailService.sendPasswordReset(email, resetToken).catch(() => {});
    }
    // Kullanıcı var olsa da olmasa da aynı yanıt (güvenlik)
    res.json({ message: "E-posta gönderildi (eğer hesap mevcutsa)." });
  } catch {
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

export default router;