import { pushService } from "./push.service";
import db from "../database";

export const streakService = {
  async checkAndNotify(userId: string, streakCount: number): Promise<void> {
    if (streakCount !== 3 && streakCount !== 7 && streakCount !== 30) return;

    const user = await db("users").where("id", userId).select("push_token", "username").first();
    if (!user?.push_token) return;

    const messages: Record<number, { title: string; body: string }> = {
      3:  { title: "🔥 3 Günlük Seri!", body: `${user.username}, 3 gün üst üste oynadın! Rozetin açıldı.` },
      7:  { title: "🏆 7 Günlük Seri!", body: `${user.username}, tam 1 haftadır oynuyorsun! Harika.` },
      30: { title: "👑 30 Günlük Seri!", body: `${user.username}, efsane seri! 30 gün üst üste oynadın!` },
    };

    const msg = messages[streakCount];
    if (msg) {
      await pushService.sendToUser(user.push_token, msg.title, msg.body, { type: "streak", count: streakCount });
    }
  },
};