import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { pool } from '../db';

import { authMiddleware, type AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Arkadaşlık isteği gönder
router.post('/request', authMiddleware, async (req: AuthRequest, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ message: 'Kullanıcı adı gerekli.' });

  try {
    const target = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (!target.rows[0]) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    const receiverId = target.rows[0].id;
    if (receiverId === req.userId) return res.status(400).json({ message: 'Kendinize istek gönderemezsiniz.' });

    await pool.query(
      `INSERT INTO friendships (requester_id, receiver_id) VALUES ($1, $2)
       ON CONFLICT (requester_id, receiver_id) DO NOTHING`,
      [req.userId, receiverId]
    );
    res.json({ message: 'Arkadaşlık isteği gönderildi.' });
  } catch { res.status(500).json({ message: 'Sunucu hatası.' }); }
});

// Arkadaşlık isteğini kabul et
router.post('/accept', authMiddleware, async (req: AuthRequest, res) => {
  const { requesterId } = req.body;
  try {
    await pool.query(
      `UPDATE friendships SET status = 'accepted'
       WHERE requester_id = $1 AND receiver_id = $2`,
      [requesterId, req.userId]
    );
    res.json({ message: 'Arkadaşlık isteği kabul edildi.' });
  } catch { res.status(500).json({ message: 'Sunucu hatası.' }); }
});

// Arkadaş listesi
router.get('/list', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.avatar_id, u.weekly_score, u.current_league
       FROM friendships f
       JOIN users u ON (
         CASE WHEN f.requester_id = $1 THEN f.receiver_id ELSE f.requester_id END = u.id
       )
       WHERE (f.requester_id = $1 OR f.receiver_id = $1) AND f.status = 'accepted'
       ORDER BY u.weekly_score DESC`,
      [req.userId]
    );
    res.json(result.rows.map((r) => ({
      userId: r.id, username: r.username,
      avatarId: r.avatar_id, weeklyScore: r.weekly_score, league: r.current_league,
    })));
  } catch { res.status(500).json({ message: 'Sunucu hatası.' }); }
});

// Gelen istekler
router.get('/requests', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.avatar_id
       FROM friendships f JOIN users u ON f.requester_id = u.id
       WHERE f.receiver_id = $1 AND f.status = 'pending'`,
      [req.userId]
    );
    res.json(result.rows.map((r) => ({
      userId: r.id, username: r.username, avatarId: r.avatar_id,
    })));
  } catch { res.status(500).json({ message: 'Sunucu hatası.' }); }
});

// Düello başlat
router.post('/duel', authMiddleware, async (req: AuthRequest, res) => {
  const { friendId, mode } = req.body;
  const VALID_MODES = ['reflex','memory','football','word','attention','escape'];
  if (!friendId || !VALID_MODES.includes(mode)) {
    return res.status(400).json({ message: 'Geçersiz veri.' });
  }
  try {
    const duelId = uuid();
    await pool.query(
      `INSERT INTO duels (id, challenger_id, opponent_id, mode) VALUES ($1, $2, $3, $4)`,
      [duelId, req.userId, friendId, mode]
    );
    res.json({ duelId });

  } catch { res.status(500).json({ message: 'Sunucu hatası.' }); }
});

export default router;
