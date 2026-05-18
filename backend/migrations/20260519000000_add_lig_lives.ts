import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    table.integer("lig_lives").defaultTo(3);
    table.string("lig_lives_at").defaultTo("2026-01-01T00:00:00.000Z");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("lig_lives");
    table.dropColumn("lig_lives_at");
  });
}
