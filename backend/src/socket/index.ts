import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { handleDuelEvents } from './duel.socket';
import { handleClanEvents } from './clan.socket';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export const setupSocket = (io: Server) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      (socket as any).userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    console.log(`User connected to socket: ${userId}`);
    
    socket.join(userId);

    handleDuelEvents(io, socket, userId);
    handleClanEvents(io, socket, userId);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
    });
  });
};
