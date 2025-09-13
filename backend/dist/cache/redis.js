"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeRedis = initializeRedis;
exports.getRedisClient = getRedisClient;
exports.closeRedis = closeRedis;
// Mock Redis client for development
let redisClient = null;
async function initializeRedis() {
    try {
        // Mock Redis connection
        redisClient = {
            connect: async () => console.log('📢 Mock Redis connected'),
            quit: async () => console.log('📢 Mock Redis disconnected'),
            on: (event, callback) => {
                if (event === 'connect') {
                    setTimeout(callback, 100);
                }
            }
        };
        await redisClient.connect();
        console.log('📢 Redis connected successfully');
        return redisClient;
    }
    catch (error) {
        console.error('❌ Redis connection failed:', error);
        console.log('📝 Note: Using mock Redis for development');
        return null;
    }
}
function getRedisClient() {
    return redisClient;
}
async function closeRedis() {
    if (redisClient) {
        await redisClient.quit();
        console.log('📢 Redis connection closed');
    }
}
//# sourceMappingURL=redis.js.map