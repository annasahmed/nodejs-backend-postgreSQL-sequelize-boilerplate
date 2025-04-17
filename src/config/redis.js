const redis = require('redis');
const logger = require('./logger');

const redisClient = redis.createClient({
	url: process.env.REDIS_URL || 'redis://localhost:6379', // default URL for Redis
});

redisClient.connect().catch((err) => {
	console.error('Redis connection error:', err);
});

redisClient.on('connect', () => {
	logger.info('Connected to Redis');
});

module.exports = redisClient;
