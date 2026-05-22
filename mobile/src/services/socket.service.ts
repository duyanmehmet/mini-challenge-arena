import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/v1', '') ?? 'http://192.168.1.103:3000';

class SocketService {
  private socket: Socket | null = null;
  private connecting = false;

  async connectAsync(): Promise<Socket | null> {
    // Zaten bağlıysa döndür
    if (this.socket?.connected) return this.socket;

    // Bağlantı devam ediyorsa bekle
    if (this.connecting) {
      return new Promise((resolve) => {
        const check = setInterval(() => {
          if (this.socket?.connected) {
            clearInterval(check);
            resolve(this.socket);
          } else if (!this.connecting) {
            clearInterval(check);
            resolve(this.socket);
          }
        }, 200);
        setTimeout(() => { clearInterval(check); resolve(this.socket); }, 8000);
      });
    }

    this.connecting = true;

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) { this.connecting = false; return null; }

      // Eski socket varsa kapat
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }

      this.socket = io(API_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 2000,
        timeout: 10000,
      });

      // Bağlantı tamamlanana kadar bekle
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Bağlantı zaman aşımı')), 8000);
        this.socket!.once('connect', () => {
          clearTimeout(timeout);
          resolve();
        });
        this.socket!.once('connect_error', (err) => {
          clearTimeout(timeout);
          reject(err);
        });
      });

      this.socket.on('connect_error', () => {});

      this.connecting = false;
      return this.socket;
    } catch (err: any) {
      console.warn('Socket bağlanamadı:', err.message);
      this.connecting = false;
      return null;
    }
  }

  // Eski sync API — geriye dönük uyumluluk
  connect(): Socket | null {
    this.connectAsync().catch(() => {});
    return this.socket;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.connecting = false;
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
