import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import db from '../database';

export function handleClanEvents(io: Server, socket: Socket, userId: string): void {

  // Kullanıcı klanının socket odasına katılır
  socket.on('clan_join_room', async ({ clanId }: { clanId: string }) => {
    socket.join(`clan:${clanId}`);
  });

  socket.on('clan_leave_room', ({ clanId }: { clanId: string }) => {
    socket.leave(`clan:${clanId}`);
  });

  // Mesaj gönder
  socket.on('clan_message', async ({ clanId, message }: { clanId: string; message: string }) => {
    if (!message?.trim() || message.length > 300) return;

    // Kullanıcının bu klana üye olduğunu doğrula
    const user = await db('users').where({ id: userId, clan_id: clanId }).select('username').first().catch(() => null);
    if (!user) return;

    const id = uuidv4();
    const created_at = new Date().toISOString();
    await db('clan_messages').insert({ id, clan_id: clanId, user_id: userId, username: user.username, message: message.trim(), created_at }).catch(() => {});

    io.to(`clan:${clanId}`).emit('clan_new_message', {
      id,
      user_id: userId,
      username: user.username,
      message: message.trim(),
      created_at,
    });
  });
}
