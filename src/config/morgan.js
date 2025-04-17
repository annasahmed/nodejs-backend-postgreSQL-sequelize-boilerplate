const morgan = require('morgan');
const config = require('./config');
const logger = require('./logger');
const { verifyToken } = require('../utils/auth');
const db = require('../db/models').default;
// const { userService } = require('../services');
// const { getUserById } = require('../services/user.service');

morgan.token('message', (_req, res) => res.locals.errorMessage || '');
morgan.token('req-body', (req) => {
	const bodyCopy = {
		...req.body,
	};
	if (bodyCopy.password) {
		bodyCopy.password = '';
	}
	return JSON.stringify(bodyCopy);
});

morgan.token('token', (req) => req.headers?.authorization);

const getIpFormat = () =>
	config.env === 'production' ? ':remote-addr - ' : 'development - ';

// const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`;
// const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms - message: :message`;

const successResponseFormat = `${getIpFormat()}:method - :url - :status - :response-time ms - req-body: :req-body - :token`;
const errorResponseFormat = `${getIpFormat()}:method - :url - :status - :response-time ms - req-body: :req-body - :token - message: :message`;

const successHandler = morgan(successResponseFormat, {
	skip: (req, res) => {
		if (
			res.statusCode <= 400 &&
			// req.headers.clientid === 'cms' &&
			req.method !== 'GET' &&
			req.headers.authorization
		) {
			return false;
		} else {
			return true;
		}
	},
	stream: {
		write: async (message) => {
			logger.info(message.trim());
			await saveLogToDatabase(message);
		},
	},
});

const errorHandler = morgan(errorResponseFormat, {
	skip: (req, res) => {
		if (
			res.statusCode > 400 &&
			// req.headers.clientid === 'cms' &&
			// req.method !== 'GET' &&
			req.headers.authorization
		) {
			return false;
		} else {
			return true;
		}
	},
	stream: {
		write: async (message) => {
			logger.error(message.trim());
			await saveLogToDatabase(message);
		},
	},
});

async function getUserById(id) {
	const user = await db.user.findOne({
		where: { id },
		raw: true,
	});
	return user;
}

const saveLogToDatabase = async (message, errorDetails) => {
	const logParts = message.trim().split(' - '); // Parse message to extract log details
	let userId;

	if (logParts[6] !== '-') {
		if (logParts[6].includes('Bearer ')) {
			userId = (await verifyToken(logParts[6].replace('Bearer ', '')))
				?.userId;
		} else {
			userId = (await verifyToken(logParts[6]))?.userId;
		}
	}
	if (userId) {
		const user = await getUserById(userId);
		if (!user) {
			userId = null;
		}
	}

	try {
		const obj = {
			user_id: userId,
			method: logParts[1], // method (e.g., GET, POST)
			end_point: logParts[2], // URL endpoint
			status_code: parseInt(logParts[3], 10) || 0, // HTTP status code
			message: logParts[7]?.replace('message: ', '') || '', // Error message (if any)
			ip_address: logParts[0], // Client IP
			request_body: logParts[5]
				? JSON.parse(logParts[5]?.replace('req-body: ', ''))
				: null,
		};
		await db.log.create({ ...obj });
		return true;
	} catch (error) {
		try {
			const obj = {
				method: logParts[1] || 'method not found', // method (e.g., GET, POST)
				end_point: logParts[2] || 'endpoint not found', // URL endpoint
				status_code: parseInt(logParts[3], 10) || 0, // HTTP status code
				message: `error in creating log ${error}`, // Error message (if any)
			};
			await db.log.create({ ...obj });
			return true;
		} catch (error) {
			logger.error('Failed to log to the database:', error);
		}
		logger.error('Failed to log to the database:', error);
	}
};
module.exports = {
	successHandler,
	errorHandler,
};
