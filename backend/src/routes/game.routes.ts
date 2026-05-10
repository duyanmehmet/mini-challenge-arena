import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { pool } from '../db';

import { authMiddleware, type AuthRequest } from '../middleware/auth.middleware';
import { redis } from '../redis';

const router = Router();

const VALID_MODES = ['reflex','memory','football','word','attention','escape'];

router.post('/result', authMiddleware, async (req: AuthRequest, res) => {
  const { mode, score, duration_seconds, combo_max } = req.body;
  if (!VALID_MODES.includes(mode) || typeof score !== 'number') {
    return res.status(400).json({ message: 'Geçersiz veri.' });
  }
  const userId = req.userId!;

  // Temel Anti-cheat
  if (score > 10000) { // Mini oyunlar için 10k üstü şüpheli
    return res.status(400).json({ message: 'Şüpheli skor tespiti.' });
  }
  if (duration_seconds < 5 && score > 500) {
    return res.status(400).json({ message: 'Geçersiz oyun süresi.' });
  }


  try {
    // Kişisel rekor kontrolü
    const pbRes = await pool.query(
      'SELECT score FROM personal_bests WHERE user_id = $1 AND mode = $2',
      [userId, mode]
    );
    const prevBest = pbRes.rows[0]?.score ?? 0;
    const isPersonalBest = score > prevBest;

    if (isPersonalBest) {
      await pool.query(
        `INSERT INTO personal_bests (user_id, mode, score)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, mode) DO UPDATE SET score = $3, achieved_at = NOW()`,
        [userId, mode, score]
      );
    }

    // Oyun sonucunu kaydet
    await pool.query(
      `INSERT INTO game_results (user_id, mode, score, duration_seconds, combo_max, is_personal_best)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, mode, score, duration_seconds ?? 0, combo_max ?? 1, isPersonalBest]
    );

    // XP ve coin hesaplama
    const xpGained = 10 + (isPersonalBest ? 25 : 0);
    const coinsGained = Math.floor(score / 100) + 5;

    // Streak güncelle: bugün ilk oynama ise streak+1, dün oynadıysa devam, yoksa sıfırla
    const streakRes = await pool.query(
      'SELECT last_played_date, streak_count FROM users WHERE id = $1',
      [userId]
    );
    const { last_played_date, streak_count } = streakRes.rows[0] ?? {};
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    let newStreak = 1;
    if (last_played_date === today) newStreak = streak_count ?? 1;
    else if (last_played_date === yesterday) newStreak = (streak_count ?? 0) + 1;

    await pool.query(
      `UPDATE users
       SET xp = xp + $1, coins = coins + $2, weekly_score = weekly_score + $3,
           level = (xp + $1) / 500 + 1,
           streak_count = $5, last_played_date = $6
       WHERE id = $4`,
      [xpGained, coinsGained, score, userId, newStreak, today]
    );

    const updatedUser = await pool.query('SELECT xp, level, coins, streak_count FROM users WHERE id = $1', [userId]);
    const userStats = updatedUser.rows[0];

    // Redis haftalık liderlik güncellemesi
    const weekKey = `leaderboard:weekly:${getCurrentWeekKey()}`;
    await redis.zIncrBy(weekKey, score, userId).catch(() => {});
    await redis.expire(weekKey, 60 * 60 * 24 * 8).catch(() => {});

    // Günlük görevleri güncelle
    const { DailyTaskService } = await import('../services/DailyTaskService');

    await DailyTaskService.updateTaskProgress(userId, 'play_count', 1);
    
    if (mode === 'reflex') {
      await DailyTaskService.updateTaskProgress(userId, 'score_reflex', score);
    } else if (mode === 'football') {
      await DailyTaskService.updateTaskProgress(userId, 'score_football', score);
    } else if (mode === 'memory') {
      // Memory'de score aslında tur sayısı olabilir
      await DailyTaskService.updateTaskProgress(userId, 'memory_round', score);
    }

    // Rozetleri kontrol et
    const { BadgeService } = await import('../services/BadgeService');
    const badgesUnlocked = await BadgeService.checkAndUnlockBadges(userId, { mode, score });

    res.json({
      message: 'Skor kaydedildi.',
      xp: userStats.xp,
      level: userStats.level,
      coins: userStats.coins,
      streak: userStats.streak_count,
      isNewRecord: isPersonalBest,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

router.get('/personal-bests', authMiddleware, async (req: AuthRequest, res) => {
  const rows = await pool.query(
    'SELECT mode, score FROM personal_bests WHERE user_id = $1',
    [req.userId]
  );
  const result: Record<string, number> = {};
  for (const r of rows.rows) result[r.mode] = r.score;
  res.json(result);
});

function getCurrentWeekKey() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  return monday.toISOString().slice(0, 10);
}

export default router;
