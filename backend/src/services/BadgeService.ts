import db from "../database";
import { v4 as uuidv4 } from "uuid";

interface GameResult { mode: string; score: number }

const CATEGORY_BADGES: Record<string, { badgeId: string; threshold: number }> = {
  history:   { badgeId: 'history_master',   threshold: 1000 },
  science:   { badgeId: 'science_master',   threshold: 1000 },
  geography: { badgeId: 'geography_master', threshold: 1000 },
  general:   { badgeId: 'general_master',   threshold: 1500 },
  turkey:    { badgeId: 'turkey_master',    threshold: 1000 },
  cinema:    { badgeId: 'cinema_master',    threshold: 1000 },
  sports:    { badgeId: 'sports_master',    threshold: 1000 },
  art:       { badgeId: 'art_master',       threshold: 1000 },
  medical:   { badgeId: 'medical_master',   threshold: 800  },
  economy:   { badgeId: 'economy_master',   threshold: 800  },
  license:   { badgeId: 'economy_master',   threshold: 800  }, // shared
};

export const BadgeService = {
  async checkAndUnlockBadges(userId: string, gameResult?: GameResult): Promise<string[]> {
    const unlocked: string[] = [];
    const existingIds = new Set<string>(
      (await db("user_badges").where("user_id", userId).pluck("badge_id")) as string[]
    );

    const grant = async (badgeId: string) => {
      if (existingIds.has(badgeId)) return;
      await db("user_badges")
        .insert({ id: uuidv4(), user_id: userId, badge_id: badgeId })
        .onConflict(["user_id", "badge_id"]).ignore();
      existingIds.add(badgeId);
      unlocked.push(badgeId);
    };

    // İlk oyun
    await grant("first_game");

    // Kategori bazlı puan rozetleri
    if (gameResult) {
      const catBadge = CATEGORY_BADGES[gameResult.mode];
      if (catBadge && gameResult.score >= catBadge.threshold) {
        await grant(catBadge.badgeId);
      }
    }

    // Kullanıcı istatistikleri
    const user = await db("users").where("id", userId).first();
    if (!user) return unlocked;

    if ((user.level ?? 1) >= 10)  await grant("level_10");
    if ((user.level ?? 1) >= 25)  await grant("level_25");
    if ((user.level ?? 1) >= 50)  await grant("level_50");

    const streak = user.streak_count ?? 0;
    if (streak >= 3)  await grant("streak_3");
    if (streak >= 7)  await grant("streak_7");
    if (streak >= 30) await grant("streak_30");

    // Tüm kategorileri oynama
    const playedModes = await db("game_results")
      .where("user_id", userId)
      .distinct("mode")
      .pluck("mode") as string[];
    const allCats = ["history","geography","science","general","art","cinema","sports","turkey","kids","license","medical","economy"];
    if (allCats.every((c) => playedModes.includes(c))) {
      await grant("all_categories");
    }

    // Klasik Tur tamamlama (en az bir kez "general" modunda 10 soru tam bitirme)
    const classicComplete = await db("game_results")
      .where({ user_id: userId, mode: "general" })
      .where("score", ">=", 200) // 10 soruyu bitirip iyi puan aldıysa
      .first();
    if (classicComplete) await grant("classic_complete");

    return unlocked;
  },
};
