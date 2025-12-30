const { createClient } = require('redis');
const path = require('path');
require('dotenv').config(); // ✅ FIXED: Added parentheses

// Configuration from environment variables
const REDIS_HOST = process.env.REDIS_HOST || 'redis-17546.c11.us-east-1-3.ec2.redns.redis-cloud.com';
const REDIS_PORT = process.env.REDIS_PORT || 17546;
const REDIS_PASSWORD = process.env.REDIS_PASS;

if (!REDIS_PASSWORD) {
    console.warn('⚠️  Redis password not found - Redis features will be disabled');
    // Don't exit - allow server to run without Redis
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