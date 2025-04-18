import httpStatus from 'http-status'
const { getOffset } = require('../../../utils/query.js');
const ApiError = require('../../../utils/ApiError.js');
const { encryptData } = require('../../../utils/auth.js').default;
const config = require('../../../config/config.js');
const db = require('../../../db/models/index.js').default;
const userService = require('../../user.service.js');
const adminCategoryService = require('../../category/admin/category.service.js');
const {
	refactorCode,
	reorderFunction,
	checkDeletedCondition,
	softDelete,
} = require('../../../utils/globals.js');

async function getSubCategoryByTitle(title) {
	const category = await db.sub_category.findOne({
		where: { title },
	});

	return category;
}
async function getSubCategoryById(id) {
	const subCategory = await db.sub_category.findOne({
		where: { id },

		attributes: ['id'],
	});
	return subCategory;
}
async function createSubCategory(req) {
	const {
		title,
		image,
		statusId,
		userId,
		categoryId,
		status,
		timing,
		color,
		is_website,
	} = req.body;
	const subCategory = await getSubCategoryByTitle(title);

	if (subCategory) {
		throw new ApiError(
			httpStatus.CONFLICT,
			'This sub category already exits',
		);
	}

	const user = await userService.getUserById(userId);

	if (!user) {
		throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
	}
	const category = await adminCategoryService.getCategoryById(categoryId);

	if (!category) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
	}
	const createdSubCategory = await db.sub_category
		.create({
			title,
			image,
			user_id: userId,
			category_id: categoryId,
			status,
			timing,
			color,
			is_website,
			// status_id: statusId,
		})
		.then((resultEntity) => resultEntity.get({ plain: true }));

	return createdSubCategory;
}
async function reorder(req) {
	await reorderFunction(req.body.order, 'sub_category');
}

async function getSubCategories(req, cms) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;

	const offset = getOffset(page, limit);

	const subCategories = await db.sub_category.findAndCountAll({
		order: [
			cms ? ['title', 'ASC'] : ['weight', 'ASC'],
			['created_date_time', 'DESC'],
			['modified_date_time', 'DESC'],
		],
		where: { ...checkDeletedCondition },
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
			'weight',
			'color',
			'timing',
			'image',
			'status',
			'is_website',
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

	return subCategories;
}
async function getSubCategoriesWebsite(req, cms) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;

	const offset = getOffset(page, limit);

	const subCategories = await db.sub_category.findAndCountAll({
		order: [
			cms ? ['title', 'ASC'] : ['weight', 'ASC'],
			['created_date_time', 'DESC'],
			['modified_date_time', 'DESC'],
		],
		where: {
			...checkDeletedCondition,
			is_website: true,
		},
		include: [
			// {
			// 	model: db.status,
			// 	require: true,
			// 	attributes: ['id', 'name'],
			// },
			{
				model: db.place,
				require: true,
				through: {
					model: db.place_to_subcategory_website,
				},
				// attributes: ['id', 'name'],
			},
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
			'weight',
			'color',
			'timing',
			'image',
			'status',
			'is_website',
			'created_date_time',
			'modified_date_time',
		],
		offset,
		limit,
		// raw: true,
	});
	// refactorCode(subCategories, [
	// 	{
	// 		title: 'user',
	// 		items: ['id', 'first_name', 'last_name'],
	// 	},
	// 	{
	// 		title: 'category',
	// 		items: ['id', 'name'],
	// 	},
	// ]);

	return subCategories;
}
async function attachSubCategoriesToPlaceWebsite(req, cms) {
	const { id } = req.params;
	const { placeIds } = req.body;
	console.log({ id, placeIds });

	const placeIdsArr = placeIds && JSON.parse(placeIds);
	// await Promise.all(
	// 	placeIdsArr?.length
	// 		? placeIdsArr?.map(async (placeId) => {
	// 				console.log({ chk }, 'chhking chkk');
	// 				return chk;
	// 			})
	// 		: [],
	// );
	const chk = await db.place_to_subcategory_website.destroy({
		// placeId: placeId,
		where: {
			subCategoryId: id,
		},
	});
	const places = await Promise.all(
		placeIdsArr?.length
			? placeIdsArr?.map(async (placeId) => {
				const chk = await db.place_to_subcategory_website.create({
					placeId: placeId,
					subCategoryId: id,
				});
				console.log({ chk }, 'chhking chkk');
				return chk;
			})
			: [],
	);
	// const createdSubCategory = await db.placeToSubcategoryWebsite
	// 	.create({
	// 		// status_id: statusId,
	// 	})
	// 	.then((resultEntity) => resultEntity.get({ plain: true }));

	return places;
}

async function deleteSubCategoryById(req) {
	const id = req.params.categoryId || req.body.id;
	await softDelete(req, 'sub_category', id);
	return true;
}

async function updateSubCategory(req) {
	const { title, image, statusId, userId, categoryId } = req.body;
	// if (title) {
	// 	const category = await getSubCategoryByTitle(title);

	// 	if (category) {
	// 		throw new ApiError(
	// 			httpStatus.CONFLICT,
	// 			'This sub category already exits',
	// 		);
	// 	}
	// }
	if (userId) {
		const user = await userService.getUserById(userId);

		if (!user) {
			throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
		}
	}
	if (categoryId) {
		const category = await adminCategoryService.getCategoryById(categoryId);

		if (!category) {
			throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
		}
	}

	const updatedCategory = await db.sub_category
		.update(
			{ ...req.body },
			{
				where: { id: req.params.categoryId || req.body.id },
				returning: true,
				plain: true,
				raw: true,
			},
		)
		.then((data) => data[1]);

	return updatedCategory;
}

export default {
	getSubCategories,
	getSubCategoriesWebsite,
	attachSubCategoriesToPlaceWebsite,
	createSubCategory,
	deleteSubCategoryById,
	updateSubCategory,
	getSubCategoryById,
	reorder,
};
