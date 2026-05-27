import { Server, Socket } from 'socket.io';
import db from '../database';
import { v4 as uuidv4 } from 'uuid';
import { getSeedQuestions } from '../data/questions';
import { pushService } from '../services/push.service';

// ── Çark segmentleri ─────────────────────────────────────────────────
const WHEEL_CATEGORIES = ['history', 'science', 'sports', 'geography', 'cinema', 'general', 'turkey', 'economy', 'fun'];
const WHEEL_SEGMENTS = [
  ...WHEEL_CATEGORIES.map((id, i) => ({ id, type: 'category' as const, segmentIndex: i })),
  { id: '2x',    type: 'special' as const, segmentIndex: 9 },
  { id: 'joker', type: 'special' as const, segmentIndex: 10 },
];

function spinWheel(): { segmentId: string; segmentIndex: number; category: string; is2x: boolean } {
  const idx = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
  const seg = WHEEL_SEGMENTS[idx];
  const is2x = seg.id === '2x';
  const isJoker = seg.id === 'joker';
  const category = (seg.type === 'category')
    ? seg.id
    : WHEEL_CATEGORIES[Math.floor(Math.random() * WHEEL_CATEGORIES.length)];
  return { segmentId: seg.id, segmentIndex: seg.segmentIndex, category, is2x };
}

// ── Arayüzler ────────────────────────────────────────────────────────
interface DuelPlayer {
  userId: string;
  socketId: string;
  username: string;
  avatarId: number;
  roundWins: number;
  currentRoundAnswers: number;
  currentRoundCorrect: number;
  ready: boolean;
}

interface Round {
  segmentId: string;
  segmentIndex: number;
  category: string;
  is2x: boolean;
  questions: unknown[];
  answers: Map<string, { correct: number; total: number }>;
}

interface DuelRoom {
  duelId: string;
  stake: number;
  players: DuelPlayer[];
  currentRound: number;
  rounds: Round[];
  coinsDeducted: boolean;
  startedAt: number;
}

const rooms = new Map<string, DuelRoom>();
const pendingInvites = new Map<string, { duelId: string; challengerId: string; stake: number }>();
const matchmakingQueue = new Map<string, { socketId: string; stake: number; userId: string }>();

export function handleDuelEvents(io: Server, socket: Socket, userId: string): void {

  const VALID_STAKES = [50, 100, 200, 500, 1000];

  // ── Davet gönder ─────────────────────────────────────────────────
  socket.on('duel_invite', async ({ targetId, stake = 50 }: { targetId: string; stake?: number }) => {
    if (!VALID_STAKES.includes(stake)) return socket.emit('error', 'Geçersiz bahis miktarı.');
    const duelId = uuidv4();
    pendingInvites.set(targetId, { duelId, challengerId: userId, stake });
    io.to(targetId).emit('duel_invited', { challengerId: userId, stake, duelId });
    socket.emit('duel_invite_sent', { duelId, targetId });

    // Push bildirimi — hedef çevrimdışıysa da ulaşsın
    const [challenger, target] = await Promise.all([
      db('users').where('id', userId).select('username').first().catch(() => null),
      db('users').where('id', targetId).select('push_token').first().catch(() => null),
    ]);
    if (target?.push_token && challenger) {
      pushService.sendToUser(
        target.push_token,
        '⚔️ Düello Daveti!',
        `${challenger.username} seni ${stake} 🪙 için düelloya davet etti!`,
        { type: 'duel_invite', duelId, challengerId: userId, stake }
      ).catch(() => {});
    }
  });

  socket.on('duel_accept', ({ challengerId }: { challengerId: string }) => {
    const invite = pendingInvites.get(userId);
    if (!invite || invite.challengerId !== challengerId) return;
    pendingInvites.delete(userId);
    io.to(challengerId).emit('duel_accepted', { duelId: invite.duelId, stake: invite.stake });
    socket.emit('duel_accepted', { duelId: invite.duelId, stake: invite.stake });
  });

  socket.on('duel_reject', ({ challengerId }: { challengerId: string }) => {
    pendingInvites.delete(userId);
    io.to(challengerId).emit('duel_rejected', { opponentId: userId });
  });

  // ── Eşleşme kuyruğu ──────────────────────────────────────────────
  socket.on('mm_join', async ({ stake = 50 }: { stake?: number }) => {
    if (!VALID_STAKES.includes(stake)) return socket.emit('error', 'Geçersiz bahis miktarı.');
    // Aynı bahis miktarında biri var mı?
    let matched: { socketId: string; stake: number; userId: string } | undefined;
    for (const [uid, entry] of matchmakingQueue.entries()) {
      if (uid !== userId && entry.stake === stake) {
        matched = entry;
        matchmakingQueue.delete(uid);
        break;
      }
    }

    if (matched) {
      const duelId = uuidv4();
      const oppUser = await db('users').where('id', matched.userId).select('username', 'avatar_id', 'duel_rank').first().catch(() => null);
      const myUser  = await db('users').where('id', userId).select('username', 'avatar_id', 'duel_rank').first().catch(() => null);

      socket.emit('mm_matched', {
        duelId, stake,
        opponent: { username: oppUser?.username ?? 'Oyuncu', avatarId: oppUser?.avatar_id ?? 0, duelRank: oppUser?.duel_rank ?? 0 },
      });
      io.to(matched.socketId).emit('mm_matched', {
        duelId, stake,
        opponent: { username: myUser?.username ?? 'Oyuncu', avatarId: myUser?.avatar_id ?? 0, duelRank: myUser?.duel_rank ?? 0 },
      });
    } else {
      matchmakingQueue.set(userId, { socketId: socket.id, stake, userId });
      socket.emit('mm_waiting', { stake });
    }
  });

  socket.on('mm_cancel', () => { matchmakingQueue.delete(userId); });

  // ── Düello odasına katıl ─────────────────────────────────────────
  socket.on('duel_join', async ({ duelId, stake = 50 }: { duelId: string; stake?: number }) => {
    const userRow = await db('users').where({ id: userId }).select('username', 'avatar_id', 'coins').first().catch(() => null);
    const username = userRow?.username ?? 'Oyuncu';
    const avatarId = userRow?.avatar_id ?? 0;
    const coins    = userRow?.coins ?? 0;

    let room = rooms.get(duelId);

    if (!room) {
      // Önceden 3 tur oluştur
      const rounds: Round[] = Array.from({ length: 3 }, () => {
        const spin = spinWheel();
        return {
          ...spin,
          questions: getSeedQuestions(spin.category, Date.now() + Math.floor(Math.random() * 999983), 5),
          answers: new Map(),
        };
      });
      room = { duelId, stake, players: [], currentRound: 0, rounds, coinsDeducted: false, startedAt: Date.now() };
      rooms.set(duelId, room);
    }

    if (!room.players.find(p => p.userId === userId)) {
      room.players.push({ userId, socketId: socket.id, username, avatarId, roundWins: 0, currentRoundAnswers: 0, currentRoundCorrect: 0, ready: false });
      socket.join(duelId);
    }

    // Her iki oyuncu katıldığında — coin kes + ilk turu başlat
    if (room.players.length === 2 && !room.coinsDeducted) {
      room.coinsDeducted = true;

      const [p1, p2] = room.players;

      // Coin kesme — transaction içinde kontrol+kesme (race condition önlenir)
      let deductOk = false;
      await db.transaction(async trx => {
        const r1 = await trx('users').where('id', p1.userId).andWhere('coins', '>=', room.stake)
          .update({ coins: db.raw('coins - ?', [room.stake]) });
        const r2 = await trx('users').where('id', p2.userId).andWhere('coins', '>=', room.stake)
          .update({ coins: db.raw('coins - ?', [room.stake]) });
        if (r1 === 0 || r2 === 0) throw new Error('insufficient');
        deductOk = true;
      }).catch(() => {});

      if (!deductOk) {
        io.to(duelId).emit('duel_cancelled', { reason: 'Yetersiz coin.' });
        rooms.delete(duelId);
        return;
      }

      // Rakip bilgisi
      io.to(p1.socketId).emit('duel_opponent_joined', { username: p2.username, avatarId: p2.avatarId });
      io.to(p2.socketId).emit('duel_opponent_joined', { username: p1.username, avatarId: p1.avatarId });

      // İlk turu başlat
      startRound(io, room);
    }
  });

  // ── Tur cevabı ───────────────────────────────────────────────────
  socket.on('duel_round_answer', ({ duelId, correct, answerIdx }: { duelId: string; correct: boolean; answerIdx?: number }) => {
    const room = rooms.get(duelId);
    if (!room) return;

    const roundIdx = room.currentRound;
    const round = room.rounds[roundIdx];
    if (!round) return;

    const player = room.players.find(p => p.userId === userId);
    if (!player) return;

    player.currentRoundAnswers++;
    if (correct) player.currentRoundCorrect++;

    // Rakibe bildir — hangi şıkkı seçtiğini de gönder
    const opp = room.players.find(p => p.userId !== userId);
    if (opp) {
      io.to(opp.socketId).emit('duel_opponent_answer', { correct, answered: player.currentRoundAnswers, answerIdx: answerIdx ?? null });
    }

    // İkisi de bu turda tüm soruları bitirdiyse
    const questionsPerRound = round.questions.length;
    const allDone = room.players.every(p => p.currentRoundAnswers >= questionsPerRound);

    if (allDone) {
      finishRound(io, room);
    }
  });

  // ── Emoji ────────────────────────────────────────────────────────
  socket.on('duel_emoji_send', ({ duelId, emoji }: { duelId: string; emoji: string }) => {
    socket.to(duelId).emit('duel_emoji', { emoji });
  });

  // ── Bağlantı kopunca ─────────────────────────────────────────────
  socket.on('disconnect', () => {
    matchmakingQueue.delete(userId);

    rooms.forEach(async (room, duelId) => {
      const inRoom = room.players.some(p => p.userId === userId);
      if (!inRoom) return;

      socket.to(duelId).emit('duel_opponent_left');

      // Ayrılan oyuncu coin kaybeder, kalan oyuncu her iki coini kazanır
      if (room.coinsDeducted && room.players.length === 2) {
        const winner = room.players.find(p => p.userId !== userId);
        if (winner) {
          const prize = room.stake * 2 - Math.floor(room.stake * 0.05); // %5 kesinti
          await db('users').where('id', winner.userId).update({ coins: db.raw('coins + ?', [prize]) }).catch(() => {});
          io.to(winner.socketId).emit('duel_match_result', {
            result: 'win',
            reason: 'Rakip ayrıldı',
            coinsWon: prize,
            roundWins: [winner.roundWins, 0],
          });
        }
      }
      rooms.delete(duelId);
      pendingInvites.delete(userId);
    });
  });
}

// ── Tur başlat ───────────────────────────────────────────────────────
function startRound(io: Server, room: DuelRoom) {
  const round = room.rounds[room.currentRound];
  if (!round) return;

  // Oyuncuların tur istatistiklerini sıfırla
  room.players.forEach(p => { p.currentRoundAnswers = 0; p.currentRoundCorrect = 0; });

  io.to(room.duelId).emit('duel_round_start', {
    round: room.currentRound + 1,
    totalRounds: 3,
    segmentId: round.segmentId,
    segmentIndex: round.segmentIndex,
    category: round.category,
    is2x: round.is2x,
    questions: round.questions,
  });
}

// ── Tur bitir ────────────────────────────────────────────────────────
function finishRound(io: Server, room: DuelRoom) {
  const round = room.rounds[room.currentRound];
  if (!round) return;

  const [p1, p2] = room.players;
  const p1c = p1?.currentRoundCorrect ?? 0;
  const p2c = p2?.currentRoundCorrect ?? 0;

  let roundWinner: string | 'draw';
  if (p1c > p2c) { roundWinner = p1.userId; p1.roundWins++; }
  else if (p2c > p1c) { roundWinner = p2.userId; p2.roundWins++; }
  else roundWinner = 'draw';

  io.to(room.duelId).emit('duel_round_end', {
    round: room.currentRound + 1,
    winnerId: roundWinner,
    p1: { userId: p1.userId, correct: p1c },
    p2: { userId: p2?.userId, correct: p2c },
    roundWins: [p1.roundWins, p2?.roundWins ?? 0],
  });

  room.currentRound++;

  // Erken bitiş: biri 2 tur kazandı
  const maxWins = Math.max(p1.roundWins, p2?.roundWins ?? 0);
  if (maxWins >= 2 || room.currentRound >= 3) {
    setTimeout(() => finishMatch(io, room), 2500);
  } else {
    // Bir sonraki tur (2.5 sn sonra çark göster)
    setTimeout(() => startRound(io, room), 2500);
  }
}

// ── Maç bitir ────────────────────────────────────────────────────────
async function finishMatch(io: Server, room: DuelRoom) {
  const [p1, p2] = room.players;
  if (!p1 || !p2) return; // İki oyuncu da olmadan maç bitirilemez

  let matchWinner: string | 'draw';
  const w1 = p1.roundWins;
  const w2 = p2?.roundWins ?? 0;

  if (w1 > w2) matchWinner = p1.userId;
  else if (w2 > w1) matchWinner = p2!.userId;
  else matchWinner = 'draw';

  const totalPot = room.stake * 2;
  const cut = Math.floor(totalPot * 0.05); // %5 ev kesintisi
  const prize = totalPot - cut;

  if (matchWinner !== 'draw') {
    await db('users').where('id', matchWinner).update({ coins: db.raw('coins + ?', [prize]) }).catch(() => {});
    // Duel rank güncelle
    const loser = matchWinner === p1.userId ? p2?.userId : p1.userId;
    await db('users').where('id', matchWinner).update({ duel_rank: db.raw('duel_rank + 25') }).catch(() => {});
    if (loser) await db('users').where('id', loser).update({ duel_rank: db.raw('GREATEST(0, duel_rank - 15)') }).catch(() => {});
  } else {
    // Beraberlikte her ikisine geri öde (kesintisiz)
    for (const p of room.players) {
      await db('users').where('id', p.userId).update({ coins: db.raw('coins + ?', [room.stake]) }).catch(() => {});
    }
  }

  // Sonuçları kaydet
  if (p2) {
    await db('duels').insert({
      id: room.duelId,
      challenger_id: p1.userId,
      opponent_id: p2.userId,
      mode: 'wheel',
      challenger_score: p1.roundWins,
      opponent_score: p2.roundWins,
      winner_id: matchWinner === 'draw' ? null : matchWinner,
      status: 'completed',
      created_at: new Date(room.startedAt).toISOString(),
    }).onConflict('id').ignore().catch(() => {});
  }

  io.to(room.duelId).emit('duel_match_result', {
    winnerId: matchWinner,
    roundWins: [w1, w2],
    coinsWon: matchWinner !== 'draw' ? prize : 0,
    stake: room.stake,
  });

  rooms.delete(room.duelId);
}
