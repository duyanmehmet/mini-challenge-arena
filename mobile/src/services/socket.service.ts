import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/v1', '') ?? 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket | null {
    if (this.socket?.connected) return this.socket;

    AsyncStorage.getItem('token').then((token) => {
      if (!token) return;
      this.socket = io(API_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 2000,
      });

      this.socket.on('connect', () => console.log('Socket bağlandı'));
      this.socket.on('disconnect', () => console.log('Socket koptu'));
      this.socket.on('connect_error', (err) => console.warn('Socket hatası:', err.message));
    });

    return this.socket;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  emit(event: string, data?: any) {
    this.socket?.emit(event, data);
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string) {
    this.socket?.off(event);
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
