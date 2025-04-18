import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import httpStatus from 'http-status';
import xss from 'xss-clean';
import config from './config/config.js';
import jwt from './config/jwt.js';
import morgan from './config/morgan.js';
import { postgres } from './config/postgres.js';
import redisClient from './config/redis.js';
import { errorConverter, errorHandler } from './middlewares/error.js';
import { authLimiter } from './middlewares/rateLimiter.js';
import responseFormatter from './middlewares/responseFormatter.js';
import routes from './routes/v1/index.js';
import ApiError from './utils/ApiError.js';
import { disabledPastHappenings, sendRedemptionInvoices, sendScheduledNotification } from './utils/cron.js';

dotenv.config();
const app = express();

if (config.env !== 'test') {
	app.use(morgan.successHandler);
	app.use(morgan.errorHandler);
}
// set security HTTP headers
app.use(helmet());

// parse json request bod
app.use((req, res, next) => {
	if (req.originalUrl.includes('stripe')) {
		next();
	} else {
		express.json()(req, res, next);
	}
});

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

app.use(cookieParser());

// jwt authentication
app.use(jwt());

// connect to postgres database
app.use((req, _, next) => {
	req.postgres = postgres;
	next();
});

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
	app.use('/v1/auth', authLimiter);
}

// app.use(validateRoles());
// app.use(async (req, res, next) => {
// await validateRoles(req, res, next)
// })

app.use((req, _, next) => {
	req.redisClient = redisClient;
	next();
});

app.get('/v1/health-check', (req, res) => {
	res.send('server is running');
});

app.get('/v1/test/purge-cache', async (req, res) => {
	try {
		await redisClient.flushAll();
		res.status(200).send('Cache purged successfully');
	} catch (error) {
		console.error('Error purging cache:', error);
		res.status(500).send('Error purging cache');
	}
});

// v1 api routes
app.use('/v1', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
	next(new ApiError(httpStatus.NOT_FOUND, 'Route Not found'));
});


app.use(responseFormatter);

// convert error to ApiError, if needed
app.use(errorConverter);

// // handle error
app.use(errorHandler);

// Cron jobs
disabledPastHappenings.start();
sendRedemptionInvoices.start();
sendScheduledNotification.start();

export default app;
