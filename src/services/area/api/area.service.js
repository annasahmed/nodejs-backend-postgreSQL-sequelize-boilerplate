import httpStatus from 'http-status'
const { getOffset } = require('../../../utils/query.js');
const ApiError = require('../../../utils/ApiError.js');
const { encryptData } = require('../../../utils/auth.js').default;
const config = require('../../../config/config.js');
const db = require('../../../db/models/index.js').default;
const userService = require('../../user.service.js');
const { adminEmirateService } = require('../../index.js');
const { refactorCode } = require('../../../utils/globals.js');

async function getAreaById(id) {
	const area = await db.area.findOne({
		where: { id },
		raw: true,
	});

	return area;
}

async function getAreas(req) {
	const areas = await db.area.findAll({
		order: [
			['name', 'ASC'],
			['created_date_time', 'DESC'],
			['modified_date_time', 'DESC'],
		],
		attributes: ['id', 'name'],
	});
	return areas;
}

export default {
	getAreas,
	getAreaById,
};
