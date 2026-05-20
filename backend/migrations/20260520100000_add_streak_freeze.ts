import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const has = await knex.schema.hasColumn('users', 'streak_freeze_date');
  if (!has) {
    await knex.raw(`ALTER TABLE users ADD COLUMN streak_freeze_date TEXT DEFAULT NULL`);
  }
}

export async function down(knex: Knex): Promise<void> {}
