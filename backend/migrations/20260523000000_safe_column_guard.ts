import type { Knex } from 'knex';

// Önceki fix_missing_user_columns ve fix_lig_columns migrasyonlarında
// knex.schema.table() içinde await kullanılıyordu — bu yanlış; callback
// senkron çalıştığı için hasColumn sonuçları beklenmez ve sütunlar eklenmeyebilir.
// Bu migrasyon PostgreSQL'in IF NOT EXISTS desteğiyle tüm sütunları güvenli ekler.

const COLUMNS: [string, string][] = [
  ['last_played_date',      'DATE'],
  ['max_streak',            'INTEGER DEFAULT 0'],
  ['push_token',            'VARCHAR(300)'],
  ['reset_token',           'VARCHAR(100)'],
  ['reset_token_expires',   'TIMESTAMP'],
  ['season_xp',             'INTEGER DEFAULT 0'],
  ['clan_id',               'TEXT'],
  ['duel_rank',             'INTEGER DEFAULT 1000'],
  ['email_verified',        'BOOLEAN DEFAULT false'],
  ['streak_freeze_date',    'DATE'],
  ['lig_lives',             'INTEGER DEFAULT 5'],
  ['lig_lives_at',          "TEXT DEFAULT '2026-01-01T00:00:00.000Z'"],
  ['current_league',        "VARCHAR(20) DEFAULT 'filiz'"],
  ['weekly_score',          'INTEGER DEFAULT 0'],
];

export async function up(knex: Knex): Promise<void> {
  for (const [col, type] of COLUMNS) {
    await knex.raw(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${col} ${type}`);
  }
}

export async function down(_knex: Knex): Promise<void> {}
