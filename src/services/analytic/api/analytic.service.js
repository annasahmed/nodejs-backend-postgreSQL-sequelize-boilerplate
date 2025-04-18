import httpStatus from 'http-status'
const ApiError = require('../../../utils/ApiError');
const db = require('../../../db/models').default;
const { adminPlaceService, adminappUserService } = require('../../index.js');
const {
	getMonthlyDealById,
	getPlaceByMonthlyDealById,
} = require('../../monthlyDeal/admin/monthly_deal.service.js');
const {
	getSubCategoryById,
} = require('../../subCategory/admin/sub_category.service.js');

const validEvents = [
	'book_now_click',
	'place_click',
	'redeem_now_click',
	'place_pin_add',
	'show_code_click',
	'copy_code_click',
	'buy_now_click',

	// functionalities
	'search_place', // search keyword
	'filter_place_icon',
	'filter_place_button',
	'categories_all',
	'category_item', //sub_category_id
	'nearby_places_all',
	'nearby_place_item', //place_id
	'specialdeals_all', // monthly_deal_id
	'specialdeal_item', // monthly_deal_id place_id

	// mobile app bottom navigation bar
	'map_icon',
	'favourites_icon',
	'notification_icon',
	'profile_icon',
];

async function createAnalytic(req) {
	const {
		event,
		bill,
		description,
		dealId,
		placeId,
		userId,
		subCategoryId,
		monthlyDealId,
	} = req.body;

	if (!event || !validEvents.includes(event)) {
		throw new ApiError(
			httpStatus.BAD_REQUEST,
			`Invalid event type: ${event}`,
		);
	}

	const user = await adminappUserService.getAppUserById(userId);

	if (!user) {
		throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
	}

	if (monthlyDealId) {
		const monthlyDeal = await getMonthlyDealById(monthlyDealId);

		if (!monthlyDeal) {
			throw new ApiError(httpStatus.NOT_FOUND, 'Monthly deal not found');
		}
		if (placeId) {
			const place = await getPlaceByMonthlyDealById(
				monthlyDealId,
				placeId,
			);

			if (!place) {
				throw new ApiError(httpStatus.NOT_FOUND, 'Place not found');
			}
		}
	} else {
		if (placeId) {
			const place = await adminPlaceService.getPlaceById(placeId);

			if (!place) {
				throw new ApiError(httpStatus.NOT_FOUND, 'Place not found');
			}
		}
	}
	if (subCategoryId) {
		const subCategory = await getSubCategoryById(subCategoryId);

		if (!subCategory) {
			throw new ApiError(httpStatus.NOT_FOUND, 'Subcategory not found');
		}
	}
	try {
		const createdAnalytic = await db.analytic
			.create({
				event,
				bill: bill ? parseFloat(bill) : null,
				description,
				monthly_deal_id: monthlyDealId,
				sub_category_id: subCategoryId,
				deal_id: dealId,
				place_id: placeId,
				appUser_id: userId,
			})
			.then((resultEntity) => resultEntity.get({ plain: true }));

		return createdAnalytic;
	} catch (error) {
		//console.log('error occured in creating analytic', error);
	}
}

export default {
	createAnalytic,
};
