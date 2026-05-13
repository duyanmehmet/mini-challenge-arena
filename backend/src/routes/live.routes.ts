import { Router } from 'express';
import db from '../database';
import { authMiddleware as requireAuth, type AuthRequest } from '../middleware/auth.middleware';

const router = Router();

/** Aktif/yaklaşan canlı yarışmayı döndür */
router.get('/status', requireAuth, async (req: AuthRequest, res) => {
  try {
    const now = new Date();
    const tournament = await db('live_tournaments')
      .where('scheduled_at', '>=', now.toISOString())
      .orWhere('status', 'active')
      .orderBy('scheduled_at', 'asc')
      .first();

    if (!tournament) return res.json({ status: 'none' });

    const participantCount = await db('live_scores')
      .where('tournament_id', tournament.id)
      .countDistinct('user_id as count')
      .first();

    res.json({
      status: tournament.status,
      scheduledAt: tournament.scheduled_at,
      category: tournament.category,
      participantCount: Number((participantCount as any)?.count ?? 0),
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/** Yarışmaya katıl — skor kaydet */
router.post('/submit', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { tournamentId, score, correctAnswers, totalQuestions, durationMs } = req.body;

    const tournament = await db('live_tournaments').where({ id: tournamentId, status: 'active' }).first();
    if (!tournament) return res.status(400).json({ error: 'Yarışma aktif değil' });

    const existing = await db('live_scores').where({ tournament_id: tournamentId, user_id: userId }).first();
    if (existing) return res.status(400).json({ error: 'Zaten katıldın' });

    await db('live_scores').insert({
      tournament_id: tournamentId,
      user_id: userId,
      score,
      correct_answers: correctAnswers,
      total_questions: totalQuestions,
      duration_ms: durationMs,
      submitted_at: new Date().toISOString(),
    });

    // XP + coin ödülü
    await db('users').where({ id: userId }).increment({ xp: Math.floor(score / 5), coins: 10 });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/** Canlı yarışma liderboardu */
router.get('/leaderboard/:tournamentId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { tournamentId } = req.params;
    const rows = await db('live_scores as ls')
      .join('users as u', 'ls.user_id', 'u.id')
      .where('ls.tournament_id', tournamentId)
      .orderBy([
        { column: 'ls.score', order: 'desc' },
        { column: 'ls.duration_ms', order: 'asc' }, // eşit puanda hız belirler
      ])
      .limit(50)
      .select('u.username', 'u.avatar_id', 'ls.score', 'ls.correct_answers', 'ls.duration_ms');

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
