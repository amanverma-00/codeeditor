const redisClient = require('../config/redis');

/**
 * Rate limiter factory function
 * @param {number} maxRequests - Maximum number of requests allowed
 * @param {number} windowSeconds - Time window in seconds
 * @returns {Function} Express middleware function
 */
const rateLimiter = (maxRequests = 10, windowSeconds = 60) => {
  return async (req, res, next) => {
    const userId = req.result._id.toString();
    const redisKey = `rate_limit:${userId}:${req.baseUrl}${req.path}`;

    try {
      // Check if Redis is connected
      if (!redisClient.isOpen) {
        console.warn('⚠️ Redis not connected, rate limiting disabled');
        return next();
      }

      // Get current request count
      const currentCount = await redisClient.get(redisKey);
      
      if (currentCount && parseInt(currentCount) >= maxRequests) {
        return res.status(429).json({
          message: `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowSeconds} seconds`,
          retryAfter: windowSeconds
        });
      }

      // Increment or initialize counter
      if (currentCount) {
        await redisClient.incr(redisKey);
      } else {
        await redisClient.set(redisKey, '1', {
          EX: windowSeconds
        });
      }

      next();
    } catch (err) {
      console.error('Rate limiter error:', err);
      // Fail open - allow request if Redis is down
      next();
    }
  };
};

module.exports = rateLimiter;

