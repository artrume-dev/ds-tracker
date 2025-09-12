// Mock Redis client for development
let redisClient: any = null;

export async function initializeRedis() {
  try {
    // Mock Redis connection
    redisClient = {
      connect: async () => console.log('📢 Mock Redis connected'),
      quit: async () => console.log('📢 Mock Redis disconnected'),
      on: (event: string, callback: (err?: Error) => void) => {
        if (event === 'connect') {
          setTimeout(callback, 100);
        }
      }
    };

    await redisClient.connect();
    console.log('📢 Redis connected successfully');
    return redisClient;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    console.log('📝 Note: Using mock Redis for development');
    return null;
  }
}

export function getRedisClient() {
  return redisClient;
}

export async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
    console.log('📢 Redis connection closed');
  }
}
