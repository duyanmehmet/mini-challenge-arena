import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('arena_scores', (t) => {
    t.string('id').primary();
    t.string('arena_id').notNullable();
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.integer('score').defaultTo(0);
    t.integer('correct_answers').defaultTo(0);
    t.integer('total_questions').defaultTo(10);
    t.integer('duration_ms').defaultTo(0);
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.unique(['arena_id', 'user_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('arena_scores');
}
