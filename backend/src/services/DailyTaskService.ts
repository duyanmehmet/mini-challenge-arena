import db from "../database";
import { v4 as uuidv4 } from "uuid";

const TASK_POOL = [
  // ── Oynama görevleri ──────────────────────────────────────────────
  { type: "play_count", desc: "Herhangi bir kategoride 2 oyun oyna",       target: 2,    coins: 20,  xp: 15 },
  { type: "play_count", desc: "Herhangi bir kategoride 4 oyun oyna",       target: 4,    coins: 40,  xp: 25 },
  { type: "play_count", desc: "Herhangi bir kategoride 6 oyun oyna",       target: 6,    coins: 60,  xp: 40 },
  { type: "play_count", desc: "Herhangi bir kategoride 10 oyun oyna",      target: 10,   coins: 100, xp: 70 },

  // ── Puan görevleri ────────────────────────────────────────────────
  { type: "score_any",  desc: "Tek oyunda 300 puan kazan",                 target: 300,  coins: 25,  xp: 15 },
  { type: "score_any",  desc: "Tek oyunda 700 puan kazan",                 target: 700,  coins: 50,  xp: 30 },
  { type: "score_any",  desc: "Tek oyunda 1200 puan kazan",                target: 1200, coins: 80,  xp: 50 },
  { type: "score_any",  desc: "Tek oyunda 2000 puan kazan",                target: 2000, coins: 120, xp: 80 },
  { type: "score_any",  desc: "Tek oyunda 3000 puan kazan",                target: 3000, coins: 180, xp: 110 },

  // ── Kategori görevleri ────────────────────────────────────────────
  { type: "score_history",   desc: "Tarih kategorisinde 500 puan kazan",          target: 500,  coins: 50, xp: 30 },
  { type: "score_history",   desc: "Tarih kategorisinde 1000 puan kazan",         target: 1000, coins: 80, xp: 55 },
  { type: "score_science",   desc: "Bilim kategorisinde 500 puan kazan",          target: 500,  coins: 50, xp: 30 },
  { type: "score_science",   desc: "Bilim kategorisinde 1000 puan kazan",         target: 1000, coins: 80, xp: 55 },
  { type: "score_geography", desc: "Coğrafya kategorisinde 500 puan kazan",       target: 500,  coins: 50, xp: 30 },
  { type: "score_geography", desc: "Coğrafya kategorisinde 1200 puan kazan",      target: 1200, coins: 90, xp: 60 },
  { type: "score_general",   desc: "Genel Kültür'de 800 puan kazan",             target: 800,  coins: 60, xp: 40 },
  { type: "score_general",   desc: "Genel Kültür'de 1500 puan kazan",            target: 1500, coins: 100, xp: 65 },
  { type: "score_turkey",    desc: "Türkiye kategorisinde 600 puan kazan",        target: 600,  coins: 55, xp: 35 },
  { type: "score_turkey",    desc: "Türkiye kategorisinde 1200 puan kazan",       target: 1200, coins: 90, xp: 60 },
  { type: "score_sports",    desc: "Spor kategorisinde 500 puan kazan",           target: 500,  coins: 50, xp: 30 },
  { type: "score_sports",    desc: "Spor kategorisinde 1000 puan kazan",          target: 1000, coins: 75, xp: 50 },
  { type: "score_cinema",    desc: "Sinema & TV kategorisinde 500 puan kazan",    target: 500,  coins: 50, xp: 30 },
  { type: "score_cinema",    desc: "Sinema & TV kategorisinde 1000 puan kazan",   target: 1000, coins: 75, xp: 50 },
  { type: "score_art",       desc: "Sanat kategorisinde 500 puan kazan",          target: 500,  coins: 50, xp: 30 },
  { type: "score_art",       desc: "Sanat kategorisinde 1000 puan kazan",         target: 1000, coins: 75, xp: 50 },
  { type: "score_medical",   desc: "Tıbbi Terimler kategorisinde 400 puan kazan", target: 400,  coins: 60, xp: 40 },
  { type: "score_medical",   desc: "Tıbbi Terimler kategorisinde 800 puan kazan", target: 800,  coins: 90, xp: 60 },
  { type: "score_economy",   desc: "Ekonomi kategorisinde 400 puan kazan",        target: 400,  coins: 60, xp: 40 },
  { type: "score_economy",   desc: "Ekonomi kategorisinde 900 puan kazan",        target: 900,  coins: 90, xp: 60 },
  { type: "score_license",   desc: "Ehliyet Sınavı kategorisinde 400 puan kazan", target: 400,  coins: 60, xp: 40 },
  { type: "score_license",   desc: "Ehliyet Sınavı kategorisinde 900 puan kazan", target: 900,  coins: 90, xp: 60 },
  { type: "score_kids",      desc: "Çocuklar kategorisinde 300 puan kazan",       target: 300,  coins: 40, xp: 25 },
  { type: "score_kids",      desc: "Çocuklar kategorisinde 700 puan kazan",       target: 700,  coins: 60, xp: 40 },
  { type: "score_arabic",    desc: "Arapça kategorisinde 300 puan kazan",         target: 300,  coins: 55, xp: 35 },
  { type: "score_french",    desc: "Fransızca kategorisinde 300 puan kazan",      target: 300,  coins: 55, xp: 35 },
  { type: "score_german",    desc: "Almanca kategorisinde 300 puan kazan",        target: 300,  coins: 55, xp: 35 },
  { type: "score_spanish",   desc: "İspanyolca kategorisinde 300 puan kazan",     target: 300,  coins: 55, xp: 35 },
];

// Her gün farklı görev için tarihe göre seed
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const DailyTaskService = {
  async ensureTasksForToday(userId: string) {
    const today = new Date().toISOString().slice(0, 10);
    const existing = await db("daily_tasks")
      .where({ user_id: userId, date: today })
      .count("id as cnt")
      .first();
    if ((existing as any)?.cnt > 0) return;

    // Tarihe + userId'ye göre deterministik ama her gün farklı 5 görev
    const dateSeed = parseInt(today.replace(/-/g, '')) + userId.charCodeAt(0);
    const selected = seededShuffle(TASK_POOL, dateSeed).slice(0, 5);

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

    if (type === "play_count") {
      const tasks = await db("daily_tasks")
        .where({ user_id: userId, date: today, is_completed: false, task_type: "play_count" });
      for (const task of tasks) {
        const newVal = Math.min(task.current_value + 1, task.target_value);
        await db("daily_tasks").where("id", task.id).update({ current_value: newVal });
        if (newVal >= task.target_value) await this._completeTask(userId, task);
      }
      return;
    }

    if (type === "score_any") {
      const tasks = await db("daily_tasks")
        .where({ user_id: userId, date: today, is_completed: false })
        .where("task_type", "score_any");
      for (const task of tasks) {
        if (increment >= task.target_value) {
          await db("daily_tasks").where("id", task.id).update({ current_value: task.target_value });
          await this._completeTask(userId, task);
        } else {
          await db("daily_tasks").where("id", task.id).update({ current_value: increment });
        }
      }
      return;
    }

    // Kategori bazlı
    const task = await db("daily_tasks")
      .where({ user_id: userId, task_type: type, date: today, is_completed: false })
      .first();
    if (!task) return;

    const newValue = increment >= task.target_value ? task.target_value : increment;
    await db("daily_tasks").where("id", task.id).update({ current_value: newValue });
    if (newValue >= task.target_value) await this._completeTask(userId, task);
  },

  async _completeTask(userId: string, task: any) {
    await db("daily_tasks").where("id", task.id).update({ is_completed: true });
    await db("users").where("id", userId).update({
      coins: db.raw("coins + ?", [task.coin_reward]),
      xp:    db.raw("xp + ?",    [task.xp_reward ?? 0]),
    });
  },
};
