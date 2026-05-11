import { Server, Socket } from "socket.io";
import db from "../database";
import { v4 as uuidv4 } from "uuid";

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

  socket.on("duel_invite", async ({ duelId, mode }: { duelId: string; mode: string }) => {
    try {
      const duel = await db("duels").where("id", duelId).first();
      if (!duel) return socket.emit("duel_error", { message: "Düello bulunamadı." });
      const opponentId = duel.challenger_id === userId ? duel.opponent_id : duel.challenger_id;
      io.to(opponentId).emit("duel_invited", { challengerId: userId, mode, duelId });
    } catch { socket.emit("duel_error", { message: "Düello daveti gönderilemedi." }); }
  });

  socket.on("duel_accept", async ({ duelId }: { duelId: string }) => {
    try {
      const duel = await db("duels").where("id", duelId).first();
      if (!duel) return;
      activeduels.set(duelId, { duelId, mode: duel.mode, challengerId: duel.challenger_id, opponentId: duel.opponent_id });
      await db("duels").where("id", duelId).update({ status: "active" });
      io.to(duel.challenger_id).emit("duel_started", { duelId, mode: duel.mode });
      io.to(duel.opponent_id).emit("duel_started", { duelId, mode: duel.mode });
    } catch {}
  });

  socket.on("duel_reject", async ({ duelId }: { duelId: string }) => {
    try {
      const duel = await db("duels").where("id", duelId).first();
      if (duel) io.to(duel.challenger_id).emit("duel_rejected", { opponentId: userId });
      await db("duels").where("id", duelId).update({ status: "rejected" });
    } catch {}
  });

  socket.on("duel_score", async ({ duelId, score }: { duelId: string; score: number }) => {
    const duel = activeduels.get(duelId);
    if (!duel) return;
    if (duel.challengerId === userId) duel.challengerScore = score;
    else duel.opponentScore = score;

    if (duel.challengerScore !== undefined && duel.opponentScore !== undefined) {
      const winnerId = duel.challengerScore >= duel.opponentScore ? duel.challengerId : duel.opponentId;
      const result = { duelId, challengerScore: duel.challengerScore, opponentScore: duel.opponentScore, winnerId };
      io.to(duel.challengerId).emit("duel_result", result);
      io.to(duel.opponentId).emit("duel_result", result);
      await db("duels").where("id", duelId).update({
        challenger_score: duel.challengerScore,
        opponent_score: duel.opponentScore,
        status: "completed",
      });
      activeduels.delete(duelId);
    }
  });
}