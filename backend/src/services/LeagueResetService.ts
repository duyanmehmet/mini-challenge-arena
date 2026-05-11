import db from "../database";
import { v4 as uuidv4 } from "uuid";

const LEAGUES = ["bronze", "silver", "gold", "diamond", "legend"];

export class LeagueResetService {
  static async processWeeklyReset(): Promise<void> {
    console.log("[LeagueReset] Haftalık işlemler başlıyor...");
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    const weekStartStr = weekStart.toISOString().slice(0, 10);

    for (const league of LEAGUES) {
      const players = await db("users")
        .where("current_league", league)
        .orderBy("weekly_score", "desc")
        .select("id", "weekly_score");

      const total = players.length;
      if (total < 4) {
        await db("users").where("current_league", league).update({ weekly_score: 0 });
        continue;
      }

      const promoteCount = Math.ceil(total * 0.25);
      const relegateCount = Math.ceil(total * 0.25);
      const leagueIdx = LEAGUES.indexOf(league);

      for (let i = 0; i < total; i++) {
        const player = players[i];
        let newLeague = league;

        if (i < promoteCount && leagueIdx < LEAGUES.length - 1) {
          newLeague = LEAGUES[leagueIdx + 1];
        } else if (i >= total - relegateCount && leagueIdx > 0) {
          newLeague = LEAGUES[leagueIdx - 1];
        }

        await db("weekly_leaderboard")
          .insert({ id: uuidv4(), user_id: player.id, week_start: weekStartStr, total_score: player.weekly_score, league, final_rank: i + 1 })
          .onConflict(["user_id", "week_start"]).merge(["total_score", "final_rank"]);

        await db("users").where("id", player.id).update({ current_league: newLeague, weekly_score: 0 });
      }
    }

    console.log("[LeagueReset] Tamamlandı.");
  }
}