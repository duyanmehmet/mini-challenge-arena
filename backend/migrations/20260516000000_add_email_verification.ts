import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('email_verifications', (t) => {
    t.string('id').primary();
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('code', 6).notNullable();
    t.timestamp('expires_at').notNullable();
    t.boolean('used').defaultTo(false);
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.table('users', (t) => {
    t.boolean('email_verified').defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('email_verifications');
  await knex.schema.table('users', (t) => {
    t.dropColumn('email_verified');
  });
}
