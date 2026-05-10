import { pool } from '../db';

const LEAGUES = ['bronze', 'silver', 'gold', 'diamond', 'legend'];
const PROMOTE_THRESHOLD = 0.25;
const RELEGATE_THRESHOLD = 0.25;

export class LeagueResetService {
  static async processWeeklyReset(): Promise<void> {
    console.log('[LeagueReset] Haftalık işlemler başlıyor...');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const league of LEAGUES) {
        const players = await client.query(
          `SELECT id, weekly_score FROM users WHERE current_league = $1 ORDER BY weekly_score DESC`,
          [league]
        );
        const total = players.rows.length;
        if (total < 4) {
          // Az oyuncu: sadece sıfırla
          await client.query(`UPDATE users SET weekly_score = 0 WHERE current_league = $1`, [league]);
          continue;
        }

        const promoteCount = Math.ceil(total * PROMOTE_THRESHOLD);
        const relegateCount = Math.ceil(total * RELEGATE_THRESHOLD);
        const leagueIdx = LEAGUES.indexOf(league);

        for (let i = 0; i < total; i++) {
          const player = players.rows[i];
          let newLeague = league;

          if (i < promoteCount && leagueIdx < LEAGUES.length - 1) {
            newLeague = LEAGUES[leagueIdx + 1];
          } else if (i >= total - relegateCount && leagueIdx > 0) {
            newLeague = LEAGUES[leagueIdx - 1];
          }

          await client.query(
            `INSERT INTO weekly_leaderboard (user_id, week_start, total_score, league, final_rank)
             VALUES ($1, DATE_TRUNC('week', NOW() - INTERVAL '1 day')::date, $2, $3, $4)
             ON CONFLICT (user_id, week_start) DO UPDATE SET total_score = $2, final_rank = $4`,
            [player.id, player.weekly_score, league, i + 1]
          );

          await client.query(
            `UPDATE users SET current_league = $1, weekly_score = 0 WHERE id = $2`,
            [newLeague, player.id]
          );
        }
      }

      await client.query('COMMIT');
      console.log('[LeagueReset] Tamamlandı.');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[LeagueReset] Hata:', err);
      throw err;
    } finally {
      client.release();
    }
  }
}
