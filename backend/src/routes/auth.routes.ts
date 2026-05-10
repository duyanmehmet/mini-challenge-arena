import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { pool } from '../db';
import { authLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.post('/register', authLimiter, async (req, res) => {
  const { username, email, password, avatarId } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Tüm alanlar zorunlu.' });
  }
  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ message: 'Kullanıcı adı 3-20 karakter olmalı.' });
  }
  try {
    const exists = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email.toLowerCase(), username]
    );
    if (exists.rows.length > 0) {
      return res.status(409).json({ message: 'E-posta veya kullanıcı adı zaten kullanılıyor.' });
    }
    const hash = await bcrypt.hash(password, 12);
    const userId = uuid();
    await pool.query(
      `INSERT INTO users (id, username, email, password_hash, avatar_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, username, email.toLowerCase(), hash, avatarId || 1]
    );

    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userRes.rows[0];


    // Günlük görevleri oluştur
    const { DailyTaskService } = await import('../services/DailyTaskService');
    await DailyTaskService.ensureTasksForToday(user.id);

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: (process.env.JWT_EXPIRES_IN ?? '30d') as any });
    res.status(201).json({ user: mapUser(user), token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'E-posta ve şifre gerekli.' });
  }
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'E-posta veya şifre hatalı.' });
    }
    // Streak ve Ödül Mantığı
    const today = new Date().toISOString().split('T')[0];
    let newStreak = user.streak_count || 0;
    let coinsToAdd = 0;

    if (user.last_login_date) {
      const lastLoginDate = new Date(user.last_login_date).toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastLoginDate === yesterdayStr) {
        newStreak += 1;
        coinsToAdd = 10 * Math.min(newStreak, 7); // Günlük bonus
      } else if (lastLoginDate !== today) {
        newStreak = 1;
        coinsToAdd = 10;
      }
    } else {
      newStreak = 1;
      coinsToAdd = 10;
    }

    await pool.query(
      'UPDATE users SET streak_count = $1, last_login_date = $2, last_login_at = CURRENT_TIMESTAMP, coins = coins + $3 WHERE id = $4',
      [newStreak, today, coinsToAdd, user.id]
    );
    
    // Güncel veriyi çek
    const updatedUserRes = await pool.query('SELECT * FROM users WHERE id = $1', [user.id]);
    const updatedUser = updatedUserRes.rows[0];

    // Günlük görevleri kontrol et/oluştur
    const { DailyTaskService } = await import('../services/DailyTaskService');
    await DailyTaskService.ensureTasksForToday(user.id);

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: (process.env.JWT_EXPIRES_IN ?? '30d') as any });
    res.json({ user: mapUser(updatedUser), token });

  } catch (err) {

    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

router.post('/forgot-password', authLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'E-posta gerekli.' });
  // TODO: Nodemailer ile sıfırlama e-postası
  res.json({ message: 'E-posta gönderildi (eğer hesap mevcutsa).' });
});

function mapUser(row: any) {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    avatarId: row.avatar_id,
    coins: row.coins,
    xp: row.xp,
    level: row.level,
    currentLeague: row.current_league,
    weeklyScore: row.weekly_score,
    isPremium: row.is_premium,
  };
}

export default router;
