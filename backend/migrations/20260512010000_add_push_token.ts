import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasColumn("users", "push_token"))) {
    await knex.schema.alterTable("users", (t) => {
      t.string("push_token").nullable();
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (t) => t.dropColumn("push_token"));
}