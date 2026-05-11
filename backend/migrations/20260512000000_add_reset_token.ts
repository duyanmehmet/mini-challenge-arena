import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasColumn("users", "reset_token"))) {
    await knex.schema.alterTable("users", (t) => {
      t.string("reset_token", 36).nullable();
      t.timestamp("reset_token_expires").nullable();
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (t) => {
    t.dropColumn("reset_token");
    t.dropColumn("reset_token_expires");
  });
}