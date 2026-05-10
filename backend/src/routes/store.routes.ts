import { Router } from 'express';
import { pool } from '../db';
import { authMiddleware, type AuthRequest } from '../middleware/auth.middleware';

const router = Router();

const COIN_PACKS = [
  { id: 'coins_100', amount: 100, price: 1.99 },
  { id: 'coins_500', amount: 500, price: 7.99 },
  { id: 'coins_1000', amount: 1000, price: 12.99 },
];

router.get('/products', async (req, res) => {
  res.json(COIN_PACKS);
});

router.post('/purchase-coins', authMiddleware, async (req: AuthRequest, res) => {
  const { packId, transactionId } = req.body;
  
  const pack = COIN_PACKS.find(p => p.id === packId);
  if (!pack) return res.status(400).json({ message: 'Geçersiz paket.' });

  // In a real app, we would verify transactionId with Apple/Google API here.
  
  try {
    await pool.query(
      'UPDATE users SET coins = coins + $1 WHERE id = $2',
      [pack.amount, req.userId]
    );

    const userRes = await pool.query('SELECT coins FROM users WHERE id = $1', [req.userId]);
    res.json({
      message: 'Satın alma başarılı.',
      newBalance: userRes.rows[0].coins
    });

  } catch (err) {
    res.status(500).json({ message: 'İşlem başarısız.' });
  }
});

const AVATAR_PRICES: Record<number, number> = {
  4: 100, 5: 100, 6: 250, 7: 250, 8: 500, 9: 500, 10: 1000
};

router.post('/unlock-avatar', authMiddleware, async (req: AuthRequest, res) => {
  const { avatarId } = req.body;
  const price = AVATAR_PRICES[avatarId];

  if (!price) return res.status(400).json({ message: 'Bu avatar satın alınamaz.' });

  try {
    // 1. Kullanıcı bakiyesini kontrol et
    const userRes = await pool.query('SELECT coins FROM users WHERE id = $1', [req.userId]);
    const currentCoins = userRes.rows[0].coins;

    if (currentCoins < price) {
      return res.status(400).json({ message: 'Yetersiz coin.' });
    }

    // 2. Satın alımı gerçekleştir (Transaction kullanmak daha iyi ama şimdilik seri)
    await pool.query('UPDATE users SET coins = coins - $1 WHERE id = $2', [price, req.userId]);
    await pool.query(
      'INSERT INTO user_avatars (user_id, avatar_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.userId, avatarId]
    );

    res.json({ message: 'Avatar kilidi açıldı.', newBalance: currentCoins - price });
  } catch (err) {
    res.status(500).json({ message: 'İşlem başarısız.' });
  }
});

export default router;

