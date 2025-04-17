const httpStatus = require('http-status');
const { getOffset } = require('../../../utils/query.js');
const ApiError = require('../../../utils/ApiError.js');
const { encryptData } = require('../../../utils/auth.js');
const config = require('../../../config/config.js');
const db = require('../../../db/models/index.js').default;
const userService = require('../../user.service.js');
const {
	refactorCode,
	getGoogleRating,
	reorderFunction,
} = require('../../../utils/globals.js');

async function getMonthlyDealByTitle(title) {
	const monthlyDeal = await db.monthly_deal.findOne({
		where: { title },
	});

	return monthlyDeal;
}
async function getMonthlyDealById(id) {
	const monthlyDeal = await db.monthly_deal.findOne({
		where: { id },
		include: [
			{
				model: db.user,
				require: true,
				attributes: ['id', 'first_name', 'last_name'],
			},
		],
		attributes: [
			'id',
			'title',
			'status',
			'created_date_time',
			'modified_date_time',
		],
		raw: true,
	});

	// for (const monthlyDeal of monthlyDeal) {
	const sub_categories = await db.subcategory_to_monthlydeal.findAll({
		where: {
			monthly_deal_id: monthlyDeal.id,
		},
		attributes: ['sub_category_id'],
		raw: true,
	});
	const subCategoryIds = sub_categories.map(
		(subCategory) => subCategory.sub_category_id,
	);
	monthlyDeal.categories = await db.sub_category.findAll({
		where: { id: subCategoryIds },
		attributes: ['id', 'title'],
		raw: true,
	});
	// const deals = await db.monthly_deal_to_deal.findAll({
	// 	where: {
	// 		monthly_deal_id: monthlyDeal.id,
	// 	},
	// 	attributes: ['deal_id'],
	// 	raw: true,
	// });
	// const dealIds = deals.map((deal) => deal.deal_id);
	// monthlyDeal.deals = await db.deal.findAll({
	// 	where: { id: dealIds },
	// 	attributes: ['id', 'title'],
	// 	raw: true,
	// });
	const places = await db.place_to_monthly_deal.findAll({
		where: {
			monthly_deal_id: monthlyDeal.id,
		},
		attributes: ['place_id'],
		raw: true,
	});
	const placeIds = places.map((deal) => deal.place_id);
	monthlyDeal.places = await db.place.findAll({
		where: { id: placeIds },
		attributes: [
			'id',
			'title',
			'slug',
			'excerpt',
			'address',
			'about',
			'contact',
			// 'email',
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
	for (const place of monthlyDeal.places) {
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
	// }
	return monthlyDeal;
}
async function getPlaceByMonthlyDealById(id, placeId) {
	const monthlyDeal = await db.place_to_monthly_deal.findOne({
		where: { monthlyDealId: id, placeId },
		raw: true,
	});

	return monthlyDeal;
}
async function createMonthlyDeal(req) {
	const { title, userId, status, dealIds, categoryIds } = req.body;
	//console.log(req.body, 'req.body');

	// const monthlyDeal = await getMonthlyDealByTitle(title);

	// if (monthlyDeal) {
	// 	throw new ApiError(
	// 		httpStatus.CONFLICT,
	// 		'This monthlyDeal already exits',
	// 	);
	// }

	const user = await userService.getUserById(userId);

	if (!user) {
		throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
	}
	const dealIdsArr = dealIds && JSON.parse(dealIds);
	const categoryIdsArr = categoryIds && JSON.parse(categoryIds);
	const createdMonthlyDeal = await db.monthly_deal
		.create({
			title,
			user_id: userId,
			status,
		})
		.then(async (resultEntity) => {
			const id = resultEntity.get({ plain: true }).id;
			await Promise.all(
				dealIdsArr?.length
					? dealIdsArr?.map((dealId) => {
							return db.monthly_deal_to_deal.create({
								monthlyDealId: id,
								dealId: dealId,
							});
						})
					: [],
				categoryIdsArr?.length
					? categoryIdsArr?.map((categoryId) => {
							return db.subcategory_to_monthlydeal.create({
								monthlyDealId: id,
								subCategoryId: categoryId,
							});
						})
					: [],
			);

			return resultEntity.get({ plain: true });
		});

	return createdMonthlyDeal;
}

async function getMonthlyDeals(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;

	const offset = getOffset(page, limit);

	const monthlyDeals = await db.monthly_deal.findAndCountAll({
		order: [
			['id', 'ASC'],
			['created_date_time', 'DESC'],
			['modified_date_time', 'DESC'],
		],
		include: [
			{
				model: db.user,
				require: true,
				attributes: ['id', 'first_name', 'last_name'],
			},
		],
		attributes: [
			'id',
			'title',
			'status',
			'created_date_time',
			'modified_date_time',
		],
		offset,
		limit,
		raw: true,
	});
	refactorCode(monthlyDeals, [
		{
			title: 'user',
			items: ['id', 'first_name', 'last_name'],
		},
	]);
	for (const monthlyDeal of monthlyDeals.rows) {
		const sub_categories = await db.subcategory_to_monthlydeal.findAll({
			where: {
				monthly_deal_id: monthlyDeal.id,
			},
			attributes: ['sub_category_id'],
			raw: true,
		});
		const subCategoryIds = sub_categories.map(
			(subCategory) => subCategory.sub_category_id,
		);
		monthlyDeal.categories = await db.sub_category.findAll({
			where: { id: subCategoryIds },
			attributes: ['id', 'title'],
			raw: true,
		});
		const places = await db.place_to_monthly_deal.findAll({
			where: {
				monthly_deal_id: monthlyDeal.id,
			},
			attributes: ['deal_id'],
			raw: true,
		});
		const placeIds = places.map((place) => place.place_id);
		monthlyDeal.places = await db.place.findAll({
			where: { id: placeIds },
			attributes: [
				'id',
				'title',
				'slug',
				'excerpt',
				'address',
				'about',
				'contact',
				// 'email',
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
		for (const place of monthlyDeal.places) {
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
	let tempArr = [];
	monthlyDeals?.rows.map((deal, index) => {
		const places =
			deal.places.length > 0 &&
			deal.places?.map((place) => {
				const obj = {
					...place,
					monthlyDeal: {
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
async function reorder(req) {
	await reorderFunction(req.body.order, 'monthly_deal');
}
async function getMonthlyDealsWithoutCount(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit, dealId } = req.query;

	const offset = getOffset(page, limit);
	const whereCondition = {};
	if (dealId) {
		whereCondition.id = dealId;
	}
	const monthlyDeals = await db.monthly_deal.findAll({
		order: [
			['weight', 'ASC'],
			['created_date_time', 'DESC'],
			['modified_date_time', 'DESC'],
		],
		where: {
			...whereCondition,
		},
		include: [
			{
				model: db.user,
				require: true,
				attributes: ['id', 'first_name', 'last_name'],
			},
		],
		attributes: [
			'id',
			'title',
			'status',
			'created_date_time',
			'modified_date_time',
		],
		offset,
		limit,
		raw: true,
	});
	refactorCode(monthlyDeals, [
		{
			title: 'user',
			items: ['id', 'first_name', 'last_name'],
		},
	]);
	for (const monthlyDeal of monthlyDeals) {
		const sub_categories = await db.subcategory_to_monthlydeal.findAll({
			where: {
				monthly_deal_id: monthlyDeal.id,
			},
			attributes: ['sub_category_id'],
			raw: true,
		});
		const subCategoryIds = sub_categories.map(
			(subCategory) => subCategory.sub_category_id,
		);
		monthlyDeal.categories = await db.sub_category.findAll({
			where: { id: subCategoryIds },
			attributes: ['id', 'title'],
			raw: true,
		});
		// const deals = await db.monthly_deal_to_deal.findAll({
		// 	where: {
		// 		monthly_deal_id: monthlyDeal.id,
		// 	},
		// 	attributes: ['deal_id'],
		// 	raw: true,
		// });
		// const dealIds = deals.map((deal) => deal.deal_id);
		// monthlyDeal.deals = await db.deal.findAll({
		// 	where: { id: dealIds },
		// 	attributes: ['id', 'title'],
		// 	raw: true,
		// });
		const places = await db.place_to_monthly_deal.findAll({
			where: {
				monthly_deal_id: monthlyDeal.id,
			},
			attributes: ['place_id'],
			raw: true,
		});
		const placeIds = places.map((deal) => deal.place_id);
		monthlyDeal.places = await db.place.findAll({
			where: { id: placeIds },
			attributes: [
				'id',
				'title',
				'slug',
				'excerpt',
				'address',
				'about',
				'contact',
				// 'email',
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
		for (const place of monthlyDeal.places) {
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
	return monthlyDeals;
}

async function deleteMonthlyDealById(req) {
	const id = req.params.monthlyDealId || req.body.id;
	const deletedMonthlyDeal = await db.monthly_deal.destroy({
		where: { id },
	});

	if (!deletedMonthlyDeal) {
		throw new ApiError(httpStatus.NOT_FOUND, 'MonthlyDeal not found');
	}
	await db.subcategory_to_monthlydeal.destroy({
		where: { monthlyDealId: id },
	});
	await db.place_to_monthly_deal.destroy({
		where: { monthlyDealId: id },
	});

	return deletedMonthlyDeal;
}

async function updateMonthlyDeal(req) {
	const { title, userId, status, dealIds, categoryIds, placeIds } = req.body;
	//console.log(req.body, 'req.body');

	// const monthlyDeal = await getMonthlyDealByTitle(title);

	// if (monthlyDeal) {
	// 	throw new ApiError(
	// 		httpStatus.CONFLICT,
	// 		'This monthlyDeal already exits',
	// 	);
	// }

	// const user = await userService.getUserById(userId);

	// if (!user) {
	// 	throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
	// }
	// const dealIdsArr = dealIds && JSON.parse(dealIds);
	const categoryIdsArr = categoryIds && JSON.parse(categoryIds);
	const placeIdsArr = placeIds && JSON.parse(placeIds);
	const updatedMonthlyDeal = await db.monthly_deal
		.update(
			{ ...req.body },
			{
				where: { id: req.params.monthlyDealId || req.body.id },
				returning: true,
				plain: true,
				raw: true,
			},
		)
		.then(async (data) => {
			const id = req.params.monthlyDealId || req.body.id;
			const deleteCatIds = categoryIdsArr?.length
				? await db.subcategory_to_monthlydeal.destroy({
						where: { monthlyDealId: id },
					})
				: null;
			const placeIds = placeIdsArr?.length
				? await db.place_to_monthly_deal.destroy({
						where: { monthlyDealId: id },
					})
				: null;
			placeIdsArr?.length
				? await db.place_to_monthly_deal
						.destroy({
							where: { monthlyDealId: id },
						})
						.then(() => [])
						.catch((err) => [])
				: [];
			await Promise.all(
				// dealIdsArr?.length
				// 	? dealIdsArr?.map((dealId) => {
				// 			return db.monthly_deal_to_deal.create({
				// 				monthlyDealId: id,
				// 				dealId: dealId,
				// 			});
				// 		})
				// 	: [],

				categoryIdsArr?.length
					? categoryIdsArr?.map((categoryId) => {
							return db.subcategory_to_monthlydeal.create({
								monthlyDealId: id,
								subCategoryId: categoryId,
							});
						})
					: [],
				placeIdsArr?.length
					? placeIdsArr?.map((placeId) => {
							return db.place_to_monthly_deal.create({
								monthlyDealId: id,
								placeId: placeId,
							});
						})
					: [],
			);
			return data[1];
		});

	return updatedMonthlyDeal;
}

module.exports = {
	getMonthlyDeals: () => {},
	getMonthlyDealsWithoutCount,
	createMonthlyDeal,
	deleteMonthlyDealById,
	updateMonthlyDeal,
	getMonthlyDealById,
	getPlaceByMonthlyDealById,
	reorder,
};
