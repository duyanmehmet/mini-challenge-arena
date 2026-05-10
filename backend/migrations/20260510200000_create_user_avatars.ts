import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("user_avatars", (table) => {
    table.uuid("id").primary();

    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
    table.integer("avatar_id").notNullable();
    table.timestamp("unlocked_at").defaultTo(knex.fn.now());
    table.unique(["user_id", "avatar_id"]);
  });

  // Her kullanıcıya varsayılan olarak ilk 3 avatarı ver (1, 2, 3)
  // Bu tetikleyici veya seed ile yapılabilir, şimdilik manuel kayıt rotada halledilecek.
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("user_avatars");
}
