import type { Knex } from "knex";
export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable("daily_challenges"))) {
    await knex.schema.createTable("daily_challenges", (t) => {
      t.string("date").primary(); // YYYY-MM-DD
      t.string("mode").notNullable();
      t.integer("seed").notNullable();
      t.integer("target_score").notNullable();
      t.string("special_rule").nullable();
    });
  }
  if (!(await knex.schema.hasTable("daily_challenge_scores"))) {
    await knex.schema.createTable("daily_challenge_scores", (t) => {
      t.uuid("id").primary();
      t.string("date").notNullable();
      t.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
      t.integer("score").notNullable();
      t.timestamp("submitted_at").defaultTo(knex.fn.now());
      t.unique(["date", "user_id"]);
    });
  }
  if (!(await knex.schema.hasTable("battle_pass"))) {
    await knex.schema.createTable("battle_pass", (t) => {
      t.uuid("id").primary();
      t.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
      t.integer("season").notNullable().defaultTo(1);
      t.integer("xp").notNullable().defaultTo(0);
      t.integer("tier").notNullable().defaultTo(0);
      t.boolean("is_premium").defaultTo(false);
      t.unique(["user_id", "season"]);
    });
  }
  if (!(await knex.schema.hasTable("clans"))) {
    await knex.schema.createTable("clans", (t) => {
      t.uuid("id").primary();
      t.string("name", 30).unique().notNullable();
      t.string("tag", 6).unique().notNullable();
      t.string("description", 200).nullable();
      t.uuid("leader_id").references("id").inTable("users");
      t.integer("weekly_score").defaultTo(0);
      t.timestamp("created_at").defaultTo(knex.fn.now());
    });
  }
  if (!(await knex.schema.hasColumn("users", "clan_id"))) {
    await knex.schema.alterTable("users", (t) => {
      t.uuid("clan_id").nullable();
    });
  }
}
export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("daily_challenge_scores");
  await knex.schema.dropTableIfExists("daily_challenges");
  await knex.schema.dropTableIfExists("battle_pass");
  await knex.schema.dropTableIfExists("clans");
}