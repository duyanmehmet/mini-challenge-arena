import { Router } from "express";
import db from "../database";
import { authMiddleware, type AuthRequest } from "../middleware/auth.middleware";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// Tüm geçerli kategoriler
const MODES = [
  "history","geography","science","general","art","cinema","sports","turkey",
  "kids","license","medical","economy",
];

// Bugünkü challenge'ı al (yoksa oluştur)
router.get("/today", async (_req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  try {
    let challenge = await db("daily_challenges").where("date", today).first();
    if (!challenge) {
      const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
      );
      const mode = MODES[dayOfYear % MODES.length];
      const id   = uuidv4();
      await db("daily_challenges").insert({
        id, date: today, mode,
        seed: dayOfYear * 137 + 42,
        target_score: 500 + (dayOfYear % 30) * 50,
        special_rule: null,
      }).onConflict("date").ignore();
      challenge = await db("daily_challenges").where("date", today).first();
    }
    // id yoksa (eski satır) backfill et
    if (challenge && !challenge.id) {
      const id = uuidv4();
      await db("daily_challenges").where("date", today).update({ id });
      challenge.id = id;
    }
    res.json(challenge);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// Skor gönder — challengeId veya tarih bazlı
router.post("/submit", authMiddleware, async (req: AuthRequest, res) => {
  const { score, challengeId } = req.body;
  const today = new Date().toISOString().slice(0, 10);
  if (!score || score < 0) return res.status(400).json({ message: "Geçersiz skor." });

  try {
    // Hangi challenge? — ID veya tarih ile bul
    const challenge = challengeId
      ? await db("daily_challenges").where("id", challengeId).orWhere("date", challengeId).first()
      : await db("daily_challenges").where("date", today).first();

    if (!challenge) return res.status(404).json({ message: "Challenge bulunamadı." });

    // Skor kaydet veya güncelle (daha yüksek skor korur)
    const existing = await db("daily_challenge_scores")
      .where({ date: challenge.date, user_id: req.userId }).first();

    if (existing && existing.score >= score) {
      return res.json({ success: true, message: "Mevcut skorun daha yüksek.", rank: 1 });
    }

    await db("daily_challenge_scores")
      .insert({ id: uuidv4(), date: challenge.date, user_id: req.userId, score })
      .onConflict(["date", "user_id"]).merge(["score"]);

    // XP ödülü
    const xpBonus = score >= (challenge.target_score ?? 500) ? 100 : 25;
    await db("users").where("id", req.userId).update({ xp: db.raw("xp + ?", [xpBonus]) });

    // Güncel sıra
    const rankRow = await db("daily_challenge_scores")
      .where("date", challenge.date)
      .where("score", ">", score)
      .count("* as cnt").first();

    res.json({ success: true, xpBonus, rank: parseInt((rankRow as any)?.cnt ?? "0") + 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// Kullanıcının bugünkü durumu + streak
router.get("/my-status", authMiddleware, async (req: AuthRequest, res) => {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const challenge = await db("daily_challenges").where("date", today).first();
    const entry = challenge
      ? await db("daily_challenge_scores").where({ date: today, user_id: req.userId }).first()
      : null;

    // Streak hesapla: ardışık kaç gün oynadı
    const dates: string[] = await db("daily_challenge_scores")
      .where("user_id", req.userId)
      .orderBy("date", "desc")
      .pluck("date");

    let streak = 0;
    let checkDate = today;
    for (const d of dates) {
      if (d === checkDate) {
        streak++;
        const prev = new Date(checkDate);
        prev.setDate(prev.getDate() - 1);
        checkDate = prev.toISOString().slice(0, 10);
      } else break;
    }

    // Liderlik sırası
    let rank: number | null = null;
    if (entry) {
      const above = await db("daily_challenge_scores")
        .where("date", today).where("score", ">", entry.score).count("* as cnt").first();
      rank = parseInt((above as any)?.cnt ?? "0") + 1;
    }

    res.json({
      score: entry?.score ?? null,
      completed: entry ? entry.score >= (challenge?.target_score ?? 500) : false,
      streak,
      rank,
      xpBonus: entry ? (entry.score >= (challenge?.target_score ?? 500) ? 100 : 25) : null,
    });
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

// Liderlik
router.get("/leaderboard", async (_req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const rows = await db("daily_challenge_scores")
      .where("daily_challenge_scores.date", today)
      .join("users", "users.id", "daily_challenge_scores.user_id")
      .select(
        "users.username",
        "users.avatar_id as avatarId",
        "users.current_league as league",
        "daily_challenge_scores.score"
      )
      .orderBy("daily_challenge_scores.score", "desc")
      .limit(50);
    res.json(rows.map((r: any, i: number) => ({ ...r, rank: i + 1 })));
  } catch {
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

export default router;
