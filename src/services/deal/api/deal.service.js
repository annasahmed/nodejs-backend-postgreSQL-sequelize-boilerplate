const { getOffset } = require('../../../utils/query.js');
const config = require('../../../config/config.js');
const db = require('../../../db/models/index.js').default;
const { apiPlaceService } = require('../../index.js');

// async function getDeals(req, locationCondition) {
// 	const { page: defaultPage, limit: defaultLimit } = config.pagination;
// 	const { page = defaultPage, limit = defaultLimit } = req.query;
// 	const latitude = parseFloat(req.headers['latitude']);
// 	const longitude = parseFloat(req.headers['longitude']);

// 	const offset = getOffset(page, limit);

// 	const deals = await db.deal.findAndCountAll({
// 		where: {
// 			status: true,
// 		},
// 		order: [['id', 'DESC']],
// 		include: [
// 			{
// 				model: db.parent_deal,
// 				require: true,
// 				attributes: ['id', 'image', 'type', 'discount'],
// 			},
// 		],
// 		attributes: [
// 			'id',
// 			'title',
// 			'status',
// 			'created_date_time',
// 			'modified_date_time',
// 		],
// 		offset,
// 		limit,
// 		raw: true,
// 	});
// 	refactorCode(deals, [
// 		{
// 			title: 'parent_deal',
// 			items: ['id', 'image', 'type', 'discount'],
// 		},
// 	]);
// 	for (const deal of deals.rows) {
// 		deal.parent_deal.discount = parseFloat(deal.parent_deal?.discount);
// 		const sub_categories = await db.deal_to_subcategory.findAll({
// 			where: {
// 				deal_id: deal.id,
// 			},
// 			attributes: ['sub_category_id'],
// 			raw: true,
// 		});
// 		const subCategoryIds = sub_categories.map(
// 			(subCategory) => subCategory.sub_category_id,
// 		);
// 		deal.sub_categories = await db.sub_category.findAll({
// 			where: { id: subCategoryIds, status: true },
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
// 				category = 'Foods & Beverages, Lifestyle & Activities';
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
// 		const places = await db.place_to_deal.findAll({
// 			where: {
// 				deal_id: deal.id,
// 			},
// 			attributes: ['place_id'],
// 			raw: true,
// 		});
// 		const placeIds = places.map((place) => place.place_id);
// 		const nearByCondition = locationCondition || {};
// 		deal.places = await db.place.findAll({
// 			where: { id: placeIds, ...nearByCondition, status: true },
// 			attributes: [
// 				'id',
// 				'title',
// 				'slug',
// 				'hotel',
// 				'excerpt',
// 				'address',
// 				'about',
// 				'contact',
// 				'email',
// 				'website',
// 				'status',
// 				'instagram',
// 				'booking_url',
// 				'location',
// 				'latitude',
// 				'longitude',
// 				// 'deal',
// 				'menu',
// 				'ratings',
// 				'reviews',
// 			],
// 			include: [
// 				{
// 					model: db.happening_badge,
// 					required: false,
// 					attributes: ['title'],
// 				},
// 			],

// 			raw: true,
// 		});
// 		refactorCode(deal.places, [
// 			{
// 				title: 'happening_badge',
// 				items: ['title'],
// 			},
// 		]);
// 		for (const place of deal.places) {
// 			const distance = getDistance(
// 				latitude,
// 				longitude,
// 				place.latitude,
// 				place.longitude,
// 			);
// 			place.distance = distance ? distance + ' km' : null;
// 			place.media = await db.media.findOne({
// 				where: {
// 					place_id: place.id,
// 				},
// 				attributes: ['logo', 'featured', 'reel'],
// 				raw: true,
// 			});
// 			const sub_categories = await db.place_to_subcategory.findAll({
// 				where: {
// 					place_id: place.id,
// 				},
// 				attributes: ['sub_category_id'],
// 				raw: true,
// 			});
// 			const subCategoryIds = sub_categories.map(
// 				(subCategory) => subCategory.sub_category_id,
// 			);
// 			place.sub_categories = await db.sub_category.findAll({
// 				where: { id: subCategoryIds, status: true },
// 				attributes: ['id', 'title'],
// 				raw: true,
// 			});
// 			const cuisines = await db.place_to_cuisine.findAll({
// 				where: { place_id: place.id },
// 				attributes: ['cuisine_id'],
// 				raw: true,
// 			});
// 			const cuisineIds = cuisines.map((cuisine) => cuisine.cuisine_id);
// 			place.cuisines = await db.cuisine.findAll({
// 				where: { id: cuisineIds, status: true },
// 				attributes: ['id', 'title'],
// 				raw: true,
// 			});

// 			const usps = await db.place_to_usp.findAll({
// 				where: { place_id: place.id },
// 				attributes: ['usp_id'],
// 				raw: true,
// 			});
// 			const uspIds = usps.map((usp) => usp.usp_id);
// 			place.usps = await db.usp.findAll({
// 				where: { id: uspIds, status: true },
// 				attributes: ['id', 'title'],
// 				raw: true,
// 			});
// 			place.timings = await db.timing.findAll({
// 				where: { place_id: place.id },
// 				attributes: ['id', 'day', 'opening', 'closing'],
// 				raw: true,
// 			});
// 			place.happening = await db.happening.findAll({
// 				where: { place_id: place.id, status: true },
// 				attributes: ['id', 'title', 'description'],
// 				raw: true,
// 			});
// 		}
// 	}
// 	// let tempArr = [];12341234123412341234
// 	let tempArr = [];
// 	deals?.rows.map((deal, index) => {
// 		const places =
// 			deal.places.length > 0 &&
// 			deal.places?.map((place) => {
// 				const obj = {
// 					...place,
// 					deal: {
// 						...deal,
// 					},
// 				};
// 				delete obj.deal.places;
// 				return obj;
// 			});
// 		if (places) {
// 			// return places;
// 			tempArr.push(...places);
// 			// tempArr = [...places];
// 		}
// 	});
// 	const formattedResponse = [...tempArr];
// 	return formattedResponse;
// }
async function getDeals(req, locationCondition) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;
	// const latitude = parseFloat(req.headers['latitude']);
	// const longitude = parseFloat(req.headers['longitude']);

	const offset = getOffset(page, limit);

	const placesWithDeals = await db.place_to_deal.findAll({
		attributes: [
			'place_id',
			[db.Sequelize.fn('MAX', db.Sequelize.col('deal_id')), 'deal_id'],
		],
		group: ['place_id'],
		offset,
		limit,
		raw: true,
	});

	const placesArr = [];
	for (const place of placesWithDeals) {
		const plaecObj = await apiPlaceService.getPlaceByIdWithoutCount(
			place.place_id,
			req,
			[
				'id',
				'title',
				'address',
				'trending',
				'latitude',
				'longitude',
				'ratings',
				'reviews',
			],
			[
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
		);
		placesArr.push(plaecObj);
	}
	let finalArr;
	try {
		finalArr = placesArr.sort(
			(a, b) =>
				a.distance?.replace(' km', '') - b.distance?.replace('km', ''),
		); // sort by distance
	} catch (error) {
		finalArr = placesArr;
	}

	return finalArr;
}

export default {
	getDeals,
};
