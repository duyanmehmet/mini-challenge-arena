import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasColumn('users', 'season_xp'))) {
    await knex.schema.alterTable('users', (t) => {
      t.integer('season_xp').defaultTo(0);
    });
    // Mevcut kullanıcılar için season_xp = xp olarak başlat
    await knex('users').update({ season_xp: knex.ref('xp') });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (t) => {
    t.dropColumn('season_xp');
  });
}
