import httpStatus from 'http-status'
const { getOffset } = require('../../../utils/query');
const ApiError = require('../../../utils/ApiError');
const config = require('../../../config/config.js');
const db = require('../../../db/models').default;
const { Op } = require('sequelize');
const Sequelize = require('sequelize');

const { imageService } = require('../../index.js');
const checkVendorById = require('../../Admin/vendor/place.service.js');
const {
	refactorCode,
	searchManytoMany,
	searchManytoManyTitle,
	nearByCondition,
	getDistance,
	getGoogleRating,
	searchManytoManyDays,
	removeItemArray,
	updatePlaceFilters,
	updatePlaceCategories,
	softDelete,
	checkDeletedCondition,
	getAssociatePlaces,
} = require('../../../utils/globals.js');

const {
	updatePlaceSubscription,
	createPlaceSubscription,
} = require('./placeSubscription.service');
const { encryptData, decryptData } = require('../../../utils/auth.js').default;
const { sendWelcomeEmailVendor } = require('../../email.service.js');
const { getSubscriptions } = require('./trending.service.js');

async function getHappeningByTitle(title) {
	return await db.happening.findOne({
		where: { title },
	});
}
async function createHappening(req) {
	const { happeningsArr } = req.body;
	if (!happeningsArr) {
		return;
	}

	return await db.happening.bulkCreate(happeningsArr);
}
async function createSingleHappening(happening, placeId, transaction) {
	return await db.happening.create(
		{
			title: happening.happeningTitle,
			description: happening.happeningDescription,
			user_id: happening.userId,
			status: true,
			place_id: placeId,
			season_id: happening.seasonId || null,
			start_date: happening.start_date || null,
			end_date: happening.end_date || null,
		},
		// { // transaction },
	);
}
async function getHappeningByIds(placeId) {
	const happenings = await db.happening.findAll({
		where: { place_id: placeId },
		attributes: ['id'],
		returning: true,
		plain: true,
		raw: true,
	});
	return happenings.map((v) => v.id);
}
async function updateHappeningById(happening, transaction) {
	await db.happening.update(
		{
			title: happening.happeningTitle,
			description: happening.happeningDescription,
			weight: happening.weight,
			// status: happening.happeningStatus,
			season_id: happening.seasonId || null,
			start_date: happening.start_date || null,
			end_date: happening.end_date || null,
		},
		{
			where: { id: happening.id },
			returning: true,
			plain: true,
			raw: true,
			// transaction,
		},
	);
}
async function updateTimingById(timing, transaction) {
	await db.timing.update(
		{ ...timing },
		{
			where: { id: timing.id },
			returning: true,
			plain: true,
			raw: true,
			// transaction,
		},
	);
}
async function createMedia(req) {
	const { logo, menu, featured, reel, placeId } = req.body;
	return await db.media
		.create({
			logo: logo,
			featured: featured,
			reel: reel,
			place_id: placeId,
		})
		.then((resultEntity) => resultEntity.get({ plain: true }));
}
async function updateMedia(req) {
	const isMedia = req?.headers ? req.headers['ismedia'] : false;
	const { logo, menu, featured, reel, placeId } = req.body;

	if (isMedia && req.body.featured) {
		req.body.featured = JSON.parse(req.body.featured);
	}

	const id = req.params?.placeId || req.body.placeId;

	return await db.media.update(
		{ ...req.body },
		{
			where: { place_id: id },
			returning: true,
			plain: true,
			raw: true,
		},
	);
}
async function reorderMedia(req) {
	// const isMedia = req?.headers ? req.headers['ismedia'] : false;
	// const { logo, menu, featured, reel, placeId } = req.body;

	if (req.body.featured) {
		req.body.featured = JSON.parse(req.body.featured);
	}

	const id = req.params?.placeId || req.body.placeId;

	return await db.media.update(
		{ ...req.body },
		{
			where: { place_id: id },
			returning: true,
			plain: true,
			raw: true,
		},
	);
}

async function createTiming(req) {
	const { timingsArr } = req.body;
	if (!timingsArr) {
		return;
	}

	return await db.timing.bulkCreate(timingsArr);
}
async function createSingleTiming(timing, placeId, transaction) {
	return await db.timing.create(
		{
			...timing,
			place_id: placeId,
		},
		// { // transaction },
	);
}
async function deleteTiming(req) {
	const timingToDelete = await db.timing.findOne({
		where: {
			place_id: req.body.placeId,
			day: req.body.day,
		},
	});
	return await timingToDelete.destroy();
}

async function getPlaceByTitle(title, id) {
	const whereCondition = id ? { title, id: { [Op.ne]: id } } : { title };
	return await db.place.findOne({
		where: {
			[Op.and]: [{ ...whereCondition }, { ...checkDeletedCondition }],
		},
	});
}
async function getPlaceByUsername(username, id) {
	const whereCondition = id
		? { username, id: { [Op.ne]: id } }
		: { username };
	return await db.place.findOne({
		where: { ...whereCondition },
	});
}
async function getPlacesTitle(req) {
	const places = await db.place.findAll({
		attributes: ['title'],
	});

	return places;
}
async function getLastPlace() {
	const place = await db.place.findOne({
		order: [['id', 'DESC']],
		attributes: ['id'],
	});

	return place;
}

async function updatePlaceByTitle(req) {
	const title = req.body.title;

	const updatedPlace = await db.place
		.update(
			{ ...req.body },
			{
				where: { title },
				returning: true,
				plain: true,
				raw: true,
			},
		)
		.then(async (data) => {
			return data[1];
		});

	return updatedPlace;
}
async function updatePlaceByByIdImport(req) {
	const id = req.body.id;
	const { categoryIds, cuisineIds, uspIds } = req.body;

	const categoryIdsArr = categoryIds && categoryIds;
	const cuisineIdsArr = cuisineIds && cuisineIds;
	const uspIdsArr = uspIds && uspIds;
	categoryIdsArr?.length >= 0
		? await db.place_to_subcategory.destroy({
			where: { place_id: id },
		})
		: null;
	cuisineIdsArr?.length >= 0
		? await db.place_to_cuisine.destroy({
			where: { place_id: id },
		})
		: null;
	uspIdsArr?.length >= 0
		? await db.place_to_usp.destroy({
			where: { place_id: id },
		})
		: null;
	await Promise.all(
		categoryIdsArr?.length
			? categoryIdsArr?.map((categoryId) => {
				return db.place_to_subcategory.create({
					placeId: id,
					subCategoryId: categoryId,
				});
			})
			: [],
		cuisineIdsArr?.length
			? cuisineIdsArr?.map((cuisineId) => {
				return db.place_to_cuisine.create({
					placeId: id,
					cuisineId,
				});
			})
			: [],
		uspIdsArr?.length
			? uspIdsArr?.map((uspId) => {
				return db.place_to_usp.create({
					placeId: id,
					uspId,
				});
			})
			: [],
	);

	return;
}
async function updateImagesBySlug(req) {
	const slug = req.params.slug;
	const place = await db.place.findOne({
		where: { title: slug },
		attributes: ['title', 'slug', 'id'],
		raw: true,
		include: [
			{
				model: db.media,
				require: true,
				attributes: ['logo', 'featured', 'reel'],
			},
		],
	});

	const placeAfterUpdate = await db.place.findOne({
		where: { slug },
		attributes: ['title', 'slug', 'id'],
		raw: true,
		include: [
			{
				model: db.media,
				require: true,
				attributes: ['logo', 'featured', 'reel'],
			},
		],
	});
	req.body.logo = req.body.logo && JSON.parse(req.body.logo);
	req.body.featured = req.body.featured ? JSON.parse(req.body.featured) : [];
	const copiedLogoUrl = await imageService.copyImageToDestination(
		`https://demo-images-d3.s3.me-central-1.amazonaws.com/${req.body.slug}/${req.body.logo[0]}`,
		`https://dubaidailydeals-dev.s3.me-central-1.amazonaws.com${place['media.logo'][0]}`,
	);

	const copiedFeaturedUrl = [];
	await Promise.all(
		req.body.featured?.map(async (v, i) => {
			copiedFeaturedUrl.push(
				await imageService.copyImageToDestination(
					`https://demo-images-d3.s3.me-central-1.amazonaws.com/${req.body.slug}/${v}`,
					`https://dubaidailydeals-dev.s3.me-central-1.amazonaws.com${place['media.featured'][i]}`,
				),
			);
		}),
	);

	return {
		place,
		newPlace: placeAfterUpdate,
		req: req.body,
		copiedLogoUrl,
		copiedFeaturedUrl,
	};
}
async function getPlacesCount() {
	const places = await db.place.count({
		where: { status: true, ...checkDeletedCondition },
	});

	return places;
}
async function getVendorsCount() {
	const places = await db.vendors.count({
		where: {
			status: true,
			...checkDeletedCondition,
		},
	});

	return places;
}
async function getPlacesCountByPackage() {
	const paidPlaces = await db.place.count({
		where: {
			vendor_id: {
				[Op.ne]: null,
			},
			status: true,
			...checkDeletedCondition,
		}, // Count places with a vendor
	});

	const freePlaces = await db.place.count({
		where: { vendor_id: null, status: true, ...checkDeletedCondition }, // Count places without a vendor
	});

	return [
		{ ['package.name']: 'Free', count: freePlaces },
		{ ['package.name']: 'Vendor', count: paidPlaces },
	];
}

async function getPlaceById(id, req) {
	const places = await db.place.findAndCountAll({
		where: { id },
		include: [
			{
				model: db.vendor_place,
				required: false,
				attributes: ['id'],
				include: [
					{
						model: db.packages,
						required: false,
						attributes: ['id', 'name', 'description', 'fee'],
					},
				],
			},
			{
				model: db.packages,
				require: true,
				attributes: ['name', 'description', 'fee', 'month', 'id'],
			},
			{
				model: db.subscription_status,
				require: true,
				attributes: ['id', 'name'],
			},
			{
				model: db.emirate,
				require: false,
				attributes: ['id', 'name'],
			},
			{
				model: db.area,
				require: true,
				attributes: ['id', 'name'],
			},
			{
				model: db.user,
				require: true,
				attributes: ['id', 'first_name', 'last_name'],
			},
			{
				model: db.media,
				require: true,
				attributes: ['id', 'logo', 'featured', 'reel'],
			},
			{
				model: db.happening_badge,
				required: false,
				attributes: ['id', 'title'],
			},
		],
		attributes: [
			'id',
			'title',
			'slug',
			'excerpt',
			'end_date',
			'about',
			'address',
			'iframe',
			'contact',
			'website',
			'hotel',
			'instagram',
			'booking_url',
			'menu',
			'location',
			'latitude',
			'longitude',
			'status',
			'trending',
			'temp_status',
			'is_commission',
			'commission',
			'is_ecommerce',
			'ecommerce_code',
			'ecommerce_affiliation',
			'place_pin',
			'created_date_time',
			'modified_date_time',
			'show_happening_badge',
		],
		raw: true,
	});

	refactorCode(places, [
		{
			title: 'vendor_places.package',
			items: ['id', 'name', 'description', 'fee'],
		},
		{
			title: 'package',
			items: ['name', 'description', 'fee', 'month', 'id'],
		},
		{
			title: 'subscription_status',
			items: ['id', 'name'],
		},
		{
			title: 'emirate',
			items: ['id', 'name'],
		},
		{
			title: 'area',
			items: ['id', 'name'],
		},
		{
			title: 'user',
			items: ['id', 'first_name', 'last_name'],
		},
		{
			title: 'media',
			items: ['id', 'logo', 'featured', 'reel'],
		},
		{
			title: 'happening_badge',
			items: ['id', 'title'],
		},
	]);

	for (const place of places?.rows) {
		place.package = place['vendor_places.package'];
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
			attributes: ['id', 'title'],
			raw: true,
		});
		place.sub_categories = place.sub_categories?.map((v) => {
			const id = sub_categories.find((id) => {
				return id.sub_category_id === v.id;
			});
			return { ...v, days: id.days };
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
			order: [['weight', 'ASC']],
			attributes: [
				'id',
				'title',
				'description',
				'user_id',
				'weight',
				'season_id',
				'start_date',
				'end_date',
				'status',
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

		place.relatedPlaces = await getAssociatePlaces(place.id);
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

		if (place?.deals.length) {
			for (const deal of place.deals) {
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
					raw: true,
				});
			}
		}
	}
	return places;
}
const duplicationError = async (getFunction, title) => {
	const data = await getFunction;

	if (data) {
		throw new ApiError(httpStatus.CONFLICT, `This ${title} already exits`);
	}
};
const notFoundError = async (getFunction, title, multiple = false) => {
	const data = await getFunction;

	if (!data) {
		throw new ApiError(httpStatus.NOT_FOUND, `${title} not found`);
	}
};

const validatePlace = async (
	id,
	title,
	username,
	categoryIdsArr,
	cuisineIdsArr,
	uspIdsArr,
	subscriptionId,
	trendingId,
	userId,
	statusId,
	happeningsArr,
	happeningStatusId,
	subscriptionStatusId,
) => {
	if (title) {
		await duplicationError(getPlaceByTitle(title, id), 'place');
	}
	if (username) {
		await duplicationError(getPlaceByUsername(username, id), 'place');
	}
};
async function createPlace(req) {
	const {
		id,
		password,
		username,
		status,
		logo,
		menu,
		featured,
		start_date,
		end_date,
		reel,
		title,
		name,
		trn,
		slug,
		excerpt,
		about,
		contact,
		website,
		instagram,
		hotel,
		bookingUrl,
		location,
		latitude,
		longitude,
		deal,
		address,
		emirateId,
		areaId,
		trendingId,
		email,
		userId,
		subscriptionId,
		subscriptionStatusId,
		dealIds,
		categoryIds,
		cuisineIds,
		uspIds,
		happenings,
		timings,
		trending,
		isCommission,
		commission,
		iframe,
		mobile,
		placePin,
		happeningBadgeId,
		isEcommerce,
		ecommerceCode,
		ecommerceAffiliation,
		gracePeriod,
		show_happening_badge,
	} = req.body;

	const categoryIdsArr = categoryIds && JSON.parse(categoryIds);
	const cuisineIdsArr = cuisineIds && JSON.parse(cuisineIds);
	const uspIdsArr = uspIds && JSON.parse(uspIds);
	const happeningsArr = happenings && JSON.parse(happenings);
	const timingsArr = timings && JSON.parse(timings);
	await validatePlace(
		undefined,
		title,
		username,
		categoryIdsArr,
		cuisineIdsArr,
		uspIdsArr,
		subscriptionId,
		trendingId,
		userId,
		happeningsArr,
		subscriptionStatusId,
	);

	const createdPlace = await db.place
		.create({
			title,
			slug,
			excerpt,
			about,
			contact,
			address,
			hotel,
			end_date,
			website,
			instagram,
			booking_url: bookingUrl,
			deal,
			show_happening_badge,
			location,
			latitude: latitude && parseFloat(JSON.parse(latitude)),
			longitude: longitude && parseFloat(JSON.parse(longitude)),
			status,
			emirate_id: emirateId,
			area_id: areaId,
			menu,
			trending: trending,
			is_commission: isCommission,
			commission,
			user_id: userId,
			iframe,
			package_id: 2,
			subscription_status_id: subscriptionStatusId,
			place_pin: placePin,
			happening_badge_id: happeningBadgeId,
			is_ecommerce: isEcommerce,
			ecommerce_code: ecommerceCode,
			ecommerce_affiliation: ecommerceAffiliation,
		})
		.then(async (resultEntity) => {
			const id = resultEntity.get({ plain: true }).id;
			//console.log(categoryIdsArr, 'categoryIdsArr');
			await Promise.all(
				categoryIdsArr?.length
					? categoryIdsArr?.map((categoryId) => {
						return db.place_to_subcategory.create({
							placeId: id,
							subCategoryId: categoryId.value,
							days: categoryId.days
								? categoryId.days
								: ['daily'],
						});
					})
					: [],
				cuisineIdsArr?.length
					? cuisineIdsArr?.map((cuisineId) => {
						return db.place_to_cuisine.create({
							placeId: id,
							cuisineId,
						});
					})
					: [],
				uspIdsArr?.length
					? uspIdsArr?.map((uspId) => {
						return db.place_to_usp.create({
							placeId: id,
							uspId,
						});
					})
					: [],

				happeningsArr?.length
					? await createHappening({
						body: {
							happeningsArr: happeningsArr?.map(
								(obj, index) => {
									return {
										title: obj.happeningTitle,
										description:
											obj.happeningDescription,
										user_id: userId,
										status: true,
										place_id: id,
										weight: index,
										season_id: obj.seasonId || null,
										start_date: obj.start_date || null,
										end_date: obj.end_date || null,
									};
								},
							),
						},
					})
					: [],
				await createMedia({
					body: {
						placeId: id,
						logo,
						featured,
						reel,
					},
				}),
				timingsArr?.length
					? await createTiming({
						body: {
							timingsArr: timingsArr.map((obj) => {
								return {
									...obj,
									place_id: id,
								};
							}),
						},
					})
					: [],
			);

			return resultEntity.get({ plain: true });
		});
	// await createPlaceSubscription(createdPlace, subscriptionId);
	// return createdPlace.reload();
	return createdPlace;
	// } catch (error) {
	// 	throw new ApiError(httpStatus.NOT_FOUND, `${error} not found`);
	// }
}
async function createPlaceByPhone(req) {
	try {
		const { phone } = req.body;
		const data = await getGoogleRating('', '', phone);
		const placeData = data?.detailsData?.result;
		if (placeData && placeData.name) {
			const title = placeData.name;
			const slug = placeData.name
				.replace(/\s+/g, '-')
				.replace(/'/g, '')
				.replace(/’/g, '')
				.replace(/&/g, 'and');
			const ratings = placeData.rating;
			const reviews = placeData.user_ratings_total;
			const website = placeData.website;
			const location = placeData.url;
			const address = placeData.vicinity;
			const latitude = placeData.location?.lat;
			const longitude = placeData.location?.lng;
			const trending = false;
			const isCommission = false;
			const userId = req.body.userId;
			const subscriptionId = 2;
			const subscriptionStatusId = 1;
			const status = false;
			const createdPlace = await db.place
				.create({
					title,
					slug,
					excerpt: 'place excerpt',
					about: 'no place about',
					ratings,
					reviews,
					contact: phone,
					address,
					website,
					location,
					latitude: latitude && parseFloat(JSON.parse(latitude)),
					longitude: longitude && parseFloat(JSON.parse(longitude)),
					status,
					trending: trending,
					is_commission: isCommission,
					user_id: userId,
					package_id: subscriptionId,
					subscription_status_id: subscriptionStatusId,
					place_pin: 1234,
				})
				.then(async (resultEntity) => {
					const id = resultEntity.get({ plain: true }).id;
					if (placeData) {
						let timingsArr = [];
						const timing =
							placeData.current_opening_hours?.weekday_text || [];
						for (const time of timing) {
							const day = time.split(': ');
							const timeArr = day[1].split(', ');
							for (const singleTime of timeArr) {
								const temp = {
									day: day[0].toLowerCase(),
									opening: convert12to24(
										singleTime.split(' – ')[0],
										true,
									),
									closing: convert12to24(
										singleTime.split(' – ')[1],
									),
								};
								if (temp && temp.opening && temp.closing)
									timingsArr.push({ ...temp });
							}
						}
						function consolidateSchedule(schedule) {
							const timeGroups = {};

							// Group days by their opening and closing times
							schedule.forEach((entry) => {
								const key = `${entry.opening}-${entry.closing}`;
								if (!timeGroups[key]) {
									timeGroups[key] = {
										days: [],
										opening: entry.opening,
										closing: entry.closing,
									};
								}
								timeGroups[key].days.push(entry.day);
							});

							const result = [];

							// Process each time group
							for (const key in timeGroups) {
								const group = timeGroups[key];
								// Check if the group contains all 7 days
								if (group.days.length === 7) {
									result.push({
										day: 'daily',
										opening: group.opening,
										closing: group.closing,
									});
								} else {
									group.days.forEach((day) => {
										result.push({
											day,
											opening: group.opening,
											closing: group.closing,
										});
									});
								}
							}

							return result;
						}
						const updatedTimingArr =
							consolidateSchedule(timingsArr);
						updatedTimingArr?.length
							? await createTiming({
								body: {
									timingsArr: updatedTimingArr.map(
										(obj) => {
											return {
												...obj,
												place_id: id,
												uploaded_from_google: true,
											};
										},
									),
								},
							})
							: null;
					}
					return resultEntity.get({ plain: true });
				});

			await createPlaceSubscription(createdPlace, subscriptionId);

			// return createdPlace.reload();
			return createdPlace;
		} else {
			throw new ApiError(httpStatus.NOT_FOUND, `No data found`);
		}
	} catch (error) {
		throw new ApiError(
			httpStatus.NOT_FOUND,
			`${error} Could not add place`,
		);
	}
}
function convert12to24(time12h, opening = false) {
	// return time12h;
	// Extracting hours, minutes, and AM/PM
	if (time12h === '12:00' && !opening) {
		return '23:59';
	} else if (time12h && !time12h.includes('AM') && !time12h.includes('PM')) {
		return time12h.replace('12:', '00:');
	} else if (time12h) {
		var time = time12h.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
		if (!time) {
			return null; // Invalid format
		}
		var hours = parseInt(time[1], 10);
		var minutes = parseInt(time[2], 10);
		var period = time[3].toUpperCase();

		// Adjusting hours for 12-hour format
		if (period === 'PM' && hours < 12) {
			hours += 12;
		} else if (period === 'AM' && hours === 12) {
			hours = 0;
		}

		// Formatting into 24-hour format
		var hours24 = ('0' + hours).slice(-2); // Add leading zero if needed
		var minutes24 = ('0' + minutes).slice(-2); // Add leading zero if needed

		return hours24 + ':' + minutes24;
	}
}
async function updatePlaceTiming(req) {
	const places = await db.place.findAll({
		attributes: ['id', 'contact'],
		raw: true,
	});
	const timingAll = await db.timing.findAll({
		attributes: ['opening', 'closing', 'place_id'],
		raw: true,
	});

	const timingIds = timingAll
		.filter((v) => !v.opening || !v.closing)
		.map((timing) => timing.place_id);
	const placesToUpdate = places.filter((place) =>
		timingIds.includes(place.id),
	);
	const placeDataArr = [];
	const updatedPlaces = [];

	for (const place of placesToUpdate.slice(
		req.body.limit - 50,
		req.body.limit,
	)) {
		const data = await getGoogleRating('', '', place.contact);
		const placeData = data?.detailsData?.result;

		if (placeData) {
			let timingsArr = [];
			const timing = placeData.current_opening_hours?.weekday_text || [];
			for (const time of timing) {
				const day = time.split(': ');
				const timeArr = day[1].split(', ');
				for (const singleTime of timeArr) {
					const temp = {
						day: day[0].toLowerCase(),
						opening: convert12to24(
							singleTime.split(' – ')[0],
							true,
						),
						closing: convert12to24(singleTime.split(' – ')[1]),
					};
					if (temp && temp.opening && temp.closing)
						timingsArr.push({ ...temp });
				}
			}
			function consolidateSchedule(schedule) {
				const timeGroups = {};

				// Group days by their opening and closing times
				schedule.forEach((entry) => {
					const key = `${entry.opening}-${entry.closing}`;
					if (!timeGroups[key]) {
						timeGroups[key] = {
							days: [],
							opening: entry.opening,
							closing: entry.closing,
						};
					}
					timeGroups[key].days.push(entry.day);
				});

				const result = [];

				// Process each time group
				for (const key in timeGroups) {
					const group = timeGroups[key];
					// Check if the group contains all 7 days
					if (group.days.length === 7) {
						result.push({
							day: 'daily',
							opening: group.opening,
							closing: group.closing,
						});
					} else {
						group.days.forEach((day) => {
							result.push({
								day,
								opening: group.opening,
								closing: group.closing,
							});
						});
					}
				}

				return result;
			}

			// placeDataArr.push(timingsArr);
			const updatedTimingArr = consolidateSchedule(timingsArr);
			const id = place.id;
			updatedTimingArr?.length ? updatedPlaces.push(place.id) : null;

			updatedTimingArr?.length
				? (await db.timing.destroy({
					where: { place_id: id },
				}),
					await createTiming({
						body: {
							timingsArr: updatedTimingArr.map((obj) => {
								return {
									...obj,
									place_id: id,
									uploaded_from_google: true,
								};
							}),
						},
					}))
				: null;
		}
	}
	return {
		placesToUpdateCount: placesToUpdate.length,
		placesToUpdate: placesToUpdate,
		places: updatedPlaces,
		count: updatedPlaces.length,
	};
}
async function createPlaceToSubCategory(req) {
	const { id, categoryId, days } = req.body;
	const place = await db.place_to_subcategory
		.update(
			{
				days: Array.isArray(JSON.parse(days))
					? JSON.parse(days)
					: ['daily'],
			},
			{
				where: { place_id: id, sub_category_id: categoryId },
				returning: true,
				plain: true,
				raw: true,
			},
		)
		.then(async (data) => {
			return data[1];
		});
}

async function sendWelcomeAndCredentialEmailVendor(req) {
	// const place = (await getPlaceById(req.params.placeId)).rows[0];
	// if (!place) {
	// 	throw new ApiError(httpStatus.NOT_FOUND, 'Place not found');
	// }
	// // if (!place.username || !place.password || place.password?.length === 0) {
	// // 	throw new ApiError(
	// // 		httpStatus.BAD_REQUEST,
	// // 		'Username or password not available, make sure you have asssigned credentials',
	// // 	);
	// // }
	// await sendWelcomeEmailVendor(
	// 	place.email,
	// 	place.title,
	// 	place.username,
	// 	// place.password,
	// );
	// return;
}

async function getFilteredPlaces(req) {
	const { categoryId, uspId, day } = req.query;

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
		: await searchManytoMany(day, 'day', 'timing');

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

	const places = await db.place.findAndCountAll({
		where: { ...filterCondition, status: true },
		attributes: ['id'],
		raw: true,
	});

	places.subCategories = [];
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
				await Promise.all(
					res
						? res?.map(async (subCategory, index) => {
							let place =
								await db.place_to_subcategory.findAll({
									where: {
										sub_category_id: subCategory.id,
									},
									attributes: ['place_id'],
									raw: true,
								});

							const usps = await db.place_to_usp.count({
								where: {
									place_id: place.map(
										(item) => item.place_id,
									),
								},
								group: ['usp_id'],
								raw: true,
							});

							res[index].places = usps.count;
							const uspsArr = await db.usp.findAll({
								where: {
									id: usps?.map((item) => item.usp_id),
								},
								attributes: ['id', 'title'],
								raw: true,
							});
							const uspsWithPlaces = uspsArr.map((usp) => ({
								...usp,
								places:
									usps?.find(
										(row) => row.usp_id === usp.id,
									)?.count || 0,
							}));
							res[index].usps = uspsWithPlaces;
						})
						: [],
					places.subCategories.push(...res),
				);
			});
	}
	const uniqueSubCategories = places.subCategories.filter(
		(subCategory, index, self) =>
			index === self.findIndex((s) => s.id === subCategory.id),
	);
	places.subCategories = uniqueSubCategories;
	delete places['rows'];
	return places;
}
async function updateRatingsAndReviews(req) {
	const data = [];
	const places = await db.place.findAll({
		attributes: ['id', 'latitude', 'longitude', 'contact'],
		raw: true,
	});

	for (const place of places.slice(req.body.limit - 50, req.body.limit)) {
		const { rating, user_ratings_total } = await getGoogleRating(
			place.latitude,
			place.longitude,
			place.contact,
		);
		const updatedPlace = await db.place
			.update(
				{ ratings: rating, reviews: user_ratings_total },
				{
					where: { id: place.id },
					returning: true,
					plain: true,
					raw: true,
				},
			)
			.then((data) => {
				data.push(data[1]);
			});
	}
	return data;
}

// async function getPlaces(req) {
// 	const { page: defaultPage, limit: defaultLimit } = config.pagination;
// 	const {
// 		page = defaultPage,
// 		limit = defaultLimit,
// 		search,
// 		status,
// 		categoryId,
// 		day,
// 		tempStatus,
// 		subscription,
// 	} = req.query;

// 	const offset = getOffset(page, limit);

// 	const searchCondition = {
// 		...(search && {
// 			[Op.or]: [
// 				...['title', 'hotel'].map((attr) => ({
// 					[attr]: { [Op.iLike]: `%${search}%` },
// 				})),
// 			],
// 		}),
// 		...(status !== undefined && {
// 			status,
// 		}),

// 		...(tempStatus !== undefined && {
// 			temp_status: tempStatus?.includes('null')
// 				? Array.isArray(tempStatus)
// 					? tempStatus?.filter((v) => v !== 'null')
// 					: null
// 				: tempStatus,
// 		}),
// 	};

// 	// const packagesCondition = {
// 	// 	...(subscription !== undefined && {
// 	// 		package_id: subscription,
// 	// 	}),
// 	// };

// 	const subcategoryCondition = await searchManytoMany(
// 		categoryId,
// 		'sub_category_id',
// 		'place_to_subcategory',
// 		['place_id', 'days'],
// 	);

// 	const daysCondition =
// 		categoryId && day
// 			? await searchManytoManyDays(
// 					[day],
// 					'days',
// 					'place_to_subcategory',
// 					categoryId,
// 				)
// 			: {};

// 	delete subcategoryCondition.days;

// 	const places = await db.place.findAndCountAll({
// 		where: {
// 			[Op.and]: [
// 				{ ...checkDeletedCondition },
// 				{ ...searchCondition },
// 				{ ...subcategoryCondition },
// 				{ ...daysCondition },
// 			],
// 		},
// 		include: [
// 			// {
// 			// 	model: db.vendor_place,
// 			// 	required:
// 			// 		subscription &&
// 			// 		subscription != 2 &&
// 			// 		subscription != 3 &&
// 			// 		subscription != 4
// 			// 			? true
// 			// 			: false,
// 			// 	attributes: ['id'],
// 			// 	where:
// 			// 		subscription &&
// 			// 		subscription != 2 &&
// 			// 		subscription != 3 &&
// 			// 		subscription != 4
// 			// 			? { package_id: subscription }
// 			// 			: {},

// 			// 	include: [
// 			// 		{
// 			// 			model: db.packages,
// 			// 			required: false,
// 			// 			attributes: ['id', 'name', 'description', 'fee'],
// 			// 		},
// 			// 	],
// 			// },
// 			{
// 				model: db.subscription_status,
// 				required: false,
// 				attributes: ['name'],
// 			},
// 			{
// 				model: db.happening_badge,
// 				required: false,
// 				attributes: ['title'],
// 			},
// 			{
// 				model: db.emirate,
// 				required: false,
// 				attributes: ['name'],
// 			},
// 			{
// 				model: db.area,
// 				required: false,
// 				attributes: ['name'],
// 			},
// 			{
// 				model: db.user,
// 				required: false,
// 				attributes: ['first_name', 'last_name'],
// 			},
// 			{
// 				model: db.media,
// 				required: false,
// 				attributes: ['logo', 'featured', 'reel'],
// 			},
// 		],

// 		attributes: [
// 			'id',
// 			'title',
// 			'about',
// 			'address',
// 			'iframe',
// 			'contact',
// 			'website',
// 			'hotel',
// 			'instagram',
// 			'booking_url',
// 			'menu',
// 			'ratings',
// 			'location',
// 			'latitude',
// 			'longitude',
// 			'reviews',
// 			'is_ecommerce',
// 			'ecommerce_code',
// 			'ecommerce_affiliation',
// 			'place_pin',
// 			'status',
// 			'trending',
// 			'temp_status',
// 			'created_date_time',
// 			'modified_date_time',
// 		],
// 		order: [['id', 'DESC']],
// 		offset,
// 		limit,
// 		raw: true,
// 	});

// 	refactorCode(places, [
// 		{
// 			title: 'vendor_places.package',
// 			items: ['id', 'name', 'description', 'fee'],
// 		},
// 		{
// 			title: 'subscription_status',
// 			items: ['name'],
// 		},
// 		{
// 			title: 'happening_badge',
// 			items: ['title'],
// 		},
// 		{
// 			title: 'emirate',
// 			items: ['name'],
// 		},
// 		{
// 			title: 'area',
// 			items: ['name'],
// 		},
// 		{
// 			title: 'user',
// 			items: ['first_name', 'last_name'],
// 		},
// 		{
// 			title: 'media',
// 			items: ['logo', 'featured', 'reel'],
// 		},
// 	]);

// 	for (const place of places.rows) {
// 		place.package = place['vendor_places.package'];
// 		// console.log(package, 'chkking package');

// 		const sub_categories = await db.place_to_subcategory.findAll({
// 			where: {
// 				place_id: place.id,
// 			},
// 			attributes: ['sub_category_id', 'days'],
// 			raw: true,
// 		});
// 		const subCategoryIds = sub_categories.map(
// 			(subCategory) => subCategory.sub_category_id,
// 		);
// 		place.sub_categories = await db.sub_category.findAll({
// 			where: { id: subCategoryIds },
// 			attributes: ['id', 'title'],
// 			raw: true,
// 		});
// 		place.sub_categories = place.sub_categories?.map((v) => {
// 			const id = sub_categories.find((id) => {
// 				return id.sub_category_id === v.id;
// 			});
// 			return { ...v, days: id.days };
// 		});
// 		const usps = await db.place_to_usp.findAll({
// 			where: { place_id: place.id },
// 			attributes: ['usp_id'],
// 			raw: true,
// 		});
// 		const uspIds = usps.map((usp) => usp.usp_id);
// 		place.usps = await db.usp.findAll({
// 			where: { id: uspIds },
// 			attributes: ['id', 'title'],
// 			raw: true,
// 		});
// 		place.timings = await db.timing.findAll({
// 			where: { place_id: place.id },
// 			attributes: ['id', 'day', 'opening', 'closing'],
// 			raw: true,
// 		});

// 		place.happening = await db.happening.findAll({
// 			where: { place_id: place.id },
// 			attributes: ['id', 'title', 'description', 'user_id', 'status'],
// 			raw: true,
// 		});
// 		const cuisines = await db.place_to_cuisine.findAll({
// 			where: { place_id: place.id },
// 			attributes: ['cuisine_id'],
// 			raw: true,
// 		});
// 		const cuisineIds = cuisines.map((cuisine) => cuisine.cuisine_id);
// 		place.cuisines = await db.cuisine.findAll({
// 			where: { id: cuisineIds },
// 			attributes: ['id', 'title'],
// 			raw: true,
// 		});
// 		const deals = await db.place_to_deal.findAll({
// 			where: { place_id: place.id },
// 			attributes: ['deal_id'],
// 			raw: true,
// 		});
// 		const dealIds = deals.map((deal) => deal.deal_id);
// 		place.deals = await db.deal.findAll({
// 			where: { id: dealIds },
// 			attributes: ['title'],
// 			raw: true,
// 		});
// 	}
// 	places.page = page;
// 	places.limit = limit;
// 	return places;
// }

async function getPlaces(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const {
		page = defaultPage,
		limit = defaultLimit,
		search,
		status,
		categoryId,
		day,
		tempStatus,
		subscription,
	} = req.query;

	const offset = getOffset(page, limit);

	const searchCondition = {
		...(search && {
			[Op.or]: [
				...['title', 'hotel'].map((attr) => ({
					[attr]: { [Op.iLike]: `%${search}%` },
				})),
			],
		}),
		...(status !== undefined && {
			status,
		}),

		...(tempStatus !== undefined && {
			temp_status: tempStatus?.includes('null')
				? Array.isArray(tempStatus)
					? tempStatus?.filter((v) => v !== 'null')
					: null
				: tempStatus,
		}),

		...(subscription !== undefined && {
			package_id: subscription,
		}),
	};
	const subcategoryCondition = await searchManytoMany(
		categoryId,
		'sub_category_id',
		'place_to_subcategory',
		['place_id', 'days'],
	);

	const daysCondition =
		categoryId && day
			? await searchManytoManyDays(
				[day],
				'days',
				'place_to_subcategory',
				categoryId,
			)
			: {};

	delete subcategoryCondition.days;

	const places = await db.place.findAndCountAll({
		where: {
			[Op.and]: [
				{ ...checkDeletedCondition },
				{ ...searchCondition },
				{ ...subcategoryCondition },
				{ ...daysCondition },
			],
		},
		include: [
			// {
			// 	model: db.vendor_place,
			// 	raw: true,
			// 	include: [
			// 		{
			// 			model: db.packages,
			// 		},
			// 	],
			// },
			// {
			// 	model: db.vendor_place,
			// 	required: false,
			// 	attributes: ['id'],
			// 	raw: true,
			// 	// where:
			// 	// 	subscription &&
			// 	// 	subscription != 2 &&
			// 	// 	subscription != 3 &&
			// 	// 	subscription != 4
			// 	// 		? { package_id: subscription }
			// 	// 		: {},

			// 	include: [
			// 		{
			// 			model: db.packages,
			// 			required: false,
			// 			attributes: ['id', 'name', 'description', 'fee'],
			// 			raw: true,
			// 		},
			// 	],
			// },
			// {
			// 	model: db.packages,
			// 	required: false,
			// 	attributes: ['id', 'name', 'description', 'fee', 'month'],
			// },
			{
				model: db.subscription_status,
				required: false,
				attributes: ['name'],
			},
			{
				model: db.happening_badge,
				required: false,
				attributes: ['title'],
			},
			{
				model: db.emirate,
				required: false,
				attributes: ['name'],
			},
			{
				model: db.area,
				required: false,
				attributes: ['name'],
			},
			{
				model: db.user,
				required: false,
				attributes: ['first_name', 'last_name'],
			},
			{
				model: db.media,
				required: false,
				attributes: ['logo', 'featured', 'reel'],
			},
		],

		attributes: [
			'id',
			'title',
			'about',
			'address',
			'iframe',
			'contact',
			'website',
			'hotel',
			'instagram',
			'booking_url',
			'menu',
			'ratings',
			'location',
			'latitude',
			'longitude',
			'reviews',
			'is_ecommerce',
			'ecommerce_code',
			'ecommerce_affiliation',
			'place_pin',
			'status',
			'trending',
			'temp_status',
			'created_date_time',
			'modified_date_time',
		],
		order: [['id', 'DESC']],
		offset,
		limit,
		raw: true,
	});

	refactorCode(places, [
		{
			title: 'vendor_places.package',
			items: ['id', 'name', 'description', 'fee', 'month'],
		},
		{
			title: 'package',
			items: ['id', 'name', 'description', 'fee', 'month'],
		},
		{
			title: 'subscription_status',
			items: ['name'],
		},
		{
			title: 'happening_badge',
			items: ['title'],
		},
		{
			title: 'emirate',
			items: ['name'],
		},
		{
			title: 'area',
			items: ['name'],
		},
		{
			title: 'user',
			items: ['first_name', 'last_name'],
		},
		{
			title: 'media',
			items: ['logo', 'featured', 'reel'],
		},
	]);

	for (const place of places.rows) {
		// place.package = place['vendor_places.package'];
		const packageId = await db.vendor_place.findOne({
			where: {
				place_id: place.id,
				status: true,
				vendor_id: { [Op.ne]: null },
			},
			attribute: ['packageId'],
		});
		place.package = await db.packages.findByPk(packageId?.package_id);
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
			attributes: ['id', 'title'],
			raw: true,
		});
		place.sub_categories = place.sub_categories?.map((v) => {
			const id = sub_categories.find((id) => {
				return id.sub_category_id === v.id;
			});
			return { ...v, days: id.days };
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
			attributes: ['id', 'title', 'description', 'user_id', 'status'],
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
			attributes: ['title'],
			raw: true,
		});
	}
	places.page = page;
	places.limit = limit;
	return places;
}

async function getPlacesNames(req) {
	const places = await db.place.findAll({
		attributes: ['id', 'title', 'vendor_id'],
		raw: true,
		order: [['title', 'ASC']],
	});
	return places;
}
async function deletePlaceById(req) {
	const id = req.params.placeId || req.body.id;
	await softDelete(req, 'place', id);
	// const deletedPlaceplace_to_subcategory =
	// 	await db.place_to_subcategory.destroy({
	// 		where: { place_id: req.params.placeId || req.body.id },
	// 	});
	// const deletedPlaceplace_to_cuisine = await db.place_to_cuisine.destroy({
	// 	where: { place_id: req.params.placeId || req.body.id },
	// });
	// const deletedPlaceplace_to_usp = await db.place_to_usp.destroy({
	// 	where: { place_id: req.params.placeId || req.body.id },
	// });
	// const deletedPlacetiming = await db.timing.destroy({
	// 	where: { place_id: req.params.placeId || req.body.id },
	// });
	// const deletedPlacehappening = await db.happening.destroy({
	// 	where: { place_id: req.params.placeId || req.body.id },
	// });
	// const deletedPlacemedia = await db.media.destroy({
	// 	where: { place_id: req.params.placeId || req.body.id },
	// });

	return true;
}

async function getTimingsbyPlaceId(placeId) {
	const timingIds = await db.timing.findAll({
		where: { place_id: placeId },
		raw: true,
		attributes: ['id'],
	});
	return timingIds.map((v) => v.id);
}
async function getHappeningsbyPlaceId(placeId) {
	const happeningIds = await db.happening.findAll({
		where: { place_id: placeId },
		raw: true,
	});
	return happeningIds?.map((v) => v.id);
}
async function getCatIdsbyPlaceId(placeId) {
	const catIds = await db.place_to_subcategory.findAll({
		where: { place_id: placeId },
		raw: true,
	});
	return catIds?.map((v) => v.subCategoryId);
}
async function getUspIdsbyPlaceId(placeId) {
	const uspIds = await db.place_to_usp.findAll({
		where: { place_id: placeId },
		raw: true,
	});
	return uspIds?.map((v) => v.uspId);
}
async function getCuisineIdsbyPlaceId(placeId) {
	const cuisineIds = await db.place_to_cuisine.findAll({
		where: { place_id: placeId },
		raw: true,
	});
	return cuisineIds?.map((v) => v.cuisineId);
}
async function createPlaceToCategory(catId, placeId, transaction) {
	await db.place_to_subcategory.create(
		{
			placeId,
			subCategoryId: catId.value,
			days: catId.days ? catId.days : ['daily'],
		},
		// { // transaction },
	);
}
async function createPlaceToCategoryImport(req) {
	const { placeId, catId } = req.body;
	//console.log(catId, 'catId chkk');

	const categoryIdsArr = catId;
	//console.log(categoryIdsArr, placeId, 'catId chkk');

	categoryIdsArr?.length
		? categoryIdsArr?.map((categoryId) => {
			return db.place_to_subcategory.create({
				placeId,
				subCategoryId: categoryId.value,
				days: categoryId.days ? categoryId.days : ['daily'],
			});
		})
		: [];
}
async function updatePlaceToCategory(catId, placeId, transaction) {
	//console.log(catId, placeId);
	await db.place_to_subcategory.update(
		{
			days: catId.days ? catId.days : ['daily'],
		},
		{
			where: { place_id: placeId, sub_category_id: catId.value },
			returning: true,
			plain: true,
			raw: true,
		},
		// { // transaction },
	);
}
async function createPlaceToCuisine(cuisineId, placeId, transaction) {
	return db.place_to_cuisine.create(
		{
			placeId,
			cuisineId,
		},
		// { // transaction },
	);
}
async function createPlaceToUsp(uspId, placeId, transaction) {
	return db.place_to_usp.create(
		{
			placeId,
			uspId,
		},
		// { // transaction },
	);
}
async function deletePlaceToCategory(placeId, catId, transaction) {
	if (catId) {
		await db.place_to_subcategory.destroy({
			where: {
				place_id: placeId,
				sub_category_id: catId,
			},
			// // transaction,
		});
	} else {
		await db.place_to_subcategory.destroy({
			where: { place_id: placeId },
			// // transaction,
		});
	}
}
async function deletePlaceToCuisine(placeId, cusId, transaction) {
	if (cusId) {
		await db.place_to_cuisine.destroy({
			where: {
				place_id: placeId,
				cuisine_id: cusId,
			},
			// // transaction,
		});
	} else {
		await db.place_to_cuisine.destroy({
			where: { place_id: placeId },
			// // transaction,
		});
	}
}
async function deletePlaceToUsp(placeId, uspId, transaction) {
	if (uspId) {
		await db.place_to_usp.destroy({
			where: {
				place_id: placeId,
				usp_id: uspId,
			},
			// // transaction,
		});
	} else {
		await db.place_to_usp.destroy({
			where: { place_id: placeId },
			// // transaction,
		});
	}
}

async function updatePlace(req) {
	const {
		password,
		username,
		id,
		logo,
		menu,
		featured,
		start_date,
		reel,
		title,
		slug,
		excerpt,
		about,
		contact,
		website,
		instagram,
		bookingUrl,
		location,
		latitude,
		longitude,
		deal,
		statusId,
		emirateId,
		areaId,
		trendingId,
		email,
		userId,
		subscriptionId,
		subscriptionStatusId,
		categoryIds,
		cuisineIds,
		uspIds,
		dealIds,
		happenings,
		timings,
		isCommission,
		placePin,
		gracePeriod,
		happeningBadgeId,
		isEcommerce,
		ecommerceCode,
		ecommerceAffiliation,
		temp_status,
		relatedPlaceIds,
	} = req.body;
	// const transaction = await db.sequelize.transaction();
	// try {
	if (!id && !req.params.placeId) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'id is required');
	}
	const categoryIdsArr = categoryIds && JSON.parse(categoryIds);
	const cuisineIdsArr = cuisineIds && JSON.parse(cuisineIds);
	const uspIdsArr = uspIds && JSON.parse(uspIds);
	const dealIdsArr = dealIds && JSON.parse(dealIds);
	const happeningsArr = happenings && JSON.parse(happenings);
	const timingsArr = timings && JSON.parse(timings);
	const relatedPlaceIdArr = relatedPlaceIds && JSON.parse(relatedPlaceIds);
	//console.log(timingsArr, 'timingsArr');

	await validatePlace(
		req.params.placeId || req.body.id,
		title,
		username,
		categoryIdsArr,
		cuisineIdsArr,
		uspIdsArr,
		subscriptionId,
		trendingId,
		userId,
		statusId,
		happeningsArr,
		subscriptionStatusId,
	);
	let hashedPassword = null;
	if (password) {
		if (subscriptionId && subscriptionId !== 2) {
			hashedPassword = password;
		} else {
			const vendor = await checkVendorById(
				req.params.placeId || req.body.id,
			);
			if (vendor) {
				hashedPassword = password;
			}
		}
		delete req.body.password;
	}
	req.body.booking_url = bookingUrl;
	req.body.is_commission = isCommission;
	req.body.area_id = areaId;
	req.body.subscription_status_id = subscriptionStatusId;
	req.body.user_id = userId;
	req.body.emirate_id = emirateId;
	req.body.grace_period = gracePeriod && parseFloat(gracePeriod);
	req.body.latitude = latitude && parseFloat(latitude);
	req.body.longitude = longitude && parseFloat(longitude);
	req.body.package_id = subscriptionId;
	req.body.place_pin = placePin;
	if (hashedPassword) {
		req.body.password = hashedPassword;
	}
	if (temp_status == 'null') {
		req.body.temp_status = null;
	}
	if (happeningBadgeId == 'null') {
		req.body.happening_badge_id = null;
	} else {
		req.body.happening_badge_id = happeningBadgeId;
	}
	req.body.is_ecommerce = isEcommerce;
	req.body.ecommerce_code = ecommerceCode;
	req.body.ecommerce_affiliation = ecommerceAffiliation;
	req.body.modified_date_time = new Date();

	const updatedPlace = await db.place
		.update(
			{ ...req.body },
			{
				where: { id: req.params.placeId || req.body.id },
				returning: true,
				plain: true,
				raw: true,
				// // transaction,
			},
		)

		.then(async (data) => {
			const id = req.params.placeId || req.body.id;

			if (timingsArr?.length >= 0) {
				if (timingsArr.length === 0) {
					await db.timing.destroy({
						where: { place_id: id },
						// // transaction,
					});
				} else {
					const timingIds = await getTimingsbyPlaceId(id);
					for (const timing of timingsArr) {
						if (timingIds.includes(timing.id)) {
							await updateTimingById(timing.id);
							const index = timingIds.indexOf(timing.id);
							if (index > -1) {
								timingIds.splice(index, 1);
							}
						} else {
							await createSingleTiming(
								timing,
								id,
								// transaction,
							);
						}
					}
					if (timingIds.length > 0) {
						for (const timingToDelete of timingIds) {
							await db.timing.destroy({
								where: { id: timingToDelete },
								// transaction,
							});
						}
					}
				}
			}
			if (happeningsArr?.length >= 0) {
				if (happeningsArr.length === 0) {
					await db.happening.destroy({
						where: { place_id: id },
						// transaction,
					});
				} else {
					const happeningIds = await getHappeningsbyPlaceId(id);

					for (const happening in happeningsArr) {
						if (
							happeningIds.includes(happeningsArr[happening].id)
						) {
							await updateHappeningById(
								{
									...happeningsArr[happening],
									weight: happening,
								},

								// transaction,
							);
							const index = happeningIds.indexOf(
								happeningsArr[happening].id,
							);
							if (index > -1) {
								happeningIds.splice(index, 1);
							}
						} else {
							await createSingleHappening(
								{
									...happeningsArr[happening],
									userId,
									weight: happening,
								},
								id,
								// transaction,
							);
						}
					}
					if (happeningIds.length > 0) {
						for (const happeningToDelete of happeningIds) {
							await db.happening.destroy({
								where: { id: happeningToDelete },
								// transaction,
							});
						}
					}
				}
			}

			if (categoryIdsArr?.length >= 0) {
				const catIds = await getCatIdsbyPlaceId(id);
				await updatePlaceCategories(
					categoryIdsArr,
					catIds,
					id,
					deletePlaceToCategory,
					createPlaceToCategory,
					updatePlaceToCategory,
					// transaction,
				);
			}
			if (cuisineIdsArr?.length >= 0) {
				const cusIds = await getCuisineIdsbyPlaceId(id);
				await updatePlaceFilters(
					cuisineIdsArr,
					cusIds,
					id,
					deletePlaceToCuisine,
					createPlaceToCuisine,
					// transaction,
				);
			}
			if (uspIdsArr?.length >= 0) {
				const uspIds = await getUspIdsbyPlaceId(id);
				await updatePlaceFilters(
					uspIdsArr,
					uspIds,
					id,
					deletePlaceToUsp,
					createPlaceToUsp,
					// transaction,
				);
			}
			if (logo || menu || featured || reel) {
				await updateMedia({
					body: {
						placeId: id,
						logo,
						menu,
						featured,
						reel,
					},
				});
			}
			if (relatedPlaceIdArr?.length >= 0) {
				const relatedPlaceId = await getAssociateByPlaceId(id);
				//console.log(relatedPlaceId, 'relatedPlaceId chkkk');

				await updatePlaceFilters(
					relatedPlaceIdArr,
					relatedPlaceId,
					id,
					deleteAssociateByPlaceId,
					associatePlace,
					// transaction,
				);
			}
			return data[1];
		});
	// if (subscriptionId) {
	// 	await updatePlaceSubscription(updatedPlace, subscriptionId);
	// }
	return updatedPlace;
	// } catch (error) {
	// 	// await // transaction.rollback();
	// 	throw new ApiError(
	// 		httpStatus['INTERNAL_SERVER_ERROR'],
	// 		'Something went wrong' + error,
	// 	);
	// }
}

async function getAssociateByPlaceId(id) {
	const relatedPlaces = await db.place_to_place.findAll({
		where: {
			[Op.or]: [{ placeId: id }, { relatedPlaceId: id }],
		},
		raw: true,
	});
	return relatedPlaces.map((place) =>
		place.relatedPlaceId != id ? id : place.placeId,
	);
}
async function deleteAssociateByPlaceId(id, relatedPlaceId) {
	if (relatedPlaceId) {
		const relatedPlaces = await db.place_to_place.destroy({
			where: {
				[Op.or]: [
					{ placeId: id, relatedPlaceId },
					{ relatedPlaceId: id, placeId: relatedPlaceId },
				],
			},
		});
	} else {
		const relatedPlaces = await db.place_to_place.destroy({
			where: {
				[Op.or]: [{ placeId: id }, { relatedPlaceId: id }],
			},
		});
	}
	return true;
}

async function associatePlace(placeId, relatedPlaceId) {
	const placeA = await getPlaceById(placeId);
	const placeB = await getPlaceById(relatedPlaceId);

	if (!placeA || !placeB) {
		throw new ApiError(httpStatus.NOT_FOUND, `Place(s) not found`);
	}
	const association = await db.place_to_place.findOne({
		where: {
			[Op.or]: [
				{ placeId, relatedPlaceId },
				{ placeId: relatedPlaceId, relatedPlaceId: placeId },
			],
		},
	});

	if (!association) {
		await db.place_to_place.create({
			placeId,
			relatedPlaceId,
		});
	}
}
//
async function getTimings() {
	const timings = await db.timing.findAll({
		raw: true,
		group: ['id', 'place_id'],
	});
	const groupedTimings = timings.reduce((acc, timing) => {
		const { placeId, ...rest } = timing;
		if (!acc[placeId]) {
			acc[placeId] = { placeId, timings: [] };
		}
		acc[placeId].timings.push(rest);
		return acc;
	}, {});
	const result = Object.values(groupedTimings);
	return result;
}

async function getPlaceLogos(req) {
	const { page = 1, limit = 100 } = req.query;
	const offset = getOffset(page, limit);
	const places = await db.place.findAll({
		limit,
		offset,
		attributes: ['id'],
		include: [
			{
				model: db.media,
				attributes: ['logo'],
			},
		],
		raw: true,
	});
	return places?.map(
		(v) => (v['media.logo'] && v['media.logo'][0]) || undefined,
	);
}

export default {
	getPlaces,
	getTimings,
	createPlace,
	getPlacesNames,
	deletePlaceById,
	updatePlace,
	getPlaceById,
	getLastPlace,
	getFilteredPlaces,
	deleteTiming,
	updateImagesBySlug,
	updateMedia,
	reorderMedia,
	updatePlaceByTitle,
	getPlacesTitle,
	getPlaces,
	createPlaceToSubCategory,
	updatePlaceByByIdImport,
	updateRatingsAndReviews,
	updatePlaceTiming,
	createPlaceByPhone,
	createPlaceToCategoryImport,
	getPlacesCount,
	getVendorsCount,
	sendWelcomeAndCredentialEmailVendor,
	associatePlace,
	getPlacesCountByPackage,
	getPlaceLogos,
};
