import express from 'express';
import responseFormatter from './middlewares/responseFormatter';
import helmet from 'helmet';
import xss from 'xss-clean';
import compression from 'compression';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import httpStatus from 'http-status';
import { postgres } from './config/postgres';
import config from './config/config';
import morgan from './config/morgan';
import jwt from './config/jwt';
import { authLimiter } from './middlewares/rateLimiter';
import routes from './routes/v1';
import { errorConverter, errorHandler } from './middlewares/error';
import ApiError from './utils/ApiError';
import { validateRoles } from './middlewares/validateRoles';
import { disabledPastHappenings, sendRedemptionInvoices, sendScheduledNotification } from './utils/cron';
import redisClient from './config/redis';
import db from './db/models';
import stripe from './config/stripe';
import dayjs from 'dayjs';
import dotenv from 'dotenv';

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
