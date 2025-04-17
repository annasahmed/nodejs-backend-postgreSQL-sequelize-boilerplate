const httpStatus = require('http-status');
const { getOffset } = require('../../../utils/query');
const ApiError = require('../../../utils/ApiError');
const { encryptData } = require('../../../utils/auth');
const config = require('../../../config/config.js');
const db = require('../../../db/models').default;
const userService = require('../../user.service');
const { refactorCode, checkDeletedCondition } = require('../../../utils/globals.js');
const { Op } = require('sequelize');

async function getEmirateById(id) {
	const emirate = await db.emirate.findOne({
		where: { id },
		raw: true,
	});

	return emirate;
}

async function getEmirates(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit, name, label } = req.query;
	const searchCondition = { ...checkDeletedCondition };
	if (name) {
		searchCondition.name = { [Op.iLike]: `%${name}%` };
	}
	if (label) {
		searchCondition.label = { [Op.iLike]: `%${label}%` };
	}
	const offset = getOffset(page, limit);

	const emirates = await db.emirate.findAndCountAll({
		where: searchCondition,
		order: [
			['name', 'ASC'],
			['created_date_time', 'DESC'],
			['modified_date_time', 'DESC'],
		],
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
			'name',
			'label',
			'country',
			'status',
			'created_date_time',
			'modified_date_time',
		],
		offset,
		limit,
		raw: true,
	});
	for (const emirate of emirates.rows) {
		await Promise.all(
			(emirate.areas = await db.area.findAll({
				where: { emirate_id: emirate.id },
				attributes: ['id', 'name'],
				raw: true,
			})),
			(emirate.neighbourhoods = await db.neighbourhood.findAll({
				where: { emirate_id: emirate.id },
				attributes: ['id', 'name'],
				raw: true,
			})),
		);
	}
	refactorCode(emirates, [
		// {
		// 	title: 'status',
		// 	items: ['id', 'name'],
		// },
		{
			title: 'user',
			items: ['id', 'first_name', 'last_name'],
		},
	]);

	return emirates;
}

module.exports = {
	getEmirates,
	getEmirateById,
};
