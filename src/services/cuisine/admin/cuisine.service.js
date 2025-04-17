const httpStatus = require('http-status');
const { getOffset } = require('../../../utils/query');
const ApiError = require('../../../utils/ApiError');
const { encryptData } = require('../../../utils/auth');
const config = require('../../../config/config.js');
const db = require('../../../db/models').default;
const userService = require('../../user.service');
const {
	refactorCode,
	checkDeletedCondition,
	softDelete,
} = require('../../../utils/globals.js');

async function getCuisineByTitle(title) {
	const cuisine = await db.cuisine.findOne({
		where: { title },
	});

	return cuisine;
}
async function getCuisineById(id) {
	const cuisine = await db.cuisine.findOne({
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
	refactorCode(cuisine, [
		{
			title: 'user',
			items: ['id', 'first_name', 'last_name'],
		},
	]);
	return cuisine;
}
async function createCuisine(req) {
	const { title, userId, status } = req.body;
	const cuisine = await getCuisineByTitle(title);

	if (cuisine) {
		throw new ApiError(httpStatus.CONFLICT, 'This cuisine already exits');
	}

	const user = await userService.getUserById(userId);

	if (!user) {
		throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
	}

	const createdCuisine = await db.cuisine
		.create({
			title,
			user_id: userId,
			// status_id: statusId,
			status,
		})
		.then((resultEntity) => resultEntity.get({ plain: true }));

	return createdCuisine;
}

async function getCuisines(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;

	const offset = getOffset(page, limit);

	const cuisines = await db.cuisine.findAndCountAll({
		order: [
			['title', 'ASC'],
			['created_date_time', 'DESC'],
			['modified_date_time', 'DESC'],
		],
		where: {
			...checkDeletedCondition,
		},
		include: [
			// {
			// 	model: db.status,
			// 	require: true,
			// 	attributes: ['id', 'name'],
			// },
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
	refactorCode(cuisines, [
		// {
		// 	title: 'status',
		// 	items: ['id', 'name'],
		// },
		{
			title: 'user',
			items: ['id', 'first_name', 'last_name'],
		},
	]);

	return cuisines;
}

async function deleteCuisineById(req) {
	const id = req.params.cuisineId || req.body.id;
	await softDelete(req, 'cuisine', id);
	return true;
}

async function updateCuisine(req) {
	const { title, statusId, userId } = req.body;
	if (title) {
		const cuisine = await getCuisineByTitle(title);

		if (cuisine) {
			throw new ApiError(
				httpStatus.CONFLICT,
				'This cuisine already exits',
			);
		}
	}
	if (userId) {
		const user = await userService.getUserById(userId);

		if (!user) {
			throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
		}
	}

	const updatedCuisine = await db.cuisine
		.update(
			{ ...req.body },
			{
				where: { id: req.params.cuisineId || req.body.id },
				returning: true,
				plain: true,
				raw: true,
			},
		)
		.then((data) => data[1]);

	return updatedCuisine;
}

module.exports = {
	getCuisines,
	createCuisine,
	deleteCuisineById,
	updateCuisine,
	getCuisineById,
};
