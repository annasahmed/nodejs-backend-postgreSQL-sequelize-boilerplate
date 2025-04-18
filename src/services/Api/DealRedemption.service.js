import httpStatus from 'http-status'
const ApiError = require('../../utils/ApiError.js');
const db = require('../../db/models').default;
const { padId } = require('../../utils/globals');
const { adminappUserService } = require('../index');
const { generateBarCode } = require('../../utils/BarCodeGenerator');
import dayjs from 'dayjs'
const { Op } = require('sequelize');

async function redeemDeal(req) {
	const { dealId, placePin, total, placeId } = req.body;
	const userId = req.auth.userId;

	// Check if the user exists
	const user = await adminappUserService.getAppUserById(userId);
	if (!user) {
		throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
	}
	const dealCheck = await db.deal.findOne({
		where: { id: dealId, status: true },
	});

	if (!dealCheck) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Deal not found');
	}
	const isNumber = /^\d+$/;

	let where = {};
	if (isNumber.test(placePin)) {
		where = { place_pin: placePin };
	} else {
		where = {
			is_ecommerce: true,
			ecommerce_code: placePin,
		};
	}
	const place = await db.place.findOne({
		where: {
			...where,
			id: placeId,
		},
		include: {
			model: db.deal,
			where: { id: dealId, status: true },
			required: true,
			include: {
				model: db.parent_deal,
				required: true,
			},
		},
	});

	if (!place) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Place not found');
	}

	const deal = place.deals[0];
	if (!deal || !deal.parent_deal) {
		throw new ApiError(
			httpStatus.BAD_REQUEST,
			'Deal not available at this place',
		);
	}
	// if (deal.days && deal.days.length > 0) {
	// 	const days = deal.days;
	// 	const today = dayjs().format('dddd').toLowerCase();
	// 	if (!days.includes(today)) {
	// 		throw new ApiError(
	// 			httpStatus.BAD_REQUEST,
	// 			'Deal is not available today',
	// 		);
	// 	}
	// }

	/* if deal have first time set to true
	 * check if the user has already redeemed a deal at this place
	 * if yes, throw an error
	 */
	if (deal.first_time) {
		const redemption = await db.deal_redemption.findOne({
			where: { user_id: userId, place_id: placeId },
		});
		if (redemption) {
			throw new ApiError(
				httpStatus.BAD_REQUEST,
				'This deal can be only redeemed on first visit',
			);
		}
	}

	/*
	 * Check if deal is percentage or fixed, if fixed check, if total is greater than discount
	 * if not throw an error
	 */
	let discountAmount = 0;
	const type = deal.parent_deal.type;
	const dealDiscount = deal.parent_deal.discount;
	if (dealDiscount > 0 && type === 'percentage') {
		discountAmount = (total * dealDiscount) / 100;
	} else if (dealDiscount > 0 && type === 'fixed' && total >= deal.discount) {
		discountAmount = dealDiscount;
	} else {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid deal type');
	}
	// Calculate commission amount, if commission is set
	let commissionAmount = 0;
	if (place.commission > 0 && deal.commission) {
		commissionAmount = (total * place.commission) / 100;
	}
	const redemptionCount = await db.deal_redemption.count();

	// Pad IDs if their length is less than 3
	const formattedDealRedemptionId = padId(redemptionCount + 1);
	const formattedPlaceId = padId(place.id);
	const formattedUserId = padId(userId);

	// Construct the string
	const formattedString = `DDD-${formattedPlaceId}-${formattedUserId}-${formattedDealRedemptionId}`;
	const path = await generateBarCode(formattedString, userId);
	if (!path) {
		throw new ApiError(
			httpStatus.INTERNAL_SERVER_ERROR,
			"Barcode can't be generated",
		);
	}
	return await db.deal_redemption.create({
		deal_id: dealId,
		user_id: userId,
		place_id: place.id,
		total: total,
		discount_amount: discountAmount,
		discount_percentage: dealDiscount,
		commission_percentage: place.commission,
		commission_amount: commissionAmount,
		deal_sequence: formattedString,
		barcode_path: path,
	});
}

export default {
	redeemDeal,
};
