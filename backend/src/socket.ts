import type { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import db from "./database";

interface DuelPlayer {
  socketId: string;
  userId: string;
  username: string;
  avatarId: number;
  score: number;
  answered: number;
  done: boolean;
}

interface DuelRoom {
  players: DuelPlayer[];
  category: string;
}

const duelRooms = new Map<string, DuelRoom>();

export function setupSocket(io: Server): void {
  // JWT doğrulama middleware
  io.use((socket, next) => {
    const token = (socket.handshake.auth as any).token as string | undefined;
    if (!token) return next(new Error("Unauthorized"));
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      (socket as any).userId = payload.userId;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = (socket as any).userId as string;

    // ── Düello: Odaya katıl ─────────────────────────────────────────────
    socket.on("duel_join", async ({ duelId, category }: { duelId: string; userId?: string; category?: string }) => {
      if (!duelId) return;

      const user = await db("users").where("id", userId).select("username", "avatar_id").first().catch(() => null);
      const username = user?.username ?? "Oyuncu";
      const avatarId = user?.avatar_id ?? 1;

      let room = duelRooms.get(duelId);
      if (!room) {
        room = { players: [], category: category ?? "general" };
        duelRooms.set(duelId, room);
      }

      if (!room.players.find((p) => p.userId === userId)) {
        room.players.push({ socketId: socket.id, userId, username, avatarId, score: 0, answered: 0, done: false });
      }

      socket.join(duelId);

      // Rakibe katılım bildirimi
      socket.to(duelId).emit("duel_opponent_joined", { username, avatarId });

      // Her iki oyuncu hazır → oyunu başlat
      if (room.players.length >= 2) {
        // Sorular client-side'da seçilsin (null göndererek countdown'u tetikle)
        io.to(duelId).emit("duel_questions", { questions: null });
      }
    });

    // ── Düello: Davet gönder ────────────────────────────────────────────
    socket.on("duel_invite", async ({ friendId, mode, duelId }: { friendId: string; mode: string; duelId: string }) => {
      const user = await db("users").where("id", userId).select("username").first().catch(() => null);
      const friendSocket = findSocketByUserId(io, friendId);
      if (friendSocket) {
        friendSocket.emit("duel_invited", { challengerId: userId, challengerName: user?.username ?? "Oyuncu", mode, duelId });
      }
    });

    // ── Düello: Davet kabul/ret ─────────────────────────────────────────
    socket.on("duel_accept", ({ challengerId, duelId }: { challengerId: string; duelId: string }) => {
      const challengerSocket = findSocketByUserId(io, challengerId);
      if (challengerSocket) {
        challengerSocket.emit("duel_accepted", { duelId });
      }
      socket.emit("duel_accepted", { duelId });
    });

    socket.on("duel_reject", ({ challengerId }: { challengerId: string }) => {
      const challengerSocket = findSocketByUserId(io, challengerId);
      challengerSocket?.emit("duel_rejected");
    });

    // ── Düello: Cevap bildirimi ─────────────────────────────────────────
    socket.on("duel_answer", ({ duelId, correct, pts, qIndex }: { duelId: string; correct: boolean; pts: number; qIndex: number }) => {
      const room = duelRooms.get(duelId);
      if (!room) return;

      const me = room.players.find((p) => p.userId === userId);
      if (me) {
        if (correct) me.score += pts ?? 0;
        me.answered += 1;

        socket.to(duelId).emit("duel_opponent_update", {
          username: me.username,
          avatarId: me.avatarId,
          score: me.score,
          qIndex: qIndex ?? me.answered,
          answered: me.answered,
          lastCorrect: correct,
        });
      }
    });

    // ── Düello: Puan güncelleme ─────────────────────────────────────────
    socket.on("duel_update", ({ duelId, score }: { duelId: string; score: number }) => {
      const room = duelRooms.get(duelId);
      if (!room) return;
      const me = room.players.find((p) => p.userId === userId);
      if (me) {
        me.score = score;
        socket.to(duelId).emit("duel_opponent_update", {
          username: me.username,
          avatarId: me.avatarId,
          score: me.score,
          qIndex: 0,
          answered: me.answered,
          lastCorrect: null,
        });
      }
    });

    // ── Düello: Oyuncu bitti ────────────────────────────────────────────
    socket.on("duel_done", ({ duelId, score }: { duelId: string; userId?: string; score?: number }) => {
      const room = duelRooms.get(duelId);
      if (!room) return;
      const me = room.players.find((p) => p.userId === userId);
      if (me) {
        me.done = true;
        if (score !== undefined) me.score = score;
      }

      const allDone = room.players.length >= 2 && room.players.every((p) => p.done);
      if (allDone) finishDuel(io, duelId, room);
    });

    // ── Canlı Turnuva ───────────────────────────────────────────────────
    socket.on("live_join", ({ tournamentId }: { tournamentId: string }) => {
      socket.join(`live:${tournamentId}`);
    });

    socket.on("live_answer", ({ tournamentId, questionId, answer, correct, pts }: any) => {
      socket.to(`live:${tournamentId}`).emit("live_player_answered", { userId, correct, pts });
    });

    // ── Bağlantı koptu ──────────────────────────────────────────────────
    socket.on("disconnect", () => {
      duelRooms.forEach((room, duelId) => {
        const idx = room.players.findIndex((p) => p.socketId === socket.id);
        if (idx !== -1) {
          room.players.splice(idx, 1);
          io.to(duelId).emit("duel_opponent_left");
          if (room.players.length === 0) duelRooms.delete(duelId);
        }
      });
    });
  });
}

function finishDuel(io: Server, duelId: string, room: DuelRoom): void {
  const [p1, p2] = room.players;
  if (!p1 || !p2) return;

  const winner: string | "draw" =
    p1.score > p2.score ? p1.userId :
    p2.score > p1.score ? p2.userId :
    "draw";

  const p1Socket = io.sockets.sockets.get(p1.socketId);
  const p2Socket = io.sockets.sockets.get(p2.socketId);

  p1Socket?.emit("duel_finished", { winner, myScore: p1.score, oppScore: p2.score });
  p2Socket?.emit("duel_finished", { winner, myScore: p2.score, oppScore: p1.score });

  duelRooms.delete(duelId);
}

function findSocketByUserId(io: Server, userId: string): Socket | undefined {
  for (const [, socket] of io.sockets.sockets) {
    if ((socket as any).userId === userId) return socket;
  }
  return undefined;
}
