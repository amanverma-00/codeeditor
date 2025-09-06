const { createClient } = require('redis');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

if (!process.env.REDIS_PASS) {
    console.error('Redis password is not defined in environment variables');
    process.exit(1);
}

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS.trim(),
    socket: {
        host: 'redis-17546.c11.us-east-1-3.ec2.redns.redis-cloud.com',
        port: 17546
    }
});

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