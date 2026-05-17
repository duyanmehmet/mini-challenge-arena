import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasColumn('users', 'duel_rank'))) {
    await knex.schema.alterTable('users', t => {
      t.integer('duel_rank').defaultTo(0);
      t.integer('duel_wins').defaultTo(0);
      t.integer('duel_losses').defaultTo(0);
      t.integer('duel_streak').defaultTo(0);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', t => {
    t.dropColumn('duel_rank');
    t.dropColumn('duel_wins');
    t.dropColumn('duel_losses');
    t.dropColumn('duel_streak');
  });
}
