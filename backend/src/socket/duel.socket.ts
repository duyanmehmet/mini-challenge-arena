import { Server, Socket } from 'socket.io';
import { pool } from '../db';

interface ActiveDuel {
  duelId: string;
  mode: string;
  challengerId: string;
  opponentId: string;
  challengerScore?: number;
  opponentScore?: number;
}

const activeduels = new Map<string, ActiveDuel>();

export function handleDuelEvents(io: Server, socket: Socket, userId: string): void {

  // Düello daveti gönder
  socket.on('duel_invite', async ({ duelId, mode }: { duelId: string; mode: string }) => {
    try {
      const duelRes = await pool.query('SELECT * FROM duels WHERE id = $1', [duelId]);
      const duel = duelRes.rows[0];
      if (!duel) return socket.emit('duel_error', { message: 'Düello bulunamadı.' });

      const opponentId = duel.challenger_id === userId ? duel.opponent_id : duel.challenger_id;

      // Rakibin odasına bildirim gönder (socket room = userId)
      io.to(opponentId).emit('duel_invited', { challengerId: userId, mode, duelId });
    } catch (err) {
      socket.emit('duel_error', { message: 'Düello daveti gönderilemedi.' });
    }
  });

  // Kabul
  socket.on('duel_accept', async ({ duelId }: { duelId: string }) => {
    try {
      const duelRes = await pool.query('SELECT * FROM duels WHERE id = $1', [duelId]);
      const duel = duelRes.rows[0];
      if (!duel) return;

      const active: ActiveDuel = {
        duelId,
        mode: duel.mode,
        challengerId: duel.challenger_id,
        opponentId: duel.opponent_id,
      };
      activeduels.set(duelId, active);

      await pool.query(`UPDATE duels SET status = 'active' WHERE id = $1`, [duelId]);

      // Her iki oyuncuya da başlatma eventi gönder
      io.to(duel.challenger_id).emit('duel_started', { duelId, mode: duel.mode });
      io.to(duel.opponent_id).emit('duel_started', { duelId, mode: duel.mode });
    } catch {}
  });

  // Reddet
  socket.on('duel_reject', async ({ duelId }: { duelId: string }) => {
    try {
      const duelRes = await pool.query('SELECT challenger_id FROM duels WHERE id = $1', [duelId]);
      if (duelRes.rows[0]) {
        io.to(duelRes.rows[0].challenger_id).emit('duel_rejected', { opponentId: userId });
      }
      await pool.query(`UPDATE duels SET status = 'rejected' WHERE id = $1`, [duelId]);
    } catch {}
  });

  // Skor bildirimi
  socket.on('duel_score', async ({ duelId, score }: { duelId: string; score: number }) => {
    const duel = activeduels.get(duelId);
    if (!duel) return;

    if (duel.challengerId === userId) duel.challengerScore = score;
    else duel.opponentScore = score;

    if (duel.challengerScore !== undefined && duel.opponentScore !== undefined) {
      const winnerId = duel.challengerScore >= duel.opponentScore
        ? duel.challengerId : duel.opponentId;

      const result = {
        duelId,
        challengerScore: duel.challengerScore,
        opponentScore: duel.opponentScore,
        winnerId,
      };

      io.to(duel.challengerId).emit('duel_result', result);
      io.to(duel.opponentId).emit('duel_result', result);

      await pool.query(
        `UPDATE duels SET challenger_score=$1, opponent_score=$2, status='completed', completed_at=NOW() WHERE id=$3`,
        [duel.challengerScore, duel.opponentScore, duelId]
      );

      activeduels.delete(duelId);
    }
  });
}
