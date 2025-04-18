import config from '../../../config/config.js';
import db from '../../../db/models/index.js';
import { getOffset } from '../../../utils/query.js';

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
