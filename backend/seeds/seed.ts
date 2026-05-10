import bcrypt from 'bcrypt';
import { pool } from '../src/db';

async function seed() {
  console.log('Seed başlıyor...');

  const hash = await bcrypt.hash('test1234', 12);

  await pool.query(`
    INSERT INTO users (username, email, password_hash, coins, xp, level, current_league, weekly_score)
    VALUES
      ('testoyuncu', 'test@mca.com', $1, 500, 1200, 5, 'silver', 3200),
      ('ahmet42', 'ahmet@test.com', $1, 200, 350, 3, 'bronze', 1100)
    ON CONFLICT (email) DO NOTHING;
  `, [hash]);

  console.log('Seed tamamlandı!');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed hatası:', err);
  process.exit(1);
});
