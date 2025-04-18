import handlebars from 'handlebars';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import puppeteer from 'puppeteer';
import { config } from '../config/config.js';
import logger from '../config/logger.js';
import db from '../db/models/index.js';
import ApiError from '../utils/ApiError.js';
import { capitalizeString, numberToWords, padNumber } from '../utils/globals.js';

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
export const sendEmail = async (
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
