import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // user_badges
  if (!(await knex.schema.hasTable("user_badges"))) {
    await knex.schema.createTable("user_badges", (t) => {
      t.uuid("id").primary();
      t.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
      t.string("badge_id", 50).notNullable();
      t.timestamp("unlocked_at").defaultTo(knex.fn.now());
      t.unique(["user_id", "badge_id"]);
    });
  }

  // daily_tasks
  if (!(await knex.schema.hasTable("daily_tasks"))) {
    await knex.schema.createTable("daily_tasks", (t) => {
      t.uuid("id").primary();
      t.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
      t.string("task_type", 50).notNullable();
      t.text("task_description").notNullable();
      t.integer("target_value").notNullable();
      t.integer("current_value").defaultTo(0);
      t.integer("coin_reward").notNullable();
      t.integer("xp_reward").notNullable();
      t.boolean("is_completed").defaultTo(false);
      t.date("date").notNullable();
      t.unique(["user_id", "task_type", "date"]);
    });
  }

  // friendships
  if (!(await knex.schema.hasTable("friendships"))) {
    await knex.schema.createTable("friendships", (t) => {
      t.uuid("id").primary();
      t.uuid("requester_id").references("id").inTable("users").onDelete("CASCADE");
      t.uuid("receiver_id").references("id").inTable("users").onDelete("CASCADE");
      t.string("status", 20).defaultTo("pending");
      t.timestamp("created_at").defaultTo(knex.fn.now());
      t.unique(["requester_id", "receiver_id"]);
    });
  }

  // duels
  if (!(await knex.schema.hasTable("duels"))) {
    await knex.schema.createTable("duels", (t) => {
      t.uuid("id").primary();
      t.uuid("challenger_id").references("id").inTable("users");
      t.uuid("opponent_id").references("id").inTable("users");
      t.string("mode", 20).notNullable();
      t.integer("challenger_score");
      t.integer("opponent_score");
      t.string("status", 20).defaultTo("pending");
      t.timestamp("created_at").defaultTo(knex.fn.now());
      t.timestamp("completed_at");
    });
  }

  // weekly_leaderboard
  if (!(await knex.schema.hasTable("weekly_leaderboard"))) {
    await knex.schema.createTable("weekly_leaderboard", (t) => {
      t.uuid("id").primary();
      t.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
      t.date("week_start").notNullable();
      t.integer("total_score").defaultTo(0);
      t.string("league", 20).notNullable();
      t.integer("final_rank");
      t.unique(["user_id", "week_start"]);
    });
  }

  // user_avatars
  if (!(await knex.schema.hasTable("user_avatars"))) {
    await knex.schema.createTable("user_avatars", (t) => {
      t.uuid("id").primary();
      t.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
      t.integer("avatar_id").notNullable();
      t.timestamp("unlocked_at").defaultTo(knex.fn.now());
      t.unique(["user_id", "avatar_id"]);
    });
  }

  // streak columns
  if (!(await knex.schema.hasColumn("users", "streak_count"))) {
    await knex.schema.alterTable("users", (t) => {
      t.integer("streak_count").defaultTo(0);
      t.date("last_played_date");
      t.integer("max_streak").defaultTo(0);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("weekly_leaderboard");
  await knex.schema.dropTableIfExists("duels");
  await knex.schema.dropTableIfExists("daily_tasks");
  await knex.schema.dropTableIfExists("user_badges");
  await knex.schema.dropTableIfExists("friendships");
  await knex.schema.dropTableIfExists("user_avatars");
}