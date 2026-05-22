import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('users', async (t) => {
    const has = (col: string) => knex.schema.hasColumn('users', col);

    if (!await has('last_played_date'))   t.date('last_played_date');
    if (!await has('max_streak'))         t.integer('max_streak').defaultTo(0);
    if (!await has('streak_freeze_date')) t.date('streak_freeze_date');
    if (!await has('push_token'))         t.string('push_token', 300);
    if (!await has('reset_token'))        t.string('reset_token', 100);
    if (!await has('reset_token_expires'))t.timestamp('reset_token_expires');
    if (!await has('season_xp'))          t.integer('season_xp').defaultTo(0);
    if (!await has('weekly_score'))       t.integer('weekly_score').defaultTo(0);
    if (!await has('clan_id'))            t.string('clan_id');
    if (!await has('duel_rank'))          t.integer('duel_rank').defaultTo(1000);
    if (!await has('email_verified'))     t.boolean('email_verified').defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('users', (t) => {
    t.dropColumns(
      'last_played_date','max_streak','streak_freeze_date',
      'push_token','reset_token','reset_token_expires',
      'season_xp','weekly_score','clan_id','duel_rank','email_verified'
    );
  });
}
