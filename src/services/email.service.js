const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');
const aws = require('@aws-sdk/client-ses');
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status'
import db from '../db/models'
const jwt = require('jsonwebtoken');
const { accessKeyId, secretAccessKey, region } = config.s3Bucket;

const ses = new aws.SES({
	credentials: {
		accessKeyId,
		secretAccessKey,
	},
	region: 'me-south-1',
});

// create Nodemailer SES transporter
let transporter = nodemailer.createTransport({
	SES: { ses, aws },
});

if (config.env !== 'test') {
	transporter
		.verify()
		.then(() => logger.info('Connected to email server'))
		.catch((e) => {
			logger.warn(e);
			logger.warn(
				'Unable to connect to email server. Make sure you have configured the SMTP options in .env',
			);
		});
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @param tags
 * @param bcc
 * @param pdfPath
 * @param attachmentFilename
 * @returns {Promise}
 */
const sendEmail = async (
	to,
	subject,
	text,
	tags = [],
	bcc = [],
	pdfPath,
	attachmentFilename,
) => {
	console.log(tags, bcc, 'chkking bcc');
	const sesTags = {
		Tags: [
			...tags,
			{
				Name: 'email-to',
				Value: to,
			},
		],
	};
	const msg = {
		from: config.email.from,
		to,
		subject,
		bcc: bcc, // Add your BCC email address here
		html: text,
		ses: sesTags,
		attachments: pdfPath
			? [
				{
					filename: attachmentFilename || 'invoice.pdf',
					content: pdfPath,
					contentType: 'application/pdf',
				},
			]
			: [],
	};
	await transporter.sendMail(msg);
};

const replacePlaceholders = (
	str,
	{ firstName = '', lastName = '', placeName = '', OTP = '' },
) => {
	return str
		.replace(/{firstName}/g, firstName)
		.replace(/{lastName}/g, lastName)
		.replace(/{placeName}/g, placeName)
		.replace(/{OTP}/g, OTP);
};

const getEmailFormat = async (name, obj = {}) => {
	const emailFormat = await db.email_format.findOne({
		where: {
			name,
		},
		attributes: ['subject', 'message'],
	});
	if (!emailFormat) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Email format not found');
	}

	const subject = replacePlaceholders(emailFormat.subject, {
		firstName: obj.firstName || '',
		lastName: obj.lastName || '',
		placeName: obj.placeName || '',
		OTP: obj.OTP || '',
	});
	const text = replacePlaceholders(emailFormat.message, {
		firstName: obj.firstName || '',
		lastName: obj.lastName || '',
		placeName: obj.placeName || '',
		OTP: obj.OTP || '',
	});
	return { subject, text };
};

/**
 * Send reset password email
 * @param {string} to
 * @param firstName
 * @returns {Promise}
 */

const sendWelcomeEmail = async (to, firstName) => {
	// const { subject, text } = await getEmailFormat('User Welcome Email', {
	// 	firstName,
	// });
	const subject = "Welcome to Dubai Daily Deal - We're Glad You're Here!";
	const text1 = `Hi ${firstName},
		<br/>
		<br/>
		Welcome to Dubai Daily Deal - your one-stop app for discovering the best lifestyle activities and in-house F&B deals in and around Dubai.
		<br/>
		<br/>
		We're thrilled to have you on board and can't wait for you to start exploring the amazing deals we have in store for you. Our app is the ultimate FREE companion for seamlessly searching and filtering all lifestyle activities and in-house F&B offerings. Explore Dubai's culinary scene, from breakfast, lunch, dinner, and brunch, to irresistible happy hours and ladies' nights. Immerse yourself in a variety of lifestyle choices, including pool days, spa experiences, gym sessions, salon pampering, engaging activities, and staycations.
		<br/>
		<br/>
		Here's how to get started:
		<br/>
		<b>Browse Deals:</b> Open the app and discover a wide range of exclusive offers tailored just for you.
		<br/>
		<b>Save Favorites:</b> Found a deal you love? Tap the heart icon to save it to your favorites.
		<br/>
		<b>Redeem Offers:</b> Simply present the deal on your mobile app at the participating location to enjoy your discount.
		<br/>
		<b>Stay Updated:</b> Keep an eye on our app for daily updates and new deals.
		<br/>
		<br/>

		Need Help?
		<br/>
		If you have any questions or need assistance, our support team is here to help. Feel free to reply to this email or reach out to us through the app's support section.
		<br/>
		<br/>

		Thank you for joining the Dubai Daily Deal. We hope you enjoy the savings and experiences that await you!
		<br/>
		<br/>
		<br/>

	Best regards,
	<br/>
	Dubai Daily Deal
	<br/>
	<img src="https://cms.dubaidailydeals.app/complete-logo.png" width="120px" style="margin-top:10px;"}}/>
	`;
	await sendEmail(to, subject, text1);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} OTP
 * @returns {Promise}
 */
const sendOTPEmailVerification = async (to, OTP) => {
	// const { subject, text } = await getEmailFormat('OTP', {
	// 	OTP,
	// });
	// const emailFormat = await db.email_format.findOne({
	// 	where: {
	// 		name: 'OTP',
	// 	},
	// 	attributes: ['subject', 'message'],
	// });
	// const subject = replacePlaceholders(emailFormat.subject, { firstName });
	// const text = replacePlaceholders(emailFormat.message, { firstName });
	const subject1 = 'Verify Your Email with One-Time 6-Digit PIN';

	const text1 = `Hi User,
	<br/>
	<br/>
	We hope this email finds you well.
	<br/>
	<br/>
	To verify your email, please use the following one-time 6-digit PIN: <b>${OTP}</b>.
	<br/>
	<br/>
	<br/>
	Best regards,
	<br/>
	Dubai Daily Deal
	<br/>
	<img src="https://cms.dubaidailydeals.app/complete-logo.png" width="120px" style="margin-top:10px;"}}/>`;

	await sendEmail(to, subject1, text1);
};
/**
 * Send reset password email
 * @param {string} to
 * @param OTP
 * @param firstName
 * @returns {Promise}
 */
const sendForgotPasswordEmail = async (to, OTP, firstName) => {
	const subject = 'Password Reset Request';
	// replace this url with the link to the reset password page of your front-end app
	const text = `Hi ${firstName},
	<br/>
	<br/>
We received a request to reset the password for your account associated with this email address. If you made this request, please use the following one-time 6-digit PIN: <b>${OTP}</b>
<br/>
<br/>
This will expire in 5 mins. If you didn't request a password reset, you can ignore this email. Your password will remain unchanged.
<br/>
<br/>
<br/>
Best regards,
<br/>
Dubai Daily Deal
<br/>
<img src="https://cms.dubaidailydeals.app/complete-logo.png" width="120px" style="margin-top:10px;" alt="Dubai Daily Deals"/>
<br>
<br>
<small>
This email is a system generated email and does not require a response. If you have any questions or need assistance, please contact us at <a href="mailto:info@dubaidailydeals.app">info@dubaidailydeals.app</a>
</small>
`;
	await sendEmail(to, subject, text);
};
const handlebars = require('handlebars');
const puppeteer = require('puppeteer');
const {
	numberToWords,
	padNumber,
	capitalizeString,
} = require('../utils/globals');
import dayjs from 'dayjs'
const { invoiceHtml } = require('../htmlFormats/invoice/invoiceFormat');
const {
	redemptionInvoiceFormat,
} = require('../htmlFormats/redemptions/redemptionInvoiceFormat');
const { default: axios } = require('axios');
const buffer = require('node:buffer');
const { receiptFormat } = require('../htmlFormats/receipts/receiptFormat');
const { generateToken } = require('../utils/auth').default;

const attachInvoiceFormat = async ({
	invoiceNumber = '',
	amount = '',
	title = '',
	name = '',
	address = '',
	finalAmount,
	package,
	time = 'one',
	discount = '',
	discountAmount = '',
	date = '',
}) => {
	const html = invoiceHtml; // Replace with your actual invoice HTML template
	const template = handlebars.compile(html, { strict: true });
	const compiledHtml = template({
		invoiceNumber: padNumber(invoiceNumber),
		amount,
		date,
		title,
		name,
		address,
		finalAmount: finalAmount || amount,
		amountInWords: finalAmount
			? numberToWords(finalAmount)
			: numberToWords(amount),
		package: capitalizeString(package),
		time,
		discount,
		discountAmount,
	});

	// Launch a headless browser using Puppeteer with extra flags to suppress UI
	const browser = await puppeteer.launch({
		headless: 'new', // Headless mode; use 'new' if Puppeteer is v19.2.0 or later
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-gpu',
			'--disable-web-security',
			'--no-first-run',
			'--no-zygote',
			'--disable-dev-shm-usage',
			'--disable-extensions',
			'--disable-background-networking',
			'--disable-sync',
			'--disable-translate',
			'--disable-infobars', // Disable the infobar that might trigger the splash screen
			'--disable-features=site-per-process',
			'--hide-scrollbars', // Hide scrollbars (just in case)
			'--mute-audio', // No audio output to reduce chance of UI appearance
			'--disable-software-rasterizer', // Prevent unnecessary GPU usage
		],
	});

	const page = await browser.newPage();

	// Set the page content to the compiled HTML
	await page.setContent(compiledHtml, { timeout: 0 });
	await page.emulateMediaType('print');

	// Generate the PDF file
	const pdfBuffer = await page.pdf({
		format: 'A4',
		preferCSSPageSize: true,
		printBackground: true,
	});

	await page.close();
	await browser.close();

	// Return the PDF buffer
	return pdfBuffer;
};
const attachRedemptionInvoiceFormat = async (vendor, records, invoice) => {
	const html = redemptionInvoiceFormat(vendor, records, {
		invoiceNumber: invoice.id,
		invoiceDate: invoice.created_date_time,
	}); // Replace with your actual invoice HTML template

	const template = handlebars.compile(html, { strict: true });
	const compiledHtml = template({});

	// Launch a headless browser using Puppeteer with extra flags to suppress UI
	const browser = await puppeteer.launch({
		headless: 'new', // Headless mode; use 'new' if Puppeteer is v19.2.0 or later
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-gpu',
			'--disable-web-security',
			'--no-first-run',
			'--no-zygote',
			'--disable-dev-shm-usage',
			'--disable-extensions',
			'--disable-background-networking',
			'--disable-sync',
			'--disable-translate',
			'--disable-infobars', // Disable the infobar that might trigger the splash screen
			'--disable-features=site-per-process',
			'--hide-scrollbars', // Hide scrollbars (just in case)
			'--mute-audio', // No audio output to reduce chance of UI appearance
			'--disable-software-rasterizer', // Prevent unnecessary GPU usage
		],
	});

	const page = await browser.newPage();

	// Set the page content to the compiled HTML
	await page.setContent(compiledHtml, { timeout: 0 });
	await page.emulateMediaType('print');

	// Generate the PDF file
	const pdfBuffer = await page.pdf({
		format: 'A4',
		preferCSSPageSize: true,
		printBackground: true,
	});

	await page.close();
	await browser.close();

	// Return the PDF buffer
	return pdfBuffer;
};
const attachReceipt = async (vendor, records, invoice) => {
	const html = receiptFormat(vendor, records, invoice); // Replace with your actual invoice HTML template

	const template = handlebars.compile(html, { strict: true });
	const compiledHtml = template({});

	// Launch a headless browser using Puppeteer with extra flags to suppress UI
	const browser = await puppeteer.launch({
		headless: 'new', // Headless mode; use 'new' if Puppeteer is v19.2.0 or later
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-gpu',
			'--disable-web-security',
			'--no-first-run',
			'--no-zygote',
			'--disable-dev-shm-usage',
			'--disable-extensions',
			'--disable-background-networking',
			'--disable-sync',
			'--disable-translate',
			'--disable-infobars', // Disable the infobar that might trigger the splash screen
			'--disable-features=site-per-process',
			'--hide-scrollbars', // Hide scrollbars (just in case)
			'--mute-audio', // No audio output to reduce chance of UI appearance
			'--disable-software-rasterizer', // Prevent unnecessary GPU usage
		],
	});

	const page = await browser.newPage();

	// Set the page content to the compiled HTML
	await page.setContent(compiledHtml, { timeout: 0 });
	await page.emulateMediaType('print');

	// Generate the PDF file
	const pdfBuffer = await page.pdf({
		format: 'A4',
		preferCSSPageSize: true,
		printBackground: true,
	});

	await page.close();
	await browser.close();

	// Return the PDF buffer
	return pdfBuffer;
};

const attachContractFormat = async ({
	vendor_name = '',
	number_of_venues = 1,
	amount = 0,
	date_of_contract = '',
	html,
	image = '',
}) => {
	// const html = invoiceHtml; // Replace with your actual invoice HTML template
	const template = handlebars.compile(html, { strict: true });
	const compiledHtml = template({
		vendor_name,
		number_of_venues,
		amount,
		date_of_contract,
		image,
	});

	// Launch a headless browser using Puppeteer with extra flags to suppress UI
	const browser = await puppeteer.launch({
		headless: 'new', // Headless mode; use 'new' if Puppeteer is v19.2.0 or later
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-gpu',
			'--disable-web-security',
			'--no-first-run',
			'--no-zygote',
			'--disable-dev-shm-usage',
			'--disable-extensions',
			'--disable-background-networking',
			'--disable-sync',
			'--disable-translate',
			'--disable-infobars', // Disable the infobar that might trigger the splash screen
			'--disable-features=site-per-process',
			'--hide-scrollbars', // Hide scrollbars (just in case)
			'--mute-audio', // No audio output to reduce chance of UI appearance
			'--disable-software-rasterizer', // Prevent unnecessary GPU usage
			'--disable-background-timer-throttling',
			'--disable-backgrounding-occluded-windows',
			'--disable-renderer-backgrounding',
		],
	});

	const page = await browser.newPage();
	await page.setViewport({ width: 595, height: 842 });
	await page.evaluate(() => {
		document.body.style.background = 'transparent';
	});

	// Set the page content to the compiled HTML
	await page.setContent(compiledHtml, { timeout: 0 });
	await page.emulateMediaType('print');

	// Generate the PDF file
	const pdfBuffer = await page.pdf({
		format: 'A4',
		clip: { x: 0, y: 0, width: 595, height: 842 }, // Ensures single page only
		pageRanges: '1-2', // Limits to first page only
		printBackground: true,
	});

	await page.close();
	await browser.close();

	// Return the PDF buffer
	return pdfBuffer;
};

const sendInvoiceEmail = async (to, invoiceUrl, data) => {
	const pdfBuffer = await attachInvoiceFormat({
		invoiceNumber: data.invoiceNumber,
		amount: data.fee,
		title: data.title,
		package: data.package_name,
		date: data.startDate,
		address: data.address,
		name: data.name,
	});
	const subject = `${data.title} Payment Link for the - Dubai Daily Deals`;

	const text = `Hi Partner,
	<br/>
	<br/>
	Thank you for partnering with Dubai Daily Deals. We have successfully added the details for ${data.title} to our system according to our contract. 
	This one-year <b>${data.package_name}</b> subscription begins on ${data.startDate}.
	<br/>
	<br/>
Kindly proceed with the payment of amount <b>AED ${data.fee}</b> using one of below options:
 	<br/>
 	<br/>
	 If you would prefer to pay via bank transfer please make the payment the following account:
 	<br/>
	 
	 ACCOUNT NAME: D U DAILY DEALS
 	<br/>
	 BANK: WIO BANK
 	<br/>
	 ACCOUNT NUMBER: 9249120896
 	<br/>
	 IBAN: AE4 80860000009249120896
 	<br/>
BIC: WIOBAEADXXX
 <br/>
 	<br/>
    <a href="${invoiceUrl}">
    <button style="padding: 8px;
  font-size: 14px;
  background: #0696fe;
  color: white;
  border-color: #0696fe;">
  Payment Link
</button>
</a>
 	<br/>
 	<br/>
    We are excited about the prospect of working together and anticipate a successful collaboration.
 	<br/>
	<br/>
	<br/>
	
Best regards,
<br/>
Dubai Daily Deal
<br/>
<img src="https://cms.dubaidailydeals.app/complete-logo.png" width="120px" style="margin-top:10px;" alt="Dubai Daily Deals"/>
<br>
<br>
<small>
This email is a system generated email and does not require a response. If you have any questions or need assistance, please contact us at <a href="mailto:info@dubaidailydeals.app">info@dubaidailydeals.app</a>
</small>
`;

	await sendEmail(
		to,
		subject,
		text,
		[],
		['salmanazeemkhan@gmail.com'],
		pdfBuffer,
	);
};

const sendWelcomeEmailVendor = async (to, placeName, username, password) => {
	const token = jwt.sign({ username }, config.jwt.secret, {
		expiresIn: '1h',
	});

	const subject = "Welcome to Dubai Daily Deal - We're Glad You're Here!";

	const text = `Hi Partner,
	<br/>
	<br/>
	Thank you for collaborating with Dubai Daily Deals. The ${placeName}'s monthly app commission invoice and reports are now available for your review. You can access them through <a href="https://vendor.dubaidailydeals.app">https://vendor.dubaidailydeals.app<a>.
  <br/>
	<br/>
	Please use the following to access the portal` //   username: <b>${username}</b>
		//   <br/>
		//   password: <b>${password}</b>

		`	  <br/>
  <br/>
   <a href="${process.env.VENDOR_PORTAL_URL}/onboarding?token=${token}">
    <button style="padding: 8px;
  font-size: 14px;
  background: #0696fe;
  color: white;
  border-color: #0696fe;">
  Sign Up
</button>
</a>
<br/>
	<br/>
	
Best regards,
<br/>
Dubai Daily Deal
<br/>
<img src="https://cms.dubaidailydeals.app/complete-logo.png" width="120px" style="margin-top:10px;" alt="dubai daily deals"/>

<br>
<br>
<small>
This email is a system generated email and does not require a response. If you have any questions or need assistance, please contact us at <a href="mailto:info@dubaidailydeals.app">info@dubaidailydeals.app</a>
</small>
`;

	await sendEmail(to, subject, text);
};
const sendWelcomeEmailVendorWithOnbarding = async (
	to,
	vendorId,
	vendorName,
	vendorUsername,
	places = [],
) => {
	const token = jwt.sign({ vendorId }, config.jwt.secret, {
		expiresIn: '48h',
	});
	console.log(
		places
			?.map(
				(place) =>
					`<li><b>${place.title}</b>: ${place.place_pin || '-'}</li>`,
			)
			.join(''),
		'chkk conosle',
	);
	const subject = 'Welcome to Dubai Daily Deals – Vendor Portal Access';

	const text = `Dear ${vendorName},
	<br/>
	<br/>
	Thank you for collaborating with <b>Dubai Daily Deals!</b> We are excited to have you onboard and look forward to a successful partnership.
	<br/>
	<br/>
	As part of our collaboration, you will have access to important information regarding your venue, including:
	<br/>
	<br/>
	<ul>
	<li>
	Your venue's information
	</li>
	
	<li>
	Monthly app commission details
	</li>
	
	<li>
	Redemption information
	</li>
	
	<li>
	Invoices and reports
	</li>
	</ul>
	
	You can review all this data at your convenience through our secure portal:
<a href="${process.env.VENDOR_PORTAL_URL}/login">${process.env.VENDOR_PORTAL_URL}/login</a>

	<br/>
	<br/>
	Kindly note your listed place's pin number:
	<br/>  
<ul>  
    ${places
			?.map(
				(place) =>
					`<li><b>${place.title}</b>: ${place.place_pin || '-'}</li>`,
			)
			.join('')}
</ul>  
<br/>  
If you haven't logged in before, use the following to access the portal

  <br/>
  <br/>
  Username: <b>${vendorUsername}</b>
  <br/>
  <br/>
  <a href="${process.env.VENDOR_PORTAL_URL}/onboarding?token=${token}">
    <button style="padding: 8px;
  font-size: 14px;
  background: #0696fe;
  color: white;
  border-color: #0696fe;">
  Create a password
</button>
</a>
<br/>
<br/>
<small style='color:red;'>This link will expire in 48hrs</small>
	<br/>
	<br/>
	Should you need any assistance or have any questions, our team is here to help. Don’t hesitate to reach out to us at
	<a href="mailto:info@dubaidailydeals.com">info@dubaidailydeals.com</a>
	<br/>
	<br/>

	
Best regards,
<br/>
Dubai Daily Deal
<br/>
<img src="https://cms.dubaidailydeals.app/complete-logo.png" width="120px" style="margin-top:10px;" alt="dubai daily deals"/>

<br>
<br>
<small>
This email is a system generated email and does not require a response. If you have any questions or need assistance, please contact us at <a href="mailto:info@dubaidailydeals.app">info@dubaidailydeals.app</a>
</small>
`;
	// return;
	await sendEmail(
		to,
		subject,
		text,
		[],
		['salman@swipetech.studio', 'sarah@dubaidailydeals.app'],
	);
};
const resetPasswordVendorEmail = async (to, vendorId, vendorName) => {
	const token = jwt.sign({ vendorId }, config.jwt.secret, {
		expiresIn: '5m',
	});

	const subject = 'Password Reset Request';
	// replace this url with the link to the reset password page of your front-end app
	const text = `Hi ${vendorName},
	<br/>
	<br/>
We received a request to reset the password for your account associated with this email address. If you made this request, please use the following link to reset your password
<br/>
<br/>
<a href="${process.env.VENDOR_PORTAL_URL}/onboarding?token=${token}">${process.env.VENDOR_PORTAL_URL}/onboarding?token=${token}</a>

<br/>
<br/>
This will expire in 5 mins. If you didn't request a password reset, you can ignore this email. Your password will remain unchanged.
<br/>
<br/>
<br/>
Best regards,
<br/>
Dubai Daily Deal
<br/>
<img src="https://cms.dubaidailydeals.app/complete-logo.png" width="120px" style="margin-top:10px;" alt="Dubai Daily Deals"/>
<br>
<br>
<small>
This email is a system generated email and does not require a response. If you have any questions or need assistance, please contact us at <a href="mailto:info@dubaidailydeals.app">info@dubaidailydeals.app</a>
</small>`;

	await sendEmail(to, subject, text);
};
const sendContractEmail = async (vendor, contract) => {
	let pdfBuffer = undefined;
	try {
		const info = await db.info.findOne({
			where: {
				title: 'intro_pdf',
			},
			attributes: ['link'],
			raw: true,
		});
		if (info?.link) {
			const response = await axios.get(
				process.env.S3_BUCKET_URL + info.link,
				{
					responseType: 'arraybuffer',
				},
			);
			pdfBuffer = Buffer.from(response.data, 'binary');
		}
	} catch (error) {
		console.log('pdf file not found');
	}

	const token = btoa(
		JSON.stringify({
			vendor_id: vendor.id,
			expiry: dayjs().add(7, 'days').format('YYYY-MM-DD'),
			contract_id: contract.id,
			path: contract.contract_path,
		}),
	);
	const subject = "Welcome to Dubai Daily Deal - We're Glad You're Here!";
	const text = `Hi ${vendor.name},
	<br/>
	<br/>
	Thank you for partnering with Dubai Daily Deals. We have successfully added the details for ${vendor.name} to our system according to our contract. 
	Please find below link for the contract that you need to sign with us.
	<br/>
	<br/>
	
    <a href="${process.env.VENDOR_PORTAL_URL}/contract/sign/${token}">
    <button style="padding: 8px;
  font-size: 14px;
  background: #0696fe;
  color: white;
  border-color: #0696fe;">
  Contract
</button>
</a>
	<br/>
	<br/>
	Best regards,
	<br/>
	Dubai Daily Deal
	<br/>
	<img src="https://cms.dubaidailydeals.app/complete-logo.png" width="120px" style="margin-top:10px;" alt="dubai daily deals"/>
	
	<br>
	<br>
	<small>
	This email is a system generated email and does not require a response. If you have any questions or need assistance, please contact us at <a href="mailto:info@dubaidailydeals.app">info@dubaidailydeals.app</a>
	</small>`;
	await sendEmail(
		vendor.email,
		subject,
		text,
		[],
		['salman@swipetech.studio', 'sarah@dubaidailydeals.app'],
		pdfBuffer,
		'Dubai Daily Deals Introduction.pdf',
	);
};
const sendRedemptionInvoice = async (vendor, records, invoice) => {
	const pdfBuffer = await attachRedemptionInvoiceFormat(
		vendor,
		records,
		invoice,
	);
	const subject = `${vendor.name} Payment Link for the - Dubai Daily Deals`;

	const text = `Hi Partner,
	<br/>
	<br/>
	 Thank you for your continued support and collaboration with Dubai Daily Deals. 
	<br/>
	<p>
	Please find attached the invoice for the redemptions made by the customers on the Dubai Daily Deals app.
</p>
	<br/>
	 If you would prefer to pay via bank transfer please make the payment the following account:
 	<br/>
	 
	 ACCOUNT NAME: D U DAILY DEALS
 	<br/>
	 BANK: WIO BANK
 	<br/>
	 ACCOUNT NUMBER: 9249120896
 	<br/>
	 IBAN: AE4 80860000009249120896
 	<br/>
BIC: WIOBAEADXXX
 <br/>
 	<br/>
 	
    <a href="${invoice.hosted_invoice_url}">
    <button style="padding: 8px;
  font-size: 14px;
  background: #0696fe;
  color: white;
  border-color: #0696fe;">
  Payment Link
</button>
</a>
 	<br/>
 	<br/>
    We are excited about the prospect of working together and anticipate a successful collaboration.
 	<br/>
	<br/>
	<br/>
	
Best regards,
<br/>
Dubai Daily Deal
<br/>
<img src="https://cms.dubaidailydeals.app/complete-logo.png" width="120px" style="margin-top:10px;" alt="Dubai Daily Deals"/>
<br>
<br>
<small>Note: The invoice will be automatically sent through the system on the 28th of each month (if there are any redemptions).</small>
<small>
This email is a system generated email and does not require a response. If you have any questions or need assistance, please contact us at <a href="mailto:info@dubaidailydeals.app">info@dubaidailydeals.app</a>
</small>
`;

	await sendEmail(
		vendor.email,
		subject,
		text,
		[],
		// ['kashifahmad0332@gmail.com', 'salmanazeemkhan@gmail.com'],
		[],
		pdfBuffer,
	);
};
const sendReceipt = async (vendor, records, invoice) => {
	console.log({ vendor, records, invoice }, 'chkkking');
	const pdfBuffer = await attachReceipt(vendor, records, invoice);
	const subject = `${vendor.name} - Payment Receipt from Dubai Daily Deals`;

	const text = `Hi Partner,
	<br/>
	<br/>
	Thank you for your payment. We have received <b>AED ${invoice.total}</b> on <i>${dayjs(invoice.paid_at || invoice.created_date_time).format('DD/MM/YYYY')}</i>.
<br/>
<p>
Please find attached receipt of the payment.
</p>
We appreciate your timely payment and are excited about the prospect of continuing our successful collaboration.
<br/>
<br/>

	
Best regards,
<br/>
Dubai Daily Deal
<br/>
<img src="https://cms.dubaidailydeals.app/complete-logo.png" width="120px" style="margin-top:10px;" alt="Dubai Daily Deals"/>
<br>
<br>
<small>
This email is a system generated email and does not require a response. If you have any questions or need assistance, please contact us at <a href="mailto:info@dubaidailydeals.app">info@dubaidailydeals.app</a>
</small>
`;

	await sendEmail(
		vendor.email,
		subject,
		text,
		[],
		// ['kashifahmad0332@gmail.com', 'salmanazeemkhan@gmail.com'],
		[],
		pdfBuffer,
		'receipt.pdf',
	);
};

const websiteEnquiryEmail = async (data = {}) => {
	const subject = data.partner
		? `Partnership Inquiry from ${data.business_name || ''} through DDD's Website`
		: `Message from ${data.first_name || ''} ${data.last_name || ''} via DDD's Website`;

	const text = `Dear Admin,
	<br/>
	<br/>
	 ${data.partner ? 'You got a new inquiry from become a partner:' : 'You got a new inquiry:'} 
	<br/>
	<br/>
	
	<table style="border: 1px solid black; border-collapse: collapse; width: 100%;">
        ${data.partner
			? `<tr style="background-color: #f2f2f2;">
            <td style="border: 1px solid black; padding: 8px;">Business Name</td>
            <td style="border: 1px solid black; padding: 8px;">${data.business_name || ''}</td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;">Full Name</td>
            <td style="border: 1px solid black; padding: 8px;">${data.full_name || ''}</td>
        </tr>
		<tr>
            <td style="border: 1px solid black; padding: 8px;">Emirates</td>
            <td style="border: 1px solid black; padding: 8px;">${data.emirates || ''}</td>
        </tr>
		`
			: `<tr style="background-color: #f2f2f2;">
            <td style="border: 1px solid black; padding: 8px;">Name</td>
            <td style="border: 1px solid black; padding: 8px;">${data.first_name || ''} ${data.last_name || ''}</td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;">Location</td>
            <td style="border: 1px solid black; padding: 8px;">${data.location || ''}</td>
        </tr>`
		}
        <tr style="background-color: #f2f2f2;">
            <td style="border: 1px solid black; padding: 8px;">Phone No</td>
            <td style="border: 1px solid black; padding: 8px;">${data.phone_number || ''}</td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;">Message</td>
            <td style="border: 1px solid black; padding: 8px;">${data.message || ''}</td>
        </tr>
    </table>
	
	<br/>
Regards,
<br/>
Dubai Daily Deal
`;

	await sendEmail('info@dubaidailydeals.app', subject, text);
};

export default {
	sendEmail,
	sendWelcomeEmail,
	sendForgotPasswordEmail,
	sendInvoiceEmail,
	sendOTPEmailVerification,
	sendWelcomeEmailVendor,
	sendContractEmail,
	attachContractFormat,
	sendRedemptionInvoice,
	websiteEnquiryEmail,
	sendReceipt,
	sendWelcomeEmailVendorWithOnbarding,
	resetPasswordVendorEmail,
};
