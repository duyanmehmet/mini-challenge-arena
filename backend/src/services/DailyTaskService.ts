import db from "../database";
import { v4 as uuidv4 } from "uuid";

const TASK_POOL = [
  { type: "score_reflex",   desc: "Refleks Modunda 500 puan kazan",  target: 500, coins: 50, xp: 30 },
  { type: "play_count",     desc: "Herhangi 3 challenge tamamla",    target: 3,   coins: 30, xp: 20 },
  { type: "memory_round",   desc: "Hafizada 3. tura ulas",          target: 3,   coins: 80, xp: 50 },
  { type: "score_football", desc: "Futbol Modunda 300 puan kazan",  target: 300, coins: 60, xp: 40 },
  { type: "word_count",     desc: "Kelime Modunda 5 kelime bul",    target: 5,   coins: 70, xp: 45 },
  { type: "score_attention",desc: "Dikkat Oyununda 3. tura ulas",   target: 3,   coins: 90, xp: 55 },
];

export const DailyTaskService = {
  async ensureTasksForToday(userId: string) {
    const today = new Date().toISOString().slice(0, 10);
    const existing = await db("daily_tasks").where({ user_id: userId, date: today }).first();
    if (!existing) {
      const selected = [...TASK_POOL].sort(() => Math.random() - 0.5).slice(0, 3);
      await db("daily_tasks").insert(
        selected.map((t) => ({
          id: uuidv4(), user_id: userId, task_type: t.type,
          task_description: t.desc, target_value: t.target,
          coin_reward: t.coins, xp_reward: t.xp, date: today,
        }))
      );
    }
  },

  async updateTaskProgress(userId: string, type: string, increment: number) {
    const today = new Date().toISOString().slice(0, 10);
    const task = await db("daily_tasks")
      .where({ user_id: userId, task_type: type, date: today, is_completed: false })
      .first();

    if (!task) return { completed: false };

    const newValue = Math.min(task.current_value + increment, task.target_value);
    await db("daily_tasks").where("id", task.id).update({ current_value: newValue });

    if (newValue >= task.target_value) {
      await db("daily_tasks").where("id", task.id).update({ is_completed: true });
      await db("users").where("id", userId).update({
        coins: db.raw("coins + ?", [task.coin_reward]),
        xp:    db.raw("xp + ?",    [task.xp_reward]),
      });
      return { completed: true, reward: { coins: task.coin_reward, xp: task.xp_reward } };
    }
    return { completed: false };
  },
};