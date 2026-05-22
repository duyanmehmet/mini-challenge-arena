import db from "../database";
import { v4 as uuidv4 } from "uuid";

type Difficulty = 'easy' | 'medium' | 'hard';
interface Task { type: string; desc: string; target: number; coins: number; xp: number; diff: Difficulty; }

const TASK_POOL: Task[] = [
  // ── Kolay ─────────────────────────────────────────────────────────
  { type: "play_count",      desc: "Herhangi bir kategoride 2 oyun oyna",          target: 2,    coins: 20,  xp: 15,  diff: "easy" },
  { type: "score_any",       desc: "Tek oyunda 300 puan kazan",                    target: 300,  coins: 25,  xp: 15,  diff: "easy" },
  { type: "score_any",       desc: "Tek oyunda 500 puan kazan",                    target: 500,  coins: 35,  xp: 20,  diff: "easy" },
  { type: "score_kids",      desc: "Çocuklar kategorisinde 300 puan kazan",        target: 300,  coins: 30,  xp: 20,  diff: "easy" },
  { type: "score_sports",    desc: "Spor kategorisinde 400 puan kazan",            target: 400,  coins: 35,  xp: 20,  diff: "easy" },
  { type: "score_cinema",    desc: "Sinema & TV kategorisinde 400 puan kazan",     target: 400,  coins: 35,  xp: 20,  diff: "easy" },
  { type: "score_art",       desc: "Sanat kategorisinde 400 puan kazan",           target: 400,  coins: 35,  xp: 20,  diff: "easy" },
  { type: "score_arabic",    desc: "Arapça kategorisinde 300 puan kazan",          target: 300,  coins: 40,  xp: 25,  diff: "easy" },
  { type: "score_french",    desc: "Fransızca kategorisinde 300 puan kazan",       target: 300,  coins: 40,  xp: 25,  diff: "easy" },
  { type: "score_german",    desc: "Almanca kategorisinde 300 puan kazan",         target: 300,  coins: 40,  xp: 25,  diff: "easy" },
  { type: "score_spanish",   desc: "İspanyolca kategorisinde 300 puan kazan",      target: 300,  coins: 40,  xp: 25,  diff: "easy" },

  // ── Orta ──────────────────────────────────────────────────────────
  { type: "play_count",      desc: "Herhangi bir kategoride 5 oyun oyna",          target: 5,    coins: 55,  xp: 35,  diff: "medium" },
  { type: "score_any",       desc: "Tek oyunda 1000 puan kazan",                   target: 1000, coins: 70,  xp: 45,  diff: "medium" },
  { type: "score_any",       desc: "Tek oyunda 1500 puan kazan",                   target: 1500, coins: 90,  xp: 60,  diff: "medium" },
  { type: "score_history",   desc: "Tarih kategorisinde 700 puan kazan",           target: 700,  coins: 65,  xp: 40,  diff: "medium" },
  { type: "score_science",   desc: "Bilim kategorisinde 700 puan kazan",           target: 700,  coins: 65,  xp: 40,  diff: "medium" },
  { type: "score_geography", desc: "Coğrafya kategorisinde 700 puan kazan",        target: 700,  coins: 65,  xp: 40,  diff: "medium" },
  { type: "score_general",   desc: "Genel Kültür'de 800 puan kazan",              target: 800,  coins: 65,  xp: 40,  diff: "medium" },
  { type: "score_turkey",    desc: "Türkiye kategorisinde 700 puan kazan",         target: 700,  coins: 65,  xp: 40,  diff: "medium" },
  { type: "score_medical",   desc: "Tıbbi Terimler kategorisinde 600 puan kazan",  target: 600,  coins: 70,  xp: 45,  diff: "medium" },
  { type: "score_economy",   desc: "Ekonomi kategorisinde 600 puan kazan",         target: 600,  coins: 70,  xp: 45,  diff: "medium" },
  { type: "score_license",   desc: "Ehliyet Sınavı kategorisinde 600 puan kazan",  target: 600,  coins: 70,  xp: 45,  diff: "medium" },

  // ── Zor ───────────────────────────────────────────────────────────
  { type: "play_count",      desc: "Herhangi bir kategoride 8 oyun oyna",          target: 8,    coins: 100, xp: 70,  diff: "hard" },
  { type: "score_any",       desc: "Tek oyunda 2500 puan kazan",                   target: 2500, coins: 150, xp: 100, diff: "hard" },
  { type: "score_any",       desc: "Tek oyunda 3500 puan kazan",                   target: 3500, coins: 200, xp: 130, diff: "hard" },
  { type: "score_history",   desc: "Tarih kategorisinde 1500 puan kazan",          target: 1500, coins: 120, xp: 80,  diff: "hard" },
  { type: "score_science",   desc: "Bilim kategorisinde 1500 puan kazan",          target: 1500, coins: 120, xp: 80,  diff: "hard" },
  { type: "score_geography", desc: "Coğrafya kategorisinde 1500 puan kazan",       target: 1500, coins: 120, xp: 80,  diff: "hard" },
  { type: "score_general",   desc: "Genel Kültür'de 2000 puan kazan",             target: 2000, coins: 130, xp: 85,  diff: "hard" },
  { type: "score_turkey",    desc: "Türkiye kategorisinde 1500 puan kazan",        target: 1500, coins: 120, xp: 80,  diff: "hard" },
  { type: "score_medical",   desc: "Tıbbi Terimler kategorisinde 1200 puan kazan", target: 1200, coins: 130, xp: 85,  diff: "hard" },
  { type: "score_economy",   desc: "Ekonomi kategorisinde 1200 puan kazan",        target: 1200, coins: 130, xp: 85,  diff: "hard" },
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

    // Her gün 2 kolay + 2 orta + 1 zor — tarih+userId'ye göre değişir
    const dateSeed = parseInt(today.replace(/-/g, '')) + userId.charCodeAt(0);
    const easy   = seededShuffle(TASK_POOL.filter(t => t.diff === 'easy'),   dateSeed).slice(0, 2);
    const medium = seededShuffle(TASK_POOL.filter(t => t.diff === 'medium'), dateSeed + 1).slice(0, 2);
    const hard   = seededShuffle(TASK_POOL.filter(t => t.diff === 'hard'),   dateSeed + 2).slice(0, 1);

    // Aynı task_type birden fazla kez seçilirse unique kısıtı ihlal eder — deduplicate et
    const seen = new Set<string>();
    const selected = seededShuffle([...easy, ...medium, ...hard], dateSeed + 3)
      .filter(t => {
        if (seen.has(t.type)) return false;
        seen.add(t.type);
        return true;
      });

    if (selected.length === 0) return;

    await db("daily_tasks")
      .insert(
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
      )
      .onConflict(["user_id", "task_type", "date"])
      .ignore();
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
