import bcrypt from "bcrypt";
import db from "../src/database";
import { v4 as uuidv4 } from "uuid";

async function seed() {
  console.log("Seed başlıyor...");
  const hash = await bcrypt.hash("test1234", 12);

  await db("users").insert([
    { id: uuidv4(), username: "testoyuncu", email: "test@mca.com", password_hash: hash, coins: 500, xp: 1200, level: 5, current_league: "silver", weekly_score: 3200 },
    { id: uuidv4(), username: "ahmet42",    email: "ahmet@test.com", password_hash: hash, coins: 200, xp: 350,  level: 3, current_league: "bronze", weekly_score: 1100 },
  ]).onConflict("email").ignore();

  console.log("Seed tamamlandı!");
  await db.destroy();
}

seed().catch((err) => { console.error("Seed hatası:", err); process.exit(1); });