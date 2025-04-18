import httpStatus from 'http-status'
const { getOffset } = require('../../../utils/query.js');
const ApiError = require('../../../utils/ApiError.js');
const config = require('../../../config/config.js');
const db = require('../../../db/models/index.js').default;

async function getCategoryById(categoryId) {
	//console.log(categoryId, 'categoryId');
	const category = await db.category.findOne({
		where: { id: categoryId },
	});

	return category;
}
async function createCategory(req) {
	const { name, description } = req.body;
	const createdCategory = await db.category
		.create({
			name,
			description,
		})
		.then((resultEntity) => resultEntity.get({ plain: true }));

	return createdCategory;
}

async function getCategories(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;

	const offset = getOffset(page, limit);

	const categories = await db.category.findAndCountAll({
		order: [
			['name', 'ASC'],
			['created_date_time', 'DESC'],
			['modified_date_time', 'DESC'],
		],
		attributes: [
			'id',
			'name',
			'description',
			'created_date_time',
			'modified_date_time',
		],
		offset,
		limit,
		raw: true,
	});
	// comment

	for (const category of categories.rows) {
		category.sub_categories = await db.sub_category.findAll({
			where: { category_id: [category.id, 3] },
			order: [['id', 'ASC']],
			attributes: ['id', 'title', 'image', 'timing', 'created_date_time'],
			raw: true,
		});
		await Promise.all(
			category.sub_categories
				? category.sub_categories?.map(async (subCategory, index) => {
					let place = await db.place_to_subcategory.findAll({
						where: { sub_category_id: subCategory.id },
						attributes: ['place_id'],
						raw: true,
					});

					const usps = await db.place_to_usp.findAll({
						where: {
							place_id: place.map((item) => item.place_id),
						},
						attributes: ['usp_id'],
						raw: true,
					});

					const uspsArr = await db.usp.findAll({
						where: { id: usps?.map((item) => item.usp_id) },
						attributes: ['id', 'title'],
						raw: true,
					});

					category.sub_categories[index].usps = uspsArr;
				})
				: [],
		);
	}

	return categories;
}

export default {
	createCategory,
	getCategories,
	getCategoryById,
};
