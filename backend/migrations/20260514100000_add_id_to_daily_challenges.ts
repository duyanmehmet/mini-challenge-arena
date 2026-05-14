import type { Knex } from "knex";
import { v4 as uuidv4 } from "uuid";

export async function up(knex: Knex): Promise<void> {
  const hasId = await knex.schema.hasColumn("daily_challenges", "id");
  if (!hasId) {
    await knex.schema.alterTable("daily_challenges", (t) => {
      t.string("id", 36).nullable();
    });
    // Mevcut satırlara UUID ata
    const rows = await knex("daily_challenges").select("date");
    for (const row of rows) {
      await knex("daily_challenges").where("date", row.date).update({ id: uuidv4() });
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasId = await knex.schema.hasColumn("daily_challenges", "id");
  if (hasId) {
    await knex.schema.alterTable("daily_challenges", (t) => {
      t.dropColumn("id");
    });
  }
}
