import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("users", (table) => {
    table.uuid("id").primary();

    table.string("username", 20).unique().notNullable();
    table.string("email", 255).unique().notNullable();
    table.string("password_hash", 255).notNullable();
    table.integer("avatar_id").defaultTo(1);
    table.integer("coins").defaultTo(100);
    table.integer("xp").defaultTo(0);
    table.integer("level").defaultTo(1);
    table.string("current_league", 20).defaultTo("bronze");
    table.integer("weekly_score").defaultTo(0);
    table.boolean("is_premium").defaultTo(false);
    table.timestamp("premium_expires_at");
    table.timestamp("last_login_at");
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("users");
}
