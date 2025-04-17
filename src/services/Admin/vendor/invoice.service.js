const httpStatus = require('http-status');
const { getOffset } = require('../../../utils/query.js');
const ApiError = require('../../../utils/ApiError.js');
const { encryptData } = require('../../../utils/auth.js');
const config = require('../../../config/config.js');
const db = require('../../../db/models').default;
const userService = require('../../user.service');
const { refactorCode } = require('../../../utils/globals.js');
const stripe = require('../../../config/stripe');
const dayjs = require('dayjs');
const { Op } = require('sequelize');
const { emailService } = require('../../index.js');

const getInvoices = async (req) => {
	const { placeId } = req.params;
	const limit = req.query.limit ?? 10;
	const page = req.query.page ?? 1;
	const offset = (page - 1) * limit;

	const { count, rows } = await db.invoice.findAndCountAll({
		limit,
		offset,
		order: [['id', 'DESC']],
		where: {
			place_id: placeId,
			status_id: {
				[Op.not]: 5,
			},
		},
		include: [
			{
				model: db.subscriptions,
				attributes: ['start_date', 'end_date', 'id'],
				as: 'subscription',
			},
		],
		attributes: [
			'id',
			'total_amount',
			'discount_amount',
			'discount_reason',
			'paid_at',
			'status_id',
			'created_date_time',
			'invoice_type',
		],
		raw: true,
	});
	refactorCode(rows, [
		{
			title: 'subscription',
			items: ['start_date', 'end_date', 'id'],
		},
		{
			title: 'package',
			items: ['id', 'name'],
		},
	]);
	for (const invoice of rows) {
		invoice.paymentLink = await genereateInvoiceLink(invoice.id);
	}

	return {
		total: count,
		page: parseInt(page),
		data: rows,
		limit: limit,
	};
};

const genereateInvoiceLink = async (id, vendorId = false) => {
	//console.log(id, 'chk invoice id');

	const invoice = await db.invoice.findOne({
		where: { id },
	});
	if (!invoice) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Invoice not found');
	}
	// const place = await db.place.findByPk(invoice.place_id);
	// if (!place) {
	// 	throw new ApiError(httpStatus.NOT_FOUND, 'Place not found');
	// }

	const stripeInvoice = await stripe.invoices.retrieve(
		invoice.stripe_invoice_id,
	);
	if (vendorId) {
		return {
			hosted_invoice_url: stripeInvoice?.hosted_invoice_url,
			vendorId: invoice.vendorId,
		};
	}
	return stripeInvoice?.hosted_invoice_url;
};

const sendRedemptionInvoiceEmail = async (req) => {
	const invoiceId = req.params.invoiceId;
	// const hosted_invoice_url = 1;
	const { hosted_invoice_url, vendorId } = await genereateInvoiceLink(
		invoiceId,
		true,
	);
	const invoice = await db.invoice.findByPk(invoiceId, {
		raw: true,
	});
	console.log(invoice, 'chking invoice');

	const vendor = await db.vendors.findByPk(invoice.vendorId, { raw: true });

	const redemptions = await db.invoice_items.findAll({
		where: {
			invoice_id: invoiceId,
		},
		include: [
			{
				model: db.deal_redemption,
				include: [
					{
						model: db.place,
						attributes: ['id', 'title'],
					},
					{
						model: db.appUser,
						attributes: ['first_name', 'id', 'last_name'],
						as: 'user',
					},
					{
						model: db.deal,
						attributes: ['id', 'title'],
					},
				],
			},
		],
	});

	const formattedRedemptions = {};

	redemptions.forEach((redemption) => {
		const placeId = redemption.deal_redemption.place.id;
		const placeTitle = redemption.deal_redemption.place.title;

		if (!formattedRedemptions[`place${placeId}`]) {
			formattedRedemptions[`place${placeId}`] = {
				place: { title: placeTitle },
				redemptions: [],
			};
		}

		formattedRedemptions[`place${placeId}`].redemptions.push({
			total: redemption.deal_redemption.total,
			discount_amount: redemption.deal_redemption.discount_amount,
			commission_amount: redemption.deal_redemption.commission_amount,
			deal_id: redemption.deal_redemption.deal_id,
			title: redemption.deal_redemption.title,
			deal: redemption.deal_redemption.deal,
			user: redemption.deal_redemption.user,
			deal_sequence: redemption.deal_redemption.deal_sequence,
			created_date_time: redemption.deal_redemption.created_date_time,
		});
	});

	await emailService.sendRedemptionInvoice(vendor, formattedRedemptions, {
		hosted_invoice_url: hosted_invoice_url,
		id: invoiceId,
		created_date_time: invoice.created_date_time,
	});

	return {
		vendor,
		formattedRedemptions,
		data: {
			hosted_invoice_url: hosted_invoice_url,
			id: invoiceId,
			created_date_time: invoice.created_date_time,
		},
		// redemptions,
	};
};

module.exports = {
	getInvoices,
	genereateInvoiceLink,
	sendRedemptionInvoiceEmail,
};
