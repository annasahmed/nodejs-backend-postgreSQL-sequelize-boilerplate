const { getOffset } = require('../../../utils/query');
const config = require('../../../config/config.js');
const db = require('../../../db/models').default;
const { Op } = require('sequelize');
const Sequelize = require('sequelize');

const {
	refactorCode,
	searchManytoMany,
	searchManytoManyTitle,
	nearByCondition,
	getDistance,
	searchManytoManyDays,
	convert24to12,
	searchManytoManyDaysFilters,
	checkDeletedCondition,
	daysOfWeek,
	getDisplayTime,
} = require('../../../utils/globals.js');

async function getPlaceById(id, req) {
	const latitude = parseFloat(req.headers['latitude']);
	const longitude = parseFloat(req.headers['longitude']);
	const places = await db.place.findAndCountAll({
		where: { id },
		// raw: true,
		include: [
			{
				model: db.packages,
				require: true,
				attributes: ['name', 'description', 'fee', 'month'],
			},
			{
				model: db.subscription_status,
				require: true,
				attributes: ['name'],
			},
			{
				model: db.emirate,
				require: false,
				attributes: ['name'],
			},
			{
				model: db.area,
				require: true,
				attributes: ['name'],
			},
			{
				model: db.user,
				require: true,
				attributes: ['first_name', 'last_name'],
			},
			{
				model: db.media,
				require: true,
				attributes: ['logo', 'featured', 'reel'],
			},
		],
		attributes: [
			'id',
			'title',
			'slug',
			'excerpt',
			// 'start_date',
			'about',
			'address',
			'iframe',
			'contact',
			'website',
			'hotel',
			'ratings',
			'reviews',
			// 'intagram',
			'instagram',
			'booking_url',
			'menu',
			'location',
			'latitude',
			'longitude',
			'status',
			'trending',
			'is_commission',
			'commission',
			'is_ecommerce',
			'ecommerce_code',
			'ecommerce_affiliation',
			'place_pin',
			'created_date_time',
			'modified_date_time',
			'temp_status',
		],
		raw: true,
	});
	const distance = getDistance(
		latitude,
		longitude,
		places.rows[0]?.latitude,
		places.rows[0]?.longitude,
	);
	places.rows[0].distance = distance ? distance + ' km' : null;

	refactorCode(places, [
		{
			title: 'subscription',
			items: ['name', 'description', 'fee', 'month'],
		},
		{
			title: 'subscription_status',
			items: ['name'],
		},
		{
			title: 'emirate',
			items: ['name'],
		},
		{
			title: 'area',
			items: ['name'],
		},
		//
		{
			title: 'user',
			items: ['first_name', 'last_name'],
		},
		{
			title: 'media',
			items: ['logo', 'featured', 'reel'],
		},
	]);

	for (const place of places?.rows) {
		const sub_categories = await db.place_to_subcategory.findAll({
			where: {
				place_id: place.id,
			},
			attributes: ['sub_category_id', 'days'],
			raw: true,
		});
		const subCategoryIds = sub_categories.map(
			(subCategory) => subCategory.sub_category_id,
		);
		place.sub_categories = await db.sub_category.findAll({
			where: { id: subCategoryIds },
			attributes: ['id', 'title', 'color', 'category_id'],
			raw: true,
		});

		place.sub_categories = place.sub_categories?.map((v) => {
			if (v.id != 14) {
				if (!place.category_id) {
					place.category_id = v.category_id;
				} else {
					if (place.category_id != v.category_id) {
						place.category_id = 3;
					}
				}
			}
			const id = sub_categories.find((id) => {
				return id.sub_category_id === v.id;
			});
			return { ...v, days: id.days };
		});
		// place.category_id = place.category;
		// if (place.category) {
		// 	place.category = (
		// 		await db.category.findOne({
		// 			where: {
		// 				id: place.category,
		// 			},
		// 			attributes: ['name'],
		// 		})
		// 	)?.name;
		// }
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
		// place.timings = place.timings?.filter(
		// 	(timing) => timing?.opening || timing?.closing,
		// );
		// place.timings = place.timings?.map((timing) => {
		// 	if (timing?.opening && timing?.closing) {
		// 		return {
		// 			...timing,
		// 			opening: convert24to12(timing?.opening),
		// 			closing: convert24to12(timing?.closing),
		// 		};
		// 	}
		// });
		place.timings = place.timings?.reduce((acc, timing) => {
			if (timing?.opening || timing?.closing) {
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
		// const grouped = place.timings?.reduce((acc, curr) => {
		// 	const key = `${curr.opening} - ${curr.closing}`;
		// 	if (!acc[key]) {
		// 		acc[key] = [];
		// 	}
		// 	acc[key].push(curr.day);
		// 	return acc;
		// }, {});

		// // Format the result
		// const result = Object.entries(grouped).map(([timing, days]) => {
		// 	const daysRange =
		// 		days.length > 1
		// 			? `${days[0]} - ${days[days.length - 1]}`
		// 			: days[0];
		// 	return {
		// 		days: daysRange,
		// 		timing: timing,
		// 	};
		// });

		place.happening = await db.happening.findAll({
			where: { place_id: place.id, status: [true, null] },
			order: [['weight', 'ASC']],
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
		const deals = await db.place_to_deal.findAll({
			where: { place_id: place.id },
			attributes: ['deal_id'],
			raw: true,
		});

		const dealIds = deals.map((deal) => deal.deal_id);
		place.deals = await db.deal.findAll({
			where: { id: dealIds, status: true },
			attributes: ['id', 'title'],
			raw: true,
		});
		place.deals = await db.deal.findAll({
			where: { id: dealIds, status: true },
			attributes: ['id', 'title'],
			include: [
				{
					model: db.parent_deal,
					require: true,
					attributes: ['id', 'image', 'type', 'discount', 'title'],
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
				const dealSub_categories = await db.deal_to_subcategory.findAll(
					{
						where: {
							deal_id: deal.id,
						},
						attributes: ['sub_category_id'],
						raw: true,
					},
				);
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
						category = 'Foods & Beverages, Lifestyle & Activities';
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
	// for (const place of places?.rows) {
	// 	cuisines = await db.place_to_cuisine.findAll({
	// 		where: { place_id: place.id },

	// 		attributes: ['cuisine_id'],
	// 		raw: true,
	// 	});
	// 	const ids = cuisines?.map((cuisine) => cuisine.cuisine_id);
	// 	place.cuisines = await db.cuisine.findAll({
	// 		where: {
	// 			id: {
	// 				[db.Sequelize.Op.or]: ids,
	// 			},
	// 		},

	// 		attributes: ['id', 'title'],
	// 		raw: true,
	// 	});
	// }
	// for (const place of places?.rows) {
	// 	usps = await db.place_to_usp.findAll({
	// 		where: { place_id: place.id },

	// 		attributes: ['usp_id'],
	// 		raw: true,
	// 	});
	// 	const ids = usps?.map((usp) => usp.usp_id);

	// 	place.usps = await db.usp.findAll({
	// 		where: {
	// 			id: {
	// 				[db.Sequelize.Op.or]: ids,
	// 			},
	// 		},

	// 		attributes: ['id', 'title'],
	// 		raw: true,
	// 	});
	// }
	// for (const place of places?.rows) {
	// 	place.timings = await db.timing.findAll({
	// 		where: { place_id: place.id },
	// 		attributes: ['id', 'day', 'opening', 'closing'],
	// 		raw: true,
	// 	});
	// }

	return places;
}
async function getPlaceByIdWithoutCount(id, req, attr, include) {
	const latitude = parseFloat(req.headers['latitude']);
	const longitude = parseFloat(req.headers['longitude']);
	const place = await db.place.findOne({
		where: { id },
		// raw: true,
		include: include || [
			{
				model: db.packages,
				require: true,
				attributes: ['name', 'description', 'fee', 'month'],
			},
			{
				model: db.subscription_status,
				require: true,
				attributes: ['name'],
			},
			{
				model: db.emirate,
				require: false,
				attributes: ['name'],
			},
			{
				model: db.area,
				require: true,
				attributes: ['name'],
			},
			{
				model: db.user,
				require: true,
				attributes: ['first_name', 'last_name'],
			},
			{
				model: db.media,
				require: true,
				attributes: ['logo', 'featured', 'reel'],
			},
		],
		attributes: attr,
		raw: true,
	});
	const distance = getDistance(
		latitude,
		longitude,
		place?.latitude,
		place?.longitude,
	);
	place.distance = distance ? distance + ' km' : null;
	await getDisplayTime(place);

	refactorCode(
		[place],
		[
			{
				title: 'media',
				items: ['logo', 'featured', 'reel'],
			},
			{
				title: 'happening_badge',
				items: ['title'],
			},
		],
	);

	const deals = await db.place_to_deal.findAll({
		where: { place_id: place.id },
		attributes: ['deal_id'],
		raw: true,
	});

	const dealIds = deals.map((deal) => deal.deal_id);
	place.deals = await db.deal.findAll({
		where: { id: dealIds, status: true },
		attributes: ['id', 'title'],
		raw: true,
	});
	place.deals = await db.deal.findAll({
		where: { id: dealIds, status: true },
		attributes: ['id', 'title'],
		include: [
			{
				model: db.parent_deal,
				require: true,
				attributes: ['id', 'image', 'type', 'discount', 'title'],
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
			deal.parent_deal.discount = parseFloat(deal.parent_deal.discount);
			const dealSub_categories = await db.deal_to_subcategory.findAll({
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
					category = 'Foods & Beverages, Lifestyle & Activities';
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
	return place;
}

async function getFilteredPlaces(req) {
	const latitude = parseFloat(req.headers['latitude']);
	const longitude = parseFloat(req.headers['longitude']);
	const radius = 10; // 10 km radius
	const { categoryId, uspId, day, areaId } = req.query;

	const uspCondition = await searchManytoMany(
		uspId,
		'usp_id',
		'place_to_usp',
	);
	const subcategoryCondition = await searchManytoMany(
		categoryId,
		'sub_category_id',
		'place_to_subcategory',
	);
	const daysCondition = categoryId
		? day
			? await searchManytoManyDays(
				[day],
				'days',
				'place_to_subcategory',
				categoryId,
			)
			: {}
		: await searchManytoManyDaysFilters(day, 'day', 'timing');
	const locationCondition = {};
	if (latitude && longitude) {
		locationCondition.latitude = {
			[Op.between]: [
				latitude - radius / 111.12,
				latitude + radius / 111.12,
			],
		};
		locationCondition.longitude = {
			[Op.between]: [
				longitude -
				radius / (111.12 * Math.cos((latitude * Math.PI) / 180)),
				longitude +
				radius / (111.12 * Math.cos((latitude * Math.PI) / 180)),
			],
		};
	}
	const filterCondition = {
		[Sequelize.Op.and]: [],
	};
	if (categoryId) {
		if (subcategoryCondition?.id) {
			filterCondition[Sequelize.Op.and].push(subcategoryCondition);
		} else {
			filterCondition[Sequelize.Op.and].push({ id: [] });
		}
	}
	if (uspId) {
		if (uspCondition?.id) {
			filterCondition[Sequelize.Op.and].push(uspCondition);
		} else {
			filterCondition[Sequelize.Op.and].push({ id: [] });
		}
	}
	if (day) {
		if (daysCondition?.id) {
			filterCondition[Sequelize.Op.and].push(daysCondition);
		} else {
			filterCondition[Sequelize.Op.and].push({ id: [] });
		}
	}
	if (areaId) {
		filterCondition.area_id = areaId;
	}

	const places = await db.place.findAndCountAll({
		where: {
			[Op.and]: [
				{ ...checkDeletedCondition },
				{ ...filterCondition },
				{ ...locationCondition },
				// ...searchCondition,
				// ...locationCondition,
			],
			status: true,
		},
		// where: { ...filterCondition, ...locationCondition, status: true },
		attributes: ['id', 'area_id'],
		raw: true,
	});
	const placeIds = places.rows.map((v) => v.id);
	const placeAreaIds = places.rows.map((v) => v.area_id || 0);
	places.areas = await db.area.findAll({
		where: { id: placeAreaIds },
		attributes: [
			'id',
			'name',
			[
				db.Sequelize.fn('COUNT', db.Sequelize.col('places.id')),
				'placesCount',
			],
		],
		include: [
			{
				model: db.place,
				attributes: [],
			},
		],
		group: ['area.id'],
	});
	places.subCategories = [];
	if (categoryId || uspId || day) {
		for (const place of places.rows) {
			const searchObj = {
				place_id: place.id,
			};
			if (typeof categoryId !== 'undefined') {
				searchObj.sub_category_id = categoryId;
			}
			const sub_categories = await db.place_to_subcategory.findAll({
				where: {
					...searchObj,
				},
				attributes: ['sub_category_id'],
				raw: true,
			});
			const subCategoryIds = sub_categories.map(
				(subCategory) => subCategory.sub_category_id,
			);
			await db.sub_category
				.findAll({
					where: { id: subCategoryIds },
					attributes: ['id', 'title'],
					raw: true,
				})
				.then(async (res) => {
					if (categoryId) {
						await Promise.all(
							res
								? res?.map(async (subCategory, index) => {
									let uspsOfSubcategory =
										await db.usp_to_subcategory.findAll(
											{
												where: {
													sub_category_id:
														subCategory.id,
												},
												// group: ['usp_id'],
												raw: true,
											},
										);
									const usps =
										await db.place_to_usp.count({
											where: {
												usp_id: uspsOfSubcategory.map(
													(item) => item.uspId,
												),
												place_id: placeIds,
												// ...searchObj,
											},
											group: ['usp_id'],
											raw: true,
										});
									res[index].places = usps.count;
									const uspsArr = await db.usp.findAll({
										where: {
											id: usps?.map(
												(item) => item.usp_id,
											),
										},
										attributes: ['id', 'title'],
										raw: true,
									});
									const uspsWithPlaces = uspsArr.map(
										(usp) => ({
											...usp,
											places:
												usps?.find(
													(row) =>
														row.usp_id ===
														usp.id,
												)?.count || 0,
										}),
									);
									// res[index].places = usps;
									res[index].usps = uspsWithPlaces.sort(
										(a, b) => b.places - a.places,
									);
									// res[index].usps = uspsWithPlaces;
								})
								: [],
							places.subCategories.push(...res),
						);
					} else {
						places.subCategories.push(...res);
					}
				});
		}
		const uniqueSubCategories = places.subCategories.filter(
			(subCategory, index, self) =>
				index === self.findIndex((s) => s.id === subCategory.id),
		);
		places.subCategories = uniqueSubCategories;
	}
	delete places['rows'];
	return places;
	return { places, daysCondition, subcategoryCondition, chkday };
}

async function getPlacesCount(req) {
	const places = await db.place.count({
		where: {
			...checkDeletedCondition,
			status: true,
		},
		col: 'id',
	});
	return places;
}

async function getPlaces(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;

	const latitude = parseFloat(req.headers['latitude']);
	const longitude = parseFloat(req.headers['longitude']);
	// const locationCondition = nearByCondition(latitude, longitude);
	let {
		page = defaultPage,
		limit = defaultLimit,
		search,
		categoryId,
		cuisineId,
		uspId,
		day,
		timing,
		areaId,
		latitudeDelta,
		longitudeDelta,
		map,
	} = req.query;

	let latitudeQuery = req.query.latitude;
	let longitudeQuery = req.query.longitude;
	if (
		map &&
		latitudeDelta &&
		longitudeDelta &&
		latitudeQuery &&
		longitudeQuery
	) {
		// get places having longitude and longitude between the provided viewport
	}
	// const attributes = ['title'];
	const attributes = ['hotel', 'address', 'about'];
	// const integerAttributes = [];
	// const stringAttributes = [];
	// attributes.forEach((attr) => {
	// 	if (db.place.rawAttributes[attr].type instanceof Sequelize.INTEGER) {
	// 		integerAttributes.push(attr);
	// 	} else {
	// 		stringAttributes.push(attr);
	// 	}
	// });
	let searchUsp = search;

	let uspSearchCondition = {};

	if (searchUsp) {
		const usp = (
			await db.usp.findAll({
				where: {
					title: {
						[Op.iLike]: `%${searchUsp}%`,
					},
				},
				attributes: ['id'],
			})
		)?.map((v) => v.id);
		if (usp) {
			uspSearchCondition = await searchManytoMany(
				usp,
				'usp_id',
				'place_to_usp',
			);
		}
	}
	let usps = [];
	if (categoryId) {
		let usp = await db.usp_to_subcategory.findAll({
			where: {
				sub_category_id: categoryId,
			},
			// group: ['usp_id'],
			raw: true,
		});

		usps = await db.usp.findAll({
			where: {
				id: usp?.map((item) => item.uspId),
			},
			attributes: ['id', 'title'],
			raw: true,
		});
	}
	search = search && decodeURIComponent(search);
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
						[Op.iLike]: `${searchKeyword}`,
					},
				},
				{
					slug: {
						[Op.iLike]: `${searchKeyword}%`,
					},
				},
				{
					slug: {
						[Op.iLike]: `%${searchKeyword}%`,
					},
				},
				// Containing the search term for other attributes
				...attributes.map((attr) => ({
					[attr]: { [Op.iLike]: `%${search}%` },
				})),
				{
					...uspSearchCondition,
				},
			],
		}
		: {};

	const offset = getOffset(page, limit);

	// const timingCondition = await searchManytoManyTiming(
	// 	timing,
	// 	'usp_id',
	// 	'timing',
	// );
	const uspCondition = await searchManytoMany(
		uspId,
		'usp_id',
		'place_to_usp',
	);
	const subcategoryCondition = await searchManytoMany(
		categoryId,
		'sub_category_id',
		'place_to_subcategory',
	);
	// const daysCondition = {};
	const daysCondition = categoryId
		? day
			? await searchManytoManyDays(
				[day],
				'days',
				'place_to_subcategory',
				categoryId,
			)
			: {}
		: await searchManytoManyDaysFilters(day, 'day', 'timing');
	// const cuisineCondition = await searchManytoMany(
	// 	cuisineId,
	// 	'cuisine_id',
	// 	'place_to_cuisine',
	// );

	const happeningTitleCondition = await searchManytoManyTitle(
		search,
		'title',
		'happening',
	);
	const happeningDescriptionCondition = await searchManytoManyTitle(
		search,
		'description',
		'happening',
	);

	// const daysCondition = categoryId
	// 	? day
	// 		? await searchManytoManyDaysArrNew(
	// 				[day],
	// 				'days',
	// 				'place_to_subcategory',
	// 				categoryId,
	// 			)
	// 		: {}
	// 	: await searchManytoManyArray(day, 'day', 'timing');

	// //console.log(
	// 	{ cond1 },
	// 	{ cond2 },
	// 	{ daysCondition },
	// 	{ subcategoryCondition },
	// 	'chkking conditions',
	// );
	const ids = [...happeningDescriptionCondition, ...happeningTitleCondition];
	// const ids = !searchCondition[Op.or]?.length
	// 	? [...happeningDescriptionCondition, ...happeningTitleCondition]
	// 	: [];

	const uniqueIds = [...new Set(ids)];

	const idConditions = uniqueIds.map((id) => ({ id }));
	// WHEN "hotel" ILIKE '%${search}%' THEN 2
	// WHEN "place"."address" ILIKE '%${search}%' THEN 3
	// WHEN "place"."about" ILIKE '%${search}%' THEN 4
	// WHEN "place"."website" ILIKE '%${search}%' THEN 5

	searchCondition[Op.or] = [
		...(searchCondition[Op.or] || []),
		...idConditions,
	];

	// let whereCondition = {};
	const whereCondition = {
		[Sequelize.Op.and]: [],
	};
	whereCondition[Op.and] = [];
	if (searchCondition[Op.or] && searchCondition[Op.or].length > 0) {
		whereCondition[Op.and].push(searchCondition);
	}

	if (categoryId) {
		if (subcategoryCondition?.id) {
			whereCondition[Sequelize.Op.and].push(subcategoryCondition);
		} else {
			whereCondition[Sequelize.Op.and].push({ id: [] });
		}
	}
	if (uspId) {
		if (uspCondition?.id) {
			whereCondition[Sequelize.Op.and].push(uspCondition);
		} else {
			whereCondition[Sequelize.Op.and].push({ id: [] });
		}
	}
	if (day) {
		if (daysCondition?.id) {
			whereCondition[Sequelize.Op.and].push(daysCondition);
		} else {
			whereCondition[Sequelize.Op.and].push({ id: [] });
		}
	}
	if (areaId) {
		whereCondition.area_id = areaId;
	}
	// if (timing) {
	// 	whereCondition[Op.and] = [
	// 		...(whereCondition[Op.and] || []),
	// 		{ id: timingCondition },
	// 	];
	// }
	// let whereCondition = {};
	// if (searchCondition[Op.or] && searchCondition[Op.or].length > 0) {
	// 	whereCondition[Op.and] = [searchCondition];
	// }

	// if (categoryId) {
	// 	if (day) {
	// 		whereCondition[Op.and] = [
	// 			...(whereCondition[Op.and] || []),
	// 			{ id: daysCondition },
	// 		];
	// 	} else {
	// 		whereCondition[Op.and] = [
	// 			...(whereCondition[Op.and] || []),
	// 			{ id: subcategoryCondition },
	// 		];
	// 	}
	// } else {
	// 	if (day) {
	// 		whereCondition[Op.and] = [
	// 			...(whereCondition[Op.and] || []),
	// 			{ id: daysCondition },
	// 		];
	// 	}
	// }
	// if (cuisineId) {
	// 	whereCondition[Op.and] = [
	// 		...(whereCondition[Op.and] || []),
	// 		{ id: cuisineCondition },
	// 	];
	// }
	// if (uspId) {
	// 	whereCondition[Op.and] = [
	// 		...(whereCondition[Op.and] || []),
	// 		{ id: uspCondition },
	// 	];
	// }
	// if (timing) {
	// 	whereCondition[Op.and] = [
	// 		...(whereCondition[Op.and] || []),
	// 		{ id: timingCondition },
	// 	];
	// }
	let orderCondition;
	// if (search.includes("'")) {
	// 	orderCondition = Sequelize.literal(`
	// 		CASE
	// 		  WHEN "place"."title" ILIKE '${'search'}' THEN 1
	// 		  ELSE 6
	// 		END
	// 	  `);
	// } else {
	orderCondition = Sequelize.literal(`
		CASE
		  WHEN "place"."slug" ILIKE '${searchKeyword}' THEN 1
		  WHEN "place"."slug" ILIKE '${searchKeyword}%' THEN 2
		  WHEN "place"."slug" ILIKE '%${searchKeyword}%' THEN 3
		  ELSE 6
		END
	  `);
	// }

	const order = search
		? latitude && longitude
			? [
				[orderCondition], // Apply custom order condition first
				[Sequelize.literal('distance'), 'ASC'], // Order by distance if latitude and longitude are provided
				['id', 'DESC'], // Fallback to ordering by ID descending
			]
			: [
				[orderCondition], // Apply custom order condition
				['id', 'DESC'], // Fallback to ordering by ID descending
			]
		: latitude && longitude
			? [
				[Sequelize.literal('distance'), 'ASC'], // Order by distance if latitude and longitude are provided
				['id', 'DESC'], // Fallback to ordering by ID descending
			]
			: [['id', 'DESC']];

	const places = await db.place.findAndCountAll({
		where: {
			[Op.and]: [
				{ ...checkDeletedCondition },
				{ ...whereCondition },
				// ...searchCondition,
				// ...locationCondition,
			],
			status: true,
			// ...(map &&
			// latitudeDelta &&
			// longitudeDelta &&
			// latitudeQuery &&
			// longitudeQuery
			// 	? {
			// 			latitude: {
			// 				[Sequelize.Op.between]: [
			// 					parseFloat(latitudeQuery) -
			// 						parseFloat(latitudeDelta) / 2,
			// 					parseFloat(latitudeQuery) +
			// 						parseFloat(latitudeDelta) / 2,
			// 				],
			// 			},
			// 			longitude: {
			// 				[Sequelize.Op.between]: [
			// 					parseFloat(longitudeQuery) -
			// 						parseFloat(longitudeDelta) / 2,
			// 					parseFloat(longitudeQuery) +
			// 						parseFloat(longitudeDelta) / 2,
			// 				],
			// 			},
			// 		}
			// 	: {}),
		},
		include: [
			{
				model: db.media,
				required: false,
				attributes: ['logo', 'featured', 'reel'],
			},
			{
				model: db.happening_badge,
				required: false,
				attributes: ['title'],
			},
		],

		attributes:
			longitude && latitude
				? [
					'id',
					'title',
					'address',
					// 'temp_status',
					'trending',
					'latitude',
					'longitude',
					'ratings',
					'reviews',
					'slug',
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
					'address',
					// 'temp_status',
					'trending',
					'latitude',
					'longitude',
					'ratings',
					'reviews',
					'slug',
				],

		// order:
		// similarity(title, 'search'),
		// order: [
		// 	,
		// 	latitude && longitude
		// 		? [
		// 				[orderCondition],
		// 				latitude &&
		// 					longitude && [Sequelize.literal('distance'), 'ASC'],
		// 				['id', 'DESC'],
		// 			]
		// 		: [[orderCondition], ['id', 'DESC']],
		// ],
		order,

		offset,
		limit,
		raw: true,
	});

	refactorCode(places, [
		{
			title: 'media',
			items: ['logo', 'featured', 'reel'],
		},
		{
			title: 'happening_badge',
			items: ['title'],
		},
	]);

	for (const place of places.rows) {
		const distance = getDistance(
			latitude,
			longitude,
			place.latitude,
			place.longitude,
		);
		place.distance = distance ? distance + ' km' : null;
		if (map && place.media?.logo && place.media.logo[0]) {
			place.media.mapLogo = place.media.logo[0].replace(
				/(\.[a-z]+)(\.part\d+)?$/,
				'_map$1$2',
			);
		}
		// const { rating, user_ratings_total } = await getGoogleRating(
		// 	place.latitude,
		// 	place.longitude,
		// );
		// place.rating = rating;
		// place.reviews = user_ratings_total;
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

		// const sub_categories = await db.place_to_subcategory.findAll({
		// 	where: {
		// 		place_id: place.id,
		// 	},
		// 	attributes: ['sub_category_id', 'days'],
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
					attributes: ['id', 'image', 'type', 'discount', 'title'],
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
		await getDisplayTime(place);
		// for (const deal of place.deals) {
		// 	deal.parent_deal.discount = parseFloat(deal.parent_deal.discount);

		// 	let category = '';
		// 	// if (deal?.parent_deal) {
		// 	// 	place.deal.parent_deal.discount = parseFloat(
		// 	// 		deal.parent_deal?.discount,
		// 	// 	);
		// 	// }
		// 	const sub_categories = await db.deal_to_subcategory.findAll({
		// 		where: {
		// 			deal_id: deal.id,
		// 		},
		// 		attributes: ['sub_category_id'],
		// 		raw: true,
		// 	});
		// 	const subCategoryIds = sub_categories.map(
		// 		(subCategory) => subCategory.sub_category_id,
		// 	);
		// 	const dealSub_categories = await db.sub_category.findAll({
		// 		where: { id: subCategoryIds, status: true },
		// 		attributes: ['id', 'title'],
		// 		include: [
		// 			{
		// 				model: db.category,
		// 				require: false,
		// 				attributes: ['id', 'name'],
		// 			},
		// 		],
		// 		raw: false,
		// 	});
		// 	for (const subCat of dealSub_categories) {
		// 		if (subCat?.category?.name === 'Both') {
		// 			category = 'Foods & Beverages, Lifestyle & Activities';
		// 		} else if (
		// 			!category.includes(subCat?.category?.name) &&
		// 			category !== ''
		// 		) {
		// 			category += `, ${subCat?.category?.name}`;
		// 		} else {
		// 			category = subCat?.category?.name;
		// 		}
		// 	}
		// 	deal.category = category;
		// }
	}

	places.page = page;
	places.limit = limit;
	places.usps = usps;
	return places;
}
async function getNearByPlaces(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;

	const latitude = parseFloat(req.headers['latitude']);
	const longitude = parseFloat(req.headers['longitude']);
	// const locationCondition = nearByCondition(latitude, longitude);
	let {
		page = defaultPage,
		limit = defaultLimit,
		search,
		categoryId,
		cuisineId,
		uspId,
		day,
		timing,
		areaId,
		latitudeDelta,
		longitudeDelta,
		map,
	} = req.query;

	let latitudeQuery = req.query.latitude;
	let longitudeQuery = req.query.longitude;
	if (
		map &&
		latitudeDelta &&
		longitudeDelta &&
		latitudeQuery &&
		longitudeQuery
	) {
		// get places having longitude and longitude between the provided viewport
	}
	// const attributes = ['title'];
	const attributes = ['hotel', 'address', 'about'];
	// const integerAttributes = [];
	// const stringAttributes = [];
	// attributes.forEach((attr) => {
	// 	if (db.place.rawAttributes[attr].type instanceof Sequelize.INTEGER) {
	// 		integerAttributes.push(attr);
	// 	} else {
	// 		stringAttributes.push(attr);
	// 	}
	// });
	let searchUsp = search;

	let uspSearchCondition = {};

	if (searchUsp) {
		const usp = (
			await db.usp.findAll({
				where: {
					title: {
						[Op.iLike]: `%${searchUsp}%`,
					},
				},
				attributes: ['id'],
			})
		)?.map((v) => v.id);
		if (usp) {
			uspSearchCondition = await searchManytoMany(
				usp,
				'usp_id',
				'place_to_usp',
			);
		}
	}

	search = search && decodeURIComponent(search);
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
						[Op.iLike]: `${searchKeyword}`,
					},
				},
				{
					slug: {
						[Op.iLike]: `${searchKeyword}%`,
					},
				},
				{
					slug: {
						[Op.iLike]: `%${searchKeyword}%`,
					},
				},
				// Containing the search term for other attributes
				...attributes.map((attr) => ({
					[attr]: { [Op.iLike]: `%${search}%` },
				})),
				{
					...uspSearchCondition,
				},
			],
		}
		: {};

	const offset = getOffset(page, limit);

	// const timingCondition = await searchManytoManyTiming(
	// 	timing,
	// 	'usp_id',
	// 	'timing',
	// );
	const uspCondition = await searchManytoMany(
		uspId,
		'usp_id',
		'place_to_usp',
	);
	const subcategoryCondition = await searchManytoMany(
		categoryId,
		'sub_category_id',
		'place_to_subcategory',
	);
	// const daysCondition = {};
	const daysCondition = categoryId
		? day
			? await searchManytoManyDays(
				[day],
				'days',
				'place_to_subcategory',
				categoryId,
			)
			: {}
		: await searchManytoManyDaysFilters(day, 'day', 'timing');
	// const cuisineCondition = await searchManytoMany(
	// 	cuisineId,
	// 	'cuisine_id',
	// 	'place_to_cuisine',
	// );

	const happeningTitleCondition = await searchManytoManyTitle(
		search,
		'title',
		'happening',
	);
	const happeningDescriptionCondition = await searchManytoManyTitle(
		search,
		'description',
		'happening',
	);

	// const daysCondition = categoryId
	// 	? day
	// 		? await searchManytoManyDaysArrNew(
	// 				[day],
	// 				'days',
	// 				'place_to_subcategory',
	// 				categoryId,
	// 			)
	// 		: {}
	// 	: await searchManytoManyArray(day, 'day', 'timing');

	// //console.log(
	// 	{ cond1 },
	// 	{ cond2 },
	// 	{ daysCondition },
	// 	{ subcategoryCondition },
	// 	'chkking conditions',
	// );
	const ids = [...happeningDescriptionCondition, ...happeningTitleCondition];
	// const ids = !searchCondition[Op.or]?.length
	// 	? [...happeningDescriptionCondition, ...happeningTitleCondition]
	// 	: [];

	const uniqueIds = [...new Set(ids)];

	const idConditions = uniqueIds.map((id) => ({ id }));
	// WHEN "hotel" ILIKE '%${search}%' THEN 2
	// WHEN "place"."address" ILIKE '%${search}%' THEN 3
	// WHEN "place"."about" ILIKE '%${search}%' THEN 4
	// WHEN "place"."website" ILIKE '%${search}%' THEN 5

	searchCondition[Op.or] = [
		...(searchCondition[Op.or] || []),
		...idConditions,
	];

	// let whereCondition = {};
	const whereCondition = {
		[Sequelize.Op.and]: [],
	};
	whereCondition[Op.and] = [];
	if (searchCondition[Op.or] && searchCondition[Op.or].length > 0) {
		whereCondition[Op.and].push(searchCondition);
	}

	if (categoryId) {
		if (subcategoryCondition?.id) {
			whereCondition[Sequelize.Op.and].push(subcategoryCondition);
		} else {
			whereCondition[Sequelize.Op.and].push({ id: [] });
		}
	}
	if (uspId) {
		if (uspCondition?.id) {
			whereCondition[Sequelize.Op.and].push(uspCondition);
		} else {
			whereCondition[Sequelize.Op.and].push({ id: [] });
		}
	}
	if (day) {
		if (daysCondition?.id) {
			whereCondition[Sequelize.Op.and].push(daysCondition);
		} else {
			whereCondition[Sequelize.Op.and].push({ id: [] });
		}
	}
	if (areaId) {
		whereCondition.area_id = areaId;
	}
	// if (timing) {
	// 	whereCondition[Op.and] = [
	// 		...(whereCondition[Op.and] || []),
	// 		{ id: timingCondition },
	// 	];
	// }
	// let whereCondition = {};
	// if (searchCondition[Op.or] && searchCondition[Op.or].length > 0) {
	// 	whereCondition[Op.and] = [searchCondition];
	// }

	// if (categoryId) {
	// 	if (day) {
	// 		whereCondition[Op.and] = [
	// 			...(whereCondition[Op.and] || []),
	// 			{ id: daysCondition },
	// 		];
	// 	} else {
	// 		whereCondition[Op.and] = [
	// 			...(whereCondition[Op.and] || []),
	// 			{ id: subcategoryCondition },
	// 		];
	// 	}
	// } else {
	// 	if (day) {
	// 		whereCondition[Op.and] = [
	// 			...(whereCondition[Op.and] || []),
	// 			{ id: daysCondition },
	// 		];
	// 	}
	// }
	// if (cuisineId) {
	// 	whereCondition[Op.and] = [
	// 		...(whereCondition[Op.and] || []),
	// 		{ id: cuisineCondition },
	// 	];
	// }
	// if (uspId) {
	// 	whereCondition[Op.and] = [
	// 		...(whereCondition[Op.and] || []),
	// 		{ id: uspCondition },
	// 	];
	// }
	// if (timing) {
	// 	whereCondition[Op.and] = [
	// 		...(whereCondition[Op.and] || []),
	// 		{ id: timingCondition },
	// 	];
	// }
	let orderCondition;
	// if (search.includes("'")) {
	// 	orderCondition = Sequelize.literal(`
	// 		CASE
	// 		  WHEN "place"."title" ILIKE '${'search'}' THEN 1
	// 		  ELSE 6
	// 		END
	// 	  `);
	// } else {
	orderCondition = Sequelize.literal(`
		CASE
		  WHEN "place"."slug" ILIKE '${searchKeyword}' THEN 1
		  WHEN "place"."slug" ILIKE '${searchKeyword}%' THEN 2
		  WHEN "place"."slug" ILIKE '%${searchKeyword}%' THEN 3
		  ELSE 6
		END
	  `);
	// }

	const order = search
		? latitude && longitude
			? [
				[orderCondition], // Apply custom order condition first
				[Sequelize.literal('distance'), 'ASC'], // Order by distance if latitude and longitude are provided
				['id', 'DESC'], // Fallback to ordering by ID descending
			]
			: [
				[orderCondition], // Apply custom order condition
				['id', 'DESC'], // Fallback to ordering by ID descending
			]
		: latitude && longitude
			? [
				[Sequelize.literal('distance'), 'ASC'], // Order by distance if latitude and longitude are provided
				['id', 'DESC'], // Fallback to ordering by ID descending
			]
			: [['id', 'DESC']];

	const places = await db.place.findAndCountAll({
		where: {
			...checkDeletedCondition,
			...whereCondition,
			// ...searchCondition,
			// ...locationCondition,
			status: true,
			...(map &&
				latitudeDelta &&
				longitudeDelta &&
				latitudeQuery &&
				longitudeQuery
				? {
					latitude: {
						[Sequelize.Op.between]: [
							parseFloat(latitudeQuery) -
							parseFloat(latitudeDelta) / 2,
							parseFloat(latitudeQuery) +
							parseFloat(latitudeDelta) / 2,
						],
					},
					longitude: {
						[Sequelize.Op.between]: [
							parseFloat(longitudeQuery) -
							parseFloat(longitudeDelta) / 2,
							parseFloat(longitudeQuery) +
							parseFloat(longitudeDelta) / 2,
						],
					},
				}
				: {}),
		},
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

		attributes:
			longitude && latitude
				? [
					'id',
					'title',
					'address',
					// 'temp_status',
					'trending',
					'latitude',
					'longitude',
					'ratings',
					'reviews',
					'slug',
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
					'address',
					// 'temp_status',
					'trending',
					'latitude',
					'longitude',
					'ratings',
					'reviews',
					'slug',
				],

		// order:
		// similarity(title, 'search'),
		// order: [
		// 	,
		// 	latitude && longitude
		// 		? [
		// 				[orderCondition],
		// 				latitude &&
		// 					longitude && [Sequelize.literal('distance'), 'ASC'],
		// 				['id', 'DESC'],
		// 			]
		// 		: [[orderCondition], ['id', 'DESC']],
		// ],
		order,

		offset,
		limit,
		raw: true,
	});

	refactorCode(places, [
		{
			title: 'media',
			items: ['logo', 'featured', 'reel'],
		},
		{
			title: 'happening_badge',
			items: ['title'],
		},
	]);

	for (const place of places.rows) {
		const distance = getDistance(
			latitude,
			longitude,
			place.latitude,
			place.longitude,
		);
		place.distance = distance ? distance + ' km' : null;
		if (map && place.media?.logo && place.media.logo[0]) {
			place.media.mapLogo = place.media.logo[0].replace(
				/(\.[a-z]+)(\.part\d+)?$/,
				'_map$1$2',
			);
		}
		// const { rating, user_ratings_total } = await getGoogleRating(
		// 	place.latitude,
		// 	place.longitude,
		// );
		// place.rating = rating;
		// place.reviews = user_ratings_total;
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
		// const sub_categories = await db.place_to_subcategory.findAll({
		// 	where: {
		// 		place_id: place.id,
		// 	},
		// 	attributes: ['sub_category_id', 'days'],
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
					attributes: ['id', 'image', 'type', 'discount', 'title'],
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
		await getDisplayTime(place);
		// for (const deal of place.deals) {
		// 	deal.parent_deal.discount = parseFloat(deal.parent_deal.discount);

		// 	let category = '';
		// 	// if (deal?.parent_deal) {
		// 	// 	place.deal.parent_deal.discount = parseFloat(
		// 	// 		deal.parent_deal?.discount,
		// 	// 	);
		// 	// }
		// 	const sub_categories = await db.deal_to_subcategory.findAll({
		// 		where: {
		// 			deal_id: deal.id,
		// 		},
		// 		attributes: ['sub_category_id'],
		// 		raw: true,
		// 	});
		// 	const subCategoryIds = sub_categories.map(
		// 		(subCategory) => subCategory.sub_category_id,
		// 	);
		// 	const dealSub_categories = await db.sub_category.findAll({
		// 		where: { id: subCategoryIds, status: true },
		// 		attributes: ['id', 'title'],
		// 		include: [
		// 			{
		// 				model: db.category,
		// 				require: false,
		// 				attributes: ['id', 'name'],
		// 			},
		// 		],
		// 		raw: false,
		// 	});
		// 	for (const subCat of dealSub_categories) {
		// 		if (subCat?.category?.name === 'Both') {
		// 			category = 'Foods & Beverages, Lifestyle & Activities';
		// 		} else if (
		// 			!category.includes(subCat?.category?.name) &&
		// 			category !== ''
		// 		) {
		// 			category += `, ${subCat?.category?.name}`;
		// 		} else {
		// 			category = subCat?.category?.name;
		// 		}
		// 	}
		// 	deal.category = category;
		// }
	}

	places.page = page;
	places.limit = limit;
	return places;
}

export default {
	getPlaces,
	getPlaceById,
	getFilteredPlaces,
	getPlacesCount,
	getPlaceByIdWithoutCount,
	getNearByPlaces,
};
