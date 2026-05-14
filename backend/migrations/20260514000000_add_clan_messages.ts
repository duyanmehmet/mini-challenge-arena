import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable("clan_messages"))) {
    await knex.schema.createTable("clan_messages", (t) => {
      t.uuid("id").primary();
      t.uuid("clan_id").references("id").inTable("clans").onDelete("CASCADE").notNullable();
      t.uuid("user_id").references("id").inTable("users").onDelete("CASCADE").notNullable();
      t.string("username", 30).notNullable();
      t.text("message").notNullable();
      t.timestamp("created_at").defaultTo(knex.fn.now());
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("clan_messages");
}
