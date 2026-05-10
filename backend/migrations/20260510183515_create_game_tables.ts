import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("game_results", (table) => {
    table.uuid("id").primary();

    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
    table.string("mode", 20).notNullable();
    table.integer("score").notNullable();
    table.integer("duration_seconds");
    table.integer("combo_max").defaultTo(1);
    table.boolean("is_personal_best").defaultTo(false);
    table.timestamp("played_at").defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("personal_bests", (table) => {
    table.uuid("id").primary();

    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
    table.string("mode", 20).notNullable();
    table.integer("score").notNullable();
    table.timestamp("achieved_at").defaultTo(knex.fn.now());
    table.unique(["user_id", "mode"]);
  });

  return;
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("personal_bests");
  await knex.schema.dropTable("game_results");
  return;
}
