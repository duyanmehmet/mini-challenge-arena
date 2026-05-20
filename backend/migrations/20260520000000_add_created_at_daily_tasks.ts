import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasCol = await knex.schema.hasColumn('daily_tasks', 'created_at');
  if (!hasCol) {
    await knex.raw(`ALTER TABLE daily_tasks ADD COLUMN created_at TEXT DEFAULT '2026-01-01 00:00:00'`);
  }
}

export async function down(knex: Knex): Promise<void> {
  // SQLite doesn't support DROP COLUMN — leave as is
}
