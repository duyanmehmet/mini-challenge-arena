import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('users', async (t) => {
    if (!await knex.schema.hasColumn('users', 'lig_lives'))
      t.integer('lig_lives').defaultTo(5);
    if (!await knex.schema.hasColumn('users', 'lig_lives_at'))
      t.string('lig_lives_at').defaultTo('2026-01-01T00:00:00.000Z');
    if (!await knex.schema.hasColumn('users', 'streak_freeze_date'))
      t.date('streak_freeze_date');
  });
}

export async function down(knex: Knex): Promise<void> {}
