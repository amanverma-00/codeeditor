const { createClient } = require('redis');
const path = require('path');
require('dotenv').config(); // ✅ FIXED: Added parentheses

// Configuration from environment variables
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_PASSWORD = process.env.REDIS_PASS;

if (!REDIS_HOST || !REDIS_PORT || !REDIS_PASSWORD) {
    console.warn('⚠️  Redis configuration incomplete - Redis features will be disabled');
    console.warn('💡 Set REDIS_HOST, REDIS_PORT, and REDIS_PASS to enable Redis');
    // Export a mock client that won't crash the app
    module.exports = {
        isOpen: false,
        connect: async () => { console.log('⚠️  Redis disabled - skipping connection'); },
        quit: async () => {},
        get: async () => null,
        set: async () => null,
        del: async () => null,
    };
    return;
}

const redisConfig = {
    username: process.env.REDIS_USER || 'default',
    password: REDIS_PASSWORD ? REDIS_PASSWORD.trim() : undefined,
    socket: {
        host: REDIS_HOST,
        port: parseInt(REDIS_PORT),
        // Add connection timeout
        connectTimeout: 10000,
        reconnectStrategy: (retries) => {
            if (retries > 5) {
                console.error('❌ Redis max retries reached');
                return new Error('Redis connection failed after 5 retries');
            }
            return Math.min(retries * 100, 3000);
        }
    }
};

const redisClient = createClient(redisConfig);

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
    console.log('Redis Client Connected');
});

redisClient.on('ready', () => {
    console.log('Redis Client Ready');
});

redisClient.on('reconnecting', () => {
    console.log('Redis Client Reconnecting');
});

process.on('SIGINT', async () => {
    try {
        
        if (redisClient.isOpen) {
            await redisClient.quit();
            console.log('Redis connection closed through app termination');
        } else {
            console.log('Redis client was already closed');
        }
    } catch (err) {
        console.error('Error during Redis disconnect:', err);
    }
});

module.exports = redisClient;