const httpStatus = require('http-status');
const { getOffset } = require('../../../utils/query.js');
const ApiError = require('../../../utils/ApiError.js');
const { encryptData } = require('../../../utils/auth.js');
const config = require('../../../config/config.js');
const db = require('../../../db/models/index.js').default;
const userService = require('../../user.service.js');
const adminCategoryService = require('../../category/admin/category.service.js');
const { refactorCode, checkDeletedCondition } = require('../../../utils/globals.js');

async function getSubCategoryById(id) {
	const subCategory = await db.sub_category.findOne({
		where: { id },
		include: [
			{
				model: db.category,
				require: true,
				attributes: ['id', 'name'],
			},
			{
				model: db.user,
				require: true,
				attributes: ['id', 'first_name', 'last_name'],
			},
		],
		attributes: [
			'id',
			'title',
			'image',
			'status',
			'created_date_time',
			'modified_date_time',
		],
	});
	refactorCode(subCategory, [
		{
			title: 'user',
			items: ['id', 'first_name', 'last_name'],
		},
		{
			title: 'category',
			items: ['id', 'name'],
		},
	]);
	await Promise.all(
		subCategory?.map(async (subCategory, index) => {
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

			subCategory[index].usps = uspsArr;
		}),
	);
	return subCategory;
}

async function getSubCategories(req, cms) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;

	const offset = getOffset(page, limit);

	const subCategories = await db.sub_category.findAndCountAll({
		order: [
			cms ? ['title', 'ASC'] : ['id', 'ASC'],
			['weight', 'ASC'],
			['created_date_time', 'DESC'],
			['modified_date_time', 'DESC'],
		],
		where: {
			status: true,
			...checkDeletedCondition,
		},
		include: [
			// {
			// 	model: db.status,
			// 	require: true,
			// 	attributes: ['id', 'name'],
			// },
			{
				model: db.category,
				require: true,
				attributes: ['id', 'name'],
			},
			{
				model: db.user,
				require: true,
				attributes: ['id', 'first_name', 'last_name'],
			},
		],
		attributes: [
			'id',
			'title',
			'image',
			'status',
			'created_date_time',
			'modified_date_time',
		],
		offset,
		limit,
		raw: true,
	});
	refactorCode(subCategories, [
		{
			title: 'user',
			items: ['id', 'first_name', 'last_name'],
		},
		{
			title: 'category',
			items: ['id', 'name'],
		},
	]);
	await Promise.all(
		subCategories.rows?.map(async (subCategory, index) => {
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

			subCategories.rows[index].usps = uspsArr;
		}),
	);

	return subCategories;
}

module.exports = {
	getSubCategories,
	getSubCategoryById,
};
