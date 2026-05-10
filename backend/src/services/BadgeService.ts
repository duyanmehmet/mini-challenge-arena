import { pool } from '../db';

export const BadgeService = {
  async checkAndUnlockBadges(userId: string, gameResult?: { mode: string; score: number }) {
    const unlockedBadges: string[] = [];

    // Get existing badges
    const existingRes = await pool.query('SELECT badge_id FROM user_badges WHERE user_id = $1', [userId]);
    const existingIds = existingRes.rows.map(r => r.badge_id);

    const checkAndAdd = async (id: string) => {
      if (!existingIds.includes(id)) {
        await pool.query(
          'INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [userId, id]
        );
        unlockedBadges.push(id);
      }
    };

    // 1. İlk Oyun Rozeti
    await checkAndAdd('first_game');

    // 2. Mod Bazlı Rozetler
    if (gameResult) {
      if (gameResult.mode === 'reflex' && gameResult.score >= 1000) {
        await checkAndAdd('reflex_master');
      }
      if (gameResult.mode === 'memory' && gameResult.score >= 10) {
        await checkAndAdd('memory_wizard');
      }
    }

    // 3. Seviye Bazlı Rozetler
    const userRes = await pool.query('SELECT level FROM users WHERE id = $1', [userId]);
    if (userRes.rows[0]?.level >= 10) {
      await checkAndAdd('level_10');
    }

    return unlockedBadges;
  }
};
