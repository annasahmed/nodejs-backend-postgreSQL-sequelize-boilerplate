import cron from 'node-cron';
import { Op } from 'sequelize';
import db from '../db/models/index.js';
import { getAppUserByEmail } from './appuser/admin/appuser.service.js';
import { sendForgotPasswordEmail, sendOTPEmailVerification } from './email.service.js';

// Schedule job to delete expired OTPs every minute
cron.schedule('* * * * *', async () => {
	await db.otp.destroy({
		where: {
			created_date_time: {
				[Op.lt]: new Date(Date.now() - 5 * 60 * 1000),
			},
		},
	});
	// //console.log('Deleted expired OTPs');
});

function generateOTP() {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

async function saveOtp(email, otp) {
	const savedOtp = await db.otp
		.create({
			email,
			otp,
		})
		.then((resultEntity) => resultEntity.get({ plain: true }));

	return savedOtp;
}
async function getOtpByEmail(email) {
	const otpData = await db.otp.findOne({
		where: { email },
		raw: true,
	});

	return otpData;
}

async function verifyEmail(email) {
	const existedUser = await getAppUserByEmail(email);

	if (existedUser) {
		throw new ApiError(httpStatus.CONFLICT, 'This email is already exist');
	}
	const otp = generateOTP();

	const data = await getOtpByEmail(email);
	if (data) {
		await db.otp.update({ otp }, { where: { email } });
	} else {
		const savedOtp = await saveOtp(email, otp);
	}

	// //console.log(saveOtp, "to, OTP");
	await sendOTPEmailVerification(email, otp);
}
async function sendOTPResetPassword(email, firstName) {
	const otp = generateOTP();
	const data = await getOtpByEmail(email);
	if (data) {
		await db.otp.update({ otp }, { where: { email } });
	} else {
		const savedOtp = await saveOtp(email, otp);
	}

	// //console.log(saveOtp, "to, OTP");
	await sendForgotPasswordEmail(email, otp, firstName);
}
async function verifyOTP(emailToVerify, otpToVerify) {
	const data = await getOtpByEmail(emailToVerify);
	let otp = '';
	let email = '';
	if (data) {
		otp = data.otp;
		email = data.email;
	}
	if (parseInt(otp) === parseInt(otpToVerify)) {
		await db.otp.destroy({
			where: {
				email,
			},
		});
		return data;
	} else {
		return false;
	}
}

export default {
	verifyEmail,
	sendOTPResetPassword,
	getOtpByEmail,
	verifyOTP,
};
