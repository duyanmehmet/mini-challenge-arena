import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table("users", (table) => {
    table.integer("streak_count").defaultTo(0);
    table.date("last_login_date");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table("users", (table) => {
    table.dropColumn("streak_count");
    table.dropColumn("last_login_date");
  });
}
