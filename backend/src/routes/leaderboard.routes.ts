import { Router } from 'express';
import { pool } from '../db';
import { authMiddleware, type AuthRequest } from '../middleware/auth.middleware';

const router = Router();

router.get('/global', async (req, res) => {
  const mode = req.query.mode as string ?? 'all';
  const period = req.query.period as string ?? 'weekly';
  const limit = Math.min(parseInt(req.query.limit as string ?? '100'), 100);

  try {
    let query: string;
    const params: any[] = [limit];

    if (period === 'weekly') {
      query = `
        SELECT u.username, u.avatar_id, u.current_league, wl.total_score as score,
               RANK() OVER (ORDER BY wl.total_score DESC) as rank
        FROM weekly_leaderboard wl
        JOIN users u ON u.id = wl.user_id
        WHERE wl.week_start = DATE_TRUNC('week', NOW())::date
        ORDER BY wl.total_score DESC LIMIT $1`;
    } else if (period === 'daily') {
      query = `
        SELECT u.username, u.avatar_id, u.current_league,
               SUM(gr.score) as score,
               RANK() OVER (ORDER BY SUM(gr.score) DESC) as rank
        FROM game_results gr
        JOIN users u ON u.id = gr.user_id
        WHERE gr.played_at >= NOW() - INTERVAL '1 day'
        ${mode !== 'all' ? 'AND gr.mode = $2' : ''}
        GROUP BY u.id, u.username, u.avatar_id, u.current_league
        ORDER BY score DESC LIMIT $1`;
      if (mode !== 'all') params.push(mode);
    } else {
      query = `
        SELECT u.username, u.avatar_id, u.current_league, pb.score,
               RANK() OVER (ORDER BY pb.score DESC) as rank
        FROM personal_bests pb
        JOIN users u ON u.id = pb.user_id
        ${mode !== 'all' ? 'WHERE pb.mode = $2' : ''}
        ORDER BY pb.score DESC LIMIT $1`;
      if (mode !== 'all') params.push(mode);
    }

    const result = await pool.query(query, params);
    res.json(result.rows.map((r) => ({
      rank: parseInt(r.rank),
      username: r.username,
      avatarId: r.avatar_id,
      score: parseInt(r.score),
      league: r.current_league,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

router.get('/my-rank', authMiddleware, async (req: AuthRequest, res) => {
  const period = req.query.period as string ?? 'weekly';
  try {
    const result = await pool.query(
      `SELECT weekly_score as score FROM users WHERE id = $1`,
      [req.userId]
    );
    res.json({ score: result.rows[0]?.score ?? 0 });
  } catch {
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

export default router;
