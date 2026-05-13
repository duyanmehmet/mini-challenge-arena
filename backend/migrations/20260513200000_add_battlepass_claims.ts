import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('battlepass_claims', (t) => {
    t.increments('id').primary();
    t.string('user_id').notNullable();
    t.integer('tier').notNullable();
    t.timestamp('claimed_at').defaultTo(knex.fn.now());
    t.unique(['user_id', 'tier']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('battlepass_claims');
}
