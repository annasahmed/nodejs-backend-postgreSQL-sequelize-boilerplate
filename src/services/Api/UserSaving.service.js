import httpStatus from 'http-status'
const ApiError = require("../../utils/ApiError");
const db = require('../../db/models').default;

async function getUserSaving(req) {
	const userId = req.auth.userId;

	// Check if the user exists
	if (!userId) {
		throw new ApiError(httpStatus.UNAUTHORIZED, 'User not logged in');
	}

	return await db.deal_redemption.findOne({
		where: { user_id: userId },
		attributes: [
			[db.sequelize.fn('sum', db.sequelize.col('discount_amount')), 'total_savings'],
			[db.sequelize.fn('sum', db.sequelize.col('total')), 'total_spent'],
		],
		raw: true,
	});

}

async function getRecentRedemptions(req) {
	const userId = req.auth.userId;

	const limit = req.query.limit ?? 10;
	const page = req.query.page ?? 1;
	const offset = (page - 1) * limit;
	// Check if the user exists
	if (!userId) {
		throw new ApiError(httpStatus.UNAUTHORIZED, 'User not logged in');
	}

	const { count, rows } = await db.deal_redemption.findAndCountAll({
		where: { user_id: userId },
		order: [['id', 'DESC']],
		include: [
			{
				model: db.place,
				attributes: ['title', 'id'],
			},
		],
		limit,
		offset,
	});
	return {
		total: count,
		page: parseInt(page),
		data: rows,
		limit: limit,
	};
}

export default {
	getUserSaving,
	getRecentRedemptions
};
