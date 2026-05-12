import db from "../database";
import { v4 as uuidv4 } from "uuid";

const CURRENT_SEASON = 1;

const FREE_TIERS = [
  { tier: 1,  xp: 100,  reward: "50 coin"    },
  { tier: 2,  xp: 200,  reward: "Badge: Başlangıç" },
  { tier: 3,  xp: 350,  reward: "100 coin"   },
  { tier: 5,  xp: 600,  reward: "200 coin"   },
  { tier: 10, xp: 1200, reward: "Badge: Usta" },
  { tier: 20, xp: 3000, reward: "500 coin + Özel Avatar" },
  { tier: 30, xp: 7000, reward: "Badge: Efsane + 1000 coin" },
];

export const BattlePassService = {
  async getOrCreate(userId: string) {
    let pass = await db("battle_pass").where({ user_id: userId, season: CURRENT_SEASON }).first();
    if (!pass) {
      await db("battle_pass").insert({ id: uuidv4(), user_id: userId, season: CURRENT_SEASON, xp: 0, tier: 0 });
      pass = await db("battle_pass").where({ user_id: userId, season: CURRENT_SEASON }).first();
    }
    return { ...pass, tiers: FREE_TIERS, currentSeason: CURRENT_SEASON };
  },

  async addXP(userId: string, amount: number) {
    const pass = await BattlePassService.getOrCreate(userId);
    const newXP = (pass.xp ?? 0) + amount;
    const newTier = FREE_TIERS.filter((t) => newXP >= t.xp).length;
    const unlockedTiers = [];

    for (const tier of FREE_TIERS) {
      if (tier.tier > pass.tier && tier.tier <= newTier) {
        unlockedTiers.push(tier);
      }
    }

    await db("battle_pass").where({ user_id: userId, season: CURRENT_SEASON }).update({ xp: newXP, tier: newTier });
    return { newXP, newTier, unlockedTiers };
  },
};