const stripe = require('../../config/stripe');
const db = require('../../db/models').default;
import dayjs from 'dayjs'
const { Op } = require('sequelize');
const { updatePlace } = require('../place/admin/place.service');
const {
	sendWelcomeEmailVendor,
	sendInvoiceEmail,
} = require('../email.service');
import ApiError from '../../utils/ApiError'
import httpStatus from 'http-status'
const { emailService } = require('..');
const { checkDeletedCondition, refactorCode } = require('../../utils/globals');

const createUpgradeInvoice = async (
	placeId,
	subscription,
	price,
	isFirst = false,
) => {
	const place = await db.place.findByPk(placeId, {
		include: [
			{
				model: db.packages,
				as: 'package',
			},
		],
	});
	if (!place) {
		throw new Error('Place not found');
	}
	const pkg = place.package;
	if (price <= 0) {
		return;
	}

	let invoice = await db.invoice.findOne({
		where: {
			place_id: placeId,
			package_id: subscription.package_id,
			status_id: 4,
		},
	});
	const customerEmail = place.email;
	if (invoice) {
		return invoice;
	}

	const oldInvoices = await db.invoice.findAll({
		where: {
			place_id: placeId,
			status_id: 4,
			subscription_id: {
				[Op.ne]: null,
			},
		},
	});

	if (oldInvoices.length > 0) {
		const invoiceIds = oldInvoices.map(
			(invoice) => invoice.stripe_invoice_id,
		);
		for (const oldInvoice of oldInvoices) {
			await stripe.invoices.voidInvoice(oldInvoice.stripe_invoice_id);
			await oldInvoice.update({ status_id: 5 });
		}
	}

	const customer = await stripe.customers.create({ email: customerEmail });
	const originalPrice = price;
	let discountAmount = null;
	let discountReason = null;
	if (isFirst && false) {
		// disable for now
		//give 50% discount for first time
		price = price / 2;
		discountAmount = originalPrice - price;
		discountReason = 'First Time Discount';
	}
	let stripeInvoice = await stripe.invoices.create({
		customer: customer.id,
		collection_method: 'send_invoice',
		auto_advance: false,
		due_date: dayjs().add(15, 'days').toDate(),
	});
	await stripe.invoiceItems.create({
		customer: customer.id,
		amount: price * 100,
		currency: 'aed',
		description: 'Dubai Daily Deals: ' + pkg.name,
		invoice: stripeInvoice.id,
	});
	invoice = await db.invoice.create({
		place_id: placeId,
		stripe_invoice_id: stripeInvoice.id,
		package_id: pkg.id,
		status_id: 4,
		subscription_id: subscription.id,
		total_amount: originalPrice,
		discount_reason: discountReason,
		discount_amount: discountAmount,
	});
	await stripe.invoices.finalizeInvoice(stripeInvoice.id);
	stripeInvoice = await stripe.invoices.retrieve(stripeInvoice.id);

	const data = {
		invoiceNumber: invoice?.id || 1,
		title: place.title,
		address: place.address,
		name: place.name,
		startDate: dayjs(subscription.start_date).format('DD MMM, YYYY'),
		package_name: pkg.name,
		fee: pkg.fee,
	};
	await sendInvoiceEmail(
		customerEmail,
		stripeInvoice.hosted_invoice_url,
		data,
	);
	return invoice;
};
const markInvoiceAsPaid = async (req) => {
	const invoiceId = req.params.stripe_invoice_id;
	const { date, paymentMethod } = req.body;

	let paidInvoice;
	try {
		paidInvoice = await stripe.invoices.pay(invoiceId, {
			paid_out_of_band: true,
		});
	} catch (e) {
		paidInvoice = await stripe.invoices.retrieve(invoiceId);
	}
	if (!paidInvoice) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Stripe invoice not found');
	}
	await updateInvoice(paidInvoice, paymentMethod, date);

	return paidInvoice;
};

const paymentSuccessIntent = async (req, res) => {
	let event = req.stripeEvent;
	let response = true;

	switch (event.type) {
		case 'invoice.payment_succeeded':
			const invoice = event.data.object;
			response = await updateInvoice(invoice, 'stripe');
			break;
	}

	return response;
};

const updateInvoice = async (inv, date, payment_method) => {
	const transaction = await db.sequelize.transaction();
	try {
		const dbInvoice = await db.invoice.findOne({
			where: {
				stripe_invoice_id: inv.id,
			},
			include: [
				{
					model: db.vendors,
				},
			],
		});
		const vendor = await db.vendors.findByPk(dbInvoice.vendor_id);
		if (!dbInvoice) {
			throw new Error('Invoice not found');
		}
		const invoiceItems = await db.invoice_items.findAll({
			where: {
				invoice_id: dbInvoice.id,
				status_id: 4,
			},
			include: [
				{
					model: db.vendor_place,
				},
			],
		});
		console.log(dbInvoice.invoice_type, 'invoice type');
		if (dbInvoice.invoice_type === 2) {
			const redemptionId = invoiceItems.map(
				(item) => item.deal_redemption_id,
			);
			// mark as deal redemption is_invoiced to true
			await db.deal_redemption.update(
				{ is_invoiced: true },
				{
					where: {
						id: {
							[Op.in]: redemptionId,
						},
					},
				},
			);
		} else {
			for (const invoiceItem of invoiceItems) {
				const place = await db.place.findOne({
					where: {
						id: invoiceItem.vendor_place.place_id,
					},
				});
				const placeNames = [];
				const placeIds = [];
				if (place) {
					placeNames.push(place.title);
					placeIds.push(place.id);

					await place.update(
						{
							welcome_email_sent: true,
							package_id: invoiceItem.vendor_place.package_id,
							vendor_id: dbInvoice.vendor_id,
						},
						{
							transaction,
						},
					);
				}
				if (placeNames.length > 0) {
					await sendWelcomeEmailVendor(
						vendor.email,
						placeNames.join(', '),
						vendor.username,
						// vendor.password,
					);
				}
				let subscription = await db.subscriptions.findOne({
					where: {
						place_id: invoiceItem.vendor_place.place_id,
						subscription_status_id: 1,
					},
				});

				if (!subscription) {
					subscription = await db.subscriptions.build();
					let startDate = vendor.start_date
						? dayjs(vendor.start_date)
						: dayjs();
					const pkg = await db.packages.findByPk(
						invoiceItem.vendor_place.package_id,
					);
					if (startDate.isBefore(dayjs(), 'day')) {
						startDate = dayjs();
					}

					subscription.start_date = startDate.toDate();
					subscription.end_date = dayjs()
						.add(pkg.month + pkg.trial_months, 'month')
						.toDate();
					subscription.place_id = invoiceItem.vendor_place.place_id;
					subscription.first_purchase_date = startDate;
					subscription.renewal_date = dayjs().add(
						pkg.month + pkg.trial_months,
						'month',
					);
					subscription.package_id =
						invoiceItem.vendor_place.package_id;
					subscription.next_package_id =
						invoiceItem.vendor_place.next_package_id;
					subscription.subscription_status_id = 1;
					await subscription.save({ transaction });
				} else {
					const pkg = await db.packages.findByPk(
						invoiceItem.vendor_place.package_id,
					);
					subscription.end_date = dayjs(subscription.end_date)
						.add(pkg.month, 'month')
						.toDate();
					subscription.renewal_date = dayjs(subscription.renewal_date)
						.add(pkg.month, 'month')
						.toDate();
					if (
						subscription.package_id !==
						invoiceItem.vendor_place.package_id
					) {
						subscription.package_id =
							invoiceItem.vendor_place.package_id;
						subscription.next_package_id =
							invoiceItem.vendor_place.next_package_id;
					}
					await subscription.save({ transaction });
				}
				subscription = subscription.reload();
				await invoiceItem.update({
					subscription_id: subscription.id,
				});
				await db.vendor_place.update(
					{ is_invoiced: true },
					{
						where: {
							vendor_id: vendor.id,
							place_id: place.id,
						},
					},
				);
			}
		}

		dbInvoice.status_id = 1;
		dbInvoice.webhook_response = inv;
		dbInvoice.modified_date_time = new Date();
		dbInvoice.paid_at = date ? date : new Date();
		dbInvoice.payment_method = payment_method;
		await dbInvoice.save({ transaction });
		transaction.commit();
		await sendReceipt(inv.id);
		return true;
	} catch (e) {
		console.log(e);
		transaction.rollback();
		throw e;
	}
};

const sendReceipt = async (invoiceId) => {
	const invoice = await db.invoice.findOne({
		// distinct: true,
		where: {
			id: invoiceId,
		},
		include: [
			{
				model: db.invoice_items,
				attributes: ['id', 'total_amount'],
				include: [
					{
						model: db.vendor_place,
						attributes: ['id'],
						include: [
							{
								model: db.place,
								where: {
									status: true,
									...checkDeletedCondition,
								},
								attributes: ['id', 'title'],
							},
						],
					},
				],
			},
			{
				model: db.vendors,
				attributes: ['id', 'name', 'email'],
			},
		],
		attributes: [
			'id',
			'vendor_id',
			'paid_at',
			'total_amount',
			'created_date_time',
		],
		// raw: true,
	});
	// console.log(invoice, 'chkking invoice');
	// refactorCode(invoice);

	// console.log(invoice, 'chkking invoice');
	// return;
	await emailService.sendReceipt(invoice.vendor, invoice.invoice_items, {
		id: invoiceId,
		created_date_time: invoice.created_date_time,
		total: invoice.total_amount,
		paid_at: invoice.paid_at,
	});
};

export default {
	paymentSuccessIntent,
	createUpgradeInvoice,
	markInvoiceAsPaid,
	sendReceipt,
};
