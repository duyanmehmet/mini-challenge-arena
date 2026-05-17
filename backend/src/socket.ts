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

// ── Matchmaking kuyruğu ───────────────────────────────────────────
interface QueuedPlayer {
  socketId: string;
  userId: string;
  username: string;
  avatarId: number;
  duelRank: number;
  category: string;
}
const matchQueue = new Map<string, QueuedPlayer[]>(); // category → players

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

    // ── Rastgele Matchmaking ─────────────────────────────────────────────
    socket.on("mm_join", async ({ category }: { category: string }) => {
      console.log(`[MM] mm_join: userId=${userId} category=${category} socketId=${socket.id}`);

      const user = await db("users").where("id", userId)
        .select("username", "avatar_id").first().catch(() => null);

      const me: QueuedPlayer = {
        socketId: socket.id, userId,
        username: user?.username ?? "Oyuncu",
        avatarId: user?.avatar_id ?? 1,
        duelRank: 0,
        category,
      };

      // Rastgele eşleşmede TÜM kategorilerdeki oyuncularla eşleş
      let foundOpponent: QueuedPlayer | null = null;
      let foundCategory = category;

      // Önce aynı kategoride ara
      const sameQueue = matchQueue.get(category) ?? [];
      const sameIdx   = sameQueue.findIndex(p => p.userId !== userId);
      if (sameIdx >= 0) {
        foundOpponent = sameQueue.splice(sameIdx, 1)[0];
        matchQueue.set(category, sameQueue);
        foundCategory = category;
      } else {
        // Farklı kategorilerde de ara (rastgele eşleşme)
        for (const [cat, queue] of matchQueue.entries()) {
          const idx = queue.findIndex(p => p.userId !== userId);
          if (idx >= 0) {
            foundOpponent = queue.splice(idx, 1)[0];
            matchQueue.set(cat, queue);
            foundCategory = cat;
            break;
          }
        }
      }

      if (foundOpponent) {
        const duelId    = `mm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const oppSocket = io.sockets.sockets.get(foundOpponent.socketId);

        console.log(`[MM] Eşleşme: ${me.username} vs ${foundOpponent.username} | duelId=${duelId}`);

        socket.emit("mm_matched", {
          duelId, category: foundCategory,
          opponent: { username: foundOpponent.username, avatarId: foundOpponent.avatarId, duelRank: foundOpponent.duelRank },
        });
        oppSocket?.emit("mm_matched", {
          duelId, category: foundCategory,
          opponent: { username: me.username, avatarId: me.avatarId, duelRank: me.duelRank },
        });
      } else {
        // Kuyruğa ekle
        const q = matchQueue.get(category) ?? [];
        // Aynı kullanıcı zaten kuyruktaysa ekleme
        if (!q.find(p => p.userId === userId)) {
          q.push(me);
          matchQueue.set(category, q);
        }
        socket.emit("mm_queued");
        console.log(`[MM] Kuyruğa eklendi: ${me.username} | kuyruk boyutu: ${q.length}`);
      }
    });

    socket.on("mm_leave", ({ category }: { category: string }) => {
      // Tüm kategorilerden çıkar
      for (const [cat, queue] of matchQueue.entries()) {
        matchQueue.set(cat, queue.filter(p => p.userId !== userId));
      }
    });

    // ── Düello: Rank güncelle ────────────────────────────────────────────
    socket.on("duel_rank_update", async ({ win }: { win: boolean }) => {
      const delta = win ? 25 : -15;
      await db("users").where("id", userId).update({
        duel_rank: db.raw("GREATEST(0, COALESCE(duel_rank, 0) + ?)", [delta]),
      }).catch(() => {});
    });

    // ── Zeka Arenası ─────────────────────────────────────────────────────
    socket.on("arena_join", ({ arenaId }: { arenaId: string }) => {
      socket.join(`arena:${arenaId}`);
    });
    socket.on("arena_score", ({ arenaId, score, username }: { arenaId: string; score: number; username: string }) => {
      io.to(`arena:${arenaId}`).emit("arena_score_update", { username, score, ts: Date.now() });
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
