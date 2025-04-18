import httpStatus from 'http-status'
const ApiError = require('../../../utils/ApiError.js');
const db = require('../../../db/models/index.js').default;
const stripe = require('../../../config/stripe');
const { sendInvoiceEmail } = require('../../email.service');
import dayjs from 'dayjs'
const { Op } = require('sequelize')

const getInvoices = async (req) => {
	const { vendorId } = req.params;
	const limit = req.query.limit ?? 10;
	const page = req.query.page ?? 1;
	const offset = (page - 1) * limit;

	const { count, rows } = await db.invoice.findAndCountAll({
		limit,
		offset,
		order: [['id', 'DESC']],
		where: {
			vendor_id: vendorId,
			status_id: {
				[Op.not]: 5
			}
		},
	});
	return {
		total: count,
		page: parseInt(page),
		data: rows,
		limit: limit,
	};
};
const sendInvoiceToEmail = async (req) => {
	const { id } = req.params;
	//console.log('here id is', id);
	const invoice = await db.invoice.findOne({
		where: { id },
	});
	if (!invoice) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Invoice not found');
	}
	const vendor = await db.vendor.findByPk(invoice.vendor_id);
	if (!vendor) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Vendor not found');
	}
	const subscription = await db.subscriptions.findByPk(
		invoice.subscription_id,
	);
	if (!subscription) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Subscription not found');
	}
	const stripeInvoice = await stripe.invoices.retrieve(
		invoice.stripe_invoice_id,
	);
	if (!stripeInvoice) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Stripe Invoice not found');
	}
	const pkg = await db.packages.findByPk(subscription.package_id);
	const customerEmail = vendor.email;
	// const stripeInvoice = await stripe.invoices.retrieve(invoice.stripe_invoice_id);
	const data = {
		invoiceNumber: id,
		title: place.title,
		name: place.name,
		address: place.address,
		startDate: dayjs(place.start_date).format('DD MMM, YYYY'),
		package_name: pkg.name,
		fee: pkg.fee,
	};
	await sendInvoiceEmail(
		customerEmail,
		stripeInvoice.hosted_invoice_url,
		data,
	);
	return true;
};

export default {
	getInvoices,
	sendInvoiceToEmail,
};
