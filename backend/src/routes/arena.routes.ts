import { Router } from "express";
import db from "../database";
import { authMiddleware, type AuthRequest } from "../middleware/auth.middleware";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// ── Arena saatleri (Türkiye = UTC+3) ──────────────────────────────
export const ARENA_HOURS_UTC = [10, 15, 18]; // 13:00, 18:00, 21:00 TR
export const ARENA_DURATION_MIN = 30; // 30 dakika aktif

// ── Aktif arena state (bellekte) ──────────────────────────────────
interface ArenaSession {
  id: string;
  startAt: Date;
  endAt: Date;
  category: string;
  participants: number;
}

let currentArena: ArenaSession | null = null;

export function getArenaState() { return currentArena; }

export function startArena(category = 'general') {
  const now = new Date();
  const endAt = new Date(now.getTime() + ARENA_DURATION_MIN * 60 * 1000);
  currentArena = {
    id: uuidv4(),
    startAt: now,
    endAt,
    category,
    participants: 0,
  };

  // 30 dakika sonra bitir
  setTimeout(() => {
    currentArena = null;
  }, ARENA_DURATION_MIN * 60 * 1000);

  return currentArena;
}

// ── Sonraki arena zamanını hesapla ───────────────────────────────
function getNextArenaTime(): Date {
  const now = new Date();
  const utcH = now.getUTCHours();
  const utcM = now.getUTCMinutes();

  for (const h of ARENA_HOURS_UTC) {
    if (utcH < h || (utcH === h && utcM === 0)) {
      const next = new Date(now);
      next.setUTCHours(h, 0, 0, 0);
      return next;
    }
  }
  // Yarın ilk saate geç
  const next = new Date(now);
  next.setUTCDate(next.getUTCDate() + 1);
  next.setUTCHours(ARENA_HOURS_UTC[0], 0, 0, 0);
  return next;
}

// ── GET /arena/status ─────────────────────────────────────────────
router.get("/status", async (req, res) => {
  const now = new Date();

  if (currentArena && now < currentArena.endAt) {
    const secondsLeft = Math.floor((currentArena.endAt.getTime() - now.getTime()) / 1000);
    return res.json({
      phase: 'active',
      arenaId: currentArena.id,
      category: currentArena.category,
      secondsLeft,
      participants: currentArena.participants,
      endsAt: currentArena.endAt.toISOString(),
    });
  }

  const nextAt = getNextArenaTime();
  const secondsUntil = Math.floor((nextAt.getTime() - now.getTime()) / 1000);
  res.json({
    phase: 'waiting',
    nextAt: nextAt.toISOString(),
    secondsUntil,
    nextHourTR: nextAt.getUTCHours() + 3, // UTC → TR
  });
});

// ── POST /arena/join ──────────────────────────────────────────────
router.post("/join", authMiddleware, async (req: AuthRequest, res) => {
  if (!currentArena) return res.status(400).json({ message: "Şu an aktif arena yok." });
  currentArena.participants++;
  res.json({
    arenaId: currentArena.id,
    category: currentArena.category,
    secondsLeft: Math.floor((currentArena.endAt.getTime() - Date.now()) / 1000),
    participants: currentArena.participants,
  });
});

// ── POST /arena/submit ────────────────────────────────────────────
router.post("/submit", authMiddleware, async (req: AuthRequest, res) => {
  const { arenaId, score, correctAnswers, totalQuestions, durationMs } = req.body;
  if (!arenaId || score === undefined) return res.status(400).json({ message: "Eksik veri." });

  try {
    // Önceki giriş var mı?
    const existing = await db("arena_scores")
      .where({ arena_id: arenaId, user_id: req.userId }).first().catch(() => null);

    if (existing) {
      if (score > existing.score) {
        await db("arena_scores").where("id", existing.id).update({ score, correct_answers: correctAnswers, duration_ms: durationMs });
      }
    } else {
      await db("arena_scores").insert({
        id: uuidv4(), arena_id: arenaId,
        user_id: req.userId, score,
        correct_answers: correctAnswers ?? 0,
        total_questions: totalQuestions ?? 10,
        duration_ms: durationMs ?? 0,
      }).catch(() => {});
    }

    // XP ve coin ödülü
    const xpGain = 15 + Math.floor(score / 100);
    const coinGain = 10 + Math.floor(score / 200);
    await db("users").where("id", req.userId).update({
      xp:    db.raw("xp + ?",    [xpGain]),
      coins: db.raw("coins + ?", [coinGain]),
    });

    res.json({ success: true, xpGain, coinGain });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ── GET /arena/leaderboard ────────────────────────────────────────
router.get("/leaderboard/:arenaId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const rows = await db("arena_scores")
      .where("arena_id", req.params.arenaId)
      .join("users", "users.id", "arena_scores.user_id")
      .select(
        "users.username", "users.avatar_id as avatarId",
        "arena_scores.score", "arena_scores.correct_answers as correctAnswers",
        "arena_scores.duration_ms as durationMs"
      )
      .orderBy("arena_scores.score", "desc")
      .limit(100);

    const myRank = rows.findIndex((r: any) => r.username === req.userId) + 1;
    res.json({ leaderboard: rows.map((r: any, i: number) => ({ ...r, rank: i + 1 })), myRank });
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

// ── GET /arena/my-rank ────────────────────────────────────────────
router.get("/my-rank/:arenaId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const all = await db("arena_scores")
      .where("arena_id", req.params.arenaId)
      .orderBy("score", "desc")
      .select("user_id", "score");

    const rank = all.findIndex((r: any) => r.user_id === req.userId) + 1;
    const mine = all.find((r: any) => r.user_id === req.userId);
    res.json({ rank: rank || null, score: mine?.score || 0, total: all.length });
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

export default router;
