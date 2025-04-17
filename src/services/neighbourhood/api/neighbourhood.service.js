const httpStatus = require('http-status');
const { getOffset } = require('../../../utils/query');
const ApiError = require('../../../utils/ApiError');
const { encryptData } = require('../../../utils/auth');
const config = require('../../../config/config.js');
const db = require('../../../db/models');
const {
	userService,
	adminEmirateService,
	adminAreaService,
} = require('./index.js');
const { refactorCode } = require('../globals.js');
const { checkDeletedCondition } = require('../../../utils/globals.js');

async function getNeighbourhoods(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;

	const offset = getOffset(page, limit);

	const neighbourhoods = await db.neighbourhood.findAndCountAll({
		order: [
			['name', 'ASC'],
			['created_date_time', 'DESC'],
			['modified_date_time', 'DESC'],
		],
		where: { status: true, ...checkDeletedCondition },
		include: [
			{
				model: db.emirate,
				require: true,
				attributes: ['id', 'name'],
			},
			{
				model: db.area,
				require: true,
				attributes: ['id', 'name'],
			},
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
			'status',
			'created_date_time',
			'modified_date_time',
		],
		offset,
		limit,
		raw: true,
	});
	refactorCode(neighbourhoods, [
		// {
		// 	title: 'status',
		// 	items: ['id', 'name'],
		// },
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
	]);
	return neighbourhoods;
}

module.exports = {
	getNeighbourhoods,
};
