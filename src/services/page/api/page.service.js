import httpStatus from 'http-status'
const { getOffset } = require('../../../utils/query.js');
const ApiError = require('../../../utils/ApiError.js');
const { encryptData } = require('../../../utils/auth.js').default;
const config = require('../../../config/config.js');
const db = require('../../../db/models/index.js').default;
const userService = require('../../user.service.js');
const { refactorCode } = require('../../../utils/globals.js');

async function getPageById(id) {
	const page = await db.page.findOne({
		where: { id, status: true },

		attributes: [
			'id',
			'title',
			'status',
			'details'
		],
	});

	return page;
}

async function getPages(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;

	const offset = getOffset(page, limit);

	const pages = await db.page.findAndCountAll({
		order: [
			['title', 'ASC']
		],
		where: { status: true },

		attributes: [
			'id',
			'title',
			'details'
		],
		offset,
		limit,
		raw: true,
	});
	return pages;
}

export default {
	getPages,
	getPageById,
};
