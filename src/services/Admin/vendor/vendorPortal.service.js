const config = require('../../../config/config');
const db = require('../../../db/models').default;
const { getOffset } = require('../../../utils/query');

async function getInvoicesByVendor(req) {
	const vendorId = req.params.vendorId;

	const invoices = db.invoice.findAll({
		where: {
			vendor_id: vendorId,
		},
	});

	return invoices;
}

async function getRedemptionsByVendor(req) {
	const vendorId = req.params.vendorId;
	const { page: defaultPage, limit: defaultLimit } = config.pagination; // Default page and limit from config
	let { page = defaultPage, limit = defaultLimit } = req.query;

	// Convert page and limit to integers
	page = parseInt(page, 10);
	limit = parseInt(limit, 10);

	// Calculate offset for pagination
	const offset = getOffset(page, limit);

	console.log(req.query, 'checking query');

	// Fetch the vendor with associated places
	const vendor = await db.vendors.findOne({
		where: {
			id: vendorId,
		},
		include: [
			{
				model: db.place,
				attributes: ['id', 'title'],
			},
		],
		attributes: ['id'],
		raw: true,
	});

	if (!vendor) {
		throw new Error('Vendor not found');
	}

	console.log(vendor, 'chkk vendir');

	// Fetch paginated deal redemptions for the vendor's places
	const { count, rows: dealRedemptions } =
		await db.deal_redemption.findAndCountAll({
			where: {
				'$place.vendor_id$': vendorId, // Filter by vendor's places
			},
			include: [
				{
					model: db.place,
					attributes: ['id', 'title'],
					require: false,
					// include: [
					// 	{
					// 		model: db.media,
					// 		require: false,
					// 	},
					// ],
				},
				{
					model: db.deal,
					attributes: ['id', 'title'],
				},
			],
			offset,
			limit,
		});

	// Calculate total pages

	// Prepare response with pagination metadata
	const response = {
		dealRedemptions,
		pagination: {
			page,
			limit,
			totalCount: count,
		},
	};

	return response;
}
async function getTotalRedemptionAmountByVendor(req) {
	const vendorId = req.params.vendorId;

	// Fetch the vendor to ensure it exists
	const vendor = await db.vendors.findOne({
		where: { id: vendorId },
		attributes: ['id'],
	});

	if (!vendor) {
		throw new Error('Vendor not found');
	}

	// Calculate the total redemption amount for the vendor
	const totalRedemptionAmount = await db.deal_redemption.sum('total', {
		include: [
			{
				model: db.place,
				attributes: [],
				where: { vendor_id: vendorId }, // Filter by vendor's places
			},
		],
	});

	return { vendorId, totalRedemptionAmount: totalRedemptionAmount || 0 };
}

async function getTotalUnpaidInvoicesByVendor(req) {
	const vendorId = req.params.vendorId;

	// Calculate the total amount of unpaid invoices
	const totalUnpaidAmount = await db.invoice.sum('total_amount', {
		where: {
			vendor_id: vendorId,
			paid_at: null, // Unpaid invoices
		},
	});

	return { vendorId, totalUnpaidAmount: totalUnpaidAmount || 0 };
}

module.exports = {
	getInvoicesByVendor,
	getRedemptionsByVendor,
	getTotalRedemptionAmountByVendor,
	getTotalUnpaidInvoicesByVendor,
};
