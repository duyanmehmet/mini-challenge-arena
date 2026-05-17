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
import arenaRoutes, { startArena, getArenaState, ARENA_HOURS_UTC } from "./routes/arena.routes";
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
app.use("/v1/arena",      arenaRoutes);

app.get("/health", (_req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// ── Zeka Arenası — 13:00, 18:00, 21:00 TR (UTC+3) ──
const ARENA_CATEGORIES = ['general', 'history', 'science', 'geography', 'sports', 'cinema'];
let arenaIdx = 0;

function launchArena() {
  const cat = ARENA_CATEGORIES[arenaIdx % ARENA_CATEGORIES.length];
  arenaIdx++;
  const arena = startArena(cat);
  console.log(`🏟️ Arena başladı: ${cat} | ID: ${arena.id}`);

  // Socket ile tüm kullanıcılara bildir
  io.emit('arena_started', {
    arenaId: arena.id,
    category: cat,
    endsAt: arena.endAt.toISOString(),
    secondsLeft: 30 * 60,
  });

  // 15 dakika kala hatırlatma
  setTimeout(() => {
    if (getArenaState()?.id === arena.id) {
      io.emit('arena_ending_soon', { arenaId: arena.id, secondsLeft: 15 * 60 });
    }
  }, 15 * 60 * 1000);
}

// 10:00 UTC = 13:00 TR
cron.schedule("0 10 * * *", launchArena);
// 15:00 UTC = 18:00 TR
cron.schedule("0 15 * * *", launchArena);
// 18:00 UTC = 21:00 TR
cron.schedule("0 18 * * *", launchArena);

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