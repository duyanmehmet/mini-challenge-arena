import { Router } from 'express';
import { pool } from '../db';
import { authMiddleware, type AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Arkadaş listesini getir
router.get('/friends', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const result = await pool.query(
      `SELECT u.id, u.username, u.avatar_id, u.weekly_score, u.current_league
       FROM users u
       JOIN friendships f ON (f.requester_id = u.id OR f.receiver_id = u.id)
       WHERE (f.requester_id = $1 OR f.receiver_id = $1)
         AND u.id != $1
         AND f.status = 'accepted'`,
      [userId]
    );
    res.json(result.rows.map(r => ({
      userId: r.id,
      username: r.username,
      avatarId: r.avatar_id,
      weeklyScore: r.weekly_score,
      league: r.current_league
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

// Arkadaş ara
router.get('/search', authMiddleware, async (req: AuthRequest, res) => {
  const { q } = req.query;
  if (!q || (q as string).length < 3) {
    return res.status(400).json({ message: 'Arama terimi en az 3 karakter olmalı.' });
  }
  try {
    const result = await pool.query(
      'SELECT id, username, avatar_id FROM users WHERE username ILIKE $1 AND id != $2 LIMIT 10',
      [`%${q}%`, req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

// Arkadaşlık isteği gönder
router.post('/request', authMiddleware, async (req: AuthRequest, res) => {
  const { receiverId } = req.body;
  if (!receiverId) return res.status(400).json({ message: 'Alıcı ID gerekli.' });
  
  try {
    await pool.query(
      `INSERT INTO friendships (requester_id, receiver_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [req.userId, receiverId]
    );
    res.json({ message: 'İstek gönderildi.' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

// Bekleyen istekleri getir
router.get('/requests', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT f.id as friendship_id, u.id as user_id, u.username, u.avatar_id
       FROM friendships f
       JOIN users u ON u.id = f.requester_id
       WHERE f.receiver_id = $1 AND f.status = 'pending'`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

// İsteği kabul et
router.post('/accept', authMiddleware, async (req: AuthRequest, res) => {
  const { friendshipId } = req.body;
  try {
    await pool.query(
      "UPDATE friendships SET status = 'accepted' WHERE id = $1 AND receiver_id = $2",
      [friendshipId, req.userId]
    );
    res.json({ message: 'İstek kabul edildi.' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

export default router;
