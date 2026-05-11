import type { Knex } from "knex";
import dotenv from "dotenv";
dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "sqlite3",
    connection: { filename: "./mca.sqlite" },
    useNullAsDefault: true,
    migrations: { directory: "./migrations" },
    seeds: { directory: "./seeds" },
  },
  production: {
    client: "pg",
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // Railway/Render için
    },
    pool: { min: 2, max: 10 },
    migrations: { directory: "./migrations" },
    seeds: { directory: "./seeds" },
  },
};

export default config;