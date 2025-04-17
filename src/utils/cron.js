const cron = require('node-cron');
const db = require('../db/models').default;
const { Op } = require('sequelize');
const { sendRedemptionInvoice } = require('../services/email.service');
const stripe = require('../config/stripe');
const dayjs = require('dayjs');
const { FcmNotificationService } = require('../config/fcm');
const { addJobToQueue } = require('../queue/queue.service');

const disabledPastHappenings = cron.schedule('* * * * *', async () => {
	const seasons = await db.seasons.findAll({
		where: {
			end_date: {
				[Op.lt]: new Date(),
			},
			deleted_by: null,
			status: true,
		},
	});
	db.happening.update(
		{ status: false },
		{
			where: {
				[Op.or]: [
					{
						season_id: {
							[Op.in]: seasons.map((season) => season.id),
						},
					},
					{
						end_date: {
							[Op.lt]: new Date(),
							[Op.not]: null,
						},
					},
				],
			},
		},
	);
});

const disabledPastDeals = cron.schedule('* * * * *', async () => {
	db.deal.update(
		{ status: false },
		{
			where: {
				[Op.or]: [
					{
						end_date: {
							[Op.lt]: new Date(),
							[Op.not]: null,
						},
					},
				],
			},
		},
	);
});

const sendRedemptionInvoices = cron.schedule('0 5 28 * *', async () => {
	console.log('Sending invoices');
	const vendors = await db.vendors.findAll({
		where: {
			status: true,
		},
	});
	for (const vendor of vendors) {
		const transaction = await db.sequelize.transaction();
		let stripeInvoice = null;
		try {
			const places = await db.place.findAll({
				where: {
					vendor_id: vendor.id,
					status: true,
				},
			});
			const placeIds = places.map((place) => place.id);
			const redemptions = await db.deal_redemption.findAll({
				where: {
					place_id: {
						[Op.in]: placeIds,
					},
					is_invoiced: false,
					commission_amount: {
						[Op.gt]: 0,
					},
				},
				include: [
					{
						model: db.deal,
						attributes: ['id', 'title'],
					},
					{
						model: db.appUser,
						attributes: ['first_name', 'id', 'last_name'],
						as: 'user',
					},
				],
			});
			console.log('vendor', vendor.name, redemptions.length, placeIds);

			if (redemptions.length > 0) {
				/*
				 * group redemptions by place id
				 * like this
				 * [{place:{id:1, name: 'place1'}, redemptions: [{id:1, deal_id: 1, place_id: 1, user_id: 1, status: true, createdAt: '2021-09-01T00:00:00.000Z'}]}]
				 */
				let totalCommission = 0;
				const groupedRedemptions = redemptions.reduce(
					(acc, redemption) => {
						const placeId = redemption.place_id;
						if (!acc[placeId]) {
							acc[placeId] = {
								place: places.find(
									(place) => place.id === placeId,
								),
								redemptions: [],
							};
						}
						acc[placeId].redemptions.push(redemption);
						totalCommission += redemption.commission_amount;
						return acc;
					},
					{},
				);
				const customer = await stripe.customers.create({
					email: vendor.email,
				});

				stripeInvoice = await stripe.invoices.create({
					customer: customer.id,
					collection_method: 'send_invoice',
					auto_advance: false,
					due_date: dayjs()
						.add(
							vendor.grace_period ? vendor.grace_period : 15,
							'days',
						)
						.toDate(),
				});

				totalCommission = totalCommission.toFixed(2);
				const invoice = await db.invoice.create(
					{
						vendor_id: vendor.id,
						stripe_invoice_id: stripeInvoice.id,
						status_id: 4,
						subscription_id: null,
						total_amount: totalCommission,
						discount_reason: null,
						discount_amount: 0,
						invoice_type: 2,
					},
					{
						transaction,
					},
				);
				for (const redemption of redemptions) {
					await db.invoice_items.create(
						{
							invoice_id: invoice.id,
							vendor_place_id: null,
							total_amount: redemption.commission_amount,
							discount_amount: 0,
							discount_reason: '',
							status_id: 4,
							deal_redemption_id: redemption.id,
						},
						{
							transaction,
						},
					);
					await stripe.invoiceItems.create({
						customer: customer.id,
						amount: (redemption.commission_amount * 100).toFixed(0),
						currency: 'aed',
						description: `Redemption by ${redemption.user?.first_name} ${redemption.user?.last_name} for ${redemption.deal?.title || 'E-Commerce'}`,
						invoice: stripeInvoice.id,
					});
				}
				stripeInvoice = await stripe.invoices.finalizeInvoice(
					stripeInvoice.id,
				);
				invoice.hosted_invoice_url = stripeInvoice.hosted_invoice_url;
				console.log(invoice.hosted_invoice_url, 'hosted_invoice_url');
				await sendRedemptionInvoice(
					vendor,
					groupedRedemptions,
					invoice,
				);
			}
			transaction.commit();
		} catch (e) {
			console.log('error in sending vendor email', e);
			transaction.rollback();
			if (stripeInvoice && stripeInvoice.id) {
				await stripe.invoices.voidInvoice(stripeInvoice.id);
			}
		}
	}
});
const sendSingleRedemptionInvoice = async () => {
	console.log('Sending invoices');
	const vendor = await db.vendors.findOne({
		where: {
			id: 4,
		},
		raw: true,
	});

	// const vendor = vendors[0];
	let totalCommission = 0;
	const places = await db.place.findAll({
		where: {
			vendor_id: vendor.id,
			status: true,
		},
		raw: true,
	});
	const placeIds = places.map((place) => place.id);
	const redemptions = await db.deal_redemption.findAll({
		where: {
			// place_id: {
			// 	[Op.in]: placeIds,
			// },
			place_id: placeIds,
			// is_invoiced: false,
			// commission_amount: {
			// 	[Op.gt]: 0,
			// },
		},
		include: [
			{
				model: db.deal,
				attributes: ['id', 'title'],
			},
			{
				model: db.appUser,
				attributes: ['first_name', 'id', 'last_name'],
				as: 'user',
			},
		],
	});
	const groupedRedemptions = redemptions.reduce((acc, redemption) => {
		const placeId = redemption.place_id;
		if (!acc[placeId]) {
			acc[placeId] = {
				place: places.find((place) => place.id === placeId),
				redemptions: [],
			};
		}
		acc[placeId].redemptions.push(redemption);
		totalCommission += redemption.commission_amount;
		return acc;
	}, {});

	await sendRedemptionInvoice(vendor, groupedRedemptions, {
		invoiceNumber: 15,
		invoiceDate: '30 - 12 - 2024',
	});
};

const sendScheduledNotification = cron.schedule('* * * * *', async () => {
	const notifications = await db.notifications.findAll({
		where: {
			is_sent: false,
			is_scheduled: true,
			scheduled_at: {
				[Op.lt]: new Date(),
			},
		},
	});
	for (const notification of notifications) {
		const message = {
			notification: {
				title: notification.title,
				body: notification.description,
			},
			data: {},
			topic: process.env.NOTIFICATION_TOPIC || 'app-user',
		};
		if (notification.image) {
			message.notification.image = notification.image;
		}
		if (notification.place_id) {
			message.data.place_id = notification.place_id.toString();
		}
		const response = await FcmNotificationService.messaging().send(message);
		if (!response) {
			continue;
		}
		await db.notifications.update(
			{
				is_sent: true,
				sent_at: new Date(),
			},
			{
				where: { id: notification.id },
			},
		);
		await addJobToQueue({
			type: 'register_user_notification',
			payload: {
				notification_id: notification.id,
			},
		});
	}
});

module.exports = {
	disabledPastHappenings,
	sendRedemptionInvoices,
	sendScheduledNotification,
	sendSingleRedemptionInvoice,
	disabledPastDeals,
};
