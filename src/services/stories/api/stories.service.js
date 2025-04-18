const { getOffset } = require('../../../utils/query.js');
const config = require('../../../config/config.js');
const db = require('../../../db/models/index.js').default;
const { Op } = require('sequelize');

async function getStories(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;

	const offset = getOffset(page, limit);

	const stories = await db.stories.findAndCountAll({
		order: [['id', 'DESC']],
		where: {
			start_date: { [Op.lte]: new Date().toISOString() },
			end_date: { [Op.gte]: new Date().toISOString() },
			status: true,
		},
		include: [
			{
				model: db.place,
				require: true,
				attributes: ['id', 'title'],
			},
			{
				model: db.monthly_deal,
				require: true,
				attributes: ['id', 'title'],
			},
		],
		attributes: [
			'id',
			'title',
			'link_type',
			'link',
			'logo',
			'videos',
			'featured',
		],
		offset,
		limit,
	});

	return stories;
}

export default {
	getStories,
};
