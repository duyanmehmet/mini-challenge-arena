import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('iap_receipts', (t) => {
    t.increments('id').primary();
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('product_id').notNullable();
    t.string('transaction_id').unique().nullable();
    t.string('platform', 10).notNullable().defaultTo('unknown');
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('iap_receipts');
}
