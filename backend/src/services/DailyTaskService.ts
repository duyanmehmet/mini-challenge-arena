import db from "../database";
import { v4 as uuidv4 } from "uuid";

const TASK_POOL = [
  // Oynama görevleri
  { type: "play_count",      desc: "Herhangi bir kategoride 3 oyun oyna",      target: 3,   coins: 30, xp: 20 },
  { type: "play_count",      desc: "Herhangi bir kategoride 5 oyun oyna",      target: 5,   coins: 50, xp: 35 },
  // Puan görevleri
  { type: "score_any",       desc: "Tek oyunda 500 puan kazan",                target: 500, coins: 40, xp: 25 },
  { type: "score_any",       desc: "Tek oyunda 1000 puan kazan",               target: 1000,coins: 70, xp: 45 },
  { type: "score_any",       desc: "Tek oyunda 2000 puan kazan",               target: 2000,coins: 100,xp: 65 },
  // Kategori bazlı
  { type: "score_history",   desc: "Tarih kategorisinde 500 puan kazan",       target: 500, coins: 50, xp: 30 },
  { type: "score_science",   desc: "Bilim kategorisinde 500 puan kazan",       target: 500, coins: 50, xp: 30 },
  { type: "score_geography", desc: "Coğrafya kategorisinde 500 puan kazan",    target: 500, coins: 50, xp: 30 },
  { type: "score_general",   desc: "Genel Kültür kategorisinde 800 puan kazan",target: 800, coins: 60, xp: 40 },
  { type: "score_turkey",    desc: "Türkiye kategorisinde 600 puan kazan",     target: 600, coins: 55, xp: 35 },
  { type: "score_sports",    desc: "Spor kategorisinde 500 puan kazan",        target: 500, coins: 50, xp: 30 },
  { type: "score_cinema",    desc: "Sinema & TV kategorisinde 500 puan kazan", target: 500, coins: 50, xp: 30 },
  { type: "score_art",       desc: "Sanat kategorisinde 500 puan kazan",       target: 500, coins: 50, xp: 30 },
  { type: "score_medical",   desc: "Tıbbi Terimler kategorisinde 400 puan kazan",target:400,coins: 60, xp: 40 },
  { type: "score_economy",   desc: "Ekonomi kategorisinde 400 puan kazan",     target: 400, coins: 60, xp: 40 },
  { type: "score_license",   desc: "Ehliyet Sınavı kategorisinde 400 puan kazan",target:400,coins: 60, xp: 40 },
  { type: "score_kids",      desc: "Çocuklar için kategorisinde 300 puan kazan",target:300, coins: 40, xp: 25 },
];

export const DailyTaskService = {
  async ensureTasksForToday(userId: string) {
    const today = new Date().toISOString().slice(0, 10);
    const existing = await db("daily_tasks")
      .where({ user_id: userId, date: today })
      .count("id as cnt")
      .first();
    if ((existing as any)?.cnt > 0) return;

    // Her gün 3 farklı görev — rastgele seç
    const selected = [...TASK_POOL].sort(() => Math.random() - 0.5).slice(0, 3);
    await db("daily_tasks").insert(
      selected.map((t) => ({
        id: uuidv4(),
        user_id: userId,
        task_type: t.type,
        task_description: t.desc,
        target_value: t.target,
        current_value: 0,
        coin_reward: t.coins,
        xp_reward: t.xp,
        date: today,
        is_completed: false,
      }))
    );
  },

  async updateTaskProgress(userId: string, type: string, increment: number) {
    const today = new Date().toISOString().slice(0, 10);

    // "score_any" güncellemesi — tüm puan görevlerini güncelle
    if (type === "score_any") {
      const tasks = await db("daily_tasks")
        .where({ user_id: userId, date: today, is_completed: false })
        .whereIn("task_type", ["score_any", "play_count"]);
      for (const task of tasks) {
        const newVal = Math.min(task.current_value + increment, task.target_value);
        await db("daily_tasks").where("id", task.id).update({ current_value: newVal });
        if (newVal >= task.target_value) {
          await this._completeTask(userId, task);
        }
      }
      return;
    }

    // Kategori bazlı skor görevi
    const task = await db("daily_tasks")
      .where({ user_id: userId, task_type: type, date: today, is_completed: false })
      .first();
    if (!task) return;

    const newValue = Math.min(task.current_value + increment, task.target_value);
    await db("daily_tasks").where("id", task.id).update({ current_value: newValue });
    if (newValue >= task.target_value) {
      await this._completeTask(userId, task);
    }

    return { completed: newValue >= task.target_value };
  },

  async _completeTask(userId: string, task: any) {
    await db("daily_tasks").where("id", task.id).update({ is_completed: true });
    await db("users").where("id", userId).update({
      coins: db.raw("coins + ?", [task.coin_reward]),
      xp:    db.raw("xp + ?",    [task.xp_reward ?? 0]),
    });
  },
};
