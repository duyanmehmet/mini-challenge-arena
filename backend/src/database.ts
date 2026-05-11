import knex from "knex";
import { Model } from "objection";
import knexConfig from "../knexfile";

const env = (process.env.NODE_ENV as keyof typeof knexConfig) ?? "development";
const db = knex(knexConfig[env] ?? knexConfig.development);

Model.knex(db);

export default db;