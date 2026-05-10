import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

export const redis = createClient({ 
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 0) return false; // Sadece bir kez dene, sonra bırak
      return 1000;
    }
  }
});

redis.on('error', (err) => {
  // console.log('Redis is not available');
});

export async function connectRedis() {
  try {
    await redis.connect();
    console.log('Redis connected');
  } catch (err) {
    console.log('Redis connection failed, continuing without Redis.');
  }
}
