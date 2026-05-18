import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Clans tablosuna yeni kolonlar
  await knex.schema.table('clans', (table) => {
    table.string('type', 10).defaultTo('open');        // open | approved | private
    table.string('join_code', 8).nullable();            // Özel klan kodu
    table.string('league', 10).defaultTo('bronze');     // bronze | silver | gold | diamond
    table.integer('max_members').defaultTo(30);
    table.integer('level_req').defaultTo(5);
    table.integer('coin_req').defaultTo(5000);
    table.integer('total_members').defaultTo(1);
  });

  // Kullanıcılara klan rolü ekle
  await knex.schema.table('users', (table) => {
    table.string('clan_role', 10).defaultTo('member'); // leader | assistant | member
  });

  // Katılma istekleri tablosu (onaylı klanlar için)
  await knex.schema.createTableIfNotExists('clan_join_requests', (table) => {
    table.uuid('id').primary();
    table.uuid('clan_id').notNullable();
    table.uuid('user_id').notNullable();
    table.string('username', 30);
    table.string('status', 10).defaultTo('pending'); // pending | approved | rejected
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.unique(['clan_id', 'user_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('clan_join_requests');
  await knex.schema.table('users', (t) => { t.dropColumn('clan_role'); });
  await knex.schema.table('clans', (t) => {
    t.dropColumn('type');
    t.dropColumn('join_code');
    t.dropColumn('league');
    t.dropColumn('max_members');
    t.dropColumn('level_req');
    t.dropColumn('coin_req');
    t.dropColumn('total_members');
  });
}
