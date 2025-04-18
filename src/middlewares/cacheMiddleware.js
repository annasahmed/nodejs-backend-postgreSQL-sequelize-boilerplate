// middlewares/cacheMiddleware.js
import redisClient from '../config/redis';

// Middleware to check cache
const checkCache = async (req, res, next) => {
  const cacheKey = req.originalUrl;  // Using the request URL as the key

  try {
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log('Data retrieved from cache');
      return res.status(200).json(JSON.parse(cachedData));
    }

    next();  // If no cached data, proceed to the next middleware or route handler
  } catch (error) {
    console.error('Error fetching from cache:', error);
    next();
  }
};

// Middleware to cache data after the request is completed
const cacheResponse = (req, res, next) => {
  const cacheKey = req.originalUrl;

  res.sendResponse = res.send;
  res.send = (body) => {
    // Cache the response body for future requests
    redisClient.setEx(cacheKey, 3600, body); // Cache for 1 hour
    res.sendResponse(body);  // Send the original response
  };

  next();
};

export default { checkCache, cacheResponse };
