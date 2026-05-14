import { Server, Socket } from 'socket.io';
import db from '../database';
import { v4 as uuidv4 } from 'uuid';
import { getSeedQuestions } from '../data/questions';

interface DuelPlayer {
  userId: string;
  socketId: string;
  username: string;
  avatarId: number;
  score: number;
  done: boolean;
}

interface DuelRoom {
  duelId: string;
  category: string;
  players: DuelPlayer[];
  questions: unknown[];
  startedAt: number;
}

// Aktif düello odaları
const rooms = new Map<string, DuelRoom>();
// Kullanıcının beklediği düello daveti
const pendingInvites = new Map<string, { duelId: string; challengerId: string; category: string }>();

export function handleDuelEvents(io: Server, socket: Socket, userId: string): void {

  // ── Düello Daveti gönder ─────────────────────────────────────────────
  socket.on('duel_invite', ({ targetId, mode }: { targetId: string; mode: string }) => {
    const duelId = uuidv4();
    pendingInvites.set(targetId, { duelId, challengerId: userId, category: mode });
    io.to(targetId).emit('duel_invited', {
      challengerId: userId,
      mode,
      duelId,
    });
    // Challenger'a da duelId gönder (bekleme ekranı için)
    socket.emit('duel_invite_sent', { duelId, targetId });
  });

  // ── Daveti Kabul et ──────────────────────────────────────────────────
  socket.on('duel_accept', ({ challengerId }: { challengerId: string }) => {
    const invite = pendingInvites.get(userId);
    if (!invite || invite.challengerId !== challengerId) return;
    pendingInvites.delete(userId);

    // İki oyuncuya da duelId + kategori bilgisini gönder
    io.to(challengerId).emit('duel_accepted', { duelId: invite.duelId, category: invite.category });
    socket.emit('duel_accepted', { duelId: invite.duelId, category: invite.category });
  });

  // ── Daveti Reddet ────────────────────────────────────────────────────
  socket.on('duel_reject', ({ challengerId }: { challengerId: string }) => {
    pendingInvites.delete(userId);
    io.to(challengerId).emit('duel_rejected', { opponentId: userId });
  });

  // ── Düello odasına katıl ─────────────────────────────────────────────
  socket.on('duel_join', async ({ duelId, category: clientCategory }: {
    duelId: string;
    category?: string;
    userId?: string;
  }) => {
    // DB'den kullanıcı bilgisi çek
    const userRow = await db('users').where({ id: userId }).select('username', 'avatar_id').first().catch(() => null);
    const username = userRow?.username ?? 'Oyuncu';
    const avatarId = userRow?.avatar_id ?? 0;

    let room = rooms.get(duelId);

    if (!room) {
      const category = clientCategory ?? 'general';
      const serverQuestions = getSeedQuestions(
        category,
        Math.floor(Date.now() / 86400000),
        10
      );
      room = {
        duelId,
        category,
        players: [],
        questions: serverQuestions,
        startedAt: Date.now(),
      };
      rooms.set(duelId, room);
    }

    // Oyuncuyu odaya ekle
    const alreadyIn = room.players.find((p) => p.userId === userId);
    if (!alreadyIn) {
      room.players.push({ userId, socketId: socket.id, username, avatarId, score: 0, done: false });
      socket.join(duelId);
    }

    // İkinci oyuncu katıldığında — sorular + rakip bilgisi gönder
    if (room.players.length === 2) {
      const [p1, p2] = room.players;
      io.to(p1.socketId).emit('duel_opponent_joined', { username: p2.username, avatarId: p2.avatarId });
      io.to(p2.socketId).emit('duel_opponent_joined', { username: p1.username, avatarId: p1.avatarId });
      io.to(duelId).emit('duel_questions', { questions: room.questions });
    }
  });

  // ── Gerçek zamanlı skor güncellemesi ─────────────────────────────────
  socket.on('duel_update', ({ duelId, score }: { duelId: string; score: number; userId: string }) => {
    const room = rooms.get(duelId);
    if (!room) return;
    const player = room.players.find((p) => p.userId === userId);
    if (player) player.score = score;

    // Rakibe canlı skor gönder
    const me = room.players.find((p) => p.userId === userId);
    socket.to(duelId).emit('duel_opponent_update', {
      userId,
      score,
      answered: 0,
      lastCorrect: null,
      username: me?.username ?? 'Oyuncu',
      avatarId: me?.avatarId ?? 0,
    });
  });

  // ── Cevap verme bilgisi (rakibe ilerleme göster) ──────────────────────
  socket.on('duel_answer', ({ duelId, correct, pts, qIndex }: {
    duelId: string;
    correct: boolean;
    pts: number;
    qIndex: number;
    userId: string;
  }) => {
    const ansRoom = rooms.get(duelId);
    const ansPlayer = ansRoom?.players.find((p) => p.userId === userId);
    socket.to(duelId).emit('duel_opponent_update', {
      userId,
      score: ansPlayer?.score ?? 0,
      answered: qIndex + 1,
      lastCorrect: correct,
      username: ansPlayer?.username ?? 'Oyuncu',
      avatarId: ansPlayer?.avatarId ?? 0,
    });
  });

  // ── Oyunu bitirdi ────────────────────────────────────────────────────
  socket.on('duel_done', ({ duelId, score }: { duelId: string; score: number; userId: string }) => {
    const room = rooms.get(duelId);
    if (!room) return;

    const player = room.players.find((p) => p.userId === userId);
    if (player) { player.score = score; player.done = true; }

    // Her iki oyuncu da bitirdiyse sonuç gönder
    const allDone = room.players.every((p) => p.done);
    if (allDone || room.players.filter((p) => p.done).length >= 1) {
      // Biri bitirince 30 sn bekle, sonra sonuçlandır
      // Basit versiyon: biri bitirince diğerini beklemeden sonuçlandır
      const [p1, p2] = room.players;
      const s1 = p1?.score ?? 0;
      const s2 = p2?.score ?? 0;

      let winner: string | 'draw';
      if (!p2) {
        winner = p1.userId;
      } else if (s1 > s2) {
        winner = p1.userId;
      } else if (s2 > s1) {
        winner = p2.userId;
      } else {
        winner = 'draw';
      }

      io.to(duelId).emit('duel_finished', {
        winner,
        myScore: score,
        oppScore: p1.userId === userId ? s2 : s1,
      });

      // DB'ye kaydet (opsiyonel — hata olursa devam et)
      saveDuelResult(room, winner).catch(() => {});
      rooms.delete(duelId);
    }
  });

  // ── Bağlantı kopunca ────────────────────────────────────────────────
  socket.on('disconnect', () => {
    rooms.forEach((room, duelId) => {
      const inRoom = room.players.some((p) => p.userId === userId);
      if (inRoom) {
        socket.to(duelId).emit('duel_opponent_left');
        rooms.delete(duelId);
      }
    });
    pendingInvites.delete(userId);
  });
}

async function saveDuelResult(room: DuelRoom, winner: string | 'draw') {
  const [p1, p2] = room.players;
  if (!p1 || !p2) return;
  await db('duels').insert({
    id: room.duelId,
    challenger_id: p1.userId,
    opponent_id: p2.userId,
    mode: room.category,
    challenger_score: p1.score,
    opponent_score: p2.score,
    winner_id: winner === 'draw' ? null : winner,
    status: 'completed',
    created_at: new Date(room.startedAt).toISOString(),
  }).onConflict('id').ignore();
}
