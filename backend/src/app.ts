import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import cron from "node-cron";
import "./database"; // Knex + Objection başlat
import db from "./database";
import { connectRedis } from "./redis";
import { apiLimiter } from "./middleware/rateLimit.middleware";
import authRoutes from "./routes/auth.routes";
import gameRoutes from "./routes/game.routes";
import leaderboardRoutes from "./routes/leaderboard.routes";
import userRoutes from "./routes/user.routes";
import socialRoutes from "./routes/social.routes";
import storeRoutes from "./routes/store.routes";
import challengeRoutes from "./routes/challenge.routes";
import clanRoutes from "./routes/clan.routes";
import battlepassRoutes from "./routes/battlepass.routes";
import dailyTaskRoutes from "./routes/dailytask.routes";
import { setupSocket } from "./socket";
import ligRoutes      from "./routes/lig.routes";
import messagesRoutes from "./routes/messages.routes";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*", methods: ["GET","POST"] } });

setupSocket(io);

app.use(cors({ origin: "*", methods: ["GET","POST","PATCH","DELETE"] }));
app.use(express.json());
app.use("/v1", apiLimiter);

app.use("/v1/auth",        authRoutes);
app.use("/v1/game",        gameRoutes);
app.use("/v1/leaderboard", leaderboardRoutes);
app.use("/v1/user",        userRoutes);
app.use("/v1/social",      socialRoutes);
app.use("/v1/store",       storeRoutes);
app.use("/v1/challenge",   challengeRoutes);
app.use("/v1/clan",        clanRoutes);
app.use("/v1/battlepass",  battlepassRoutes);
app.use("/v1/daily-tasks", dailyTaskRoutes);
app.use("/v1/lig",         ligRoutes);
app.use("/v1/messages",   messagesRoutes);

app.get("/health", (_req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// Haftalık özet bildirimi — Cumartesi 20:00 TR (17:00 UTC)
cron.schedule("0 17 * * 6", async () => {
  try {
    const topUsers = await db("users")
      .whereNotNull("push_token")
      .orderBy("weekly_score", "desc")
      .limit(200)
      .select("id", "push_token", "username", "weekly_score", "current_league");

    const { pushService } = await import("./services/push.service");
    for (const u of topUsers) {
      const rank = await db("users")
        .where("current_league", u.current_league)
        .where("weekly_score", ">", u.weekly_score)
        .count("* as cnt").first()
        .then((r: any) => parseInt(r?.cnt ?? "0") + 1);

      const msg = rank <= 5
        ? `🏆 Son 2 gün! ${u.current_league} Liginde #${rank}. sıradasın — terfi diliminde!`
        : `⏰ Hafta bitiyor! ${u.current_league} Liginde #${rank}. sıraya düştün. Oyna ve yüksel!`;

      await pushService.sendToUser(u.push_token, "📊 Haftalık Özet", msg).catch(() => {});
    }
  } catch (err) { console.error("Haftalık özet hatası:", err); }
});

// Haftalık lig sıfırlama — Her Pazartesi 00:00 TR (UTC+3 = 21:00 UTC Pazar)
cron.schedule("0 21 * * 0", async () => {
  try {
    const { LeagueResetService } = await import("./services/LeagueResetService");
    await LeagueResetService.processWeeklyReset();
    // Lig tier terfi/düşme
    const { processLigReset } = await import("./routes/lig.routes");
    await processLigReset(db);
    console.log("✅ Haftalık lig sıfırlama ve terfi tamamlandı");
  } catch (err) { console.error("League reset error:", err); }
});

async function main() {
  try {
    await connectRedis();
  } catch {
    console.warn("Redis bağlanamadı, önbellek devre dışı.");
  }
  const PORT = parseInt(process.env.PORT ?? "3000");
  httpServer.listen(PORT, () => console.log(`MCA Backend: http://localhost:${PORT}`));
}

main().catch(console.error);
export default app;