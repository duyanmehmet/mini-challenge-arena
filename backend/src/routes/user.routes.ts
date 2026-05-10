import { Router } from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db';

import { authMiddleware, type AuthRequest } from '../middleware/auth.middleware';

const router = Router();

router.get('/profile', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email, avatar_id, coins, xp, level, current_league, weekly_score, is_premium
       FROM users WHERE id = $1`,
      [req.userId]
    );
    const userId = req.userId;
    const u = result.rows[0];

    // Rozetleri, rekorları ve kilidi açılmış avatarları çek
    const badges = await pool.query('SELECT badge_id FROM user_badges WHERE user_id = $1', [userId]);
    const pbs = await pool.query('SELECT mode, score, achieved_at FROM personal_bests WHERE user_id = $1', [userId]);
    const avs = await pool.query('SELECT avatar_id FROM user_avatars WHERE user_id = $1', [userId]);

    const unlockedAvatars = Array.from(new Set([1, 2, 3, ...avs.rows.map(a => a.avatar_id)]));

    res.json({
      user: {
        id: u.id, username: u.username, email: u.email,
        avatarId: u.avatar_id, coins: u.coins, xp: u.xp,
        level: u.level, currentLeague: u.current_league,
        weeklyScore: u.weekly_score, isPremium: u.is_premium,
      },
      badges: badges.rows.map(b => b.badge_id),
      personalBests: pbs.rows.map(p => ({ mode: p.mode, score: p.score, achievedAt: p.achieved_at })),
      unlockedAvatars
    });

  } catch {
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

router.patch('/profile', authMiddleware, async (req: AuthRequest, res) => {
  const { username, avatar_id } = req.body;
  const updates: string[] = [];
  const params: any[] = [];

  if (username) {
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ message: 'Kullanıcı adı 3-20 karakter olmalı.' });
    }
    params.push(username);
    updates.push(`username = $${params.length}`);
  }
  if (avatar_id !== undefined) {
    params.push(avatar_id);
    updates.push(`avatar_id = $${params.length}`);
  }
  if (updates.length === 0) return res.status(400).json({ message: 'Güncellenecek alan yok.' });

  params.push(req.userId);
  try {
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = $${params.length}`, params);
    res.json({ message: 'Profil güncellendi.' });
  } catch {
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

router.get('/daily-tasks', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { DailyTaskService } = await import('../services/DailyTaskService');
    await DailyTaskService.ensureTasksForToday(req.userId!);

    const result = await pool.query(
      `SELECT task_type, task_description as description, current_value, target_value,
              coin_reward, xp_reward, is_completed
       FROM daily_tasks WHERE user_id = $1 AND date = CURRENT_DATE`,
      [req.userId]
    );
    res.json(result.rows.map((r) => ({
      taskType: r.task_type,
      description: r.description,
      currentValue: r.current_value,
      targetValue: r.target_value,
      coinReward: r.coin_reward,
      xpReward: r.xp_reward,
      isCompleted: r.is_completed,
    })));
  } catch {
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

router.post('/change-password', authMiddleware, async (req: AuthRequest, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.userId]);
    const valid = await bcrypt.compare(oldPassword, user.rows[0].password_hash);
    if (!valid) return res.status(400).json({ message: 'Eski şifre yanlış.' });

    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.userId]);
    res.json({ message: 'Şifre güncellendi.' });
  } catch {
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

export default router;

