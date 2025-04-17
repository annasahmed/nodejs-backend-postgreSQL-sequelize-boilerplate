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
	getDistance,
	searchManytoMany,
	searchManytoManyDays,
	nearByCondition,
	daysOfWeek,
	convert24to12,
	getDisplayTime,
	checkDeletedCondition,
} = require('../../../utils/globals.js');
const { Op, Sequelize } = require('sequelize');

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
		where: { id: placeIds, status: true, ...checkDeletedCondition },
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

async function getMonthlyDealsWithoutCount(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;

	const {
		page = defaultPage,
		limit = defaultLimit,
		dealId,
		day,
		uspId,
		search,
	} = req.query;
	const latitude = parseFloat(req.headers['latitude']);
	const longitude = parseFloat(req.headers['longitude']);
	// c = nearByCondition(latitude, longitude);

	const whereCondition = {};

	if (dealId) {
		whereCondition.id = dealId;
	}
	const searchKeyword =
		search &&
		search
			.replace(/\s+/g, '-')
			.replace(/-&-/g, '-and-')
			.replace(/'/g, '')
			.replace(/"/g, '');
	const searchCondition = search
		? {
				[Op.or]: [
					{
						slug: {
							[Op.iLike]: `%${searchKeyword}%`,
						},
					},
				],
			}
		: {};

	const monthlyDeals = await db.monthly_deal.findAll({
		order: [
			['weight', 'ASC'],
			// ['id','ASC']
			['created_date_time', 'DESC'],
			['modified_date_time', 'DESC'],
		],
		where: {
			...whereCondition,
		},
		attributes: ['id', 'title'],
		// offset,
		// limit,
		raw: true,
	});
	for (const monthlyDeal of monthlyDeals) {
		let placeCondition = {};

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

		const daysCondition =
			day &&
			[
				'monday',
				'tuesday',
				'wednesday',
				'thursday',
				'friday',
				'saturday',
				'sunday',
			].includes(day.toLowerCase())
				? subCategoryIds?.length
					? await searchManytoManyDays(
							[day],
							'days',
							'place_to_subcategory',
							subCategoryIds,
						)
					: await searchManytoManyDays(
							[day],
							'days',
							'place_to_subcategory',
							-1,
						)
				: {};
		// monthlyDeal.categories = await db.sub_category.findAll({
		// 	where: { id: subCategoryIds },
		// 	attributes: ['id', 'title'],
		// 	raw: true,
		// });

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
		const uspCondition = await searchManytoMany(
			uspId,
			'usp_id',
			'place_to_usp',
		);
		const offset = getOffset(page, limit);

		const monthlyDealPlaces =
			await db.place_to_monthly_deal.findAndCountAll({
				where: {
					monthly_deal_id: monthlyDeal.id,
				},
				attributes: ['place_id'],
				order: [['place_id', 'DESC']],
				// limit,
				// offset,
				raw: true,
			});
		const places = monthlyDealPlaces.rows;
		const placeIds = places.map((deal) => deal.place_id);

		if (daysCondition) {
			if (daysCondition.id) {
				placeCondition.id = placeIds.filter((id) =>
					daysCondition.id.includes(id),
				);
				if (uspCondition.id) {
					placeCondition.id = placeCondition.id.filter((v) =>
						uspCondition.id.includes(v),
					);
				}
			} else {
				placeCondition.id = placeIds;
			}
		} else {
			placeCondition.id = placeIds;
		}

		// if (placeCondition?.id?.length) {
		// 	placeCondition.id = [...new Set(placeCondition.id)];
		// }

		const searchPlaces = await db.place.findAndCountAll({
			where: {
				[Op.and]: [
					{ ...checkDeletedCondition },
					{ ...placeCondition },
					{ ...searchCondition },
					// ...searchCondition,
					// ...locationCondition,
				],
				status: true,
			},
			attributes:
				longitude && latitude
					? [
							'id',
							'title',
							'slug',
							'address',
							'temp_status',
							'trending',
							'latitude',
							'longitude',
							'ratings',
							'reviews',
							[
								Sequelize.literal(
									`(6371 * acos(cos(radians(${latitude})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${longitude})) + sin(radians(${latitude})) * sin(radians(latitude))))`,
								),
								'distance',
							],
						]
					: [
							'id',
							'title',
							'slug',
							'address',
							'temp_status',
							'trending',
							'latitude',
							'longitude',
							'ratings',
							'reviews',
						],
			include: [
				{
					model: db.media,
					required: true,
					attributes: ['logo', 'featured', 'reel'],
				},
				{
					model: db.happening_badge,
					required: false,
					attributes: ['title'],
				},
			],
			order:
				latitude && longitude
					? [
							[Sequelize.literal('distance'), 'ASC'],
							['id', 'DESC'],
						]
					: [['id', 'DESC']],
			limit,
			offset,
			raw: true,
		});
		monthlyDeal.places = searchPlaces.rows;
		refactorCode(monthlyDeal.places, [
			{
				title: 'media',
				items: ['logo', 'featured', 'reel'],
			},
			{
				title: 'happening_badge',
				items: ['title'],
			},
		]);
		// delete monthlyDeal.places;
		for (const place of monthlyDeal.places) {
			const distance = getDistance(
				latitude,
				longitude,
				place.latitude,
				place.longitude,
			);
			place.distance = distance ? distance + ' km' : null;
			await getDisplayTime(place);

			// const sub_categories = await db.place_to_subcategory.findAll({
			// 	where: {
			// 		place_id: place.id,
			// 	},
			// 	attributes: ['sub_category_id'],
			// 	raw: true,
			// });
			// const subCategoryIds = sub_categories.map(
			// 	(subCategory) => subCategory.sub_category_id,
			// );
			// place.sub_categories = await db.sub_category.findAll({
			// 	where: { id: subCategoryIds },
			// 	attributes: ['id', 'title'],
			// 	raw: true,
			// });
			// const cuisines = await db.place_to_cuisine.findAll({
			// 	where: { place_id: place.id },
			// 	attributes: ['cuisine_id'],
			// 	raw: true,
			// });
			// const cuisineIds = cuisines.map((cuisine) => cuisine.cuisine_id);
			// place.cuisines = await db.cuisine.findAll({
			// 	where: { id: cuisineIds },
			// 	attributes: ['id', 'title'],
			// 	raw: true,
			// });

			// const usps = await db.place_to_usp.findAll({
			// 	where: { place_id: place.id },
			// 	attributes: ['usp_id'],
			// 	raw: true,
			// });
			// const uspIds = usps.map((usp) => usp.usp_id);
			// place.usps = await db.usp.findAll({
			// 	where: { id: uspIds },
			// 	attributes: ['id', 'title'],
			// 	raw: true,
			// });
			// place.timings = await db.timing.findAll({
			// 	where: { place_id: place.id },
			// 	attributes: ['id', 'day', 'opening', 'closing'],
			// 	raw: true,
			// });
			// place.happening = await db.happening.findAll({
			// 	where: { place_id: place.id },
			// 	attributes: [
			// 		'id',
			// 		'title',
			// 		'description',
			// 		'user_id',
			// 		// 'status_id',
			// 		// 'created_date_time',
			// 	],
			// 	raw: true,
			// });
			const deals = await db.place_to_deal.findAll({
				where: { place_id: place.id },
				attributes: ['deal_id'],
				raw: true,
			});
			const dealIds = deals.map((deal) => deal.deal_id);
			place.deals = await db.deal.findAll({
				where: { id: dealIds, status: true },
				attributes: ['id', 'title'],
				include: [
					{
						model: db.parent_deal,
						require: true,
						attributes: [
							'id',
							'image',
							'type',
							'discount',
							'title',
						],
					},
				],
				raw: true,
			});
			refactorCode(place.deals, [
				{
					title: 'parent_deal',
					items: ['id', 'image', 'type', 'discount', 'title'],
				},
			]);
			if (place?.deals.length) {
				for (const deal of place.deals) {
					deal.parent_deal.discount = parseFloat(
						deal.parent_deal.discount,
					);
					// deal.parent_deal?.title
					// 	? (deal.parent_deal.discount = deal.parent_deal?.title)
					// 	: null;
					const dealSub_categories =
						await db.deal_to_subcategory.findAll({
							where: {
								deal_id: deal.id,
							},
							attributes: ['sub_category_id'],
							raw: true,
						});
					const dealSubCategoryIds = dealSub_categories.map(
						(subCategory) => subCategory.sub_category_id,
					);
					deal.sub_categories = await db.sub_category.findAll({
						where: { id: dealSubCategoryIds },
						attributes: ['id', 'title'],
						include: [
							{
								model: db.category,
								require: false,
								attributes: ['id', 'name'],
							},
						],
						raw: false,
					});
					let category = '';

					for (const subCat of deal.sub_categories) {
						if (subCat?.category?.name === 'both') {
							category =
								'Foods & Beverages, Lifestyle & Activities';
						} else if (
							!category.includes(subCat?.category?.name) &&
							category !== ''
						) {
							category += `, ${subCat?.category?.name}`;
						} else {
							category = subCat?.category?.name;
						}
					}
					deal.category = category;
				}
			}
		}
		monthlyDeal.page = page;
		monthlyDeal.limit = limit;
		monthlyDeal.total = searchPlaces?.count || 0;

		// monthlyDeal.total = searchPlaces?.count || 0;
		try {
			monthlyDeal.places = monthlyDeal.places.sort(
				(a, b) =>
					a.distance?.replace(' km', '') -
					b.distance?.replace('km', ''),
			); // sort by distance
		} catch (error) {
			monthlyDeal.places = monthlyDeal.places;
		}
	}
	return monthlyDeals;
}

function getRandomObjects(array, count = 8) {
	const shuffledArray = array.sort(() => 0.5 - Math.random());
	return shuffledArray.slice(0, count);
}
async function getHomepageMonthlyDeals(req) {
	const latitude = parseFloat(req.headers['latitude']);
	const longitude = parseFloat(req.headers['longitude']);
	const { page: defaultPage, limit: defaultLimit } = config.pagination;

	const { page = defaultPage, limit = defaultLimit } = req.query;
	const offset = getOffset(page, limit);

	const { rows, count } = await db.monthly_deal.findAndCountAll({
		order: [
			['weight', 'ASC'],
			['created_date_time', 'DESC'],
			['modified_date_time', 'DESC'],
		],
		where: {
			status: true,
		},
		attributes: ['id', 'title'],
		limit,
		offset,
		raw: true,
	});
	const monthlyDeals = [...rows];

	for (const monthlyDeal of monthlyDeals) {
		let placeCondition = {};

		// const sub_categories = await db.subcategory_to_monthlydeal.findAll({
		// 	where: {
		// 		monthly_deal_id: monthlyDeal.id,
		// 	},
		// 	attributes: ['sub_category_id'],
		// 	raw: true,
		// });
		// const subCategoryIds = sub_categories.map(
		// 	(subCategory) => subCategory.sub_category_id,
		// );

		// monthlyDeal.categories = await db.sub_category.findAll({
		// 	where: { id: subCategoryIds },
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
		let placeIds = places.map((deal) => deal.place_id);
		if (placeIds?.length > 8) {
			placeIds = getRandomObjects(placeIds);
		}

		monthlyDeal.places = await db.place.findAll({
			where: { id: placeIds, status: true, ...checkDeletedCondition },
			attributes: [
				'id',
				'title',
				'address',
				'trending',
				'latitude',
				'longitude',
				'ratings',
				'reviews',
			],
			include: [
				{
					model: db.media,
					required: true,
					attributes: ['logo', 'featured', 'reel'],
				},
				{
					model: db.happening_badge,
					required: false,
					attributes: ['title'],
				},
			],
			raw: true,
		});

		refactorCode(monthlyDeal.places, [
			{
				title: 'media',
				items: ['logo', 'featured', 'reel'],
			},
			{
				title: 'happening_badge',
				items: ['title'],
			},
		]);

		for (const place of monthlyDeal.places) {
			const distance = getDistance(
				latitude,
				longitude,
				place.latitude,
				place.longitude,
			);
			place.distance = distance ? distance + ' km' : null;
			// const sub_categories = await db.place_to_subcategory.findAll({
			// 	where: {
			// 		place_id: place.id,
			// 	},
			// 	attributes: ['sub_category_id'],
			// 	raw: true,
			// });
			// const subCategoryIds = sub_categories.map(
			// 	(subCategory) => subCategory.sub_category_id,
			// );
			// place.sub_categories = await db.sub_category.findAll({
			// 	where: { id: subCategoryIds },
			// 	attributes: ['id', 'title'],
			// 	raw: true,
			// });
			const cuisines = await db.place_to_cuisine.findAll({
				where: { place_id: place.id },
				attributes: ['cuisine_id'],
				raw: true,
			});
			// const cuisineIds = cuisines.map((cuisine) => cuisine.cuisine_id);
			if (cuisines?.length && cuisines[0]?.cuisine_id) {
				place.cuisines = await db.cuisine.findAll({
					where: { id: cuisines[0].cuisine_id },
					attributes: ['id', 'title'],
					raw: true,
				});
			}

			const deals = await db.place_to_deal.findAll({
				where: { place_id: place.id },
				attributes: ['deal_id'],
				raw: true,
			});
			const dealIds = deals.map((deal) => deal.deal_id);
			place.deals = await db.deal.findAll({
				where: { id: dealIds, status: true },
				attributes: ['id', 'title'],
				include: [
					{
						model: db.parent_deal,
						require: true,
						attributes: [
							'id',
							'image',
							'type',
							'discount',
							'title',
						],
					},
				],
				raw: true,
			});
			refactorCode(place.deals, [
				{
					title: 'parent_deal',
					items: ['id', 'image', 'type', 'discount', 'title'],
				},
			]);
			place.timings = await db.timing.findAll({
				where: { place_id: place.id },
				attributes: ['id', 'day', 'opening', 'closing'],
				raw: true,
			});
			place.timings = place.timings?.reduce((acc, timing) => {
				if (timing?.opening !== null || timing?.closing !== null) {
					const newTiming = {
						...timing,
						opening: timing?.opening
							? convert24to12(timing.opening)
							: timing?.opening,
						closing: timing?.closing
							? convert24to12(timing.closing)
							: timing?.closing,
					};
					acc.push(newTiming);
				}
				return acc;
			}, []);

			const today = new Date();
			const currentDay = daysOfWeek[today.getDay()];
			const todayTime = place.timings?.filter(
				(v) => v.day === currentDay.toLowerCase() || 'daily',
			)[0];

			if (todayTime) {
				if (
					todayTime?.opening === '00:00' &&
					todayTime?.closing === '23:59'
				) {
					place.displayTime = 'Open 24 hours';
				} else {
					if (todayTime?.closing) {
						place.displayTime = `Open until ${todayTime?.closing}`;
					} else {
						place.displayTime = 'Open 24 hours';
					}
				}
			} else {
				place.displayTime = 'Closed';
			}
			// if (place?.deals.length) {
			// 	for (const deal of place.deals) {
			// 		deal.parent_deal.discount = parseFloat(
			// 			deal.parent_deal.discount,
			// 		);
			// 		const dealSub_categories =
			// 			await db.deal_to_subcategory.findAll({
			// 				where: {
			// 					deal_id: deal.id,
			// 				},
			// 				attributes: ['sub_category_id'],
			// 				raw: true,
			// 			});
			// 		const dealSubCategoryIds = dealSub_categories.map(
			// 			(subCategory) => subCategory.sub_category_id,
			// 		);
			// 		deal.sub_categories = await db.sub_category.findAll({
			// 			where: { id: dealSubCategoryIds },
			// 			attributes: ['id', 'title'],
			// 			include: [
			// 				{
			// 					model: db.category,
			// 					require: false,
			// 					attributes: ['id', 'name'],
			// 				},
			// 			],
			// 			raw: false,
			// 		});
			// 		let category = '';

			// 		for (const subCat of deal.sub_categories) {
			// 			if (subCat?.category?.name === 'both') {
			// 				category =
			// 					'Foods & Beverages, Lifestyle & Activities';
			// 			} else if (
			// 				!category.includes(subCat?.category?.name) &&
			// 				category !== ''
			// 			) {
			// 				category += `, ${subCat?.category?.name}`;
			// 			} else {
			// 				category = subCat?.category?.name;
			// 			}
			// 		}
			// 		deal.category = category;
			// 	}
			// }
		}
		try {
			monthlyDeal.places = monthlyDeal.places.sort(
				(a, b) =>
					a.distance?.replace(' km', '') -
					b.distance?.replace('km', ''),
			); // sort by distance
		} catch (error) {
			monthlyDeal.places = monthlyDeal.places;
		}
	}
	return { data: monthlyDeals, limit, total: count, page };
}
async function getHomepageMonthlyDealsDelete(req) {
	const latitude = parseFloat(req.headers['latitude']);
	const longitude = parseFloat(req.headers['longitude']);
	const monthlyDeals = await db.monthly_deal.findAll({
		order: [
			['weight', 'ASC'],
			['created_date_time', 'DESC'],
			['modified_date_time', 'DESC'],
		],
		where: {
			status: true,
		},
		attributes: ['id', 'title'],
		raw: true,
	});

	for (const monthlyDeal of monthlyDeals) {
		let placeCondition = {};

		// const sub_categories = await db.subcategory_to_monthlydeal.findAll({
		// 	where: {
		// 		monthly_deal_id: monthlyDeal.id,
		// 	},
		// 	attributes: ['sub_category_id'],
		// 	raw: true,
		// });
		// const subCategoryIds = sub_categories.map(
		// 	(subCategory) => subCategory.sub_category_id,
		// );

		// monthlyDeal.categories = await db.sub_category.findAll({
		// 	where: { id: subCategoryIds },
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
		let placeIds = places.map((deal) => deal.place_id);
		if (placeIds?.length > 8) {
			placeIds = getRandomObjects(placeIds);
		}

		monthlyDeal.places = await db.place.findAll({
			where: { id: placeIds, status: true, ...checkDeletedCondition },
			attributes: [
				'id',
				'title',
				'address',
				'trending',
				'latitude',
				'longitude',
				'ratings',
				'reviews',
			],
			include: [
				{
					model: db.media,
					required: true,
					attributes: ['logo', 'featured', 'reel'],
				},
				{
					model: db.happening_badge,
					required: false,
					attributes: ['title'],
				},
			],
			raw: true,
		});

		refactorCode(monthlyDeal.places, [
			{
				title: 'media',
				items: ['logo', 'featured', 'reel'],
			},
			{
				title: 'happening_badge',
				items: ['title'],
			},
		]);

		for (const place of monthlyDeal.places) {
			const distance = getDistance(
				latitude,
				longitude,
				place.latitude,
				place.longitude,
			);
			place.distance = distance ? distance + ' km' : null;
			// const sub_categories = await db.place_to_subcategory.findAll({
			// 	where: {
			// 		place_id: place.id,
			// 	},
			// 	attributes: ['sub_category_id'],
			// 	raw: true,
			// });
			// const subCategoryIds = sub_categories.map(
			// 	(subCategory) => subCategory.sub_category_id,
			// );
			// place.sub_categories = await db.sub_category.findAll({
			// 	where: { id: subCategoryIds },
			// 	attributes: ['id', 'title'],
			// 	raw: true,
			// });
			// const cuisines = await db.place_to_cuisine.findAll({
			// 	where: { place_id: place.id },
			// 	attributes: ['cuisine_id'],
			// 	raw: true,
			// });
			// const cuisineIds = cuisines.map((cuisine) => cuisine.cuisine_id);
			// place.cuisines = await db.cuisine.findAll({
			// 	where: { id: cuisineIds },
			// 	attributes: ['id', 'title'],
			// 	raw: true,
			// });

			const deals = await db.place_to_deal.findAll({
				where: { place_id: place.id },
				attributes: ['deal_id'],
				raw: true,
			});

			const dealIds = deals.map((deal) => deal.deal_id);

			place.deals = await db.deal.findAll({
				where: { id: dealIds, status: true },
				attributes: ['id', 'title'],
				include: [
					{
						model: db.parent_deal,
						require: true,
						attributes: ['id', 'image', 'type', 'discount'],
					},
				],
				raw: true,
			});
			refactorCode(place.deals, [
				{
					title: 'parent_deal',
					items: ['id', 'image', 'type', 'discount'],
				},
			]);
			if (place?.deals.length) {
				for (const deal of place.deals) {
					deal.parent_deal.discount = parseFloat(
						deal.parent_deal.discount,
					);
					const dealSub_categories =
						await db.deal_to_subcategory.findAll({
							where: {
								deal_id: deal.id,
							},
							attributes: ['sub_category_id'],
							raw: true,
						});
					const dealSubCategoryIds = dealSub_categories.map(
						(subCategory) => subCategory.sub_category_id,
					);
					deal.sub_categories = await db.sub_category.findAll({
						where: { id: dealSubCategoryIds },
						attributes: ['id', 'title'],
						include: [
							{
								model: db.category,
								require: false,
								attributes: ['id', 'name'],
							},
						],
						raw: false,
					});
					let category = '';

					for (const subCat of deal.sub_categories) {
						if (subCat?.category?.name === 'both') {
							category =
								'Foods & Beverages, Lifestyle & Activities';
						} else if (
							!category.includes(subCat?.category?.name) &&
							category !== ''
						) {
							category += `, ${subCat?.category?.name}`;
						} else {
							category = subCat?.category?.name;
						}
					}
					deal.category = category;
				}
			}
		}
		try {
			monthlyDeal.places = monthlyDeal.places.sort(
				(a, b) =>
					a.distance?.replace(' km', '') -
					b.distance?.replace('km', ''),
			); // sort by distance
		} catch (error) {
			monthlyDeal.places = monthlyDeal.places;
		}
	}
	return monthlyDeals;
}

module.exports = {
	getMonthlyDeals: () => {},
	getMonthlyDealsWithoutCount,
	getMonthlyDealById,
	getHomepageMonthlyDeals,
	getHomepageMonthlyDealsDelete,
};
