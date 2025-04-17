const httpStatus = require('http-status');
const { getOffset } = require('../../../utils/query.js');
const ApiError = require('../../../utils/ApiError.js');
const { encryptData } = require('../../../utils/auth.js');
const config = require('../../../config/config.js');
const db = require('../../../db/models/index.js').default;
const userService = require('../../user.service.js');
const { refactorCode } = require('../../../utils/globals.js');

async function getInfos(req) {
	const infosArr = await db.info.findAll({
		order: [
			['title', 'ASC']
		],

		attributes: [
			'title',
			'link'
		],
		raw: true,
	});

	const infos = infosArr?.reduce((acc, curr) => {
		acc[curr.title] = curr.link;
		return acc;
	}, {});
	return infos;
}



module.exports = {
	getInfos,
};
