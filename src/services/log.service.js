const { getOffset } = require('../utils/query.js');
const config = require('../config/config.js');
const db = require('../db/models/index.js').default;

async function getLogs(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;

	const offset = getOffset(page, limit);

	const logs = await db.log.findAndCountAll({
		order: [
			['id', 'DESC'],
			['created_date_time', 'DESC'],
		],
		include: [
			{
				model: db.user,
				require: true,
				attributes: ['id', 'first_name'],
			},
		],
		offset,
		limit,
	});

	return logs;
}

export default {
	getLogs,
};
