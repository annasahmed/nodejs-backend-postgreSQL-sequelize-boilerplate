const httpStatus = require('http-status');
const { getOffset } = require('../../../utils/query.js');
const ApiError = require('../../../utils/ApiError.js');
const { encryptData, verifyToken } = require('../../../utils/auth.js');
const config = require('../../../config/config.js');
const db = require('../../../db/models/index.js').default;
const userService = require('../../user.service');
const {
	refactorCode,
	checkDeletedCondition,
	softDelete,
} = require('../../../utils/globals.js');
const { Op } = require('sequelize');

async function getUspByTitle(title) {
	const usp = await db.usp.findOne({
		where: { title },
	});

	return usp;
}
async function getUspById(id) {
	const usp = await db.usp.findOne({
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
	});
	// for (const usp of usps.rows) {
	const sub_categories = await db.usp_to_subcategory.findAll({
		where: {
			usp_id: usp.id,
		},
		attributes: ['sub_category_id'],
		raw: true,
	});
	const subCategoryIds = sub_categories.map(
		(subCategory) => subCategory.sub_category_id,
	);
	usp.sub_categories = await db.sub_category.findAll({
		where: { id: subCategoryIds },
		attributes: ['id', 'title'],
		raw: false,
	});
	// }1234
	refactorCode(usp, [
		{
			title: 'user',
			items: ['id', 'first_name', 'last_name'],
		},
	]);

	return usp;
}
async function createUsp(req) {
	const { title, statusId, userId, status, categoryIds } = req.body;
	const usp = await getUspByTitle(title);

	if (usp) {
		throw new ApiError(httpStatus.CONFLICT, 'This usp already exits');
	}

	const user = await userService.getUserById(userId);
	// 1234

	if (!user) {
		throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
	}
	const categoryIdsArr = categoryIds && JSON.parse(categoryIds);
	const createdUsp = await db.usp
		.create({
			title,
			user_id: userId,
			status,
			// status_id: statusId,
		})
		.then(async (resultEntity) => {
			const id = resultEntity.get({ plain: true }).id;
			await Promise.all(
				categoryIdsArr?.length
					? categoryIdsArr?.map((categoryId) => {
							return db.usp_to_subcategory.create({
								uspId: id,
								subCategoryId: categoryId,
							});
						})
					: [],
			);

			return resultEntity.get({ plain: true });
		});

	return createdUsp;
}

async function getUsps(req, cms) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;

	const offset = getOffset(page, limit);

	const usps = await db.usp.findAndCountAll({
		order: [
			cms ? ['title', 'ASC'] : ['id', 'ASC'],
			['created_date_time', 'DESC'],
			['modified_date_time', 'DESC'],
		],
		where: {
			...checkDeletedCondition,
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
	for (const usp of usps.rows) {
		const sub_categories = await db.usp_to_subcategory.findAll({
			where: {
				usp_id: usp.id,
			},
			attributes: ['sub_category_id'],
			raw: true,
		});
		const subCategoryIds = sub_categories.map(
			(subCategory) => subCategory.sub_category_id,
		);
		usp.sub_categories = await db.sub_category.findAll({
			where: { id: subCategoryIds },
			attributes: ['id', 'title'],
			raw: false,
		});
	}
	refactorCode(usps, [
		{
			title: 'user',
			items: ['id', 'first_name', 'last_name'],
		},
	]);

	return usps;
}

async function deleteUspById(req) {
	const id = req.params.uspId || req.body.id;
	await softDelete(req, 'usp', id);
	return true;
}

async function updateUsp(req) {
	const { title, statusId, userId, categoryIds } = req.body;
	if (title) {
		const usp = await getUspByTitle(title);

		if (usp) {
			throw new ApiError(httpStatus.CONFLICT, 'This usp already exits');
		}
	}
	if (userId) {
		const user = await userService.getUserById(userId);

		if (!user) {
			throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
		}
	}
	const categoryIdsArr = categoryIds && JSON.parse(categoryIds);

	const updatedUsp = await db.usp
		.update(
			{ ...req.body },
			{
				where: { id: req.params.uspId || req.body.id },
				returning: true,
				plain: true,
				raw: true,
			},
		)
		.then(async (data) => {
			const id = req.params.uspId || req.body.id;
			const deleteCatId = categoryIdsArr?.length
				? await db.usp_to_subcategory.destroy({
						where: { usp_id: id },
					})
				: null;
			await Promise.all(
				categoryIdsArr?.length
					? categoryIdsArr?.map((categoryId) => {
							return db.usp_to_subcategory.create({
								uspId: id,
								subCategoryId: categoryId,
							});
						})
					: [],
			);
			return data[1];
		});

	return updatedUsp;
}

module.exports = {
	getUsps,
	createUsp,
	deleteUspById,
	updateUsp,
	getUspById,
};
