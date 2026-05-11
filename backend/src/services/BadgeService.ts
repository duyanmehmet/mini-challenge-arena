import db from "../database";
import { v4 as uuidv4 } from "uuid";

export const BadgeService = {
  async checkAndUnlockBadges(userId: string, gameResult?: { mode: string; score: number }) {
    const unlockedBadges: string[] = [];

    const existing = await db("user_badges").where("user_id", userId).pluck("badge_id");
    const existingIds = existing as string[];

    const checkAndAdd = async (id: string) => {
      if (!existingIds.includes(id)) {
        await db("user_badges")
          .insert({ id: uuidv4(), user_id: userId, badge_id: id })
          .onConflict(["user_id", "badge_id"]).ignore();
        unlockedBadges.push(id);
      }
    };

    await checkAndAdd("first_game");

    if (gameResult) {
      if (gameResult.mode === "reflex"   && gameResult.score >= 1000) await checkAndAdd("reflex_master");
      if (gameResult.mode === "memory"   && gameResult.score >= 500)  await checkAndAdd("memory_wizard");
      if (gameResult.mode === "football" && gameResult.score >= 800)  await checkAndAdd("scorer");
      if (gameResult.mode === "word"     && gameResult.score >= 100)  await checkAndAdd("word_master");
      if (gameResult.mode === "escape"   && gameResult.score >= 60)   await checkAndAdd("runner");
    }

    const user = await db("users").where("id", userId).select("level", "streak_count").first();
    if (user?.level >= 10)           await checkAndAdd("level_10");
    if ((user?.streak_count ?? 0) >= 3) await checkAndAdd("streak_3");

    return unlockedBadges;
  },
};