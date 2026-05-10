import knex from "knex";
import { Model } from "objection";
import knexConfig from "../knexfile";

const db = knex(knexConfig.development);

// Give the knex instance to objection.
Model.knex(db);

export default db;
