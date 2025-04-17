const httpStatus = require('http-status');
const { getOffset } = require('../../../utils/query.js');
const ApiError = require('../../../utils/ApiError.js');
const { encryptData } = require('../../../utils/auth.js');
const config = require('../../../config/config.js');
const db = require('../../../db/models/index.js').default;
const userService = require('../../user.service.js');
const {
	refactorCode,
	nearByCondition,
	getGoogleRating,
} = require('../../../utils/globals.js');

async function getDealByTitle(title) {
	const deal = await db.deal.findOne({
		where: { title },
	});

	return deal;
}
async function getDealById(id) {
	const deal = await db.deal.findOne({
		where: { id },
	});

	return deal;
}
async function createDeal(req) {
	const {
		title,
		categoryIds,
		userId,
		placeIds,
		status,
		firstTime,
		commission,
		parentDealId,
		days,
		timings,
		end_date,
	} = req.body;
	const deal = await getDealByTitle(title);

	if (deal) {
		throw new ApiError(httpStatus.CONFLICT, 'This deal already exits');
	}

	const user = await userService.getUserById(userId);

	if (!user) {
		throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
	}

	const daysArr = days && JSON.parse(days);
	const placeIdsArr = placeIds && JSON.parse(placeIds);
	const categoryIdsArr = categoryIds && JSON.parse(categoryIds);

	const createdDeal = await db.deal
		.create({
			title,
			user_id: userId,
			first_time: firstTime,
			commission: commission,
			parent_deal_id: parentDealId,
			days: daysArr,
			status,
			timing: timings,
			end_date: end_date && end_date !== 'null' ? end_date : null,
		})

		.then(async (resultEntity) => {
			const id = resultEntity.get({ plain: true }).id;
			await Promise.all(
				placeIdsArr?.length
					? placeIdsArr?.map((placeId) => {
							return db.place_to_deal.create({
								dealId: id,
								placeId: placeId,
							});
						})
					: [],
				categoryIdsArr?.length
					? categoryIdsArr?.map((categoryId) => {
							return db.deal_to_subcategory.create({
								dealId: id,
								subCategoryId: categoryId,
							});
						})
					: [],
			);

			return resultEntity.get({ plain: true });
		});
	return createdDeal;
}

async function getDeals(req, locationCondition) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;

	const offset = getOffset(page, limit);

	const deals = await db.deal.findAndCountAll({
		order: [
			['id', 'DESC'],
			['created_date_time', 'DESC'],
			['modified_date_time', 'DESC'],
		],
		include: [
			{
				model: db.parent_deal,
				require: true,
				attributes: ['id', 'image', 'type', 'discount'],
			},
		],
		attributes: [
			'id',
			'title',
			'status',
			'end_date',
			'created_date_time',
			'modified_date_time',
		],
		offset,
		limit,
		raw: true,
	});
	refactorCode(deals, [
		{
			title: 'parent_deal',
			items: ['id', 'image', 'type', 'discount'],
		},
	]);
	for (const deal of deals.rows) {
		deal.parent_deal.discount = parseFloat(deal.parent_deal.discount);
		const sub_categories = await db.deal_to_subcategory.findAll({
			where: {
				deal_id: deal.id,
			},
			attributes: ['sub_category_id'],
			raw: true,
		});
		const subCategoryIds = sub_categories.map(
			(subCategory) => subCategory.sub_category_id,
		);
		deal.sub_categories = await db.sub_category.findAll({
			where: { id: subCategoryIds },
			attributes: ['id', 'title'],
			raw: true,
		});
		const places = await db.place_to_deal.findAll({
			where: {
				deal_id: deal.id,
			},
			attributes: ['place_id'],
			raw: true,
		});
		const placeIds = places.map((place) => place.place_id);
		const nearByCondition = locationCondition || {};
		deal.places = await db.place.findAll({
			where: { id: placeIds, ...nearByCondition },
			attributes: [
				'id',
				'title',
				'slug',
				'excerpt',
				'address',
				'about',
				'contact',
				'email',
				'website',
				'status',
				'instagram',
				'booking_url',
				'location',
				'latitude',
				'longitude',
				// 'deal',
				'menu',
				'ratings',
				'reviews',
			],
			raw: true,
		});
		for (const place of deal.places) {
			const { rating, user_ratings_total } = await getGoogleRating(
				place.latitude,
				place.longitude,
			);
			place.rating = rating;
			place.reviews = user_ratings_total;
			place.media = await db.media.findOne({
				where: {
					place_id: place.id,
				},
				attributes: ['logo', 'featured', 'reel'],
				raw: true,
			});
			const sub_categories = await db.place_to_subcategory.findAll({
				where: {
					place_id: place.id,
				},
				attributes: ['sub_category_id'],
				raw: true,
			});
			const subCategoryIds = sub_categories.map(
				(subCategory) => subCategory.sub_category_id,
			);
			place.sub_categories = await db.sub_category.findAll({
				where: { id: subCategoryIds },
				attributes: ['id', 'title'],
				raw: true,
			});
			const cuisines = await db.place_to_cuisine.findAll({
				where: { place_id: place.id },
				attributes: ['cuisine_id'],
				raw: true,
			});
			const cuisineIds = cuisines.map((cuisine) => cuisine.cuisine_id);
			place.cuisines = await db.cuisine.findAll({
				where: { id: cuisineIds },
				attributes: ['id', 'title'],
				raw: true,
			});

			const usps = await db.place_to_usp.findAll({
				where: { place_id: place.id },
				attributes: ['usp_id'],
				raw: true,
			});
			const uspIds = usps.map((usp) => usp.usp_id);
			place.usps = await db.usp.findAll({
				where: { id: uspIds },
				attributes: ['id', 'title'],
				raw: true,
			});
			place.timings = await db.timing.findAll({
				where: { place_id: place.id },
				attributes: ['id', 'day', 'opening', 'closing'],
				raw: true,
			});
			place.happening = await db.happening.findAll({
				where: { place_id: place.id },
				attributes: [
					'id',
					'title',
					'description',
					'user_id',
					// 'status_id',
					// 'created_date_time',
				],
				raw: true,
			});
		}
	}
	// let tempArr = [];12341234123412341234
	let tempArr = [];
	deals?.rows.map((deal, index) => {
		const places =
			deal.places.length > 0 &&
			deal.places?.map((place) => {
				const obj = {
					...place,
					deal: {
						...deal,
					},
				};
				delete obj.deal.places;
				return obj;
			});
		if (places) {
			// return places;
			// tempArr.push(places);
			tempArr = [...places];
		}
	});
	const formattedResponse = [...tempArr];
	return formattedResponse;
}
async function getDealsWithoutCount(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;

	const offset = getOffset(page, limit);

	const deals = await db.deal.findAll({
		order: [['id', 'ASC']],
		include: [
			{
				model: db.user,
				require: true,
				attributes: ['id', 'first_name', 'last_name'],
			},
			{
				model: db.parent_deal,
				require: true,
				attributes: ['id', 'image', 'type', 'discount'],
			},
		],
		attributes: [
			'id',
			'title',
			'status',
			'days',
			'timing',
			'first_time',
		'end_date',
			'commission',
			'created_date_time',
			'modified_date_time',
		],
		offset,
		limit,
		raw: true,
	});
	refactorCode(deals, [
		{
			title: 'user',
			items: ['first_name', 'last_name'],
		},
		{
			title: 'parent_deal',
			items: ['id', 'image', 'type', 'discount'],
		},
	]);

	for (const deal of deals) {
		deal.parent_deal.discount = parseFloat(deal.parent_deal.discount);
		const sub_categories = await db.deal_to_subcategory.findAll({
			where: {
				deal_id: deal.id,
			},
			attributes: ['sub_category_id'],
			raw: true,
		});
		const subCategoryIds = sub_categories.map(
			(subCategory) => subCategory.sub_category_id,
		);
		deal.sub_categories = await db.sub_category.findAll({
			where: { id: subCategoryIds },
			attributes: ['id', 'title'],
			raw: false,
			include: [
				{
					model: db.category,
					require: true,
					attributes: ['id'],
				},
			],
		});
		const dealIds = deal.sub_categories.map((v) => v.category.id);
		deal.categories = await db.category.findAll({
			where: { id: dealIds },
			attributes: ['id', 'name'],
			raw: false,
			// include: [
			// 	{
			// 		model: db.category,
			// 		require: true,
			// 		attributes: ['id', 'name'],
			// 	},
			// ],
		});
		const places = await db.place_to_deal.findAll({
			where: {
				deal_id: deal.id,
			},
			attributes: ['place_id'],
			raw: true,
		});
		const placeIds = places.map((place) => place.place_id);
		deal.places = await db.place.findAll({
			where: { id: placeIds },
			attributes: ['id', 'title', 'ratings', 'reviews'],
			raw: true,
		});
	}

	return deals;
}
async function getDealsTitle(req) {
	const deals = await db.deal.findAll({
		attributes: ['id', 'title'],

		raw: true,
	});

	return deals;
}

async function deleteDealById(req) {
	const id = req.params.dealId || req.body.id;
	await db.place_to_deal.destroy({
		where: { deal_id: id },
	});
	await db.deal_to_subcategory.destroy({
		where: { deal_id: id },
	});
	const deletedDeal = await db.deal.destroy({
		where: { id },
	});

	if (!deletedDeal) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Deal not found');
	}

	return deletedDeal;
}

async function updateDeal(req) {
	const {
		categoryIds,
		userId,
		placeIds,
		firstTime,
		parentDealId,
		days,
		timings,
	} = req.body;
	// if (title) {
	// 	const deal = await getDealByTitle(title);

	// 	if (deal) {
	// 		throw new ApiError(
	// 			httpStatus.CONFLICT,
	// 			'This sub deal already exits',
	// 		);
	// 	}
	// }
	if (userId) {
		const user = await userService.getUserById(userId);

		if (!user) {
			throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
		}
	}
	const daysArr = days && JSON.parse(days);

	const categoryIdsArr = categoryIds && JSON.parse(categoryIds);
	const placeIdsArr = placeIds && JSON.parse(placeIds);

	req.body.user_id = userId;
	req.body.first_time = firstTime;
	req.body.parent_deal_id = parentDealId;
	req.body.timing = timings;
	const updatedDeal = await db.deal
		.update(
			{ ...req.body, days: daysArr },
			{
				where: { id: req.params.dealId || req.body.id },
				returning: true,
				plain: true,
				raw: true,
			},
		)

		.then(async (data) => {
			const id = req.params.dealId || req.body.id;
			const deletePlaceId =
				Array.isArray(placeIdsArr) && placeIdsArr?.length >= 0
					? await db.place_to_deal.destroy({
							where: { deal_id: id },
						})
					: null;
			const deleteCatId =
				Array.isArray(categoryIdsArr) && categoryIdsArr?.length >= 0
					? await db.deal_to_subcategory.destroy({
							where: { deal_id: id },
						})
					: null;
			await Promise.all(
				Array.isArray(placeIdsArr) && placeIdsArr?.length
					? placeIdsArr?.map((placeId) => {
							return db.place_to_deal.create({
								dealId: id,
								placeId: placeId,
							});
						})
					: [],
				Array.isArray(categoryIdsArr) && categoryIdsArr?.length
					? categoryIdsArr?.map((categoryId) => {
							return db.deal_to_subcategory.create({
								dealId: id,
								subCategoryId: categoryId,
							});
						})
					: [],
			);
			return data[1];
		});

	return updatedDeal;
}

module.exports = {
	getDeals,
	getDealsTitle,
	getDealsWithoutCount,
	createDeal,
	deleteDealById,
	updateDeal,
	getDealById,
};
