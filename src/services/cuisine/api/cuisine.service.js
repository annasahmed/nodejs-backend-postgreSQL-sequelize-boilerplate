const httpStatus = require('http-status');
const { getOffset } = require('../../../utils/query');
const ApiError = require('../../../utils/ApiError');
const { encryptData } = require('../../../utils/auth');
const config = require('../../../config/config.js');
const db = require('../../../db/models').default;
const userService = require('../../user.service');
const { refactorCode, checkDeletedCondition } = require('../../../utils/globals.js');

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
		where: { status: true, ...checkDeletedCondition },
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
	return cuisines;
}

module.exports = {
	getCuisines,
	getCuisineById,
};
