import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable("messages"))) {
    await knex.schema.createTable("messages", (t) => {
      t.uuid("id").primary();
      t.uuid("sender_id").references("id").inTable("users").onDelete("CASCADE");
      t.uuid("receiver_id").references("id").inTable("users").onDelete("CASCADE");
      t.text("content").notNullable();
      t.boolean("is_read").defaultTo(false);
      t.timestamp("created_at").defaultTo(knex.fn.now());
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("messages");
}
