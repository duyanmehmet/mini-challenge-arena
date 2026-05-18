import type { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { handleDuelEvents } from "./socket/duel.socket";

export function setupSocket(io: Server): void {
  // JWT doğrulama
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

    // Kullanıcıyı kendi odasına al (arkadaş davetleri için)
    socket.join(userId);

    // Düello + çark + matchmaking + coin sistemi
    handleDuelEvents(io, socket, userId);
  });
}
