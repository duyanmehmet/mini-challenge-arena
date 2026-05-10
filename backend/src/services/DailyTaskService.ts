import { pool } from '../db';

const TASK_POOL = [
  { type: 'score_reflex', desc: 'Refleks Modunda 500 puan kazan', target: 500, coins: 50, xp: 30 },
  { type: 'play_count', desc: 'Herhangi 3 challenge tamamla', target: 3, coins: 30, xp: 20 },
  { type: 'memory_round', desc: 'Hafıza\'da 3. tura ulaş', target: 3, coins: 80, xp: 50 },
  { type: 'score_football', desc: 'Futbol Modunda 300 puan kazan', target: 300, coins: 60, xp: 40 },
  { type: 'word_count', desc: 'Kelime Modunda 5 kelime bul', target: 5, coins: 70, xp: 45 },
];

export const DailyTaskService = {
  async ensureTasksForToday(userId: string) {
    const today = new Date().toISOString().slice(0, 10);
    
    const existing = await pool.query(
      'SELECT id FROM daily_tasks WHERE user_id = $1 AND date = $2',
      [userId, today]
    );

    if (existing.rows.length === 0) {
      // Generate 3 random tasks
      const shuffled = [...TASK_POOL].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 3);

      for (const task of selected) {
        await pool.query(
          `INSERT INTO daily_tasks (user_id, task_type, task_description, target_value, coin_reward, xp_reward, date)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [userId, task.type, task.desc, task.target, task.coins, task.xp, today]
        );
      }
    }
  },

  async updateTaskProgress(userId: string, type: string, increment: number) {
    const today = new Date().toISOString().slice(0, 10);

    const taskRes = await pool.query(
      `UPDATE daily_tasks 
       SET current_value = LEAST(current_value + $1, target_value)
       WHERE user_id = $2 AND task_type = $3 AND date = $4 AND is_completed = false
       RETURNING *`,
      [increment, userId, type, today]
    );

    if (taskRes.rows.length > 0) {
      const task = taskRes.rows[0];
      if (task.current_value >= task.target_value && !task.is_completed) {
        // Mark as completed and give rewards
        await pool.query(
          'UPDATE daily_tasks SET is_completed = true WHERE id = $1',
          [task.id]
        );
        
        await pool.query(
          'UPDATE users SET coins = coins + $1, xp = xp + $2 WHERE id = $3',
          [task.coin_reward, task.xp_reward, userId]
        );
        
        return { completed: true, reward: { coins: task.coin_reward, xp: task.xp_reward } };
      }
    }
    return { completed: false };
  }
};
