import httpStatus from 'http-status'
const config = require('../config/config');
const logger = require('../config/logger');
import ApiError from '../utils/ApiError';

/**
 * Converts all errors to ApiError instance.
 * If error is not an instance of ApiError, it converts it.
 */
const errorConverter = (err, req, res, next) => {
	let error = err;

	// Convert to ApiError instance if not already
	if (!(error instanceof ApiError)) {
		const statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
		const message = error.message || httpStatus[statusCode] || 'Internal Server Error';
		error = new ApiError(statusCode, message, false, err.stack, err.errors);
	}

	// Pass the error to the next middleware
	next(error);
};

export default errorConverter;

/**
 * Error handling middleware that sends the formatted response.
 * @param {Object} err - The error object
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
const errorHandler = (err, req, res, next) => {
	let { statusCode, message } = err;

	// In production, we don't want to expose stack trace for non-operational errors
	if (config.env === 'production' && !err.isOperational) {
		statusCode = httpStatus.INTERNAL_SERVER_ERROR;
		message = httpStatus[statusCode];
	}

	// Prepare the response body in the desired format
	const response = {
		code: statusCode,
		message,
		error: statusCode >= 400 ? message : null, // Only include 'error' field if status code is 4xx or 5xx
		data: statusCode >= 200 && statusCode < 300 ? err : null, // Only include 'data' field if status code is 2xx
		...(config.env !== 'production' && { stack: err.stack }), // Include stack trace in non-production environments
	};

	// Log the error details
	if (config.env !== 'production' || !err.isOperational) {
		logger.error(err);  // Log full error stack for debugging purposes
	}

	// Send the formatted response
	res.status(statusCode).send(response);
};

export { errorHandler, errorConverter }
