import { Model } from "objection";

export class User extends Model {
  static get tableName() {
    return "users";
  }

  id!: string;
  username!: string;
  email!: string;
  password_hash!: string;
  avatar_id!: number;
  coins!: number;
  xp!: number;
  level!: number;
  current_league!: string;
  weekly_score!: number;
  is_premium!: boolean;
  premium_expires_at?: string;
  last_login_at?: string;
  created_at!: string;
  updated_at!: string;

  static get jsonSchema() {
    return {
      type: "object",
      required: ["username", "email", "password_hash"],

      properties: {
        id: { type: "string" },
        username: { type: "string", minLength: 3, maxLength: 20 },
        email: { type: "string", format: "email" },
        password_hash: { type: "string" },
        avatar_id: { type: "integer" },
        coins: { type: "integer" },
        xp: { type: "integer" },
        level: { type: "integer" },
        current_league: { type: "string" },
      },
    };
  }
}
