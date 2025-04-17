// const express = require('express');
import express from 'express';
const helmet = require('helmet');
const xss = require('xss-clean');
const compression = require('compression');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const httpStatus = require('http-status');
const { postgres } = require('./config/postgres');
const config = require('./config/config');
const morgan = require('./config/morgan');
const jwt = require('./config/jwt');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const { validateRoles } = require('./middlewares/validateRoles');
const {
	disabledPastHappenings,
	disabledPastDeals,
	sendRedemptionInvoices,
	sendScheduledNotification,
} = require('./utils/cron'); // Adjust the path to your cron file
const redisClient = require('./config/redis');
const db = require('./db/models').default;
const { Op } = require('sequelize');
const stripe = require('./config/stripe');
const dayjs = require('dayjs');
require('dotenv').config();
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

// convert error to ApiError, if needed
app.use(errorConverter);

// // handle error
app.use(errorHandler);

// Cron jobs
disabledPastHappenings.start();
sendRedemptionInvoices.start();
sendScheduledNotification.start();

module.exports = app;
