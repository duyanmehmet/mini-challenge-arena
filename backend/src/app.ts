import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import cron from 'node-cron';

import authRoutes from './routes/auth.routes';
import gameRoutes from './routes/game.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import userRoutes from './routes/user.routes';
import socialRoutes from './routes/social.routes';
import storeRoutes from './routes/store.routes';
import { setupSocket } from './socket';
import { connectRedis } from './redis';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/v1/auth', authRoutes);
app.use('/v1/game', gameRoutes);
app.use('/v1/leaderboard', leaderboardRoutes);
app.use('/v1/user', userRoutes);
app.use('/v1/social', socialRoutes);
app.use('/v1/store', storeRoutes);

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Haftalık lig sıfırlama ve terfi işlemleri — Her Pazartesi 00:00 UTC
cron.schedule('0 0 * * 1', async () => {
  try {
    const { LeagueResetService } = await import('./services/LeagueResetService');
    await LeagueResetService.processWeeklyReset();
  } catch (err) {
    console.error('Haftalık işlemler hatası:', err);
  }
});

setupSocket(io);

async function main() {
  await connectRedis();
  const PORT = parseInt(process.env.PORT ?? '3000');
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

main().catch(console.error);
