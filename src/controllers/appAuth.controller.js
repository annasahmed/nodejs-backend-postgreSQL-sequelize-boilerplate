import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import {
	authService,
	userService,
	emailService,
	tokenService,
	otpService,
	adminappUserService,
} from '../services/index.js';
import { verifyToken, decryptData } from '../utils/auth.js';
import ApiError from '../utils/ApiError.js';

const sendOtp = catchAsync(async (req, res) => {
	const { email } = req.body;
	await otpService.verifyEmail(email);
	res.status(httpStatus.CREATED).send({ message: 'OTP sent by email' });
});

const appRegister = catchAsync(async (req, res) => {
	if (req.body.is_social) {
		const user = await userService.createAppUser(req);
		await emailService.sendWelcomeEmail(user.email, user.first_name);
		const tokens = await tokenService.generateAuthTokens({
			userId: user.id,
		});
		res.status(httpStatus.CREATED).send({ user, tokens });
		return;
	}
	const data = await otpService.verifyOTP(req.body.email, req.body.otp);
	if (data) {
		const user = await userService.createAppUser(req);
		await emailService.sendWelcomeEmail(user.email, user.first_name);
		const tokens = await tokenService.generateAuthTokens({
			userId: user.id,
		});
		delete user.password;
		res.status(httpStatus.CREATED).send({ user, tokens });
	} else {
		res.status(httpStatus.UNAUTHORIZED).send({ message: 'invalid OTP' });
	}
});

const login = catchAsync(async (req, res) => {
	const user = await authService.loginUserWithEmailAndPassword(req, false);
	const tokens = await tokenService.generateAuthTokens({
		userId: user.id,
	});
	res.send({ user, tokens });
});

// forgot password using OTP
const forgotPassword = catchAsync(async (req, res) => {
	const user = await adminappUserService.getAppUserByEmail(req.body.email);
	if (!user) {
		return res.status(400).send({ message: 'Invalid email' });
	}
	await otpService.sendOTPResetPassword(req.body.email, user.first_name);
	res.send({ success: true, message: 'OTP sent by email' });
});

// forgot password using rest-link
// const forgotPassword = catchAsync(async (req, res) => {
// 	const resetPasswordToken = await tokenService.generateResetPasswordToken(
// 		req.body.email,
// 	);
// 	await emailService.sendResetPasswordEmail(
// 		req.body.email,
// 		resetPasswordToken,
// 	);
// 	res.send({ success: true });
// });

const changePassword = catchAsync(async (req, res) => {
	if (req.body.password !== req.body.confirmPassword) {
		return res.status(400).send({ message: 'passwords do not match' });
	}
	const user = await adminappUserService.getAppUserByEmail(req.body.email);

	const isPasswordMatch = await decryptData(
		req.body.oldPassword,
		user.password,
	);

	if (!isPasswordMatch) {
		throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid password');
	}

	req.body = {
		password: req.body.password,
	};
	req.params.userId = user.id;
	await adminappUserService.updateAppUser(req);
	res.send({ success: true, message: 'Password update succesfully' });
});
const resetPassword = catchAsync(async (req, res) => {
	if (req.body.password !== req.body.confirmPassword) {
		return res.status(400).send({ message: 'passwords do not match' });
	}
	const user = await adminappUserService.getAppUserByEmail(req.body.email);
	req.body = {
		password: req.body.password,
	};
	req.params.userId = user.id;
	await adminappUserService.updateAppUser(req);
	res.send({ success: true });
});

const verifyOtp = catchAsync(async (req, res) => {
	const data = await otpService.verifyOTP(req.body.email, req.body.otp);
	if (data) {
		res.send({ success: true });
	} else {
		return res.status(400).send({ success: false, message: 'invalid OTP' });
	}
});
// const resetPassword = catchAsync(async (req, res) => {
// 	const { id } = await verifyToken(req.query.token);
// 	req.body.id = id;
// 	await userService.updateUser(req);
// 	res.send({ success: true });
// });

export default {
	appRegister,
	login,
	forgotPassword,
	resetPassword,
	sendOtp,
	changePassword,
	verifyOtp,
};
