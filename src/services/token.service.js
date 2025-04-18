import httpStatus from 'http-status';
import config from '../config/config.js';
import userService from './user.service.js';
import ApiError from '../utils/ApiError.js';
import { generateToken, generateExpires } from '../utils/auth.js';

async function generateResetPasswordToken(email) {
	const user = await userService.getUserByEmail(email);
	if (!user || !user.id) {
		throw new ApiError(
			httpStatus.NOT_FOUND,
			'User not found with this email',
		);
	}

	const expiresMs = generateExpires(
		config.jwt.resetPasswordExpirationMinutes / 60,
	);
	const resetPasswordToken = generateToken({ id: user.id }, expiresMs);

	return resetPasswordToken;
}

async function generateAuthTokens({ userId, roleId = '' }) {
	const refreshTokenExpires = generateExpires(
		config.jwt.refreshExpirationDays * 24,
	);

	const refreshToken = generateToken({ userId }, refreshTokenExpires);

	const accessTokenExpires = generateExpires(
		config.jwt.accessExpirationMinutes / 60,
	);
	const accessToken = generateToken({ userId }, accessTokenExpires);

	return {
		refresh: {
			token: refreshToken,
			expires: refreshTokenExpires,
		},
		access: {
			token: accessToken,
			expires: accessTokenExpires,
		},
	};
}

export default {
	generateResetPasswordToken,
	generateAuthTokens,
};
