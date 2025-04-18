import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 250,
	skipSuccessfulRequests: true,
});

export default {
	authLimiter,
};
