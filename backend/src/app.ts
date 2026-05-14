import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import cron from "node-cron";
import "./database"; // Knex + Objection başlat
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
import liveRoutes from "./routes/live.routes";
import battlepassRoutes from "./routes/battlepass.routes";
import dailyTaskRoutes from "./routes/dailytask.routes";
import { setupSocket } from "./socket";
import { LiveTournamentService } from "./services/LiveTournamentService";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*", methods: ["GET","POST"] } });

setupSocket(io);

const liveTournament = new LiveTournamentService(io);
liveTournament.start();

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
app.use("/v1/live",        liveRoutes);
app.use("/v1/battlepass",   battlepassRoutes);
app.use("/v1/daily-tasks", dailyTaskRoutes);

app.get("/health", (_req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// Haftalık lig sıfırlama — Her Pazartesi 00:00
cron.schedule("0 0 * * 1", async () => {
  try {
    const { LeagueResetService } = await import("./services/LeagueResetService");
    await LeagueResetService.processWeeklyReset();
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