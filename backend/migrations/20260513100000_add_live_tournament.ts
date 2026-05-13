import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('live_tournaments', (t) => {
    t.increments('id').primary();
    t.string('category').notNullable();
    t.string('status').defaultTo('scheduled'); // scheduled | active | finished
    t.timestamp('scheduled_at').notNullable();
    t.integer('duration_seconds').defaultTo(300);
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('live_scores', (t) => {
    t.increments('id').primary();
    t.integer('tournament_id').references('id').inTable('live_tournaments').onDelete('CASCADE');
    t.string('user_id').notNullable();
    t.integer('score').defaultTo(0);
    t.integer('correct_answers').defaultTo(0);
    t.integer('total_questions').defaultTo(0);
    t.integer('duration_ms').defaultTo(0);
    t.timestamp('submitted_at').defaultTo(knex.fn.now());
    t.unique(['tournament_id', 'user_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('live_scores');
  await knex.schema.dropTableIfExists('live_tournaments');
}
