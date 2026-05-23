import { Router } from "express";
import db from "../database";
import { authMiddleware, type AuthRequest } from "../middleware/auth.middleware";
import { DailyTaskService } from "../services/DailyTaskService";

const router = Router();

// Haftalık kategori rotasyonu — haftaya göre deterministik
const WEEK_CATEGORIES = [
  { id: "history",   name: "Tarih",        icon: "🏺", color: "#c0392b" },
  { id: "science",   name: "Bilim",         icon: "🔬", color: "#2980b9" },
  { id: "sports",    name: "Spor",          icon: "⚽", color: "#16a085" },
  { id: "geography", name: "Coğrafya",      icon: "🌍", color: "#27ae60" },
  { id: "cinema",    name: "Sinema & TV",   icon: "🎬", color: "#e91e8c" },
  { id: "general",   name: "Genel Kültür",  icon: "💡", color: "#8e44ad" },
  { id: "turkey",    name: "Türkiye",       icon: "🇹🇷", color: "#dc2626" },
  { id: "economy",   name: "Ekonomi",       icon: "📈", color: "#2ecc71" },
];

const LEAGUE_ORDER = [
  "filiz","kaya","demir","celik","bronz",
  "gumus","altin","safir","zumrut","elmas",
  "platin","kristal","mistik","ay","gunes",
  "simsek","alev","okyanus","zirve","kartal",
  "ejderha","galaksi","nova","efsane","kral",
  "yildiz","meteor","zafer","elit","sampiyon",
];

const MAX_HEARTS  = 5;
const REGEN_MS    = 30 * 60 * 1000; // 30 dakika

// Paylaşılan kalp havuzu — 2 saatte 1 yenilenir, max 5
function computeLives(ligLives: number, ligLivesAt: string | Date | null): number {
  if (ligLives >= MAX_HEARTS) return MAX_HEARTS;
  const now      = Date.now();
  const refillAt = ligLivesAt ? new Date(ligLivesAt).getTime() : now;
  const elapsed  = now - refillAt;
  const regen    = Math.floor(elapsed / REGEN_MS);
  return Math.min(MAX_HEARTS, ligLives + regen);
}

// Bir sonraki kalbin kaç dakika sonra dolacağı
function minutesToNextHeart(ligLives: number, ligLivesAt: string | Date | null): number | null {
  const current = computeLives(ligLives, ligLivesAt);
  if (current >= MAX_HEARTS) return null;
  const refillAt  = ligLivesAt ? new Date(ligLivesAt).getTime() : Date.now();
  const elapsed   = Date.now() - refillAt;
  const remaining = REGEN_MS - (elapsed % REGEN_MS);
  return Math.ceil(remaining / 60000);
}

function getWeekCategory() {
  const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  return WEEK_CATEGORIES[weekNum % WEEK_CATEGORIES.length];
}

function getWeekEndsAt(): string {
  const now = new Date();
  const day = now.getUTCDay();
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  const endsAt = new Date(now);
  endsAt.setUTCDate(now.getUTCDate() + daysUntilMonday);
  endsAt.setUTCHours(0, 0, 0, 0);
  return endsAt.toISOString();
}

// ── GET /current — haftalık lig durumu ──────────────────────────────
router.get("/current", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await db("users")
      .where("id", req.userId)
      .select("id", "username", "weekly_score", "current_league", "lig_lives", "lig_lives_at", "coins")
      .first();
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    const cat = getWeekCategory();

    const league = user.current_league ?? "filiz";

    const rank = await db("users")
      .where("current_league", league)
      .where("weekly_score", ">", user.weekly_score ?? 0)
      .count("* as cnt")
      .first()
      .then((r: any) => parseInt(r?.cnt ?? "0") + 1);

    const leagueCount = await db("users")
      .where("current_league", league)
      .count("* as cnt")
      .first()
      .then((r: any) => parseInt(r?.cnt ?? "0"));

    const ligLives = typeof user.lig_lives === "number" ? user.lig_lives : MAX_HEARTS;
    const hearts     = computeLives(ligLives, user.lig_lives_at);
    const nextHeart  = minutesToNextHeart(ligLives, user.lig_lives_at);

    return res.json({
      category: cat,
      weekEndsAt: getWeekEndsAt(),
      userScore: user.weekly_score ?? 0,
      userRank: rank,
      leagueCount,
      league,
      hearts,
      maxHearts: MAX_HEARTS,
      nextHeartMinutes: nextHeart,
    });
  } catch (err: any) {
    console.error("[lig/current]", err?.message ?? err);
    res.status(500).json({ message: `Sunucu hatası: ${err?.message ?? "bilinmeyen hata"}` });
  }
});

// ── POST /submit — skor gönder ──────────────────────────────────────
// Model B: kümülatif değil, en yüksek skor kaydedilir
// Günlük sınır yok — sadece kalp sistemi (frontend'de)
router.post("/submit", authMiddleware, async (req: AuthRequest, res) => {
  const { score, categoryId } = req.body;
  if (typeof score !== "number" || score < 0)
    return res.status(400).json({ message: "Geçersiz skor." });

  try {
    const user = await db("users")
      .where("id", req.userId)
      .select("id", "weekly_score", "current_league", "xp", "coins")
      .first();
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    // Haftanın kategorisi 2x çarpan
    const weekCat    = getWeekCategory();
    const isWeekCat  = !!(categoryId && categoryId === weekCat.id);
    const multiplier = isWeekCat ? 2 : 1;
    const finalScore = Math.round(score * multiplier);

    // En yüksek skoru kaydet (kümülatif değil)
    const prevBest       = user.weekly_score ?? 0;
    const isNewBest      = finalScore > prevBest;
    const newWeeklyScore = isNewBest ? finalScore : prevBest;

    const xpGain   = Math.floor(finalScore / 10) + 20;
    const coinGain = Math.floor(finalScore / 20) + 10;

    await db("users").where("id", req.userId).update({
      weekly_score: newWeeklyScore,
      xp:    db.raw(`xp + ${xpGain}`),
      coins: db.raw(`coins + ${coinGain}`),
    });

    const newRank = await db("users")
      .where("current_league", user.current_league)
      .where("weekly_score", ">", newWeeklyScore)
      .count("* as cnt")
      .first()
      .then((r: any) => parseInt(r?.cnt ?? "0") + 1);

    // Günlük görevleri güncelle
    DailyTaskService.updateTaskProgress(req.userId!, "score_any", finalScore).catch(() => {});
    DailyTaskService.updateTaskProgress(req.userId!, `score_${categoryId}`, finalScore).catch(() => {});
    DailyTaskService.updateTaskProgress(req.userId!, "play_count", 1).catch(() => {});

    return res.json({
      finalScore,
      newWeeklyScore,
      isNewBest,
      prevBest,
      newRank,
      xpGain,
      coinGain,
      multiplier,
      isWeekCat,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ── POST /lose-hearts — oyun bitince toplam yanlış sayısı gönder ────
// Race condition yok — tek API çağrısı, transaction ile atomik
router.post("/lose-hearts", authMiddleware, async (req: AuthRequest, res) => {
  const { count = 1 } = req.body;
  if (typeof count !== "number" || count < 1) return res.status(400).json({ message: "Geçersiz." });

  try {
    let newHearts = 0;

    await db.transaction(async (trx) => {
      const user = await trx("users")
        .where("id", req.userId)
        .select("lig_lives", "lig_lives_at")
        .first();
      if (!user) throw new Error("not found");

      const current = computeLives(user.lig_lives ?? MAX_HEARTS, user.lig_lives_at);
      newHearts = Math.max(0, current - count);

      await trx("users").where("id", req.userId).update({
        lig_lives:    newHearts,
        lig_lives_at: new Date().toISOString(),
      });
    });

    return res.json({
      hearts: newHearts,
      maxHearts: MAX_HEARTS,
      nextHeartMinutes: minutesToNextHeart(newHearts, new Date().toISOString()),
    });
  } catch {
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ── POST /revive — reklam / coin ile kalp doldur ────────────────────
router.post("/revive", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await db("users")
      .where("id", req.userId)
      .select("lig_lives", "lig_lives_at")
      .first();
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    const current = computeLives(user.lig_lives ?? MAX_HEARTS, user.lig_lives_at);
    if (current >= MAX_HEARTS) return res.json({ hearts: MAX_HEARTS, message: "Kalplerin zaten dolu." });

    const newHearts = Math.min(MAX_HEARTS, current + 1);
    await db("users").where("id", req.userId).update({
      lig_lives:    newHearts,
      lig_lives_at: new Date().toISOString(),
    });

    return res.json({ hearts: newHearts, maxHearts: MAX_HEARTS });
  } catch {
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ── POST /refill-hearts — 250 coin ile 5 kalbi birden doldur ────────
router.post("/refill-hearts", authMiddleware, async (req: AuthRequest, res) => {
  const COST = 250;
  try {
    const user = await db("users")
      .where("id", req.userId)
      .select("lig_lives", "lig_lives_at", "coins")
      .first();
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    if ((user.coins ?? 0) < COST)
      return res.status(400).json({ message: "Yetersiz altın. En az 250 🪙 gerekli." });

    await db("users").where("id", req.userId).update({
      lig_lives:    MAX_HEARTS,
      lig_lives_at: new Date().toISOString(),
      coins:        db.raw(`coins - ${COST}`),
    });

    const updated = await db("users").where("id", req.userId).select("coins").first();
    return res.json({ hearts: MAX_HEARTS, maxHearts: MAX_HEARTS, coins: updated.coins });
  } catch {
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ── GET /leaderboard — ligdeki sıralama (top 20) ────────────────────
router.get("/leaderboard", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await db("users")
      .where("id", req.userId)
      .select("current_league")
      .first();
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    const players = await db("users")
      .where("current_league", user.current_league ?? "bronze")
      .orderBy("weekly_score", "desc")
      .limit(20)
      .select("id", "username", "avatar_id", "weekly_score", "level");

    return res.json(players);
  } catch {
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ── Haftalık lig terfi/düşme (LeagueResetService tarafından çağrılır) ─
export async function processLigReset(knex: typeof db) {
  const tiers = LEAGUE_ORDER;

  for (const tier of tiers) {
    const players = await knex("users")
      .where("current_league", tier)
      .orderBy("weekly_score", "desc")
      .select("id");

    const total = players.length;
    if (total === 0) continue;

    const tierIdx = LEAGUE_ORDER.indexOf(tier);

    // İlk 5 terfi (champion'dan yukarı çıkamaz)
    if (tierIdx < LEAGUE_ORDER.length - 1) {
      const promoteIds = players.slice(0, Math.min(5, total)).map((p: any) => p.id);
      if (promoteIds.length > 0) {
        await knex("users")
          .whereIn("id", promoteIds)
          .update({ current_league: LEAGUE_ORDER[tierIdx + 1] });
      }
    }

    // Son 5 düşme (bronze'dan aşağı inemez)
    if (tierIdx > 0 && total > 10) {
      const demoteIds = players.slice(-Math.min(5, total)).map((p: any) => p.id);
      if (demoteIds.length > 0) {
        await knex("users")
          .whereIn("id", demoteIds)
          .update({ current_league: LEAGUE_ORDER[tierIdx - 1] });
      }
    }
  }

  // Haftalık skorları sıfırla
  await knex("users").update({ weekly_score: 0 });
}

export default router;
