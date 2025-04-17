const stripe = require('../../config/stripe');
const db = require('../../db/models').default;

const getRedemptions = async (req) => {
	const { placeId } = req.params;
	const limit = req.query.limit ?? 10;
	const page = req.query.page ?? 1;
	const offset = (page - 1) * limit;

	const { count, rows } = await db.deal_redemption.findAndCountAll({
		limit,
		offset,
		order: [['id', 'DESC']], // Example order, adjust as needed,
		where: { place_id: placeId },
		include: [
			{
				model: db.deal,
				attributes: ['title', 'id'],
			},
			{
				model: db.appUser,
				attributes: ['first_name', 'id'],
				as: 'user',
			},
		],
	});
	return {
		total: count,
		page: parseInt(page),
		data: rows,
		limit: limit,
	};
};

const deleteRedemptionsByPlaceId = async (placeId) => {
	const dealRedemptions = await db.deal_redemption.findAll({
		where: { place_id: placeId },
		raw: true,
		attributes: ['id', 'deal_id', 'place_id'],
	});
	const dealRedemptionIds = dealRedemptions?.map((v) => v.id);
	const invoiceItems = await db.invoice_items.findAll({
		where: {
			deal_redemption_id: dealRedemptionIds,
		},
		raw: true,
		attributes: [
			'id',
			'invoice_id',
			'deal_redemption_id',
			'vendor_place_id',
			'total_amount',
		],
	});
	const invoiceIds = invoiceItems?.map((v) => v.invoice_id);
	const invoices = await db.invoice.findAll({
		where: {
			id: invoiceIds,
		},
		raw: true,
		attributes: [
			'id',
			'vendor_id',
			'invoice_type',
			'total_amount',
			'stripe_invoice_id',
		],
	});

	// deleteing
	await db.invoice.destroy({
		where: {
			id: invoiceIds,
		},
	});
	await db.invoice_items.destroy({
		where: {
			deal_redemption_id: dealRedemptionIds,
		},
	});
	await db.deal_redemption.destroy({
		where: { place_id: placeId },
	});

	const stripeInvoice = [];
	for (const invoice of invoices) {
		try {
			stripeInvoice.push(
				await stripe.invoices.voidInvoice(invoice.stripe_invoice_id),
			);
		} catch (error) {}
	}

	return {
		placeId,
		invoices,
		dealRedemptions,
		invoiceItems,
		stripeInvoice,
	};
};
const deleteRedemptionsByPlaceIdChk = async (placeId) => {
	const dealRedemptions = await db.deal_redemption.findAll({
		where: { place_id: placeId },
		raw: true,
		attributes: ['id', 'deal_id', 'place_id'],
	});
	const dealRedemptionIds = dealRedemptions?.map((v) => v.id);
	const invoiceItems = await db.invoice_items.findAll({
		where: {
			deal_redemption_id: dealRedemptionIds,
		},
		raw: true,
		attributes: [
			'id',
			'invoice_id',
			'deal_redemption_id',
			'vendor_place_id',
			'total_amount',
		],
	});
	const invoiceIds = invoiceItems?.map((v) => v.invoice_id);
	const invoices = await db.invoice.findAll({
		where: {
			id: invoiceIds,
		},
		raw: true,
		attributes: [
			'id',
			'vendor_id',
			'invoice_type',
			'total_amount',
			'stripe_invoice_id',
		],
	});

	console.log({
		placeId,
		invoices,
		dealRedemptions,
		invoiceItems,
	});
	return {
		placeId,
		invoices,
		dealRedemptions,
		invoiceItems,
	};
};

module.exports = {
	getRedemptions,
	deleteRedemptionsByPlaceId,
	deleteRedemptionsByPlaceIdChk,
};
