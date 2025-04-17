const config = require('../../config/config');
const db = require('../../db/models').default;
const {
	checkDeletedCondition,
	getDisplayTime,
} = require('../../utils/globals');
const { getOffset } = require('../../utils/query');

const getPlaces = async (req) => {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;

	const offset = getOffset(page, limit);

	const subCategories = await db.sub_category.findAndCountAll({
		// order: [
		// 	['weight', 'ASC'],
		// 	['created_date_time', 'DESC'],
		// 	['modified_date_time', 'DESC'],
		// ],
		order: [
			// cms ? ['title', 'ASC'] : ['id', 'ASC'],
			['weight', 'ASC'],
			// ['created_date_time', 'DESC'],
			// ['modified_date_time', 'DESC'],
		],
		where: {
			...checkDeletedCondition,
			is_website: true,
			status: true,
		},
		include: [
			{
				model: db.place,
				require: true,
				where: {
					...checkDeletedCondition,
					status: true,
				},
				through: {
					model: db.place_to_subcategory_website,
				},
				include: [
					{
						model: db.media,
						attributes: ['logo'],
					},
				],
				attributes: ['id', 'title', 'address', 'about'],
			},
		],
		attributes: ['id', 'title', 'color', 'image', 'weight'],
		offset,
		limit,
	});

	return subCategories;
};

const getPlacesByCategory = async (req) => {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;
	const categoryId = req.params.id;

	const offset = getOffset(page, limit);

	const places = await db.place.findAndCountAll({
		where: {
			...checkDeletedCondition,
			status: true,
		},
		include: [
			{
				model: db.sub_category,
				required: true,
				through: {
					model: db.place_to_subcategory_website,
					where: {
						subCategoryId: categoryId,
					},
				},
				attributes: [],
			},
			{
				model: db.media,
				attributes: ['logo', 'featured'],
			},
			{
				model: db.deal,
				// attributes: ['logo', 'featured'],
				through: {
					model: db.place_to_deal,
				},
				include: [
					{
						model: db.parent_deal,
					},
				],
			},
		],
		attributes: ['id', 'title', 'address', 'about', 'hotel'],
		offset,
		limit,
	});

	const arr = [];

	for (let row of places.rows) {
		const place = row.get({ plain: true });
		await getDisplayTime(place);
		arr.push(place);
	}
	places.rows = [...arr];
	return places;
};

const getPlacesBanner = async () => {
	const banner = await db.home.findOne({
		where: {
			type: 'slider',
			status: true,
		},
		attributes: ['id', 'title', 'image', 'link'],
		raw: true,
	});

	return banner;
};

module.exports = {
	getPlaces,
	getPlacesByCategory,
	getPlacesBanner,
};
