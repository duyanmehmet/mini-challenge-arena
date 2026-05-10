import { Request, Response } from "express";
import { User } from "../models/User";
import db from "../database";

export const submitResult = async (req: any, res: Response) => {
  const userId = req.userId; // Will be set by auth middleware
  const { mode, score, duration_seconds, combo_max } = req.body;

  try {
    const user = await User.query().findById(userId);
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    // Calculate XP and Coins (Simplified for now)
    const xpGained = 10 + (score > 100 ? 5 : 0);
    const coinsGained = Math.floor(score / 50);

    // Update user stats
    const updatedUser = await User.query().patchAndFetchById(userId, {
      xp: user.xp + xpGained,
      coins: user.coins + coinsGained,
      weekly_score: user.weekly_score + score,
    });

    // Check for level up (Simplified)
    // In a real app, calculateLevel would be more complex
    const newLevel = Math.floor(updatedUser.xp / 500) + 1;
    if (newLevel > updatedUser.level) {
      await User.query().patchAndFetchById(userId, { level: newLevel });
    }

    // Save game result
    await db("game_results").insert({
      user_id: userId,
      mode,
      score,
      duration_seconds,
      combo_max,
      played_at: new Date(),
    });

    // Update Personal Best
    const existingPB = await db("personal_bests")
      .where({ user_id: userId, mode })
      .first();

    let isPersonalBest = false;
    if (!existingPB || score > existingPB.score) {
      isPersonalBest = true;
      if (!existingPB) {
        await db("personal_bests").insert({ user_id: userId, mode, score });
      } else {
        await db("personal_bests").where({ id: existingPB.id }).update({ score, achieved_at: new Date() });
      }
    }

    res.json({
      is_personal_best: isPersonalBest,
      xp_gained: xpGained,
      coins_gained: coinsGained,
      new_level: newLevel,
      new_xp: updatedUser.xp,
      new_coins: updatedUser.coins,
    });
  } catch (error) {
    console.error("Submit result error:", error);
    res.status(500).json({ message: "Sonuç kaydedilemedi." });
  }
};
