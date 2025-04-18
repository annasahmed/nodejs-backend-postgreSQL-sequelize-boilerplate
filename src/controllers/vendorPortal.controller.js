import catchAsync from '../utils/catchAsync';
import {
	authService,
	userService,
	emailService,
	tokenService,
	otpService,
	adminappUserService,
	vendorService,
	adminVendorService,
} from '../services'
import { verifyToken, decryptData } from '../utils/auth.js';
import ApiError from '../utils/ApiError.js';
import { compare } from 'bcrypt';
import httpStatus from 'http-status';
import { vendorPortalService } from '../services/Admin/index.js';
import db from '../db/models/index.js';

const sendOtp = catchAsync(async (req, res) => {
	const { email } = req.body;
	await otpService.verifyEmail(email);
	res.status(httpStatus.CREATED).send({ message: 'OTP sent by email' });
});
async function loginUserWithEmailAndPassword(req) {
	const { username, password } = req.body;
	const vendor = await vendorService.getVendorByUsername(username);
	if (!vendor) {
		console.log('Vendor not found');
		throw new ApiError(
			httpStatus.UNAUTHORIZED,
			'Invalid username or password',
		);
	}

	const isPasswordMatch = await compare(password, vendor.password);

	if (!isPasswordMatch) {
		console.log('Password not match');
		throw new ApiError(
			httpStatus.UNAUTHORIZED,
			'Invalid username or password',
		);
	}

	if (!vendor.is_logged) {
		await db.vendors.update(
			{
				is_logged: true,
			},
			{
				where: {
					id: vendor.id,
				},
			},
		);
	}

	delete vendor.password;

	return vendor;
}

const login = catchAsync(async (req, res) => {
	const vendor = await loginUserWithEmailAndPassword(req);
	const tokens = await tokenService.generateAuthTokens({
		userId: vendor.id,
	});

	res.send({ vendor, tokens });
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

const getContract = catchAsync(async (req, res) => {
	const { vendorId } = req.params;
	if (!vendorId) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Id is required');
	}
	const vendor = await vendorService.getContract(vendorId);
	res.send({ vendor });
});
const signContract = catchAsync(async (req, res) => {
	const { vendorId } = req.params;
	if (!vendorId) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Id is required');
	}
	const vendor = await vendorService.signContract(req);
	await adminVendorService.sendOnboardingEmailVendor(vendorId);
	res.send({ vendor });
});
const getVendorById = catchAsync(async (req, res) => {
	const vendor = await vendorService.getVendorById(req.params.vendorId, req);
	res.send({ place: vendor });
});
const updatePasswordVendor = catchAsync(async (req, res) => {
	await adminVendorService.setPasswordVendor(req);
	res.send({
		status: true,
		message: 'Password Updated Successfully',
	});
});
const sendResetPasswordEmail = catchAsync(async (req, res) => {
	await adminVendorService.sendResetPasswordEmail(req);
	res.send({
		status: true,
		message: 'Reset Password Email Sent',
	});
});
const getInvoicesByVendor = catchAsync(async (req, res) => {
	const invoices = await vendorPortalService.getInvoicesByVendor(req);
	res.send({
		status: true,
		invoices,
	});
});
const getRedemptionsByVendor = catchAsync(async (req, res) => {
	const invoices = await vendorPortalService.getRedemptionsByVendor(req);
	res.send({
		status: true,
		invoices,
	});
});
const getTotalRedemptionAmountByVendor = catchAsync(async (req, res) => {
	const invoices =
		await vendorPortalService.getTotalRedemptionAmountByVendor(req);
	res.send({
		status: true,
		invoices,
	});
});
const getTotalUnpaidInvoicesByVendor = catchAsync(async (req, res) => {
	const invoices =
		await vendorPortalService.getTotalUnpaidInvoicesByVendor(req);
	res.send({
		status: true,
		invoices,
	});
});

export default {
	login,
	forgotPassword,
	resetPassword,
	sendOtp,
	changePassword,
	verifyOtp,
	getContract,
	signContract,
	getVendorById,
	updatePasswordVendor,
	sendResetPasswordEmail,
	getInvoicesByVendor,
	getRedemptionsByVendor,
	getTotalRedemptionAmountByVendor,
	getTotalUnpaidInvoicesByVendor,
};
