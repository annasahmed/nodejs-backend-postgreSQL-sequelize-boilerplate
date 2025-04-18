// const welcomeEmailFormat = async (to, firstName) => {
// 	const subject = "Welcome to Dubai Daily Deal - We're Glad You're Here!";

// 	const text = `Hi ${firstName},
// 	<br/>
// 	<br/>
// 	Welcome to Dubai Daily Deal - your one-stop app for discovering the best lifestyle activities and in-house F&B deals in and around Dubai.
// 	<br/>
// 	<br/>
// 	We're thrilled to have you on board and can't wait for you to start exploring the amazing deals we have in store for you. Our app is the ultimate FREE companion for seamlessly searching and filtering all lifestyle activities and in-house F&B offerings. Explore Dubai's culinary scene, from breakfast, lunch, dinner, and brunch, to irresistible happy hours and ladies' nights. Immerse yourself in a variety of lifestyle choices, including pool days, spa experiences, gym sessions, salon pampering, engaging activities, and staycations.
// 	<br/>
// 	<br/>
// 	Here's how to get started:
// 	<br/>
// 	<b>Browse Deals:</b> Open the app and discover a wide range of exclusive offers tailored just for you.
// 	<br/>
// 	<b>Save Favorites:</b> Found a deal you love? Tap the heart icon to save it to your favorites.
// 	<br/>
// 	<b>Redeem Offers:</b> Simply present the deal on your mobile app at the participating location to enjoy your discount.
// 	<br/>
// 	<b>Stay Updated:</b> Keep an eye on our app for daily updates and new deals.
// 	<br/>
// 	<br/>

// 	Need Help?
// 	<br/>
// 	If you have any questions or need assistance, our support team is here to help. Feel free to reply to this email or reach out to us through the app's support section.
// 	<br/>
// 	<br/>

// 	Thank you for joining the Dubai Daily Deal. We hope you enjoy the savings and experiences that await you!
// 	<br/>
// 	<br/>
// 	<br/>

// Best regards,
// <br/>
// Dubai Daily Deal
// <br/>
// <img src="https://dev-cms.dubaidailydeals.app/complete-logo.png" width="120px" style="margin-top:10px;"}}/>
// `;

// 	await sendEmail(to, subject, text);
// };
// /**
//  * Send reset password email
//  * @param {string} to
//  * @param {string} OTP
//  * @returns {Promise}
//  */
// const sendOTPEmailVerification = async (to, OTP) => {
// 	const subject = 'Verify Your Email with One-Time 6-Digit PIN';

// 	const text = `Hi User,
// <br/>
// <br/>
// We hope this email finds you well.
// <br/>
// <br/>
// To verify your email, please use the following one-time 6-digit PIN: <b>${OTP}</b>.
// <br/>
// <br/>
// <br/>
// Best regards,
// <br/>
// Dubai Daily Deal
// <br/>
// <img src="https://dev-cms.dubaidailydeals.app/complete-logo.png" width="120px" style="margin-top:10px;"}}/>`;

// 	await sendEmail(to, subject, text);
// };
// /**
//  * Send reset password email
//  * @param {string} to
//  * @param {string} token
//  * @returns {Promise}
//  */
// const sendForgotPasswordEmail = async (to, OTP, firstName) => {
// 	const subject = 'Password Reset Request';
// 	// replace this url with the link to the reset password page of your front-end app
// 	const text = `Hi ${firstName},
// 	<br/>
// 	<br/>
// We received a request to reset the password for your account associated with this email address. If you made this request, please use the following one-time 6-digit PIN: <b>${OTP}</b>
// <br/>
// <br/>
// This will expire in 5 mins. If you didn't request a password reset, you can ignore this email. Your password will remain unchanged.
// <br/>
// <br/>
// <br/>
// Best regards,
// <br/>
// Dubai Daily Deal
// <br/>
// <img src="https://dev-cms.dubaidailydeals.app/complete-logo.png" width="120px" style="margin-top:10px;"}}/>
// `;
// 	await sendEmail(to, subject, text);
// };

// const sendInvoiceEmail = async (to, invoiceUrl, data) => {
// 	const subject = `${data.title} Payment Link for the - Dubai Daily Deals`;

// 	const text = `Hi Partner,
// 	<br/>
// 	<br/>
// 	Thank you for partnering with Dubai Daily Deals. We have successfully added the details for ${data.title} to our system according to our contract.
// 	This one-year subscription begins on ${data.startDate}.
// 	<br/>
// 	<br/>
// Kindly proceed with the payment using the link provided below:
//  <br/>
//  	<br/>
//     <a href="${invoiceUrl}">
//     <button style="padding: 8px;
//   font-size: 14px;
//   background: #0696fe;
//   color: white;
//   border-color: #0696fe;">
//   Payment Link
// </button>
// </a>
//  	<br/>
//  	<br/>
//     We are excited about the prospect of working together and anticipate a successful collaboration.
//  	<br/>
// 	<br/>
// 	<br/>

// Best regards,
// <br/>
// Dubai Daily Deal
// <br/>
// <img src="https://dev-cms.dubaidailydeals.app/complete-logo.png" width="120px" style="margin-top:10px;"}}/>
// `;

// 	await sendEmail(to, subject, text);
// };

// export default {

// 	sendForgotPasswordEmail,
// 	sendInvoiceEmail,
// 	sendOTPEmailVerification,
// };

import httpStatus from 'http-status'
const { getOffset } = require('../../../utils/query');
const ApiError = require('../../../utils/ApiError');
const { encryptData } = require('../../../utils/auth').default;
const config = require('../../../config/config.js');
const db = require('../../../db/models').default;
const userService = require('../../user.service');
const { refactorCode } = require('../../../utils/globals.js');

async function getEmailByName(name) {
	const emailFormat = await db.email_format.findOne({
		where: { name },
	});

	return emailFormat;
}
// async function getCuisineById(id) {
// 	const cuisine = await db.email_format.findOne({
// 		where: { id },
// 		include: [
// 			{
// 				model: db.user,
// 				require: true,
// 				attributes: ['id', 'first_name', 'last_name'],
// 			},
// 		],
// 		attributes: [
// 			'id',
// 			'title',
// 			'status',
// 			'created_date_time',
// 			'modified_date_time',
// 		],
// 	});
// 	refactorCode(cuisine, [
// 		{
// 			title: 'user',
// 			items: ['id', 'first_name', 'last_name'],
// 		},
// 	]);
// 	return cuisine;
// }
async function createEmailFormat(req) {
	let { name, subject, message } = req.body;
	const emailFormat = await getEmailByName(name);

	if (emailFormat) {
		throw new ApiError(
			httpStatus.CONFLICT,
			'This email format already exits',
		);
	}
	if (message) {
		message = req.body.message.replace(/&lt;/g, '<');
	}
	const createdEmailFormat = await db.email_format
		.create({
			name,
			subject,
			message,
		})
		.then((resultEntity) => resultEntity.get({ plain: true }));

	return createdEmailFormat;
}

async function getEmailFormats(req) {
	const emailFormats = await db.email_format.findAndCountAll({
		order: [['id', 'ASC']],
	});

	return emailFormats;
}

// async function deleteCuisineById(req) {
// 	const deletedCuisine = await db.email_format.destroy({
// 		where: { id: req.params.cuisineId || req.body.id },
// 	});

// 	if (!deletedCuisine) {
// 		throw new ApiError(httpStatus.NOT_FOUND, 'Cuisine not found');
// 	}

// 	return deletedCuisine;
// }

async function updateEmailFormats(req) {
	const { name, subject, message } = req.body;
	if (message) {
		req.body.message = req.body.message.replace(/&lt;/g, '<');
	}

	//console.log(req.body, 'req.body');

	const updatedEmailFormat = await db.email_format
		.update(
			{ ...req.body },
			{
				where: { id: req.params.emailFormatId || req.body.id },
				returning: true,
				plain: true,
				raw: true,
			},
		)
		.then((data) => data[1]);

	return updatedEmailFormat;
}

export default {
	createEmailFormat,
	updateEmailFormats,
	getEmailFormats,
};
